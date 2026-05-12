import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase().trim() || '';

  if (q.length < 2) {
    return NextResponse.json({ countries: [] });
  }

  const { paisesData } = await import('@/data/paises');

  const results = Object.values(paisesData)
    .filter(p => {
      if (p.visible === false) return false;
      const name = p.nombre.toLowerCase();
      const code = p.codigo.toLowerCase();
      return name.includes(q) || code.includes(q);
    })
    .slice(0, 15)
    .map(p => ({
      codigo: p.codigo,
      nombre: p.nombre,
      bandera: p.bandera || '',
    }));

  return NextResponse.json({ countries: results });
}
