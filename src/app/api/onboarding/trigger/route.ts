import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createOnboardingEntry, sendEmail1 } from '@/lib/onboarding';
import { createLogger } from '@/lib/logger';

const log = createLogger('OnboardingTrigger');

export async function POST(request: Request) {
  try {
    const { userId, email, name } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email required' }, { status: 400 });
    }

    const entry = await createOnboardingEntry(userId, email, name);
    if (!entry) {
      return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
    }

    fireAndForget(() => sendEmail1(email, name));

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Error', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function fireAndForget(fn: () => Promise<any>) {
  fn().catch(() => {});
}
