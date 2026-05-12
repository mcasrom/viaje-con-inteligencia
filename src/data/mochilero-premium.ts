/**
 * Viaje con Inteligencia - Opciones Premium Mochileros
 * 
 * Pack especiales para viajeros que deciden rápido y se van
 */

export const MOCHILERO_BUNDLE = {
  name: 'Mochilero Pro',
  price: 9.99,
  intervalo: 'mes',
  features: [
    {
      name: '🎒 AI Trip Planner Express',
      description: 'Genera itinerario en 30 segundos',
      included: true
    },
    {
      name: '📱 Alertas flash',
      description: 'Notificaciones instantáneas de riesgos',
      included: true
    },
    {
      name: '💰 Calculadora de presupuesto',
      description: 'Presupuesto diario por destino',
      included: true
    },
    {
      name: '🗺️ Offline Maps Premium',
      description: 'Mapas sin conexión ilimitados',
      included: true
    },
    {
      name: '📲 Acceso bot prioritaria',
      description: 'Respuestas en <5 segundos',
      included: true
    },
    {
      name: '🎫 Descuentos exclusiva',
      description: '10% hostales parceiros',
      included: true
    }
  ]
};

export const ONE_TIME_BUNDLES = {
  trip_emergency: {
    name: 'Pack Emergencia Viaje',
    price: 4.99,
    tipo: 'one-time',
    features: [
      '📋 Checklist completo descargable',
      '🛡️ Guía de seguridad PDF',
      '📱 1 mes alerts gratis',
      '🏥 Teléfono emergencias local',
      '🔔 Alerta automática riesgo'
    ]
  },
  quick_departure: {
    name: 'Salida Express',
    price: 2.99,
    tipo: 'one-time',
    features: [
      '📄 Visa guide instantáneo',
      '✈️ Info vuelo optimización',
      '💼 Checklist 24h',
      '🗺️ Mapa offline destino',
      '⚡ Acceso IA 48h'
    ]
  }
};

export const VIP_ACCESS = {
  name: 'Mochilero VIP',
  precio: 19.99,
  vitalicio: true,
  features: [
    {
      name: '🎒 Todo Mochilero Pro',
      included: true
    },
    {
      name: '🏆 Actualizaciones vitalicias',
      included: true
    },
    {
      name: '💳 Descuento 20% tours',
      included: true
    },
    {
      name: '🔓 Beta features',
      included: true
    },
    {
      name: '📱 Soporte priority',
      included: true
    }
  ]
};
