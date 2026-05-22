import type { Metadata } from 'next';
import AiAssistantClient from './AiAssistantClient';

export const metadata: Metadata = {
  title: 'Asistente IA | Admin - Viaje con Inteligencia',
  robots: { index: false, follow: false },
};

export default function AiAssistantPage() {
  return <AiAssistantClient />;
}
