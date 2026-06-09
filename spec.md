# FiguMatch – Especificación del MVP (TP4)

## Problema
Coleccionistas del Mundial 2026 necesitan intercambiar figuritas de forma segura, sin encuentros con extraños ni coordinación caótica.

## Propuesta de valor
Intercambiá figuritas sin miedo: llevá tus duplicadas a un kiosco adherido, retirá las que te faltan. Seguridad, cercanía y garantía digital.

## Alcance del MVP
Camino crítico: Agregar figuritas → Buscar coincidencias → Aceptar canje → Código de intercambio → Ver kiosco en mapa.

### Funcionalidades incluidas
- Onboarding de 3 slides (primer inicio)
- CRUD de figuritas (número, tipo: repetida/faltante, nombre opcional)
- Match simulado con datos locales (lista de coincidencias)
- Detalle de match y aceptación con generación de código único
- Pantalla de código con instrucciones y QR
- Mapa de kioscos con marcadores estáticos (3 kioscos en Catamarca)
- Perfil básico (nombre, reputación estática)
- Consumo de API externa: api-football.com para obtener nombre del jugador por número al agregar una figurita
- Manejo de estados: carga, vacío, error, sin conexión

### Funcionalidades excluidas (futuras)
- Escaneo por IA, cadenas de trueque, chat, notificaciones push, calificaciones reales.

## Stack tecnológico
- **Framework:** React Native con Expo (managed workflow)
- **Lenguaje:** TypeScript
- **Navegación:** React Navigation (Bottom Tabs + Stack)
- **Estado:** React Context + useReducer
- **Persistencia:** AsyncStorage
- **Mapas:** react-native-maps (con marcadores estáticos)
- **API externa:** api-football.com (endpoint: /players?season=2026&league=1&search=NAME)
- **Estilos:** StyleSheet nativo + tema constante (colores del prototipo)

## API utilizada
api-football.com – se consume al agregar una figurita. Al ingresar el número, se busca el jugador correspondiente (usando un mapeo número → ID o búsqueda por número de dorsal y selección). Si la API no está disponible, se muestra error con opción de reintentar.

## Estructura del proyecto
/FiguMatch
/src
/components (botones, tarjetas, estados)
/screens (Home, AddFigurita, Matches, Detalle, Codigo, Mapa, Perfil, Onboarding)
/navigation
/context (FiguritasContext)
/services (api.ts, matchesSimulados.ts)
/constants (colores, tipografía)
App.tsx

## Cómo ejecutar
1. Clonar repo
2. `npm install`
3. `npx expo start`
4. Escanear QR con Expo Go
5. Para la API: obtener API key gratuita en api-football.com, configurar en archivo `.env` (no commiteado)

## Integrantes
- Tapia Lautaro
- Vergara Facundo
- Graciela