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

## Implemented (Jan 9, 2026)
- ✅ FastAPI backend with auto-seed: 1 business, 9 reviews, 12 truth facts, 6 customers, 8 AI visibility entries, **11 AI mentions**.
- ✅ Endpoints: business, metrics, reviews list/filter/patch, truth CRUD, customers, ai-visibility (grouped), **ai-mentions (with today summary)**.
- ✅ React portal with persistent palette (localStorage) and full sidebar navigation.
- ✅ Pages: Pulpit (+ **live mentions banner with auto-rotating ticker**), Opinie, **Wzmianki AI · live** (hero counter + per-agent feed), Feed Prawdy · AI, Klienci, Zbieraj opinie, Widżet WWW, Statystyki, Ustawienia.
- ✅ Reply modal with 3 modes: publiczna odpowiedź / podziękowanie / **przechwycenie** (private manager message).
- ✅ Backend tested via pytest 11/11 passing. Frontend e2e via Playwright — all pages render, all 4 themes switch.
- ✅ **Live AI Mentions retention hook** — owner sees real quotes from ChatGPT/Claude/Gemini/Perplexity recommending his cafe; pulsing live banner shows today's count + ticker.

## Backlog (Prioritized)
- **P0** — Real AI visibility check (call ChatGPT/Claude/Gemini through Emergent LLM key) instead of seeded data.
- **P0** — Landing + free audit funnel ("Czy AI mnie poleca?") — the main hook for SMB acquisition.
- **P1** — Business auth (JWT or Emergent Google) + multi-tenant.
- **P1** — Webhook from booking → auto-add customer to Klienci.
- **P2** — Widget JS to embed reviews on the business's own website.
- **P2** — i18n (CS, SK, HU) for full EU rollout per the DMA/Data Act narrative.

## Test Credentials
N/A — no authentication implemented in this iteration.
