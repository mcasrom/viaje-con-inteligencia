-- 1. Crear tabla temporal con country codes
CREATE TEMP TABLE temp_countries (
  city_name TEXT,
  country_name TEXT,
  iso2 TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION
);

-- 2. Los datos se insertan via COPY o manualmente
-- Como no podemos hacer COPY desde SQL Editor, vamos directo con UPDATEs por nombre de país
-- que ya tenemos en las 7 ciudades manuales y el resto lo cubrimos con bounding boxes

-- Actualizar España
UPDATE places SET country_code='es', risk_level='sin-riesgo', country_name='España'
WHERE country_name IS NULL AND lat BETWEEN 35.5 AND 43.8 AND lon BETWEEN -9.5 AND 4.5;

-- Francia
UPDATE places SET country_code='fr', risk_level='sin-riesgo', country_name='Francia'
WHERE country_name IS NULL AND lat BETWEEN 42 AND 51.5 AND lon BETWEEN -5 AND 8.5;

-- Italia
UPDATE places SET country_code='it', risk_level='sin-riesgo', country_name='Italia'
WHERE country_name IS NULL AND lat BETWEEN 36.5 AND 47.5 AND lon BETWEEN 6 AND 19;

-- Alemania
UPDATE places SET country_code='de', risk_level='sin-riesgo', country_name='Alemania'
WHERE country_name IS NULL AND lat BETWEEN 47 AND 55.5 AND lon BETWEEN 5.5 AND 15.5;

-- Portugal
UPDATE places SET country_code='pt', risk_level='sin-riesgo', country_name='Portugal'
WHERE country_name IS NULL AND lat BETWEEN 36.5 AND 42.5 AND lon BETWEEN -10 AND -6;

-- Reino Unido
UPDATE places SET country_code='gb', risk_level='sin-riesgo', country_name='Reino Unido'
WHERE country_name IS NULL AND lat BETWEEN 49.5 AND 61 AND lon BETWEEN -8.5 AND 2.5;

-- Grecia
UPDATE places SET country_code='gr', risk_level='sin-riesgo', country_name='Grecia'
WHERE country_name IS NULL AND lat BETWEEN 34.5 AND 42 AND lon BETWEEN 19 AND 30;

-- Australia
UPDATE places SET country_code='au', risk_level='sin-riesgo', country_name='Australia'
WHERE country_name IS NULL AND lat BETWEEN -44 AND -10 AND lon BETWEEN 112 AND 154;

-- Nueva Zelanda
UPDATE places SET country_code='nz', risk_level='sin-riesgo', country_name='Nueva Zelanda'
WHERE country_name IS NULL AND lat BETWEEN -48 AND -34 AND lon BETWEEN 165 AND 179;

-- Japón
UPDATE places SET country_code='jp', risk_level='sin-riesgo', country_name='Japón'
WHERE country_name IS NULL AND lat BETWEEN 24 AND 46 AND lon BETWEEN 122 AND 146;

-- Estados Unidos
UPDATE places SET country_code='us', risk_level='sin-riesgo', country_name='Estados Unidos'
WHERE country_name IS NULL AND lat BETWEEN 24 AND 50 AND lon BETWEEN -125 AND -66;

-- Canadá
UPDATE places SET country_code='ca', risk_level='sin-riesgo', country_name='Canadá'
WHERE country_name IS NULL AND lat BETWEEN 41 AND 84 AND lon BETWEEN -142 AND -52;

-- México
UPDATE places SET country_code='mx', risk_level='bajo', country_name='México'
WHERE country_name IS NULL AND lat BETWEEN 14 AND 33 AND lon BETWEEN -118 AND -86;

-- Brasil
UPDATE places SET country_code='br', risk_level='bajo', country_name='Brasil'
WHERE country_name IS NULL AND lat BETWEEN -34 AND 5 AND lon BETWEEN -74 AND -34;

