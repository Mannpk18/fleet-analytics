import React, { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend, ReferenceLine,
} from "recharts";

// ─── Data exported by src/export_dashboard_data.py ─────────────────────────
const DATA = {"generated":"2026-06-11","summary":{"vehicles":22,"readings":9269,"total_fuel_l":29706.7,"km_range":127200.0,"fleet_on_time_pct":83.5},"vehicles":[{"vehicle_id":"VAN-101","make":"Ford","model":"Transit 250","year":2023,"vehicle_type":"cargo_van","region":"Mississauga","driver_name":"Y. Osei"},{"vehicle_id":"VAN-102","make":"Ford","model":"Transit 250","year":2024,"vehicle_type":"cargo_van","region":"Downtown Toronto","driver_name":"P. Nguyen"},{"vehicle_id":"VAN-103","make":"Ford","model":"Transit 250","year":2018,"vehicle_type":"cargo_van","region":"Scarborough","driver_name":"A. Okafor"},{"vehicle_id":"VAN-104","make":"Ford","model":"Transit 250","year":2022,"vehicle_type":"cargo_van","region":"North York","driver_name":"R. Boateng"},{"vehicle_id":"VAN-105","make":"Ford","model":"Transit 250","year":2022,"vehicle_type":"cargo_van","region":"Scarborough","driver_name":"L. Fernandez"},{"vehicle_id":"VAN-106","make":"Ford","model":"Transit 250","year":2024,"vehicle_type":"cargo_van","region":"Mississauga","driver_name":"G. Almeida"},{"vehicle_id":"VAN-107","make":"Ford","model":"Transit 250","year":2023,"vehicle_type":"cargo_van","region":"Mississauga","driver_name":"S. Kowalski"},{"vehicle_id":"VAN-108","make":"Ford","model":"Transit 250","year":2019,"vehicle_type":"cargo_van","region":"Mississauga","driver_name":"C. Dubois"},{"vehicle_id":"TRK-201","make":"Hino","model":"195h","year":2024,"vehicle_type":"box_truck","region":"Scarborough","driver_name":"M. Singh"},{"vehicle_id":"TRK-202","make":"Hino","model":"195h","year":2022,"vehicle_type":"box_truck","region":"Mississauga","driver_name":"N. Haddad"},{"vehicle_id":"TRK-203","make":"Hino","model":"195h","year":2020,"vehicle_type":"box_truck","region":"Mississauga","driver_name":"B. Mensah"},{"vehicle_id":"TRK-204","make":"Hino","model":"195h","year":2020,"vehicle_type":"box_truck","region":"North York","driver_name":"I. Novak"},{"vehicle_id":"TRK-205","make":"Hino","model":"195h","year":2024,"vehicle_type":"box_truck","region":"Mississauga","driver_name":"H. Lindqvist"},{"vehicle_id":"TRK-206","make":"Hino","model":"195h","year":2022,"vehicle_type":"box_truck","region":"Scarborough","driver_name":"K. Yamada"},{"vehicle_id":"SDN-301","make":"Toyota","model":"Corolla","year":2018,"vehicle_type":"sedan","region":"Scarborough","driver_name":"W. Chen"},{"vehicle_id":"SDN-302","make":"Toyota","model":"Corolla","year":2022,"vehicle_type":"sedan","region":"Mississauga","driver_name":"F. Janssen"},{"vehicle_id":"SDN-303","make":"Toyota","model":"Corolla","year":2022,"vehicle_type":"sedan","region":"Mississauga","driver_name":"V. Petrov"},{"vehicle_id":"SDN-304","make":"Toyota","model":"Corolla","year":2024,"vehicle_type":"sedan","region":"Scarborough","driver_name":"T. O'Brien"},{"vehicle_id":"VAN-109","make":"Mercedes","model":"Sprinter 2500","year":2024,"vehicle_type":"cargo_van","region":"North York","driver_name":"E. Castillo"},{"vehicle_id":"VAN-110","make":"Mercedes","model":"Sprinter 2500","year":2022,"vehicle_type":"cargo_van","region":"Scarborough","driver_name":"J. Tremblay"},{"vehicle_id":"VAN-111","make":"Mercedes","model":"Sprinter 2500","year":2023,"vehicle_type":"cargo_van","region":"Mississauga","driver_name":"D. Rossi"},{"vehicle_id":"VAN-112","make":"Mercedes","model":"Sprinter 2500","year":2019,"vehicle_type":"cargo_van","region":"Downtown Toronto","driver_name":"Z. Karim"}],"fuel_efficiency":[{"vehicle_id":"TRK-203","vehicle_type":"box_truck","driver_name":"B. Mensah","litres_per_100km":23.38,"km_driven":9681.0,"fuel_l":2263.0},{"vehicle_id":"TRK-206","vehicle_type":"box_truck","driver_name":"K. Yamada","litres_per_100km":23.0,"km_driven":8880.0,"fuel_l":2042.6},{"vehicle_id":"TRK-205","vehicle_type":"box_truck","driver_name":"H. Lindqvist","litres_per_100km":22.77,"km_driven":7972.0,"fuel_l":1815.6},{"vehicle_id":"TRK-204","vehicle_type":"box_truck","driver_name":"I. Novak","litres_per_100km":22.18,"km_driven":9145.0,"fuel_l":2028.3},{"vehicle_id":"TRK-202","vehicle_type":"box_truck","driver_name":"N. Haddad","litres_per_100km":21.42,"km_driven":8070.0,"fuel_l":1728.7},{"vehicle_id":"TRK-201","vehicle_type":"box_truck","driver_name":"M. Singh","litres_per_100km":21.21,"km_driven":8682.0,"fuel_l":1841.1},{"vehicle_id":"VAN-111","vehicle_type":"cargo_van","driver_name":"D. Rossi","litres_per_100km":20.61,"km_driven":9093.0,"fuel_l":1874.2},{"vehicle_id":"VAN-103","vehicle_type":"cargo_van","driver_name":"A. Okafor","litres_per_100km":16.53,"km_driven":9969.0,"fuel_l":1647.9},{"vehicle_id":"VAN-109","vehicle_type":"cargo_van","driver_name":"E. Castillo","litres_per_100km":15.05,"km_driven":8641.0,"fuel_l":1300.2},{"vehicle_id":"VAN-107","vehicle_type":"cargo_van","driver_name":"S. Kowalski","litres_per_100km":14.8,"km_driven":8871.0,"fuel_l":1312.7},{"vehicle_id":"VAN-112","vehicle_type":"cargo_van","driver_name":"Z. Karim","litres_per_100km":14.39,"km_driven":8182.0,"fuel_l":1177.4},{"vehicle_id":"VAN-110","vehicle_type":"cargo_van","driver_name":"J. Tremblay","litres_per_100km":14.31,"km_driven":8303.0,"fuel_l":1188.4},{"vehicle_id":"VAN-102","vehicle_type":"cargo_van","driver_name":"P. Nguyen","litres_per_100km":14.09,"km_driven":8700.0,"fuel_l":1225.5},{"vehicle_id":"VAN-101","vehicle_type":"cargo_van","driver_name":"Y. Osei","litres_per_100km":13.59,"km_driven":8657.0,"fuel_l":1176.4},{"vehicle_id":"VAN-108","vehicle_type":"cargo_van","driver_name":"C. Dubois","litres_per_100km":13.35,"km_driven":8301.0,"fuel_l":1108.3},{"vehicle_id":"VAN-106","vehicle_type":"cargo_van","driver_name":"G. Almeida","litres_per_100km":13.21,"km_driven":9394.0,"fuel_l":1241.1},{"vehicle_id":"VAN-105","vehicle_type":"cargo_van","driver_name":"L. Fernandez","litres_per_100km":12.83,"km_driven":8044.0,"fuel_l":1032.2},{"vehicle_id":"VAN-104","vehicle_type":"cargo_van","driver_name":"R. Boateng","litres_per_100km":12.54,"km_driven":9305.0,"fuel_l":1167.3},{"vehicle_id":"SDN-303","vehicle_type":"sedan","driver_name":"V. Petrov","litres_per_100km":8.62,"km_driven":8402.0,"fuel_l":724.2},{"vehicle_id":"SDN-302","vehicle_type":"sedan","driver_name":"F. Janssen","litres_per_100km":7.79,"km_driven":7782.0,"fuel_l":606.1},{"vehicle_id":"SDN-304","vehicle_type":"sedan","driver_name":"T. O'Brien","litres_per_100km":7.46,"km_driven":8097.0,"fuel_l":604.0},{"vehicle_id":"SDN-301","vehicle_type":"sedan","driver_name":"W. Chen","litres_per_100km":7.25,"km_driven":8295.0,"fuel_l":601.6}],"on_time_rate":[{"vehicle_id":"VAN-111","total":91,"on_time":64,"late":12,"failed":15,"on_time_pct":70.3},{"vehicle_id":"TRK-204","total":94,"on_time":68,"late":12,"failed":14,"on_time_pct":72.3},{"vehicle_id":"VAN-103","total":93,"on_time":69,"late":13,"failed":11,"on_time_pct":74.2},{"vehicle_id":"SDN-303","total":58,"on_time":45,"late":11,"failed":2,"on_time_pct":77.6},{"vehicle_id":"TRK-201","total":89,"on_time":70,"late":10,"failed":9,"on_time_pct":78.7},{"vehicle_id":"SDN-304","total":57,"on_time":46,"late":8,"failed":3,"on_time_pct":80.7},{"vehicle_id":"VAN-108","total":94,"on_time":76,"late":13,"failed":5,"on_time_pct":80.9},{"vehicle_id":"VAN-104","total":97,"on_time":80,"late":13,"failed":4,"on_time_pct":82.5},{"vehicle_id":"VAN-106","total":101,"on_time":84,"late":10,"failed":7,"on_time_pct":83.2},{"vehicle_id":"VAN-102","total":100,"on_time":84,"late":5,"failed":11,"on_time_pct":84.0},{"vehicle_id":"TRK-202","total":99,"on_time":84,"late":15,"failed":0,"on_time_pct":84.8},{"vehicle_id":"VAN-107","total":100,"on_time":85,"late":14,"failed":1,"on_time_pct":85.0},{"vehicle_id":"VAN-112","total":107,"on_time":91,"late":12,"failed":4,"on_time_pct":85.0},{"vehicle_id":"TRK-203","total":95,"on_time":81,"late":12,"failed":2,"on_time_pct":85.3},{"vehicle_id":"SDN-301","total":56,"on_time":48,"late":7,"failed":1,"on_time_pct":85.7},{"vehicle_id":"SDN-302","total":50,"on_time":44,"late":5,"failed":1,"on_time_pct":88.0},{"vehicle_id":"VAN-109","total":100,"on_time":88,"late":9,"failed":3,"on_time_pct":88.0},{"vehicle_id":"VAN-110","total":88,"on_time":78,"late":8,"failed":2,"on_time_pct":88.6},{"vehicle_id":"TRK-206","total":97,"on_time":86,"late":11,"failed":0,"on_time_pct":88.7},{"vehicle_id":"TRK-205","total":92,"on_time":83,"late":5,"failed":4,"on_time_pct":90.2},{"vehicle_id":"VAN-101","total":105,"on_time":95,"late":9,"failed":1,"on_time_pct":90.5},{"vehicle_id":"VAN-105","total":88,"on_time":80,"late":8,"failed":0,"on_time_pct":90.9}],"idle_share":[{"vehicle_id":"VAN-108","idle_min":3121.0,"shift_min":12030,"idle_pct":25.9},{"vehicle_id":"VAN-103","idle_min":3570.0,"shift_min":14250,"idle_pct":25.1},{"vehicle_id":"VAN-105","idle_min":2772.0,"shift_min":12180,"idle_pct":22.8},{"vehicle_id":"VAN-107","idle_min":2895.0,"shift_min":12870,"idle_pct":22.5},{"vehicle_id":"VAN-111","idle_min":2883.0,"shift_min":13050,"idle_pct":22.1},{"vehicle_id":"VAN-112","idle_min":2642.0,"shift_min":12180,"idle_pct":21.7},{"vehicle_id":"VAN-106","idle_min":2824.0,"shift_min":13080,"idle_pct":21.6},{"vehicle_id":"SDN-303","idle_min":2684.0,"shift_min":12510,"idle_pct":21.5},{"vehicle_id":"SDN-302","idle_min":2409.0,"shift_min":11190,"idle_pct":21.5},{"vehicle_id":"TRK-203","idle_min":2794.0,"shift_min":13770,"idle_pct":20.3},{"vehicle_id":"TRK-202","idle_min":2269.0,"shift_min":12150,"idle_pct":18.7},{"vehicle_id":"TRK-205","idle_min":1981.0,"shift_min":11640,"idle_pct":17.0},{"vehicle_id":"VAN-102","idle_min":2236.0,"shift_min":13320,"idle_pct":16.8},{"vehicle_id":"VAN-104","idle_min":1994.0,"shift_min":13020,"idle_pct":15.3},{"vehicle_id":"VAN-101","idle_min":1940.0,"shift_min":13110,"idle_pct":14.8},{"vehicle_id":"VAN-110","idle_min":1733.0,"shift_min":11880,"idle_pct":14.6},{"vehicle_id":"SDN-304","idle_min":1705.0,"shift_min":11700,"idle_pct":14.6},{"vehicle_id":"VAN-109","idle_min":1715.0,"shift_min":13020,"idle_pct":13.2},{"vehicle_id":"TRK-204","idle_min":1636.0,"shift_min":13050,"idle_pct":12.5},{"vehicle_id":"TRK-206","idle_min":1496.0,"shift_min":12720,"idle_pct":11.8},{"vehicle_id":"TRK-201","idle_min":1364.0,"shift_min":12210,"idle_pct":11.2},{"vehicle_id":"SDN-301","idle_min":1418.0,"shift_min":13140,"idle_pct":10.8}],"daily_trend":[{"day":"2026-05-12","fuel_l":972.6,"avg_temp_c":91.0,"active_vehicles":21,"idle_hours":28.1},{"day":"2026-05-13","fuel_l":1019.3,"avg_temp_c":91.3,"active_vehicles":20,"idle_hours":27.7},{"day":"2026-05-14","fuel_l":1093.7,"avg_temp_c":91.0,"active_vehicles":19,"idle_hours":27.1},{"day":"2026-05-15","fuel_l":1086.4,"avg_temp_c":91.1,"active_vehicles":21,"idle_hours":30.7},{"day":"2026-05-16","fuel_l":1033.2,"avg_temp_c":91.4,"active_vehicles":20,"idle_hours":29.2},{"day":"2026-05-17","fuel_l":997.5,"avg_temp_c":91.0,"active_vehicles":20,"idle_hours":29.1},{"day":"2026-05-18","fuel_l":1079.2,"avg_temp_c":91.2,"active_vehicles":21,"idle_hours":28.7},{"day":"2026-05-19","fuel_l":998.4,"avg_temp_c":91.2,"active_vehicles":21,"idle_hours":30.9},{"day":"2026-05-20","fuel_l":938.9,"avg_temp_c":91.0,"active_vehicles":20,"idle_hours":28.0},{"day":"2026-05-21","fuel_l":880.9,"avg_temp_c":91.0,"active_vehicles":18,"idle_hours":25.1},{"day":"2026-05-22","fuel_l":1005.7,"avg_temp_c":91.2,"active_vehicles":19,"idle_hours":27.1},{"day":"2026-05-23","fuel_l":950.7,"avg_temp_c":91.0,"active_vehicles":21,"idle_hours":28.6},{"day":"2026-05-24","fuel_l":1019.5,"avg_temp_c":91.1,"active_vehicles":22,"idle_hours":29.4},{"day":"2026-05-25","fuel_l":1027.5,"avg_temp_c":91.4,"active_vehicles":21,"idle_hours":29.1},{"day":"2026-05-26","fuel_l":1014.5,"avg_temp_c":91.2,"active_vehicles":21,"idle_hours":27.9},{"day":"2026-05-27","fuel_l":1044.9,"avg_temp_c":91.1,"active_vehicles":20,"idle_hours":27.0},{"day":"2026-05-28","fuel_l":1011.8,"avg_temp_c":91.1,"active_vehicles":21,"idle_hours":29.0},{"day":"2026-05-29","fuel_l":978.7,"avg_temp_c":91.5,"active_vehicles":19,"idle_hours":26.4},{"day":"2026-05-30","fuel_l":890.5,"avg_temp_c":90.7,"active_vehicles":19,"idle_hours":25.5},{"day":"2026-05-31","fuel_l":709.8,"avg_temp_c":91.1,"active_vehicles":16,"idle_hours":21.3},{"day":"2026-06-01","fuel_l":897.0,"avg_temp_c":90.7,"active_vehicles":19,"idle_hours":27.2},{"day":"2026-06-02","fuel_l":1165.1,"avg_temp_c":91.1,"active_vehicles":22,"idle_hours":32.4},{"day":"2026-06-03","fuel_l":993.6,"avg_temp_c":91.1,"active_vehicles":21,"idle_hours":27.9},{"day":"2026-06-04","fuel_l":1033.5,"avg_temp_c":91.3,"active_vehicles":20,"idle_hours":29.0},{"day":"2026-06-05","fuel_l":986.0,"avg_temp_c":91.4,"active_vehicles":19,"idle_hours":25.4},{"day":"2026-06-06","fuel_l":1010.0,"avg_temp_c":91.1,"active_vehicles":21,"idle_hours":26.6},{"day":"2026-06-07","fuel_l":999.2,"avg_temp_c":90.9,"active_vehicles":20,"idle_hours":29.3},{"day":"2026-06-08","fuel_l":1044.6,"avg_temp_c":91.1,"active_vehicles":19,"idle_hours":28.6},{"day":"2026-06-09","fuel_l":1006.9,"avg_temp_c":91.2,"active_vehicles":20,"idle_hours":28.1},{"day":"2026-06-10","fuel_l":817.3,"avg_temp_c":91.2,"active_vehicles":18,"idle_hours":24.2}],"engine_anomalies":[{"vehicle_id":"VAN-103","avg_temp_c":101.2,"fleet_avg_c":91.0,"z_score":3.0},{"vehicle_id":"VAN-111","avg_temp_c":99.3,"fleet_avg_c":91.0,"z_score":2.45}],"maintenance_cost":[{"vehicle_id":"TRK-202","vehicle":"Hino 195h","events":3,"total_cost_cad":3942.43,"downtime_h":57.5},{"vehicle_id":"TRK-201","vehicle":"Hino 195h","events":3,"total_cost_cad":2690.48,"downtime_h":40.0},{"vehicle_id":"SDN-304","vehicle":"Toyota Corolla","events":2,"total_cost_cad":2353.27,"downtime_h":33.8},{"vehicle_id":"VAN-103","vehicle":"Ford Transit 250","events":2,"total_cost_cad":1771.64,"downtime_h":37.4},{"vehicle_id":"TRK-204","vehicle":"Hino 195h","events":1,"total_cost_cad":1609.64,"downtime_h":32.3},{"vehicle_id":"SDN-303","vehicle":"Toyota Corolla","events":2,"total_cost_cad":555.85,"downtime_h":7.7},{"vehicle_id":"VAN-110","vehicle":"Mercedes Sprinter 2500","events":1,"total_cost_cad":484.11,"downtime_h":4.0},{"vehicle_id":"VAN-101","vehicle":"Ford Transit 250","events":1,"total_cost_cad":479.63,"downtime_h":4.4},{"vehicle_id":"VAN-111","vehicle":"Mercedes Sprinter 2500","events":3,"total_cost_cad":351.44,"downtime_h":7.5},{"vehicle_id":"VAN-104","vehicle":"Ford Transit 250","events":3,"total_cost_cad":340.11,"downtime_h":6.2},{"vehicle_id":"VAN-108","vehicle":"Ford Transit 250","events":2,"total_cost_cad":316.79,"downtime_h":5.1},{"vehicle_id":"TRK-203","vehicle":"Hino 195h","events":2,"total_cost_cad":229.76,"downtime_h":4.5},{"vehicle_id":"SDN-301","vehicle":"Toyota Corolla","events":2,"total_cost_cad":185.54,"downtime_h":3.8},{"vehicle_id":"VAN-105","vehicle":"Ford Transit 250","events":1,"total_cost_cad":130.04,"downtime_h":2.0},{"vehicle_id":"VAN-107","vehicle":"Ford Transit 250","events":1,"total_cost_cad":103.31,"downtime_h":2.0},{"vehicle_id":"TRK-205","vehicle":"Hino 195h","events":1,"total_cost_cad":94.56,"downtime_h":1.6},{"vehicle_id":"SDN-302","vehicle":"Toyota Corolla","events":0,"total_cost_cad":null,"downtime_h":null},{"vehicle_id":"TRK-206","vehicle":"Hino 195h","events":0,"total_cost_cad":null,"downtime_h":null},{"vehicle_id":"VAN-102","vehicle":"Ford Transit 250","events":0,"total_cost_cad":null,"downtime_h":null},{"vehicle_id":"VAN-106","vehicle":"Ford Transit 250","events":0,"total_cost_cad":null,"downtime_h":null},{"vehicle_id":"VAN-109","vehicle":"Mercedes Sprinter 2500","events":0,"total_cost_cad":null,"downtime_h":null},{"vehicle_id":"VAN-112","vehicle":"Mercedes Sprinter 2500","events":0,"total_cost_cad":null,"downtime_h":null}],"region_performance":[{"region":"Downtown Toronto","vehicles":2,"on_time_pct":84.5,"deliveries":207},{"region":"Scarborough","vehicles":7,"on_time_pct":84.0,"deliveries":568},{"region":"Mississauga","vehicles":10,"on_time_pct":83.7,"deliveries":885},{"region":"North York","vehicles":3,"on_time_pct":81.1,"deliveries":291}]};

