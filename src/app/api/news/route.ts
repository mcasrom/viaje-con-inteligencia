import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || 'world';
  const category = searchParams.get('category') || 'politics';
  const max = searchParams.get('max') || '10';

  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    const mockAlerts = generateMockAlerts();
    return NextResponse.json({
      alerts: mockAlerts,
      source: 'Demo Data (configure GNEWS_API_KEY for live data)',
      updated: new Date().toISOString(),
    });
  }

  try {
    const categories = ['politics', 'world', 'business', 'health', 'science', 'technology'];
    const alerts = [];

    for (const cat of categories.slice(0, 3)) {
      const url = `https://gnews.io/api/v4/top-headlines?category=${cat}&lang=es&country=${country}&max=${max}&apikey=${apiKey}`;
      
      const response = await fetch(url, { next: { revalidate: 3600 } });
      
      if (response.ok) {
        const data = await response.json();
        alerts.push(...data.articles.map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt,
          category: cat,
          country,
        })));
      }
    }

    alerts.sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json({
      alerts: alerts.slice(0, 30),
      count: alerts.length,
      source: 'GNews API',
      updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news data' },
      { status: 500 }
    );
  }
}

function generateMockAlerts() {
  return [
    {
      id: '1',
      title: 'Terremoto magnitud 5.2 en Japón',
      description: 'Un terremoto de magnitud 5.2 se ha registrado cerca de la costa este de Japón. No se han reportado daños significativos.',
      url: 'https://example.com/news/japan-earthquake',
      source: 'Demo News',
      publishedAt: new Date().toISOString(),
      category: 'world',
      riskLevel: 'medium',
      region: 'Asia',
    },
    {
      id: '2',
      title: 'Alerta de tormentas en el Mediterráneo',
      description: 'Se esperan tormentas intensas en varios países del Mediterráneo durante los próximos días.',
      url: 'https://example.com/news/mediterranean-storm',
      source: 'Demo News',
      publishedAt: new Date().toISOString(),
      category: 'weather',
      riskLevel: 'low',
      region: 'Europa',
    },
    {
      id: '3',
      title: 'Manifestaciones en Francia',
      description: 'Protestas programadas en varias ciudades francesas esta semana. Se recomienda evitar zonas de concentración.',
      url: 'https://example.com/news/france-protests',
      source: 'Demo News',
      publishedAt: new Date().toISOString(),
      category: 'politics',
      riskLevel: 'medium',
      region: 'Europa',
    },
  ];
}
