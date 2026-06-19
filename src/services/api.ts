export type SearchPlayerError = 'NOT_FOUND' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'RATE_LIMIT';

export interface SearchPlayerResult {
  name: string;
  photo?: string;
  nationality?: string;
}

function sanitizeNameForSearch(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos/diacríticos
    .replace(/[^a-zA-Z0-9\s]/g, '')  // Deja solo letras, números y espacios
    .replace(/\s+/g, ' ')            // Colapsa múltiples espacios
    .trim();
}

function getMatchScore(player: any, searchNameWords: string[]): number {
  const playerFullText = sanitizeNameForSearch(
    `${player.firstname || ''} ${player.lastname || ''} ${player.name || ''}`
  ).toLowerCase();
  
  let score = 0;
  for (const word of searchNameWords) {
    if (playerFullText.includes(word.toLowerCase())) {
      score++;
    }
  }
  return score;
}

export async function searchPlayer(name: string): Promise<{ data: SearchPlayerResult | null; error: SearchPlayerError | null }> {
  const apiKey = process.env.EXPO_PUBLIC_API_FOOTBALL_KEY;
  if (!apiKey) {
    return {
      data: {
        name,
        photo: 'https://media.api-sports.io/football/players/154.png',
        nationality: 'Argentina',
      },
      error: null,
    };
  }

  const sanitized = sanitizeNameForSearch(name);
  if (sanitized.length < 3) {
    return { data: null, error: 'NOT_FOUND' };
  }

  const words = sanitized.split(' ').filter(w => w.length > 0);
  
  // Definir términos de búsqueda candidatos
  const candidates: string[] = [sanitized];
  
  if (words.length >= 3) {
    // Penúltima + última palabra (ej: Rodrigo De Paul -> De Paul)
    candidates.push(`${words[words.length - 2]} ${words[words.length - 1]}`);
  }
  
  if (words.length >= 2) {
    // Última palabra (apellido principal)
    candidates.push(words[words.length - 1]);
    // Primera palabra (nombre de pila o apodo único)
    candidates.push(words[0]);
  }

  // Eliminar duplicados de candidatos y mantener orden
  const uniqueCandidates = Array.from(new Set(candidates));

  let lastError: SearchPlayerError | null = null;
  let apiResponseList: any[] = [];

  for (const queryTerm of uniqueCandidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `https://v3.football.api-sports.io/players?season=2022&league=1&search=${encodeURIComponent(queryTerm)}`,
        {
          method: 'GET',
          headers: {
            'x-apisports-key': apiKey,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.status === 429) {
        lastError = 'RATE_LIMIT';
        continue;
      }

      if (!response.ok) {
        lastError = 'SERVER_ERROR';
        continue;
      }

      const json = await response.json();

      if (json.errors && Object.keys(json.errors).length > 0) {
        if (json.errors.rateLimit || json.errors.requests) {
          lastError = 'RATE_LIMIT';
        } else {
          lastError = 'SERVER_ERROR';
        }
        continue;
      }

      if (json.response && json.response.length > 0) {
        apiResponseList = json.response;
        break; // Detener la iteración si encontramos resultados
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.toLowerCase().includes('network') || error.message?.toLowerCase().includes('fetch')) {
        lastError = 'NETWORK_ERROR';
      } else {
        lastError = 'SERVER_ERROR';
      }
    }
  }

  if (apiResponseList.length > 0) {
    // Puntuamos y ordenamos localmente los jugadores devueltos
    const scoredPlayers = apiResponseList
      .map((item: any) => ({
        player: item.player,
        score: getMatchScore(item.player, words)
      }))
      .filter((item: any) => item.score > 0) // Debe coincidir al menos en una palabra clave
      .sort((a: any, b: any) => b.score - a.score);

    if (scoredPlayers.length > 0) {
      const bestMatch = scoredPlayers[0].player;
      return {
        data: {
          name: bestMatch.name,
          photo: bestMatch.photo,
          nationality: bestMatch.nationality,
        },
        error: null,
      };
    }
  }

  return { data: null, error: lastError || 'NOT_FOUND' };
}
