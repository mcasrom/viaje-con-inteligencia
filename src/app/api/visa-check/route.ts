import { NextResponse } from 'next/server';
import { paisesData } from '@/data/paises';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryQuery = searchParams.get('country')?.toLowerCase().trim();

  if (!countryQuery) {
    return NextResponse.json({ error: 'País no proporcionado' }, { status: 400 });
  }

  const country = Object.values(paisesData).find(
    p => p.nombre.toLowerCase().includes(countryQuery) ||
         p.codigo.toLowerCase() === countryQuery ||
         p.capital.toLowerCase().includes(countryQuery)
  );

  if (!country) {
    return NextResponse.json({ error: 'País no encontrado' }, { status: 404 });
  }

  const visaInfo = country.requerimientos?.find(r => 
    r.categoria.toLowerCase().includes('documentación') || r.categoria.toLowerCase().includes('documentacion')
  );

  const hasVisa = visaInfo?.items?.some(item => 
    item.toLowerCase().includes('visa') || item.toLowerCase().includes('visado')
  ) || false;

  const visaFree = visaInfo?.items?.some(item => 
    item.toLowerCase().includes('no se requiere visa') || item.toLowerCase().includes('sin visa')
  ) || false;

  return NextResponse.json({
    country: country.nombre,
    code: country.codigo,
    flag: country.bandera,
    visa_required: !visaFree && hasVisa,
    visa_free: visaFree,
    details: visaInfo?.items?.slice(0, 3).join(' • ') || 'Información no disponible',
    duration: country.nivelRiesgo === 'sin-riesgo' ? '90 días (Schengen)' : 'Consultar embajada',
    requisitos: country.requerimientos,
  });
}