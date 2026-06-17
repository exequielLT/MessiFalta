-- Kioscos base (Catamarca)
insert into public.kioscos (nombre, direccion, latitud, longitud, activo) values
  ('Kiosco Plaza Principal', 'San Martin y Rivadavia, Catamarca', -28.4696, -65.7801, true),
  ('Maxikiosco El Paseo', 'Sarmiento 600, Catamarca', -28.4680, -65.7820, true),
  ('Kiosco Universitario', 'Belgrano 300, Catamarca', -28.4650, -65.7780, true)
on conflict do nothing;
