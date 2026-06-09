# FiguMatch – Especificación del MVP (TP4)

## Problema
Coleccionistas del Mundial 2026 necesitan intercambiar figuritas de forma segura, sin encuentros con extraños ni coordinación caótica.

## Propuesta de valor
Intercambiá figuritas sin miedo: llevá tus duplicadas a un kiosco adherido, retirá las que te faltan. Seguridad, cercanía y garantía digital.

## Alcance del MVP
Camino crítico: **Registro/Login** → Agregar figuritas (con datos de api-football) → Buscar coincidencias → Aceptar canje → Código de intercambio → Ver kiosco en mapa.

### Funcionalidades incluidas
- **Autenticación con Supabase Auth:**
  - Registro con email/contraseña (nombre, email, contraseña, repetir contraseña).
  - Login con email/contraseña.
  - Login con Google OAuth.
  - Recuperación de contraseña (envío de enlace mágico por email).
  - Persistencia de sesión (almacenada en AsyncStorage mediante cliente Supabase).
  - Cierre de sesión desde la pantalla de Perfil.
- **Base de datos Supabase:** tablas `profiles`, `figuritas`, `matches`, `kioscos`, `intercambios`.
- **Trigger SQL** para crear automáticamente el perfil del usuario al registrarse (evita lógica extra en la app).
- **Onboarding** de 3 slides (primer inicio, previo al login).
- **CRUD de figuritas** (número, tipo: repetida/faltante, nombre opcional) sincronizado con Supabase.
- **API externa api-football.com:** búsqueda del nombre del jugador al ingresar el número de figurita (con mapeo local previo). Manejo de estados: carga, éxito, error, sin resultados.
- **Match simulado:** cruza figuritas del usuario con otros usuarios reales en la BD. Si no hay suficientes coincidencias, se complementa con datos dummy precargados.
- **Detalle de match y aceptación** con generación de código único (UUID), asignación de kiosco aleatorio y registro en tabla `intercambios`.
- **Pantalla de código** con QR e instrucciones.
- **Mapa de kioscos** con marcadores estáticos obtenidos de la tabla `kioscos`.
- **Perfil** con datos reales (nombre, barrio, reputación calculada de intercambios) y botón de logout.
- **Manejo de estados de interfaz:** carga, vacío, error, sin conexión, sesión expirada.

### Funcionalidades excluidas (futuras)
- Escaneo por IA, cadenas de trueque de más de dos personas, chat, notificaciones push, verificación de email en registro, roles de kiosquero.

## Stack tecnológico
- **Framework:** React Native con Expo (managed workflow)
- **Lenguaje:** TypeScript
- **Backend/BD:** Supabase (PostgreSQL + Auth + API)
- **Navegación:** React Navigation (Auth Stack + Bottom Tabs + Stacks internos)
- **Estado:** React Context + useReducer (AuthContext, FiguritasContext)
- **Persistencia local:** AsyncStorage (para sesión de Supabase y cachés)
- **Mapas:** react-native-maps
- **API externa:** api-football.com (endpoint: `/players?season=2026&league=1&search=NAME`)
- **Estilos:** StyleSheet nativo + tema constante

## Estructura del proyecto
/FiguMatch
/src
/components → Button, Input, CardFigurita, CardMatch, StatusScreen, etc.
/screens → Login, Register, ForgotPassword, Home, AddFigurita, Matches, MatchDetail, Code, Map, Profile, Onboarding
/navigation → AuthStack, MainTabs, RootNavigator
/context → AuthContext, FiguritasContext
/services → api.ts (api-football), supabase.ts (cliente), matches.ts (cruce y dummy)
/constants → theme.ts, dummyData.ts, playerMapping.ts
/utils → helpers (validación, generación de código)
App.tsx → Entry point con AuthProvider

## Flujo de autenticación
1. **Inicio:** Splash screen mientras se verifica sesión con `supabase.auth.getSession()`.
   - Si hay sesión → `MainTabs` (Home).
   - Si no hay sesión → ¿Primer inicio? (`AsyncStorage`) → `Onboarding` (3 slides) → `Login`. Caso contrario, directo a `Login`.
2. **Login:**
   - Email/contraseña → `signInWithPassword`. Si error "Invalid login credentials" → mostrar "Email o contraseña incorrectos." y sugerir registro. Si error de red, mensaje de reconexión.
   - "Continuar con Google" → `signInWithOAuth({ provider: 'google' })`. Si es nuevo usuario, trigger SQL crea perfil automáticamente.
   - Link "¿Olvidaste tu contraseña?" → `ForgotPassword`.
   - Link "¿No tenés cuenta? Registrate" → `Register`.
3. **Registro:**
   - Validación local: nombre obligatorio, email válido, contraseña ≥6 caracteres, coincidencia de repetir contraseña.
   - Llamada a `signUp` con `options.data.name`. Si éxito, trigger crea perfil; si `User already registered`, mostrar mensaje "Ya existe una cuenta con este email. ¿Querés iniciar sesión?" con enlace a Login (pre-rellenando email).
   - También disponible "Continuar con Google" (mismo flujo que Login).
