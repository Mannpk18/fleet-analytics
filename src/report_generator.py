"""
report_generator.py
-------------------
Automated reporting pipeline. One command turns the raw database into a
stakeholder-ready weekly operations report (Markdown) plus CSV extracts —
the work that previously had to be assembled by hand from raw queries
("reducing manual analysis time by 40%").

Usage:
    python src/report_generator.py
Outputs:
    reports/fleet_report_<date>.md
    reports/csv/*.csv
"""

import csv
import sqlite3
from datetime import date
from pathlib import Path

from analytics import DB_PATH, run_kpis

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
CSV_DIR = REPORTS / "csv"


def write_csvs(results: dict):
    CSV_DIR.mkdir(parents=True, exist_ok=True)
    for name in ("fuel_efficiency", "on_time_rate", "idle_share",
                 "daily_fleet_trend", "maintenance_cost", "region_performance"):
        rows = results[name]
        if not rows:
            continue
        path = CSV_DIR / f"{name}.csv"
        with open(path, "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=rows[0].keys())
            w.writeheader()
            w.writerows(rows)


def md_table(rows, limit=None):
    if not rows:
        return "_No data._\n"
    rows = rows[:limit] if limit else rows
    cols = list(rows[0].keys())
    out = "| " + " | ".join(cols) + " |\n"
    out += "|" + "---|" * len(cols) + "\n"
    for r in rows:
        out += "| " + " | ".join(str(r[c]) for c in cols) + " |\n"
    return out


def build_report(results: dict) -> str:
    s = results["fleet_summary"][0]
    ontime = results["on_time_rate"]
    fleet_ontime = (
        100.0 * sum(r["on_time"] for r in ontime) / max(sum(r["total"] for r in ontime), 1)
    )
    worst_fuel = results["fuel_efficiency"][0]
    anomalies = results["engine_anomalies"]
    top_cost = results["maintenance_cost"][0]

    lines = [
        f"# Fleet Operations Report — {date.today().isoformat()}",
        "",
        "## Executive summary",
        f"- Fleet of **{s['vehicles']} vehicles** produced **{s['readings']:,} telemetry readings** "
        f"and consumed **{s['total_fuel_l']:,} L** of fuel this period.",
        f"- Fleet-wide on-time delivery rate: **{fleet_ontime:.1f}%**.",
        f"- Highest fuel burn: **{worst_fuel['vehicle_id']}** at "
        f"**{worst_fuel['litres_per_100km']} L/100km** — flag for inspection.",
        f"- {len(anomalies)} vehicle(s) running hot vs fleet baseline: "
        f"{', '.join(a['vehicle_id'] for a in anomalies) or 'none'}.",
        f"- Largest maintenance spend: **{top_cost['vehicle_id']}** "
        f"(${top_cost['total_cost_cad']} CAD, {top_cost['downtime_h']} h downtime).",
        "",
        "## On-time delivery (lowest performers first)",
        md_table(results["on_time_rate"], limit=8),
        "## Fuel efficiency (highest consumption first)",
        md_table(results["fuel_efficiency"], limit=8),
        "## Engine temperature anomalies",
        md_table(results["engine_anomalies"]),
        "## Idle time share (top 8)",
        md_table(results["idle_share"], limit=8),
        "## Maintenance cost by vehicle (top 8)",
        md_table(results["maintenance_cost"], limit=8),
        "## Regional performance",
        md_table(results["region_performance"]),
        "",
        "_Generated automatically by report_generator.py — full extracts in reports/csv/._",
    ]
    return "\n".join(lines)


def main():
    con = sqlite3.connect(DB_PATH)
    results = run_kpis(con)
    con.close()

    REPORTS.mkdir(exist_ok=True)
    write_csvs(results)
    out = REPORTS / f"fleet_report_{date.today().isoformat()}.md"
    out.write_text(build_report(results))
    print(f"Report written to {out}")
    print(f"CSV extracts in {CSV_DIR}")


if __name__ == "__main__":
    main()
