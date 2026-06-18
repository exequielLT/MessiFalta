-- Migration to add automatic Bot matchmaking logic
-- Creates the Bot user and a trigger to mirror inserted figuritas.

-- 1. Create the Bot User in auth.users
-- This uses a fixed UUID. We use 'on conflict do nothing' so it can be re-run safely.
-- Note: 'pgcrypto' extension is already enabled in initial_schema.sql.
insert into auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'bot@figumatch.com',
  crypt('bot_very_secret_password_123', gen_salt('bf')),
  now(),
  '{"nombre": "FiguMatch Bot"}',
  now(),
  now()
) on conflict (id) do nothing;

-- 2. Trigger function to mirror user figuritas to the Bot
create or replace function public.create_bot_match_figurita()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_bot_id uuid := '00000000-0000-0000-0000-000000000000';
    v_user_faltante record;
    v_user_repetida record;
begin
    -- Prevent infinite loops: Do not trigger if the Bot is inserting
    if new.user_id = v_bot_id then
        return new;
    end if;

    if new.tipo = 'repetida' then
        -- Find if the user has at least one faltante
        select * into v_user_faltante
        from public.figuritas
        where user_id = new.user_id and tipo = 'faltante'
        limit 1;

        if found then
            -- Bot needs a faltante of the user's repetida
            if not exists (select 1 from public.figuritas where user_id = v_bot_id and numero = new.numero and tipo = 'faltante') then
                insert into public.figuritas (user_id, numero, tipo, nombre_jugador, imagen_url, seleccion)
                values (v_bot_id, new.numero, 'faltante', new.nombre_jugador, new.imagen_url, new.seleccion);
            end if;

            -- Bot needs a repetida of the user's faltante
            if not exists (select 1 from public.figuritas where user_id = v_bot_id and numero = v_user_faltante.numero and tipo = 'repetida') then
                insert into public.figuritas (user_id, numero, tipo, nombre_jugador, imagen_url, seleccion)
                values (v_bot_id, v_user_faltante.numero, 'repetida', v_user_faltante.nombre_jugador, v_user_faltante.imagen_url, v_user_faltante.seleccion);
            end if;
        end if;
        
    elsif new.tipo = 'faltante' then
        -- Find if the user has at least one repetida
        select * into v_user_repetida
        from public.figuritas
        where user_id = new.user_id and tipo = 'repetida'
        limit 1;

        if found then
            -- Bot needs a faltante of the user's repetida
            if not exists (select 1 from public.figuritas where user_id = v_bot_id and numero = v_user_repetida.numero and tipo = 'faltante') then
                insert into public.figuritas (user_id, numero, tipo, nombre_jugador, imagen_url, seleccion)
                values (v_bot_id, v_user_repetida.numero, 'faltante', v_user_repetida.nombre_jugador, v_user_repetida.imagen_url, v_user_repetida.seleccion);
            end if;
            
            -- Bot needs a repetida of the user's faltante
            if not exists (select 1 from public.figuritas where user_id = v_bot_id and numero = new.numero and tipo = 'repetida') then
                insert into public.figuritas (user_id, numero, tipo, nombre_jugador, imagen_url, seleccion)
                values (v_bot_id, new.numero, 'repetida', new.nombre_jugador, new.imagen_url, new.seleccion);
            end if;
        end if;
    end if;

    return new;
end;
$$;

-- 3. Attach trigger to figuritas
drop trigger if exists auto_bot_match_on_insert on public.figuritas;
create trigger auto_bot_match_on_insert
after insert on public.figuritas
for each row
execute procedure public.create_bot_match_figurita();
