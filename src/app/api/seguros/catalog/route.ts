import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createLogger } from '@/lib/logger';
import { apiError, apiResponse, CountryCodeSchema } from '@/lib/api-schemas';
import { z } from 'zod';

const log = createLogger('Seguros');

const ProductSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  aseguradora: z.string(),
  precio_min: z.number(),
  precio_max: z.number(),
  moneda: z.string(),
  coberturas: z.record(z.string(), z.any()),
  exclusiones: z.array(z.string()),
  recomendado_para: z.array(z.string()),
});

const ProductListSchema = z.array(ProductSchema);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const perfil = searchParams.get('perfil');

    if (!supabaseAdmin) {
      const { default: segurosData } = await import('@/data/seguros.json') as any;
      let productos = segurosData.productos;
      if (perfil && (segurosData.perfiles as Record<string, any>)[perfil]) {
        productos = productos.filter((p: any) =>
          p.recomendado_para?.includes(perfil)
        );
      }
      return NextResponse.json(ProductListSchema.parse(productos));
    }

    let query = supabaseAdmin.from('seguros_catalog').select('*');
    if (perfil) {
      query = query.contains('recomendado_para', [perfil]);
    }
    const { data, error } = await query.order('precio_min', { ascending: true });

    if (error) {
      log.error('Error fetching catalog:', error);
      return apiError('Error al obtener catalogo', undefined, 500);
    }

    return NextResponse.json(ProductListSchema.parse(data || []));
  } catch (err) {
    log.error('Catalog error:', err);
    return apiError('Error interno', undefined, 500);
  }
}
