"""
data_generator.py
-----------------
Simulates 30 days of IoT telemetry for a delivery fleet operating out of
Greater Toronto Area depots, then loads it into SQLite.

Each vehicle emits a sensor reading roughly every 30 minutes during its shift:
odometer, speed, fuel level, fuel consumed, engine temperature, idle time, and
GPS position. Deliveries and maintenance events are generated alongside.

Design notes (interview talking points):
- Vehicles have stable per-vehicle "personalities" (base fuel efficiency,
  idle tendency, reliability) so fleet comparisons are meaningful rather
  than pure noise.
- Two vehicles are deliberately degraded (poor fuel economy + hot engine)
  so the anomaly views in the dashboard have something real to surface.
- Everything is seeded (--seed) for reproducible demos.

Usage:
    python src/data_generator.py --days 30 --seed 42
"""

import argparse
import math
import random
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "fleet.db"
SCHEMA_PATH = ROOT / "sql" / "schema.sql"

# ---------------------------------------------------------------- fleet setup

REGIONS = {
    "Downtown Toronto": (43.6532, -79.3832),
    "Mississauga":      (43.5890, -79.6441),
    "Scarborough":      (43.7764, -79.2318),
    "North York":       (43.7615, -79.4111),
}

VEHICLE_SPECS = [
    # (type, make, model, count, base L/100km, tank litres)
    ("cargo_van", "Ford",     "Transit 250",   8,  12.5, 95),
    ("box_truck", "Hino",     "195h",          6,  21.0, 190),
    ("sedan",     "Toyota",   "Corolla",       4,   7.0, 50),
    ("cargo_van", "Mercedes", "Sprinter 2500", 4,  13.5, 93),
]

DRIVERS = [
    "A. Okafor", "M. Singh", "J. Tremblay", "P. Nguyen", "S. Kowalski",
    "D. Rossi", "K. Yamada", "L. Fernandez", "R. Boateng", "T. O'Brien",
    "N. Haddad", "C. Dubois", "V. Petrov", "H. Lindqvist", "B. Mensah",
    "E. Castillo", "F. Janssen", "G. Almeida", "I. Novak", "W. Chen",
    "Y. Osei", "Z. Karim",
]

MAINTENANCE_TYPES = [
    ("oil_change",     120,  2),
    ("tire_rotation",   90,  2),
    ("brake_service",  450,  5),
    ("engine_repair", 1800, 24),
]


def build_fleet(rng: random.Random):
    """Create vehicle records plus hidden per-vehicle behaviour profiles."""
    vehicles, profiles = [], {}
    prefix = {"cargo_van": "VAN", "box_truck": "TRK", "sedan": "SDN"}
    counters = {"VAN": 100, "TRK": 200, "SDN": 300}
    regions = list(REGIONS.keys())
    driver_pool = DRIVERS.copy()
    rng.shuffle(driver_pool)

    for vtype, make, model, count, base_lp100, tank_l in VEHICLE_SPECS:
        for _ in range(count):
            p = prefix[vtype]
            counters[p] += 1
            vid = f"{p}-{counters[p]}"
            region = rng.choice(regions)
            vehicles.append({
                "vehicle_id": vid,
                "make": make,
                "model": model,
                "year": rng.randint(2018, 2024),
                "vehicle_type": vtype,
                "region": region,
                "driver_name": driver_pool.pop(),
                "acquired_date": f"{rng.randint(2018, 2024)}-{rng.randint(1, 12):02d}-01",
            })
            profiles[vid] = {
                "base_lp100": base_lp100 * rng.uniform(0.92, 1.10),
                "tank_l": tank_l,
                "idle_factor": rng.uniform(0.6, 1.6),     # driver idling habit
                "reliability": rng.uniform(0.85, 0.99),   # affects late/failed rates
                "engine_offset": rng.uniform(-3, 3),      # baseline temp offset
                "degraded": False,
            }

    # Deliberately degrade two vehicles so anomalies exist to find.
    for vid in rng.sample(list(profiles), 2):
        profiles[vid]["degraded"] = True
        profiles[vid]["base_lp100"] *= 1.30
        profiles[vid]["engine_offset"] += 9.0
        profiles[vid]["reliability"] -= 0.10

    return vehicles, profiles


# --------------------------------------------------------------- daily shifts

