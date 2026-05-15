import sharp from 'sharp';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { collectInfografiaData } from './data';
import { generateInfografiaSVG } from './template';

const BUCKET = 'infografias';
const MAX_SIZE_BYTES = 400 * 1024; // ~400KB

export type GenResult = {
  success: boolean;
  id?: string;
  error?: string;
  imageUrl?: string;
  sizeBytes?: number;
};

function getQualityForTarget(size: number): number {
  if (size <= MAX_SIZE_BYTES) return 75;
  if (size <= MAX_SIZE_BYTES * 1.5) return 60;
  return 45;
}

async function truncateSVGLabels(svg: string): Promise<string> {
  return svg.replace(
    /<text[^>]*class="country-name"[^>]*>([^<]{35,})<\/text>/g,
    (match, text: string) => {
      const truncated = text.substring(0, 32) + '..';
      return match.replace(text, truncated);
    },
  );
}

export async function generateInfografia(edition?: number): Promise<GenResult> {
  try {
    const data = await collectInfografiaData(edition);

    let svg = generateInfografiaSVG(data);
    svg = await truncateSVGLabels(svg);

    const svgBuffer = Buffer.from(svg);

    let quality = 75;
    let webpBuffer = await sharp(svgBuffer, { density: 144 })
      .resize(1200, 1800, { fit: 'fill' })
      .webp({ quality, effort: 6, alphaQuality: 80 })
      .toBuffer();

    let attempts = 0;
    while (webpBuffer.length > MAX_SIZE_BYTES && quality > 20 && attempts < 5) {
      quality = getQualityForTarget(webpBuffer.length);
      webpBuffer = await sharp(svgBuffer, { density: 144 })
        .resize(1200, 1800, { fit: 'fill' })
        .webp({ quality, effort: 6, alphaQuality: 80 })
        .toBuffer();
      attempts++;
    }

    // If still too large, reduce resolution
    if (webpBuffer.length > MAX_SIZE_BYTES) {
      const scale = Math.sqrt(MAX_SIZE_BYTES / webpBuffer.length) * 0.95;
      const w = Math.round(1200 * scale);
      const h = Math.round(1800 * scale);
      webpBuffer = await sharp(svgBuffer, { density: 120 })
        .resize(w, h, { fit: 'fill' })
        .webp({ quality: 50, effort: 6 })
        .toBuffer();
    }

    const actualSize = webpBuffer.length;

    if (!isSupabaseAdminConfigured()) {
      return { success: false, error: 'Supabase admin not configured' };
    }

    const fileName = `infografia-${data.weekStart}.webp`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fileName, webpBuffer, {
        contentType: 'image/webp',
        upsert: true,
        cacheControl: '31536000',
      });

    if (uploadError) {
      return { success: false, error: `Storage upload failed: ${uploadError.message}` };
    }

    const { data: urlData } = await supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(fileName);

    const imageUrl = urlData?.publicUrl || '';

    const record = {
      week_start: data.weekStart,
      week_end: data.weekEnd,
      edition: data.edition,
      title: data.title,
      subtitle: data.subtitle,
      image_url: imageUrl,
      image_width: 1200,
      image_height: Math.round(1800 * (actualSize > MAX_SIZE_BYTES ? Math.sqrt(MAX_SIZE_BYTES / actualSize) * 0.95 : 1)),
      image_size_bytes: actualSize,
      data_snapshot: data,
      gwi_score: data.gwi.total,
      gwi_trend: data.gwiTrend,
      country_count: data.stats.totalPaises,
      top_risk_countries: data.topRiskCountries.map(c => c.name),
      risk_distribution: data.riskDistribution as any,
      is_published: true,
      published_at: new Date().toISOString(),
      source: 'system',
    };

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('infografias')
      .upsert(record, { onConflict: 'week_start', ignoreDuplicates: false })
      .select('id')
      .single();

    if (insertError) {
      return { success: false, error: `DB insert failed: ${insertError.message}` };
    }

    // Rotation: keep max 8 published infografias, unpublish older ones
    try {
      const { data: allPublished } = await supabaseAdmin
        .from('infografias')
        .select('id, week_start')
        .eq('is_published', true)
        .order('week_start', { ascending: false });
      if (allPublished && allPublished.length > 8) {
        const toUnpublish = allPublished.slice(8).map(r => r.id);
        await supabaseAdmin
          .from('infografias')
          .update({ is_published: false })
          .in('id', toUnpublish);
      }
    } catch {}

    return {
      success: true,
      id: insertData?.id,
      imageUrl,
      sizeBytes: actualSize,
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getLatestInfografia() {
  if (!isSupabaseAdminConfigured()) return null;
  const { data } = await supabaseAdmin
    .from('infografias')
    .select('*')
    .eq('is_published', true)
    .order('week_start', { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function getInfografiaById(id: string) {
  if (!isSupabaseAdminConfigured()) return null;
  const { data } = await supabaseAdmin
    .from('infografias')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

export async function listInfografias(page = 1, perPage = 12) {
  if (!isSupabaseAdminConfigured()) return { data: [], total: 0, page, perPage };
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const { data, count } = await supabaseAdmin
    .from('infografias')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('week_start', { ascending: false })
    .range(from, to);
  return { data: data || [], total: count || 0, page, perPage };
}

export async function generatePremiumInfografia(id: string): Promise<GenResult> {
  try {
    const infografia = await getInfografiaById(id);
    if (!infografia) return { success: false, error: 'Infografía not found' };

    const data = infografia.data_snapshot as any;
    if (!data) return { success: false, error: 'No data snapshot' };

    const { generatePdfBuffer } = await import('./premium-pdf');
    const pdfBuffer = await generatePdfBuffer(infografia);

    const pdfFileName = `infografia-${infografia.week_start}-premium.pdf`;
    const { error: pdfUploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(pdfFileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
        cacheControl: '31536000',
      });

    if (pdfUploadError) {
      return { success: false, error: `PDF upload failed: ${pdfUploadError.message}` };
    }

    const { data: pdfUrlData } = await supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(pdfFileName);

    // Generate AI analysis
    let aiAnalysis = '';
    try {
      const Groq = (await import('groq-sdk')).default;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Eres un analista de inteligencia de viajes. Genera un análisis breve y preciso de la semana en riesgos globales basado en los datos proporcionados. Máximo 150 palabras.' },
          { role: 'user', content: `GWI: ${data.gwi?.total}, Países alto riesgo: ${data.stats?.altoOMuyAlto}, Incidentes: ${data.incidentsThisWeek}, Cambios: ${JSON.stringify(data.countriesChanged)}. Genera un análisis semanal.` },
        ],
        max_tokens: 300,
      });
      aiAnalysis = completion.choices?.[0]?.message?.content || '';
    } catch {
      aiAnalysis = 'Análisis premium no disponible en este momento.';
    }

    await supabaseAdmin
      .from('infografias')
      .update({
        pdf_url: pdfUrlData?.publicUrl || '',
        ai_analysis: aiAnalysis,
        premium_data: { ...(infografia.premium_data as any || {}), pdf_generated_at: new Date().toISOString(), ai_generated_at: new Date().toISOString() },
      })
      .eq('id', id);

    return { success: true, imageUrl: pdfUrlData?.publicUrl, sizeBytes: pdfBuffer.length };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
