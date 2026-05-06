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

## Recent Work (06 May 2026)
- Created `/chat` page with free (5 msg/day) and premium (unlimited 70b model)
- Updated premium page with Chat IA comparison section
- See `WAY_AHEAD.md` for pending items

## False Positives (Audit Tools)
- `@mybloggingnotes` links — old cached content, removed from live site
- WhatsApp number — not present in current codebase
- Duplicate emails — audit tool cache issue
