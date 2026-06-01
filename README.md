# HumanOS

**Designed for Human Flourishing, Not Digital Addiction.**

HumanOS is an AI-powered Human Development Platform built with Next.js 16, TypeScript, Tailwind CSS, Supabase, and OpenAI.

## Features

### Core
- **Authentication** — Sign up, login, forgot password, user profile
- **Dashboard** — Human Flourishing Score with 6 dimension scores and charts
- **Assessment Center** — Core + advanced assessments (Big Five, IQ, Purpose, Career, etc.)
- **Human Flourishing Engine** — Weighted algorithm combining all scores (0–100)
- **AI Life Coach** — Psychology-informed chat with long-term memory
- **Mood Tracker** — Daily mood logging with trend charts
- **Growth Challenges** — Habit challenges with streaks
- **Demo Mode** — Full app without Supabase (auto-enabled when env vars are placeholders)

### Growth Platform (V2–V4)
- Human Blueprint, Testing Hub, Human Potential Index, Future Self Simulator
- AI Life Architect, Growth Timeline, Digital Twin, Community, Achievements, Research Dashboard

### Life OS V5
- **Life OS** (`/life-os`) — 7-dimension life balance score + AI recommendations
- **Knowledge Vault** (`/vault`) — Journals, reflections, insights
- **Mission Generator** (`/mission`) — Personal mission, vision, direction
- **Burnout Engine** (`/burnout`) — Risk score + interventions
- **Relationship Map** (`/relationships`) — Network health tracking
- **Human Capital Index** (`/capital`) — Skills & strengths measurement
- **Life Reports** (`/reports`) — Monthly report + 1/3/5 year roadmap (PDF export)
- **AI Mentors** (`/mentors`) — 6 specialist mentors sharing memory context

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Shadcn-style UI components
- Supabase (Auth + PostgreSQL)
- OpenAI API (gpt-4o-mini)
- Recharts
- Framer Motion

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run **in order**:
   - `supabase/schema.sql` — core tables, RLS, triggers
   - `supabase/seed.sql` — assessments and challenges
   - `supabase/schema-upgrades.sql` — blueprint, HPI, timeline, community
   - `supabase/schema-v5.sql` — Life OS V5 tables
3. Go to **Authentication → URL Configuration** and add:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
4. Copy your project URL and anon key from **Settings → API**

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=sk-your_openai_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> The AI Coach works without OpenAI (fallback responses). Add `OPENAI_API_KEY` for full AI responses.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Protected app routes
│   │   ├── dashboard/
│   │   ├── assessments/
│   │   ├── results/
│   │   ├── mood/
│   │   ├── challenges/
│   │   ├── coach/
│   │   ├── insights/
│   │   └── profile/
│   ├── auth/               # Auth pages
│   ├── api/                # API routes
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── layout/             # App shell & sidebar
│   ├── dashboard/          # Score cards
│   ├── charts/             # Recharts components
│   └── assessments/        # Assessment taker
├── lib/
│   ├── supabase/           # Supabase clients
│   ├── data/               # Server data fetching
│   ├── flourishing-engine.ts
│   └── assessments-data.ts
└── types/
supabase/
├── schema.sql
└── seed.sql
```

## Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile (extends auth.users) |
| `assessments` | Assessment catalog |
| `assessment_results` | User assessment scores |
| `mood_logs` | Daily mood entries |
| `challenges` | Challenge catalog |
| `challenge_progress` | User challenge tracking |
| `ai_conversations` | AI coach chat history |
| `insights` | Generated insight snapshots |

## Deployment (Vercel)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (same as `.env.local`)
4. Update Supabase redirect URLs to your production domain:
   - `https://your-domain.vercel.app/auth/callback`
5. Deploy

```bash
npm run dev          # Development server
npm run build        # Production build
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm run test         # Unit tests (engines)
```

See [AUDIT.md](./AUDIT.md) for architecture audit, security checklist, and validation status.
See [UPGRADE.md](./UPGRADE.md) for Phase 1–10 feature details.

## Human Flourishing Engine

Scores are weighted and combined:

| Dimension | Weight | Source |
|-----------|--------|--------|
| Emotional Health | 20% | Emotional Intelligence Test |
| Self-Esteem | 15% | Self-Esteem Test |
| Resilience | 15% | Resilience Assessment |
| Mindfulness | 15% | Mood logs / derived |
| Social Connection | 20% | Loneliness Assessment (inverted) |
| Digital Wellness | 15% | Digital Wellness Assessment |

## Disclaimer

HumanOS is a personal development tool. It does not provide therapy, diagnosis, or medical advice. If you are in crisis, please contact a mental health professional or crisis helpline.
