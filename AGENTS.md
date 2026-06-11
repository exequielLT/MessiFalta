
---

## AGENT.md

```markdown
# 🤖 FiguMatch – Agent Instructions (vFinal)

## 🧩 Proyecto
**FiguMatch** es una app móvil para intercambiar figuritas del Mundial 2026 usando kioscos como buzones seguros.
MVP con autenticación Supabase, base de datos real, almacenamiento de imágenes y API externa de fútbol.

## 👥 Equipo y reparto
- **Tapia Lautaro** – Tech Lead, único revisor/mergeador de PRs. Dueño de las pantallas: Agregar Figurita, Código de Intercambio, Mapa de Kioscos. También creó el proyecto, los componentes base y el tema visual.
- **Graciela** – Dueña de toda la lógica de autenticación, la API de fútbol y el almacenamiento de imágenes. Pantallas: Inicio de Sesión, Registro, Recuperar Contraseña, Cambiar Contraseña, Detalle de Match. También prepara la demo.
- **Facundo** – Dueño de la navegación y las pantallas: Figuritas, Coincidencias, Perfil, Bienvenida. También escribe la documentación.

## 📚 Stack
- **Lenguaje:** TypeScript (strict mode)
- **Framework:** React Native con Expo (managed workflow, SDK 52+)
- **Backend/BD:** Supabase (PostgreSQL + Auth + Storage)
- **Herramientas:** MCP de Supabase para gestión de base de datos, autenticación y storage.
- **Navegación:** React Navigation v6 (RootStack modal + AuthStack + BottomTabs)
- **Estado global:** AuthContext (React Context + useReducer)
- **Estado local:** useState en pantallas
- **Persistencia:** AsyncStorage (sesión, flag de onboarding)
- **Mapas:** react-native-maps
- **QR:** react-native-qrcode-svg
- **API externa:** api-football.com
- **Estilos:** StyleSheet nativo, tema en `constants/theme.ts`

## 🗂️ Estructura del proyecto/FiguMatch
├── App.tsx
├── assets/
│ └── banderas/ (32 íconos de selecciones)
├── src/
│ ├── components/ (Button, Input, CardFigurita, CardMatch, StatusScreen)
│ ├── screens/ (Login, Register, ForgotPassword, UpdatePassword,
│ │ Home, AddFigurita, Matches, MatchDetail, Code, Map, Profile, Onboarding)
│ ├── navigation/ (RootNavigator, AuthStack, MainTabs)
│ ├── context/ (AuthContext)
│ ├── services/ (supabase, api, figuritasService, matchesService, tradeService, kioscosService, storageService)
│ ├── constants/ (theme, playerMapping, dummyMatches)
│ └── utils/ (helpers)

## 🔐 Autenticación (reglas finales)
- **Siempre** usar métodos de `AuthContext`. No llamar a `supabase.auth` directamente desde componentes.
- **Onboarding:** mostrar solo si el flag `@onboarding_completed` no existe en AsyncStorage. Después del primer login exitoso, el flag se marca. Al hacer logout, se limpia el flag.
- **Login email/contraseña:** validar campos no vacíos. Error `Invalid login credentials` → "Email o contraseña incorrectos". No revelar si el email existe.
- **Registro:** validar nombre, email (regex), contraseña (≥6), coincidencia. Si `User already registered` → "Ya existe una cuenta. ¿Iniciar sesión?" con botón que lleve a Login con email pre-rellenado.
- **Google OAuth:** usar `signInWithOAuth({ provider: 'google' })`. El trigger `handle_new_user` crea el perfil. Si el usuario cancela, no mostrar error.
- **Recuperación:** `resetPasswordForEmail`. La pantalla de cambio de contraseña captura el token vía deep link o permite pegarlo manualmente. Éxito → "Contraseña actualizada" y volver a Login.
- **Logout:** `signOut()`, limpiar AsyncStorage (incluyendo flag de onboarding), redirigir a Login.

## 🗃️ Supabase (reglas)
- Usar el cliente desde `services/supabase.ts`.
- **Tablas:** `profiles`, `figuritas`, `matches`, `kioscos`, `intercambios`.
- **Trigger:** `handle_new_user` crea perfil automáticamente al registrarse.
- **Función especial:** `get_anonymous_figuritas` (SECURITY DEFINER) para obtener figuritas de otros usuarios sin exponer `user_id`.
- **RLS:** cada usuario solo ve sus propias figuritas. Los matches se generan con datos anónimos.
- **Storage:** bucket `jugadores` para fotos. Lectura pública, escritura autenticada. Nombre de archivo: `{numero}-{nombre_sanitizado}.png`. Si la imagen ya existe, no se reemplaza.

## 🌐 API Football (reglas)
- **Endpoint:** `GET https://v3.football.api-sports.io/players?season=2026&league=1&search={nombre}`
- **API Key:** `EXPO_PUBLIC_API_FOOTBALL_KEY`. No commiteada.
- **Datos utilizados:** `player.name` (nombre oficial) y `player.photo` (imagen cacheada en Supabase Storage).
- **Datos NO utilizados:** selección, dorsal, logo de selección (vienen del mapeo local).
- **Flujo en `AddFiguritaScreen`:**
  1. Usuario ingresa número. Debounce de 800ms.
  2. Si el número está en `playerMapping.ts`, se usa el nombre mapeado para llamar a `searchPlayer(nombre)`.
  3. Si la API devuelve foto, se descarga y se sube a Supabase Storage.
  4. Estados:
     - **Carga:** `ActivityIndicator` a la derecha del campo nombre.
     - **Éxito:** autocompletar con `player.name`, mostrar check verde 2s, foto guardada en Storage.
     - **Vacío:** "Jugador no encontrado. Podés guardarlo sin nombre."
     - **Error:** "No se pudo obtener el nombre/imagen. ¿Reintentar?" + botón.
  5. Si el número no está en el mapeo, el usuario puede escribir el nombre manualmente.
  6. Se permite guardar la figurita sin nombre y sin imagen si la API falla.
  7. Flag `userEditedName`: si el usuario modifica manualmente el campo después del autocompletado, no se vuelve a sobrescribir.
