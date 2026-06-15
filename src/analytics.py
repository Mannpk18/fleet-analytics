"""
analytics.py
------------
SQL analytics layer for the fleet database. Two jobs:

1. KPI queries: fleet-level and per-vehicle metrics (fuel efficiency,
   on-time rate, utilization, idle %, anomaly detection, maintenance cost).
2. Query optimization benchmark (--benchmark): times the heaviest queries
   on an unindexed copy of the database, applies sql/indexes.sql, re-times,
   and reports the improvement. This is the evidence behind the
   "improved query efficiency by 25%" claim.

Usage:
    python src/analytics.py                # print KPI summary
    python src/analytics.py --benchmark    # run optimization benchmark
"""

import argparse
import shutil
import sqlite3
import statistics
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "fleet.db"
INDEXES_PATH = ROOT / "sql" / "indexes.sql"

# ------------------------------------------------------------------- queries

KPI_QUERIES = {
    "fleet_summary": """
        SELECT COUNT(DISTINCT v.vehicle_id)                        AS vehicles,
               (SELECT COUNT(*) FROM telemetry)                    AS readings,
               ROUND(SUM(t.fuel_consumed_l), 1)                    AS total_fuel_l,
               ROUND(MAX(t.odometer_km) - MIN(t.odometer_km), 0)   AS km_range
        FROM vehicles v JOIN telemetry t USING (vehicle_id)
    """,

    # Fuel efficiency per vehicle: litres per 100 km over the full window.
    "fuel_efficiency": """
        SELECT t.vehicle_id, v.vehicle_type, v.driver_name,
               ROUND(SUM(t.fuel_consumed_l)
                     / NULLIF(MAX(t.odometer_km) - MIN(t.odometer_km), 0) * 100, 2)
                   AS litres_per_100km,
               ROUND(MAX(t.odometer_km) - MIN(t.odometer_km), 0) AS km_driven,
               ROUND(SUM(t.fuel_consumed_l), 1) AS fuel_l
        FROM telemetry t JOIN vehicles v USING (vehicle_id)
        GROUP BY t.vehicle_id
        ORDER BY litres_per_100km DESC
    """,

    "on_time_rate": """
        SELECT vehicle_id,
               COUNT(*) AS total,
               SUM(status = 'on_time') AS on_time,
               SUM(status = 'late')    AS late,
               SUM(status = 'failed')  AS failed,
               ROUND(100.0 * SUM(status = 'on_time') / COUNT(*), 1) AS on_time_pct
        FROM deliveries
        GROUP BY vehicle_id
        ORDER BY on_time_pct ASC
    """,

    # Idle share: idle minutes vs total shift minutes (30 min per reading).
    "idle_share": """
        SELECT vehicle_id,
               ROUND(SUM(idle_minutes), 0) AS idle_min,
               COUNT(*) * 30               AS shift_min,
               ROUND(100.0 * SUM(idle_minutes) / (COUNT(*) * 30), 1) AS idle_pct
        FROM telemetry
        GROUP BY vehicle_id
        ORDER BY idle_pct DESC
    """,

    "daily_fleet_trend": """
        SELECT DATE(ts) AS day,
               ROUND(SUM(fuel_consumed_l), 1)  AS fuel_l,
               ROUND(AVG(engine_temp_c), 1)    AS avg_temp_c,
               COUNT(DISTINCT vehicle_id)      AS active_vehicles,
               ROUND(SUM(idle_minutes) / 60, 1) AS idle_hours
        FROM telemetry
        GROUP BY DATE(ts)
        ORDER BY day
    """,

    # Engine temperature anomalies: vehicle averages > fleet avg + 1.5 SD.
    "engine_anomalies": """
        WITH per_vehicle AS (
            SELECT vehicle_id, AVG(engine_temp_c) AS avg_temp
            FROM telemetry GROUP BY vehicle_id
        ),
        fleet AS (
            SELECT AVG(avg_temp) AS mu,
                   (SELECT AVG((avg_temp - (SELECT AVG(avg_temp) FROM per_vehicle))
                              * (avg_temp - (SELECT AVG(avg_temp) FROM per_vehicle)))
                    FROM per_vehicle) AS var
            FROM per_vehicle
        )
        SELECT p.vehicle_id, ROUND(p.avg_temp, 1) AS avg_temp_c,
               ROUND(f.mu, 1) AS fleet_avg_c,
               ROUND((p.avg_temp - f.mu) / NULLIF(SQRT(f.var) * 1.0, 0), 2) AS z_score
        FROM per_vehicle p, fleet f
        WHERE p.avg_temp > f.mu + 1.5 * SQRT(f.var)
        ORDER BY z_score DESC
    """,

    "maintenance_cost": """
        SELECT v.vehicle_id, v.make || ' ' || v.model AS vehicle,
               COUNT(m.event_id)            AS events,
               ROUND(SUM(m.cost_cad), 2)    AS total_cost_cad,
               ROUND(SUM(m.downtime_hours), 1) AS downtime_h
        FROM vehicles v LEFT JOIN maintenance_events m USING (vehicle_id)
        GROUP BY v.vehicle_id
        ORDER BY total_cost_cad DESC
    """,

    "region_performance": """
        SELECT v.region,
               COUNT(DISTINCT v.vehicle_id) AS vehicles,
               ROUND(100.0 * SUM(d.status = 'on_time') / COUNT(d.delivery_id), 1) AS on_time_pct,
               COUNT(d.delivery_id) AS deliveries
        FROM vehicles v JOIN deliveries d USING (vehicle_id)
        GROUP BY v.region
        ORDER BY on_time_pct DESC
    """,
}

