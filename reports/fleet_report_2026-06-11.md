# Fleet Operations Report — 2026-06-12

## Executive summary
- Fleet of **22 vehicles** produced **9,398 telemetry readings** and consumed **29,922.3 L** of fuel this period.
- Fleet-wide on-time delivery rate: **85.5%**.
- Highest fuel burn: **TRK-203** at **23.44 L/100km** — flag for inspection.
- 2 vehicle(s) running hot vs fleet baseline: VAN-103, VAN-111.
- Largest maintenance spend: **VAN-110** ($4636.64 CAD, 59.0 h downtime).

## On-time delivery (lowest performers first)
| vehicle_id | total | on_time | late | failed | on_time_pct |
|---|---|---|---|---|---|
| VAN-111 | 101 | 74 | 10 | 17 | 73.3 |
| TRK-204 | 85 | 66 | 10 | 9 | 77.6 |
| TRK-201 | 95 | 75 | 10 | 10 | 78.9 |
| VAN-110 | 100 | 79 | 18 | 3 | 79.0 |
| SDN-302 | 60 | 49 | 9 | 2 | 81.7 |
| VAN-106 | 96 | 80 | 11 | 5 | 83.3 |
| VAN-102 | 85 | 71 | 7 | 7 | 83.5 |
| SDN-304 | 58 | 49 | 7 | 2 | 84.5 |

## Fuel efficiency (highest consumption first)
| vehicle_id | vehicle_type | driver_name | litres_per_100km | km_driven | fuel_l |
|---|---|---|---|---|---|
| TRK-203 | box_truck | B. Mensah | 23.44 | 8363.0 | 1959.9 |
| TRK-206 | box_truck | K. Yamada | 22.88 | 9359.0 | 2141.6 |
| TRK-205 | box_truck | H. Lindqvist | 22.8 | 9467.0 | 2158.7 |
| TRK-204 | box_truck | I. Novak | 22.19 | 8825.0 | 1958.6 |
| TRK-202 | box_truck | N. Haddad | 21.31 | 8993.0 | 1916.1 |
| TRK-201 | box_truck | M. Singh | 21.26 | 8085.0 | 1719.0 |
| VAN-111 | cargo_van | D. Rossi | 20.57 | 8656.0 | 1781.0 |
| VAN-103 | cargo_van | A. Okafor | 16.54 | 10024.0 | 1658.3 |

## Engine temperature anomalies
| vehicle_id | avg_temp_c | fleet_avg_c | z_score |
|---|---|---|---|
| VAN-103 | 101.1 | 91.0 | 2.97 |
| VAN-111 | 99.3 | 91.0 | 2.44 |

## Idle time share (top 8)
| vehicle_id | idle_min | shift_min | idle_pct |
|---|---|---|---|
| VAN-108 | 3613.0 | 13050 | 27.7 |
| VAN-103 | 3569.0 | 14040 | 25.4 |
| VAN-105 | 2857.0 | 12420 | 23.0 |
| VAN-111 | 2768.0 | 12330 | 22.5 |
| VAN-107 | 2736.0 | 12270 | 22.3 |
| VAN-106 | 2791.0 | 12600 | 22.2 |
| SDN-302 | 2914.0 | 13530 | 21.5 |
| VAN-112 | 2726.0 | 12840 | 21.2 |

## Maintenance cost by vehicle (top 8)
| vehicle_id | vehicle | events | total_cost_cad | downtime_h |
|---|---|---|---|---|
| VAN-110 | Mercedes Sprinter 2500 | 3 | 4636.64 | 59.0 |
| TRK-206 | Hino 195h | 3 | 4063.55 | 55.5 |
| VAN-101 | Ford Transit 250 | 3 | 3106.34 | 42.0 |
| VAN-112 | Mercedes Sprinter 2500 | 3 | 2457.46 | 38.3 |
| SDN-301 | Toyota Corolla | 2 | 2091.18 | 23.8 |
| SDN-304 | Toyota Corolla | 3 | 2083.21 | 30.0 |
| VAN-102 | Ford Transit 250 | 1 | 2029.53 | 21.8 |
| TRK-203 | Hino 195h | 3 | 1868.21 | 39.1 |

## Regional performance
| region | vehicles | on_time_pct | deliveries |
|---|---|---|---|
| Mississauga | 10 | 86.9 | 907 |
| Downtown Toronto | 2 | 84.8 | 184 |
| Scarborough | 7 | 84.7 | 613 |
| North York | 3 | 83.5 | 279 |


_Generated automatically by report_generator.py — full extracts in reports/csv/._