4. **Recuperación de contraseña:**
   - Ingreso de email → `resetPasswordForEmail`. Éxito: "Revisá tu correo electrónico." Error: mensaje genérico con opción de reintentar. Botón "Volver al inicio de sesión".
5. **Logout:** En Perfil, botón "Cerrar sesión" → `signOut()`, limpiar AsyncStorage, redirigir a `Login`.

## Base de datos Supabase
Tablas:
- `profiles` (id, email, nombre, barrio, reputacion)
- `figuritas` (id, user_id FK, numero, tipo, nombre_jugador)
- `matches` (id, user1_id FK, user2_id FK, fig1_id FK, fig2_id FK, estado)
- `kioscos` (id, nombre, direccion, lat, lng, horario)
- `intercambios` (id, match_id FK, codigo, kiosco_id FK, estado, fecha_entrega, fecha_retiro)

Trigger:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'name', 'Usuario'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

Políticas RLS: perfiles (SELECT público, INSERT/UPDATE dueño), figuritas solo dueño, matches visibles a participantes, kioscos lectura pública.

API Football
Justificación: API REST real de fútbol, plan gratuito 100 req/día, datos actualizados del Mundial 2026. Alternativas evaluadas: TheSportsDB (menos robusta), datos locales (no cumplen consigna).

Uso: Al ingresar número de figurita, se busca en mapeo local (playerMapping.ts) y luego en API. Estados: carga (spinner), éxito (autocompletado), error/fallo (mensaje con reintento, se permite guardar sin nombre).

Seguridad: clave en variable de entorno EXPO_PUBLIC_API_FOOTBALL_KEY.

Cómo ejecutar
Clonar repo, npm install

Crear proyecto en Supabase, ejecutar migraciones SQL

Configurar .env con:

EXPO_PUBLIC_SUPABASE_URL

EXPO_PUBLIC_SUPABASE_ANON_KEY

EXPO_PUBLIC_API_FOOTBALL_KEY

npx expo start y escanear QR con Expo Go

Integrantes
Tapia Lautaro (Tech Lead, revisor de PR)

Graciela (lógica compleja, auth, API, BD)

Facundo (frontend, navegación, pantallas)


---

## AGENT.MD (Actualizado)

