# FiguMatch – Especificación del MVP (TP4)

## Problema
Coleccionistas del Mundial 2026 necesitan intercambiar figuritas de forma segura, sin encuentros con extraños ni coordinación caótica. Las alternativas actuales (grupos de Facebook, WhatsApp, MercadoLibre) generan desconfianza, pérdida de tiempo y especulación económica.

## Propuesta de valor
Intercambiá figuritas sin miedo: llevá tus duplicadas a un kiosco adherido, retirá las que te faltan. Seguridad, cercanía y garantía digital.

## Alcance del MVP
Camino crítico: **Onboarding (único)** → **Login / Registro** → Agregar figuritas (con API Football para nombre y foto) → Buscar coincidencias → Aceptar canje → Código de intercambio → Ver kiosco en mapa.

### Funcionalidades incluidas

#### Autenticación con Supabase Auth
- Registro con email/contraseña (nombre, email, contraseña, repetir contraseña).
- Login con email/contraseña.
- Login con Google OAuth.
- Recuperación de contraseña (envío de enlace mágico + pantalla para cambiar la contraseña con posibilidad de pegar token manualmente).
- Persistencia de sesión (AsyncStorage mediante cliente Supabase).
- Cierre de sesión (limpia flag de onboarding y datos locales).

#### Base de datos Supabase
- Tablas: `profiles`, `figuritas`, `matches`, `kioscos`, `intercambios`.
- Trigger para creación automática de perfil al registrarse.
- Función especial para obtener figuritas de otros usuarios sin exponer datos sensibles.
- Políticas de seguridad: cada usuario solo ve sus propias figuritas; los matches se generan con datos anónimos.

#### Supabase Storage
- **Bucket `jugadores`:** almacena las fotos de los jugadores obtenidas de la API Football.
  - Lectura pública, escritura solo autenticada.
  - Nombre de archivo: `{numero}-{nombre_sanitizado}.png`.
  - Si la imagen ya existe, no se reemplaza.
- **Imágenes de selecciones:** NO se almacenan en Supabase Storage. Se usan assets locales (carpeta `assets/banderas/`).

#### Onboarding
- 3 slides explicativos, mostrado **una única vez** al inicio (antes del Login).
- Controlado por un flag en AsyncStorage.
- Al hacer logout, se limpia el flag para que el próximo usuario lo vea.

#### CRUD de figuritas
- Campo `nombre_jugador` (obligatorio, ingresado por el usuario y buscado en la API).
- Campo `tipo` (obligatorio: `'repetida'` | `'faltante'`).
- Campo `numero` (calculado determinísticamente de 1 a 678 en base al hash del nombre del jugador para mantener compatibilidad relacional).
- Campo `imagen_url` (opcional, devuelto por la API y descargado/subido a Supabase Storage al guardar la figurita).
- Campo `seleccion` (nacionalidad del jugador, autocompletada por la API o ingresada manualmente).
- Sincronizado con Supabase.

#### API externa api-football.com
- **Uso exclusivo para:**
  1. Obtener la **nacionalidad** del jugador para autocompletar la selección.
  2. Obtener la **foto** oficial del jugador y subirla a Supabase Storage al guardar la figurita.
- **Endpoint:** `GET https://v3.football.api-sports.io/players?season=2026&league=1&search={nombre}`
- **Estados:** carga (spinner), éxito (autocompletado de selección + preview de imagen), vacío ("Jugador no encontrado. Podés guardarlo igual"), error (mensaje descriptivo + botón "Reintentar").
- **Debounce:** 800ms al escribir el nombre del jugador para mitigar consumo de consultas.
- **API Key:** en `.env` (`EXPO_PUBLIC_API_FOOTBALL_KEY`), no commiteada.

#### Determinación de Número de Figurita
- En lugar de forzar al usuario a ingresar manualmente un número de figurita o depender de un mapeo estático de 30 jugadores, el sistema genera de forma determinística un número entero entre 1 y 678 en base al hash del nombre del jugador. Esto preserva de manera transparente la compatibilidad con el algoritmo relacional de matchmaking de Supabase.

