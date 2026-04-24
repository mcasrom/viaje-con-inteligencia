import { NextResponse } from 'next/server';
import { getPaisPorCodigo } from '@/data/paises';
import { getWeatherForecast } from '@/lib/weather';

const WORLD_BANK_API = 'https://api.worldbank.org/v2';

interface WorldBankData {
  [key: string]: {
    name: string;
    value: string;
    year: string;
  };
}

async function fetchWorldBankMultiple(countryCode: string, indicators: string[]): Promise<WorldBankData> {
  const results: WorldBankData = {};
  
  const indicatorCodes: Record<string, string> = {
    arrivals: 'ST.INT.ARVL',
    gdp: 'NY.GDP.MKTP.CD',
    gdpPerCapita: 'NY.GDP.PCAP.CD',
    population: 'SP.POP.TOTL',
    passengers: 'IS.AIR.PSGR',
    roads: 'IS.ROD.DNRS.KD',
  };

  await Promise.all(
    indicators.map(async (indicator) => {
      const code = indicatorCodes[indicator];
      if (!code) return;
      
      try {
        const url = `${WORLD_BANK_API}/country/${countryCode}/indicator/${code}?format=json&per_page=1&date=2023`;
        const response = await fetch(url);
        const data = await response.json();
        const entry = data[1]?.[0];
        
        if (entry?.value) {
          let value = entry.value;
          if (indicator === 'arrivals' || indicator === 'passengers') {
            value = value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${(value / 1000).toFixed(0)}K`;
          } else if (indicator === 'gdp' || indicator === 'gdpPerCapita') {
            value = indicator === 'gdp' 
              ? `$${(value / 1e9).toFixed(0)}B` 
              : `$${value.toFixed(0)}`;
          } else if (indicator === 'population') {
            value = value >= 1e6 ? `${(value / 1e6).toFixed(1)}M` : value.toString();
          } else if (indicator === 'roads') {
            value = `${(value / 1000).toFixed(0)}K km`;
          }
          
          results[indicator] = {
            name: indicator.charAt(0).toUpperCase() + indicator.slice(1),
            value,
            year: entry.date || '2023',
          };
        }
      } catch (e) {
        console.error(`Error fetching ${indicator}:`, e);
      }
    })
  );
  
  return results;
}

function getBestSeason(month: number): string {
  const seasons: Record<number, string> = {
    12: 'Invierno - Festividades',
    1: 'Invierno - Festividades',
    2: 'Invierno - Carnavales',
    3: 'Primavera - Beginning',
    4: 'Primavera - Semana Santa',
    5: 'Primavera -良好',
    6: 'Verano - inicio',
    7: 'Verano - Alta',
    8: 'Verano - Alta',
    9: 'Otoño - inicio',
    10: 'Otoño',
    11: 'Otoño',
  };
  return seasons[month] || '';
}

function getClimateData(): { tempMin: number; tempMax: number; rainDays: number; season: string }[] {
  return [
    { tempMin: 3, tempMax: 12, rainDays: 10, season: 'Enero' },
    { tempMin: 4, tempMax: 14, rainDays: 9, season: 'Febrero' },
    { tempMin: 6, tempMax: 18, rainDays: 8, season: 'Marzo' },
    { tempMin: 8, tempMax: 20, rainDays: 9, season: 'Abril' },
    { tempMin: 12, tempMax: 24, rainDays: 7, season: 'Mayo' },
    { tempMin: 16, tempMax: 30, rainDays: 4, season: 'Junio' },
    { tempMin: 19, tempMax: 33, rainDays: 2, season: 'Julio' },
    { tempMin: 19, tempMax: 32, rainDays: 3, season: 'Agosto' },
    { tempMin: 16, tempMax: 28, rainDays: 6, season: 'Septiembre' },
    { tempMin: 11, tempMax: 22, rainDays: 9, season: 'Octubre' },
    { tempMin: 7, tempMax: 16, rainDays: 10, season: 'Noviembre' },
    { tempMin: 4, tempMax: 13, rainDays: 11, season: 'Diciembre' },
  ];
}

export async function GET(request: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo: codigoParams } = await params;
  const { searchParams } = new URL(request.url);
  const queryCountry = searchParams.get('country')?.toLowerCase();
  
  const countryCode = queryCountry || codigoParams?.toLowerCase();
  
  if (!countryCode) {
    return NextResponse.json({ error: 'Country code required' }, { status: 400 });
  }

  const pais = getPaisPorCodigo(countryCode);
  
  if (!pais) {
    return NextResponse.json({ error: 'Country not found' }, { status: 404 });
  }

  const [wbData, weather] = await Promise.all([
    fetchWorldBankMultiple(countryCode, ['arrivals', 'gdp', 'gdpPerCapita', 'population', 'passengers', 'roads']),
    pais.mapaCoordenadas 
      ? getWeatherForecast(pais.mapaCoordenadas[0], pais.mapaCoordenadas[1], 7)
      : Promise.resolve(null),
  ]);

  const bestMonths = [5, 6, 9, 10];
  const bestSeason = bestMonths.map(m => getBestSeason(m)).join(', ');

  const dossier = {
    metadata: {
      codigo: pais.codigo,
      nombre: pais.nombre,
      bandera: pais.bandera,
      capital: pais.capital,
      continente: pais.continente,
      ultimoInforme: pais.ultimoInforme,
      generatedAt: new Date().toISOString(),
    },

    seguridad: {
      nivelRiesgo: pais.nivelRiesgo,
      ultimoInforme: pais.ultimoInforme,
      recomendaciones: pais.queNoHacer?.slice(0, 5) || [],
      contactosEmergencia: pais.contactos?.slice(0, 3) || [],
    },

    informacionGeneral: {
      idioma: pais.idioma,
      moneda: pais.moneda,
      zonaHoraria: pais.zonaHoraria,
      voltaje: pais.voltaje,
      prefijoTelefono: pais.prefijoTelefono,
      conduccion: pais.conduccion,
    },

    economia: {
      pib: wbData.gdp?.value || pais.pib || 'N/A',
      pibPerCapita: wbData.gdpPerCapita?.value || 'N/A',
      poblacion: wbData.population?.value || pais.poblacion || 'N/A',
      ipc: pais.indicadores?.ipc || 'N/A',
    },

    turismo: {
      turistasAnio: wbData.arrivals?.value || pais.turisticos?.turistasAnio || 'N/A',
      ingresosTurismo: pais.turisticos?.ingresosTurismo || 'N/A',
      estanciaMedia: pais.turisticos?.estanciaMedia || 'N/A',
      temporadaAlta: pais.turisticos?.temporadaAlta || bestSeason,
      destinosPopulares: pais.turisticos?.destinosPopulares || [],
    },

    transporte: {
      conduccion: pais.conduccion,
      licencias: pais.transporte?.licenciaES 
        ? 'Española válida con traducción' 
        : 'Consultar requisitos específicos',
      aeropuertos: pais.transporte?.aeropuertos?.map(a => ({
        nombre: a.nombre,
        iata: a.iata,
        ciudad: a.ciudad,
        tipo: a.tipo,
      })) || [
        { nombre: 'Consultar API', iata: '-', ciudad: '-', tipo: 'internacional' }
      ],
      puertos: pais.transporte?.puertos?.slice(0, 5) || [],
      viasFerreas: pais.transporte?.viasFerreas || wbData.roads?.value || 'N/A',
      metro: pais.transporte?.metro || false,
      altaVelocidad: pais.transporte?.trenAltaVelocidad || false,
      peajes: pais.transporte?.peajes || false,
    },

    requisitos: {
      visaSchengen: pais.codigo === 'es' ? 'No (España)' : 
        ['de', 'fr', 'it', 'pt', 'nl', 'be', 'at', 'gr'].includes(pais.codigo) ? 'No (Schengen)' : 'Consultar',
      pasaporteMinMeses: 6,
      vacunas: 'Consultar requisitos específicos',
      seguro: 'Recomendado',
    },

    clima: {
      actual: weather ? {
        temperatura: weather.current?.temp || 'N/A',
        condiciones: weather.current?.weatherCode || 'N/A',
        humedad: weather.current?.humidity || 'N/A',
      } : null,
      forecast: weather?.daily?.slice(0, 7).map(d => ({
        fecha: d.date,
        tempMax: d.tempMax,
        tempMin: d.tempMin,
        lluvia: d.precipitation,
      })) || [],
      mejorEpoca: bestSeason,
      climaHistorico: getClimateData(),
    },

    queHacer: pais.queHacer || [],
    urlsUtiles: pais.urlsUtiles || [],
  };

  return NextResponse.json(dossier);
}