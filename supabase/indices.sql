CREATE TABLE IF NOT EXISTS indices (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('gpi', 'gti', 'hdi', 'ipc')),
  codigo_pais TEXT NOT NULL,
  nombre_pais TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  rank INTEGER,
  cambio INTEGER DEFAULT 0,
  nivel TEXT,
  region TEXT,
  fuente TEXT DEFAULT 'manual',
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_indices_tipo ON indices(tipo);
CREATE INDEX IF NOT EXISTS idx_indices_codigo_pais ON indices(codigo_pais);

INSERT INTO indices (id, tipo, codigo_pais, nombre_pais, valor, rank, cambio, region, fuente)
SELECT 'gpi-' || lower(code), 'gpi', lower(code), country, score, rank, change, region, 'IEP 2026'
FROM (
  VALUES
    (1, 'Islandia', 'IS', 1.095, 0, 'Europa'),
    (2, 'Irlanda', 'IE', 1.260, 0, 'Europa'),
    (3, 'Nueva Zelanda', 'NZ', 1.282, 2, 'Oceania'),
    (4, 'Austria', 'AT', 1.294, -1, 'Europa'),
    (5, 'Suiza', 'CH', 1.294, -1, 'Europa'),
    (6, 'Singapur', 'SG', 1.357, 0, 'Asia'),
    (7, 'Portugal', 'PT', 1.361, 1, 'Europa'),
    (8, 'Dinamarca', 'DK', 1.374, -1, 'Europa'),
    (9, 'Eslovenia', 'SI', 1.380, 2, 'Europa'),
    (10, 'Japon', 'JP', 1.387, -1, 'Asia'),
    (11, 'China', 'CN', 1.394, 0, 'Asia'),
    (12, 'India', 'IN', 1.410, 0, 'Asia'),
    (13, 'Alemania', 'DE', 1.433, 0, 'Europa'),
    (14, 'Canada', 'CA', 1.491, -5, 'Norteamerica'),
    (15, 'Croacia', 'HR', 1.492, 4, 'Europa'),
    (16, 'Belgica', 'BE', 1.492, 4, 'Europa'),
    (17, 'Rep. Checa', 'CZ', 1.498, -1, 'Europa'),
    (18, 'Finlandia', 'FI', 1.514, -3, 'Europa'),
    (19, 'Noruega', 'NO', 1.521, 0, 'Europa'),
    (20, 'Francia', 'FR', 1.542, 0, 'Europa'),
    (21, 'Espana', 'ES', 1.547, 1, 'Europa'),
    (22, 'Suecia', 'SE', 1.550, -1, 'Europa'),
    (23, 'Italia', 'IT', 1.563, 0, 'Europa'),
    (24, 'Brasil', 'BR', 1.570, 2, 'Latinoamerica'),
    (25, 'Hungria', 'HU', 1.575, 0, 'Europa'),
    (26, 'Polonia', 'PL', 1.592, 1, 'Europa'),
    (27, 'Eslovaquia', 'SK', 1.596, -1, 'Europa'),
    (28, 'Malta', 'MT', 1.604, 0, 'Europa'),
    (29, 'Rumania', 'RO', 1.622, 0, 'Europa'),
    (30, 'Emiratos Arabes', 'AE', 1.629, 2, 'Oriente Medio'),
    (31, 'Argentina', 'AR', 1.641, 0, 'Latinoamerica'),
    (32, 'Chile', 'CL', 1.651, 1, 'Latinoamerica'),
    (33, 'Uruguay', 'UY', 1.659, -1, 'Latinoamerica'),
    (34, 'Georgia', 'GE', 1.665, 2, 'Europa'),
    (35, 'Costa Rica', 'CR', 1.679, 0, 'Latinoamerica'),
    (36, 'Corea del Sur', 'KR', 1.681, -1, 'Asia'),
    (37, 'Grecia', 'GR', 1.700, 0, 'Europa'),
    (38, 'Marruecos', 'MA', 1.712, 1, 'Africa'),
    (39, 'Reino Unido', 'GB', 1.716, 1, 'Europa'),
    (40, 'EE.UU.', 'US', 2.231, 0, 'Norteamerica'),
    (41, 'Mexico', 'MX', 2.380, 0, 'Latinoamerica'),
    (42, 'Turquia', 'TR', 2.425, 0, 'Europa'),
    (43, 'Egipto', 'EG', 2.445, 0, 'Africa'),
    (44, 'Tailandia', 'TH', 2.468, 0, 'Asia'),
    (45, 'Rusia', 'RU', 3.441, -2, 'Europa'),
    (46, 'Afganistan', 'AF', 3.929, 0, 'Asia')
) AS g(rank, country, code, score, change, region)
WHERE NOT EXISTS (SELECT 1 FROM indices WHERE tipo = 'gpi');

