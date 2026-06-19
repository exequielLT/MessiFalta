-- Migration to add get_user_match_history function for perfil.tsx

create or replace function public.get_user_match_history()
returns table (
    match_id bigint,
    estado text,
    created_at timestamptz,
    is_initiator boolean,
    partner_name text,
    offered_number integer,
    offered_name text,
    received_number integer,
    received_name text
)
language plpgsql
security definer
set search_path = public
as $$
begin
    return query
    select 
        m.id as match_id,
        m.estado,
        m.created_at,
        (m.user_a = auth.uid()) as is_initiator,
        case 
            when m.user_a = auth.uid() then pb.nombre
            else pa.nombre
        end as partner_name,
        case 
            when m.user_a = auth.uid() then fa.numero
            else fb.numero
        end as offered_number,
        case 
            when m.user_a = auth.uid() then fa.nombre_jugador
            else fb.nombre_jugador
        end as offered_name,
        case 
            when m.user_a = auth.uid() then fb.numero
            else fa.numero
        end as received_number,
        case 
            when m.user_a = auth.uid() then fb.nombre_jugador
            else fa.nombre_jugador
        end as received_name
    from public.matches m
    join public.figuritas fa on fa.id = m.figurita_a_id
    join public.figuritas fb on fb.id = m.figurita_b_id
    join public.profiles pa on pa.id = m.user_a
    join public.profiles pb on pb.id = m.user_b
    where m.user_a = auth.uid() or m.user_b = auth.uid()
    order by m.created_at desc;
end;
$$;

revoke all on function public.get_user_match_history() from public;
grant execute on function public.get_user_match_history() to authenticated;
