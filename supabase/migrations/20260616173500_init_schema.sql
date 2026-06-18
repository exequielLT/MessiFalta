-- 1. Tabla Perfiles (vinculada a auth.users)
CREATE TABLE public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  nombre text not null,
  barrio text,
  reputacion integer default 0,
  created_at timestamptz default now()
);

-- 2. Tabla Figuritas
CREATE TABLE public.figuritas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  numero integer not null check (numero between 1 and 678),
  tipo text not null check (tipo in ('repetida', 'faltante')),
  nombre_jugador text,
  imagen_url text,
  seleccion text,
  created_at timestamptz default now()
);

-- 3. Tabla Matches
CREATE TABLE public.matches (
  id uuid default gen_random_uuid() primary key,
  user1_id uuid references public.profiles(id) on delete cascade not null,
  user2_id uuid references public.profiles(id) on delete cascade not null,
  fig1_id uuid references public.figuritas(id) on delete cascade not null,
  fig2_id uuid references public.figuritas(id) on delete cascade not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aceptado', 'rechazado', 'completado')),
  created_at timestamptz default now()
);

-- 4. Tabla Kioscos
CREATE TABLE public.kioscos (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  direccion text not null,
  lat double precision not null,
  lng double precision not null,
  horario text not null,
  created_at timestamptz default now()
);

-- 5. Tabla Intercambios
CREATE TABLE public.intercambios (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches(id) on delete cascade not null,
  codigo text not null unique, -- Formato FIG-XXXX-KX
  kiosco_id uuid references public.kioscos(id) on delete cascade not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'entregado', 'retirado')),
  fecha_entrega timestamptz,
  fecha_retiro timestamptz,
  created_at timestamptz default now()
);

-- Función para manejar usuarios nuevos
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger atado a auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Permite buscar coincidencias en figuritas de otros usuarios sin exponer quiénes son
DROP FUNCTION IF EXISTS public.get_anonymous_figuritas();
CREATE OR REPLACE FUNCTION public.get_anonymous_figuritas()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  numero integer,
  tipo text,
  nombre_jugador text,
  seleccion text
) AS $$
BEGIN
  RETURN QUERY
  SELECT f.id, f.user_id, f.numero, f.tipo, f.nombre_jugador, f.seleccion
  FROM public.figuritas f
  WHERE f.user_id != auth.uid() OR auth.uid() IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figuritas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kioscos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intercambios ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
CREATE POLICY "Perfiles públicos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "El usuario puede actualizar su propio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para Figuritas
CREATE POLICY "Los usuarios pueden ver y gestionar solo sus figuritas" 
  ON public.figuritas FOR ALL USING (auth.uid() = user_id);

-- Políticas para Matches
CREATE POLICY "Los usuarios ven matches donde participan" 
  ON public.matches FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Los usuarios pueden insertar/actualizar sus matches"
  ON public.matches FOR ALL USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Políticas para Kioscos
CREATE POLICY "Kioscos lectura pública" ON public.kioscos FOR SELECT USING (true);

-- Políticas para Intercambios
CREATE POLICY "Los usuarios ven intercambios de sus matches" 
  ON public.intercambios FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE m.id = match_id AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );
CREATE POLICY "Los usuarios pueden crear/actualizar sus intercambios" 
  ON public.intercambios FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE m.id = match_id AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );
