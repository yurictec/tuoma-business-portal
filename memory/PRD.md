# Tuoma — Business Portal · PRD

## Problem Statement (original, RU)
> Поиск умирает, его заменяет один-единственный ответ AI — и сегодня в этом ответе нет локального бизнеса. Tuoma делает бизнес тем, кого AI называет по имени — и забирает обратно клиента, которого агент пытался украсть, превращая его в актив, которым бизнес владеет вечно. А в Европе закон уже написан так, чтобы этим слоем были мы.

User uploaded HTML mockup `portal-dashboard.html` for the business portal — task: develop/extend it.

## Architecture
- **Frontend**: React 19 + react-router-dom 7, plain CSS (custom palettes via CSS variables), axios.
- **Backend**: FastAPI + Motor (MongoDB async). All routes prefixed `/api`. Auto-seed on startup.
- **DB**: MongoDB collections — `businesses`, `reviews`, `truth_facts`, `customers`, `ai_visibility`.
- **No auth** (per user choice). Single tenant for now — slug `kawiarnia-lumiere`.
- **Language**: Polish UI.

## User Personas
- **Business Owner (Yuri / Kawiarnia Lumière)** — manages reputation, replies to reviews, owns customer relationships.
- **AI Agents (ChatGPT / Claude / Gemini / Perplexity)** — consume the neutral Feed Prawdy via the public truth endpoint.

## Core Requirements (static)
1. Reproduce the mockup look-and-feel including 4 palettes (Petrol/Tide/Clay/Midnight).
2. Reviews management (filters, reply, intercept negative).
3. Metrics tiles (Nowe opinie · Przechwycone · Recovery · Reakcja).
4. **Feed Prawdy · AI** — neutral truth feed visible to AI agents (key differentiator).
5. **Klienci** — customer database recovered from intercepted reviews (the "moat").

## Implemented (Jan 9–10, 2026)
- ✅ FastAPI backend with auto-seed: 1 business, 9 reviews, 12 truth facts, 6 customers, 8 AI visibility entries, 11 AI mentions.
- ✅ Endpoints: business, metrics, reviews list/filter/patch, truth CRUD, customers, ai-visibility (grouped), ai-mentions (with today summary), **waitlist (POST + count)**.
- ✅ React portal with persistent palette (localStorage) and full sidebar navigation.
- ✅ Pages: Pulpit (+ live mentions banner with auto-rotating ticker), Opinie, Wzmianki AI · live (hero counter + per-agent feed), Feed Prawdy · AI, Klienci, Zbieraj opinie, Widżet WWW, Statystyki, Ustawienia.
- ✅ Reply modal with 3 modes: publiczna odpowiedź / podziękowanie / przechwycenie.
- ✅ Backend tested via pytest 11/11 + 6/6 waitlist passing. Frontend e2e 100% iteration_1 + iteration_2.
- ✅ Live AI Mentions retention hook — owner sees real quotes from ChatGPT/Claude/Gemini/Perplexity.
- ✅ **Marketing landing `/lp`** — dark editorial design, hero with 4 floating AI phone-cards, interactive 0-of-4 audit demo, "For investors" section (DMA + Data Act), working waitlist form saving to MongoDB with social-proof counter.
- ✅ **Social proof marquee** — infinite-scroll carousel of 8 fictional Polish SMB businesses with unique typographic logos.
- ✅ **Counter-up animations** — Intersection Observer powered counters on pain stats (6/6, 1, 95%) and waitlist count.
- ✅ **Ecosystem section on `/lp`** — animated SVG hub-and-spoke diagram: central Tuoma "NEUTRAL LAYER" + 4 nodes (Admin / Portal / Publiczna strona / Link do opinii) with traveling data tokens.
- ✅ **Public business page `/p/:slug`** — light themed digital-footprint page: avatar, rating, 12 verified AI facts grouped by category, public reviews block, "Zostaw opinię" CTA.
- ✅ **Universal review link `/r/:slug`** — 2-step dark form with smart routing: 5★ → 4 public services (Tuoma/Google/Facebook/Booking), ≤3★ → Tuoma intercept only (private to owner). Negative reviews never leak to public sources by default.

## Backlog (Prioritized)
- **P0** — Real AI visibility check (call ChatGPT/Claude/Gemini through Emergent LLM key) instead of seeded data.
- **P0** — Landing + free audit funnel ("Czy AI mnie poleca?") — the main hook for SMB acquisition.
- **P1** — Business auth (JWT or Emergent Google) + multi-tenant.
- **P1** — Webhook from booking → auto-add customer to Klienci.
- **P2** — Widget JS to embed reviews on the business's own website.
- **P2** — i18n (CS, SK, HU) for full EU rollout per the DMA/Data Act narrative.

## Test Credentials
N/A — no authentication implemented in this iteration.
