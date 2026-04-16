import { NextRequest, NextResponse } from 'next/server';

const reviews: Record<string, any[]> = {
  es: [
    { id: '1', author: 'María G.', rating: 5, comment: 'España es muy seguro. Los turistas son bienvenidos.', date: '2026-03-15' },
    { id: '2', author: 'Carlos R.', rating: 4, comment: 'Buen país para visitar. Ojo con los carteristas en Barcelona.', date: '2026-02-20' },
  ],
  fr: [
    { id: '3', author: 'Pierre L.', rating: 4, comment: 'Francia es hermosa pero hay zonas que evitar de noche.', date: '2026-03-10' },
  ],
  jp: [
    { id: '4', author: 'Ana M.', rating: 5, comment: 'Japón es increíblemente seguro. Perfecto para viajar solo.', date: '2026-04-01' },
    { id: '5', author: 'David K.', rating: 5, comment: 'El país más seguro que he visitado.地震 no son un problema.', date: '2026-03-25' },
  ],
  us: [
    { id: '6', author: 'Roberto S.', rating: 4, comment: 'EEUU tiene zonas muy seguras y otras que evitar. Investiga bien.', date: '2026-02-28' },
  ],
  mx: [
    { id: '7', author: 'Laura P.', rating: 3, comment: 'Hay zonas turísticas muy seguras pero otras requieren precaución.', date: '2026-03-05' },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  if (country) {
    const countryReviews = reviews[country] || [];
    const avgRating = countryReviews.length > 0
      ? countryReviews.reduce((sum, r) => sum + r.rating, 0) / countryReviews.length
      : null;
    
    return NextResponse.json({
      reviews: countryReviews,
      count: countryReviews.length,
      averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    });
  }

  const allReviews = Object.entries(reviews).flatMap(([country, countryReviews]) =>
    countryReviews.map(r => ({ ...r, country }))
  );

  return NextResponse.json({
    reviews: allReviews,
    count: allReviews.length,
    byCountry: Object.fromEntries(
      Object.entries(reviews).map(([k, v]) => [k, v.length])
    ),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { country, author, rating, comment } = await request.json();

    if (!country || !author || !rating || !comment) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating debe ser entre 1 y 5' },
        { status: 400 }
      );
    }

    const newReview = {
      id: Date.now().toString(),
      author: author.trim(),
      rating: parseInt(rating),
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      country,
    };

    if (!reviews[country]) {
      reviews[country] = [];
    }
    reviews[country].unshift(newReview);

    return NextResponse.json({
      success: true,
      review: newReview,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al guardar la review' },
      { status: 500 }
    );
  }
}
