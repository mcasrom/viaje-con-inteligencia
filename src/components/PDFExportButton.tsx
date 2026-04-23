'use client';

import { useCallback, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { FileDown, Loader2, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Trip } from '@/lib/supabase';
import { paisesData, DatoPais } from '@/data/paises';
import logoImage from '@/../logo_ok.png';

function getBase64Image(img: typeof logoImage): string {
  if (typeof img === 'string') return img;
  return img.src;
}

interface NearbyLocation {
  name: string;
  country: string;
  distance: number;
}

const nearbyCountries: Record<string, NearbyLocation[]> = {
  es: [
    { name: 'Lisboa', country: 'Portugal', distance: 625 },
    { name: 'París', country: 'Francia', distance: 1050 },
    { name: 'Marrakech', country: 'Marruecos', distance: 850 },
    { name: 'Andorra la Vella', country: 'Andorra', distance: 450 },
    { name: 'Tanger', country: 'Marruecos', distance: 400 },
    { name: 'Gibraltar', country: 'Reino Unido', distance: 130 },
  ],
  pt: [
    { name: 'Madrid', country: 'España', distance: 650 },
    { name: 'Oporto', country: 'Portugal', distance: 280 },
    { name: 'Santiago de Compostela', country: 'España', distance: 280 },
    { name: 'Casablanca', country: 'Marruecos', distance: 450 },
    { name: 'Coímbra', country: 'Portugal', distance: 200 },
  ],
  fr: [
    { name: 'París', country: 'Francia', distance: 350 },
    { name: 'Bruselas', country: 'Bélgica', distance: 270 },
    { name: 'Ginebra', country: 'Suiza', distance: 240 },
    { name: 'Milán', country: 'Italia', distance: 280 },
    { name: 'Barcelona', country: 'España', distance: 830 },
    { name: 'Londres', country: 'Reino Unido', distance: 350 },
  ],
  it: [
    { name: 'Roma', country: 'Italia', distance: 280 },
    { name: 'Venecia', country: 'Italia', distance: 250 },
    { name: 'Florencia', country: 'Italia', distance: 230 },
    { name: 'Milán', country: 'Italia', distance: 400 },
    { name: 'Niza', country: 'Francia', distance: 300 },
    { name: 'Viena', country: 'Austria', distance: 520 },
  ],
  de: [
    { name: 'Berlín', country: 'Alemania', distance: 280 },
    { name: 'Múnich', country: 'Alemania', distance: 390 },
    { name: 'Praga', country: 'Rep.Checa', distance: 250 },
    { name: 'Viena', country: 'Austria', distance: 530 },
    { name: 'Ámsterdam', country: 'Países Bajos', distance: 440 },
  ],
  gb: [
    { name: 'Londres', country: 'Reino Unido', distance: 220 },
    { name: 'Edimburgo', country: 'Reino Unido', distance: 650 },
    { name: 'Dublín', country: 'Irlanda', distance: 460 },
    { name: 'París', country: 'Francia', distance: 340 },
    { name: 'Ámsterdam', country: 'Países Bajos', distance: 350 },
  ],
  us: [
    { name: 'Nueva York', country: 'EEUU', distance: 350 },
    { name: 'Los Ángeles', country: 'EEUU', distance: 3800 },
    { name: 'Miami', country: 'EEUU', distance: 1600 },
    { name: 'Chicago', country: 'EEUU', distance: 1150 },
    { name: 'Toronto', country: 'Canadá', distance: 800 },
    { name: 'Ciudad de México', country: 'México', distance: 2000 },
  ],
  mx: [
    { name: 'Ciudad de México', country: 'México', distance: 450 },
    { name: 'Cancún', country: 'México', distance: 1300 },
    { name: 'Guadalajara', country: 'México', distance: 550 },
    { name: 'Los Ángeles', country: 'EEUU', distance: 2500 },
    { name: 'Miami', country: 'EEUU', distance: 2000 },
  ],
  ma: [
    { name: 'Marrakech', country: 'Marruecos', distance: 450 },
    { name: 'Tánger', country: 'Marruecos', distance: 350 },
    { name: 'Fez', country: 'Marruecos', distance: 550 },
    { name: 'Madrid', country: 'España', distance: 900 },
    { name: 'Algeciras', country: 'España', distance: 250 },
  ],
  jp: [
    { name: 'Tokio', country: 'Japón', distance: 400 },
    { name: 'Osaka', country: 'Japón', distance: 200 },
    { name: 'Kioto', country: 'Japón', distance: 450 },
    { name: 'Seúl', country: 'Corea del Sur', distance: 900 },
    { name: 'Shanghái', country: 'China', distance: 1800 },
  ],
  kr: [
    { name: 'Seúl', country: 'Corea del Sur', distance: 350 },
    { name: 'Busan', country: 'Corea del Sur', distance: 320 },
    { name: 'Tokio', country: 'Japón', distance: 1100 },
    { name: 'Pekín', country: 'China', distance: 2000 },
  ],
  br: [
    { name: 'Río de Janeiro', country: 'Brasil', distance: 950 },
    { name: 'São Paulo', country: 'Brasil', distance: 400 },
    { name: 'Brasilia', country: 'Brasil', distance: 750 },
    { name: 'Buenos Aires', country: 'Argentina', distance: 2000 },
    { name: 'Lima', country: 'Perú', distance: 3200 },
  ],
  ar: [
    { name: 'Buenos Aires', country: 'Argentina', distance: 380 },
    { name: 'Córdoba', country: 'Argentina', distance: 650 },
    { name: 'Santiago', country: 'Chile', distance: 1200 },
    { name: 'São Paulo', country: 'Brasil', distance: 2300 },
    { name: 'Montevideo', country: 'Uruguay', distance: 200 },
  ],
  cl: [
    { name: 'Santiago', country: 'Chile', distance: 320 },
    { name: 'Valparaíso', country: 'Chile', distance: 120 },
    { name: 'Buenos Aires', country: 'Argentina', distance: 1400 },
    { name: 'Lima', country: 'Perú', distance: 2500 },
  ],
  co: [
    { name: 'Bogotá', country: 'Colombia', distance: 320 },
    { name: 'Medellín', country: 'Colombia', distance: 400 },
    { name: 'Cartagena', country: 'Colombia', distance: 450 },
    { name: 'Quito', country: 'Ecuador', distance: 1500 },
    { name: 'Lima', country: 'Perú', distance: 2000 },
  ],
  nl: [
    { name: 'Ámsterdam', country: 'Países Bajos', distance: 280 },
    { name: 'Róterdam', country: 'Países Bajos', distance: 80 },
    { name: 'Bruselas', country: 'Bélgica', distance: 200 },
    { name: 'París', country: 'Francia', distance: 430 },
    { name: 'Berlín', country: 'Alemania', distance: 500 },
  ],
  ch: [
    { name: 'Ginebra', country: 'Suiza', distance: 280 },
    { name: 'Zúrich', country: 'Suiza', distance: 120 },
    { name: 'Basilea', country: 'Suiza', distance: 90 },
    { name: 'Milán', country: 'Italia', distance: 350 },
    { name: 'Múnich', country: 'Alemania', distance: 320 },
  ],
  gr: [
    { name: 'Atenas', country: 'Grecia', distance: 450 },
    { name: 'Tesalónica', country: 'Grecia', distance: 320 },
    { name: 'Estambul', country: 'Turquía', distance: 600 },
    { name: 'Roma', country: 'Italia', distance: 1200 },
  ],
  tr: [
    { name: 'Estambul', country: 'Turquía', distance: 650 },
    { name: 'Ankara', country: 'Turquía', distance: 450 },
    { name: 'Antalya', country: 'Turquía', distance: 550 },
    { name: 'Atenas', country: 'Grecia', distance: 800 },
    { name: 'Sofía', country: 'Bulgaria', distance: 950 },
  ],
  eg: [
    { name: 'El Cairo', country: 'Egipto', distance: 380 },
    { name: 'Luxor', country: 'Egipto', distance: 650 },
    { name: 'Sharm el-Sheij', country: 'Egipto', distance: 350 },
    { name: 'Tel Aviv', country: 'Israel', distance: 750 },
    { name: 'Amán', country: 'Jordania', distance: 850 },
  ],
  za: [
    { name: 'Ciudad del Cabo', country: 'Sudáfrica', distance: 450 },
    { name: 'Johannesburgo', country: 'Sudáfrica', distance: 350 },
    { name: 'Durban', country: 'Sudáfrica', distance: 400 },
    { name: 'Nairobi', country: 'Kenia', distance: 2800 },
  ],
  th: [
    { name: 'Bangkok', country: 'Tailandia', distance: 380 },
    { name: 'Phuket', country: 'Tailandia', distance: 850 },
    { name: 'Chiang Mai', country: 'Tailandia', distance: 700 },
    { name: 'Singapur', country: 'Singapur', distance: 1700 },
    { name: 'Ho Chi Minh', country: 'Vietnam', distance: 1600 },
  ],
  vn: [
    { name: 'Ho Chi Minh', country: 'Vietnam', distance: 550 },
    { name: 'Hanói', country: 'Vietnam', distance: 400 },
    { name: 'Da Nang', country: 'Vietnam', distance: 800 },
    { name: 'Bangkok', country: 'Tailandia', distance: 1700 },
    { name: 'Singapur', country: 'Singapur', distance: 1900 },
  ],
  in: [
    { name: 'Nueva Delhi', country: 'India', distance: 450 },
    { name: 'Mumbai', country: 'India', distance: 400 },
    { name: 'Jaipur', country: 'India', distance: 550 },
    { name: 'Agra', country: 'India', distance: 650 },
    { name: 'Katmandú', country: 'Nepal', distance: 1200 },
  ],
  cn: [
    { name: 'Pekín', country: 'China', distance: 400 },
    { name: 'Shanghái', country: 'China', distance: 450 },
    { name: 'Xi\'an', country: 'China', distance: 900 },
    { name: 'Hong Kong', country: 'China', distance: 2000 },
    { name: 'Tokio', country: 'Japón', distance: 1800 },
  ],
  au: [
    { name: 'Sídney', country: 'Australia', distance: 450 },
    { name: 'Melbourne', country: 'Australia', distance: 750 },
    { name: 'Brisbane', country: 'Australia', distance: 850 },
    { name: 'Perth', country: 'Australia', distance: 3200 },
    { name: 'Auckland', country: 'Nueva Zelanda', distance: 2300 },
  ],
  ca: [
    { name: 'Toronto', country: 'Canadá', distance: 320 },
    { name: 'Montreal', country: 'Canadá', distance: 400 },
    { name: 'Vancouver', country: 'Canadá', distance: 2800 },
    { name: 'Ottawa', country: 'Canadá', distance: 450 },
    { name: 'Nueva York', country: 'EEUU', distance: 800 },
  ],
  pa: [
    { name: 'Ciudad de Panamá', country: 'Panamá', distance: 350 },
    { name: 'San José', country: 'Costa Rica', distance: 700 },
    { name: 'Bogotá', country: 'Colombia', distance: 1200 },
    { name: 'Miami', country: 'EEUU', distance: 2000 },
  ],
  cr: [
    { name: 'San José', country: 'Costa Rica', distance: 280 },
    { name: 'Liberia', country: 'Costa Rica', distance: 350 },
    { name: 'Ciudad de Panamá', country: 'Panamá', distance: 650 },
    { name: 'Managua', country: 'Nicaragua', distance: 350 },
  ],
  pe: [
    { name: 'Lima', country: 'Perú', distance: 280 },
    { name: 'Cuzco', country: 'Perú', distance: 650 },
    { name: 'Arequipa', country: 'Perú', distance: 750 },
    { name: 'Bogotá', country: 'Colombia', distance: 2000 },
  ],
  cu: [
    { name: 'La Habana', country: 'Cuba', distance: 350 },
    { name: 'Varadero', country: 'Cuba', distance: 400 },
    { name: 'Miami', country: 'EEUU', distance: 500 },
    { name: 'Cancún', country: 'México', distance: 850 },
  ],
  dz: [
    { name: 'Argel', country: 'Argelia', distance: 320 },
    { name: 'Orán', country: 'Argelia', distance: 450 },
    { name: 'Madrid', country: 'España', distance: 850 },
    { name: 'Marrakech', country: 'Marruecos', distance: 950 },
  ],
  ke: [
    { name: 'Nairobi', country: 'Kenia', distance: 280 },
    { name: 'Mombasa', country: 'Kenia', distance: 450 },
    { name: 'Dar es Salaam', country: 'Tanzania', distance: 650 },
    { name: 'Adís Abeba', country: 'Etiopía', distance: 1200 },
  ],
  tz: [
    { name: 'Dar es Salaam', country: 'Tanzania', distance: 350 },
    { name: 'Zanzíbar', country: 'Tanzania', distance: 450 },
    { name: 'Nairobi', country: 'Kenia', distance: 650 },
    { name: 'Kigali', country: 'Ruanda', distance: 1200 },
  ],
  il: [
    { name: 'Tel Aviv', country: 'Israel', distance: 320 },
    { name: 'Jerusalén', country: 'Israel', distance: 400 },
    { name: 'Haifa', country: 'Israel', distance: 450 },
    { name: 'Amán', country: 'Jordania', distance: 350 },
  ],
  lb: [
    { name: 'Beirut', country: 'Líbano', distance: 280 },
    { name: 'Damasco', country: 'Siria', distance: 320 },
    { name: 'Tel Aviv', country: 'Israel', distance: 400 },
    { name: 'Ankara', country: 'Turquía', distance: 850 },
  ],
  sa: [
    { name: 'Riad', country: 'Arabia Saudita', distance: 350 },
    { name: 'La Meca', country: 'Arabia Saudita', distance: 450 },
    { name: 'Yeda', country: 'Arabia Saudita', distance: 400 },
    { name: 'Doha', country: 'Catar', distance: 650 },
  ],
  qa: [
    { name: 'Doha', country: 'Catar', distance: 280 },
    { name: 'Abu Dhabi', country: 'EAU', distance: 350 },
    { name: 'Dubái', country: 'EAU', distance: 400 },
    { name: 'Riad', country: 'Arabia Saudita', distance: 650 },
  ],
  ae: [
    { name: 'Dubái', country: 'EAU', distance: 350 },
    { name: 'Abu Dhabi', country: 'EAU', distance: 150 },
    { name: 'Doha', country: 'Catar', distance: 400 },
    { name: 'Mascate', country: 'Omán', distance: 850 },
  ],
  sg: [
    { name: 'Singapur', country: 'Singapur', distance: 280 },
    { name: 'Kuala Lumpur', country: 'Malasia', distance: 350 },
    { name: 'Bangkok', country: 'Tailandia', distance: 1700 },
    { name: 'Yakarta', country: 'Indonesia', distance: 1500 },
  ],
  np: [
    { name: 'Katmandú', country: 'Nepal', distance: 320 },
    { name: 'Pokhara', country: 'Nepal', distance: 450 },
    { name: 'Nueva Delhi', country: 'India', distance: 1200 },
    { name: 'Lhasa', country: 'China', distance: 650 },
  ],
  lk: [
    { name: 'Colombo', country: 'Sri Lanka', distance: 350 },
    { name: 'Kandy', country: 'Sri Lanka', distance: 400 },
    { name: 'Chennai', country: 'India', distance: 650 },
    { name: 'Malé', country: 'Maldivas', distance: 850 },
  ],
  id: [
    { name: 'Yakarta', country: 'Indonesia', distance: 380 },
    { name: 'Bali', country: 'Indonesia', distance: 850 },
    { name: 'Bangkok', country: 'Tailandia', distance: 1700 },
    { name: 'Singapur', country: 'Singapur', distance: 1500 },
  ],
  ph: [
    { name: 'Manila', country: 'Filipinas', distance: 350 },
    { name: 'Cebú', country: 'Filipinas', distance: 850 },
    { name: 'Singapur', country: 'Singapur', distance: 2400 },
    { name: 'Yakarta', country: 'Indonesia', distance: 2800 },
  ],
  my: [
    { name: 'Kuala Lumpur', country: 'Malasia', distance: 320 },
    { name: 'Penang', country: 'Malasia', distance: 400 },
    { name: 'Singapur', country: 'Singapur', distance: 350 },
    { name: 'Bangkok', country: 'Tailandia', distance: 1700 },
  ],
  kh: [
    { name: 'Phnom Penh', country: 'Camboya', distance: 280 },
    { name: 'Siem Reap', country: 'Camboya', distance: 350 },
    { name: 'Bangkok', country: 'Tailandia', distance: 650 },
    { name: 'Ho Chi Minh', country: 'Vietnam', distance: 550 },
  ],
  mm: [
    { name: 'Yangón', country: 'Myanmar', distance: 320 },
    { name: 'Mandalay', country: 'Myanmar', distance: 400 },
    { name: 'Bangkok', country: 'Tailandia', distance: 850 },
    { name: 'Katmandú', country: 'Nepal', distance: 2800 },
  ],
  la: [
    { name: 'Vientián', country: 'Laos', distance: 280 },
    { name: 'Luang Prabang', country: 'Laos', distance: 350 },
    { name: 'Bangkok', country: 'Tailandia', distance: 750 },
    { name: 'Hanoi', country: 'Vietnam', distance: 850 },
  ],
  ve: [
    { name: 'Caracas', country: 'Venezuela', distance: 320 },
    { name: 'Maracaibo', country: 'Venezuela', distance: 400 },
    { name: 'Bogotá', country: 'Colombia', distance: 850 },
    { name: 'Miami', country: 'EEUU', distance: 2400 },
  ],
  pl: [
    { name: 'Varsovia', country: 'Polonia', distance: 350 },
    { name: 'Cracovia', country: 'Polonia', distance: 400 },
    { name: 'Praga', country: 'Rep.Checa', distance: 550 },
    { name: 'Berlín', country: 'Alemania', distance: 650 },
  ],
  se: [
    { name: 'Estocolmo', country: 'Suecia', distance: 320 },
    { name: 'Gotemburgo', country: 'Suecia', distance: 400 },
    { name: 'Oslo', country: 'Noruega', distance: 450 },
    { name: 'Copenhague', country: 'Dinamarca', distance: 650 },
  ],
  no: [
    { name: 'Oslo', country: 'Noruega', distance: 280 },
    { name: 'Bergen', country: 'Noruega', distance: 450 },
    { name: 'Estocolmo', country: 'Suecia', distance: 650 },
    { name: 'Copenhague', country: 'Dinamarca', distance: 850 },
  ],
  dk: [
    { name: 'Copenhague', country: 'Dinamarca', distance: 320 },
    { name: 'Aarhus', country: 'Dinamarca', distance: 400 },
    { name: 'Oslo', country: 'Noruega', distance: 550 },
    { name: 'Estocolmo', country: 'Suecia', distance: 650 },
  ],
  fi: [
    { name: 'Helsinki', country: 'Finlandia', distance: 280 },
    { name: 'Rovaniemi', country: 'Finlandia', distance: 850 },
    { name: 'Estocolmo', country: 'Suecia', distance: 550 },
    { name: 'San Petersburgo', country: 'Rusia', distance: 950 },
  ],
  at: [
    { name: 'Viena', country: 'Austria', distance: 320 },
    { name: 'Salzburgo', country: 'Austria', distance: 400 },
    { name: 'Innsbruck', country: 'Austria', distance: 550 },
    { name: 'Praga', country: 'Rep.Checa', distance: 350 },
  ],
  ie: [
    { name: 'Dublín', country: 'Irlanda', distance: 280 },
    { name: 'Cork', country: 'Irlanda', distance: 400 },
    { name: 'Londres', country: 'Reino Unido', distance: 450 },
    { name: 'Edimburgo', country: 'Reino Unido', distance: 650 },
  ],
  be: [
    { name: 'Bruselas', country: 'Bélgica', distance: 320 },
    { name: 'Amberes', country: 'Bélgica', distance: 400 },
    { name: 'Brujas', country: 'Bélgica', distance: 450 },
    { name: 'Ámsterdam', country: 'Países Bajos', distance: 250 },
  ],
  cz: [
    { name: 'Praga', country: 'Rep.Checa', distance: 350 },
    { name: 'Brno', country: 'Rep.Checa', distance: 450 },
    { name: 'Viena', country: 'Austria', distance: 350 },
    { name: 'Berlín', country: 'Alemania', distance: 450 },
  ],
  hu: [
    { name: 'Budapest', country: 'Hungría', distance: 350 },
    { name: 'Debrecen', country: 'Hungría', distance: 400 },
    { name: 'Viena', country: 'Austria', distance: 250 },
    { name: 'Praga', country: 'Rep.Checa', distance: 450 },
  ],
  ro: [
    { name: 'Bucarest', country: 'Rumanía', distance: 320 },
    { name: 'Cluj-Napoca', country: 'Rumanía', distance: 450 },
    { name: 'Sofía', country: 'Bulgaria', distance: 450 },
    { name: 'Budapest', country: 'Hungría', distance: 650 },
  ],
  bg: [
    { name: 'Sofía', country: 'Bulgaria', distance: 380 },
    { name: 'Plovdiv', country: 'Bulgaria', distance: 450 },
    { name: 'Estambul', country: 'Turquía', distance: 550 },
    { name: 'Bucarest', country: 'Rumanía', distance: 450 },
  ],
  ru: [
    { name: 'Moscú', country: 'Rusia', distance: 400 },
    { name: 'San Petersburgo', country: 'Rusia', distance: 750 },
    { name: 'Sochi', country: 'Rusia', distance: 1400 },
    { name: 'Helsinki', country: 'Finlandia', distance: 950 },
  ],
};

function getNearbyLocations(countryCode: string, pais: DatoPais): NearbyLocation[] {
  return nearbyCountries[countryCode] || nearbyCountries[countryCode.slice(0, 2)] || [];
}

interface PDFExportButtonProps {
  trip: Trip;
}

const emergencyContacts: Record<string, { name: string; phone: string }> = {
  es: { name: 'Embajada España', phone: '+34 915 879 000' },
  pt: { name: 'Embajada Portugal', phone: '+351 213 942 700' },
  fr: { name: 'Embajada Francia', phone: '+33 1 43 12 22 22' },
  it: { name: 'Embajada Italia', phone: '+39 06 688 171' },
  de: { name: 'Embajada Alemania', phone: '+49 30 830 50' },
  gb: { name: 'Embajada Reino Unido', phone: '+44 20 7930 8200' },
  us: { name: 'Embajada Estados Unidos', phone: '+1 202 483 0100' },
  mx: { name: 'Embajada México', phone: '+52 55 9150 2100' },
  ma: { name: 'Embajada Marruecos', phone: '+212 537 63 21 00' },
};

const checklistItems = [
  'Pasaporte válido (+6 meses)',
  'Billetes avión/tren',
  'Reserva hotel/Airbnb',
  'Seguro viaje',
  'Dinero/tarjetas',
  'Teléfono cargado',
  'Adaptador enchufe',
  'Medicación habitual',
  'Vacunas si requeridas',
  'Copias documentos',
  'Autorización menores',
  'App transporte local',
];

export default function PDFExportButton({ trip }: PDFExportButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getCountryData = (destino: string): DatoPais | null => {
    const codigo = destino.toLowerCase().slice(0, 2);
    return paisesData[codigo] || null;
  };

  const generatePDF = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;
      let currentPage = 1;

      const pais = getCountryData(trip.destination);
      const countryCode = pais?.codigo || trip.destination?.toLowerCase().slice(0, 2) || 'xx';

      const checkNewPage = (neededSpace: number) => {
        if (y + neededSpace > pageHeight - 25) {
          pdf.addPage();
          currentPage++;
          y = margin;
          return true;
        }
        return false;
      };

      // ============ PAGE 1: Header + Trip Info + Risk ============
      
      // Header
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Logo
      try {
        const logoSrc = getBase64Image(logoImage);
        pdf.addImage(logoSrc, 'PNG', margin + 2, 8, 20, 20);
      } catch {
        pdf.setFillColor(234, 179, 8);
        pdf.roundedRect(margin + 5, 10, 16, 16, 2, 2, 'F');
      }
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VIAJE CON INTELIGENCIA', margin + 28, 18);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Itinerario Personalizado', margin + 28, 28);
      
      pdf.setFontSize(10);
      pdf.text('viajeinteligencia.com', pageWidth - margin - 45, 28);

      // Premium Badge
      pdf.setFillColor(234, 179, 8);
      pdf.roundedRect(pageWidth - margin - 30, 8, 28, 8, 1, 1, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PREMIUM', pageWidth - margin - 27, 13.5, { align: 'center' });

      y = 50;

      // Trip Info Box
      pdf.setFillColor(241, 245, 249);
      pdf.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
      
      y += 8;
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(trip.name || 'Viaje Sin Nombre', margin + 5, y);
      
      y += 8;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      
      const destinoTexto = `Destino: ${trip.destination}${pais ? ` (${pais.nombre})` : ''}`;
      pdf.text(destinoTexto, margin + 5, y);
      
      y += 5;
      const fechaTexto = trip.start_date 
        ? `Fechas: ${new Date(trip.start_date).toLocaleDateString('es-ES')} - ${trip.end_date ? new Date(trip.end_date).toLocaleDateString('es-ES') : 'Sin definir'}`
        : 'Fechas: Por definir';
      pdf.text(fechaTexto, margin + 5, y);
      
      y += 5;
      const duracionTexto = `Duración: ${trip.days} días`;
      pdf.text(duracionTexto, margin + 5, y);
      
      y += 5;
      const presupuestoTexto = `Presupuesto: ${trip.budget === 'low' ? 'Económico (<50€/dayo)' : trip.budget === 'moderate' ? 'Moderado (50-150€/día)' : 'Alto (>150€/día)'}`;
      pdf.text(presupuestoTexto, margin + 5, y);

      y = 95;

      // Risk Section
      if (pais) {
        const riskColor = pais.nivelRiesgo === 'sin-riesgo' || pais.nivelRiesgo === 'bajo' ? [34, 197, 94] :
                        pais.nivelRiesgo === 'medio' ? [234, 179, 8] :
                        [239, 68, 68];
        
        pdf.setFillColor(...riskColor as [number, number, number]);
        pdf.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`NIVEL DE RIESGO: ${pais.nivelRiesgo.toUpperCase()}`, margin + 5, y + 8);
        
        if (pais.nivelRiesgo === 'medio' || pais.nivelRiesgo === 'alto' || pais.nivelRiesgo === 'muy-alto') {
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Consulta recomendaciones MAEC antes de viajar', margin + 65, y + 8);
        }
        
        y += 18;
      }

      // ============ GEO MAP SECTION ============
      if (pais && pais.mapaCoordenadas) {
        checkNewPage(55);
        
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('MAPA GEOGRÁFICO', margin, y);
        
        y += 6;
        pdf.setDrawColor(59, 130, 246);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, pageWidth - margin, y);
        
        y += 10;
        
        // Hemisphere grid with coordinate system
        const [lat, lng] = pais.mapaCoordenadas;
        const isNorth = lat >= 0;
        const isEast = lng >= 0;
        
        // Main hemisphere rectangle
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, y, contentWidth, 25, 2, 2, 'FD');
        
        // Grid lines
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.2);
        for (let i = 1; i < 4; i++) {
          const x = margin + (contentWidth / 4) * i;
          pdf.line(x, y, x, y + 25);
        }
        for (let i = 1; i < 4; i++) {
          const lineY = y + (25 / 4) * i;
          pdf.line(margin, lineY, pageWidth - margin, lineY);
        }
        
        // Equator (bold)
        pdf.setDrawColor(59, 130, 246);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y + 12.5, pageWidth - margin, y + 12.5);
        
        // Prime meridian (bold)
        pdf.line(pageWidth / 2, y, pageWidth / 2, y + 25);
        
        // Hemisphere labels
        pdf.setFontSize(6);
        pdf.setTextColor(100, 116, 139);
        pdf.text('N', pageWidth - margin - 4, y + 4);
        pdf.text('S', pageWidth - margin - 4, y + 23);
        pdf.text('W', margin + 2, y + 4);
        pdf.text('E', pageWidth - margin - 6, y + 4);
        
        // Calculate position
        const mapX = pageWidth / 2 + (lng / 180) * (contentWidth / 2) - 3;
        const mapY = y + 12.5 - (lat / 90) * 10;
        
        // Destination marker with pulse effect
        pdf.setFillColor(239, 68, 68);
        pdf.circle(mapX + 3, mapY, 4, 'F');
        pdf.setFillColor(255, 255, 255);
        pdf.circle(mapX + 3, mapY, 1.5, 'F');
        
        // Country info box
        y += 30;
        pdf.setFillColor(241, 245, 249);
        pdf.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');
        
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${pais.nombre} / ${pais.capital}`, margin + 5, y + 6);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);
        const coordText = `${isNorth ? 'N' : 'S'}${Math.abs(lat).toFixed(2)}° ${isEast ? 'E' : 'W'}${Math.abs(lng).toFixed(2)}° • ${pais.zonaHoraria}`;
        pdf.text(coordText, margin + 5, y + 12);
        
        pdf.text(`${pais.continente} • ${pais.moneda} • Conduce: ${pais.conduccion === 'derecha' ? 'D' : 'I'}`, margin + 90, y + 12);
        
        y += 25;
        
        // Nearby countries / cities section
        const nearbyLocations = getNearbyLocations(countryCode, pais);
        if (nearbyLocations.length > 0) {
          pdf.setTextColor(15, 23, 42);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text('CIudades cercanas / Countries vecinos:', margin, y);
          
          y += 6;
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(71, 85, 105);
          
          for (const loc of nearbyLocations.slice(0, 6)) {
            pdf.text(`• ${loc.name} (${loc.country}) - ${loc.distance}km`, margin + 3, y);
            y += 4.5;
          }
        }
      }

      // ============ PAGE 2: Itinerary ============
      if (trip.itinerary_raw) {
        checkNewPage(60);
        
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ITINERARIO', margin, y);
        
        y += 6;
        pdf.setDrawColor(59, 130, 246);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, pageWidth - margin, y);
        
        y += 5;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(55, 65, 81);
        
        const itineraryLines = trip.itinerary_raw.split('\n');
        const maxLineWidth = contentWidth - 5;
        
        for (const line of itineraryLines) {
          if (y > pageHeight - 30) {
            checkNewPage(20);
          }
          
          const lines = pdf.splitTextToSize(line, maxLineWidth);
          for (const l of lines) {
            pdf.text(l, margin, y);
            y += 4;
          }
        }
        
        y += 10;
      }

      // ============ PAGE 3: Checklist + Emergency + Notes ============
      checkNewPage(100);

      // Checklist
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CHECKLIST DE EMBARQUE', margin, y);
      
      y += 6;
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      
      y += 8;
      pdf.setFontSize(9);
      
      for (let i = 0; i < checklistItems.length; i++) {
        const col = i < 6 ? 0 : 1;
        const row = i % 6;
        const x = margin + col * (contentWidth / 2);
        const itemY = y + row * 8;
        
        pdf.setFillColor(241, 245, 249);
        pdf.circle(x + 2, itemY - 1.5, 2, 'F');
        pdf.setTextColor(55, 65, 81);
        pdf.setFont('helvetica', 'normal');
        pdf.text(checklistItems[i], x + 6, itemY);
      }

      y += 55;

      // Emergency Contacts
      checkNewPage(40);
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CONTACTOS DE EMERGENCIA', margin, y);
      
      y += 6;
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      
      y += 10;
      pdf.setFontSize(10);
      
      const emergency = emergencyContacts[countryCode] || emergencyContacts['es'];
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`• ${emergency.name}: `, margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(emergency.phone, margin + 38, y);
      
      y += 7;
      pdf.setFont('helvetica', 'bold');
      pdf.text('• Teléfono emergencia local: ', margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(pais?.prefijoTelefono ? `${pais.prefijoTelefono}` : '112', margin + 45, y);

      y += 15;

      // Notes section
      checkNewPage(35);
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('NOTAS PERSONALES', margin, y);
      
      y += 6;
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      
      y += 8;
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      
      for (let i = 0; i < 5; i++) {
        pdf.rect(margin, y + i * 10, contentWidth, 8);
      }

      // ============ FOOTER (all pages) ============
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFillColor(241, 245, 249);
        pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Generado por Viaje con Inteligencia • ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} • Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 6,
          { align: 'center' }
        );
        
        pdf.setFontSize(7);
        pdf.text(
          'Solo para usuarios Premium',
          pageWidth / 2,
          pageHeight - 2,
          { align: 'center' }
        );
      }

      // Save
      const filename = `${trip.name?.replace(/\s+/g, '_') || 'viaje'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setLoading(false);
    }
  }, [trip, user]);

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-slate-600 disabled:to-slate-600 text-black px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Crown className="w-4 h-4" />
      )}
      Exportar PDF
    </button>
  );
}