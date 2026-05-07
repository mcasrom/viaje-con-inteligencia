import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

interface PageProps {
  params: Promise<{ codigo: string }>;
}

export async function generateStaticParams() {
  return [];
}

export default async function ViajeCosteRedirect({ params }: PageProps) {
  const { codigo } = await params;
  redirect(`/coste/${codigo}`);
}
