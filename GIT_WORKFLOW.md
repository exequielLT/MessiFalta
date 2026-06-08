# 🔀 Flujo de trabajo con Git – FiguMatch

## 📌 Objetivo
Garantizar que el código del equipo esté siempre integrado, revisado y funcionando,
evitando conflictos con la rama principal `main` y manteniendo un historial limpio y trazable.
Además, se establece que **solo Tapia Lautaro** tiene la responsabilidad de revisar y
aceptar Pull Requests.

---

## 🌳 Ramas del repositorio

### Ramas permanentes

| Rama | Propósito | ¿Recibe commits directos? | ¿Recibe Pull Requests? | Protegida |
|------|-----------|---------------------------|------------------------|-----------|
| `main` | Código de producción. Refleja la entrega final del TP4. | ❌ **NUNCA** | ✅ Solo desde `develop` (solo Tapia Lautaro puede mergear) | ✅ Sí |
| `develop` | Integración activa del equipo. Contiene el trabajo más reciente y funcional. | ⚠️ Solo fixes triviales (typos, estilos menores) por Tapia Lautaro | ✅ Desde ramas `feature/*`, `fix/*`, `chore/*` (solo Tapia Lautaro puede mergear) | ✅ Sí |

### Ramas efímeras (se borran después del merge)

| Prefijo | Uso | Ejemplo | Se fusiona con |
|---------|-----|---------|----------------|
| `feature/` | Nueva funcionalidad o pantalla | `feature/tema-global` | `develop` |
| `fix/` | Corrección de un bug | `fix/validar-numero-figurita` | `develop` |
| `chore/` | Tareas de mantenimiento, configuración, dependencias | `chore/actualizar-expo-sdk` | `develop` |
| `docs/` | Cambios en documentación (README, spec, AGENT, etc.) | `docs/agregar-readme` | `develop` |
| `test/` | Agregar o modificar pruebas | `test/pruebas-manuales-mvp` | `develop` |

---

## 👑 Regla de oro: Solo Tapia Lautaro aprueba y mergea

- **Graciela** y **Facundo** crean sus ramas, trabajan, suben sus cambios y abren Pull Request.
- **Tapia Lautaro** es el único que revisa, aprueba y realiza el merge de **todos** los Pull Request.
- Nadie más puede mergear en `develop` ni en `main`.
- Esta regla está pensada para mantener un control centralizado del código que se integra,
  evitar merges accidentales y garantizar que siempre haya una revisión final de calidad.

---

## 🛡️ Reglas de protección de ramas (configurar en GitHub)

Ir a **Settings > Branches > Add branch protection rule** y aplicar:

### Regla para `main`
- ✅ Require a pull request before merging
- ✅ Require approvals (mínimo 1, y debe ser de **Tapia Lautaro**)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging
- ✅ Require conversation resolution before merging
- ✅ Restrict who can dismiss pull request reviews (solo Tapia Lautaro)
- ❌ Block force pushes
- ❌ Block deletions

### Regla para `develop`
- ✅ Require a pull request before merging
- ✅ Require approvals (mínimo 1, y debe ser de **Tapia Lautaro**)
- ✅ Restrict who can dismiss pull request reviews (solo Tapia Lautaro)
- ❌ Block force pushes

---

## 🚫 Lo que **NUNCA** se hace

| Acción prohibida | Razón |
|------------------|-------|
| Hacer `push` directo a `main` | `main` solo se actualiza por PR desde `develop` y solo Tapia mergea |
| Hacer `push` directo a `develop` (salvo fix trivial por Tapia) | Todo cambio significativo debe pasar por PR y revisión de Tapia |
| Abrir PR hacia `main` desde `feature/*` | Solo `develop` mergea a `main` |
| Mergear un PR sin revisión de Tapia Lautaro | Todo PR requiere la aprobación explícita de Tapia |
| **Graciela o Facundo mergean su propio PR o el de otro** | Solo Tapia puede mergear |
| Hacer force push (`git push --force`) | Destruye el historial de los demás |
| Dejar ramas viejas en el remoto después del merge | Genera desorden. Borrarlas siempre |
| Commits con mensajes vagos (`"fix"`, `"cambios"`, `"update"`) | El historial debe ser comprensible para todos |

---

## 🔄 Ciclo de vida de una tarea (paso a paso)

### 1. Elegir un Issue
Cada tarea corresponde a un Issue en GitHub. Asignarse el issue y moverlo a "In Progress".

