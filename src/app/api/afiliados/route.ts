import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createLogger } from '@/lib/logger';

const log = createLogger('Afiliados');

const bodySchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  web: z.string().min(1, 'Web, canal o comunidad requerido'),
  audiencia: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Datos inválidos' }, { status: 400 });
    }

    const { name, email, web, audiencia, message } = parsed.data;

    const admin = supabaseAdmin;
    if (admin) {
      await admin.from('afiliados').insert({
        name, email, web, audiencia: audiencia || null, message: message || null,
        created_at: new Date().toISOString(),
      });
    }

    log.info(`Afiliado solicitado: ${name} (${email}) - ${audiencia || 'sin audiencia'}`);

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'Viaje con Inteligencia <info@viajeinteligencia.com>',
        to: ['mcasrom@gmail.com'],
        subject: `Nueva solicitud afiliado: ${name} - ${web}`,
        html: `
          <h2>Nueva solicitud de afiliado</h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Web/Canal:</strong> ${web}</p>
          <p><strong>Audiencia:</strong> ${audiencia || 'No especificado'}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${message || 'Sin mensaje adicional'}</p>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    log.error('Error al procesar solicitud de afiliado', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
