const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load environment variables manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[key] = value.trim();
  }
});

const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_SECRET;
const apiFootballKey = env.EXPO_PUBLIC_API_FOOTBALL_KEY;

if (!supabaseUrl || !supabaseServiceKey || !apiFootballKey) {
  console.error('Missing environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Translation map for selections to match es-AR/Spanish
const nationalityTranslations = {
  'Argentina': 'Argentina',
  'France': 'Francia',
  'Portugal': 'Portugal',
  'Norway': 'Noruega',
  'Brazil': 'Brasil',
};

// Players list to search and seed
const playersToSeed = [
  { numero: 10, searchName: 'Lionel Messi', seleccion: 'Argentina' },
  { numero: 45, searchName: 'Emiliano Martinez', seleccion: 'Argentina' },
  { numero: 88, searchName: 'Rodrigo De Paul', seleccion: 'Argentina' },
  { numero: 210, searchName: 'Kylian Mbappe', seleccion: 'Francia' },
  { numero: 7, searchName: 'Cristiano Ronaldo', seleccion: 'Portugal' },
  { numero: 9, searchName: 'Erling Haaland', seleccion: 'Noruega' },
  { numero: 11, searchName: 'Neymar Jr', seleccion: 'Brasil' },
  { numero: 24, searchName: 'Enzo Fernandez', seleccion: 'Argentina' },
  { numero: 20, searchName: 'Alexis Mac Allister', seleccion: 'Argentina' },
  { numero: 413, searchName: 'Julian Alvarez', seleccion: 'Argentina' },
  { numero: 461, searchName: 'Emiliano Martinez', seleccion: 'Argentina' },
  { numero: 507, searchName: 'Lionel Messi', seleccion: 'Argentina' },
  { numero: 22, searchName: 'Lautaro Martinez', seleccion: 'Argentina' },
];

function sanitizeNameForSearch(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos/diacríticos
    .replace(/[^a-zA-Z0-9\s]/g, '')  // Deja solo letras, números y espacios
    .replace(/\s+/g, ' ')            // Colapsa múltiples espacios
    .trim();
}

function getMatchScore(player, searchNameWords) {
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

async function searchPlayer(name) {
  const sanitized = sanitizeNameForSearch(name);
  if (sanitized.length < 3) return null;

  const words = sanitized.split(' ').filter(w => w.length > 0);
  const candidates = [sanitized];
  
  if (words.length >= 3) {
    candidates.push(`${words[words.length - 2]} ${words[words.length - 1]}`);
  }
  if (words.length >= 2) {
    candidates.push(words[words.length - 1]);
    candidates.push(words[0]);
  }

  const uniqueCandidates = Array.from(new Set(candidates));
  let apiResponseList = [];

  for (const queryTerm of uniqueCandidates) {
    // 6-second sleep before each HTTP request to api-football to avoid 429
    await new Promise(resolve => setTimeout(resolve, 6000));

    try {
      console.log(`   Calling API with query: "${queryTerm}"...`);
      const response = await fetch(
        `https://v3.football.api-sports.io/players?season=2022&league=1&search=${encodeURIComponent(queryTerm)}`,
        {
          method: 'GET',
          headers: {
            'x-apisports-key': apiFootballKey,
          }
        }
      );

      if (response.status === 429) {
        console.warn('   ⚠️ Got 429 Rate Limit. Waiting 15 seconds...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        continue;
      }

      if (!response.ok) continue;

      const json = await response.json();
      if (json.errors && Object.keys(json.errors).length > 0) {
        console.warn('   ⚠️ API returned errors:', json.errors);
        continue;
      }

      if (json.response && json.response.length > 0) {
        apiResponseList = json.response;
        break; // Stop trying other candidates if we found results
      }
    } catch (err) {
      console.error('   Error making API request:', err.message || err);
    }
  }

  if (apiResponseList.length > 0) {
    const scoredPlayers = apiResponseList
      .map((item) => ({
        player: item.player,
        score: getMatchScore(item.player, words)
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scoredPlayers.length > 0) {
      return scoredPlayers[0].player;
    }
  }

  return null;
}

function sanitizeNameForFileName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

async function run() {
  console.log('Starting player image seeding from api-football with rate-limiting protection...');

  // Get list of existing objects in 'jugadores' bucket
  console.log('Fetching list of existing cached images in jugadores bucket...');
  const { data: storageFiles, error: listError } = await supabase.storage
    .from('jugadores')
    .list('', { limit: 200 });

  if (listError) {
    console.error('Error listing storage bucket files:', listError.message || listError);
    process.exit(1);
  }

  const cachedFiles = storageFiles || [];

  for (const player of playersToSeed) {
    console.log(`\n🔍 Checking/Searching for ${player.searchName} (Number: ${player.numero})...`);
    
    try {
      // Check if image already exists in storage for this player number
      const existingFile = cachedFiles.find(f => f.name.startsWith(`${player.numero}-`));
      
      if (existingFile) {
        console.log(`   [CACHE HIT] Found existing image in Storage: ${existingFile.name}`);
        const { data } = supabase.storage.from('jugadores').getPublicUrl(existingFile.name);
        const publicUrl = data.publicUrl;
        console.log(`   Public URL: ${publicUrl}`);
        
        // Format name from filename or use searchName
        const namePart = existingFile.name.replace(`${player.numero}-`, '').replace('.png', '').split('_');
        const formattedName = namePart.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        console.log(`   Updating public.figuritas rows for number ${player.numero}...`);
        const { error: dbError } = await supabase
          .from('figuritas')
          .update({
            nombre_jugador: formattedName,
            imagen_url: publicUrl,
            seleccion: player.seleccion
          })
          .eq('numero', player.numero);
          
        if (dbError) throw dbError;
        console.log(`   Successfully updated ${formattedName} (#${player.numero}) from cache!`);
        continue;
      }

      // Cache miss -> Fetch from API
      console.log(`   [CACHE MISS] Querying API for ${player.searchName}...`);
      const bestMatch = await searchPlayer(player.searchName);
      if (!bestMatch) {
        console.warn(`⚠️ Player ${player.searchName} not found or Norway didn't qualify.`);
        continue;
      }

      console.log(`   Found match: ${bestMatch.name} (${bestMatch.nationality})`);
      console.log(`   Photo: ${bestMatch.photo}`);

      const translatedSelection = nationalityTranslations[bestMatch.nationality] || bestMatch.nationality;

      // 2. Download photo
      const photoResp = await fetch(bestMatch.photo);
      if (!photoResp.ok) {
        throw new Error(`Failed to download photo from ${bestMatch.photo}`);
      }
      const arrayBuffer = await photoResp.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 3. Upload to Supabase Storage
      const sanitizedName = sanitizeNameForFileName(bestMatch.name);
      const fileName = `${player.numero}-${sanitizedName}.png`;
      
      console.log(`   Uploading to Supabase Storage as ${fileName}...`);
      const { error: uploadError } = await supabase.storage
        .from('jugadores')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from('jugadores').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;
      console.log(`   Public URL: ${publicUrl}`);

      // 4. Update database
      console.log(`   Updating public.figuritas rows for number ${player.numero}...`);
      const { error: dbError } = await supabase
        .from('figuritas')
        .update({
          nombre_jugador: bestMatch.name,
          imagen_url: publicUrl,
          seleccion: translatedSelection
        })
        .eq('numero', player.numero);

      if (dbError) {
        throw dbError;
      }

      console.log(`   Successfully seeded ${bestMatch.name} (${player.numero})!`);

    } catch (err) {
      console.error(`❌ Error seeding player ${player.searchName}:`, err.message || err);
    }
  }

  console.log('\nSeeding completed successfully!');
}

run();
