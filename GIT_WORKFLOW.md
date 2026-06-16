# 🔀 Flujo de trabajo con Git – FiguMatch

## 🌳 Ramas del repositorio

### Ramas permanentes

| Rama | Propósito | ¿Recibe commits directos? | ¿Recibe Pull Requests? | Protegida |
|------|-----------|---------------------------|------------------------|-----------|
| `main` | Código de producción. Refleja la entrega final del TP4. | ❌ **NUNCA** | ✅ Solo desde `develop` | ✅ Sí |
| `develop` | Integración activa del equipo. Contiene el trabajo más reciente y funcional. | ⚠️ Solo fixes triviales (typos, estilos menores) | ✅ Desde ramas `feature/*`, `fix/*`, `chore/*`, `docs/*` | ✅ Sí |

### Ramas efímeras (se borran después del merge)

| Prefijo | Uso | Ejemplo | Se fusiona con |
|---------|-----|---------|----------------|
| `feature/` | Nueva funcionalidad o pantalla | `feature/12-agregar-figurita` | `develop` |
| `fix/` | Corrección de un bug | `fix/23-validar-numero-figurita` | `develop` |
| `chore/` | Tareas de mantenimiento, configuración, dependencias | `chore/8-actualizar-expo` | `develop` |
| `docs/` | Cambios en documentación | `docs/5-agregar-readme` | `develop` |

**Importante:** El nombre de la rama debe incluir el número del issue que resuelve, justo después del prefijo.  
Ejemplo: para el issue #14 que trata de la pantalla de código, la rama se llamará `feature/14-pantalla-codigo`.

---

## 🛡️ Reglas de protección de ramas

### Regla para `main`
- ✅ Require a pull request before merging
- ✅ Require approvals (mínimo 1, y debe ser de **Tapia Lautaro**)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging
- ✅ Require conversation resolution before merging
- ❌ Block force pushes
- ❌ Block deletions

### Regla para `develop`
- ✅ Require a pull request before merging
- ✅ Require approvals (mínimo 1, y debe ser de **Tapia Lautaro**)
- ❌ Block force pushes

---

## 👑 Regla de oro: Solo Tapia Lautaro aprueba y mergea

- **Graciela** y **Facundo** crean sus ramas, trabajan, suben sus cambios y abren Pull Request.
- **Tapia Lautaro** es el único que revisa, aprueba y realiza el merge de **todos** los Pull Request.
- Nadie más puede mergear en `develop` ni en `main`.

---

## 🚫 Lo que NUNCA se hace

| Acción prohibida | Razón |
|------------------|-------|
| Hacer `push` directo a `main` | `main` solo se actualiza por PR desde `develop` y solo Tapia mergea |
| Hacer `push` directo a `develop` (salvo fix trivial) | Todo cambio significativo debe pasar por PR y revisión de Tapia |
| Abrir PR hacia `main` desde `feature/*` | Solo `develop` mergea a `main` |
| Mergear un PR sin revisión de Tapia Lautaro | Todo PR requiere la aprobación explícita de Tapia |
| **Graciela o Facundo mergean su propio PR o el de otro** | Solo Tapia puede mergear |
| Hacer force push (`git push --force`) | Destruye el historial de los demás |
| Dejar ramas viejas en el remoto después del merge | Genera desorden. Borrarlas siempre |
| Commits con mensajes vagos (`"fix"`, `"cambios"`, `"update"`) | El historial debe ser comprensible para todos |

---

## 🔄 Ciclo de vida de una tarea

