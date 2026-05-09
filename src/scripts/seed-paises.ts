// seed-paises.ts — Genera JSON para seed a Supabase
// Ejecutar: npx tsx src/scripts/seed-paises.ts
import { paisesData, emergenciasData } from '../data/paises';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PaisRow {
  codigo: string;
  nombre: string;
  capital: string;
  continente: string;
  nivel_riesgo: string;
  ultimo_informe: string;
  bandera: string;
  visible: boolean;
  data: any;
}

const paises: PaisRow[] = [];
const emergencias: any[] = [];

for (const [code, pais] of Object.entries(paisesData)) {
  paises.push({
    codigo: code,
    nombre: pais.nombre,
    capital: pais.capital || '',
    continente: pais.continente || '',
    nivel_riesgo: pais.nivelRiesgo,
    ultimo_informe: pais.ultimoInforme || '',
    bandera: pais.bandera || '',
    visible: pais.visible !== false,
    data: {
      idioma: pais.idioma,
      moneda: pais.moneda,
      tipoCambio: pais.tipoCambio,
      zonaHoraria: pais.zonaHoraria,
      conduccion: pais.conduccion,
      poblacion: pais.poblacion,
      pib: pais.pib,
      indicadores: pais.indicadores,
      voltaje: pais.voltaje,
      prefijoTelefono: pais.prefijoTelefono,
      contactos: pais.contactos,
      requerimientos: pais.requerimientos,
      queHacer: pais.queHacer,
      queNoHacer: pais.queNoHacer,
      diarios: pais.diarios,
      urlsUtiles: pais.urlsUtiles,
      mapaCoordenadas: pais.mapaCoordenadas,
      transporte: pais.transporte,
      turisticos: pais.turisticos,
      economicos: pais.economicos,
    },
  });
}

for (const [code, em] of Object.entries(emergenciasData)) {
  emergencias.push({ codigo: code, ...em });
}

const output = { paises, emergencias };
const outPath = path.join(__dirname, '../../supabase/seed-paises.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`Generated: ${paises.length} countries, ${emergencias.length} emergency contacts → supabase/seed-paises.json`);
