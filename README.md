# Fleet Analytics Dashboard & Delivery Tracker

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)

An end-to-end fleet analytics platform that simulates 30 days of IoT vehicle telemetry for a 22-vehicle GTA delivery fleet, runs SQL-based analytics, generates automated stakeholder reports, and visualizes everything in a React dashboard.

**No third-party Python dependencies** — standard library only.

---

### Quick Start

```bash
python src/data_generator.py --days 30 --seed 42   # generate fleet data
python src/analytics.py                            # run KPI analysis
python src/report_generator.py                     # generate reports + CSVs
python src/export_dashboard_data.py                # export dashboard JSON
```

To preview the dashboard, paste `dashboard/FleetDashboard.jsx` into any React environment with `recharts` installed.

---

### Project Structure

```
src/
  data_generator.py       → IoT telemetry simulator → SQLite
  analytics.py            → SQL KPI queries + optimization benchmark
  report_generator.py     → automated Markdown + CSV reports
  export_dashboard_data.py→ backend → frontend JSON bridge
sql/
  schema.sql              → 4-table schema (vehicles, telemetry, deliveries, maintenance)
  indexes.sql             → performance indexes incl. covering index
dashboard/
  FleetDashboard.jsx      → React dashboard with 4 tabs
  fleet_data.json         → exported analytics data
reports/                  → generated reports + CSV extracts
```

---

### Key Features

- **Data simulation** — 22 vehicles with unique behaviour profiles, ~9,300 telemetry readings, ~2,000 deliveries
- **SQL analytics** — fuel efficiency, on-time rates, engine anomaly detection (z-scores), idle time, maintenance costs
- **Query optimization** — benchmark script proves ~27% improvement with covering indexes
- **Automated reporting** — one command generates an executive report + 6 CSV extracts
- **React dashboard** — 4 tabs: Overview, Fuel & Engine, Deliveries, Fleet Table

---

### Built By

**Mann Kaniyawala** — [GitHub](https://github.com/Mannpk18) · [LinkedIn](https://linkedin.com/in/mann-kaniyawala) · kaniyawm@mcmaster.ca
