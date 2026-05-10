import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/groq-ai';
import { checkPremium } from '@/lib/premium-check';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { checkIpRateLimit, checkBurstRateLimit } from '@/lib/rate-limit-server';

const PREMIUM_MODEL = 'llama-3.3-70b-versatile';
const FREE_MODEL = 'llama-3.1-8b-instant';
const FREE_DAILY_LIMIT = 5;

async function getDailyUsage(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabaseAdmin
    .from('chat_usage')
    .select('free_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  return data?.free_count || 0;
}

async function incrementDailyUsage(userId: string, model: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const field = model === PREMIUM_MODEL ? 'premium_count' : 'free_count';

  const { data } = await supabaseAdmin
    .from('chat_usage')
    .select('free_count, premium_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  const currentFree = data?.free_count || 0;
  const currentPremium = data?.premium_count || 0;

  await supabaseAdmin.from('chat_usage').upsert({
    user_id: userId,
    date: today,
    free_count: field === 'free_count' ? currentFree + 1 : currentFree,
    premium_count: field === 'premium_count' ? currentPremium + 1 : currentPremium,
  }, { onConflict: 'user_id,date' });
}

async function saveConversation(conversationId: number | null, userId: string, role: string, content: string, model: string): Promise<number> {
  let convId = conversationId;

  if (!convId) {
    const { data: conv } = await supabaseAdmin.from('chat_conversations').insert({
      user_id: userId,
      model,
      title: content.substring(0, 80),
    }).select('id').single();

    convId = conv?.id;
    if (!convId) throw new Error('Failed to create conversation');
  }

  await supabaseAdmin.from('chat_messages').insert({
    conversation_id: convId,
    role,
    content,
    model: role === 'assistant' ? model : null,
  });

  await supabaseAdmin.from('chat_conversations').update({
    message_count: supabaseAdmin.rpc('increment', { x: 1 }) as any,
    updated_at: new Date().toISOString(),
  }).eq('id', convId);

  return convId;
}

async function getConversationHistory(conversationId: number): Promise<{ role: string; content: string }[]> {
  const { data } = await supabaseAdmin
    .from('chat_messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  return data || [];
}

async function getUserContext(userId: string): Promise<string[]> {
  const contexts: string[] = [];

  const { data: favorites } = await supabaseAdmin
    .from('favorites')
    .select('country_code')
    .eq('user_id', userId);

  if (favorites && favorites.length > 0) {
    contexts.push(`El usuario tiene ${favorites.length} paises favoritos: ${favorites.map(f => f.country_code.toUpperCase()).join(', ')}`);
  }

  const { data: trips } = await supabaseAdmin
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .limit(3);

  if (trips && trips.length > 0) {
    contexts.push(`Viajes guardados: ${trips.map((t: any) => t.destination || t.country || 'destino desconocido').join(', ')}`);
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_premium, subscription_status')
    .eq('id', userId)
    .single();

  if (profile?.is_premium || profile?.subscription_status === 'active') {
    contexts.push('Usuario Premium - tiene acceso a modelo 70b y todas las funciones');
  }

  return contexts;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '127.0.0.1';

    const ipLimit = checkIpRateLimit(ip);
    if (!ipLimit.allowed) {
      return NextResponse.json({
        error: 'Rate limit exceeded',
        message: 'Demasiadas solicitudes desde esta IP. Intenta de nuevo en un minuto.',
        retryAfter: Math.ceil((ipLimit.resetAt - Date.now()) / 1000),
      }, { status: 429, headers: { 'Retry-After': String(Math.ceil((ipLimit.resetAt - Date.now()) / 1000)) } });
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    const burstKey = userId || ip;
    const burstLimit = checkBurstRateLimit(burstKey);
    if (!burstLimit.allowed) {
      return NextResponse.json({
        error: 'Too fast',
        message: 'Estás enviando mensajes demasiado rápido. Espera unos segundos.',
        retryAfter: Math.ceil((burstLimit.resetAt - Date.now()) / 1000),
      }, { status: 429, headers: { 'Retry-After': String(Math.ceil((burstLimit.resetAt - Date.now()) / 1000)) } });
    }

    const { message, country, conversationId, model } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const trimmed = message.trim().slice(0, 4000);
    const sanitized = trimmed
      .replace(/<[^>]*>/g, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

    const requestedModel = model || FREE_MODEL;
    const isPremiumModel = requestedModel === PREMIUM_MODEL;

    if (isPremiumModel) {
      const check = await checkPremium();
      if (!check.isPremium) {
        return NextResponse.json({
          error: 'Premium required',
          requires: 'premium',
          message: 'El modelo 70b requiere suscripcion Premium. Actualiza tu plan para desbloquearlo.',
        }, { status: 403 });
      }
    }

    // Server-side daily rate limit for free users
    if (!isPremiumModel && userId) {
      const used = await getDailyUsage(userId);
      if (used >= FREE_DAILY_LIMIT) {
        return NextResponse.json({
          error: 'Daily limit exceeded',
          message: `Has alcanzado el limite de ${FREE_DAILY_LIMIT} mensajes gratis hoy. Actualiza a Premium para chat ilimitado.`,
        }, { status: 429 });
      }
    }

    let history: { role: string; content: string }[] = [];

    // Load existing conversation history
    if (conversationId) {
      history = await getConversationHistory(conversationId);
    }

    // Build personalized context for the system
    let systemContext = '';
    if (userId) {
      const contexts = await getUserContext(userId);
      if (contexts.length > 0) {
        systemContext = `\n\nContexto del usuario:\n${contexts.join('\n')}`;
      }
    }

    const fullMessage = systemContext ? `${sanitized}\n\n[Contexto del usuario: ${systemContext}]` : sanitized;

    const response = await chatWithAI(fullMessage, {
      country,
      previousMessages: history.map(m => m.content).slice(-10),
      model: requestedModel,
    });

    let newConversationId = conversationId;

    // Save to Supabase if user is authenticated
    if (userId) {
      newConversationId = await saveConversation(conversationId, userId, 'user', sanitized, requestedModel);
      await saveConversation(newConversationId, userId, 'assistant', response, requestedModel);

      if (!isPremiumModel) {
        await incrementDailyUsage(userId, requestedModel);
      }
    }

    return NextResponse.json({
      response,
      model: requestedModel,
      conversationId: newConversationId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat AI error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// GET /api/ai/chat?conversations=true → list user conversations
// GET /api/ai/chat?conversationId=123 → get conversation messages
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ conversations: [] });
    }

    const { searchParams } = new URL(request.url);
    const getConversations = searchParams.get('conversations') === 'true';
    const getConversationId = searchParams.get('conversationId');

    if (getConversationId) {
      const { data: messages } = await supabaseAdmin
        .from('chat_messages')
        .select('role, content, created_at')
        .eq('conversation_id', parseInt(getConversationId))
        .order('created_at', { ascending: true });

      return NextResponse.json({ messages: messages || [] });
    }

    if (getConversations) {
      const { data: conversations } = await supabaseAdmin
        .from('chat_conversations')
        .select('id, title, model, message_count, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(30);

      return NextResponse.json({ conversations: conversations || [] });
    }

    return NextResponse.json({ conversations: [] });
  } catch (err: any) {
    console.error('Chat GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
