import { NextResponse } from 'next/server';
import { paisesData } from '@/data/paises';

const PACKING_LISTS: Record<string, { essential: string[]; clothing: string[]; toiletries?: string[]; electronics?: string[] }> = {
  general: {
    essential: [
      'Pasaporte (vigente 6 meses)',
      'Billetes de avión/reserva',
      'Tarjetas de crédito/débito',
      'Dinero en efectivo (moneda local + euros)',
      'Teléfono móvil + cargador',
      'Powerbank',
      'Adaptador de enchufes universal',
      'Póliza de seguro de viaje',
      'Medicamentos personales',
      'Gafas de sol',
      'Protector solar',
    ],
    clothing: [
      'Ropa interior (días + 1 extra)',
      'Calcetines',
      'Camisetas (algodón/secado rápido)',
      'Pantalones cortos/largos',
      'Chaqueta cortavientos',
      'Calzado cómodo',
      'Ropa de dormir',
      'Traje de baño (si aplica)',
    ],
    toiletries: [
      'Cepillo de dientes + pasta',
      'Desodorante',
      'Champú (formato viaje)',
      'Jabón corporal',
      'Toalla de microfibra',
      'Botiquín básico',
      'Repelente mosquitos',
    ],
    electronics: [
      'Auriculares',
      'Cámara de fotos',
      'Linterna',
      'Candado TSA',
    ],
  },
};

export async function POST(request: Request) {
  try {
    const { destination, days = 7, type = 'viaje' } = await request.json();

    if (!destination) {
      return NextResponse.json({ error: 'Destino requerido' }, { status: 400 });
    }

    const countryData = Object.values(paisesData).find(
      p => p.nombre.toLowerCase().includes(destination.toLowerCase()) ||
           p.codigo.toLowerCase() === destination.toLowerCase()
    );

    const packingList = PACKING_LISTS.general;

    let list = `# 🧳 Lista de Equipaje para ${destination}\n`;
    list += `## 📋 Esenciales (para todos los viajes)\n`;
    packingList.essential.forEach(item => list += `- ${item}\n`);

    list += `\n## 👕 Ropa\n`;
    packingList.clothing.forEach(item => list += `- ${item}\n`);

    list += `\n## 🧴 Aseo y Personal\n`;
    packingList.toiletries?.forEach(item => list += `- ${item}\n`);

    list += `\n## 🔌 Electrónica\n`;
    packingList.electronics?.forEach(item => list += `- ${item}\n`);

    if (countryData) {
      list += `\n## 🌡️ Específico para ${countryData.nombre}\n`;
      list += `- Idioma: ${countryData.idioma}\n`;
      list += `- Moneda: ${countryData.moneda}\n`;
      list += `- Voltaje: ${countryData.voltaje}\n`;
      list += `- Conducción: ${countryData.conduccion === 'derecha' ? 'Derecha 🚗' : 'Izquierda 🚙'}\n`;
      
      if (countryData.requerimientos) {
        list += `\n### 📄 Requisitos de entrada\n`;
        countryData.requerimientos.forEach(req => {
          list += `**${req.icon} ${req.categoria}:**\n`;
          req.items.forEach(item => list += `- ${item}\n`);
        });
      }
    }

    const tips = [
      `📌 Peso recomendado: max ${Math.round(days * 1.5)}kg`,
      '📌 Usa bolsas de compresión para ropa',
      '📌 Lleva copia digital de documentos',
      '📌 No olvides el adaptador de enchufes',
    ];
    list += `\n## 💡 Consejos\n${tips.join('\n')}`;

    return NextResponse.json({ list, destination, days, type });
  } catch (error) {
    return NextResponse.json({ error: 'Error al generar lista' }, { status: 500 });
  }
}