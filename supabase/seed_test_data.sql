-- Disable auto_bot_match_on_insert trigger to keep seed data exact
ALTER TABLE public.figuritas DISABLE TRIGGER auto_bot_match_on_insert;

-- 1. CLEANUP PREVIOUS SEED DATA
DELETE FROM public.intercambios WHERE match_id IN (1001, 1002, 1003, 1004, 1005, 1006);
DELETE FROM public.matches WHERE id IN (1001, 1002, 1003, 1004, 1005, 1006);
DELETE FROM public.figuritas WHERE user_id IN ('04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555');
DELETE FROM public.profiles WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555');
DELETE FROM auth.users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555');

-- 2. INSERT TEST USERS INTO auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'test1@figumatch.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"nombre": "Juan Perez", "barrio": "Catamarca Centro"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
),
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'test2@figumatch.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"nombre": "Maria Gomez", "barrio": "Villa Cubas"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
),
(
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'test3@figumatch.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"nombre": "Carlos Rodriguez", "barrio": "La Chacarita"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
),
(
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'test4@figumatch.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"nombre": "Esteban Quito", "barrio": "La Tablada"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
),
(
  '55555555-5555-5555-5555-555555555555',
  '00000000-0000-0000-0000-000000000000',
  'test5@figumatch.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"nombre": "Ana Diaz", "barrio": "Choya"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
);

-- 3. UPDATE PROFILES FOR TEST USERS
UPDATE public.profiles SET reputacion = 4, barrio = 'Catamarca Centro' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET reputacion = 5, barrio = 'Villa Cubas' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE public.profiles SET reputacion = 3, barrio = 'La Chacarita' WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE public.profiles SET reputacion = 4, barrio = 'La Tablada' WHERE id = '44444444-4444-4444-4444-444444444444';
UPDATE public.profiles SET reputacion = 5, barrio = 'Choya' WHERE id = '55555555-5555-5555-5555-555555555555';

-- 4. INSERT FIGURITAS
INSERT INTO public.figuritas (id, user_id, numero, tipo, nombre_jugador, imagen_url, seleccion) VALUES
-- Facundo (04df5c7d-3ee0-4bff-8e14-9cd56c6b1190)
('f5070000-0000-0000-0000-000000000000', '04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', 507, 'faltante', 'Lionel Messi', null, 'Argentina'),
('f4130000-0000-0000-0000-000000000000', '04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', 413, 'faltante', 'Julian Alvarez', null, 'Argentina'),
('f4610000-0000-0000-0000-000000000000', '04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', 461, 'faltante', 'Emiliano Martinez', null, 'Argentina'),
('f0100000-0000-0000-0000-000000000000', '04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', 10, 'repetida', 'Lionel Messi', null, 'Argentina'),
('f0450000-0000-0000-0000-000000000000', '04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', 45, 'repetida', 'Emiliano Martínez', null, 'Argentina'),
('f2100000-0000-0000-0000-000000000000', '04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', 210, 'faltante', 'Kylian Mbappé', null, 'Francia'),
('f0220000-0000-0000-0000-000000000000', '04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', 22, 'repetida', 'Lautaro Martínez', null, 'Argentina'),
('f0240000-0000-0000-0000-000000000000', '04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', 24, 'repetida', 'Enzo Fernández', null, 'Argentina'),
('f0200000-0000-0000-0000-000000000000', '04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', 20, 'repetida', 'Alexis Mac Allister', null, 'Argentina'),
('f0070000-0000-0000-0000-000000000000', '04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', 7, 'faltante', 'Cristiano Ronaldo', null, 'Portugal'),
('f0110000-0000-0000-0000-000000000000', '04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', 11, 'faltante', 'Neymar Jr', null, 'Brasil'),
('f0880000-0000-0000-0000-000000000000', '04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', 88, 'faltante', 'Rodrigo De Paul', null, 'Argentina'),

