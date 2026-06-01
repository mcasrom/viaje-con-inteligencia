import { redirect } from 'next/navigation';

export default function ViajeCosteRedirect({ params }: { params: { codigo: string } }) {
  redirect(`/coste/${params.codigo}`);
}
