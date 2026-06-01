# HumanOS Assessment & Intelligence V2

## Overview

V2 transforms HumanOS from static questionnaires into an **adaptive, progressive, explainable** human-development intelligence system—without removing legacy assessment flows.

## Architecture

```
User → Adaptive UI → /api/assessments/v2/session
                          ↓
              Assessment Engine V2
              ├── Question Banks (200+ per test)
              ├── Progressive phases (10 + 5 + 5…)
              ├── Consistency validation
              └── Confidence scoring
                          ↓
              assessment_results (engine_version: v2)
                          ↓
              Intelligence Pipeline
              ├── Feature engineering
              ├── Burnout predictor (XGBoost-ready)
              ├── Segmentation (K-Means-ready)
              ├── Journal analysis (DistilBERT-ready)
              └── Recommendation engine
```

## Human Flourishing Framework

All assessments map to canonical dimensions in `src/lib/framework/flourishing-framework.ts`:

- Emotional Health, Relationships, Purpose, Resilience, Attention, Digital Wellness, Human Capital, Life Satisfaction

## Phase 1 — Adaptive Assessment Engine

| Feature | Location |
|---------|----------|
| Question banks | `src/lib/assessments/question-banks/` |
| Adaptive draw | `src/lib/engines/assessment-v2/adaptive-engine.ts` |
| Progressive schedule | `src/lib/engines/assessment-v2/progressive.ts` |
| Consistency | `src/lib/engines/assessment-v2/consistency.ts` |
| Confidence | `src/lib/engines/assessment-v2/confidence.ts` |

**Legacy path preserved:** `POST /api/assessments` + full static lists for IQ MC tests.

## Phase 2 — Data Collection

| Data type | Storage |
|-----------|---------|
| Explicit | assessments, mood, vault, goals |
| Behavioral | `behavioral_events` table / demo store |
| Life events | `life_events` + `/api/life-events` |
| Growth | timeline, HPI, achievements (existing) |

## Phase 3 — Testing Quality Framework

- Scientific basis + trait breakdown: `/api/assessments/metadata?assessmentId=…`
- Shown in `AdaptiveAssessmentShell` before each session

## Phase 4 — Intelligence Layer

| Component | Implementation | Production upgrade |
|-----------|----------------|-------------------|
| Burnout | Rule + feature weights | Python XGBoost service |
| Segmentation | Rule classifier | sklearn KMeans |
| Journal NLP | Lexicon sentiment | DistilBERT microservice |
| Pipeline | `runIntelligencePipeline()` | `/api/intelligence` |

## Phase 5 — Recommendations

`src/lib/engines/recommendations/engine.ts` — explainable rules + segment-aware priorities.

## Phase 6–7 — Twin & Future Self

- Twin confidence: `getTwinWithConfidence()` — low confidence blocks speculative answers
- Future self: `getFutureSelfWithConfidence()` — displays prediction confidence

## Phase 8 — Data Governance

- `/privacy` — consent toggles
- `GET /api/governance?export=1` — JSON export
- `user_consent` table

## Database

Run: `supabase/schema-assessment-v2.sql` after schema-v5.sql

## API Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/assessments/v2/session` | GET | Start/continue adaptive session |
| `/api/assessments/v2/session` | POST | Submit phase answers |
| `/api/assessments/metadata` | GET | Scientific basis + traits |
| `/api/intelligence` | GET/POST | Latest / run pipeline |
| `/api/life-events` | GET/POST | Life timeline events |
| `/api/governance` | GET/POST | Consent + export |

## Implementation Roadmap

1. **Done** — Core V2 engine, banks, APIs, UI, governance, intelligence page
2. **Next** — Python ML service (FastAPI) for XGBoost/KMeans/DistilBERT
3. **Next** — Wire behavioral_events on login/challenge completion
4. **Next** — E2E tests for adaptive session flow

## Testing

```bash
npm run test
```

Includes `assessment-v2.test.ts` for pool size, consistency, and confidence.