-- Argentina
UPDATE places SET country_code='ar', risk_level='bajo', country_name='Argentina'
WHERE country_name IS NULL AND lat BETWEEN -55 AND -21 AND lon BETWEEN -74 AND -53;

-- Chile
UPDATE places SET country_code='cl', risk_level='sin-riesgo', country_name='Chile'
WHERE country_name IS NULL AND lat BETWEEN -56 AND -17 AND lon BETWEEN -76 AND -66;

-- Colombia
UPDATE places SET country_code='co', risk_level='bajo', country_name='Colombia'
WHERE country_name IS NULL AND lat BETWEEN -5 AND 13 AND lon BETWEEN -82 AND -66;

-- Perú
UPDATE places SET country_code='pe', risk_level='bajo', country_name='Perú'
WHERE country_name IS NULL AND lat BETWEEN -19 AND 0 AND lon BETWEEN -82 AND -68;

-- India
UPDATE places SET country_code='in', risk_level='bajo', country_name='India'
WHERE country_name IS NULL AND lat BETWEEN 6 AND 36 AND lon BETWEEN 67 AND 98;

-- China
UPDATE places SET country_code='cn', risk_level='bajo', country_name='China'
WHERE country_name IS NULL AND lat BETWEEN 18 AND 54 AND lon BETWEEN 73 AND 135;

-- Tailandia
UPDATE places SET country_code='th', risk_level='bajo', country_name='Tailandia'
WHERE country_name IS NULL AND lat BETWEEN 5 AND 21 AND lon BETWEEN 97 AND 106;

-- Turquía
UPDATE places SET country_code='tr', risk_level='bajo', country_name='Turquía'
WHERE country_name IS NULL AND lat BETWEEN 35.5 AND 43 AND lon BETWEEN 25.5 AND 45;

-- Marruecos
UPDATE places SET country_code='ma', risk_level='bajo', country_name='Marruecos'
WHERE country_name IS NULL AND lat BETWEEN 27 AND 36 AND lon BETWEEN -13 AND -1;

-- Egipto
UPDATE places SET country_code='eg', risk_level='bajo', country_name='Egipto'
WHERE country_name IS NULL AND lat BETWEEN 21 AND 32 AND lon BETWEEN 24.5 AND 36;

-- Sudáfrica
UPDATE places SET country_code='za', risk_level='bajo', country_name='Sudáfrica'
WHERE country_name IS NULL AND lat BETWEEN -35 AND -22 AND lon BETWEEN 16 AND 33;

-- Indonesia
UPDATE places SET country_code='id', risk_level='bajo', country_name='Indonesia'
WHERE country_name IS NULL AND lat BETWEEN -11 AND 6 AND lon BETWEEN 94 AND 141;

-- Filipinas
UPDATE places SET country_code='ph', risk_level='bajo', country_name='Filipinas'
WHERE country_name IS NULL AND lat BETWEEN 4 AND 22 AND lon BETWEEN 116 AND 128;

-- Vietnam
UPDATE places SET country_code='vn', risk_level='bajo', country_name='Vietnam'
WHERE country_name IS NULL AND lat BETWEEN 8 AND 24 AND lon BETWEEN 102 AND 110;

-- Corea del Sur
UPDATE places SET country_code='kr', risk_level='sin-riesgo', country_name='Corea del Sur'
WHERE country_name IS NULL AND lat BETWEEN 33 AND 39 AND lon BETWEEN 125 AND 130;

-- Singapur
UPDATE places SET country_code='sg', risk_level='sin-riesgo', country_name='Singapur'
WHERE country_name IS NULL AND lat BETWEEN 1 AND 1.5 AND lon BETWEEN 103 AND 104.5;

-- Polonia
UPDATE places SET country_code='pl', risk_level='sin-riesgo', country_name='Polonia'
WHERE country_name IS NULL AND lat BETWEEN 49 AND 55 AND lon BETWEEN 13 AND 24.5;