INSERT INTO indices (id, tipo, codigo_pais, nombre_pais, valor, rank, cambio, region, fuente)
SELECT 'gti-' || lower(code), 'gti', lower(code), country, score, rank, change, region, 'IEP 2026'
FROM (
  VALUES
    (1, 'Irlanda', 'IE', 1.0, 0, 'Europa'),
    (2, 'Nueva Zelanda', 'NZ', 1.1, 0, 'Oceania'),
    (3, 'Luxemburgo', 'LU', 1.2, 0, 'Europa'),
    (4, 'Suiza', 'CH', 1.3, 0, 'Europa'),
    (5, 'Noruega', 'NO', 1.4, 0, 'Europa'),
    (6, 'Dinamarca', 'DK', 1.5, 0, 'Europa'),
    (7, 'Suecia', 'SE', 1.6, 0, 'Europa'),
    (8, 'Finlandia', 'FI', 1.7, 0, 'Europa'),
    (9, 'Islandia', 'IS', 1.8, 0, 'Europa'),
    (10, 'Eslovenia', 'SI', 1.9, 0, 'Europa'),
    (11, 'Austria', 'AT', 2.0, 0, 'Europa'),
    (12, 'Japon', 'JP', 2.1, 0, 'Asia'),
    (13, 'Singapur', 'SG', 2.2, 0, 'Asia'),
    (14, 'Portugal', 'PT', 2.3, 0, 'Europa'),
    (15, 'Rep. Checa', 'CZ', 2.4, 0, 'Europa'),
    (16, 'Corea del Sur', 'KR', 2.5, 0, 'Asia'),
    (17, 'Espana', 'ES', 2.6, 0, 'Europa'),
    (18, 'Italia', 'IT', 2.7, 0, 'Europa'),
    (19, 'Alemania', 'DE', 2.8, 0, 'Europa'),
    (20, 'Francia', 'FR', 2.9, 0, 'Europa'),
    (21, 'Canada', 'CA', 3.0, 0, 'Norteamerica'),
    (22, 'Belgica', 'BE', 3.1, 0, 'Europa'),
    (23, 'Australia', 'AU', 3.2, 0, 'Oceania'),
    (24, 'Paises Bajos', 'NL', 3.3, 0, 'Europa'),
    (25, 'Reino Unido', 'GB', 3.4, 0, 'Europa'),
    (26, 'Grecia', 'GR', 3.5, 0, 'Europa'),
    (27, 'Croacia', 'HR', 3.6, 0, 'Europa'),
    (28, 'Polonia', 'PL', 3.7, 0, 'Europa'),
    (29, 'Hungria', 'HU', 3.8, 0, 'Europa'),
    (30, 'Emiratos Arabes', 'AE', 3.9, 0, 'Oriente Medio'),
    (31, 'Chile', 'CL', 4.0, 0, 'Latinoamerica'),
    (32, 'Argentina', 'AR', 4.1, 0, 'Latinoamerica'),
    (33, 'Costa Rica', 'CR', 4.2, 0, 'Latinoamerica'),
    (34, 'Mexico', 'MX', 4.5, 0, 'Latinoamerica'),
    (35, 'Brasil', 'BR', 4.6, 0, 'Latinoamerica'),
    (36, 'India', 'IN', 4.7, 0, 'Asia'),
    (37, 'Egipto', 'EG', 4.8, 0, 'Africa'),
    (38, 'Turquia', 'TR', 4.9, 0, 'Europa'),
    (39, 'Tailandia', 'TH', 5.0, 0, 'Asia'),
    (40, 'Rusia', 'RU', 5.2, 0, 'Europa'),
    (41, 'EE.UU.', 'US', 5.3, 0, 'Norteamerica'),
    (42, 'Pakistan', 'PK', 5.5, 0, 'Asia'),
    (43, 'Irak', 'IQ', 5.8, 0, 'Oriente Medio'),
    (44, 'Siria', 'SY', 6.1, 0, 'Oriente Medio'),
    (45, 'Yemen', 'YE', 6.3, 0, 'Oriente Medio'),
    (46, 'Afganistan', 'AF', 6.5, 0, 'Asia'),
    (47, 'Somalia', 'SO', 6.7, 0, 'Africa'),
    (48, 'Rep. Centroafricana', 'CF', 6.8, 0, 'Africa')
) AS g(rank, country, code, score, change, region)
WHERE NOT EXISTS (SELECT 1 FROM indices WHERE tipo = 'gti');

