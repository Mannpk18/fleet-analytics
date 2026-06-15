-- Fleet Analytics Dashboard & Delivery Tracker
-- Database schema: 4 tables modeling a delivery fleet with IoT telemetry.

DROP TABLE IF EXISTS telemetry;
DROP TABLE IF EXISTS deliveries;
DROP TABLE IF EXISTS maintenance_events;
DROP TABLE IF EXISTS vehicles;

CREATE TABLE vehicles (
    vehicle_id      TEXT PRIMARY KEY,        -- e.g. VAN-104
    make            TEXT NOT NULL,
    model           TEXT NOT NULL,
    year            INTEGER NOT NULL,
    vehicle_type    TEXT NOT NULL CHECK (vehicle_type IN ('cargo_van', 'box_truck', 'sedan')),
    region          TEXT NOT NULL,           -- GTA depot regions
    driver_name     TEXT NOT NULL,
    acquired_date   TEXT NOT NULL
);

-- One row per IoT sensor reading (every ~30 min while a vehicle is active).
CREATE TABLE telemetry (
    reading_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id      TEXT NOT NULL REFERENCES vehicles(vehicle_id),
    ts              TEXT NOT NULL,           -- ISO 8601 timestamp
    odometer_km     REAL NOT NULL,
    speed_kmh       REAL NOT NULL,
    fuel_level_pct  REAL NOT NULL,
    fuel_consumed_l REAL NOT NULL,           -- litres consumed since previous reading
    engine_temp_c   REAL NOT NULL,
    idle_minutes    REAL NOT NULL,           -- idle time since previous reading
    latitude        REAL NOT NULL,
    longitude       REAL NOT NULL
);

CREATE TABLE deliveries (
    delivery_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id      TEXT NOT NULL REFERENCES vehicles(vehicle_id),
    scheduled_at    TEXT NOT NULL,
    completed_at    TEXT,                    -- NULL if failed
    status          TEXT NOT NULL CHECK (status IN ('on_time', 'late', 'failed')),
    distance_km     REAL NOT NULL,
    stops           INTEGER NOT NULL
);

CREATE TABLE maintenance_events (
    event_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id      TEXT NOT NULL REFERENCES vehicles(vehicle_id),
    event_date      TEXT NOT NULL,
    event_type      TEXT NOT NULL,           -- oil_change, brake_service, tire_rotation, engine_repair
    cost_cad        REAL NOT NULL,
    downtime_hours  REAL NOT NULL
);

-- Indexes are intentionally created in a separate file (indexes.sql) so the
-- optimization benchmark in analytics.py can measure query times before and
-- after they exist. See README: "query efficiency by 25%".
