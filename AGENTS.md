# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# 🤖 FiguMatch – Agent Instructions

## 🧩 Proyecto
**FiguMatch** es una app móvil para intercambiar figuritas del Mundial 2026 usando kioscos como buzones seguros.  
Estamos en la fase de MVP (TP4), con un camino crítico: agregar figuritas → buscar matches → aceptar canje → código → mapa de kioscos.

## 👥 Equipo
- **Tapia Lautaro** – Frontend intermedio, componentes atómicos, formularios, mapa, pruebas.
- **Graciela** – Backend & lógica compleja: estado global, algoritmo de matches, integración con API, modo offline, bugs difíciles.
- **Facundo** – Frontend general: navegación, pantallas principales (Home, Matches, Perfil), onboarding, README, demo.

## 📚 Stack
- **Lenguaje:** TypeScript (strict mode)
- **Framework:** React Native con Expo (managed workflow, SDK 52+)
- **Navegación:** React Navigation v6 (Bottom Tabs + Stack)
- **Estado global:** React Context + useReducer (sin Redux)
- **Persistencia:** AsyncStorage
- **Mapas:** react-native-maps (con Expo)
- **API externa:** [api-football.com](https://www.api-football.com/) (endpoint `/players`, season=2026, league=1)
- **Estilos:** StyleSheet nativo, sin librerías UI de terceros. Tema definido en `src/constants/theme.ts`

## 🗂️ Estructura del proyecto
/FiguMatch
/src
/components → Componentes reutilizables (Button, CardFigurita, CardMatch, StatusScreen, etc.)
/screens → Pantallas completas (Home, AddFigurita, Matches, MatchDetail, Code, Map, Profile, Onboarding)
/navigation → Configuración de React Navigation (TabNavigator, HomeStack, etc.)
/context → FiguritasContext (useReducer + AsyncStorage)
/services → api.ts (cliente Axios/fetch para api-football), matches.ts (datos simulados)
/constants → theme.ts (colores, tipografía, espaciados), dummyData.ts (kioscos, usuarios simulados)
/utils → Funciones helpers (generar código, validar número de figurita)
App.tsx → Entry point, providers, navegación root

## 🎨 Convenciones de código
- Usar siempre **TypeScript**, evitar `any`.
- Definir interfaces en archivos separados o al inicio del módulo.
- Componentes funcionales con hooks. Nada de clases.
- Nombres de componentes en **PascalCase**, archivos igual (ej: `CardFigurita.tsx`).
- Funciones helper en **camelCase**.
- Estilos en `StyleSheet.create()` al final del archivo o en archivo separado si son muchos.
- Para colores y tamaños, importar del tema: `import { colors, spacing, fontSizes } from '@/constants/theme'`.
- No dejar logs en producción; usar `console.debug` solo en desarrollo.
- Manejar errores con bloques try-catch y mostrar estados de error al usuario.

## 🧠 Patrones de componentes
- **Button**: variantes `primary`, `secondary`, `danger`. Props: `title`, `onPress`, `loading?`, `disabled?`.
- **CardFigurita**: `type: 'repetida' | 'faltante'`, `number`, `playerName?`. Sigue diseño del prototipo (círculo verde/naranja).
- **CardMatch**: `name`, `reputation`, `offeredFigurita`, `requestedFigurita`, `distance?`.
- **StatusScreen**: `type: 'loading' | 'empty' | 'error'`. Props: `title`, `description?`, `actionLabel?`, `onAction?`. Siempre centrada, con ícono grande.
- **BottomTabBar**: no personalizar más allá de íconos y labels. Usar `tabBarIcon` con los íconos definidos.

## 🧪 Manejo de estado
- **FiguritasContext** expone: `figuritas: Figurita[]`, `addFigurita(f)`, `removeFigurita(id)`, `getMatches()`, `loading`, `error`.
- Al iniciar la app, cargar figuritas desde AsyncStorage.
- Al agregar/quitar, guardar inmediatamente en AsyncStorage.
- `getMatches()` cruza las figuritas del usuario con el JSON simulado (`/services/matches.ts`), retorna un arreglo de `Match`.
- El estado del intercambio activo (código generado, kiosco asignado) se maneja en el screen local o en un contexto separado (`TradeContext`) si es necesario.
- Para la API, manejar estado: `idle`, `loading`, `success`, `error`. Al llamar a la API, mostrar spinner en el campo de nombre, y si falla, mostrar mensaje y botón "Reintentar" sin borrar el número ya ingresado.

## 🌐 Integración con API Football
- Endpoint: `GET https://v3.football.api-sports.io/players?season=2026&league=1&search=<nombre>`
- **No exponer la API key en el código.** Usar variable de entorno `EXPO_PUBLIC_API_FOOTBALL_KEY`.
- Llamar solo cuando se termine de escribir el número (usar un debounce de 800ms o al presionar "Buscar").
- Como no hay mapeo directo número → jugador, se puede:
  1. Tener un archivo JSON local con número, nombre y dorsal de jugadores de Argentina (o varias selecciones) y buscarlo ahí primero.
  2. Si no está, intentar buscar por dorsal y equipo en la API.
- Respuesta de la API: mostrar `player.name`. Si no hay resultados, mostrar "Jugador no encontrado".
- Estados a contemplar: carga, error de red, error de servidor (códigos 4xx/5xx), respuesta vacía.
- **Modo offline:** si falla la conexión, permitir guardar la figurita sin nombre, y cuando haya conexión volver a intentar la búsqueda.

## 🧭 Navegación
- `RootNavigator`: stack que contiene Onboarding (si primer inicio) y MainTabs.
- `MainTabs`: Bottom Tab Navigator con 4 tabs: Figuritas, Matches, Kioscos, Perfil.
- Dentro de cada tab, un Stack Navigator para las pantallas secundarias (AddFigurita, MatchDetail, Code, etc.).
- Al navegar a pantalla de Código desde MatchDetail, ocultar la barra de tabs (usar `tabBarStyle: { display: 'none' }` o un modal).
- Los colores de la barra de tabs: activo `#007AFF`, inactivo `#8E8E93`.

## ✅ Git workflow
- Ramas: `main` (protegida), `develop`, `feature/nombre`, `fix/nombre`.
- Commits convencionales: `feat:`, `fix:`, `chore:`, `style:`, `docs:`, `test:`.
- Antes de merge a `develop`, hacer pull request y que otro integrante revise.
- No commitear `.env` ni `node_modules`. El `.gitignore` ya debe incluirlos.

## 🧪 Pruebas (manuales)
- Antes de cada hito, ejecutar el guion de validación:
  1. Camino feliz: agregar 2 figuritas, buscar match, aceptar, ver código, abrir mapa.
  2. Sin figuritas: pantalla vacía, botón de agregar funcional.
  3. Sin conexión: desactivar internet, ver pantallas de error y recuperación.
  4. API caída: simular error, ver mensaje y botón de reintento.
  5. Navegación: ir y volver entre tabs y pantallas secundarias.
- Registrar los resultados en el issue correspondiente.

## 📄 Documentación final
- `README.md` debe contener: descripción, stack, cómo ejecutar, API utilizada, variables de entorno necesarias, capturas/GIF, integrantes.
- `spec.md` resume el alcance del MVP.
- `AGENT.md` (este archivo) para asistentes de IA.

## 🤝 Roles en el equipo
- **Tapia Lautaro**: `components/`, `screens/AddFigurita`, `screens/Code`, `screens/Map`, `tests/`.
- **Graciela**: `context/`, `services/api.ts`, `services/matches.ts`, `utils/`, `screens/MatchDetail` (lógica de aceptación), `App.tsx` (offline detection).
- **Facundo**: `navigation/`, `screens/Home`, `screens/Matches`, `screens/Profile`, `screens/Onboarding`, `README.md`, demo.

Si eres una IA ayudando en este proyecto, sigue estas convenciones y respeta los límites del MVP. No agregues funcionalidades no solicitadas.