#### Matches (coincidencias)
- Generados dinámicamente a partir de las figuritas del usuario.
- Cruce: figuritas `repetida` del usuario ↔ figuritas `faltante` de otros usuarios.
- Filtro en pantalla diferenciando correctamente las figuritas "ofrecidas" (las que otros usuarios ofrecen y me sirven) de las "buscadas" (las que yo tengo repetidas y le sirven a otros).
- Si no hay suficientes usuarios reales, se complementa con datos dummy **vinculados a las figuritas del usuario** (no matches genéricos).

#### Flujo de intercambio
- Detalle de match con modal de confirmación.
- Generación de código único (formato `FIG-XXXX-KX`).
- Registro en tabla `intercambios` con kiosco asignado aleatoriamente de los activos.
- Pantalla de código con QR, instrucciones y botón para ver en mapa.

#### Mapa de kioscos
- Consulta dinámicamente de Supabase los kioscos activos (actualmente 6 marcadores).
- Si se recibe `kioscoId`, se destaca en verde.
- Tarjeta inferior con nombre, dirección y horario al tocar un marcador.
- Botón "Cómo llegar" integrado con la aplicación nativa de mapas de Google (mediante redirección URL).

#### Perfil
- Datos del usuario desde la tabla `profiles` de Supabase.
- Permite editar el nombre y el barrio (ubicación) del usuario con una lista de sugerencias autocompletadas para barrios válidos de Catamarca.
- Reputación simulada en base a la cantidad de intercambios reales completados.
- Historial completo de intercambios en modal.
- Botón "Cerrar sesión" que limpia AsyncStorage y redirige a Login.

#### Manejo de estados de interfaz
- **Carga:** `StatusScreen` con spinner.
- **Vacío:** `StatusScreen` con ilustración y CTA.
- **Error:** `StatusScreen` con mensaje y botón "Reintentar".
- **Éxito:** autocompletado, check verde, navegación.

### Funcionalidades excluidas (futuras)
- Chat interno, cadenas de trueque de más de dos personas, notificaciones push, verificación de email, rol de kiosquero, modo feria, donaciones, dorsales.

## Stack tecnológico
- **Framework:** React Native con Expo (managed workflow, SDK 52+)
- **Lenguaje:** TypeScript (strict mode)
- **Backend/BD:** Supabase (PostgreSQL + Auth + Storage)
- **Herramientas:** MCP de Supabase para gestión de base de datos, autenticación y storage.
- **Navegación:** React Navigation v6 (RootStack modal + AuthStack + Bottom Tabs)
- **Estado global:** AuthContext (React Context + useReducer)
- **Estado local:** useState en pantallas
- **Persistencia:** AsyncStorage (sesión, flag de onboarding)
- **Mapas:** react-native-maps
- **QR:** react-native-qrcode-svg
- **API externa:** api-football.com
- **Estilos:** StyleSheet nativo + tema centralizado

## Estructura del proyecto
/FiguMatch
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

## Flujo de autenticación
1. **Inicio:** verificar si ya se vio el Onboarding. Si no → Onboarding (3 slides) → Login.
2. **Login / Registro:** AuthContext maneja sesión con Supabase. Después del login, si el perfil no existe (por fallo del trigger), se crea manualmente.
3. **Google OAuth:** si el usuario cancela, no se muestra error. Si el nombre viene vacío, se permite editarlo en Perfil.
4. **Recuperación:** envío de enlace mágico. La pantalla de cambio de contraseña captura el token vía deep link o permite pegarlo manualmente.
5. **Logout:** cierre de sesión, limpieza de AsyncStorage (incluyendo flag de onboarding), redirección a Login.