INSERT INTO indices (id, tipo, codigo_pais, nombre_pais, valor, rank, cambio, region, fuente)
SELECT 'hdi-' || lower(code), 'hdi', lower(code), country, score, rank, change, region, 'UNDP 2024'
FROM (
  VALUES
    (1, 'Suiza', 'CH', 0.967, 0, 'Europa'),
    (2, 'Noruega', 'NO', 0.966, 0, 'Europa'),
    (3, 'Islandia', 'IS', 0.959, 0, 'Europa'),
    (4, 'Hong Kong', 'HK', 0.956, 0, 'Asia'),
    (5, 'Australia', 'AU', 0.946, 0, 'Oceania'),
    (6, 'Dinamarca', 'DK', 0.946, 0, 'Europa'),
    (7, 'Suecia', 'SE', 0.945, 0, 'Europa'),
    (8, 'Irlanda', 'IE', 0.945, 0, 'Europa'),
    (9, 'Alemania', 'DE', 0.942, 0, 'Europa'),
    (10, 'Paises Bajos', 'NL', 0.941, 0, 'Europa'),
    (11, 'Finlandia', 'FI', 0.940, 0, 'Europa'),
    (12, 'Singapur', 'SG', 0.939, 0, 'Asia'),
    (13, 'Belgica', 'BE', 0.937, 0, 'Europa'),
    (14, 'Nueva Zelanda', 'NZ', 0.937, 0, 'Oceania'),
    (15, 'Canada', 'CA', 0.935, 0, 'Norteamerica'),
    (16, 'Liechtenstein', 'LI', 0.935, 0, 'Europa'),
    (17, 'Luxemburgo', 'LU', 0.930, 0, 'Europa'),
    (18, 'Reino Unido', 'GB', 0.929, 0, 'Europa'),
    (19, 'Japon', 'JP', 0.929, 0, 'Asia'),
    (20, 'Corea del Sur', 'KR', 0.925, 0, 'Asia'),
    (21, 'EE.UU.', 'US', 0.922, 0, 'Norteamerica'),
    (22, 'Israel', 'IL', 0.915, 0, 'Oriente Medio'),
    (23, 'Eslovenia', 'SI', 0.913, 0, 'Europa'),
    (24, 'Espana', 'ES', 0.911, 0, 'Europa'),
    (25, 'Francia', 'FR', 0.910, 0, 'Europa'),
    (26, 'Italia', 'IT', 0.906, 0, 'Europa'),
    (27, 'Grecia', 'GR', 0.887, 0, 'Europa'),
    (28, 'Polonia', 'PL', 0.881, 0, 'Europa'),
    (29, 'Portugal', 'PT', 0.874, 0, 'Europa'),
    (30, 'Chile', 'CL', 0.860, 0, 'Latinoamerica'),
    (31, 'Argentina', 'AR', 0.849, 0, 'Latinoamerica'),
    (32, 'Hungria', 'HU', 0.846, 0, 'Europa'),
    (33, 'Turquia', 'TR', 0.838, 0, 'Europa'),
    (34, 'China', 'CN', 0.788, 0, 'Asia'),
    (35, 'Brasil', 'BR', 0.760, 0, 'Latinoamerica'),
    (36, 'Mexico', 'MX', 0.758, 0, 'Latinoamerica'),
    (37, 'Costa Rica', 'CR', 0.750, 0, 'Latinoamerica'),
    (38, 'Tailandia', 'TH', 0.748, 0, 'Asia'),
    (39, 'Egipto', 'EG', 0.728, 0, 'Africa'),
    (40, 'Marruecos', 'MA', 0.698, 0, 'Africa'),
    (41, 'India', 'IN', 0.644, 0, 'Asia'),
    (42, 'Rusia', 'RU', 0.635, 0, 'Europa'),
    (43, 'Uruguay', 'UY', 0.630, 0, 'Latinoamerica'),
    (44, 'Georgia', 'GE', 0.620, 0, 'Europa'),
    (45, 'Afganistan', 'AF', 0.478, 0, 'Asia')
) AS g(rank, country, code, score, change, region)
WHERE NOT EXISTS (SELECT 1 FROM indices WHERE tipo = 'hdi');

