import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || 'viajero';

  const checklistItems = [
    { category: 'DOCUMENTOS', items: [
      '□ Pasaporte vigente (mínimo 6 meses)',
      '□ Billetes de avión (confirmación)',
      '□ Reserva de hotel',
      '□ Póliza de seguro de viaje',
      '□ Autorización menores (si aplica)',
      '□ Visa/entrada (si aplica)',
      '□ Carnet de conducir internacional',
      '□ Fotos carnet recientes',
    ]},
    { category: 'SALUD', items: [
      '□ Vacunas actualizadas',
      '□ Receta médicos habituales',
      '□ Seguro médico internacional',
      '□ Tarjeta sanitaria europea (EHIC)',
      '□ Botiquín básico',
      '□ Contacto emergencia',
      '□ Medications con receta',
    ]},
    { category: ' FINANZAS', items: [
      '□ Tarjetas de crédito/débito',
      '□ Efectivo divisa local',
      '□ App banca móvil',
      '□ Teléfono banco (roaming)',
      '□ Documentos seguro',
      '□ Aumentar límites',
    ]},
    { category: 'TECNOLOGÍA', items: [
      '□ Cargador universal',
      '□ Power bank',
      '□ eSIM/ roaming activado',
      '□ Apps offline maps',
      '□ VPN configurada',
      '□ Backup cloud fotos',
    ]},
    { category: 'SEGURIDAD', items: [
      '□ Copias digitales documentos',
      '□ Email consulate',
      '□ Registro viajes MAEC',
      '□ Notificar familia/amigos',
      '□ Seguro cancelación',
      '□ Emergency contacts',
    ]},
    { category: ' ÚLTIMO MINUTO', items: [
      '□ Check-in online',
      '□ Equipaje facturado',
      '□ Clima destino',
      '□ Adaptador corriente',
      '□ Idioma básico local',
      '□ Traductor app',
    ]},
  ];

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Checklist Premium - Viaje con Inteligencia</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #1e40af; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    ul { list-style: none; padding: 0; }
    li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .checkbox { display: inline-block; width: 15px; height: 15px; border: 2px solid #374151; margin-right: 10px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #f59e0b; font-size: 12px; color: #6b7280; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>✈️ Checklist Premium de Viaje</h1>
  <p><strong>Para:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
  
  ${checklistItems.map(section => `
  <h2>${section.category}</h2>
  <ul>
    ${section.items.map(item => `<li><span class="checkbox"></span>${item}</li>`).join('')}
  </ul>
  `).join('')}

  <div class="footer">
    <p><strong>Viaje con Inteligencia</strong> - vía ${new Date().getFullYear()}</p>
    <p>Más información: viaje-con-inteligencia.vercel.app</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="checklist-viaje-${name.replace(/\s+/g, '-')}.html"`,
    },
  });
}