- **Rate limit:** si 429, mostrar "Demasiadas búsquedas. Esperá un minuto."

## 🧭 Navegación (grafo corregido)
- `RootNavigator`: verifica flag de onboarding → OnboardingScreen o AuthStack/MainTabs.
- `AuthStack`: Login ↔ Register, ForgotPassword, UpdatePassword.
- `MainTabs`: Figuritas, Matches, Kioscos, Perfil.
- `CodeScreen` es un **modal raíz**, no está dentro de ningún tab. Se presenta desde `MatchDetailScreen` y al cerrarse no contamina stacks.
- **Reglas de navegación:**
  - De `MatchDetailScreen` a `CodeScreen`: usar `navigation.navigate('RootCode', { params })`.
  - Desde `CodeScreen`: botón "Ver en mapa" cierra el modal y navega a `KioscosTab` con `kioscoId`. Botón atrás cierra el modal (vuelve a `MatchesScreen`, nunca a `MatchDetailScreen`).
  - `HomeScreen` y `MatchesScreen` usan `useFocusEffect` para refetch.

## 🎨 Componentes compartidos
- **Button:** variantes `primary`, `secondary`, `danger`. Estados `default`, `disabled`, `loading`.
- **Input:** variantes `default`, `error`. Acepta `rightIcon` y `loading`.
- **CardFigurita:** `repetida` (verde), `faltante` (naranja).
- **CardMatch:** nombre, estrellas, figurita ofrecida/buscada, distancia.
- **StatusScreen:** `loading`, `empty`, `error`. Título, descripción, botón opcional.

## 🧪 Lógica específica por pantalla
- **Home:** el botón "Buscar coincidencias" se habilita si hay ≥1 repetida y ≥1 faltante en el array completo, no en el filtrado. Filtro por chips solo afecta a la lista mostrada. Paginación de 20 figuritas.
- **Matches:** la búsqueda por texto busca siempre en `userName`, `offeredFigurita.number` y `requestedFigurita.number`. Los chips solo filtran el tipo de coincidencia (todas, ofrecidas, buscadas). Paginación de 20 matches.
- **AddFigurita:** validación de rango (1-678) con mensaje de error. Debounce en búsqueda API. Flag `userEditedName` para no sobrescribir edición manual.
- **MatchDetail → Code:** navegación a modal raíz; no se puede volver atrás al MatchDetail una vez aceptado.
- **Mapa:** 3 kioscos hardcodeados (Catamarca). Si `kioscoId` viene en params, destaca ese marcador en verde.
- **Perfil:** logout limpia AsyncStorage y fuerza redirección a Login.

## 📄 Documentación
- `README.md`: descripción, stack, ejecución, variables de entorno, capturas.
- `spec.md`: alcance, BD, justificación de API, datos reales vs simulados.
- `GIT_WORKFLOW.md`: reglas de ramas y PRs.
- `AGENT.md`: este archivo.
- `MCP_SETUP.md`: configuración del MCP de Supabase.
- `ARCHITECTURE.md`: arquitectura del proyecto.
- `API.md`: documentación de la API Football.
- `CHANGELOG.md`: historial de cambios.

## ✅ Git workflow
- Solo Tapia Lautaro aprueba y mergea PRs.
- Ramas: `main`, `develop`, `feature/*`, `fix/*`, `chore/*`, `docs/*`.
- Commits convencionales: `feat:`, `fix:`, `chore:`, `docs:`, `style:`.
- PR hacia `develop`, revisor obligatorio: Tapia Lautaro.
- No commitear `.env`, `node_modules`, `.expo`.

## 🤝 Reglas para IAs
Si eres una IA ayudando en este proyecto:
- Respeta el alcance del MVP. No agregues funcionalidades no solicitadas.
- No expongas la API key.
- Siempre usa los componentes reutilizables definidos.
- Sigue las convenciones de código.
- Ante cualquier integración con Supabase o api-football, contempla estados de carga, error y vacío.
- Cada pantalla es propiedad de un integrante. No generes código que modifique pantallas ajenas.
