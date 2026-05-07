# AGENTS.md — Viaje con Inteligencia

## PAUSED STATE (07 May 2026 — Resumed 07 May)
- **Master cron v2** (58bf127): Deployed. MAEC timeout fix (26 countries only), OSINT insert retry one-by-one on conflict. Newsletter weekly digest with Groq-generated content + HTML template. **Tested**: 150s (MAEC was 120s timeout, now ~26 countries). Expected: <60s after deploy.
- **OSINT /admin/osint/**: 13 stale entries. Will populate after cron runs successfully (insert retry added).
- **Newsletter**: Weekly digest implemented (Groq content generation + HTML template). Runs Mondays only via master cron. Not yet tested live (no Monday run yet).
- **All API keys** saved in `.env.local`: Supabase, Stripe, Telegram, Resend, Groq, CRON_SECRET, Mastodon, Admin. No need to search again.

## Project
- **Framework**: Next.js 16 + App Router, TypeScript
- **Deploy**: Vercel (auto-deploy on `main` push)
- **UI**: Tailwind CSS, lucide-react, react-markdown
- **AI**: Groq API (`llama-3.1-8b-instant` free, `llama-3.3-70b-versatile` premium)
- **Auth/DB**: Supabase (users, trips, favorites)
- **Payments**: Stripe (not fully integrated yet)
- **Email**: Resend
- **Bot**: Telegram

## Key Commands
```bash
npm run dev          # dev server
npm run build        # production build
npm run start        # production server
```

## Architecture
- **Server pages**: `page.tsx` exports metadata, wraps Client component
- **Client components**: `*Client.tsx` — `'use client'` directive
- **AI routes**: `/api/ai/chat`, `/api/ai/itinerary`, `/api/ai/risk`, `/api/ai/compare`, etc.
- **Data**: `src/data/paises.ts` — 107 países con riesgo MAEC
- **Z-index**: TopBar `z-[1010]`, SidePanel `z-[1005]`, Leaflet `z-[400-1000]`

## Newsletter Architecture Design (Pending Discussion)
### Concept: Newsletter Autónomo
**Arquitectura:**
Trigger (GitHub Actions / Anomaly) → Data (MAEC+USGS+GDACS) → LLM Groq (content generation) → Personalization (Supabase profiles) → Send (Resend + Telegram) → Analytics (newsletter_logs)

**Newsletter Types:**
| Type | Frequency | Content | Audience |
|---|---|---|---|
| Digest Semanal | Monday 08:00 | Top 3 MAEC changes + 1 destination | All free users |
| Risk Alert | Event-driven | Country changed level → impact | Users with favorites |
| Premium Monthly | 1st of month | Deep analysis + ML predictions | Premium only |
| Destination Month | 15th of month | Full profile: cost+risk+weather | All |

**Provider:** Resend (3,000 emails/mo free, native Next.js SDK, React Email support)

**Components to build:**
1. React Email template (`@react-email/components`) — personalized with `{{nombre}}`, `{{pais}}`, `{{riesgo_favorito}}`
2. `/api/newsletter/send` route — batch send via Resend (100 per call)
3. `newsletter-generator.ts` — Groq LLM generates destination descriptions (40-50 words, no fluff)
4. GitHub Actions scheduler (free alternative to Vercel cron limits)
5. `newsletter_logs` table in Supabase (opens, clicks tracking)

**Status:** Architecture defined, not yet implemented. Need to decide what's viable vs not.

## CRON Incident (07 May 2026)
- Vercel Hobby allows ONLY 1 cron job. Had 7 crons configured — only 1 was running, rest were silently ignored.
- `/admin/osint/` showed no new data because `osint-sensor` cron never ran.
- **Fix**: Consolidated ALL crons into single `/api/cron/master` route (runs at 06:00 UTC):
  1. MAEC scrape
  2. Risk alerts check
  3. Flight costs / TCI calculation
  4. Airspace OSINT sync
  5. News sentiment (GDELT + RSS + Groq classification)
  6. Oil price fetch (Yahoo Finance)
  7. Daily digest (Telegram + email)
  8. Weekly digest (Mondays only, newsletter subscribers)
- **Rule**: NEVER create new cron endpoints. Add tasks to `master/route.ts` instead.

## Recent Work (07 May 2026)
- Created master cron consolidating 7 jobs into 1 (`src/app/api/cron/master/route.ts`)
- Newsletter: double opt-in flow restored, RESEND_API_KEY saved in `.env.local` + Vercel
- Added `src/app/api/cron/master/route.ts` — single entry point for all daily automation
- Eurostat integration attempted and abandoned (SDMX v2 too complex, timeout issues)
- OSINT sensor already implemented: `/admin/osint/` + `src/lib/osint-sensor.ts` + `src/app/api/cron/osint-sensor/route.ts`
  - Scrapes Reddit RSS (r/travel, r/solotravel, r/digitalnomad), GDACS, USGS, GDELT
  - Classifies signals with Groq (category, urgency, first-person detection)
  - Saves to `osint_signals` table in Supabase

## False Positives (Audit Tools)
- `@mybloggingnotes` links — old cached content, removed from live site
- WhatsApp number — not present in current codebase
- Duplicate emails — audit tool cache issue
