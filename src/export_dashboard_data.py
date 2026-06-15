"""
export_dashboard_data.py
------------------------
Bridges the Python/SQL backend and the React dashboard: runs the KPI queries
and writes a single JSON payload the frontend consumes.

Usage:
    python src/export_dashboard_data.py
Output:
    dashboard/fleet_data.json
"""

import json
import sqlite3
from datetime import date
from pathlib import Path

from analytics import DB_PATH, run_kpis

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dashboard" / "fleet_data.json"


def main():
    con = sqlite3.connect(DB_PATH)
    results = run_kpis(con)

    # Vehicle directory for the dashboard's fleet table.
    con.row_factory = sqlite3.Row
    vehicles = [dict(r) for r in con.execute(
        "SELECT vehicle_id, make, model, year, vehicle_type, region, driver_name FROM vehicles"
    )]
    con.close()

    ontime = results["on_time_rate"]
    fleet_ontime = round(
        100.0 * sum(r["on_time"] for r in ontime) / max(sum(r["total"] for r in ontime), 1), 1
    )
    payload = {
        "generated": date.today().isoformat(),
        "summary": {**results["fleet_summary"][0], "fleet_on_time_pct": fleet_ontime},
        "vehicles": vehicles,
        "fuel_efficiency": results["fuel_efficiency"],
        "on_time_rate": ontime,
        "idle_share": results["idle_share"],
        "daily_trend": results["daily_fleet_trend"],
        "engine_anomalies": results["engine_anomalies"],
        "maintenance_cost": results["maintenance_cost"],
        "region_performance": results["region_performance"],
    }
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=1))
    print(f"Dashboard payload written to {OUT} ({OUT.stat().st_size/1024:.1f} KB)")


if __name__ == "__main__":
    main()
