import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/posts';
import BlogPostPage from './page.client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllPosts().map((post) => ({ slug: post.slug }));
  return slugs;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post no encontrado',
    };
  }

  const keywords = Array.isArray(post.keywords)
    ? post.keywords
    : typeof post.keywords === 'string'
    ? post.keywords.split(',').map(k => k.trim())
    : [];

  return {
    title: `${post.title} | Blog - Viaje con Inteligencia`,
    description: post.excerpt || post.description || `Análisis y guía completa sobre ${post.title}`,
    keywords: [...keywords, 'blog viajes', 'OSINT', 'seguridad viajeros'],
    authors: [{ name: post.author }],
    alternates: {
      canonical: `https://www.viajeinteligencia.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.description || '',
      url: `https://www.viajeinteligencia.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      ...(post.image ? { images: [{ url: post.image, width: 800, height: 600 }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.description || '',
      creator: '@ViajeIntel2026',
      ...(post.image ? { images: [post.image] } : {}),
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.description || '',
    author: { '@type': 'Person', name: post.author },
    datePublished: post.date,
    dateModified: post.date,
    ...(post.image ? { image: post.image } : {}),
    publisher: {
      '@type': 'Organization',
      name: 'Viaje con Inteligencia',
      logo: { '@type': 'ImageObject', url: 'https://www.viajeinteligencia.com/logo.png' },
    },
    mainEntityOfPage: `https://www.viajeinteligencia.com/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <BlogPostPage post={post} />
    </>
  );
}
