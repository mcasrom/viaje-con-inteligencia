import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  try {
    let query = supabase
      .from('reviews')
      .select('id, author, rating, comment, country, trip_date, verified, image_url, created_at')
      .order('created_at', { ascending: false });

    if (country) {
      query = query.eq('country', country);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const reviews = data || [];

    if (country) {
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

      return NextResponse.json({
        reviews: reviews.map(r => ({
          ...r,
          date: r.created_at,
        })),
        count: reviews.length,
        averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      });
    }

    // Get count by country
    const { data: countryCounts } = await supabase
      .from('reviews')
      .select('country')
      .not('country', 'is', null);

    const byCountry = countryCounts?.reduce((acc: Record<string, number>, r) => {
      if (r.country) acc[r.country] = (acc[r.country] || 0) + 1;
      return acc;
    }, {}) || {};

    return NextResponse.json({
      reviews: reviews.map(r => ({
        ...r,
        date: r.created_at,
      })),
      count,
      byCountry,
    });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ error: 'Error al cargar reseñas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { country, author, rating, comment, image_url } = await request.json();

    if (!author || !rating || !comment) {
      return NextResponse.json(
        { error: 'Nombre, rating y comentario son requeridos' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating debe ser entre 1 y 5' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        author: author.trim(),
        rating: parseInt(rating),
        comment: comment.trim(),
        country: country || null,
        verified: false,
        image_url: image_url || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      review: {
        ...data,
        date: data.created_at,
      },
    });
  } catch (error) {
    console.error('Reviews POST error:', error);
    return NextResponse.json(
      { error: 'Error al guardar la reseña' },
      { status: 500 }
    );
  }
}
