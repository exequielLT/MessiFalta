# 🔧 Configuración del CLI de Supabase e Integración GitHub – FiguMatch

## ¿Quién administra el proyecto?
*   **Tapia Lautaro (Admin):** Creador del proyecto en Supabase, encargado de la infraestructura, configuraciones de seguridad (RLS) y aprobación final de cambios.
*   **Graciela y Facundo (Devs):** Desarrolladores del proyecto. No necesitan ser invitados al dashboard de Supabase de producción. Trabajan de forma local y usan las credenciales del archivo `.env` para conectar la app.

## 1. Requisitos previos
*   Tener **Node.js** instalado (versión 18 o superior).
*   Acceso al repositorio de Git de FiguMatch.
*   Archivo `.env` con las credenciales que Tapia comparte por privado.

---

## 2. Instalación y Vinculación Inicial

Para que el CLI de Supabase reconozca tu entorno, cada integrante debe seguir estos pasos **una sola vez**:

1.  **Instalar el CLI de Supabase globalmente:**
```bash
    npm install -g supabase
    ```
2.  **Iniciar sesión (Cada uno con su cuenta de GitHub/Supabase):**
```bash
    supabase login
    ```
    *Esto abrirá el navegador para autorizar al CLI. No te da acceso a proyectos ajenos, solo identifica quién ejecuta los comandos.*
3.  **Clonar el proyecto y preparar el entorno:**
```bash
    git clone <url-del-repo>
    cd FiguMatch
    npm ci
    ```
4.  **Crear el archivo `.env` en la raíz con las variables que te pasó Tapia:**
```env
    EXPO_PUBLIC_SUPABASE_URL=<url-del-proyecto>
    EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
    EXPO_PUBLIC_API_FOOTBALL_KEY=<api-key-football>
    ```
5.  **Vincular la carpeta local con el proyecto remoto:**
```bash
    supabase link --project-ref <project-ref>
    ```
    *(El `project-ref` es el código que aparece en la URL de tu dashboard de Supabase).*

---

## 3. Flujo de Trabajo Seguro (Integración GitHub 🚀)

El proyecto está conectado directamente a GitHub y monitorea de forma automática la rama **`developer`** (según la configuración en `image_faa202.png`). Esto significa que **las migraciones se aplican solas al fusionar el código**.

### 🚫 Lo que NO deben hacer Graciela y Facundo:
No deben ejecutar `supabase db push` hacia el proyecto remoto. Hacerlo en un entorno compartido puede pisar el trabajo de otros o romper la base de datos de producción.

### ✅ El flujo correcto para agregar cambios a la Base de Datos:
1.  **Traer lo último de Git:** Antes de tocar nada, haz `git pull origin developer`.
2.  **Crear una migración local:** Si necesitas crear una tabla o modificar una columna, genera el archivo de migración:
```bash
    supabase migration new nombre_de_tu_cambio
    ```
3.  **Escribir el código SQL:** Ve a la carpeta `/supabase/migrations/`, busca el archivo `.sql` que se acaba de crear y escribe tus comandos (ej: `CREATE TABLE...`).
4.  **Subir a GitHub:** Haz el *commit* de tu archivo de migración y súbelo a tu rama.
5.  **La magia de la automatización:** En cuanto el código se fusione (*merge*) en la rama **`developer`**, Supabase detectará el nuevo archivo en la carpeta `/migrations` y **aplicará los cambios automáticamente** en la base de datos.

---

## 4. Matriz de Roles y Permisos

| Acción / Comando | Tapia (Admin) | Graciela / Facundo (Devs) |
| :--- | :---: | :---: |
| Ver estado de la conexión (`supabase status`) | ✅ | ✅ |
| Crear archivos de migración locales | ✅ | ✅ |
| **Desplegar a producción vía GitHub (Push a `developer`)** | ✅ | ✅ *(Vía Pull Request)* |
| Modificar políticas RLS / Buckets en producción | ✅ | ❌ *(Solo mediante migraciones revisadas)* |
| Ver logs del sistema (`supabase logs`) | ✅ | ❌ |

---

## 5. Solución de Problemas Comunes

*   **Error al vincular (`supabase link`):** Revisa que estés logueado ejecutando `supabase login` de nuevo. Si persiste, confirma con Tapia si el `project-ref` no ha cambiado.
*   **La app no conecta o da error de red:** Revisa el archivo `.env`. Asegúrate de que no haya espacios vacíos después de las claves ni comillas innecesarias.
*   **Mis cambios locales no se ven en la base de datos remota:** Recuerda que ya no se suben manualmente con `db push`. Tus archivos de migración deben estar sí o sí en la rama `developer` de GitHub para que Supabase los procese.

---

### Enlaces de Utilidad
*   [Documentación Oficial del CLI de Supabase](https://supabase.com/docs/guides/cli)
*   [Entendiendo las Migraciones en Supabase](https://supabase.com/docs/guides/cli/managing-migrations)
