import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, planTier, message } = body;

    if (!name || !email || !planTier) {
      return NextResponse.json({ error: 'name, email and planTier are required' }, { status: 400 });
    }

    const validTiers = ['free', 'starter', 'pro', 'enterprise'];
    if (!validTiers.includes(planTier)) {
      return NextResponse.json({ error: 'Invalid planTier' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('api_plan_requests')
      .insert({
        name,
        email,
        company: company || null,
        plan_tier: planTier,
        message: message || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const tierLabels: Record<string, string> = {
        free: 'Free', starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise',
      };

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Viaje con Inteligencia <notificaciones@viajeinteligencia.com>',
          to: 'info@viajeinteligencia.com',
          subject: `Nueva solicitud API B2B: ${tierLabels[planTier]} — ${name}`,
          html: `
            <h2>Nueva solicitud de plan API</h2>
            <table style="border-collapse:collapse;width:100%">
              <tr><td style="padding:8px;font-weight:bold">Nombre</td><td style="padding:8px">${name}</td></tr>
              <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${email}</td></tr>
              <tr><td style="padding:8px;font-weight:bold">Empresa</td><td style="padding:8px">${company || '—'}</td></tr>
              <tr><td style="padding:8px;font-weight:bold">Plan</td><td style="padding:8px">${tierLabels[planTier]}</td></tr>
              <tr><td style="padding:8px;font-weight:bold">Mensaje</td><td style="padding:8px">${message || '—'}</td></tr>
            </table>
            <p style="color:#666">ID: ${data.id}</p>
          `,
        }),
      });
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