INSERT INTO indices (id, tipo, codigo_pais, nombre_pais, valor, rank, region, nivel, fuente)
SELECT 'ipc-' || lower(code), 'ipc', lower(code), country, ipc, 0, region,
  CASE
    WHEN ipc <= 1.0 THEN 'Muy Bajo'
    WHEN ipc <= 2.5 THEN 'Bajo'
    WHEN ipc <= 5.0 THEN 'Medio'
    WHEN ipc <= 10.0 THEN 'Alto'
    WHEN ipc <= 50.0 THEN 'Muy Alto'
    ELSE 'Extremo'
  END,
  'Datos macro 2026'
FROM (
  VALUES
    ('Suiza', 'CH', 0.9, 'Europa'),
    ('Japon', 'JP', 1.0, 'Asia'),
    ('China', 'CN', 1.2, 'Asia'),
    ('Tailandia', 'TH', 1.3, 'Asia'),
    ('Espana', 'ES', 1.5, 'Europa'),
    ('Francia', 'FR', 1.8, 'Europa'),
    ('Alemania', 'DE', 1.9, 'Europa'),
    ('Portugal', 'PT', 2.0, 'Europa'),
    ('Italia', 'IT', 2.1, 'Europa'),
    ('Reino Unido', 'GB', 2.2, 'Europa'),
    ('EE.UU.', 'US', 2.3, 'Norteamerica'),
    ('Noruega', 'NO', 2.4, 'Europa'),
    ('Canada', 'CA', 2.4, 'Norteamerica'),
    ('Suecia', 'SE', 2.5, 'Europa'),
    ('Finlandia', 'FI', 2.5, 'Europa'),
    ('Dinamarca', 'DK', 2.5, 'Europa'),
    ('Paises Bajos', 'NL', 2.6, 'Europa'),
    ('Belgica', 'BE', 2.7, 'Europa'),
    ('Irlanda', 'IE', 2.8, 'Europa'),
    ('Austria', 'AT', 2.9, 'Europa'),
    ('India', 'IN', 3.0, 'Asia'),
    ('Mexico', 'MX', 3.5, 'Latinoamerica'),
    ('Costa Rica', 'CR', 3.8, 'Latinoamerica'),
    ('Chile', 'CL', 4.2, 'Latinoamerica'),
    ('Uruguay', 'UY', 4.5, 'Latinoamerica'),
    ('Brasil', 'BR', 4.8, 'Latinoamerica'),
    ('Colombia', 'CO', 5.2, 'Latinoamerica'),
    ('Marruecos', 'MA', 5.5, 'Africa'),
    ('Egipto', 'EG', 6.0, 'Africa'),
    ('Rusia', 'RU', 6.5, 'Europa'),
    ('Polonia', 'PL', 7.0, 'Europa'),
    ('Hungria', 'HU', 7.2, 'Europa'),
    ('Grecia', 'GR', 7.5, 'Europa'),
    ('Croacia', 'HR', 7.8, 'Europa'),
    ('Turquia', 'TR', 35.0, 'Europa'),
    ('Argentina', 'AR', 130.0, 'Latinoamerica')
) AS i(country, code, ipc, region)
WHERE NOT EXISTS (SELECT 1 FROM indices WHERE tipo = 'ipc');
