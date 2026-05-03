const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// [country_code, risk_level, country_es, lat_min, lat_max, lon_min, lon_max]
const BOXES = [
  ['es','sin-riesgo','España',35.5,43.8,-9.5,4.5],
  ['fr','sin-riesgo','Francia',42,51.5,-5,8.5],
  ['it','sin-riesgo','Italia',36.5,47.5,6,19],
  ['de','sin-riesgo','Alemania',47,55.5,5.5,15.5],
  ['pt','sin-riesgo','Portugal',36.5,42.5,-10,-6],
  ['gb','sin-riesgo','Reino Unido',49.5,61,-8.5,2.5],
  ['gr','sin-riesgo','Grecia',34.5,42,19,30],
  ['au','sin-riesgo','Australia',-44,-10,112,154],
  ['nz','sin-riesgo','Nueva Zelanda',-48,-34,165,179],
  ['jp','sin-riesgo','Japón',24,46,122,146],
  ['us','sin-riesgo','Estados Unidos',24,50,-125,-66],
  ['ca','sin-riesgo','Canadá',41,84,-142,-52],
  ['mx','bajo','México',14,33,-118,-86],
  ['br','bajo','Brasil',-34,5,-74,-34],
  ['ar','bajo','Argentina',-55,-21,-74,-53],
  ['cl','sin-riesgo','Chile',-56,-17,-76,-66],
  ['co','bajo','Colombia',-5,13,-82,-66],
  ['pe','bajo','Perú',-19,0,-82,-68],
  ['in','bajo','India',6,36,67,98],
  ['cn','bajo','China',18,54,73,135],
  ['th','bajo','Tailandia',5,21,97,106],
  ['tr','bajo','Turquía',35.5,43,25.5,45],
  ['ma','bajo','Marruecos',27,36,-13,-1],
  ['eg','bajo','Egipto',21,32,24.5,36],
  ['za','bajo','Sudáfrica',-35,-22,16,33],
  ['id','bajo','Indonesia',-11,6,94,141],
  ['ph','bajo','Filipinas',4,22,116,128],
  ['vn','bajo','Vietnam',8,24,102,110],
  ['kr','sin-riesgo','Corea del Sur',33,39,125,130],
  ['sg','sin-riesgo','Singapur',1,1.5,103,104.5],
  ['pl','sin-riesgo','Polonia',49,55,13,24.5],
  ['cz','sin-riesgo','República Checa',48.5,51.5,11,19],
  ['at','sin-riesgo','Austria',46,49,8.5,18],
  ['ch','sin-riesgo','Suiza',45.5,48,5.5,11],
  ['nl','sin-riesgo','Países Bajos',50.5,54,2.5,7.5],
  ['be','sin-riesgo','Bélgica',49.5,51.8,2.5,6.5],
  ['ie','sin-riesgo','Irlanda',51,55.5,-11,-5.5],
  ['no','sin-riesgo','Noruega',57,71,4,32],
  ['se','sin-riesgo','Suecia',55,69,10,25],
  ['dk','sin-riesgo','Dinamarca',54,58,8,13],
  ['fi','sin-riesgo','Finlandia',59,70,19,32],
  ['hu','sin-riesgo','Hungría',45.5,49,15.5,23],
  ['hr','sin-riesgo','Croacia',42,47,13,20],
  ['bg','sin-riesgo','Bulgaria',41,44.5,22,29],
  ['ro','sin-riesgo','Rumanía',43,48.5,19,30],
  ['sa','medio','Arabia Saudita',16,32,34,56],
  ['il','medio','Israel',29.5,33.5,34,36],
  ['ve','alto','Venezuela',0,13,-73,-59],
  ['ae','sin-riesgo','Emiratos Árabes',22,26.5,51,56.5],
  ['ng','medio','Nigeria',4,14,2.5,15],
  ['ke','bajo','Kenia',-5,5,33,42],
  ['pk','medio','Pakistán',23,37,60,78],
  ['bd','bajo','Bangladesh',20,27,88,93],
  ['mm','medio','Myanmar',9,29,92,102],
  ['kh','medio','Camboya',9.5,15,102,108],
  ['my','bajo','Malasia',0,7.5,99,120],
  ['np','bajo','Nepal',26,31,80,89],
  ['ec','bajo','Ecuador',-5,2,-92,-74],
  ['cr','bajo','Costa Rica',7.5,11.5,-87,-82],
  ['pa','bajo','Panamá',6.5,10,-83,-76],
  ['uy','sin-riesgo','Uruguay',-35,-30,-59,-53],
  ['py','bajo','Paraguay',-28,-19,-63,-54],
  ['bo','bajo','Bolivia',-23,-9,-70,-57],
  ['jm','bajo','Jamaica',17.5,18.8,-79,-75],
  ['do','bajo','República Dominicana',17.5,20,-72,-68],
  ['gt','bajo','Guatemala',13.5,18,-92.5,-88],
  ['tn','sin-riesgo','Túnez',30,38,7.5,12],
  ['dz','bajo','Argelia',18,38,-9,12],
  ['lk','bajo','Sri Lanka',5.5,10,79,82],
  ['jo','bajo','Jordania',29,33.5,34.5,39.5],
  ['qa','bajo','Catar',24.2,26.5,50.5,52.5],
  ['om','sin-riesgo','Omán',16.5,24,51.5,60],
  ['lb','medio','Líbano',33,35,35,37],
  ['tz','bajo','Tanzania',-12,0,29,41],
  ['et','bajo','Etiopía',3,15,32,48],
  ['gh','bajo','Ghana',4,12,-4,2],
  ['sn','bajo','Senegal',11.5,17,-18,-11],
  ['af','muy-alto','Afganistán',29,39,60,75],
  ['sy','muy-alto','Siria',32,37.5,35.5,42.5],
  ['ye','muy-alto','Yemen',11,19,41,55],
  ['ly','muy-alto','Libia',18,34,8,26],
  ['sd','muy-alto','Sudán',8,23,21,39],
  ['ht','muy-alto','Haití',17,20.5,-75,-71],
  ['cu','bajo','Cuba',19.5,24,-85,-73],
];

async function main() {
  let totalUpdated = 0;
  
  for (const [code, risk, name, latMin, latMax, lonMin, lonMax] of BOXES) {
    const { data, error } = await supabase
      .from('places')
      .update({ country_code: code, risk_level: risk, country_name: name })
      .is('country_code', null)
      .gte('lat', latMin)
      .lte('lat', latMax)
      .gte('lon', lonMin)
      .lte('lon', lonMax);
    
    if (error) {
      console.error(`❌ ${name}: ${error.message}`);
    } else {
      console.log(`✅ ${name} (${code}): actualizado`);
      totalUpdated++;
    }
  }
  
  const { count } = await supabase.from('places').select('*', { count: 'exact', head: true }).is('country_code', null);
  console.log(`\n📍 Sin country_code: ${count}`);
  console.log('🎉 ¡Hecho!');
}

main();
