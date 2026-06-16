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
Iniciar sesión (Cada uno con su cuenta de GitHub/Supabase):
    supabase login
Esto abrirá el navegador para autorizar al CLI. No te da acceso a proyectos ajenos, solo identifica quién ejecuta los comandos.

Clonar el proyecto y preparar el entorno:
    git clone <url-del-repo>
    cd FiguMatch
    npm ci
Crear el archivo .env en la raíz con las variables que te pasó Tapia:
    EXPO_PUBLIC_SUPABASE_URL=<url-del-proyecto>
    EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
    EXPO_PUBLIC_API_FOOTBALL_KEY=<api-key-football>
Vincular la carpeta local con el proyecto remoto:
    supabase link --project-ref <project-ref>
El project-ref es el código que aparece en la URL de tu dashboard de Supabase).

3. Flujo de Trabajo Seguro (Integración GitHub 🚀)
El proyecto está conectado directamente a GitHub y monitorea de forma automática la rama developer (según la configuración en image_faa202.png). Esto significa que las migraciones se aplican solas al fusionar el código.

🚫 Lo que NO deben hacer Graciela y Facundo:
No deben ejecutar supabase db push hacia el proyecto remoto. Hacerlo en un entorno compartido puede pisar el trabajo de otros o romper la base de datos de producción.

✅ El flujo correcto para agregar cambios a la Base de Datos:
Traer lo último de Git: Antes de tocar nada, haz git pull origin developer.

Crear una migración local: Si necesitas crear una tabla o modificar una columna, genera el archivo de migración:
    supabase migration new nombre_de_tu_cambio
Escribir el código SQL: Ve a la carpeta /supabase/migrations/, busca el archivo .sql que se acaba de crear y escribe tus comandos (ej: CREATE TABLE...).

Subir a GitHub: Haz el commit de tu archivo de migración y súbelo a tu rama.

La magia de la automatización: En cuanto el código se fusione (merge) en la rama developer, Supabase detectará el nuevo archivo en la carpeta /migrations y aplicará los cambios automáticamente en la base de datos.

4. Matriz de Roles y Permisos
Acción / Comando	Tapia (Admin)	Graciela / Facundo (Devs)
Ver estado de la conexión (supabase status)	✅	✅
Crear archivos de migración locales	✅	✅
Desplegar a producción vía GitHub (Push a developer)	✅	✅ (Vía Pull Request)
Modificar políticas RLS / Buckets en producción	✅	❌ (Solo mediante migraciones revisadas)
Ver logs del sistema (supabase logs)	✅	❌
5. Solución de Problemas Comunes
Error al vincular (supabase link): Revisa que estés logueado ejecutando supabase login de nuevo. Si persiste, confirma con Tapia si el project-ref no ha cambiado.

La app no conecta o da error de red: Revisa el archivo .env. Asegúrate de que no haya espacios vacíos después de las claves ni comillas innecesarias.

Mis cambios locales no se ven en la base de datos remota: Recuerda que ya no se suben manualmente con db push. Tus archivos de migración deben estar sí o sí en la rama developer de GitHub para que Supabase los procese.

6. Configuración Avanzada: MCP y Agent Skills (Opcional)
Estas herramientas permiten que los asistentes de IA (como los de VS Code o Cursor) interactúen directamente con tu proyecto de Supabase, facilitando el desarrollo y la depuración.

6.1 MCP (Model Context Protocol)
Conecta Supabase a tu entorno de IA para acceder a la base de datos, debugging, funciones y más de forma segura.

Crea o abre el archivo .vscode/mcp.json en la raíz del proyecto.

Agrega la siguiente configuración (ajusta el project_ref si es necesario, el valor aquí corresponde al proyecto FiguMatch):

json
{
  "servers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=bmnzazzgtjbhuojgiqbb&read_only=true&features=database%2Cdebugging%2Cdevelopment%2Cfunctions%2Cstorage%2Cbranching%2Caccount%2Cdocs"
    }
  }
}
Reinicia VS Code para que el cliente MCP tome la configuración.
Nota: Por defecto la conexión es de solo lectura. Si necesitas permisos de escritura, elimina el parámetro read_only=true de la URL (con precaución).

6.2 Agent Skills (Habilidades del Agente)
Este paquete añade instrucciones, scripts y recursos predefinidos para que las herramientas de IA trabajen con Supabase de forma más precisa y eficiente.

Instálalo globalmente desde la terminal:

bash
npx skills add supabase/agent-skills
Esto descargará los skills y los dejará disponibles para los agentes de IA que uses en tu editor.

Enlaces de Utilidad
Documentación Oficial del CLI de Supabase
https://supabase.com/docs/guides/cli

Entendiendo las Migraciones en Supabase
https://supabase.com/docs/guides/cli/managing-migrations

Documentación de Supabase MCP
https://supabase.com/docs/guides/mcp

Supabase Agent Skills
https://github.com/supabase-community/agent-skills
