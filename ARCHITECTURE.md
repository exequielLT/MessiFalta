
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
2. **Carga de figuritas:** En `AddFiguritaScreen`, el usuario ingresa un número. Se consulta el mapeo local (`playerMapping.ts`) y, si existe, se llama a `api.ts` para obtener nombre y foto. La foto se descarga y se sube a Supabase Storage (`storageService.ts`). Los datos se guardan en la tabla `figuritas` de Supabase.
3. **Matches:** En `MatchesScreen`, se consultan las figuritas del usuario y las de otros (mediante función SQL anónima). Si no hay suficientes coincidencias reales, se complementan con datos dummy vinculados a las figuritas del usuario.
4. **Intercambio:** En `MatchDetailScreen`, al aceptar, se genera un código único, se asigna un kiosco aleatorio y se inserta un registro en la tabla `intercambios`. Luego se navega a `CodeScreen` (modal raíz) para mostrar el código QR y las instrucciones.
5. **Mapa:** `MapScreen` muestra tres kioscos hardcodeados. Si recibe un `kioscoId`, lo destaca en verde.

## Decisiones arquitectónicas
- **Expo (managed workflow):** Permite iterar rápido sin compilaciones nativas, ideal para el alcance del MVP.
- **Supabase:** Unifica autenticación, base de datos relacional y almacenamiento, simplificando la infraestructura.
- **CodeScreen como modal raíz:** Evita que esta pantalla contamine el stack de navegación de la pestaña Matches, resolviendo un problema de flujo detectado con teoría de grafos.
- **Mapeo local + API externa:** Reduce la dependencia de la API para datos estáticos (selección, dorsal) y la usa solo para nombre oficial y foto.
- **Componentes atómicos reutilizables:** Garantizan coherencia visual y facilitan el desarrollo paralelo por tres integrantes sin conflictos .
