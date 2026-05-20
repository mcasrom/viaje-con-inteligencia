import { Resend } from 'resend';
import { supabaseAdmin } from './supabase-admin';
import { createLogger } from './logger';

const log = createLogger('RiskNotifier');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const BASE_URL = process.env.APP_BASE_URL || 'https://www.viajeinteligencia.com';

const RISK_COLORS: Record<string, string> = {
  'sin-riesgo': '#10b981',
  'bajo': '#22c55e',
  'medio': '#f59e0b',
  'alto': '#ef4444',
  'muy-alto': '#991b1b',
};

const RISK_LABELS: Record<string, string> = {
  'sin-riesgo': 'Sin riesgo',
  'bajo': 'Bajo',
  'medio': 'Medio',
  'alto': 'Alto',
  'muy-alto': 'Muy alto',
};

interface RiskChange {
  code: string;
  oldRisk: string;
  newRisk: string;
}

function getCountryName(code: string): string {
  const names: Record<string, string> = {
    ae: 'Emiratos Árabes Unidos', af: 'Afganistán', al: 'Albania', ar: 'Argentina',
    at: 'Austria', au: 'Australia', be: 'Bélgica', bf: 'Burkina Faso', bg: 'Bulgaria',
    bi: 'Burundi', bj: 'Benín', bo: 'Bolivia', br: 'Brasil', bw: 'Botsuana',
    ca: 'Canadá', cd: 'República Democrática del Congo', cf: 'República Centroafricana',
    cg: 'Congo', ch: 'Suiza', ci: 'Costa de Marfil', cl: 'Chile', cm: 'Camerún',
    cn: 'China', co: 'Colombia', cr: 'Costa Rica', cz: 'República Checa',
    de: 'Alemania', dj: 'Yibuti', dk: 'Dinamarca', do: 'República Dominicana',
    dz: 'Argelia', ec: 'Ecuador', ee: 'Estonia', eg: 'Egipto', er: 'Eritrea',
    es: 'España', et: 'Etiopía', fi: 'Finlandia', fj: 'Fiyi', fr: 'Francia',
    ga: 'Gabón', gb: 'Reino Unido', ge: 'Georgia', gh: 'Ghana', gl: 'Groenlandia',
    gq: 'Guinea Ecuatorial', gr: 'Grecia', gt: 'Guatemala', hk: 'Hong Kong',
    hr: 'Croacia', ht: 'Haití', hu: 'Hungría', id: 'Indonesia', ie: 'Irlanda',
    il: 'Israel', in: 'India', ir: 'Irán', is: 'Islandia', it: 'Italia',
    jm: 'Jamaica', jo: 'Jordania', jp: 'Japón', ke: 'Kenia', kg: 'Kirguistán',
    kh: 'Camboya', kr: 'Corea del Sur', kz: 'Kazajistán', la: 'Laos',
    lb: 'Líbano', lk: 'Sri Lanka', lr: 'Liberia', lt: 'Lituania', lv: 'Letonia',
    ly: 'Libia', ma: 'Marruecos', mg: 'Madagascar', ml: 'Malí', mm: 'Myanmar',
    mn: 'Mongolia', mt: 'Malta', mu: 'Mauricio', mw: 'Malaui', mx: 'México',
    my: 'Malasia', mz: 'Mozambique', na: 'Namibia', ne: 'Níger', ng: 'Nigeria',
    nl: 'Países Bajos', no: 'Noruega', np: 'Nepal', nz: 'Nueva Zelanda',
    om: 'Omán', pa: 'Panamá', pe: 'Perú', pg: 'Papúa Nueva Guinea', ph: 'Filipinas',
    pk: 'Pakistán', pl: 'Polonia', pt: 'Portugal', py: 'Paraguay', qa: 'Catar',
    ru: 'Rusia', rw: 'Ruanda', sa: 'Arabia Saudí', sd: 'Sudán', se: 'Suecia',
    sg: 'Singapur', si: 'Eslovenia', sl: 'Sierra Leona', sn: 'Senegal',
    so: 'Somalia', ss: 'Sudán del Sur', sy: 'Siria', td: 'Chad', th: 'Tailandia',
    tj: 'Tayikistán', tn: 'Túnez', tr: 'Turquía', tt: 'Trinidad y Tobago',
    tz: 'Tanzania', ua: 'Ucrania', ug: 'Uganda', us: 'Estados Unidos',
    uy: 'Uruguay', uz: 'Uzbekistán', ve: 'Venezuela', vn: 'Vietnam',
    ws: 'Samoa', ye: 'Yemen', za: 'Sudáfrica', zm: 'Zambia', zw: 'Zimbabue',
  };
  return names[code.toLowerCase()] || code.toUpperCase();
}

