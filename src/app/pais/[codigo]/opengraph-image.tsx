import { ImageResponse } from 'next/og';
import { paisesData, getLabelRiesgo, getColoresRiesgo } from '@/data/paises';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

const RIESGO_BG: Record<string, string> = {
  'sin-riesgo': '#10b981',
  bajo: '#eab308',
  medio: '#f97316',
  alto: '#ef4444',
  'muy-alto': '#7f1d1d',
};

export default async function Image({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const pais = paisesData[codigo.toLowerCase()];

  const name = pais?.nombre || codigo.toUpperCase();
  const riesgo = pais?.nivelRiesgo || 'sin-riesgo';
  const label = pais ? getLabelRiesgo(riesgo) : '';
  const color = RIESGO_BG[riesgo] || '#6b7280';
  const flag = pais?.bandera || '🌍';

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 20 }}>{flag}</div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: 12,
            textAlign: 'center',
            padding: '0 40px',
          }}
        >
          {name}
        </div>
        {label && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 28px',
              borderRadius: 999,
              background: color + '33',
              border: '2px solid ' + color,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: color,
              }}
            />
            <span style={{ fontSize: 28, fontWeight: 600, color: '#f1f5f9' }}>
              Riesgo MAEC: {label}
            </span>
          </div>
        )}
        <div
          style={{
            marginTop: 32,
            fontSize: 18,
            color: '#64748b',
            letterSpacing: 2,
            textTransform: 'uppercase' as const,
          }}
        >
          viajeinteligencia.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
