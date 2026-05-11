CREATE TABLE IF NOT EXISTS tourism_stats (
  codigo_pais TEXT PRIMARY KEY,
  nombre_pais TEXT NOT NULL,
  arrivals BIGINT NOT NULL,
  receipts BIGINT,
  spend_per_day NUMERIC(6,2),
  avg_stay NUMERIC(4,1),
  season TEXT,
  year INTEGER NOT NULL DEFAULT 2024,
  source TEXT DEFAULT 'UNWTO',
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tourism_stats_arrivals ON tourism_stats(arrivals DESC);

INSERT INTO tourism_stats (codigo_pais, nombre_pais, arrivals, receipts, spend_per_day, avg_stay, season, year, source)
SELECT upper(code), country, arrivals, receipts, spend, stay, season, yr, src
FROM (
  VALUES
    ('FR', 'Francia', 102000000, 65000000000, 75, 7, 'Jun-Sep', 2024, 'UNWTO'),
    ('ES', 'España', 93800000, 92000000000, 85, 8, 'Jun-Sep, Semana Santa', 2024, 'UNWTO'),
    ('US', 'EE.UU.', 72400000, 17500000000, 150, 10, 'Jun-Aug, Dic', 2024, 'UNWTO'),
    ('TR', 'Turquía', 60600000, 43000000000, 50, 9, 'May-Sep', 2024, 'UNWTO'),
    ('IT', 'Italia', 57800000, 48000000000, 80, 7, 'Jun-Sep', 2024, 'UNWTO'),
    ('MX', 'México', 45000000, 28000000000, 55, 8, 'Nov-Apr', 2024, 'UNWTO'),
    ('GB', 'Reino Unido', 37500000, 52000000000, 100, 8, 'May-Sep', 2024, 'UNWTO'),
    ('JP', 'Japón', 36900000, 34000000000, 90, 8, 'Mar-May, Oct-Nov', 2024, 'UNWTO'),
    ('DE', 'Alemania', 36000000, 48000000000, 85, 7, 'Jun-Sep', 2024, 'UNWTO'),
    ('GR', 'Grecia', 35500000, 20000000000, 60, 9, 'Jun-Sep', 2024, 'UNWTO'),
    ('TH', 'Tailandia', 32000000, 46000000000, 45, 10, 'Nov-Feb', 2024, 'UNWTO'),
    ('CN', 'China', 29000000, 55000000000, 70, 8, 'Oct-Dic', 2024, 'UNWTO'),
    ('AT', 'Austria', 31000000, 22000000000, 90, 5, 'Dec-Mar (ski)', 2024, 'UNWTO'),
    ('PT', 'Portugal', 25000000, 22000000000, 65, 7, 'Jun-Sep', 2024, 'UNWTO'),
    ('NL', 'Países Bajos', 20000000, 18000000000, 80, 5, 'May-Sep', 2024, 'UNWTO'),
    ('CA', 'Canadá', 23000000, 20000000000, 90, 9, 'Jun-Sep', 2024, 'UNWTO'),
    ('PL', 'Polonia', 21000000, 14000000000, 50, 6, 'Jun-Sep', 2024, 'UNWTO'),
    ('HR', 'Croacia', 17000000, 12000000000, 55, 7, 'Jun-Sep', 2024, 'UNWTO'),
    ('SE', 'Suecia', 13000000, 6800000000, 80, 5, 'Jun-Aug', 2024, 'UNWTO'),
    ('CH', 'Suiza', 14000000, 18000000000, 150, 4, 'Dec-Mar, Jun-Sep', 2024, 'UNWTO')
) AS t(code, country, arrivals, receipts, spend, stay, season, yr, src)
WHERE NOT EXISTS (SELECT 1 FROM tourism_stats);
