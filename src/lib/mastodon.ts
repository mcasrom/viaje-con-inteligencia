const MASTODON_URL = 'mastodon.social';
const ACCESS_TOKEN = process.env.MASTODON_ACCESS_TOKEN;

export interface MastodonPostResult {
  success: boolean;
  id?: string;
  url?: string;
  error?: string;
}

export async function publishToMastodon(
  title: string,
  excerpt: string,
  slug: string,
  tags: string[] = []
): Promise<MastodonPostResult> {
  if (!ACCESS_TOKEN) {
    console.log('Mastodon: No token configured, skipping');
    return { success: false, error: 'Mastodon token not configured' };
  }

  try {
    const hashtags = tags.map(t => `#${t.replace(/ /g, '')}`).join(' ');
    const status = `📝 ${title}\n\n${excerpt.slice(0, 200)}...\n\n🔗 https://viajeinteligencia.com/blog/${slug}\n\n${hashtags}`;

    const response = await fetch(`https://${MASTODON_URL}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        visibility: 'public',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Mastodon API error:', error);
      return { success: false, error };
    }

    const data = await response.json();
    console.log('Mastodon: Post published successfully:', data.id);
    
    return {
      success: true,
      id: data.id,
      url: data.url,
    };
  } catch (error) {
    console.error('Mastodon error:', error);
    return { success: false, error: String(error) };
  }
}

export async function publishRouteToMastodon(
  routeName: string,
  description: string,
  routeId: string,
  days: string
): Promise<MastodonPostResult> {
  const status = `🛣️ ${routeName}\n\n${description.slice(0, 150)}\n\n⏱️ ${days} días\n🔗 https://viajeinteligencia.com/rutas?route=${routeId}\n\n#ViajesEspaña #Rutas #Turismo`;

  if (!ACCESS_TOKEN) {
    return { success: false, error: 'Token not configured' };
  }

  try {
    const response = await fetch(`https://${MASTODON_URL}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        visibility: 'public',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, id: data.id, url: data.url };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}