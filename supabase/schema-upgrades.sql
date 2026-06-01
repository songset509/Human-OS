-- HumanOS Phase 1-10 Schema Upgrades (idempotent)
-- Run AFTER schema.sql and seed.sql
-- Safe to re-run: policies use DROP IF EXISTS; tables/indexes use IF NOT EXISTS

-- Extended assessment metadata (sub-scores for Big Five, IQ, etc.)
ALTER TABLE assessment_results
  ADD COLUMN IF NOT EXISTS detail_scores JSONB DEFAULT '{}';

-- Human Blueprint reports
CREATE TABLE IF NOT EXISTS human_blueprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  archetype TEXT NOT NULL,
  content JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Human Potential Index snapshots
CREATE TABLE IF NOT EXISTS hpi_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  score DECIMAL NOT NULL,
  dimensions JSONB NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Growth timeline events
CREATE TABLE IF NOT EXISTS growth_timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  value DECIMAL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  achievement_id TEXT NOT NULL,
  title TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- User goals (Life Architect)
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Growth plans (Life Architect)
CREATE TABLE IF NOT EXISTS growth_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('weekly', 'monthly')),
  content JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Future self scenarios
CREATE TABLE IF NOT EXISTS future_self_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  input JSONB NOT NULL,
  predictions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Digital twin profile
CREATE TABLE IF NOT EXISTS digital_twin_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  profile JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Anonymous community posts
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed advanced assessments catalog
INSERT INTO assessments (id, title, description, question_count, category) VALUES
  ('big-five', 'Big Five Personality', 'Measure Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.', 25, 'big_five'),
  ('iq-assessment', 'Cognitive Ability Assessment', 'Logical reasoning, pattern recognition, numerical, verbal, and spatial ability.', 15, 'iq'),
  ('attention-health', 'Attention Health Assessment', 'Focus, distraction, cognitive overload, and multitasking patterns.', 10, 'attention'),
  ('purpose-meaning', 'Purpose & Meaning Assessment', 'Life purpose, values alignment, motivation, and meaning.', 10, 'purpose'),
  ('career-alignment', 'Career Alignment Assessment', 'Interests, strengths, and personality-career fit.', 10, 'career'),
  ('relationship-intelligence', 'Relationship Intelligence Assessment', 'Communication, trust, vulnerability, and emotional awareness.', 10, 'relationship')
ON CONFLICT (id) DO NOTHING;

-- Row Level Security
ALTER TABLE human_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE hpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_self_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Policies (drop before create for idempotency)
DROP POLICY IF EXISTS "Users own blueprints" ON human_blueprints;
CREATE POLICY "Users own blueprints" ON human_blueprints
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own hpi" ON hpi_snapshots;
CREATE POLICY "Users own hpi" ON hpi_snapshots
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own timeline" ON growth_timeline_events;
CREATE POLICY "Users own timeline" ON growth_timeline_events
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own achievements" ON user_achievements;
CREATE POLICY "Users own achievements" ON user_achievements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own goals" ON user_goals;
CREATE POLICY "Users own goals" ON user_goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own plans" ON growth_plans;
CREATE POLICY "Users own plans" ON growth_plans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own scenarios" ON future_self_scenarios;
CREATE POLICY "Users own scenarios" ON future_self_scenarios
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own twin" ON digital_twin_profiles;
CREATE POLICY "Users own twin" ON digital_twin_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own posts" ON community_posts;
CREATE POLICY "Users own posts" ON community_posts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone reads community" ON community_posts;
CREATE POLICY "Anyone reads community" ON community_posts
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_hpi_user ON hpi_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_user ON growth_timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_community_topic ON community_posts(topic);
CREATE INDEX IF NOT EXISTS idx_human_blueprints_user ON human_blueprints(user_id);
