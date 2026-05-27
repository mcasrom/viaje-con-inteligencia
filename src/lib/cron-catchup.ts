let checking = false;
let caughtUp = false;

export async function checkCronCatchup(): Promise<void> {
  if (checking || caughtUp) return;
  checking = true;

  try {
    const now = new Date();
    const today6am = new Date(now);
    today6am.setUTCHours(6, 0, 0, 0);

    const today6pm = new Date(now);
    today6pm.setUTCHours(18, 0, 0, 0);

    if (now < today6am || now > today6pm) {
      caughtUp = true;
      checking = false;
      return;
    }

    const { createHash } = await import('node:crypto');
    const dayStr = now.toISOString().slice(0, 10);
    const lock = createHash('md5').update(`cron-${dayStr}`).digest('hex');

    const { supabaseAdmin } = await import('./supabase-admin');
    const { data: existing } = await supabaseAdmin
      .from('cron_history')
      .select('id')
      .eq('lock_key', lock)
      .single();

    if (existing) {
      caughtUp = true;
      checking = false;
      return;
    }

    console.log(`[CronCatchup] Cron didn't run today (${dayStr}), triggering catchup...`);

    const CRON_SECRET = process.env.CRON_SECRET;
    if (!CRON_SECRET) {
      caughtUp = true;
      checking = false;
      return;
    }

    const res = await fetch(
      `http://localhost:3000/api/cron/master`,
      { headers: { Authorization: `Bearer ${CRON_SECRET}` } }
    );

    if (res.ok) {
      const result = await res.json();
      console.log(`[CronCatchup] Catchup triggered: ${JSON.stringify(result)}`);
    }

    caughtUp = true;
  } catch (e) {
    console.warn('[CronCatchup] Error:', e);
  } finally {
    checking = false;
  }
}