-- República Checa
UPDATE places SET country_code='cz', risk_level='sin-riesgo', country_name='República Checa'
WHERE country_name IS NULL AND lat BETWEEN 48.5 AND 51.5 AND lon BETWEEN 11 AND 19;

-- Austria
UPDATE places SET country_code='at', risk_level='sin-riesgo', country_name='Austria'
WHERE country_name IS NULL AND lat BETWEEN 46 AND 49 AND lon BETWEEN 8.5 AND 18;

-- Suiza
UPDATE places SET country_code='ch', risk_level='sin-riesgo', country_name='Suiza'
WHERE country_name IS NULL AND lat BETWEEN 45.5 AND 48 AND lon BETWEEN 5.5 AND 11;

-- Países Bajos
UPDATE places SET country_code='nl', risk_level='sin-riesgo', country_name='Países Bajos'
WHERE country_name IS NULL AND lat BETWEEN 50.5 AND 54 AND lon BETWEEN 2.5 AND 7.5;

-- Bélgica
UPDATE places SET country_code='be', risk_level='sin-riesgo', country_name='Bélgica'
WHERE country_name IS NULL AND lat BETWEEN 49.5 AND 51.8 AND lon BETWEEN 2.5 AND 6.5;

-- Irlanda
UPDATE places SET country_code='ie', risk_level='sin-riesgo', country_name='Irlanda'
WHERE country_name IS NULL AND lat BETWEEN 51 AND 55.5 AND lon BETWEEN -11 AND -5.5;

-- Noruega
UPDATE places SET country_code='no', risk_level='sin-riesgo', country_name='Noruega'
WHERE country_name IS NULL AND lat BETWEEN 57 AND 71 AND lon BETWEEN 4 AND 32;

-- Suecia
UPDATE places SET country_code='se', risk_level='sin-riesgo', country_name='Suecia'
WHERE country_name IS NULL AND lat BETWEEN 55 AND 69 AND lon BETWEEN 10 AND 25;

-- Dinamarca
UPDATE places SET country_code='dk', risk_level='sin-riesgo', country_name='Dinamarca'
WHERE country_name IS NULL AND lat BETWEEN 54 AND 58 AND lon BETWEEN 8 AND 13;

-- Finlandia
UPDATE places SET country_code='fi', risk_level='sin-riesgo', country_name='Finlandia'
WHERE country_name IS NULL AND lat BETWEEN 59 AND 70 AND lon BETWEEN 19 AND 32;

-- Hungría
UPDATE places SET country_code='hu', risk_level='sin-riesgo', country_name='Hungría'
WHERE country_name IS NULL AND lat BETWEEN 45.5 AND 49 AND lon BETWEEN 15.5 AND 23;

-- Croacia
UPDATE places SET country_code='hr', risk_level='sin-riesgo', country_name='Croacia'
WHERE country_name IS NULL AND lat BETWEEN 42 AND 47 AND lon BETWEEN 13 AND 20;

-- Bulgaria
UPDATE places SET country_code='bg', risk_level='sin-riesgo', country_name='Bulgaria'
WHERE country_name IS NULL AND lat BETWEEN 41 AND 44.5 AND lon BETWEEN 22 AND 29;

-- Rumanía
UPDATE places SET country_code='ro', risk_level='sin-riesgo', country_name='Rumanía'
WHERE country_name IS NULL AND lat BETWEEN 43 AND 48.5 AND lon BETWEEN 19 AND 30;

-- Arabia Saudita
UPDATE places SET country_code='sa', risk_level='medio', country_name='Arabia Saudita'
WHERE country_name IS NULL AND lat BETWEEN 16 AND 32 AND lon BETWEEN 34 AND 56;

-- Israel
UPDATE places SET country_code='il', risk_level='medio', country_name='Israel'
WHERE country_name IS NULL AND lat BETWEEN 29.5 AND 33.5 AND lon BETWEEN 34 AND 36;

