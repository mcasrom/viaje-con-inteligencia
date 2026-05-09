import { getTCIForAllCountries, getCurrentOilPrice } from '@/data/tci-engine';
import CosteClient from './CosteClient';
import { TOTAL_PAISES } from '@/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coste de Viaje por País | Comparador TCI - Viaje con Inteligencia',
  description: `Índice de Coste de Viaje (TCI) para ${TOTAL_PAISES} países. Compara precios de vuelos, alojamiento, comida y transporte. Datos actualizados.`,
  openGraph: {
    title: 'Coste de Viaje por País | Comparador TCI',
    description: `Índice de Coste de Viaje (TCI) para ${TOTAL_PAISES} países. Compara precios actualizados.`,
    url: 'https://www.viajeinteligencia.com/coste',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/coste',
  },
};

export const revalidate = 3600;

export default function CosteMLPage() {
  const allTCI = getTCIForAllCountries();
  const oil = getCurrentOilPrice();
  const oilAvg = oil.price - oil.vsAvg;

  const countries = allTCI.map(c => ({
    code: c.code,
    name: c.name,
    bandera: c.bandera,
    tci: Math.round(c.tci),
    trend: c.trend,
    region: c.region,
  }));

  const regionSet = new Set(countries.map(c => c.region));
  const regions = ['all', ...Array.from(regionSet)];

  const initialOilData = {
    price: oil.price,
    avg: Math.round(oilAvg * 10) / 10,
    changePct: Math.round(oil.vsAvg * 10) / 10,
  };

  return (
    <CosteClient
      initialCountries={countries}
      initialOilData={initialOilData}
      regions={regions}
    />
  );
}
