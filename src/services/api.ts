export async function searchPlayer(name: string): Promise<{ data: { name: string; photo?: string } | null; error: any }> {
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
    const response = await fetch(
      `https://v3.football.api-sports.io/players?season=2026&league=1&search=${encodeURIComponent(name)}`,
      {
        method: 'GET',
        headers: {
          'x-apisports-key': apiKey,
        },
      }
    );

    if (response.status === 429) {
      return { data: null, error: 'Demasiadas búsquedas. Esperá un minuto.' };
    }

    if (!response.ok) {
      return { data: null, error: 'API Error' };
    }

    const json = await response.json();
    
    if (json.errors && Object.keys(json.errors).length > 0) {
      return { data: null, error: json.errors };
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

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