## Flujo de navegación completo
### Pantallas y transiciones
| Pantalla | Navega a | Condiciones |
|----------|----------|-------------|
| OnboardingScreen | LoginScreen | Al finalizar slides |
| LoginScreen | RegisterScreen, ForgotPasswordScreen, HomeScreen | Login exitoso |
| RegisterScreen | LoginScreen, HomeScreen | Registro exitoso |
| ForgotPasswordScreen | LoginScreen | Éxito o cancelar |
| UpdatePasswordScreen | LoginScreen | Contraseña actualizada |
| HomeScreen | AddFiguritaScreen, MatchesScreen | |
| AddFiguritaScreen | HomeScreen | Al guardar o cancelar |
| MatchesScreen | MatchDetailScreen | Al seleccionar match |
| MatchDetailScreen | CodeScreen (modal) | Al aceptar intercambio |
| CodeScreen | MapScreen, HomeScreen, MatchesScreen | Al cerrar modal |
| MapScreen | - | |
| ProfileScreen | LoginScreen | Al cerrar sesión |

### CodeScreen como modal raíz
- No pertenece a ningún tab.
- Se presenta desde `MatchDetailScreen`.
- Al cerrarse, vuelve a `MatchesScreen` (nunca a `MatchDetailScreen`).
- Tiene botones para navegar a `MapScreen`, `HomeScreen` o `MatchesScreen`.

## Base de datos Supabase
### Tablas
- `profiles` (id, email, nombre, barrio, reputacion)
- `figuritas` (id, user_id, numero, tipo, nombre_jugador, imagen_url, seleccion, created_at)
- `matches` (id, user1_id, user2_id, fig1_id, fig2_id, estado)
- `kioscos` (id, nombre, direccion, lat, lng, horario)
- `intercambios` (id, match_id, codigo, kiosco_id, estado, fecha_entrega, fecha_retiro)

### Políticas de seguridad
- `profiles`: lectura pública, modificación solo del dueño.
- `figuritas`: solo el dueño puede ver y modificar.
- `matches`: solo los participantes pueden ver.
- `kioscos`: lectura pública.
- `intercambios`: solo los participantes pueden ver.

## Supabase Storage
### Bucket `jugadores`
- **Acceso:** lectura pública, escritura autenticada.
- **Nombre de archivo:** `{numero}-{nombre_sanitizado}.png`.
- **Flujo:** si la API devuelve `photo`, se descarga y se sube al bucket. Si ya existe, no se reemplaza.

## API Football
### Endpoint
GET https://v3.football.api-sports.io/players?season=2026&league=1&search={nombre}
Headers: x-apisports-key: <API_KEY>

### Datos utilizados
- `player.name` → nombre oficial del jugador.
- `player.photo` → imagen del jugador (cacheada en Supabase Storage).

### Datos NO utilizados (provistos por mapeo local)
- `player.statistics[0].team.name` (selección).
- `player.statistics[0].games.number` (dorsal).
- `player.statistics[0].team.logo` (logo de selección).

### Flujo en AddFiguritaScreen
1. El usuario ingresa el nombre del jugador en el campo de texto. Debounce de 800ms.
2. Se realiza una búsqueda automática en API Football llamando a `searchPlayer(nombre)`.
3. Si la API devuelve datos exitosamente:
   - Se autocompleta el campo de selección con la nacionalidad oficial obtenida.
   - Se muestra un preview de la foto oficial del jugador devuelta por la API.
   - Se muestra un check de éxito (verde) por 2 segundos.
4. Si la API no encuentra al jugador, se muestra una advertencia descriptiva y se permite continuar con el ingreso manual del nombre y de la selección.
5. Al guardar, si hay una foto externa, se descarga e inserta en el bucket de Supabase Storage.
6. El número de figurita (1-678) se genera automáticamente mediante hashing del nombre del jugador para mantener compatibilidad con el sistema de matchmaking.
7. Se permite guardar la figurita manualmente y sin imagen si la búsqueda en la API falla o se cancela.

## Gestión de errores y logging
- **Errores de red:** se muestran mensajes descriptivos con botón de reintento.
- **Errores de API:** se capturan y muestran mensajes específicos (jugador no encontrado, límite de consultas, timeout).
- **Errores de Supabase:** se registran en consola (solo en desarrollo) y se notifica al usuario.
- **Logging:** `console.error` en desarrollo. En producción se reemplazaría por un servicio externo.