1. Elegir un issue del board de GitHub. **El issue debe estar asignado al integrante.**
2. Actualizar `develop` local:
   ```bash
   git checkout develop
   git pull origin develop

Crear la rama de trabajo usando el número del issue.
Ejemplo para el issue #12:

git checkout -b feature/12-nombre-descriptivo

Trabajar en la rama, haciendo commits significativos siguiendo el estándar de Conventional Commits.

Subir la rama al remoto:

git push -u origin feature/12-nombre-descriptivo

Abrir un Pull Request en GitHub:

Base: develop

Compare: feature/12-nombre-descriptivo

Título claro, descripción con qué se hizo, capturas si aplica y cómo probarlo.

Vincular el Issue (ej: Closes #12).

Asignar como revisor únicamente a Tapia Lautaro.

Esperar revisión y aprobación de Tapia Lautaro.

Hacer merge del PR y borrar la rama remota (lo hace Tapia).

✅ Estilo de commits (Conventional Commits)
Usamos el estándar Conventional Commits v1.0.0.

Estructura
<tipo>: <descripción breve en español>
Tipos permitidos
Tipo	Cuándo usarlo	Ejemplo
feat:	Nueva funcionalidad (pantalla, componente, lógica)	feat: agregar pantalla Detalle de Match
fix:	Corrección de un bug	fix: validar número de figurita entre 1 y 678
style:	Cambios de formato, espacios, comas (sin cambio de lógica)	style: ajustar padding en CardFigurita
refactor:	Reorganización de código sin cambiar comportamiento externo	refactor: extraer lógica de validación a helper
chore:	Tareas de mantenimiento, dependencias, configuración	chore: instalar react-native-maps
docs:	Cambios en documentación	docs: agregar instrucciones de ejecución al README
test:	Agregar o modificar pruebas	test: agregar casos de prueba para el formulario
Ejemplos correctos
feat: crear pantalla de código de intercambio con QR
fix: evitar crash al guardar figurita sin tipo
style: ajustar espaciado en tarjeta de match
chore: actualizar dependencia de Supabase
docs: agregar sección de variables de entorno al README
Ejemplos incorrectos
feat : mensaje   ← espacio antes del dos puntos
feat:Mensaje     ← sin espacio después del dos puntos
FEAT: mensaje    ← tipo en mayúsculas
cambios varios   ← sin tipo
fix              ← sin descripción
👥 Responsables de revisión
Si la rama es de...	Debe revisarla...
Tapia Lautaro	Graciela o Facundo (opcional, puede auto-aprobar)
Graciela	Tapia Lautaro
Facundo	Tapia Lautaro
⚔️ Resolución de conflictos
Si al abrir un PR hay conflictos con develop:

Actualizar develop local:
git checkout develop
git pull origin develop
Volver a la rama de trabajo y mergear develop:
git checkout feature/12-nombre-descriptivo
git merge develop
Resolver los conflictos en el editor.

Hacer commit del merge:
git add .
git commit -m "chore: resolver conflictos con develop"
git push
El PR se actualiza solo.

⚠️ Nunca hacer force push después de resolver conflictos.

📋 Checklist antes de abrir un PR
Mi código sigue las convenciones del proyecto (TypeScript, componentes funcionales, estilos en StyleSheet).

Probé la funcionalidad en Expo Go.

Los estados de carga, vacío y error están cubiertos.

No hay logs ni comentarios innecesarios.

No incluí archivos .env, node_modules ni .expo.

El nombre de la rama sigue la convención e incluye el número de issue.

El título del PR es claro y descriptivo.

Vinculé el Issue correspondiente (Closes #...).

Asigné a Tapia Lautaro como revisor.

📊 Flujo visual completo
main
  │
  │   (PR desde develop, SOLO TAPIA mergea)
  ↑
develop ─────────────────────────────────────────────
  ↑         ↑              ↑              ↑
  │         │              │              │
feature/   feature/      fix/          chore/
12-pantalla 15-onboard   23-validar    8-expo
  │         │              │              │
  └─────────┴──────────────┴──────────────┘
        PR → develop → Revisión de Tapia → Merge (por Tapia)
[Issue #12 asignado] → [Crear rama feature/12-nombre] → [Commits] → [Push] → [PR a develop] → [Tapia revisa] → [Tapia mergea] → [Borrar rama]
