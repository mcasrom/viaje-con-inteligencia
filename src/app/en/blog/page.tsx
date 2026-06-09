import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Viaje con Inteligencia',
  description: 'Latest travel risk intelligence articles and OSINT analysis.',
  robots: { index: false, follow: false },
};

export default function EnBlogPage() {
  redirect('/blog');
}
