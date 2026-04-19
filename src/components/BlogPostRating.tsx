'use client';

import { useParams } from 'next/navigation';
import PostRating from '@/components/PostRating';

export default function BlogPostRating() {
  const params = useParams();
  const slug = params.slug as string;
  
  return <PostRating slug={slug} />;
}