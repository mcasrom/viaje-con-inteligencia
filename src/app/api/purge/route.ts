import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    revalidatePath('/');
    revalidatePath('/pais/[codigo]');
    revalidatePath('/blog');
    revalidatePath('/dashboard');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache purged successfully',
      revalidated: ['/', '/pais/[codigo]', '/blog', '/dashboard']
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}