import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || 'viajero';

  const checklistItems = [
    { category: 'DOCUMENTOS', icon: '📄', items: [
      '□ Pasaporte vigente (mínimo 6 meses)',
      '□ Billetes de avión (confirmación)',
      '□ Reserva de hotel',
      '□ Póliza de seguro de viaje',
      '□ Autorización menores (si aplica)',
      '□ Visa/entrada (si aplica)',
      '□ Carnet de conducir internacional',
      '□ Fotos carnet recientes',
    ]},
    { category: 'SALUD', icon: '❤️', items: [
      '□ Vacunas actualizadas',
      '□ Receta médicos habituales',
      '□ Seguro médico internacional',
      '□ Tarjeta sanitaria europea (EHIC)',
      '□ Botiquín básico',
      '□ Contacto emergencia',
      '□ Medicamentos con receta',
    ]},
    { category: 'FINANZAS', icon: '💰', items: [
      '□ Tarjetas de crédito/débito',
      '□ Efectivo divisa local',
      '□ App banca móvil',
      '□ Teléfono banco (roaming)',
      '□ Documentos seguro',
      '□ Aumentar límites',
    ]},
    { category: 'TECNOLOGÍA', icon: '📱', items: [
      '□ Cargador universal',
      '□ Power bank',
      '□ eSIM/roaming activado',
      '□ Apps offline maps',
      '□ VPN configurada',
      '□ Backup cloud fotos',
    ]},
    { category: 'SEGURIDAD', icon: '🛡️', items: [
      '□ Copias digitales documentos',
      '□ Email consulado',
      '□ Registro viajes MAEC',
      '□ Notificar familia/amigos',
      '□ Seguro cancelación',
      '□ Contactos emergencia',
    ]},
    { category: 'ÚLTIMO MINUTO', icon: '⏰', items: [
      '□ Check-in online',
      '□ Equipaje listo',
      '□ Clima destino',
      '□ Adaptador corriente',
      '□ Frases básicas local',
      '□ App traductor',
    ]},
  ];

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Checklist Premium - Viaje con Inteligencia</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 48px; max-width: 900px; margin: 0 auto; background: #fff; color: #1e293b; }
    
    .header { text-align: center; border-bottom: 3px solid #f59e0b; padding-bottom: 24px; margin-bottom: 32px; }
    .header h1 { font-size: 28px; color: #1e3a5f; margin-bottom: 4px; }
    .header .subtitle { color: #64748b; font-size: 14px; }
    .header .meta { margin-top: 12px; font-size: 13px; color: #94a3b8; }
    .header .meta span { margin: 0 12px; }

    .section { margin-bottom: 28px; page-break-inside: avoid; }
    .section h2 { font-size: 18px; color: #1e3a5f; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; }
    .section ul { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; }
    .section li { padding: 6px 0; font-size: 14px; color: #334155; display: flex; align-items: center; gap: 8px; }
    .section li::before { content: '☐'; font-size: 18px; color: #64748b; }

    .footer { margin-top: 40px; padding-top: 24px; border-top: 2px solid #f59e0b; text-align: center; }
    .footer .brand { font-size: 14px; color: #1e3a5f; font-weight: bold; }
    .footer .tagline { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .footer .links { font-size: 12px; color: #3b82f6; margin-top: 8px; }
    .footer .links a { color: #3b82f6; text-decoration: underline; }

    @media print {
      body { padding: 20px; }
      .section ul { grid-template-columns: 1fr; }
      .no-print { display: none; }
    }

    @media (max-width: 600px) {
      body { padding: 24px; }
      .section ul { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✈️ Checklist Premium de Viaje</h1>
    <p class="subtitle">80+ items esenciales para viajar seguro</p>
    <div class="meta">
      <span>Para: <strong>${name}</strong></span>
      <span>${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
    </div>
  </div>

  ${checklistItems.map(section => `
  <div class="section">
    <h2>${section.icon} ${section.category}</h2>
    <ul>
      ${section.items.map(item => `<li>${item.replace('□ ', '')}</li>`).join('')}
    </ul>
  </div>
  `).join('')}

  <div class="footer">
    <p class="brand">Viaje con Inteligencia</p>
    <p class="tagline">Tu radar de seguridad global impulsado por IA</p>
    <p class="links">
      <a href="https://www.viajeinteligencia.com">viajeinteligencia.com</a>
    </p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="checklist-viaje-${name.replace(/\s+/g, '-').toLowerCase()}.html"`,
    },
  });
}
