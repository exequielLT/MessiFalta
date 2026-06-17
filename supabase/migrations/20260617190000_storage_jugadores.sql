-- Storage bucket for cached player photos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'jugadores',
  'jugadores',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read jugadores images" on storage.objects;
create policy "Public can read jugadores images"
on storage.objects
for select
to public
using (bucket_id = 'jugadores');

drop policy if exists "Authenticated users can upload jugadores images" on storage.objects;
create policy "Authenticated users can upload jugadores images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'jugadores');
