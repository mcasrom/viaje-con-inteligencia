// upsert-paises.ts — Sube los datos a Supabase
// Ejecutar: npx tsx src/scripts/upsert-paises.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const seedPath = path.join(__dirname, '../../supabase/seed-paises.json');
  const raw = fs.readFileSync(seedPath, 'utf-8');
  const { paises, emergencias } = JSON.parse(raw);

  // Insertar países
  let ok = 0, err = 0;
  for (const p of paises) {
    const { error } = await supabase.from('paises').upsert({
      codigo: p.codigo,
      nombre: p.nombre,
      capital: p.capital,
      continente: p.continente,
      nivel_riesgo: p.nivel_riesgo,
      ultimo_informe: p.ultimo_informe,
      bandera: p.bandera,
      visible: p.visible,
      data: p.data,
    }, { onConflict: 'codigo' });
    if (error) { console.error(`Error ${p.codigo}:`, error.message); err++; }
    else ok++;
  }
  console.log(`Países: ${ok} upserted, ${err} errors`);

  // Insertar emergencias
  ok = 0; err = 0;
  for (const e of emergencias) {
    const { error } = await supabase.from('emergencias').upsert({
      codigo: e.codigo,
      general: e.general,
      policia: e.policia,
      bomberos: e.bomberos,
      ambulancia: e.ambulancia,
    }, { onConflict: 'codigo' });
    if (error) { console.error(`Error emergencia ${e.codigo}:`, error.message); err++; }
    else ok++;
  }
  console.log(`Emergencias: ${ok} upserted, ${err} errors`);
}

main().catch(console.error);
