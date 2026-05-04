import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Tag, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostBySlug, getPostSlugs, getRelatedPosts } from '@/lib/posts';
import ShareButtons from '@/components/ShareButtons';
import BlogPostPage from './page.client';

export const revalidate = 3600; // ISR cada hora

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return { title: 'Post no encontrado' };
  }

  const keywordsMeta = Array.isArray(post.keywords) 
    ? post.keywords.join(', ') 
    : post.keywords || '';

  return {
    title: `${post.title} | Viaje con Inteligencia`,
    description: post.excerpt,
    keywords: keywordsMeta,
    alternates: {
      canonical: `https://www.viajeinteligencia.com/blog/${slug}`,
    },
    other: {
      'article:published_time': post.date,
      'article:author': post.author,
    },
  };
}

function generateSchema(post: any) {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.image || 'https://www.viajeinteligencia.com/blog-header.jpg',
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Viaje con Inteligencia',
      logo: { '@type': 'ImageObject', url: 'https://www.viajeinteligencia.com/logo.png' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.viajeinteligencia.com/blog/${post.slug}`,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.viajeinteligencia.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.viajeinteligencia.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://www.viajeinteligencia.com/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

export default async function ArticuloPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Post no encontrado</h1>
          <Link href="/blog" className="text-blue-400 hover:text-blue-300">
            ← Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {generateSchema(post)}
      <BlogPostPage post={post as any} />
    </>
  );
}