## Seguridad
- **Variables de entorno:** claves API y URL de Supabase en `.env`, no commiteado.
- **RLS:** acceso a datos restringido por usuario autenticado.
- **Almacenamiento de sesión:** AsyncStorage (en producción se usaría almacenamiento seguro).
- **Comunicaciones:** HTTPS para todas las llamadas a API y Supabase.

## Accesibilidad
- Contraste mínimo 4.5:1 en textos principales.
- Áreas táctiles mínimas de 48x48dp.
- Textos descriptivos en imágenes (futuro).
- Tamaños de fuente escalables.

## Internacionalización
- Textos en español (es-AR) como idioma principal.
- Preparado para futura internacionalización.

## Métricas de éxito del MVP
- **Registro:** al menos 10 usuarios registrados en la prueba.
- **Retención:** al menos un 40% de usuarios que completan un intercambio solicitan un segundo.
- **Matches:** al menos 5 matches generados entre usuarios reales durante la validación.
- **Uso de API:** menos de 100 requests/día para no exceder el plan gratuito.

## Plan de pruebas
### Pruebas manuales
- Camino feliz: registro, login, agregar figurita, buscar matches, aceptar, ver código, mapa.
- Estados alternativos: sin figuritas, sin matches, error de API, error de red, filtro sin resultados, logout/relogin.

### Criterios de aceptación por historia de usuario
- US-01: El usuario puede agregar una figurita y verla en su lista.
- US-02: El usuario ve coincidencias cuando hay figuritas compatibles.
- US-03: El usuario acepta un intercambio y recibe un código único.
- US-04: El usuario ve un mapa con kioscos marcados.
- US-05: El usuario puede ver su perfil y cerrar sesión.

## Plan de despliegue
- **Desarrollo:** Expo Go en dispositivos físicos y emuladores.
- **Pruebas internas:** build de desarrollo con EAS Build.
- **Producción (futuro):** publicación en App Store y Google Play mediante EAS Submit.

## Datos reales vs simulados
| Dato | Origen | Motivo |
|------|--------|--------|
| Autenticación, perfil, figuritas | Real (Supabase) | Validar persistencia y seguridad |
| Nombre y foto del jugador | Real (api-football.com + Supabase Storage) | Cumplir consigna de API externa y demostrar Storage |
| Selección y bandera | Local (`playerMapping.ts` + `assets/banderas/`) | Datos estáticos, no requieren API |
| Matches (coincidencias) | Simulados (cruce local + dummy vinculado a figuritas reales) | No hay masa crítica de usuarios reales |
| Kioscos | Simulados (3 direcciones reales, adhesión ficticia) | MVP académico |
| Reputación | Simulada (intercambios dummy completados) | Sin transacciones reales |

## Glosario
- **Figurita:** cromo del álbum Panini del Mundial 2026.
- **Match:** coincidencia entre dos usuarios para intercambiar figuritas.
- **Kiosco adherido:** comercio asociado a FiguMatch que actúa como buzón de intercambio.
- **Código de intercambio:** identificador único generado al aceptar un match.
- **RLS:** Row Level Security, políticas de seguridad a nivel de fila en PostgreSQL.
- **Bucket:** contenedor de archivos en Supabase Storage.
- **Debounce:** retardo aplicado a una llamada para evitar ejecuciones múltiples.

## Cómo ejecutar
1. Clonar el repositorio.
2. Instalar las dependencias de forma reproducible:
   ```bash
   npm ci

Crear un proyecto en Supabase y ejecutar las migraciones SQL.

Configurar las variables de entorno en un archivo .env:

EXPO_PUBLIC_SUPABASE_URL=<url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<key>
EXPO_PUBLIC_API_FOOTBALL_KEY=<key>

Iniciar el servidor de desarrollo:
npx expo start
Escanear el código QR con Expo Go en un dispositivo o emulador.
