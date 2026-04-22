-- Tabla de predicciones IST (ejecutar en Supabase SQL Editor)
-- Sistema de auditoría IST vs realidad

-- Predicciones guardadas
CREATE TABLE IF NOT EXISTS public.ist_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL,
  country_name TEXT,
  travel_date DATE NOT NULL,
  ist_score INTEGER NOT NULL,
  recommendation TEXT,
  events_count INTEGER DEFAULT 0,
  user_email TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback del usuario después del viaje
CREATE TABLE IF NOT EXISTS public.ist_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_id UUID REFERENCES public.ist_predictions(id) ON DELETE CASCADE,
  user_email TEXT,
  session_id TEXT,
  
  -- Valoración real del usuario (1-5)
  real_saturation_rating INTEGER CHECK (real_saturation_rating BETWEEN 1 AND 5),
  
  -- Comparación con predicción
  was_accurate BOOLEAN,
  expected_vs_real TEXT,
  
  -- Detalles del viaje real
  actual_crowding TEXT,
  actual_prices TEXT,
  actual_events TEXT,
  
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ist_predictions_country ON public.ist_predictions(country_code);
CREATE INDEX idx_ist_predictions_date ON public.ist_predictions(travel_date);
CREATE INDEX idx_ist_predictions_created ON public.ist_predictions(created_at);
CREATE INDEX idx_ist_feedback_prediction ON public.ist_feedback(prediction_id);

-- Verificar
SELECT 'ist_predictions' as table_name, COUNT(*) as rows FROM ist_predictions
UNION ALL
SELECT 'ist_feedback' as table_name, COUNT(*) as rows FROM ist_feedback;