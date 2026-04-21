import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = getCategories();
  return NextResponse.json({ categories });
}