export async function searchPlayer(name: string): Promise<{ data: { name: string; photo?: string } | null; error: 'NOT_FOUND' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'RATE_LIMIT' | null }> {
  const apiKey = process.env.EXPO_PUBLIC_API_FOOTBALL_KEY;
  if (!apiKey) {
    // If no API key, return a mock response matching messi or any player
    return { 
      data: { 
        name, 
        photo: 'https://media.api-sports.io/football/players/154.png' 
      }, 
      error: null 
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://v3.football.api-sports.io/players?season=2026&league=1&search=${encodeURIComponent(name)}`,
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
      return { data: null, error: 'RATE_LIMIT' };
    }

    if (!response.ok) {
      return { data: null, error: 'SERVER_ERROR' };
    }

    const json = await response.json();
    
    if (json.errors && Object.keys(json.errors).length > 0) {
      if (json.errors.rateLimit || json.errors.requests) {
        return { data: null, error: 'RATE_LIMIT' };
      }
      return { data: null, error: 'SERVER_ERROR' };
    }

    const player = json.response?.[0]?.player;
    if (player) {
      return {
        data: {
          name: player.name,
          photo: player.photo,
        },
        error: null,
      };
    }

    return { data: null, error: 'NOT_FOUND' };
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message?.toLowerCase().includes('network') || error.message?.toLowerCase().includes('fetch')) {
      return { data: null, error: 'NETWORK_ERROR' };
    }
    return { data: null, error: 'SERVER_ERROR' };
  }
}
