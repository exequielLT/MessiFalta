-- Kioscos base (Catamarca)
insert into public.kioscos (nombre, direccion, latitud, longitud, horario, activo)
values
  ('Kiosco San Cayetano', 'Av. Belgrano 450, San Fernando del Valle', -28.4680, -65.7820, '8 a 20 h', true),
  ('Kiosco La Esquina', 'Rivadavia 1200, San Fernando del Valle', -28.4700, -65.7880, '9 a 21 h', true),
  ('Kiosco Plaza', 'Sarmiento 300, San Fernando del Valle', -28.4650, -65.7800, '7 a 19 h', true)
on conflict (nombre, direccion) do update
set
  latitud = excluded.latitud,
  longitud = excluded.longitud,
  horario = excluded.horario,
  activo = excluded.activo;
