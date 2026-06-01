# HumanOS Upgrade Architecture

World-class AI-powered Human Development Platform — Phases 1–10.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     HumanOS Platform                         │
├──────────────┬──────────────┬──────────────┬──────────────┤
│  Assessment  │   Engines    │   AI Layer   │  Community   │
│  Hub (11)    │  Blueprint   │  Life Arch.  │  Circles     │
│  Core + Adv  │  HPI         │  Digital Twin│  Research    │
│              │  Future Self │  AI Coach    │  Achievements│
└──────────────┴──────────────┴──────────────┴──────────────┘
                              │
                    Supabase / Demo Store
```

## Phase Map

| Phase | Feature | Route | Engine | API |
|-------|---------|-------|--------|-----|
| 1 | Human Blueprint | `/blueprint` | `blueprint-engine.ts` | `/api/blueprint` |
| 2 | Advanced Testing Hub | `/testing-hub` | `advanced-scoring.ts` | `/api/assessments` |
| 3 | Human Potential Index | `/potential` | `hpi-engine.ts` | `/api/hpi` |
| 4 | Future Self Simulator | `/future-self` | `future-self-engine.ts` | `/api/future-self` |
| 5 | AI Life Architect | `/architect` | `life-architect-engine.ts` | `/api/architect` |
| 6 | Growth Timeline | `/timeline` | demo store events | `/api/timeline` |
| 7 | Growth Circles | `/community` | anonymous posts | `/api/community` |
| 8 | Digital Twin | `/twin` | `digital-twin-engine.ts` | `/api/twin` |
| 9 | Achievements | `/achievements` | `achievement-engine.ts` | `/api/blueprint` |
| 10 | Research Dashboard | `/research` | `research-engine.ts` | `/api/research` |

## Database (run `supabase/schema-upgrades.sql`)

New tables: `human_blueprints`, `hpi_snapshots`, `growth_timeline_events`, `user_achievements`, `user_goals`, `growth_plans`, `future_self_scenarios`, `digital_twin_profiles`, `community_posts`.

Extended: `assessment_results.detail_scores` JSONB for sub-scores (Big Five traits, IQ range, etc.).

## HPI Algorithm

Weighted composite (0–100):

- IQ 12%, EQ 15%, Resilience 13%, Purpose 14%, Relationships 14%, Attention 12%, Digital Wellness 10%, Self-Esteem 10%

## Advanced Assessments

| ID | Type | Output |
|----|------|--------|
| `big-five` | Likert | 5 trait scores |
| `iq-assessment` | Multiple choice | IQ range 85–145 |
| `attention-health` | Likert | Focus/distraction/overload |
| `purpose-meaning` | Likert | Purpose score |
| `career-alignment` | Likert | Career fit + recommendations |
| `relationship-intelligence` | Likert | Relationship IQ |

## AI Workflows

1. **Life Architect** — Reads full profile → generates 4-week plan + monthly roadmap
2. **AI Coach** — Enhanced with architect context (scores, moods, challenges)
3. **Digital Twin** — Blueprint + assessments → best-self Q&A
4. **Future Self** — Habit/goal input → Scenario A vs B predictions

## Demo Mode

All features work without Supabase via `.data/demo-store.json` including timeline, community, HPI snapshots, achievements.

## Deployment

1. Run `schema.sql` + `seed.sql` + `schema-upgrades.sql`
2. Set env vars in `.env.local`
3. `npm run build && npm start`
