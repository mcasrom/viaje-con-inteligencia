import { NextRequest, NextResponse } from 'next/server';
import { getAllFeatures, getFeaturesByCountry, computeAndStoreFeatures } from '@/lib/ml-features';
import { apiError, apiSuccess } from '@/lib/api-schemas';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const cluster = searchParams.get('cluster');

  try {
    if (country) {
      const features = await getFeaturesByCountry(country);
      if (!features) return apiError('No features found for this country', 'not_found', 404);
      return apiSuccess({ features });
    }

    const all = await getAllFeatures();
    const data = cluster ? all.filter(f => f.cluster_label === cluster) : all;

    return apiSuccess({
      features: data,
      total: data.length,
      computedAt: data.length > 0 ? data[0].computed_at : null,
    });
  } catch (err) {
    return apiError('Failed to fetch ML features', String(err), 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, riskLevel } = body;

    if (!country || !riskLevel) {
      return apiError('country and riskLevel are required');
    }

    const features = await computeAndStoreFeatures(country, riskLevel);
    if (!features) return apiError('Failed to compute features', 'compute_error', 500);

    return apiSuccess({ features }, 201);
  } catch (err) {
    return apiError('Failed to compute ML features', String(err), 500);
  }
}
