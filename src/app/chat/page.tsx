import type { Metadata } from 'next';
import ChatClient from './ChatClient';

export const metadata: Metadata = {
  title: 'Chat IA de Viajes | Asistente Inteligente para Viajeros',
  description: 'Pregunta sobre cualquier destino, visado, seguridad o ruta. Respuestas al instante con IA. Planifica tu viaje con inteligencia artificial.',
  keywords: 'chat ia viajes, asistente viajes, planificador viajes ia, consejos seguridad viaje, visados, recomendaciones destinos',
  openGraph: {
    title: 'Chat IA de Viajes | Asistente Inteligente',
    description: 'Pregunta sobre cualquier destino, visado, seguridad o ruta. Respuestas al instante con IA.',
    url: 'https://www.viajeinteligencia.com/chat',
    type: 'website',
  },
};

export default function ChatPage() {
  return <ChatClient />;
}
