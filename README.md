# Safa Rosy — AI Beauty Consultant + Storefront

A Next.js beauty storefront with **Rosy**: an AI beauty consultant that lives in a
floating widget (bottom-left), asks smart adaptive questions about a shopper's
skin / hair / body, then recommends the best-matching products — including live
offers — straight from your real catalog.

Built as a ready-to-integrate prototype for [safa-rosy.vercel.app](https://safa-rosy.vercel.app).

## Features

- **Floating consultant widget** — animated smiley FAB with a "Can I help you?" cloud, full chat panel with typing indicator, quick-reply chips, and product cards that scroll to items on the page.
- **Smart adaptive survey** — skin type + concern + sun reaction; hair type + dyed/color + concern; body goals. Questions adapt to answers, one tap at a time.
- **Catalog-grounded recommendations** — the AI may only pick real product IDs from your database. Prices/offers always come from the catalog, never invented.
- **Bilingual** — English by default, auto-switches to Arabic (RTL-friendly) when the shopper writes Arabic.
- **Professional tone by design** — system prompt strictly forbids flirting, pet names, and emojis.
- **Free-forever AI** — three-tier brain:
  1. `GROQ_API_KEY` → Groq · Llama 3.3 (free key at console.groq.com)
  2. `GEMINI_API_KEY` → Gemini Flash (free key at aistudio.google.com, ~1,500 req/day)
  3. **Built-in local smart engine** — works with zero keys, zero cost, forever (also the automatic fallback on any provider error/rate limit).
- **Consultation analytics** — finished consultations (answers + recommended products) are stored in PostgreSQL.

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 4 · Drizzle ORM · PostgreSQL · TypeScript

## Getting started

```bash
npm install

# 1) configure environment
cp .env.example .env        # set DATABASE_URL (AI keys optional)

# 2) create tables
npx drizzle-kit push

# 3) seed the demo catalog (19 products)
psql "$DATABASE_URL" -f seed.sql

# 4) run
npm run dev
```

Open http://localhost:3000 and tap the smiling face on the bottom-left.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GROQ_API_KEY` | Optional | Free LLM tier (used first if present) |
| `GEMINI_API_KEY` | Optional | Free LLM tier (used if Groq absent) |
| `OPENAI_API_KEY` | Optional | Used if neither of the above exists |

All keys stay server-side (used only inside `/api/chat`).

## Project structure

```
src/
├─ app/
│  ├─ page.tsx                 # storefront (hero, catalog, consult CTAs)
│  └─ api/chat/route.ts        # consultant endpoint (LLM + fallback + logging)
├─ components/
│  ├─ assistant/beauty-assistant.tsx  # floating widget (FAB + cloud + chat)
│  └─ store-cta.tsx            # any button that opens Rosy
├─ db/                         # Drizzle client + schema (products, consultations)
└─ lib/consultant/
   ├─ llm.ts                   # free-tier LLM orchestration + strict JSON contract
   └─ local.ts                 # zero-key bilingual smart engine
```

## Integrating into an existing site

1. Copy `src/lib/consultant/`, `src/app/api/chat/`, and `src/components/assistant/`.
2. Create the `products` table with the fields in `src/db/schema.ts` (or map your own catalog into `ProductLite`).
3. Render `<BeautyAssistant products={…} />` once in your layout.
4. Done — every product page button can open Rosy via `window.dispatchEvent(new CustomEvent("rosy:open"))`.
