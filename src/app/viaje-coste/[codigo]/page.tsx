import { redirect } from 'next/navigation';

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
