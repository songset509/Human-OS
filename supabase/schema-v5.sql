-- HumanOS V5 Schema — run after schema-upgrades.sql

CREATE TABLE IF NOT EXISTS life_os_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  dimensions JSONB NOT NULL DEFAULT '{}',
  balance_score DECIMAL NOT NULL DEFAULT 50,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS vault_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('journal','reflection','lesson','insight','goal')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  mission_statement TEXT NOT NULL,
  life_vision TEXT NOT NULL,
  long_term_direction TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS burnout_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  risk_score DECIMAL NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low','medium','high')),
  factors JSONB NOT NULL,
  interventions JSONB NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS relationship_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  strength INT NOT NULL CHECK (strength BETWEEN 1 AND 5),
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS human_capital_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  score DECIMAL NOT NULL,
  dimensions JSONB NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  memory_type TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS future_roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  horizons JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE life_os_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE burnout_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_capital_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own life_os" ON life_os_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own vault" ON vault_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own mission" ON user_missions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own burnout" ON burnout_snapshots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own relationships" ON relationship_nodes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own capital" ON human_capital_snapshots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own memory" ON ai_memory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own roadmaps" ON future_roadmaps FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_vault_user ON vault_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_user ON ai_memory(user_id);
