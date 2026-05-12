const BS_HANDLE = process.env.BLUESKY_HANDLE || '';
const BS_PASSWORD = process.env.BLUESKY_APP_PASSWORD || '';

export interface BlueskyPostResult {
  success: boolean;
  uri?: string;
  error?: string;
}

async function createSession(): Promise<string | null> {
  const res = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: BS_HANDLE, password: BS_PASSWORD }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.accessJwt as string;
}

export async function publishToBluesky(
  text: string,
): Promise<BlueskyPostResult> {
  if (!BS_HANDLE || !BS_PASSWORD) {
    return { success: false, error: 'Bluesky credentials not configured' };
  }

  try {
    const jwt = await createSession();
    if (!jwt) return { success: false, error: 'Failed to authenticate with Bluesky' };

    const res = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repo: BS_HANDLE,
        collection: 'app.bsky.feed.post',
        record: {
          $type: 'app.bsky.feed.post',
          text,
          createdAt: new Date().toISOString(),
        },
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      return { success: false, error };
    }

    const data = await res.json();
    return { success: true, uri: data.uri };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
