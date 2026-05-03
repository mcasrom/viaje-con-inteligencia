const https = require('https');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CSV_URL = 'https://raw.githubusercontent.com/curran/data/gh-pages/geonames/cities15000.csv';

function downloadCsv(url) {
  return new Promise((resolve, reject) => {
    let data = '';
    https.get(url, (res) => {
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const header = lines[0]; // city,latitude,longitude,population
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Formato: name,lat,lon,pop
    // Puede tener comillas en el nombre si contiene comas
    let parts = [];
    if (line.startsWith('"')) {
      const match = line.match(/^"((?:[^"]|"")*)",(.+)$/);
      if (match) {
        const name = match[1].replace(/""/g, '"');
        const rest = match[2].split(',');
        parts = [name, ...rest];
      }
    } else {
      parts = line.split(',');
    }
    
    if (parts.length >= 4) {
      const name = parts[0].trim();
      const lat = parseFloat(parts[1]);
      const lon = parseFloat(parts[2]);
      const pop = parseInt(parts[3], 10);
      rows.push({ name, lat, lon, pop });
    }
  }
  
  return rows;
}

async function main() {
  try {
    console.log('🌍 Descargando 23.000 ciudades...');
    const csv = await downloadCsv(CSV_URL);
    console.log('📝 Parseando...');
    const cities = parseCsv(csv);
    
    console.log(`🚀 Insertando ${cities.length} ciudades en lotes...`);

    const inserts = cities
      .filter(c => !isNaN(c.lat) && !isNaN(c.lon) && c.name)
      .map(c => ({
        name: c.name,
        type: c.pop > 100000 ? 'city' : 'town',
        country_code: null,
        country_name: null,
        lat: c.lat,
        lon: c.lon,
        description: null,
        risk_level: 'sin-riesgo',
        poi_count: 0,
        population: c.pop >= 1000000 ? (c.pop/1000000).toFixed(1) + 'M' : Math.round(c.pop/1000) + 'K',
      }));

    const batchSize = 1000;
    for (let i = 0; i < inserts.length; i += batchSize) {
      const batch = inserts.slice(i, i + batchSize);
      const { error } = await supabase.from('places').insert(batch);
      if (error) {
        console.error(`❌ Error lote ${i/batchSize}:`, error.message);
      } else {
        console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(inserts.length/batchSize)} (${batch.length})`);
      }
    }
    
    console.log('🎉 ¡Importación completada!');
  } catch (e) {
    console.error(e);
  }
}

main();
