# 🤖 FiguMatch – Intercambio Seguro de Figuritas (Mundial 2026)

[![React Native](https://img.shields.io/badge/React%20Native-0.85+-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2056-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

FiguMatch es una aplicación móvil desarrollada para la asignatura **Diseño de Software de Dispositivos Móviles** de la **Tecnicatura Universitaria en Diseño de Software (FTyCA - UNCA)**. Su objetivo es solucionar la fricción e inseguridad que experimentan los coleccionistas al intercambiar figuritas de la copa del mundo.

---

## 📌 Descripción del problema

El coleccionismo de figuritas para el Mundial 2026 se enfrenta a desafíos logísticos y de seguridad. Actualmente, los coleccionistas dependen de grupos informales en redes sociales (Facebook, WhatsApp) o plataformas de comercio electrónico para coordinar encuentros cara a cara con extraños. Esto genera:
* **Inseguridad:** Riesgo de robos, estafas o encuentros en zonas peligrosas.
* **Falta de coordinación:** Pérdida de tiempo al intentar coincidir en horarios y puntos de encuentro.
* **Especulación económica:** Precios inflados para figuritas difíciles.
* **Caos en la información:** Inventarios desactualizados y dificultad para encontrar coincidencias de intercambio mutuo.

### La solución de FiguMatch
FiguMatch propone digitalizar el acuerdo de canje y descentralizar el intercambio físico utilizando **kioscos de cercanía como buzones seguros**. El usuario deposita sus figuritas repetidas en un kiosco y retira las que le faltan mediante la validación de un código único (QR), eliminando la necesidad de reunirse con extraños.

---

## 🚀 Alcance implementado (MVP)

Esta primera versión implementa el camino crítico funcional del producto:

* **Onboarding explicativo:** Carrusel inicial de 3 pantallas con la propuesta de valor, mostrado únicamente la primera vez (gestionado con `AsyncStorage`).
* **Autenticación robusta (Supabase Auth):**
  * Registro y validaciones completas (nombre, email válido, contraseñas de al menos 6 caracteres).
  * Inicio de sesión clásico con correo y contraseña.
  * Inicio de sesión alternativo a través de Google OAuth.
  * Flujo de recuperación de contraseña ("olvidé mi contraseña") enviando un enlace mágico y capturando el token mediante deep linking o pegado manual para restablecer la contraseña.
  * Cierre de sesión seguro con limpieza de estados y persistencia.
* **Base de datos relacional y RLS (Supabase DB):**
  * Estructura relacional con las tablas: `profiles`, `figuritas`, `matches`, `kioscos`, e `intercambios`.
  * Trigger `handle_new_user` para la creación automática del perfil en la base de datos al registrarse.
  * Row Level Security (RLS) para proteger los datos de inventario del usuario y permitir consultas anónimas indirectas a través de la función SQL `get_anonymous_figuritas`.
* **Almacenamiento en la nube (Supabase Storage):**
  * Bucket `jugadores` para el almacenamiento y caché de las fotos de los futbolistas obtenidas desde la API externa, evitando consumos excesivos de requests.
* **CRUD de figuritas (Inventario):**
  * Registro indicando el nombre del jugador (con debounce e integración con API Football). La selección se autocompleta y la imagen del jugador se previsualiza y sube a Supabase Storage. El número se genera de forma determinística en base al hash del nombre.
  * Soporte de guardado manual ingresando nombre y selección si la API no está disponible o el jugador no figura en el sistema de búsqueda.
* **Sistema inteligente de coincidencias (Matches):**
  * Generación dinámica de matches cruzando las repetidas del usuario actual con las faltantes de otros usuarios (y viceversa).
  * Filtrado correcto bidireccional ("ofrecidas" y "buscadas").
  * En ausencia de datos reales suficientes, el sistema genera matches de simulación dummy dinámicos basados directamente en el inventario real del usuario.
* **Flujo de intercambio digital:**
  * Visualización del detalle del match, distancia calculada en base al barrio del usuario y confirmación.
  * Generación de código único formateado (`FIG-XXXX-KX`) e inserción del registro de intercambio.
  * Pantalla de intercambio con QR generado dinámicamente e instrucciones claras.
* **Mapa interactivo de kioscos:**
  * Consulta en tiempo real de la base de datos para mostrar los kioscos activos (6 marcadores ubicados en Catamarca) utilizando marcadores personalizados.
  * Integración con el flujo de canje: al presionar "Ver en mapa" desde la pantalla de código de intercambio, se destaca en verde el marcador del kiosco asignado.
  * Integración de redirección de mapas nativos ("Cómo llegar").
* **Perfil de usuario:**
  * Resumen de datos, reputación calculada a partir de transacciones exitosas, e historial de transacciones realizadas en un modal de fácil acceso.
  * Edición del perfil (nombre y barrio de ubicación actual) con soporte de autocompletado para barrios válidos de Catamarca.
* **Cabecera Dinámica y Estadísticas:**
  * La pantalla de Inicio (`HomeScreen`) calcula de forma reactiva al enfocarse (`useFocusEffect`) el progreso de colección del usuario, cantidad de repetidas, faltantes, matches pendientes y comercios adheridos de forma verídica desde Supabase.
  * La cabecera compartida actualiza en tiempo real las alertas de matches pendientes para el usuario en todas las pestañas.

---

## 🛠️ Stack tecnológico

* **Lenguaje:** TypeScript (Strict Mode) para tipado estático y robustez.
* **Framework:** [React Native](https://reactnative.dev/) con [Expo](https://expo.dev/) (Managed Workflow, SDK 56+).
* **Navegación:** [React Navigation v6](https://reactnavigation.org/) con la siguiente arquitectura:
  * `RootNavigator` que decide el flujo según el estado de la sesión y el flag de onboarding.
  * `AuthStack` (Login ↔ Register, ForgotPassword, UpdatePassword).
  * `MainTabs` (Bottom Tabs para: Figuritas/Home, Coincidencias/Matches, Kioscos/Map, Perfil).
  * `CodeScreen` configurada como un modal de navegación raíz para no persistir en el stack de matches al cerrarse.
* **Gestión de Estado:**
  * **Global:** React Context (`AuthContext`) y `useReducer` para la sesión del usuario.
  * **Local:** React Hooks (`useState`, `useReducer`, `useEffect`, `useFocusEffect`).
* **Persistencia local:** `@react-native-async-storage/async-storage` para persistir la sesión de Supabase y el flag `@onboarding_completed`.
* **Mapas:** `react-native-maps` para geolocalización y renderizado del mapa.
* **Generación de QR:** `react-native-qrcode-svg` para renderizar el código del intercambio.
* **Estilos:** `StyleSheet` nativo de React Native, gobernado por un tema de diseño unificado en `src/constants/theme.ts`.

---

## ⚙️ Pasos de ejecución

### Requisitos previos
1. Tener instalado [Node.js](https://nodejs.org/) (versión recomendada 18+).
2. Tener instalado el cliente de desarrollo o la aplicación [Expo Go](https://expo.dev/client) en tu dispositivo móvil Android o iOS.

### 1. Clonar el repositorio
```bash
git clone https://github.com/exequielLT/MessiFalta.git
cd MessiFalta
```

### 2. Instalar dependencias
Instala las dependencias necesarias de forma reproducible y limpia:
```bash
npm ci
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto y completa con las credenciales de tu proyecto de Supabase y tu API key de Football:
```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
EXPO_PUBLIC_API_FOOTBALL_KEY=tu-clave-api-football-com
```
*(Nota: El archivo `.env` está configurado en `.gitignore` para no ser subido al repositorio público).*

### 4. Configurar Base de Datos (Supabase)
Ejecuta los scripts SQL de migración (ubicados en la carpeta `supabase/`) en la consola SQL de Supabase para inicializar:
* Las tablas de la base de datos (`profiles`, `figuritas`, `matches`, `kioscos`, `intercambios`).
* El trigger automático de perfil para nuevos registros de autenticación (`handle_new_user`).
* La función SQL con privilegios de administrador para la lista de figuritas anónimas (`get_anonymous_figuritas`).
* Configuración de las políticas de seguridad a nivel de fila (RLS).
* El bucket de almacenamiento público `jugadores` en Supabase Storage.

### 5. Iniciar la aplicación
Ejecuta el servidor de desarrollo de Expo:
```bash
npx expo start
```
* Para probar en un **dispositivo real**: Escanea el código QR que se visualiza en la terminal utilizando la aplicación **Expo Go** (en Android) o la app de cámara nativa (en iOS).
* Para probar en **emuladores**: Presiona `a` para abrir en emulador de Android o `i` para el simulador de iOS (requiere instalación previa de Xcode/Android Studio).

---

## 🌐 API utilizada

* **Nombre de la API:** [API Football (v3)](https://api-football.com) de API-Sports.
* **Documentación:** [https://api-sports.io/documentation/football/v3](https://api-sports.io/documentation/football/v3)
* **Endpoint principal:**
  ```http
  GET https://v3.football.api-sports.io/players?season=2026&league=1&search={nombre_jugador}
  ```

### Detalles del flujo y cacheo en el MVP
1. **Debounce:** Cuando el usuario escribe el nombre del jugador en `AddFiguritaScreen`, se aplica un debounce de 800ms antes de consultar a la API para mitigar la cantidad de peticiones concurrentes.
2. **Generación Determinística de Números:** En vez de exigir que el usuario ingrese un número del 1 al 678, el sistema calcula de forma transparente un número entero determinístico en base al hash del nombre del jugador para mapear su posición relacional en el álbum y poder realizar matchmaking.
3. **Descarga y caché en Storage:** Al guardar la figurita, si la API devolvió la URL de una foto del jugador (`player.photo`), el servicio `storageService` descarga esta imagen y la sube al bucket `jugadores` de Supabase Storage bajo el nombre `{numero}-{nombre_sanitizado}.png`. Si el archivo ya existe en el bucket, no se reemplaza.
4. **Resiliencia:** Si la API devuelve un resultado vacío o falla, la aplicación permite al usuario guardar la figurita ingresando el nombre y la selección de forma manual. Si hay un límite de peticiones (código 429) o error de red, se alerta al usuario ofreciendo guardar manualmente o reintentar la búsqueda.

---

## 👥 Integrantes y reparto de tareas

El desarrollo del MVP fue realizado de forma colaborativa respetando las siguientes responsabilidades de pantalla y lógica:

* **Tapia Lautaro** (Tech Lead & Revisor)
  * *Responsabilidad:* Único revisor y aprobador de Pull Requests para ramas de desarrollo e integración (`develop` y `main`).
  * *Implementación:* Creación del proyecto base, componentes compartidos (Button, Input, CardFigurita, CardMatch, StatusScreen), tema visual centralizado y tipografía. Dueño del desarrollo de las pantallas:
    * `AddFiguritaScreen` (Agregar Figurita con debounce e integración de API).
    * `CodeScreen` (Modal de QR de intercambio).
    * `MapScreen` (Mapa de Kioscos interactivo).
* **Graciela** (Seguridad e Integraciones)
  * *Responsabilidad:* Integración con la API externa, almacenamiento en Supabase Storage y flujo completo de backend.
  * *Implementación:* Lógica del AuthContext, servicios API y storage. Dueña del desarrollo de las pantallas:
    * `LoginScreen` y `RegisterScreen` (Inicio de sesión y registro de usuarios).
    * `ForgotPasswordScreen` y `UpdatePasswordScreen` (Recuperación y cambio de contraseña).
    * `MatchDetailScreen` (Detalle de coincidencia y aceptación).
* **Facundo** (Navegación y Documentación)
  * *Responsabilidad:* Diseño del flujo de navegación móvil y redacción de la documentación del proyecto.
  * *Implementación:* Configuración de React Navigation, animaciones y estados de enfoque de pantalla. Dueño del desarrollo de las pantallas:
    * `OnboardingScreen` (Bienvenida y slides explicativos).
    * `HomeScreen` / `FiguritasScreen` (Listado y filtros de figuritas).
    * `MatchesScreen` (Lista de coincidencias y filtros).
    * `ProfileScreen` (Perfil de usuario e historial).

---

## ⚠️ Limitaciones conocidas

Como MVP enfocado a la validación de la propuesta académica, esta versión presenta las siguientes limitaciones técnicas y de diseño:

1. **Simulación de la logística del Kiosco:** No existe un backend para el perfil de "kiosquero" que escanee el QR y confirme la recepción/entrega real de las figuritas. La asignación del kiosco al canjear es aleatoria entre los 3 kioscos fijos de Catamarca.
2. **Matches basados en datos mixtos:** Debido a la falta de una masa crítica de usuarios reales en la etapa de pruebas, la app cruza datos con registros dummy creados a partir del inventario del usuario para asegurar que siempre haya coincidencias que probar.
3. **Google OAuth en entorno de simulación:** Si bien el flujo de Google OAuth está integrado, en caso de fallos del trigger de Supabase, la app gestiona la inserción de perfiles de forma manual en el cliente.
4. **Geolocalización fija:** La ubicación del usuario no se detecta en tiempo real mediante GPS para calcular la distancia al kiosco de forma precisa; se usan distancias estimadas y coordenadas estáticas de prueba.
5. **Variables expuestas en el bundle:** En este prototipo, las variables de entorno de Supabase y la API Key de api-football.com están en el lado del cliente (React Native bundle). Para producción, estas llamadas críticas se deben realizar a través de un backend/proxy intermediario seguro.
6. **Almacenamiento de sesión sin encriptación:** La persistencia local de la sesión de autenticación utiliza `AsyncStorage` en lugar de una solución encriptada como `Expo SecureStore` (prevista para la fase de producción).
7. **Límite de API gratuito:** La cuenta gratuita de api-football.com posee un límite estricto de 100 peticiones diarias. Si el límite es excedido, la aplicación mostrará una alerta de error y solicitará reintentar tras unos minutos.