function buildEmailHtml(change: RiskChange, name: string): string {
  const countryName = getCountryName(change.code);
  const oldColor = RISK_COLORS[change.oldRisk] || '#64748b';
  const newColor = RISK_COLORS[change.newRisk] || '#64748b';
  const oldLabel = RISK_LABELS[change.oldRisk] || change.oldRisk;
  const newLabel = RISK_LABELS[change.newRisk] || change.newRisk;
  const isWorse = ['sin-riesgo', 'bajo', 'medio', 'alto', 'muy-alto'].indexOf(change.oldRisk) <
                  ['sin-riesgo', 'bajo', 'medio', 'alto', 'muy-alto'].indexOf(change.newRisk);
  const emoji = isWorse ? '🔴' : '🟢';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>:root{color-scheme:light;supported-color-schemes:light;}</style>
</head>
<body style="margin:0;padding:0;background:#f8fafc !important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a !important;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background:#0f172a;padding:24px;">
          <div style="font-size:12px;color:#60a5fa;font-weight:600;margin-bottom:4px;">Viaje con Inteligencia</div>
          <h1 style="color:#ffffff;font-size:22px;margin:8px 0 4px;">${emoji} Alerta de riesgo: ${countryName}</h1>
          <p style="color:#94a3b8;font-size:14px;margin:0;">Cambio detectado en el nivel de riesgo</p>
        </td></tr>
        <tr><td style="background:#ffffff;padding:24px;text-align:center;">
          <p style="font-size:14px;color:#334155;margin:0 0 16px;">Hola ${name},</p>
          <p style="font-size:14px;color:#334155;margin:0 0 20px;">El nivel de riesgo de <strong>${countryName}</strong> ha cambiado:</p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
            <tr>
              <td style="text-align:center;padding:12px 20px;background:#f1f5f9;border-radius:8px;">
                <div style="font-size:11px;color:#64748b;margin-bottom:4px;">Anterior</div>
                <div style="display:inline-block;width:12px;height:12px;background:${oldColor};border-radius:50%;vertical-align:middle;margin-right:6px;"></div>
                <span style="font-size:16px;font-weight:bold;color:#334155;">${oldLabel}</span>
              </td>
              <td style="padding:0 12px;font-size:20px;color:#94a3b8;">→</td>
              <td style="text-align:center;padding:12px 20px;background:${isWorse ? '#fef2f2' : '#f0fdf4'};border-radius:8px;border:1px solid ${isWorse ? '#fecaca' : '#bbf7d0'};">
                <div style="font-size:11px;color:#64748b;margin-bottom:4px;">Actual</div>
                <div style="display:inline-block;width:12px;height:12px;background:${newColor};border-radius:50%;vertical-align:middle;margin-right:6px;"></div>
                <span style="font-size:16px;font-weight:bold;color:${isWorse ? '#991b1b' : '#166534'};">${newLabel}</span>
              </td>
            </tr>
          </table>
          <a href="${BASE_URL}/pais/${change.code}" style="display:inline-block;background:#3b82f6;color:#fff;padding:14px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
            Ver detalles del país
          </a>
          <p style="font-size:11px;color:#94a3b8;margin-top:16px;">Configura tus alertas en el radar de viaje para gestionar notificaciones.</p>
        </td></tr>
        <tr><td style="background:#f1f5f9;padding:16px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#64748b;font-size:11px;margin:0;">
            Recibes esto porque tienes ${countryName} en tu radar de viaje.<br>
            <a href="${BASE_URL}/dashboard/radar" style="color:#3b82f6;text-decoration:underline;">Gestionar radar</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

interface NotifyResult {
  notified: number;
  errors: number;
  skipped_no_email: number;
}

export async function notifyRiskChanges(changes: RiskChange[]): Promise<NotifyResult> {
  if (!resend || !supabaseAdmin || changes.length === 0) {
    return { notified: 0, errors: 0, skipped_no_email: 0 };
  }

  let notified = 0;
  let errors = 0;
  let skipped = 0;

  for (const change of changes) {
    try {
      const { data: watchlistUsers } = await supabaseAdmin
        .from('user_watchlist')
        .select('user_id')
        .eq('country_code', change.code);

      if (!watchlistUsers || watchlistUsers.length === 0) continue;

      const userIds = watchlistUsers.map(w => w.user_id);

      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email, username')
        .in('id', userIds);

      if (!profiles) continue;

      for (const profile of profiles) {
        if (!profile.email) {
          skipped++;
          continue;
        }

        const name = profile.username || profile.email.split('@')[0] || 'Viajero';

        try {
          await resend.emails.send({
            from: 'Viaje con Inteligencia <alertas@viajeinteligencia.com>',
            to: profile.email,
            subject: `${RISK_LABELS[change.newRisk] || change.newRisk} — ${getCountryName(change.code)} ha cambiado de nivel de riesgo`,
            html: buildEmailHtml(change, name),
          });
          notified++;
        } catch {
          errors++;
        }
      }
    } catch (err) {
      log.error(`Error notifying for ${change.code}`, err);
      errors++;
    }
  }

  log.info(`Risk notifications: ${notified} sent, ${errors} errors, ${skipped} skipped (no email)`);
  return { notified, errors, skipped_no_email: skipped };
}
