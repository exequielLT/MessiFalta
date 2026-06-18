-- Migration to add match-making logic RPCs

-- 1. find_potential_matches: Finds cross matches between current user and others
create or replace function public.find_potential_matches()
returns table (
	id text,
	user_name text,
	avatar_url text,
	reputation integer,
	trades_count integer,
	offered_number integer,
	offered_name text,
	offered_image_url text,
	requested_number integer,
	requested_name text,
	requested_image_url text,
	distance text,
	kiosco_id bigint,
	kiosco_nombre text,
	kiosco_direccion text,
	barrio text,
    figurita_mia_id bigint,
    figurita_ajena_id bigint
)
language sql
security definer
set search_path = public
as $$
	select 
		'pot_' || f_mia_rep.id || '_' || f_ajena_rep.id as id,
		p.nombre as user_name,
		'https://ui-avatars.com/api/?name=' || replace(p.nombre, ' ', '+') as avatar_url,
		p.reputacion as reputation,
		0 as trades_count,
		f_ajena_rep.numero as offered_number,
		f_ajena_rep.nombre_jugador as offered_name,
		f_ajena_rep.imagen_url as offered_image_url,
		f_mia_rep.numero as requested_number,
		f_mia_rep.nombre_jugador as requested_name,
		f_mia_rep.imagen_url as requested_image_url,
		'Kiosco a calcular' as distance,
		1 as kiosco_id,
		'Kiosco por asignar' as kiosco_nombre,
		'Dirección pendiente' as kiosco_direccion,
		'Barrio pendiente' as barrio,
        f_mia_rep.id as figurita_mia_id,
        f_ajena_rep.id as figurita_ajena_id
	from public.figuritas f_mia_rep
	join public.figuritas f_ajena_fal on f_ajena_fal.numero = f_mia_rep.numero
	join public.figuritas f_mia_fal on 1=1
	join public.figuritas f_ajena_rep on f_ajena_rep.numero = f_mia_fal.numero and f_ajena_rep.user_id = f_ajena_fal.user_id
	join public.profiles p on p.id = f_ajena_rep.user_id
	where f_mia_rep.user_id = auth.uid() 
      and f_mia_rep.tipo = 'repetida'
	  and f_ajena_fal.tipo = 'faltante'
	  and f_mia_fal.user_id = auth.uid()
	  and f_mia_fal.tipo = 'faltante'
	  and f_ajena_rep.tipo = 'repetida'
      and f_mia_rep.user_id <> f_ajena_rep.user_id;
$$;

revoke all on function public.find_potential_matches() from public;
grant execute on function public.find_potential_matches() to authenticated;


-- 2. create_match_request: Safely inserts into matches table
create or replace function public.create_match_request(p_figurita_mia_id bigint, p_figurita_ajena_id bigint)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
	v_user_b uuid;
	v_match_id bigint;
begin
	-- Get the owner of the other figurita safely
	select user_id into v_user_b
	from public.figuritas
	where id = p_figurita_ajena_id;

	if v_user_b is null then
		raise exception 'Figurita ajena no encontrada';
	end if;

	-- Insert into matches
	insert into public.matches (user_a, user_b, figurita_a_id, figurita_b_id, tipo, estado)
	values (auth.uid(), v_user_b, p_figurita_mia_id, p_figurita_ajena_id, 'doble', 'pendiente')
	returning id into v_match_id;

	return v_match_id;
end;
$$;

revoke all on function public.create_match_request(bigint, bigint) from public;
grant execute on function public.create_match_request(bigint, bigint) to authenticated;