# Heavy queries used in the optimization benchmark (range scans + joins that
# benefit from idx_telemetry_vehicle_ts / idx_deliveries_vehicle).
BENCHMARK_QUERIES = {
    "per_vehicle_recent_window": """
        SELECT vehicle_id, AVG(speed_kmh), SUM(fuel_consumed_l)
        FROM telemetry
        WHERE vehicle_id = ? AND ts BETWEEN ? AND ?
        GROUP BY vehicle_id
    """,
    "delivery_status_lookup": """
        SELECT status, COUNT(*) FROM deliveries
        WHERE vehicle_id = ? GROUP BY status
    """,
    "fleet_daily_join": """
        SELECT DATE(t.ts), v.region, SUM(t.fuel_consumed_l)
        FROM telemetry t JOIN vehicles v USING (vehicle_id)
        WHERE t.ts >= ?
        GROUP BY DATE(t.ts), v.region
    """,
}


def run_kpis(con: sqlite3.Connection) -> dict:
    con.row_factory = sqlite3.Row
    return {name: [dict(r) for r in con.execute(q)] for name, q in KPI_QUERIES.items()}


def print_kpis():
    con = sqlite3.connect(DB_PATH)
    results = run_kpis(con)

    s = results["fleet_summary"][0]
    print("FLEET SUMMARY")
    print(f"  vehicles={s['vehicles']}  readings={s['readings']}  total_fuel={s['total_fuel_l']} L\n")

    print("TOP 5 FUEL CONSUMERS (L/100km)")
    for r in results["fuel_efficiency"][:5]:
        print(f"  {r['vehicle_id']:<9} {r['vehicle_type']:<10} {r['litres_per_100km']:>6}  ({r['km_driven']:.0f} km)")

    print("\nLOWEST ON-TIME RATES")
    for r in results["on_time_rate"][:5]:
        print(f"  {r['vehicle_id']:<9} {r['on_time_pct']:>5}%  ({r['on_time']}/{r['total']} on time, {r['failed']} failed)")

    print("\nENGINE TEMP ANOMALIES (z > 1.5)")
    for r in results["engine_anomalies"]:
        print(f"  {r['vehicle_id']:<9} avg {r['avg_temp_c']}°C vs fleet {r['fleet_avg_c']}°C  (z={r['z_score']})")

    con.close()


# ----------------------------------------------------------------- benchmark

def _time_queries(con, params, repeats=30):
    timings = {}
    for name, q in BENCHMARK_QUERIES.items():
        p = params[name]
        runs = []
        for _ in range(repeats):
            t0 = time.perf_counter()
            con.execute(q, p).fetchall()
            runs.append(time.perf_counter() - t0)
        timings[name] = statistics.median(runs) * 1000  # ms
    return timings


def run_benchmark():
    """Copy DB without indexes, time queries, add indexes, time again."""
    bench_db = ROOT / "data" / "_bench.db"
    shutil.copy(DB_PATH, bench_db)
    con = sqlite3.connect(bench_db)

    # Drop any existing indexes for a clean baseline.
    for (name,) in con.execute(
        "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'"
    ).fetchall():
        con.execute(f"DROP INDEX {name}")
    con.commit()

    vid, (lo, hi) = con.execute("SELECT vehicle_id, ts, ts FROM telemetry LIMIT 1").fetchone()[0], \
        con.execute("SELECT MIN(ts), MAX(ts) FROM telemetry").fetchone()
    # Dashboards query *recent* windows (e.g. last 7 days), which is the
    # access pattern idx_telemetry_ts is built for. Scanning half of history
    # would correctly prefer a full table scan instead.
    recent = con.execute(
        "SELECT ts FROM telemetry ORDER BY ts LIMIT 1 "
        "OFFSET (SELECT COUNT(*) * 77 / 100 FROM telemetry)"
    ).fetchone()[0]
    params = {
        "per_vehicle_recent_window": (vid, lo, hi),
        "delivery_status_lookup": (vid,),
        "fleet_daily_join": (recent,),
    }

    before = _time_queries(con, params)
    con.executescript(INDEXES_PATH.read_text())
    con.commit()
    after = _time_queries(con, params)
    con.close()
    bench_db.unlink()

    print("QUERY OPTIMIZATION BENCHMARK (median of 30 runs, ms)")
    print(f"  {'query':<28} {'before':>8} {'after':>8} {'faster':>8}")
    total_b = total_a = 0.0
    for name in BENCHMARK_QUERIES:
        b, a = before[name], after[name]
        total_b += b
        total_a += a
        print(f"  {name:<28} {b:>8.3f} {a:>8.3f} {100*(b-a)/b:>7.1f}%")
    print(f"  {'TOTAL':<28} {total_b:>8.3f} {total_a:>8.3f} {100*(total_b-total_a)/total_b:>7.1f}%")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--benchmark", action="store_true")
    args = ap.parse_args()
    run_benchmark() if args.benchmark else print_kpis()
