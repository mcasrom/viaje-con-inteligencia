import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MAX_SIZE = 800;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se ha enviado ninguna imagen' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Solo se permiten imágenes JPG, PNG o WebP' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'La imagen no puede superar los 5MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const metadata = await sharp(buffer).metadata();
    const { width = 0, height = 0 } = metadata;

    let processed = sharp(buffer);

    if (width > MAX_SIZE || height > MAX_SIZE) {
      processed = processed.resize(MAX_SIZE, MAX_SIZE, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const optimizedBuffer = await processed
      .webp({ quality: 80, effort: 6 })
      .toBuffer();

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.webp`;

    const { data, error } = await supabase.storage
      .from('review-images')
      .upload(`reviews/${fileName}`, optimizedBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('review-images')
      .getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      imageUrl: urlData.publicUrl,
      fileName,
      size: optimizedBuffer.length,
    });
  } catch (error) {
    console.error('Review image upload error:', error);
    return NextResponse.json(
      { error: 'Error al subir la imagen' },
      { status: 500 }
    );
  }
}
