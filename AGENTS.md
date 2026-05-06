# AGENTS.md — Viaje con Inteligencia

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
