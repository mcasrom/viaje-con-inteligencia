'use client';
import dynamic from 'next/dynamic';

const RutasClient = dynamic(() => import('./RutasClient'), {
  ssr: false,
});

export default function RutasPage() {
  return <RutasClient />;
}