-- Venezuela
UPDATE places SET country_code='ve', risk_level='alto', country_name='Venezuela'
WHERE country_name IS NULL AND lat BETWEEN 0 AND 13 AND lon BETWEEN -73 AND -59;

-- Emiratos Árabes
UPDATE places SET country_code='ae', risk_level='sin-riesgo', country_name='Emiratos Árabes'
WHERE country_name IS NULL AND lat BETWEEN 22 AND 26.5 AND lon BETWEEN 51 AND 56.5;

-- Nigeria
UPDATE places SET country_code='ng', risk_level='medio', country_name='Nigeria'
WHERE country_name IS NULL AND lat BETWEEN 4 AND 14 AND lon BETWEEN 2.5 AND 15;

-- Kenia
UPDATE places SET country_code='ke', risk_level='bajo', country_name='Kenia'
WHERE country_name IS NULL AND lat BETWEEN -5 AND 5 AND lon BETWEEN 33 AND 42;

-- Argentina (completar Patagonia)
UPDATE places SET country_code='ar', risk_level='bajo', country_name='Argentina'
WHERE country_name IS NULL AND lat BETWEEN -56 AND -21 AND lon BETWEEN -74 AND -53;

-- Pakistán
UPDATE places SET country_code='pk', risk_level='medio', country_name='Pakistán'
WHERE country_name IS NULL AND lat BETWEEN 23 AND 37 AND lon BETWEEN 60 AND 78;

-- Bangladesh
UPDATE places SET country_code='bd', risk_level='bajo', country_name='Bangladesh'
WHERE country_name IS NULL AND lat BETWEEN 20 AND 27 AND lon BETWEEN 88 AND 93;

-- Myanmar
UPDATE places SET country_code='mm', risk_level='medio', country_name='Myanmar'
WHERE country_name IS NULL AND lat BETWEEN 9 AND 29 AND lon BETWEEN 92 AND 102;

-- Camboya
UPDATE places SET country_code='kh', risk_level='medio', country_name='Camboya'
WHERE country_name IS NULL AND lat BETWEEN 9.5 AND 15 AND lon BETWEEN 102 AND 108;

-- Malasia
UPDATE places SET country_code='my', risk_level='bajo', country_name='Malasia'
WHERE country_name IS NULL AND lat BETWEEN 0 AND 7.5 AND lon BETWEEN 99 AND 120;

-- Nepal
UPDATE places SET country_code='np', risk_level='bajo', country_name='Nepal'
WHERE country_name IS NULL AND lat BETWEEN 26 AND 31 AND lon BETWEEN 80 AND 89;

-- Ecuador
UPDATE places SET country_code='ec', risk_level='bajo', country_name='Ecuador'
WHERE country_name IS NULL AND lat BETWEEN -5 AND 2 AND lon BETWEEN -92 AND -74;

-- Costa Rica
UPDATE places SET country_code='cr', risk_level='bajo', country_name='Costa Rica'
WHERE country_name IS NULL AND lat BETWEEN 7.5 AND 11.5 AND lon BETWEEN -87 AND -82;

-- Panamá
UPDATE places SET country_code='pa', risk_level='bajo', country_name='Panamá'
WHERE country_name IS NULL AND lat BETWEEN 6.5 AND 10 AND lon BETWEEN -83 AND -76;

-- Uruguay
UPDATE places SET country_code='uy', risk_level='sin-riesgo', country_name='Uruguay'
WHERE country_name IS NULL AND lat BETWEEN -35 AND -30 AND lon BETWEEN -59 AND -53;

-- Paraguay
UPDATE places SET country_code='py', risk_level='bajo', country_name='Paraguay'
WHERE country_name IS NULL AND lat BETWEEN -28 AND -19 AND lon BETWEEN -63 AND -54;

-- Bolivia
UPDATE places SET country_code='bo', risk_level='bajo', country_name='Bolivia'
WHERE country_name IS NULL AND lat BETWEEN -23 AND -9 AND lon BETWEEN -70 AND -57;

