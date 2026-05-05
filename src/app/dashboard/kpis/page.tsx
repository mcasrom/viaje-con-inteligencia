import { getTodosLosPaises } from '@/data/paises';
import { GPI_DATA, GTI_DATA, HDI_DATA, IPC_DATA } from '@/data/indices';
import { getTCIForAllCountries, getCurrentOilPrice } from '@/data/tci-engine';
import { tourismData } from '@/data/tourism';
import KPIDashboard from './KPIDashboardClient';

export const revalidate = 3600;

function getBandera(code: string): string {
  const pais = getTodosLosPaises().find(p => p.codigo === code);
  return pais?.bandera || '🌍';
}

function getNombre(code: string): string {
  const pais = getTodosLosPaises().find(p => p.codigo === code);
  return pais?.nombre || code;
}

export default function KPIsPage() {
  const allPaises = getTodosLosPaises().filter(p => p.visible !== false && p.codigo !== 'cu');
  const allTCI = getTCIForAllCountries();
  const oil = getCurrentOilPrice();

  // GPI Top 5
  const gpiTop5 = GPI_DATA
    .slice(0, 5)
    .map(g => ({ code: g.code.toLowerCase(), country: g.country, score: g.score, rank: g.rank, bandera: getBandera(g.code.toLowerCase()) }));

  // GPI Worst 5
  const gpiWorst5 = [...GPI_DATA]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(g => ({ code: g.code.toLowerCase(), country: g.country, score: g.score, rank: g.rank, bandera: getBandera(g.code.toLowerCase()) }));

  // HDI Top 5
  const hdiTop5 = HDI_DATA
    .slice(0, 5)
    .map(h => ({ code: h.code.toLowerCase(), country: h.country, score: h.score, rank: h.rank, bandera: getBandera(h.code.toLowerCase()) }));

  // GTI Worst 5
  const gtiWorst5 = [...GTI_DATA]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(g => ({ code: g.code.toLowerCase(), country: g.country, score: g.score, rank: g.rank, bandera: getBandera(g.code.toLowerCase()) }));

  // Risk distribution (MAEC)
  const riskDistribution: Record<string, { count: number; countries: string[] }> = {};
  allPaises.forEach(p => {
    if (!riskDistribution[p.nivelRiesgo]) riskDistribution[p.nivelRiesgo] = { count: 0, countries: [] };
    riskDistribution[p.nivelRiesgo].count++;
    riskDistribution[p.nivelRiesgo].countries.push(p.nombre);
  });

  // IPC extremos
  const ipcExtremos = [...IPC_DATA]
    .sort((a, b) => {
      const aNum = parseFloat(a.ipc.replace('%', ''));
      const bNum = parseFloat(b.ipc.replace('%', ''));
      return bNum - aNum;
    })
    .slice(0, 8)
    .map(i => ({ code: i.code.toLowerCase(), country: i.country, ipc: i.ipc, nivel: i.nivel, bandera: getBandera(i.code.toLowerCase()) }));

  // Top tourism destinations
  const topTourism = Object.entries(tourismData)
    .sort((a, b) => b[1].arrivals - a[1].arrivals)
    .slice(0, 15)
    .map(([code, stats]) => ({
      code: code.toLowerCase(),
      country: getNombre(code.toLowerCase()),
      bandera: getBandera(code.toLowerCase()),
      arrivals: stats.arrivals,
      receipts: stats.receipts,
      avgStay: stats.avgStay,
      spendPerDay: stats.spendPerDay,
    }));

  // TCI baratos
  const tciBaratos = allTCI.slice(0, 5).map(c => ({ code: c.code, name: c.name, bandera: c.bandera, tci: c.tci, region: c.region }));

  // TCI caros
  const tciCaros = [...allTCI].sort((a, b) => b.tci - a.tci).slice(0, 5).map(c => ({ code: c.code, name: c.name, bandera: c.bandera, tci: c.tci, region: c.region }));

  // Continent distribution
  const continentMap: Record<string, number> = {};
  allPaises.forEach(p => { continentMap[p.continente] = (continentMap[p.continente] || 0) + 1; });
  const continentDistribution = Object.entries(continentMap).map(([continent, count]) => ({ continent, count })).sort((a, b) => b.count - a.count);

  // IPC distribution
  const ipcMap: Record<string, number> = {};
  IPC_DATA.forEach(i => { ipcMap[i.nivel] = (ipcMap[i.nivel] || 0) + 1; });
  const ipcDistribution = Object.entries(ipcMap).map(([nivel, count]) => ({ nivel, count }));

  // GPI by region
  const regionMap: Record<string, { total: number; count: number }> = {};
  GPI_DATA.forEach(g => {
    if (!regionMap[g.region]) regionMap[g.region] = { total: 0, count: 0 };
    regionMap[g.region].total += g.score;
    regionMap[g.region].count++;
  });
  const gpiByRegion = Object.entries(regionMap)
    .map(([region, data]) => ({ region, avgScore: Math.round((data.total / data.count) * 100) / 100, count: data.count }))
    .sort((a, b) => a.avgScore - b.avgScore);

  const totalCountries = allPaises.length;
  const totalSafe = allPaises.filter(p => p.nivelRiesgo === 'sin-riesgo' || p.nivelRiesgo === 'bajo').length;
  const avgHDI = HDI_DATA.length > 0 ? Math.round((HDI_DATA.reduce((s, h) => s + h.score, 0) / HDI_DATA.length) * 1000) / 1000 : 0;
  const avgGPI = GPI_DATA.length > 0 ? Math.round((GPI_DATA.reduce((s, g) => s + g.score, 0) / GPI_DATA.length) * 100) / 100 : 0;

  return (
    <KPIDashboard
      gpiTop5={gpiTop5}
      gpiWorst5={gpiWorst5}
      hdiTop5={hdiTop5}
      gtiWorst5={gtiWorst5}
      riskDistribution={riskDistribution}
      ipcExtremos={ipcExtremos}
      topTourism={topTourism}
      tciBaratos={tciBaratos}
      tciCaros={tciCaros}
      oilPrice={oil.price}
      totalCountries={totalCountries}
      totalSafe={totalSafe}
      avgHDI={avgHDI}
      avgGPI={avgGPI}
      continentDistribution={continentDistribution}
      ipcDistribution={ipcDistribution}
      gpiByRegion={gpiByRegion}
    />
  );
}
