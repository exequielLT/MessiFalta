-- MVP flow fixes: kiosco hours, stable seeds, and player image storage.

alter table public.kioscos
add column if not exists horario text;

create unique index if not exists kioscos_nombre_direccion_key
on public.kioscos (nombre, direccion);

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

insert into storage.buckets (id, name, public)
values ('jugadores', 'jugadores', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can read player images" on storage.objects;
create policy "Public can read player images"
on storage.objects
for select
to public
using (bucket_id = 'jugadores');

drop policy if exists "Authenticated users can upload player images" on storage.objects;
create policy "Authenticated users can upload player images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'jugadores');
