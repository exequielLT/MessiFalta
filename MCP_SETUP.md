
---

## MCP_SETUP.md

```markdown
# 🔧 Configuración del MCP de Supabase – FiguMatch

## ¿Quién administra el proyecto?
- **Tapia Lautaro** creó el proyecto en Supabase y es el administrador.
- **Graciela y Facundo** no necesitan unirse como colaboradores al proyecto de Supabase. Usan las credenciales de conexión (URL y anon key) desde el archivo `.env` para que la app funcione y el MCP se conecte.

## Requisitos previos
- Tener Node.js instalado (versión 18 o superior).
- Tener acceso al repositorio de FiguMatch.
- Tener el archivo `.env` configurado con las credenciales que Tapia comparte por privado.

## Instalación del MCP

1. Instalar el MCP de Supabase globalmente:
   ```bash
   npm install -g supabase
Iniciar sesión con tu cuenta gratuita de Supabase (cada uno usa su propia cuenta):
supabase login
Esto abre el navegador para autorizar. Solo identifica quién ejecuta comandos, no da acceso al proyecto.

Vincular el proyecto FiguMatch
Clonar el repositorio y entrar a la carpeta:
git clone <url-del-repo>
cd FiguMatch
npm ci
Crear el archivo .env con las variables que Tapia te pasó:
EXPO_PUBLIC_SUPABASE_URL=<url-del-proyecto>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
EXPO_PUBLIC_API_FOOTBALL_KEY=<api-key-football>
Vincular el proyecto local con el proyecto de Supabase usando la URL:
supabase link --project-ref <project-ref>
El project-ref lo encontrás en la URL del dashboard: https://supabase.com/dashboard/project/<project-ref>.
Tapia te pasa este dato junto con las credenciales.

Verificar que la conexión funciona:
supabase status
¿Qué puede hacer cada integrante?
Tapia Lautaro (administrador)
Ejecutar migraciones: supabase db push

Gestionar buckets de Storage

Modificar políticas RLS

Ver logs: supabase logs

Abrir el dashboard: supabase dashboard

Graciela y Facundo (desarrolladores)
Ver el estado de la base de datos: supabase status

Ejecutar migraciones que ya están en el repositorio: supabase db push (solo aplica lo nuevo, no modifica)

La app se conecta automáticamente usando las variables de entorno

Solución de problemas
No puedo vincular el proyecto (supabase link)
Verificá que el project-ref sea correcto.

Asegurate de tener conexión a internet.

Si falla, pedile a Tapia que verifique que el proyecto existe y está activo.

Las migraciones no se aplican
Verificá que el proyecto esté linkeado: supabase status.

Ejecutá supabase db push --debug para ver más detalles.

La app no se conecta a Supabase
Revisá que el archivo .env tenga las variables correctas.

Verificá que la URL y la anon key no tengan espacios extra.

Más información
Documentación oficial de Supabase

Guía del CLI de Supabase