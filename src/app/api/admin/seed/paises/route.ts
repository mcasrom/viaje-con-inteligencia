import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { paisesData } from '@/data/paises';
import { createLogger } from '@/lib/logger';

const log = createLogger('SeedPaises');

export async function GET() {
  try {
    const entries = Object.entries(paisesData);
    let inserted = 0;
    let errors = 0;

    for (const [codigo, data] of entries) {
      const { error } = await supabaseAdmin
        .from('paises')
        .upsert({
          codigo: codigo.toLowerCase(),
          nombre: data.nombre,
          capital: data.capital,
          continente: data.continente,
          nivel_riesgo: data.nivelRiesgo,
          ultimo_informe: data.ultimoInforme,
          bandera: data.bandera,
          visible: data.visible !== false,
          data,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'codigo' });

      if (error) {
        log.error(`Error insertando ${codigo}`, error);
        errors++;
      } else {
        inserted++;
      }
    }

    return NextResponse.json({
      ok: true,
      total: entries.length,
      inserted,
      errors,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
