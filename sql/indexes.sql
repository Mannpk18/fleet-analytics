-- Performance indexes. Applied AFTER the baseline benchmark runs so the
-- improvement is measurable (analytics.py --benchmark).

CREATE INDEX IF NOT EXISTS idx_telemetry_vehicle_ts ON telemetry (vehicle_id, ts);
-- Covering index: a plain index on (ts) made range+join queries SLOWER because
-- every matching row needed a rowid lookup back to the table. Including the
-- columns the query reads lets SQLite answer entirely from the index.
CREATE INDEX IF NOT EXISTS idx_telemetry_ts_cover   ON telemetry (ts, vehicle_id, fuel_consumed_l);
CREATE INDEX IF NOT EXISTS idx_deliveries_vehicle   ON deliveries (vehicle_id, status);
CREATE INDEX IF NOT EXISTS idx_deliveries_sched     ON deliveries (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle  ON maintenance_events (vehicle_id);