def simulate_day(rng, vehicle, profile, day_start, odometer):
    """Simulate one vehicle-day. Returns (telemetry_rows, deliveries, new_odometer)."""
    telemetry, deliveries = [], []

    # ~8% chance a vehicle sits out the day (maintenance hold, no route).
    if rng.random() < 0.08:
        return telemetry, deliveries, odometer

    lat0, lon0 = REGIONS[vehicle["region"]]
    shift_start = day_start + timedelta(hours=rng.uniform(6.0, 9.0))
    shift_hours = rng.uniform(6.5, 9.5)
    n_readings = int(shift_hours * 2)  # one reading per ~30 min
    fuel_pct = rng.uniform(55, 100)
    weekday = day_start.weekday() < 5

    for i in range(n_readings):
        ts = shift_start + timedelta(minutes=30 * i + rng.uniform(-4, 4))
        # Speed profile: urban stop-and-go with occasional highway legs.
        if rng.random() < 0.22:
            speed = rng.uniform(80, 105)        # highway
        elif rng.random() < 0.18:
            speed = rng.uniform(0, 6)           # parked at a stop
        else:
            speed = rng.uniform(18, 55)         # urban

        dist = speed * 0.5 * rng.uniform(0.85, 1.0)  # km in this 30-min window
        traffic = 1.12 if weekday and ts.hour in (8, 9, 16, 17) else 1.0
        lp100 = profile["base_lp100"] * traffic * rng.uniform(0.93, 1.07)
        fuel_l = dist * lp100 / 100.0
        idle = rng.uniform(1, 9) * profile["idle_factor"] * (1.4 if speed < 6 else 1.0)
        fuel_l += idle * 0.025  # idle burn ~1.5 L/h

        fuel_pct -= fuel_l / profile["tank_l"] * 100
        if fuel_pct < 12:  # refuel stop
            fuel_pct = rng.uniform(85, 100)

        temp = 88 + profile["engine_offset"] + speed * 0.05 + rng.uniform(-2.5, 2.5)
        odometer += dist
        angle = rng.uniform(0, 2 * math.pi)
        radius = rng.uniform(0, 0.09)

        telemetry.append((
            vehicle["vehicle_id"], ts.isoformat(timespec="seconds"),
            round(odometer, 1), round(speed, 1), round(max(fuel_pct, 0), 1),
            round(fuel_l, 3), round(temp, 1), round(idle, 1),
            round(lat0 + radius * math.sin(angle), 5),
            round(lon0 + radius * math.cos(angle), 5),
        ))

    # Deliveries for the day: vans/trucks run more stops than sedans.
    n_deliveries = rng.randint(2, 5) if vehicle["vehicle_type"] != "sedan" else rng.randint(1, 3)
    for _ in range(n_deliveries):
        sched = shift_start + timedelta(hours=rng.uniform(0.5, shift_hours - 0.5))
        roll = rng.random()
        if roll < profile["reliability"] - 0.06:
            status = "on_time"
            completed = sched + timedelta(minutes=rng.uniform(-12, 8))
        elif roll < profile["reliability"] + 0.04:
            status = "late"
            completed = sched + timedelta(minutes=rng.uniform(15, 75))
        else:
            status = "failed"
            completed = None
        deliveries.append((
            vehicle["vehicle_id"],
            sched.isoformat(timespec="seconds"),
            completed.isoformat(timespec="seconds") if completed else None,
            status,
            round(rng.uniform(3, 28), 1),
            rng.randint(1, 6),
        ))

    return telemetry, deliveries, odometer


def simulate_maintenance(rng, vehicles, start, days):
    rows = []
    for v in vehicles:
        for _ in range(rng.randint(0, 3)):
            etype, base_cost, base_dt = rng.choice(MAINTENANCE_TYPES)
            d = start + timedelta(days=rng.uniform(0, days))
            rows.append((
                v["vehicle_id"], d.date().isoformat(), etype,
                round(base_cost * rng.uniform(0.8, 1.4), 2),
                round(base_dt * rng.uniform(0.8, 1.5), 1),
            ))
    return rows


# --------------------------------------------------------------------- runner

def main():
    ap = argparse.ArgumentParser(description="Generate simulated fleet IoT data")
    ap.add_argument("--days", type=int, default=30)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    rng = random.Random(args.seed)
    vehicles, profiles = build_fleet(rng)
    start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=args.days)

    all_tel, all_del = [], []
    odo = {v["vehicle_id"]: rng.uniform(20_000, 160_000) for v in vehicles}
    for day in range(args.days):
        day_start = start + timedelta(days=day)
        for v in vehicles:
            tel, dels, odo[v["vehicle_id"]] = simulate_day(
                rng, v, profiles[v["vehicle_id"]], day_start, odo[v["vehicle_id"]]
            )
            all_tel.extend(tel)
            all_del.extend(dels)
    maint = simulate_maintenance(rng, vehicles, start, args.days)

    DB_PATH.parent.mkdir(exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.executescript(SCHEMA_PATH.read_text())
    con.executemany(
        "INSERT INTO vehicles VALUES (:vehicle_id,:make,:model,:year,:vehicle_type,:region,:driver_name,:acquired_date)",
        vehicles,
    )
    con.executemany(
        "INSERT INTO telemetry (vehicle_id,ts,odometer_km,speed_kmh,fuel_level_pct,fuel_consumed_l,engine_temp_c,idle_minutes,latitude,longitude) "
        "VALUES (?,?,?,?,?,?,?,?,?,?)", all_tel,
    )
    con.executemany(
        "INSERT INTO deliveries (vehicle_id,scheduled_at,completed_at,status,distance_km,stops) VALUES (?,?,?,?,?,?)",
        all_del,
    )
    con.executemany(
        "INSERT INTO maintenance_events (vehicle_id,event_date,event_type,cost_cad,downtime_hours) VALUES (?,?,?,?,?)",
        maint,
    )
    con.commit()
    con.close()

    print(f"Database written to {DB_PATH}")
    print(f"  vehicles:           {len(vehicles):>6}")
    print(f"  telemetry readings: {len(all_tel):>6}")
    print(f"  deliveries:         {len(all_del):>6}")
    print(f"  maintenance events: {len(maint):>6}")
    degraded = [vid for vid, p in profiles.items() if p["degraded"]]
    print(f"  (seeded anomalies in: {', '.join(degraded)})")


if __name__ == "__main__":
    main()

