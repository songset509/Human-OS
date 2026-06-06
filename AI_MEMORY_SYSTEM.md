# AI Memory System

## Implemented

**Engine:** `src/lib/engines/memory-engine.ts`

- `detectAssessmentTrends()` — compares first vs latest scores per assessment
- `formatMemoryContext()` — injects trends + recent memory into AI prompts
- Used by `getAIMemoryContext()` in `v5-data.ts`
- Storage: `ai_memory` table + coach conversations

## Example

Month 1 confidence 42 → Month 6 confidence 81 → AI context includes `confidence: 42→81 (↑39)`

## Roadmap

- Personal Growth Timeline UI enhancements
- pgvector semantic memory over vault
- Automatic insight generation on score changes
