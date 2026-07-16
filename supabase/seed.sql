-- NY Trip Planner seed data. Run after schema.sql.
-- All coordinates geocoded once via Nominatim (OpenStreetMap) and hardcoded here.

insert into days (id, date, title, sort_order) values
  ('a9c6468e-8590-4952-8c9f-bc8dc5caefab', '2026-08-24', 'Llegada — Hoboken', 1),
  ('6328c005-e3ba-4389-bb97-7298ef9744f1', '2026-08-25', 'Midtown Este',       2),
  ('5fbcc536-3f8a-4f52-97df-ad6076c20d38', '2026-08-26', 'Midtown Oeste',      3),
  ('2cf61cf1-94eb-438a-b079-5b3b9baab130', '2026-08-27', 'Downtown',           4),
  ('3cc1dca1-8a98-4367-a94b-2f36db65c704', '2026-08-28', 'Brooklyn',           5),
  ('283dbc57-6cf6-4e71-aa4d-5f597aca925f', '2026-08-29', 'Ferry + NJ',         6),
  ('564c3d7c-8b74-488e-9d44-ae454faa21e9', '2026-08-30', 'Libre',              7),
  ('04b174ff-8e90-416e-9b19-7b541c9c76e4', '2026-08-31', 'Libre',              8),
  ('e3019d6e-ee25-4864-9707-49a88343fe07', '2026-09-01', 'Libre',              9);

-- Día 1: Llegada, plan suave
insert into destinations (day_id, name, category, lat, lng, notes, is_sunset_spot, sort_order) values
  ('a9c6468e-8590-4952-8c9f-bc8dc5caefab', 'Carlo''s Bakery', 'comida', 40.7371855, -74.0307861, null, false, 1),
  ('a9c6468e-8590-4952-8c9f-bc8dc5caefab', 'Pier A Park (Hoboken waterfront)', 'sunset', 40.7368753, -74.0262606, null, true, 2);

-- Día 2: Midtown Este — sin sunset spot asignado a propósito (⚠️ warning en UI)
insert into destinations (day_id, name, category, lat, lng, notes, is_sunset_spot, sort_order) values
  ('6328c005-e3ba-4389-bb97-7298ef9744f1', 'Catedral de San Patricio', 'templo', 40.7585578, -73.9763641, null, false, 1),
  ('6328c005-e3ba-4389-bb97-7298ef9744f1', 'Rockefeller Center', 'monumento', 40.7592576, -73.9799569, null, false, 2),
  ('6328c005-e3ba-4389-bb97-7298ef9744f1', 'Bryant Park', 'parque', 40.7537509, -73.9835428, null, false, 3),
  ('6328c005-e3ba-4389-bb97-7298ef9744f1', 'Times Square', 'monumento', 40.7570095, -73.9859724, null, false, 4);

-- Día 3: Midtown Oeste
insert into destinations (day_id, name, category, lat, lng, notes, is_sunset_spot, sort_order) values
  ('5fbcc536-3f8a-4f52-97df-ad6076c20d38', 'The Vessel / Hudson Yards', 'monumento', 40.7537995, -74.0020025, null, false, 1),
  ('5fbcc536-3f8a-4f52-97df-ad6076c20d38', 'The High Line', 'parque', 40.7442624, -74.0069583, null, false, 2),
  ('5fbcc536-3f8a-4f52-97df-ad6076c20d38', 'Little Island', 'sunset', 40.7420041, -74.0106105, null, true, 3);

-- Día 4: Downtown
insert into destinations (day_id, name, category, lat, lng, notes, is_sunset_spot, sort_order) values
  ('2cf61cf1-94eb-438a-b079-5b3b9baab130', 'Oculus', 'monumento', 40.7112377, -74.0109180, null, false, 1),
  ('2cf61cf1-94eb-438a-b079-5b3b9baab130', 'World Trade Center / Memorial', 'monumento', 40.7113675, -74.0132704, null, false, 2),
  ('2cf61cf1-94eb-438a-b079-5b3b9baab130', 'Chinatown', 'otro', 40.7148572, -74.0000602, null, false, 3),
  ('2cf61cf1-94eb-438a-b079-5b3b9baab130', 'Pier 35', 'sunset', 40.7095869, -73.9885388, null, true, 4);

-- Día 5: Brooklyn
insert into destinations (day_id, name, category, lat, lng, notes, is_sunset_spot, sort_order) values
  ('3cc1dca1-8a98-4367-a94b-2f36db65c704', 'Dumbo', 'otro', 40.7029052, -73.9901180, null, false, 1),
  ('3cc1dca1-8a98-4367-a94b-2f36db65c704', 'Brooklyn Bridge Park', 'parque', 40.6982888, -73.9999297, null, false, 2),
  ('3cc1dca1-8a98-4367-a94b-2f36db65c704', 'Pebble Beach', 'sunset', 40.7043829, -73.9905490, 'Cruzar de regreso a Manhattan por el Brooklyn Bridge a pie, después del atardecer', true, 3);

-- Día 6: Ferry + NJ
insert into destinations (day_id, name, category, lat, lng, notes, is_sunset_spot, sort_order) values
  ('283dbc57-6cf6-4e71-aa4d-5f597aca925f', 'Templo hindú (placeholder — corregir coordenadas)', 'templo', 40.6274541, -74.6351459, 'Coordenadas provisorias, reemplazar por el templo real', false, 1),
  ('283dbc57-6cf6-4e71-aa4d-5f597aca925f', 'Viaje en ferry', 'sunset', 40.7009643, -74.0130554, 'NY Waterway o Staten Island Ferry (gratis)', true, 2);

-- Días 30-31 ago y 1 sep quedan sin destinos asignados (holgura).
