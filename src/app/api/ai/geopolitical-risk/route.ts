import { NextRequest, NextResponse } from 'next/server';
import { paisesData } from '@/data/paises';

const GEOPOLITICAL_COUNTRIES = ['ir', 'il', 'lb', 'ps'];

const CONFLICT_ZONES: Record<string, { name: string; conflict: string; mainRisk: string }> = {
  ir: { name: 'Irán', conflict: 'Nuclear + Regional', mainRisk: ' nuclear program' },
  il: { name: 'Israel', conflict: 'Gaza + West Bank', mainRisk: ' military operations' },
  lb: { name: 'Líbano', conflict: 'Hezbollah + Crisis', mainRisk: ' economic collapse' },
  ps: { name: 'Palestina', conflict: 'Gaza', mainRisk: ' armed conflict' },
};

const RISK_TREND_WEIGHTS = {
  'sin-riesgo': 1,
  'bajo': 3,
  'medio': 5,
  'alto': 8,
  'muy-alto': 10,
};

function calculateRiskScore(nivelRiesgo: string): number {
  return RISK_TREND_WEIGHTS[nivelRiesgo as keyof typeof RISK_TREND_WEIGHTS] || 5;
}

function getAlertLevel(score: number, trend: string): string {
  if (score >= 8 && trend === 'up') return 'CRITICAL';
  if (score >= 7) return 'HIGH';
  if (score >= 5) return 'MEDIUM';
  return 'LOW';
}

function getRecommendation(country: string, score: number, trend: string): string {
  const recommendations: Record<string, string> = {
    'ir': 'No viajar. Riesgo muy alto de conflicto regional. Emergencia médica comprometida.',
    'il': 'Evitar zonas próximas a Gaza. Seguros de viaje no cubren zonas de conflicto.',
    'lb': 'No viajar. Crisis económica + riesgo Hezbollah. Embajadas pueden cerrar.',
    'ps': 'No travel advisory. Conflicto activo en Gaza.',
  };
  return recommendations[country] || 'Consultar antes de viajar.';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countries = searchParams.get('countries')?.split(',') || GEOPOLITICAL_COUNTRIES;

  try {
    const analysis = countries.map(code => {
      const pais = paisesData[code];
      const conflict = CONFLICT_ZONES[code];
      
      if (!pais) {
        return { code, error: 'País no encontrado' };
      }

      const currentScore = calculateRiskScore(pais.nivelRiesgo);
      
      // Simular trend basado en situación actual
      // En producción, esto vendría de scraper_logs
      let trend = 'stable';
      if (code === 'ir' && pais.nivelRiesgo === 'alto') trend = 'up';
      if (code === 'lb' && pais.nivelRiesgo === 'medio') trend = 'up';
      if (code === 'ps' && pais.nivelRiesgo === 'muy-alto') trend = 'up';
      if (code === 'il' && pais.nivelRiesgo === 'medio') trend = 'stable';

      const alertLevel = getAlertLevel(currentScore, trend);

      return {
        code,
        country: pais.nombre,
        conflict: conflict?.conflict || 'N/A',
        currentRisk: pais.nivelRiesgo,
        riskScore: currentScore,
        trend,
        alert: alertLevel,
        updated: pais.ultimoInforme,
        recommendation: getRecommendation(code, currentScore, trend),
      };
    });

    // Ordenar por riesgo
    const sorted = [...analysis].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));

    // Generar summary
    const critical = analysis.filter(a => a.alert === 'CRITICAL').length;
    const high = analysis.filter(a => a.alert === 'HIGH').length;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      method: 'Geopolitical Risk Assessment (MAEC-based)',
      summary: {
        total: analysis.length,
        critical,
        high,
        status: critical > 0 ? 'ALERT' : 'STABLE',
      },
      risks: sorted,
    });
  } catch (error) {
    console.error('[Geopolitical] Error:', error);
    return NextResponse.json(
      { error: 'Error analyzing geopolitical risk' },
      { status: 500 }
    );
  }
}