CREATE TABLE IF NOT EXISTS api_plan_requests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  plan_tier TEXT NOT NULL CHECK (plan_tier IN ('free', 'starter', 'pro', 'enterprise')),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_plan_requests_status ON api_plan_requests(status);
CREATE INDEX IF NOT EXISTS idx_api_plan_requests_created_at ON api_plan_requests(created_at DESC);
