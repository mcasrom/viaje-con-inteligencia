import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  try {
    const body = await request.json();

    if (action === 'feedback') {
      const { 
        prediction_id,
        real_saturation_rating,
        expected_vs_real,
        actual_crowding,
        actual_prices,
        actual_events,
        comments,
        user_email 
      } = body;

      if (!prediction_id || !real_saturation_rating) {
        return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
      }

      const { data: prediction } = await supabase
        .from('ist_predictions')
        .select('ist_score')
        .eq('id', prediction_id)
        .single();

      const predictedScore = prediction?.ist_score || 0;
      const wasAccurate = Math.abs(predictedScore - real_saturation_rating * 20) <= 20;

      const { data, error } = await supabase
        .from('ist_feedback')
        .insert({
          prediction_id,
          user_email,
          real_saturation_rating,
          was_accurate: wasAccurate,
          expected_vs_real,
          actual_crowding,
          actual_prices,
          actual_events,
          comments,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        feedback: data,
        accuracy: {
          predicted: predictedScore,
          actual: real_saturation_rating * 20,
          wasAccurate,
        },
      });
    }

    if (action === 'list') {
      const { data, error } = await supabase
        .from('ist_predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const predictionsWithFeedback = await Promise.all(
        (data || []).map(async (pred) => {
          if (!supabase) return { ...pred, feedback: null };
          const { data: feedback } = await supabase
            .from('ist_feedback')
            .select('*')
            .eq('prediction_id', pred.id)
            .single();
          return { ...pred, feedback };
        })
      );

      return NextResponse.json({ predictions: predictionsWithFeedback });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('IST Feedback error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  try {
    const { data: predictions } = await supabase
      .from('ist_predictions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    const { data: feedbacks } = await supabase
      .from('ist_feedback')
      .select('*');

    const accuracyStats = feedbacks?.length 
      ? {
          total: feedbacks.length,
          accurate: feedbacks.filter(f => f.was_accurate).length,
          avgRating: (feedbacks.reduce((sum, f) => sum + f.real_saturation_rating, 0) / feedbacks.length).toFixed(1),
        }
      : null;

    return NextResponse.json({
      predictions: predictions || [],
      stats: accuracyStats,
    });
  } catch (error) {
    console.error('IST Stats error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}