### 2. Actualizar `develop` local
```bash
git checkout develop
git pull origin develop
3. Crear la rama de trabajo
git checkout -b feature/nombre-descriptivo
Reglas para el nombre:

Todo en minúsculas.

Palabras separadas por guiones.

Describir qué hace, no quién la hace.

❌ feature/tapia-boton

✅ feature/boton-primario-reutilizable

4. Trabajar en la rama
Hacer commits frecuentes y significativos siguiendo el estándar de Conventional Commits.
git add .
git commit -m "feat: crear componente Button con variantes primary y secondary"
5. Subir la rama al remoto
git push -u origin feature/nombre-descriptivo
6. Abrir un Pull Request en GitHub
Base: develop

Compare: feature/nombre-descriptivo

Título claro, descripción con qué se hizo, capturas si aplica y cómo probarlo.

Vincular el Issue (ej: Closes #12).

Asignar como revisor únicamente a Tapia Lautaro.

7. Revisión del PR (a cargo de Tapia Lautaro)
Tapia debe:

Revisar el código y la funcionalidad.

Probar en local si es necesario.

Dejar comentarios si hay cambios que hacer.

Solicitar cambios o aprobar.

Si Tapia pide cambios, el autor los hace, sube nuevos commits y el PR se actualiza automáticamente.

8. Merge y limpieza
Una vez que Tapia Lautaro aprueba:

Tapia hace Squash and Merge o Merge Commit (según corresponda).

Tapia borra la rama remota (GitHub lo ofrece automáticamente al mergear).

El autor de la rama borra su rama local:
git checkout develop
git pull origin develop
git branch -d feature/nombre-descriptivo
Mover el Issue a "Done".

✅ Estilo de commits (Conventional Commits)
Usamos el estándar Conventional Commits v1.0.0.

Estructura
<tipo>: <descripción breve en español>

[cuerpo opcional con más detalle]

[pie opcional con referencias a issues]

Tipos permitidos
Tipo	Cuándo usarlo	Ejemplo
feat:	Nueva funcionalidad (pantalla, componente, lógica)	feat: agregar pantalla Detalle de Match
fix:	Corrección de un bug	fix: validar número de figurita entre 1 y 678
style:	Cambios de formato, espacios, comas (sin cambio de lógica)	style: ajustar padding en CardFigurita
refactor:	Reorganización de código sin cambiar comportamiento externo	refactor: extraer lógica de validación a helper
chore:	Tareas de mantenimiento, dependencias, configuración	chore: instalar react-native-maps
docs:	Cambios en documentación	docs: agregar instrucciones de ejecución al README
test:	Agregar o modificar pruebas	test: agregar casos de prueba para el formulario
Ejemplos completos
feat: crear contexto de figuritas con useReducer y AsyncStorage

El contexto expone las figuritas, addFigurita, removeFigurita y getMatches.
Se persiste automáticamente al modificar el estado.

Closes #14
fix: evitar crash al agregar figurita sin número

Se agregó validación en el formulario que impide guardar si el campo
de número está vacío o fuera del rango 1-678.

Closes #21
👥 Política de revisión de PR
Rol	¿Abre PR?	¿Revisa PR?	¿Mergea PR?
Tapia Lautaro	Sí (cuando desarrolla una feature)	✅ Sí, todos	✅ Sí, el único
Graciela	Sí	❌ No	❌ No
Facundo	Sí	❌ No	❌ No
Flujo:

Graciela o Facundo trabajan en su rama y abren PR.

Asignan el PR a Tapia Lautaro como revisor.

Tapia revisa, pide cambios si es necesario, y aprueba.

Tapia es quien hace el merge.

Si Tapia desarrolla una feature, abre su PR y puede mergearlo él mismo (pero es recomendable que otro integrante al menos vea el código).

⚔️ Resolución de conflictos
Si al abrir un PR hay conflictos con develop:

1. Actualizar develop local:
git checkout develop
git pull origin develop
2. Volver a la rama de trabajo y mergear develop:
git checkout feature/nombre-descriptivo
git merge develop
3.Resolver los conflictos en el editor.

4.Hacer commit del merge:
git add .
git commit -m "chore: resolver conflictos con develop"
git push
5. El PR se actualiza solo.

⚠️ Nunca hacer force push después de resolver conflictos.
⚠️ Solo Tapia puede hacer el merge final del PR una vez resueltos los conflictos.
🏷️ Releases y tags (opcional para el TP4)
Al finalizar cada Milestone, Tapia Lautaro puede crear un tag desde develop:
git checkout develop
git pull origin develop
git tag -a v0.1.0 -m "M1: Setup y navegación completado"
git push origin v0.1.0
git checkout develop
git pull origin develop
git tag -a v0.1.0 -m "M1: Setup y navegación completado"
git push origin v0.1.0
La entrega final se versiona como v1.0.0 desde main (merge que también ejecuta Tapia).

📋 Checklist antes de abrir un PR
Mi código sigue las convenciones del proyecto (TypeScript, componentes funcionales, estilos en StyleSheet).

Probé la funcionalidad en Expo Go (iOS y Android si es posible).

Los estados de carga, vacío y error están cubiertos.

No hay logs ni comentarios innecesarios.

No incluí archivos .env, node_modules ni .expo.

El nombre de la rama sigue la convención (feature/..., fix/..., etc.).

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
tema       onboarding    validacion    expo-sdk
  │         │              │              │
  └─────────┴──────────────┴──────────────┘
        PR → develop → Revisión de Tapia → Merge (por Tapia)
main
  │
  │   (PR desde develop, SOLO TAPIA mergea)
  ↑
develop ─────────────────────────────────────────────
  ↑         ↑              ↑              ↑
  │         │              │              │
feature/   feature/      fix/          chore/
tema       onboarding    validacion    expo-sdk
  │         │              │              │
  └─────────┴──────────────┴──────────────┘
        PR → develop → Revisión de Tapia → Merge (por Tapia)
[Issue asignado] → [Crear rama desde develop] → [Commits] → [Push] → [PR a develop] → [Tapia revisa] → [Tapia mergea] → [Borrar rama]
📞 Contacto del equipo
Cualquier duda sobre el flujo de trabajo, consultar a Tapia Lautaro antes de hacer algo fuera de estas reglas.

Equipo FiguMatch: Tapia Lautaro (Tech Lead / Revisor), Graciela, Facundo.

---

Listo. Ahora el archivo refleja claramente que **solo Tapia Lautaro revisa y mergea** todos los Pull Request. Graciela y Facundo tienen roles de desarrollo pero no pueden mergear.