-- test1 (Juan Perez)
('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 413, 'repetida', 'Julian Alvarez', null, 'Argentina'),
('b2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 10, 'faltante', 'Lionel Messi', null, 'Argentina'),
('b3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 7, 'repetida', 'Cristiano Ronaldo', null, 'Portugal'),
('b4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 9, 'faltante', 'Erling Haaland', null, 'Noruega'),
('b5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 11, 'repetida', 'Neymar Jr', null, 'Brasil'),
('b6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 88, 'faltante', 'Rodrigo De Paul', null, 'Argentina'),
('b8888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 88, 'repetida', 'Rodrigo De Paul', null, 'Argentina'),
('b0200000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 20, 'faltante', 'Alexis Mac Allister', null, 'Argentina'),

-- test2 (Maria Gomez)
('c1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 210, 'repetida', 'Kylian Mbappé', null, 'Francia'),
('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 45, 'faltante', 'Emiliano Martínez', null, 'Argentina'),
('c3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 9, 'repetida', 'Erling Haaland', null, 'Noruega'),
('c4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 7, 'faltante', 'Cristiano Ronaldo', null, 'Portugal'),
('c5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 24, 'repetida', 'Enzo Fernández', null, 'Argentina'),
('c6666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 20, 'faltante', 'Alexis Mac Allister', null, 'Argentina'),

-- test3 (Carlos Rodriguez)
('d1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 88, 'repetida', 'Rodrigo De Paul', null, 'Argentina'),
('d2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 11, 'faltante', 'Neymar Jr', null, 'Brasil'),
('d3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 20, 'repetida', 'Alexis Mac Allister', null, 'Argentina'),
('d4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 24, 'faltante', 'Enzo Fernández', null, 'Argentina'),

-- test4 (Esteban Quito)
('41111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 7, 'repetida', 'Cristiano Ronaldo', null, 'Portugal'),
('42222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 10, 'faltante', 'Lionel Messi', null, 'Argentina'),
('43333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 413, 'repetida', 'Julian Alvarez', null, 'Argentina'),
('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 22, 'faltante', 'Lautaro Martínez', null, 'Argentina'),

-- test5 (Ana Diaz)
('51111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 11, 'repetida', 'Neymar Jr', null, 'Brasil'),
('52222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 24, 'faltante', 'Enzo Fernández', null, 'Argentina'),
('53333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 507, 'repetida', 'Lionel Messi', null, 'Argentina'),
('54444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 45, 'faltante', 'Emiliano Martínez', null, 'Argentina');

-- 5. INSERT MATCHES
INSERT INTO public.matches (id, user_a, user_b, figurita_a_id, figurita_b_id, tipo, estado) VALUES
-- Match 1: test1 and test2 (Pendiente)
(1001, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'doble', 'pendiente'),
-- Match 2: test1 and test3 (Aceptado)
(1002, '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'b5555555-5555-5555-5555-555555555555', 'd1111111-1111-1111-1111-111111111111', 'doble', 'aceptado'),
-- Match 3: test2 and test3 (Completado)
(1003, '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'c5555555-5555-5555-5555-555555555555', 'd3333333-3333-3333-3333-333333333333', 'doble', 'completado'),
-- Match 4: fquiroga122 and test4 (Pendiente)
(1004, '04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', '44444444-4444-4444-4444-444444444444', 'f0100000-0000-0000-0000-000000000000', '41111111-1111-1111-1111-111111111111', 'doble', 'pendiente'),
-- Match 5: fquiroga122 and test5 (Aceptado)
(1005, '04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', '55555555-5555-5555-5555-555555555555', 'f0240000-0000-0000-0000-000000000000', '51111111-1111-1111-1111-111111111111', 'doble', 'aceptado'),
-- Match 6: fquiroga122 and test1 (Completado)
(1006, '04df5c7d-3ee0-4bff-8e14-9cd56c6b1190', '11111111-1111-1111-1111-111111111111', 'f0200000-0000-0000-0000-000000000000', 'b8888888-8888-8888-8888-888888888888', 'doble', 'completado');

-- 6. INSERT INTERCAMBIOS
INSERT INTO public.intercambios (id, match_id, kiosco_id, codigo, estado, fecha_expiracion) VALUES
-- Exchange 1: Active exchange for Match 2 in Kiosco La Esquina (id: 2)
(2001, 1002, 2, 'FIG-4829-K2', 'pendiente', now() + interval '7 days'),
-- Exchange 2: Completed exchange for Match 3 in Kiosco Plaza (id: 3)
(2002, 1003, 3, 'FIG-1029-K3', 'retirado', now() - interval '1 days'),
-- Exchange 3: Active exchange for Match 5 (fquiroga122 & test5) in Kiosco Plaza (id: 3)
(2003, 1005, 3, 'FIG-9281-K3', 'pendiente', now() + interval '7 days'),
-- Exchange 4: Completed exchange for Match 6 (fquiroga122 & test1) in Kiosco La Esquina (id: 2)
(2004, 1006, 2, 'FIG-5731-K2', 'retirado', now() - interval '2 days');

-- 7. CORRECT SEQUENCES
SELECT setval('public.matches_id_seq', coalesce((SELECT max(id)+1 FROM public.matches), 1), false);
SELECT setval('public.intercambios_id_seq', coalesce((SELECT max(id)+1 FROM public.intercambios), 1), false);

-- Re-enable triggers
ALTER TABLE public.figuritas ENABLE TRIGGER auto_bot_match_on_insert;