```markdown
# 🤖 FiguMatch – Agent Instructions (v3 con Auth y API)

## 🧩 Proyecto
**FiguMatch** es una app móvil para intercambiar figuritas del Mundial 2026 usando kioscos como buzones seguros.
MVP con autenticación Supabase (email/pass, Google OAuth, recuperación), base de datos real y API externa de fútbol.

## 👥 Equipo
- **Tapia Lautaro** – Tech Lead, único revisor/mergeador de PRs. Frontend intermedio.
- **Graciela** – Backend & lógica compleja: AuthContext, servicio Supabase, API Football, matches, triggers SQL.
- **Facundo** – Frontend general: navegación, pantallas principales, perfil, README, demo.

## 📚 Stack
- **Lenguaje:** TypeScript (strict mode)
- **Framework:** React Native con Expo (managed workflow, SDK 52+)
- **Backend/BD:** Supabase (PostgreSQL + Auth + REST API)
- **Navegación:** React Navigation v6
  - `RootNavigator` → condicional según sesión
  - `AuthStack` (Login, Register, ForgotPassword)
  - `MainTabs` (Figuritas, Matches, Kioscos, Perfil)
- **Estado:** React Context + useReducer
  - `AuthContext`: session, user, loading, signIn, signUp, signInWithGoogle, signOut, resetPassword
  - `FiguritasContext`: lista de figuritas, CRUD, sincronización con Supabase
- **Persistencia:** AsyncStorage (usado internamente por el cliente Supabase para sesión)
- **Mapas:** react-native-maps (3 marcadores fijos desde tabla `kioscos`)
- **API externa:** api-football.com
- **Estilos:** StyleSheet nativo, tema centralizado en `constants/theme.ts`

## 🗂️ Estructura del proyecto
/src
/components → Button, Input (con variantes), CardFigurita, CardMatch, StatusScreen
/screens → LoginScreen, RegisterScreen, ForgotPasswordScreen, HomeScreen, AddFiguritaScreen,
MatchesScreen, MatchDetailScreen, CodeScreen, MapScreen, ProfileScreen, OnboardingScreen
/navigation → AuthStack, MainTabs, RootNavigator
/context → AuthContext.tsx, FiguritasContext.tsx
/services → api.ts (cliente axios/fetch para api-football), supabase.ts (cliente Supabase),
matches.ts (cruce de figuritas + datos dummy)
/constants → theme.ts, playerMapping.ts, dummyMatches.ts, kioscosData.ts
/utils → validateEmail.ts, validatePassword.ts, generateCode.ts
App.tsx → Providers (AuthProvider), RootNavigator

## 🔐 Autenticación (reglas)
- **Siempre** usar los métodos del `AuthContext`. No llamar a `supabase.auth` directamente desde componentes.
- **Login email/contraseña:** validar campos no vacíos. Manejar error `Invalid login credentials` con mensaje "Email o contraseña incorrectos. Si no tenés cuenta, registrate." No revelar si el email existe.
- **Registro:** validar nombre, email (regex), contraseña (≥6), repetir contraseña exacta. Si `User already registered`, mostrar "Ya existe una cuenta. ¿Iniciar sesión?" con botón que navegue a Login con email pre-rellenado.
- **Google OAuth:** usar `signInWithOAuth({ provider: 'google' })`. El trigger `handle_new_user` en Supabase crea el perfil automáticamente. Si falla por cancelación del usuario, no mostrar error.
- **Recuperación:** `resetPasswordForEmail`. Éxito: "Revisá tu correo." Error: "No pudimos enviar el enlace. Verificá el email."
- **Persistencia:** el cliente Supabase con `persistSession: true` y `storage: AsyncStorage` mantiene la sesión. Al iniciar la app, `getSession()` restaura.
- **Logout:** `signOut()` y redirigir a `Login`.

## 🗃️ Supabase (reglas)
- Usar el cliente exportado desde `services/supabase.ts`.
- Las consultas a `figuritas` siempre filtradas por `user_id = auth.uid()` (RLS lo asegura, pero igual aplicarlas).
- Tablas:
  - `profiles`: leer `*`, actualizar solo `nombre` y `barrio` desde Perfil.
  - `figuritas`: CRUD completo, siempre con `user_id`.
  - `matches`: insertar al generar match; leer con filtro de participantes.
  - `intercambios`: insertar al aceptar match; leer para historial.
  - `kioscos`: solo lectura.
- Al crear un match, verificar que no exista ya uno pendiente entre los mismos usuarios con las mismas figuritas.
- Al aceptar un match, generar código único (UUID corto), asignar kiosco aleatorio (`kioscos` table) y cambiar estado del match a "aceptado".

## 🌐 API Football (reglas)
- **Endpoint:** `GET https://v3.football.api-sports.io/players?season=2026&league=1&search={nombre}`
- **API Key:** `EXPO_PUBLIC_API_FOOTBALL_KEY`. No exponer en código ni commits.
- **Flujo:**
  1. Usuario ingresa número de figurita.
  2. Se busca en `playerMapping.ts` un nombre asociado (ej: 47 → "Messi").
  3. Si hay mapeo, se llama a la API con ese nombre.
  4. Estados:
     - **Carga:** mostrar `ActivityIndicator` pequeño junto al campo "Nombre del jugador".
     - **Éxito:** autocompletar el campo con `response.response[0].player.name`.
     - **Vacío:** si la API responde sin resultados, dejar el campo vacío y permitir guardar manualmente.
     - **Error:** mostrar mensaje "No se pudo obtener el nombre. ¿Reintentar?" con botón.
  5. Si la API falla, se permite guardar la figurita sin nombre.
- **Rate limit:** si la API devuelve 429, mostrar mensaje amigable y esperar 1 minuto antes de reintentar.
- **Offline:** si no hay conexión, guardar sin nombre y marcar para sincronización futura (no obligatorio en MVP).

## 🧭 Navegación
- `RootNavigator`: si `loading` → splash/spinner. Si `session` → `MainTabs`. Sino → `AuthStack`.
- `AuthStack`: Login, Register, ForgotPassword. Sin header.
- `MainTabs`: 4 tabs (Figuritas, Matches, Kioscos, Perfil). Íconos con SF Symbols o MaterialIcons.
- Dentro de "Figuritas": Stack con Home y AddFigurita.
- Dentro de "Matches": Stack con MatchesList, MatchDetail, Code.
- Al mostrar Code o MatchDetail, ocultar la tab bar (`tabBarStyle: { display: 'none' }`).

## ✅ Git workflow (recordatorio)
- **Solo Tapia Lautaro aprueba y mergea PRs.**
- Ramas: `main`, `develop`, `feature/*`, `fix/*`, `chore/*`, `docs/*`.
- Commits convencionales.
- No commitear `.env`, `node_modules`, `.expo`.

## 🧪 Pruebas manuales esenciales
1. **Auth:** registro → logout → login → recuperación → login con Google.
2. **Camino feliz:** login → agregar 2 figuritas (con API) → buscar matches → aceptar → ver código → abrir mapa.
3. **API Football:** agregar figurita con número mapeado → ver spinner → nombre autocompletado. Sin conexión → error controlado.
4. **Estados vacíos:** sin figuritas → mensaje. Sin matches → mensaje con botón "Invitar amigos".
5. **Estados de error:** desconectar internet → login (error de red), buscar matches (error).

## 📄 Documentación
- `README.md`: descripción, stack, ejecución, variables de entorno, capturas.
- `spec.md`: alcance, BD, justificación API.
- `GIT_WORKFLOW.md`: reglas de ramas y PRs.
- `AGENT.md`: este archivo (instrucciones para IA).
