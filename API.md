# 🌐 Documentación de la API – FiguMatch

## API utilizada
**api-football.com** – Servicio REST que proporciona datos de jugadores, selecciones y competiciones de fútbol.

## Endpoint empleado
GET https://v3.football.api-sports.io/players?season=2026&league=1&search={nombre}

### Headers
| Header | Valor |
|--------|-------|
| `x-apisports-key` | `<API_KEY>` (almacenada en `.env`) |

### Parámetros
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `season` | int | Sí | Año de la temporada (2026 para el Mundial) |
| `league` | int | Sí | Identificador de la liga (1 para el Mundial) |
| `search` | string | Sí | Nombre del jugador a buscar (codificado con `encodeURIComponent`) |

## Respuesta
La API devuelve un objeto JSON con la siguiente estructura relevante:
```json
{
  "response": [
    {
      "player": {
        "name": "L. Messi",
        "photo": "https://media.api-sports.io/football/players/154.png"
      },
      "statistics": [
        {
          "team": {
            "name": "Argentina",
            "logo": "https://media.api-sports.io/football/teams/26.png"
          },
          "games": {
            "number": 10
          }
        }
      ]
    }
  ]
}
Datos utilizados en FiguMatch
Campo	Uso
player.name	Nombre oficial del jugador (se muestra en tarjetas y formulario)
player.photo	Imagen del jugador (se descarga y se cachea en Supabase Storage)
Datos NO utilizados (provistos por mapeo local)
statistics[0].team.name (selección)

statistics[0].games.number (dorsal)

statistics[0].team.logo (logo de selección)

Estados de la respuesta y manejo en la app
Estado	Condición	Comportamiento en FiguMatch
Éxito	Código 200, array response no vacío	Se autocompleta el nombre y se descarga la foto.
Vacío	Código 200, array response vacío	Se muestra "Jugador no encontrado".
Error de red	Timeout, sin conexión	Se muestra "Error de conexión" con botón Reintentar.
Error del servidor	Códigos 4xx o 5xx	Se muestra "Servicio no disponible" con botón Reintentar.
Rate limit	Código 429	Se muestra "Demasiadas búsquedas. Esperá un minuto."
Integración con Supabase Storage
Al obtener una respuesta exitosa, se extrae la URL de photo.

Se descarga la imagen con expo-file-system.

Se sube al bucket jugadores de Supabase Storage con el nombre {numero}-{nombre}.png.

Si el archivo ya existe, no se reemplaza.

La URL pública de Supabase Storage se guarda en figuritas.imagen_url.

Límites del plan gratuito
100 requests por día. Para no excederlo, se aplica un debounce de 800ms en el campo de nombre del jugador al agregar figuritas y se cachean las imágenes subidas en Supabase Storage.

Seguridad
La API key se almacena en .env (EXPO_PUBLIC_API_FOOTBALL_KEY) y no se commitea.

En el MVP, la key es visible en el bundle. En producción se usaría un proxy backend.
