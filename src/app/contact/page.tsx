import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contacto | Viaje con Inteligencia',
  description: 'Contacta con nosotros. Sugerencias, consultas o colaboraciones sobre Viaje con Inteligencia.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/contact',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
