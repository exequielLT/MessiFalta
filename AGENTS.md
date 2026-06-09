# 🤖 FiguMatch – Agent Instructions (v2 con Supabase y API Football)

## 🧩 Proyecto
**FiguMatch** es una app móvil para intercambiar figuritas del Mundial 2026 usando kioscos como buzones seguros.
MVP con autenticación Supabase, base de datos real y API externa de fútbol.

## 👥 Equipo
- **Tapia Lautaro** – Tech Lead, revisor, frontend intermedio.
- **Graciela** – Backend & lógica compleja: Auth, Supabase, API Football, matches, estado global.
- **Facundo** – Frontend general: navegación, pantallas principales, perfil, README, demo.

## 📚 Stack
- **Lenguaje:** TypeScript (strict mode)
- **Framework:** React Native con Expo (managed workflow, SDK 52+)
- **Backend/BD:** Supabase (PostgreSQL + Auth)
- **Navegación:** React Navigation v6 (Auth Stack + Bottom Tabs + Stacks internos)
- **Estado:** React Context + useReducer (AuthContext, FiguritasContext)
- **Persistencia:** AsyncStorage (sesión, caché)
- **Mapas:** react-native-maps (con Expo)
- **API externa:**  (plan gratuito 100 req/día)
- **Estilos:** StyleSheet nativo, tema en `src/constants/theme.ts`

## 🗂️ Estructura del proyecto
/FiguMatch
/src
/components → Button, Input, CardFigurita, CardMatch, StatusScreen
/screens → Login, Register, Home, AddFigurita, Matches, MatchDetail, Code, Map, Profile, Onboarding
/navigation → AuthStack (Login/Register), MainTabs (Home, Matches, Kioscos, Profile)
/context → AuthContext (login/register/logout/session), FiguritasContext (CRUD, sync Supabase)
/services → api.ts (api-football), supabase.ts (cliente CRUD), matches.ts (cruce)
/constants → theme.ts (colores, tipografía, espaciados), dummyData.ts (mapeo número→jugador, kioscos)
/utils → helpers (validación, generación de código)
App.tsx → Providers, navegación raíz condicional

## 🔐 Autenticación con Supabase
- **Registro:** `supabase.auth.signUp()` + insert en tabla `profiles`.
- **Login:** `supabase.auth.signInWithPassword()`. Persistir sesión en AsyncStorage.
- **Logout:** `supabase.auth.signOut()`. Limpiar AsyncStorage.
- **Sesión:** al iniciar la app, `supabase.auth.getSession()` para restaurar.
- **Contexto:** `AuthContext` expone `user`, `session`, `login`, `register`, `logout`, `loading`.
- **Políticas RLS:** cada tabla tiene RLS habilitado. `figuritas` solo accesible por `user_id = auth.uid()`.

## 🗃️ Base de datos Supabase
- **Tablas:** `profiles`, `figuritas`, `matches`, `kioscos`, `intercambios`.
- **Operaciones:** todas las consultas usan el cliente `supabase` desde `services/supabase.ts`.
- **Matches:** se generan cruzando `figuritas` del usuario con otras `figuritas` donde `user_id` es distinto y `tipo` complementario (repetida ↔ faltante).
- **Intercambios:** al aceptar un match, se crea registro con código único (UUID), kiosco asignado (aleatorio entre los disponibles) y estado "pendiente_entrega".

## 🌐 API Football – Reglas de uso
- **Endpoint:** `GET https://v3.football.api-sports.io/players?season=2026&league=1&search={nombre}`
- **API Key:** almacenada en `EXPO_PUBLIC_API_FOOTBALL_KEY`. Nunca se commitea.
- **Cuándo se llama:** solo en la pantalla `AddFigurita`, después de que el usuario ingresa un número de figurita.
- **Mapeo previo:** la app tiene un archivo local `constants/playerMapping.ts` que asocia número de figurita → nombre aproximado (ej: `47: "Messi"`). Si el número está en el mapeo, se busca ese nombre en la API.
- **Estados obligatorios:**
  - **Carga:** spinner pequeño junto al campo "Nombre del jugador".
  - **Éxito:** se autocompleta el campo con `player.name`.
  - **Vacío:** si la API responde pero no encuentra jugador, mostrar "Jugador no encontrado".
  - **Error:** mensaje "No se pudo obtener el nombre. ¿Reintentar?" con botón de reintento.
- **Offline:** si no hay conexión, se permite guardar la figurita sin nombre y se programa un reintento cuando se detecte conexión (NetInfo).
- **Manejo de rate limit:** si la API devuelve 429, mostrar mensaje amigable y esperar 1 minuto antes de reintentar.

## 🎨 Convenciones de código
- TypeScript estricto, evitar `any`.
- Interfaces al inicio del archivo o en `types.ts`.
- Componentes funcionales con hooks.
- Estilos en `StyleSheet.create()` al final.
- Colores y tipografía desde `theme.ts`.
- No logs en producción (`console.debug` solo en desarrollo).
- Manejar errores con try-catch y estados de UI.

## 🧠 Componentes principales
- **Button:** variantes `primary`, `secondary`, `danger`. Props: `title`, `onPress`, `loading?`, `disabled?`.
- **Input:** variantes `default`, `error`. Props: `label`, `value`, `onChangeText`, `errorMessage?`, `loading?`.
- **CardFigurita:** `type: 'repetida' | 'faltante'`, `number`, `playerName?`.
- **CardMatch:** `name`, `reputation`, `offeredFigurita`, `requestedFigurita`, `distance?`.
- **StatusScreen:** `type: 'loading' | 'empty' | 'error'`, `title`, `description?`, `actionLabel?`, `onAction?`.

## 🧭 Navegación
- `AuthStack`: Login, Register.
- `MainTabs`: Figuritas, Matches, Kioscos, Perfil.
- Dentro de Figuritas: Stack con Home, AddFigurita.
- Dentro de Matches: Stack con MatchList, MatchDetail, Code.
- Al mostrar Code, ocultar tab bar.

## ✅ Git workflow
- Solo Tapia Lautaro aprueba y mergea PRs.
- Ramas: `main`, `develop`, `feature/*`, `fix/*`, `chore/*`, `docs/*`.
- Commits convencionales: `feat:`, `fix:`, `chore:`, `docs:`, `style:`.
- PR hacia `develop`, revisor obligatorio: Tapia Lautaro.

## 🧪 Pruebas manuales (checklist)
1. **Auth:** registro → login → logout → relogin (sesión persiste).
2. **Camino feliz:** login → agregar 2 figuritas (con API) → buscar matches → aceptar → ver código → mapa.
3. **API Football:** agregar figurita con número del mapeo → ver spinner → nombre autocompletado.
4. **API Football error:** desconectar internet → agregar figurita → ver error → reintentar.
5. **Sin figuritas:** pantalla vacía con CTA.
6. **Navegación:** moverse entre tabs, ir a detalle, volver, abrir mapa desde código.

## 📄 Documentación
- `README.md`: descripción, stack, ejecución, variables de entorno, capturas.
- `SPEC.md`: alcance, justificación de API.
- `GIT_WORKFLOW.md`: reglas de ramas y PRs.
- `AGENT.md`: este archivo.

## 🤝 Reglas para IAs
Si eres una IA ayudando en este proyecto:
- Respeta el alcance del MVP.
- No expongas la API key.
- Siempre usa los componentes reutilizables definidos.
- Sigue las convenciones de código.
- Ante cualquier integración con Supabase o api-football, contempla estados de carga, error y vacío.
