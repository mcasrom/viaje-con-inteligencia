export interface GPICountry {
  rank: number;
  country: string;
  code: string;
  score: number;
  change: number;
  region: string;
}

export const GPI_DATA: GPICountry[] = [
  { rank: 1, country: 'Islandia', code: 'IS', score: 1.095, change: 0, region: 'Europa' },
  { rank: 2, country: 'Irlanda', code: 'IE', score: 1.260, change: 0, region: 'Europa' },
  { rank: 3, country: 'Nueva Zelanda', code: 'NZ', score: 1.282, change: 2, region: 'Oceanía' },
  { rank: 4, country: 'Austria', code: 'AT', score: 1.294, change: -1, region: 'Europa' },
  { rank: 5, country: 'Suiza', code: 'CH', score: 1.294, change: -1, region: 'Europa' },
  { rank: 6, country: 'Singapur', code: 'SG', score: 1.357, change: 0, region: 'Asia' },
  { rank: 7, country: 'Portugal', code: 'PT', score: 1.361, change: 1, region: 'Europa' },
  { rank: 8, country: 'Dinamarca', code: 'DK', score: 1.374, change: -1, region: 'Europa' },
  { rank: 9, country: 'Eslovenia', code: 'SI', score: 1.380, change: 2, region: 'Europa' },
  { rank: 10, country: 'Japón', code: 'JP', score: 1.387, change: -1, region: 'Asia' },
  { rank: 11, country: 'China', code: 'CN', score: 1.394, change: 0, region: 'Asia' },
  { rank: 12, country: 'India', code: 'IN', score: 1.410, change: 0, region: 'Asia' },
  { rank: 13, country: 'Alemania', code: 'DE', score: 1.433, change: 0, region: 'Europa' },
  { rank: 14, country: 'Canadá', code: 'CA', score: 1.491, change: -5, region: 'Norteamérica' },
  { rank: 15, country: 'Croacia', code: 'HR', score: 1.492, change: 4, region: 'Europa' },
  { rank: 16, country: 'Bélgica', code: 'BE', score: 1.492, change: 4, region: 'Europa' },
  { rank: 17, country: 'Rep. Checa', code: 'CZ', score: 1.498, change: -1, region: 'Europa' },
  { rank: 18, country: 'Finlandia', code: 'FI', score: 1.514, change: -3, region: 'Europa' },
  { rank: 19, country: 'Noruega', code: 'NO', score: 1.521, change: 0, region: 'Europa' },
  { rank: 20, country: 'Francia', code: 'FR', score: 1.542, change: 0, region: 'Europa' },
  { rank: 21, country: 'España', code: 'ES', score: 1.547, change: 1, region: 'Europa' },
  { rank: 22, country: 'Suecia', code: 'SE', score: 1.550, change: -1, region: 'Europa' },
  { rank: 23, country: 'Italia', code: 'IT', score: 1.563, change: 0, region: 'Europa' },
  { rank: 24, country: 'Brasil', code: 'BR', score: 1.570, change: 2, region: 'Latinoamérica' },
  { rank: 25, country: 'Hungría', code: 'HU', score: 1.575, change: 0, region: 'Europa' },
  { rank: 26, country: 'Polonia', code: 'PL', score: 1.592, change: 1, region: 'Europa' },
  { rank: 27, country: 'Eslovaquia', code: 'SK', score: 1.596, change: -1, region: 'Europa' },
  { rank: 28, country: 'Malta', code: 'MT', score: 1.604, change: 0, region: 'Europa' },
  { rank: 29, country: 'Rumanía', code: 'RO', score: 1.622, change: 0, region: 'Europa' },
  { rank: 30, country: 'Emiratos Árabes', code: 'AE', score: 1.629, change: 2, region: 'Oriente Medio' },
  { rank: 31, country: 'Argentina', code: 'AR', score: 1.641, change: 0, region: 'Latinoamérica' },
  { rank: 32, country: 'Chile', code: 'CL', score: 1.651, change: 1, region: 'Latinoamérica' },
  { rank: 33, country: 'Uruguay', code: 'UY', score: 1.659, change: -1, region: 'Latinoamérica' },
  { rank: 34, country: 'Georgia', code: 'GE', score: 1.665, change: 2, region: 'Europa' },
  { rank: 35, country: 'Costa Rica', code: 'CR', score: 1.679, change: 0, region: 'Latinoamérica' },
  { rank: 36, country: 'Corea del Sur', code: 'KR', score: 1.681, change: -1, region: 'Asia' },
  { rank: 37, country: 'Grecia', code: 'GR', score: 1.700, change: 0, region: 'Europa' },
  { rank: 38, country: 'Marruecos', code: 'MA', score: 1.712, change: 1, region: 'África' },
  { rank: 39, country: 'Reino Unido', code: 'GB', score: 1.716, change: 1, region: 'Europa' },
  { rank: 40, country: 'EE.UU.', code: 'US', score: 2.231, change: 0, region: 'Norteamérica' },
  { rank: 41, country: 'México', code: 'MX', score: 2.380, change: 0, region: 'Latinoamérica' },
  { rank: 42, country: 'Turquía', code: 'TR', score: 2.425, change: 0, region: 'Europa' },
  { rank: 43, country: 'Egipto', code: 'EG', score: 2.445, change: 0, region: 'África' },
  { rank: 44, country: 'Tailandia', code: 'TH', score: 2.468, change: 0, region: 'Asia' },
  { rank: 45, country: 'Rusia', code: 'RU', score: 3.441, change: -2, region: 'Europa' },
  { rank: 46, country: 'Afganistán', code: 'AF', score: 3.929, change: 0, region: 'Asia' },
];
