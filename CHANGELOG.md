
---

## CHANGELOG.md

```markdown
# 📝 Changelog – FiguMatch

## [M4] – Verificación y entrega (2026-06-19)
### Feat
- **Búsqueda por Nombre**: Reemplazada la búsqueda e ingreso manual de números en `AddFiguritaScreen` por búsqueda debounceada de 800ms por nombre del jugador, autocompletado de selección y generación de números determinísticos vía hash para matchmaking.
- **Estadísticas Reales en Inicio**: La pantalla `HomeScreen` carga de forma dinámica el progreso total de la colección, figuritas faltantes, repetidas, matches pendientes y conteo de kioscos activos conectándose reactivamente con Supabase (`useFocusEffect`).
- **Alertas de matches dinámicas**: Configuración de `AppHeader.tsx` para recibir alertas y badges de matches activos de manera reactiva por props, previniendo crashes de contexto en entornos web.
- **Barrios de Catamarca**: Añadida la edición del perfil de usuario y barrio actual utilizando listas de autocompletado con barrios oficiales de Catamarca para el cálculo local de distancias.
- **Kioscos dinámicos**: Ampliada la lista de kioscos del mapa para consultar la base de datos Supabase en tiempo real (mostrando 6 marcadores activos).
- **Inversión de filtro**: Solucionado el problema de filtrado de coincidencias en `MatchesScreen` invirtiendo los cruces de figuritas ofrecidas y buscadas.
### Docs
- README completo y especificaciones actualizadas con la lógica por nombre, estadísticas en tiempo real y mapa de kioscos dinámico.
- Reflexión final del equipo sobre el TP4.
### Tests
- Pruebas manuales del camino feliz y 5 caminos alternativos.
- Validación de compilación en Strict Mode (`npx tsc --noEmit`).
### Demo
- Video de 5 minutos mostrando flujo completo y estados alternativos.

## [M3] – Cierre de funcionalidades (2026-06-16)
### Feat
- Pantalla `MatchDetailScreen`: detalle de match, modal de confirmación, generación de código único, inserción en `intercambios`, navegación a `CodeScreen`.
- Pantalla `UpdatePasswordScreen`: cambio de contraseña con token vía deep link o manual.
### Fix
- `CodeScreen` movida a modal raíz para evitar persistencia en stack de Matches.
- Navegación desde `MatchDetail` a `Code` con `replace` para impedir retroceso.

## [M2] – Expansión de funcionalidades (2026-06-11)
### Feat
- Pantalla `CodeScreen`: muestra código, QR, instrucciones y botones de navegación.
- Pantalla `MapScreen`: mapa con 3 marcadores de kioscos, destacado si se recibe `kioscoId`, tarjeta inferior con información.
- Pantalla `MatchesScreen`: lista de matches con paginación, barra de búsqueda y chips de filtro.
- Pantalla `ProfileScreen`: datos del perfil, historial paginado y botón de cierre de sesión.
- Pantalla `RegisterScreen`: formulario de registro con validaciones y Google OAuth.
- Pantalla `ForgotPasswordScreen`: envío de enlace de recuperación.
### Chore
- Conexión con API Football (`api.ts`) y Supabase Storage (`storageService.ts`).

## [M1] – Funcionalidades principales (2026-06-08)
### Feat
- Pantalla `AddFiguritaScreen`: formulario completo con debounce, búsqueda en API Football, subida de imagen a Storage y guardado en Supabase.
- Pantalla `HomeScreen`: lista de figuritas con paginación, chips de filtro, FAB y botón de coincidencias.
- Pantalla `LoginScreen`: inicio de sesión con email/contraseña y Google OAuth.
- Pantalla `OnboardingScreen`: 3 slides, AsyncStorage.
### Chore
- Configuración de la API de fútbol.
- Configuración del almacenamiento de imágenes.

## [M0] – Infraestructura compartida (2026-06-04)
### Feat
- Proyecto Expo creado con TypeScript, dependencias instaladas.
- Tema visual (`theme.ts`) con tokens de diseño.
- Tipos globales (`types.ts`).
- Componentes atómicos: Button, Input, CardFigurita, CardMatch, StatusScreen.
- Cliente Supabase configurado con AsyncStorage.
- AuthContext con signIn, signUp, signInWithGoogle, signOut, resetPassword.
- Base de datos: tablas, trigger `handle_new_user`, función `get_anonymous_figuritas`, políticas RLS.
- Navegación base: RootNavigator, AuthStack, MainTabs.

