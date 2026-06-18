-- Fix profiles table to include missing columns from initial schema

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text unique,
ADD COLUMN IF NOT EXISTS nombre text;

-- Update the handle_new_user trigger to populate these new columns
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	insert into public.profiles (id, email, nombre)
	values (
		new.id,
		coalesce(new.email, ''),
		coalesce(
			new.raw_user_meta_data ->> 'nombre',
			new.raw_user_meta_data ->> 'full_name',
			new.raw_user_meta_data ->> 'name',
			split_part(coalesce(new.email, ''), '@', 1)
		)
	)
	on conflict (id) do nothing;

	return new;
end;
$$;
