# HumanOS V5 — Architecture Roadmap

**Date:** 2026-06-06  
**Status:** Roadmap only — no migration in this release

---

## Current Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 App Router, TypeScript, Tailwind v4 |
| Auth & DB | Supabase (Auth, PostgreSQL, RLS) |
| AI (today) | OpenAI API from Next.js route handlers |
| Hosting | Vercel serverless |
| Engines | TypeScript rule/ML-inspired modules |

---

## When to Evolve

Migrate AI complexity to Python when:
- Multi-step agent workflows exceed route handler limits
- Vector search over vault/journals is required at scale
- Model fine-tuning or local inference is needed
- Background jobs exceed serverless timeouts (>60s)
- Team needs separate AI service deployment cadence

---

## Target Architecture (Future)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js    │────▶│   FastAPI    │────▶│   OpenAI     │
│   Frontend   │     │   AI API     │     │   / Local    │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │
       │                    ▼
       │             ┌──────────────┐
       └────────────▶│   Supabase   │
                     │  + pgvector  │
                     └──────────────┘
```

---

## What Stays in Next.js

- All UI routes and components
- Authentication (Supabase SSR)
- CRUD APIs for assessments, mood, vault, Life OS
- Dashboard rendering and charts
- Proxy/middleware session management
- Static marketing pages

---

## What Moves to Python (Future)

| Capability | Framework |
|------------|-----------|
| Long-running AI pipelines | FastAPI + background workers |
| Multi-agent coaching | LangGraph |
| RAG over Knowledge Vault | LangChain + pgvector |
| Journal NLP upgrade | Python ML service |
| Batch intelligence reports | Celery / Supabase Edge Functions |
| Research aggregates (anonymized) | Python ETL with k-anonymity |

---

## Database Evolution

| Phase | Addition |
|-------|----------|
| Now | PostgreSQL via Supabase |
| Next | `pgvector` extension for vault embeddings |
| Later | Separate analytics warehouse (optional) |

**Migration:** Enable pgvector in Supabase → add `vault_embeddings` table → backfill via Python worker.

---

## Migration Steps (Phased)

### Phase A — API boundary (4–6 weeks)
1. Create FastAPI service with health + coach endpoint
2. Next.js coach route proxies to FastAPI (feature flag)
3. Shared auth: validate Supabase JWT in FastAPI
4. Monitor latency and errors

### Phase B — Memory & RAG (6–8 weeks)
1. Deploy pgvector
2. Index vault entries on write
3. Python retrieval service for coach context
4. Deprecate JSON blob memory for semantic search

### Phase C — Agents (8–12 weeks)
1. LangGraph workflows for Life Architect, Future Self
2. Streaming SSE from FastAPI to Next.js
3. Move intelligence pipeline heavy compute to Python

### Phase D — Scale (ongoing)
1. Redis rate limiting
2. Queue for report generation
3. Multi-region if needed

---

## Scalability Benefits

| Concern | Next.js only | + Python AI layer |
|---------|--------------|-------------------|
| Long AI chains | Timeout risk | Dedicated workers |
| Vector search | Not native | pgvector + Python |
| Model swaps | Redeploy app | Independent AI deploy |
| Cost control | Per-request serverless | Batch + cache |
| Team ownership | Full-stack | FE / AI split |

---

## Do NOT Migrate Yet

Current OpenAI usage (coach + mentors, short completions) fits Next.js route handlers. Premature Python split adds ops cost without user benefit.

**Trigger metrics:**
- >5% AI requests timeout
- Vault RAG requested by users
- Coach sessions average >10 turns with context >8k tokens

---

## Analytics (Phase 16 — Future)

Respect `analytics` consent from `/settings/privacy`. Options: Plausible, PostHog (self-hosted), or Supabase events table.

---

## Human Networks (Phase 17 — Future)

After core stability: connection graph in Supabase, RLS per relationship, AI matching via Python service. Not in current scope.
