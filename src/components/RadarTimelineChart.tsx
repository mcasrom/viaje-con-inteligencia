'use client';

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine,
} from 'recharts';

const COUNTRY_COLORS = [
  '#3b82f6', '#f59e0b', '#10b981', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

interface Point {
  month: string;
  risk_score: number;
  risk_label: string;
  seasonality: number;
}

interface Country {
  country_code: string;
  country_name: string;
  bandera: string;
  baseline_risk: number;
  baseline_label: string;
  trip_start: string | null;
  trip_end: string | null;
  projection: Point[];
}

function monthLabel(m: string) {
  const parts = m.split('-');
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
  return d.toLocaleDateString('es', { month: 'short' });
}

export default function RadarTimelineChart() {
  const [data, setData] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/watchlist/timeline')
      .then(r => r.json())
      .then(d => setData(d.timeline || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || data.length === 0) return null;

  const chartData = data[0].projection.map((_, i) => {
    const point: Record<string, any> = {
      month: data[0].projection[i].month,
      monthLabel: monthLabel(data[0].projection[i].month),
    };
    data.forEach(c => {
      point[c.country_code] = c.projection[i].risk_score;
    });
    return point;
  });

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-white mb-1">Proyecci&oacute;n de Riesgo</h3>
      <p className="text-sm text-slate-400 mb-4">
        Tendencia estimada basada en riesgo base + estacionalidad
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

          <XAxis
            dataKey="monthLabel"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#475569' }}
          />

          <YAxis
            domain={[0.5, 5.5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={v => ['', '1 Sin riesgo', '2 Bajo', '3 Medio', '4 Alto', '5 Muy alto'][v]}
            axisLine={{ stroke: '#475569' }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '13px',
            }}
            labelStyle={{ color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}
          />

          <Legend
            wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }}
            iconType="plainline"
          />

          {data.filter(c => c.trip_start).map(c => (
            <ReferenceLine
              key={`trip-${c.country_code}`}
              x={monthLabel(c.trip_start!)}
              stroke={COUNTRY_COLORS[data.indexOf(c)]}
              strokeDasharray="4 2"
              strokeWidth={2}
              label={{
                value: `✈ ${c.country_name}`,
                fill: COUNTRY_COLORS[data.indexOf(c)],
                fontSize: 10,
                position: 'top',
              }}
            />
          ))}

          {data.map((c, i) => (
            <Line
              key={c.country_code}
              type="monotone"
              dataKey={c.country_code}
              stroke={COUNTRY_COLORS[i % COUNTRY_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3, fill: COUNTRY_COLORS[i % COUNTRY_COLORS.length] }}
              name={`${c.bandera} ${c.country_name}`}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
