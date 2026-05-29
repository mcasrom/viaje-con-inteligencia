import { redirect } from 'next/navigation';

export default function EnCatchAll({ params }: { params: { slug: string[] } }) {
  const slug = params.slug?.join('/') || '';
  redirect(`/${slug}`);
}
