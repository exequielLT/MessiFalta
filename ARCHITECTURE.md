
---

## ARCHITECTURE.md

```markdown
# 🏗️ Arquitectura de FiguMatch

## Visión general
FiguMatch sigue una arquitectura **cliente-servidor** con un frontend móvil desarrollado en **React Native (Expo)** y un backend gestionado íntegramente por **Supabase**. La aplicación consume una **API externa** (api-football.com) para enriquecer los datos de las figuritas y utiliza **Supabase Storage** para cachear imágenes.

## Diagrama conceptual
[Usuario] ↔ [App Expo (React Native)]
│
├──→ [Supabase Auth] (registro, login, sesión)
├──→ [Supabase Database] (figuritas, matches, kioscos, intercambios)
├──→ [Supabase Storage] (imágenes de jugadores)
└──→ [API Football] (nombre y foto oficial del jugador)

## Capas del frontend
| Capa | Responsabilidad | Implementación |
|------|----------------|----------------|
| **Interfaz** | Renderizado de pantallas y componentes visuales. | `screens/` y `components/` |
| **Navegación** | Flujo condicional entre pantallas (Auth, MainTabs, modales). | `navigation/` (React Navigation v6) |
| **Estado global** | Manejo de sesión de usuario. | `context/AuthContext.tsx` (React Context + useReducer) |
| **Lógica de negocio** | Funciones puras para CRUD, generación de matches, intercambios. | `services/` |
| **Acceso a datos** | Clientes configurados para Supabase y API Football. | `services/supabase.ts`, `services/api.ts` |

## Flujo de datos principal
1. **Autenticación:** El usuario se registra o inicia sesión. `AuthContext` almacena la sesión y el `RootNavigator` redirige a `MainTabs`.
2. **Carga de figuritas:** En `AddFiguritaScreen`, el usuario ingresa el nombre de un jugador. Se realiza una búsqueda debounceada (800ms) a `api.ts` para obtener la nacionalidad y foto oficial de API Football. El número de figurita (1-678) se calcula de forma determinística en base al hash del nombre del jugador. Al presionar Guardar, si hay una foto externa, se descarga y sube a Supabase Storage (`storageService.ts`), insertando el registro final en la tabla `figuritas`.
3. **Matches:** En `MatchesScreen`, se consultan las figuritas del usuario y las de otros. Se implementa un filtrado bidireccional correcto ("ofrecidas" vs "buscadas"). Si no hay suficientes coincidencias reales, se generan matches dummy en base al inventario real.
4. **Intercambio:** En `MatchDetailScreen`, al aceptar, se genera un código único (`FIG-XXXX-KX`), se asigna un kiosco de la base de datos relacional y se inserta en `intercambios`. Se navega a `CodeScreen` (modal raíz).
5. **Mapa:** `MapScreen` consulta dinámicamente la tabla `kioscos` de Supabase para renderizar en tiempo real los comercios activos (actualmente 6). Permite redireccionar al usuario a Google Maps mediante enlaces externos.
6. **Notificaciones y Estadísticas Reactivas:** La cabecera compartida (`AppHeader.tsx`) recibe la cantidad de matches pendientes por prop (`pendingNotificationsCount`), evitando crashes de contexto de navegación en web. Las pantallas consultan reactivamente a la base de datos de Supabase en base al estado del enfoque (`useFocusEffect`) y propagan el conteo hacia la cabecera. La pantalla principal (`HomeScreen`) carga en tiempo real el progreso de figuritas del usuario.

## Decisiones arquitectónicas
- **Expo (managed workflow):** Permite iterar rápido sin compilaciones nativas.
- **Supabase:** Unifica autenticación, base de datos relacional y almacenamiento de fotos, simplificando la infraestructura.
- **Cabecera Prop-Driven**: Desacopla la cabecera del ciclo de vida del router nativo para garantizar compatibilidad multiplataforma (Web y Móvil) y prevenir fallos de contexto de navegación.
- **Generación Determinística de Números**: Reemplaza el ingreso de números manual o mapeo rígido por un hash de texto, manteniendo compatibilidad con la estructura de la base de datos y mejorando la UX al agregar figuritas por nombre.
- **CodeScreen como modal raíz:** Evita que esta pantalla contamine el stack de navegación de la pestaña Matches.
- **Ubicación Autónoma en Perfil**: Permite a los usuarios seleccionar un barrio oficial de Catamarca para calcular de forma local la distancia estimada en los matches.
