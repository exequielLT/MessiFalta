
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
- **Framework:** React Native con Expo (managed workflow, SDK 56+)
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
  1. Usuario ingresa el nombre del jugador. Debounce de 800ms.
  2. Se realiza una búsqueda debounceada llamando a `searchPlayer(nombre)` en `api.ts`.
  3. Si la API devuelve foto y nacionalidad, se autocompleta el campo de selección.
  4. Al guardar, si la foto provista es externa, se descarga y se sube a Supabase Storage con un nombre formateado.
  5. Se genera un número de figurita determinístico (1-678) mediante un algoritmo de hash basado en el nombre del jugador para mantener la compatibilidad con el sistema de matchmaking.
  6. Estados:
     - **Carga:** `ActivityIndicator` a la derecha del campo nombre.
     - **Éxito:** autocompletar con la nacionalidad de la API, mostrar check verde 2s, foto guardada en Storage al presionar Guardar.
     - **Vacío:** "Jugador no encontrado. Podés guardarlo igual."
     - **Error:** "No se pudo buscar en la API. ¿Reintentar?" + botón.
  7. Se permite al usuario ingresar nombre y nacionalidad manualmente si la API no encuentra resultados o falla.
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
- **Home (Inicio):** El botón "Buscar coincidencias" se habilita si hay ≥1 repetida y ≥1 faltante en el array completo. Muestra estadísticas dinámicas en tiempo real (progreso, repetidas, faltantes, matches pendientes) consultadas de Supabase mediante `useFocusEffect`. También muestra el número dinámico de kioscos activos.
- **Matches:** La búsqueda por texto busca en `userName`, en `offeredFigurita.nombre_jugador` / `number` y `requestedFigurita.nombre_jugador` / `number`. Los chips filtran correctamente la coincidencia: "ofrecidas" (figuritas que otros ofrecen y yo busco) y "buscadas" (figuritas que yo tengo repetidas y otros buscan). Paginación de 20 matches.
- **AddFigurita:** Búsqueda reactiva por nombre del jugador en API Football (con debounce de 800ms). Se genera un número determinístico (1-678) mediante hash del nombre del jugador. Si el jugador no es encontrado, se permite el guardado con ingreso manual de nombre y nacionalidad.
- **MatchDetail → Code:** Navegación a modal raíz; no se puede volver atrás al MatchDetail una vez aceptado.
- **Mapa:** Consulta dinámicamente de Supabase los kioscos activos (actualmente 6 marcadores). Si `kioscoId` viene en params, destaca ese marcador en verde. Soporta redirección nativa con Google Maps al presionar "Cómo llegar".
- **Perfil:** Permite editar el nombre y el barrio (ubicación) del usuario con una lista de autocompletado para barrios válidos de Catamarca. Muestra historial detallado de intercambios y reputación en base a transacciones exitosas. Carga matches pendientes reales para la cabecera. El logout limpia AsyncStorage y redirige a Login.

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