-- Jamaica
UPDATE places SET country_code='jm', risk_level='bajo', country_name='Jamaica'
WHERE country_name IS NULL AND lat BETWEEN 17.5 AND 18.8 AND lon BETWEEN -79 AND -75;

-- Cuba
UPDATE places SET country_code='cu', risk_level='bajo', country_name='Cuba'
WHERE country_name IS NULL AND lat BETWEEN 19.5 AND 24 AND lon BETWEEN -85 AND -73;

-- República Dominicana
UPDATE places SET country_code='do', risk_level='bajo', country_name='República Dominicana'
WHERE country_name IS NULL AND lat BETWEEN 17.5 AND 20 AND lon BETWEEN -72 AND -68;

-- Guatemala
UPDATE places SET country_code='gt', risk_level='bajo', country_name='Guatemala'
WHERE country_name IS NULL AND lat BETWEEN 13.5 AND 18 AND lon BETWEEN -92.5 AND -88;

-- Túnez
UPDATE places SET country_code='tn', risk_level='sin-riesgo', country_name='Túnez'
WHERE country_name IS NULL AND lat BETWEEN 30 AND 38 AND lon BETWEEN 7.5 AND 12;

-- Argelia
UPDATE places SET country_code='dz', risk_level='bajo', country_name='Argelia'
WHERE country_name IS NULL AND lat BETWEEN 18 AND 38 AND lon BETWEEN -9 AND 12;

-- Sri Lanka
UPDATE places SET country_code='lk', risk_level='bajo', country_name='Sri Lanka'
WHERE country_name IS NULL AND lat BETWEEN 5.5 AND 10 AND lon BETWEEN 79 AND 82;

-- Jordania
UPDATE places SET country_code='jo', risk_level='bajo', country_name='Jordania'
WHERE country_name IS NULL AND lat BETWEEN 29 AND 33.5 AND lon BETWEEN 34.5 AND 39.5;

-- Catar
UPDATE places SET country_code='qa', risk_level='bajo', country_name='Catar'
WHERE country_name IS NULL AND lat BETWEEN 24.2 AND 26.5 AND lon BETWEEN 50.5 AND 52.5;

-- Omán
UPDATE places SET country_code='om', risk_level='sin-riesgo', country_name='Omán'
WHERE country_name IS NULL AND lat BETWEEN 16.5 AND 24 AND lon BETWEEN 51.5 AND 60;

-- Líbano
UPDATE places SET country_code='lb', risk_level='medio', country_name='Líbano'
WHERE country_name IS NULL AND lat BETWEEN 33 AND 35 AND lon BETWEEN 35 AND 37;

-- Tanzania
UPDATE places SET country_code='tz', risk_level='bajo', country_name='Tanzania'
WHERE country_name IS NULL AND lat BETWEEN -12 AND 0 AND lon BETWEEN 29 AND 41;

-- Etiopía
UPDATE places SET country_code='et', risk_level='bajo', country_name='Etiopía'
WHERE country_name IS NULL AND lat BETWEEN 3 AND 15 AND lon BETWEEN 32 AND 48;

-- Ghana
UPDATE places SET country_code='gh', risk_level='bajo', country_name='Ghana'
WHERE country_name IS NULL AND lat BETWEEN 4 AND 12 AND lon BETWEEN -4 AND 2;

-- Senegal
UPDATE places SET country_code='sn', risk_level='bajo', country_name='Senegal'
WHERE country_name IS NULL AND lat BETWEEN 11.5 AND 17 AND lon BETWEEN -18 AND -11;

-- Túnez (redundante, confirmar)
-- Ver resultado
SELECT country_code, risk_level, COUNT(*) 
FROM places 
WHERE country_code IS NOT NULL 
GROUP BY country_code, risk_level 
ORDER BY COUNT(*) DESC;
