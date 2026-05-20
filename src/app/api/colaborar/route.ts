import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createLogger } from '@/lib/logger';

const log = createLogger('Colaborar');

const bodySchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  redes: z.string().optional(),
  message: z.string().min(1, 'Mensaje requerido'),
  rol: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Datos inválidos' }, { status: 400 });
    }

    const { name, email, redes, message, rol } = parsed.data;

    const admin = supabaseAdmin;
    if (admin) {
      await admin.from('colaboraciones').insert({
        name, email, redes: redes || null, message, rol: rol || null,
        created_at: new Date().toISOString(),
      });
    }

    log.info(`Colaboración recibida: ${name} (${email}) - ${rol || 'sin rol'}`);

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'Viaje con Inteligencia <info@viajeinteligencia.com>',
        to: ['mcasrom@gmail.com'],
        subject: `Nueva colaboración: ${name} - ${rol || 'sin rol'}`,
        html: `
          <h2>Nueva solicitud de colaboración</h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Rol:</strong> ${rol || 'No especificado'}</p>
          <p><strong>Redes:</strong> ${redes || 'No proporcionado'}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${message}</p>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    log.error('Error al procesar colaboración', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
