# Community V2 Roadmap

## Current (`/community`)

- Topic-based posts
- Anonymous posting (`is_anonymous: true`)
- Supabase `community_posts` with RLS
- Auth required on GET/POST

## Planned (Phase 10)

- Growth Challenges (shared with `/challenges`)
- Weekly Missions
- Leaderboards
- Discussion spaces by skill
- Mastermind circles
- Community insights aggregate
- AI moderation layer

## Architecture

Community V2 builds on Human Networks (`/community/networks`) with shared Supabase schema and stricter RLS policies.