// ─── Design tokens ──────────────────────────────────────────────────────────
const T = {
  bg: "#E9ECEE", panel: "#FFFFFF", ink: "#14212B", muted: "#5E6E7A",
  line: "#C9D1D7", accent: "#E8500A", ok: "#0F766E", warn: "#B45309",
  fail: "#B91C1C", van: "#14668F", truck: "#5B4FA8", sedan: "#0F766E",
};
const TYPE_COLOR = { cargo_van: T.van, box_truck: T.truck, sedan: T.sedan };
const TYPE_LABEL = { cargo_van: "VAN", box_truck: "TRUCK", sedan: "SEDAN" };

const css = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.fd-root { background:${T.bg}; color:${T.ink}; min-height:100vh;
  font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }
.fd-display { font-family:'Barlow Condensed','Arial Narrow',sans-serif;
  text-transform:uppercase; letter-spacing:0.04em; }
.fd-mono { font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace; }
.fd-panel { background:${T.panel}; border:1px solid ${T.line}; border-radius:2px; }
.fd-plate { display:inline-block; font-family:'IBM Plex Mono',monospace;
  font-weight:600; font-size:12px; letter-spacing:0.06em;
  border:1.5px solid ${T.ink}; border-radius:3px; padding:1px 7px;
  background:#F6F8F9; box-shadow:inset 0 -2px 0 rgba(20,33,43,.10); white-space:nowrap; }
.fd-plate.alert { border-color:${T.accent}; color:${T.accent}; background:#FFF3EC; }
.fd-tab { background:none; border:none; cursor:pointer; padding:10px 18px 12px;
  font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:600;
  text-transform:uppercase; letter-spacing:0.06em; color:${T.muted};
  border-bottom:3px solid transparent; }
.fd-tab:hover { color:${T.ink}; }
.fd-tab.on { color:${T.ink}; border-bottom-color:${T.accent}; }
.fd-tab:focus-visible, .fd-input:focus-visible, .fd-sel:focus-visible {
  outline:2px solid ${T.accent}; outline-offset:2px; }
.fd-input, .fd-sel { border:1px solid ${T.line}; border-radius:2px; padding:7px 10px;
  font-family:'IBM Plex Mono',monospace; font-size:12px; background:#fff; color:${T.ink}; }
.fd-th { font-family:'Barlow Condensed',sans-serif; text-transform:uppercase;
  letter-spacing:0.07em; font-size:12px; font-weight:600; color:${T.muted};
  text-align:left; padding:8px 10px; border-bottom:2px solid ${T.ink}; }
.fd-td { padding:8px 10px; border-bottom:1px solid ${T.line}; font-size:13px; }
.fd-kpi-num { font-family:'IBM Plex Mono',monospace; font-weight:600; font-size:26px; }
@media (prefers-reduced-motion:no-preference){ .fd-tabpane{animation:fdIn .18s ease;} }
@keyframes fdIn { from{opacity:.4} to{opacity:1} }
`;

// ─── Small pieces ───────────────────────────────────────────────────────────
const Kpi = ({ label, value, unit, tone }) => (
  <div style={{ padding: "10px 18px", borderLeft: `1px solid ${T.line}` }}>
    <div className="fd-display" style={{ fontSize: 12, color: T.muted }}>{label}</div>
    <div className="fd-kpi-num" style={{ color: tone || T.ink }}>
      {value}{unit && <span style={{ fontSize: 14, color: T.muted, marginLeft: 3 }}>{unit}</span>}
    </div>
  </div>
);

const PanelTitle = ({ children, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
    padding: "12px 16px", borderBottom: `1px solid ${T.line}` }}>
    <span className="fd-display" style={{ fontSize: 16, fontWeight: 700 }}>{children}</span>
    {right && <span className="fd-mono" style={{ fontSize: 11, color: T.muted }}>{right}</span>}
  </div>
);

const tooltipStyle = {
  background: T.ink, border: "none", borderRadius: 2,
  fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: "#fff",
};

// ─── Tabs ───────────────────────────────────────────────────────────────────
function Overview() {
  const trend = DATA.daily_trend.map(d => ({ ...d, day: d.day.slice(5) }));
  const anomalies = DATA.engine_anomalies;
  const anomalyIds = new Set(anomalies.map(a => a.vehicle_id));
  return (
    <div className="fd-tabpane" style={{ display: "grid", gap: 14 }}>
      {anomalies.length > 0 && (
        <div className="fd-panel" style={{ borderLeft: `4px solid ${T.accent}`, padding: "12px 16px" }}>
          <div className="fd-display" style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: 6 }}>
            Engine temperature alerts — inspect before next dispatch
          </div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            {anomalies.map(a => (
              <div key={a.vehicle_id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="fd-plate alert">{a.vehicle_id}</span>
                <span className="fd-mono" style={{ fontSize: 12 }}>
                  {a.avg_temp_c}°C avg · fleet {a.fleet_avg_c}°C · z={a.z_score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fd-panel">
        <PanelTitle right="litres / day · 30-day window">Daily fuel consumption</PanelTitle>
        <div style={{ padding: "14px 8px 4px" }}>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={trend} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
              <CartesianGrid stroke={T.line} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} interval={4} />
              <YAxis tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="fuel_l" name="Fuel (L)" stroke={T.ink}
                strokeWidth={2} fill={T.ink} fillOpacity={0.08} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 14 }}>
        <div className="fd-panel">
          <PanelTitle right="% deliveries on time">On-time rate by region</PanelTitle>
          <div style={{ padding: "14px 8px 4px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={DATA.region_performance} layout="vertical"
                margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} />
                <YAxis type="category" dataKey="region" width={110}
                  tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="on_time_pct" name="On-time %" fill={T.ok} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="fd-panel">
          <PanelTitle right="hours / day">Fleet idle time</PanelTitle>
          <div style={{ padding: "14px 8px 4px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid stroke={T.line} strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} interval={5} />
                <YAxis tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="idle_hours" name="Idle (h)" stroke={T.accent}
                  strokeWidth={2} fill={T.accent} fillOpacity={0.10} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function FuelEngine() {
  const anomalyIds = new Set(DATA.engine_anomalies.map(a => a.vehicle_id));
  const fuel = DATA.fuel_efficiency;
  const idle = DATA.idle_share.slice(0, 8);
  return (
    <div className="fd-tabpane" style={{ display: "grid", gap: 14 }}>
      <div className="fd-panel">
        <PanelTitle right="L/100km · orange = engine-temp anomaly">Fuel efficiency by vehicle</PanelTitle>
        <div style={{ padding: "14px 8px 4px" }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fuel} margin={{ top: 4, right: 16, left: -12, bottom: 40 }}>
              <CartesianGrid stroke={T.line} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="vehicle_id" angle={-45} textAnchor="end"
                tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} interval={0} />
              <YAxis tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="litres_per_100km" name="L/100km">
                {fuel.map(f => (
                  <Cell key={f.vehicle_id}
                    fill={anomalyIds.has(f.vehicle_id) ? T.accent : TYPE_COLOR[f.vehicle_type]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="fd-mono" style={{ padding: "0 16px 12px", fontSize: 11, color: T.muted }}>
          <span style={{ color: T.van }}>■</span> van&nbsp;&nbsp;
          <span style={{ color: T.truck }}>■</span> truck&nbsp;&nbsp;
          <span style={{ color: T.sedan }}>■</span> sedan&nbsp;&nbsp;
          <span style={{ color: T.accent }}>■</span> flagged
        </div>
      </div>

      <div className="fd-panel">
        <PanelTitle right="% of shift time spent idling">Highest idle share</PanelTitle>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            <th className="fd-th">Vehicle</th><th className="fd-th">Idle min</th>
            <th className="fd-th">Shift min</th><th className="fd-th">Idle %</th>
          </tr></thead>
          <tbody>
            {idle.map(r => (
              <tr key={r.vehicle_id}>
                <td className="fd-td"><span className={"fd-plate" + (anomalyIds.has(r.vehicle_id) ? " alert" : "")}>{r.vehicle_id}</span></td>
                <td className="fd-td fd-mono">{r.idle_min.toLocaleString()}</td>
                <td className="fd-td fd-mono">{r.shift_min.toLocaleString()}</td>
                <td className="fd-td fd-mono" style={{ fontWeight: 600,
                  color: r.idle_pct > 22 ? T.accent : T.ink }}>{r.idle_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Deliveries() {
  const rows = [...DATA.on_time_rate].sort((a, b) => a.on_time_pct - b.on_time_pct);
  return (
    <div className="fd-tabpane" style={{ display: "grid", gap: 14 }}>
      <div className="fd-panel">
        <PanelTitle right={`fleet on-time ${DATA.summary.fleet_on_time_pct}% · worst first`}>
          Delivery outcomes by vehicle
        </PanelTitle>
        <div style={{ padding: "14px 8px 4px" }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={rows} margin={{ top: 4, right: 16, left: -12, bottom: 40 }}>
              <CartesianGrid stroke={T.line} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="vehicle_id" angle={-45} textAnchor="end"
                tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} interval={0} />
              <YAxis tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontFamily: "IBM Plex Mono", fontSize: 11 }} />
              <Bar dataKey="on_time" name="On time" stackId="d" fill={T.ok} />
              <Bar dataKey="late" name="Late" stackId="d" fill={T.warn} />
              <Bar dataKey="failed" name="Failed" stackId="d" fill={T.fail} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Fleet() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const fuelBy = useMemo(() => Object.fromEntries(DATA.fuel_efficiency.map(f => [f.vehicle_id, f])), []);
  const otBy = useMemo(() => Object.fromEntries(DATA.on_time_rate.map(o => [o.vehicle_id, o])), []);
  const anomalyIds = new Set(DATA.engine_anomalies.map(a => a.vehicle_id));

  const rows = DATA.vehicles
    .filter(v => type === "all" || v.vehicle_type === type)
    .filter(v => {
      const s = q.trim().toLowerCase();
      return !s || [v.vehicle_id, v.driver_name, v.region, v.make, v.model]
        .join(" ").toLowerCase().includes(s);
    })
    .sort((a, b) => a.vehicle_id.localeCompare(b.vehicle_id));

  return (
    <div className="fd-tabpane fd-panel">
      <PanelTitle right={`${rows.length} of ${DATA.vehicles.length} vehicles`}>Fleet directory</PanelTitle>
      <div style={{ display: "flex", gap: 10, padding: "12px 16px", flexWrap: "wrap" }}>
        <input className="fd-input" style={{ flex: "1 1 220px" }} placeholder="Search vehicle, driver, or region"
          value={q} onChange={e => setQ(e.target.value)} aria-label="Search fleet" />
        <select className="fd-sel" value={type} onChange={e => setType(e.target.value)} aria-label="Filter by type">
          <option value="all">All types</option>
          <option value="cargo_van">Cargo vans</option>
          <option value="box_truck">Box trucks</option>
          <option value="sedan">Sedans</option>
        </select>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead><tr>
            <th className="fd-th">Unit</th><th className="fd-th">Type</th>
            <th className="fd-th">Vehicle</th><th className="fd-th">Driver</th>
            <th className="fd-th">Region</th><th className="fd-th">L/100km</th>
            <th className="fd-th">On-time</th>
          </tr></thead>
          <tbody>
            {rows.map(v => {
              const f = fuelBy[v.vehicle_id], o = otBy[v.vehicle_id];
              return (
                <tr key={v.vehicle_id}>
                  <td className="fd-td"><span className={"fd-plate" + (anomalyIds.has(v.vehicle_id) ? " alert" : "")}>{v.vehicle_id}</span></td>
                  <td className="fd-td fd-mono" style={{ fontSize: 11, color: TYPE_COLOR[v.vehicle_type] }}>
                    {TYPE_LABEL[v.vehicle_type]}</td>
                  <td className="fd-td">{v.make} {v.model} <span style={{ color: T.muted }}>’{String(v.year).slice(2)}</span></td>
                  <td className="fd-td">{v.driver_name}</td>
                  <td className="fd-td">{v.region}</td>
                  <td className="fd-td fd-mono">{f ? f.litres_per_100km : "—"}</td>
                  <td className="fd-td fd-mono" style={{ fontWeight: 600,
                    color: o && o.on_time_pct < 78 ? T.accent : T.ok }}>
                    {o ? o.on_time_pct + "%" : "—"}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td className="fd-td" colSpan={7} style={{ color: T.muted }}>
                No vehicles match. Clear the search or choose another type.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Shell ──────────────────────────────────────────────────────────────────
const TABS = [
  ["overview", "Overview", Overview],
  ["fuel", "Fuel & Engine", FuelEngine],
  ["deliveries", "Deliveries", Deliveries],
  ["fleet", "Fleet", Fleet],
];

export default function FleetDashboard() {
  const [tab, setTab] = useState("overview");
  const Active = TABS.find(t => t[0] === tab)[2];
  const s = DATA.summary;
  return (
    <div className="fd-root">
      <style>{css}</style>
      <header style={{ background: T.ink, color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "18px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div className="fd-display" style={{ fontSize: 30, fontWeight: 700, lineHeight: 1 }}>
                Fleet Ops <span style={{ color: T.accent }}>/</span> GTA Delivery
              </div>
              <div className="fd-mono" style={{ fontSize: 11, color: "#9FB0BC", marginTop: 4 }}>
                telemetry window · 30 days · generated {DATA.generated}
              </div>
            </div>
            <div className="fd-mono" style={{ fontSize: 11, color: "#9FB0BC" }}>
              python → sqlite → react
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", margin: "14px 0 0",
            background: "#1D2F3D", border: "1px solid #2C4254", borderBottom: "none" }}>
            <Kpi label="Vehicles" value={s.vehicles} tone="#fff" />
            <Kpi label="Sensor readings" value={s.readings.toLocaleString()} tone="#fff" />
            <Kpi label="Fuel consumed" value={Math.round(s.total_fuel_l).toLocaleString()} unit="L" tone="#fff" />
            <Kpi label="On-time rate" value={s.fleet_on_time_pct} unit="%" tone={s.fleet_on_time_pct >= 85 ? "#5EEAD4" : "#FDBA74"} />
            <Kpi label="Alerts" value={DATA.engine_anomalies.length} tone={DATA.engine_anomalies.length ? "#FB923C" : "#5EEAD4"} />
          </div>
        </div>
      </header>

      <nav style={{ background: T.panel, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 12px", display: "flex", flexWrap: "wrap" }}>
          {TABS.map(([id, label]) => (
            <button key={id} className={"fd-tab" + (tab === id ? " on" : "")}
              onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 16px 40px" }}>
        <Active />
      </main>
    </div>
  );
}
