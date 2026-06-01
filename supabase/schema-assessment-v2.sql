-- HumanOS Assessment & Intelligence V2
-- Run after schema-v5.sql

-- Adaptive assessment sessions (progressive, question-bank driven)
CREATE TABLE IF NOT EXISTS assessment_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  assessment_id TEXT REFERENCES assessments(id) NOT NULL,
  phase INT NOT NULL DEFAULT 1,
  question_ids INT[] NOT NULL DEFAULT '{}',
  answers JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  consistency_level TEXT CHECK (consistency_level IN ('high', 'medium', 'low')),
  confidence_level TEXT CHECK (confidence_level IN ('high', 'medium', 'low')),
  consistency_score DECIMAL,
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assessment_sessions_user ON assessment_sessions(user_id, assessment_id);

-- Extended result metadata (V2 scoring quality)
ALTER TABLE assessment_results
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES assessment_sessions(id),
  ADD COLUMN IF NOT EXISTS confidence_level TEXT CHECK (confidence_level IN ('high', 'medium', 'low')),
  ADD COLUMN IF NOT EXISTS consistency_level TEXT CHECK (consistency_level IN ('high', 'medium', 'low')),
  ADD COLUMN IF NOT EXISTS confidence_reason TEXT,
  ADD COLUMN IF NOT EXISTS administered_question_ids INT[],
  ADD COLUMN IF NOT EXISTS engine_version TEXT DEFAULT 'v1';

-- Life events timeline
CREATE TABLE IF NOT EXISTS life_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  impact_score INT CHECK (impact_score BETWEEN -5 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_life_events_user ON life_events(user_id, event_date DESC);

-- Behavioral signals (login, habits, challenges)
CREATE TABLE IF NOT EXISTS behavioral_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_behavioral_events_user ON behavioral_events(user_id, recorded_at DESC);

-- User consent & governance
CREATE TABLE IF NOT EXISTS user_consent (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  analytics BOOLEAN DEFAULT false,
  ai_personalization BOOLEAN DEFAULT true,
  research_aggregate BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Intelligence snapshots (segmentation, burnout, recommendations)
CREATE TABLE IF NOT EXISTS intelligence_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  segment TEXT,
  burnout_risk TEXT CHECK (burnout_risk IN ('low', 'medium', 'high')),
  burnout_score DECIMAL,
  features JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  explanations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_intelligence_snapshots_user ON intelligence_snapshots(user_id, created_at DESC);

-- RLS
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own assessment_sessions" ON assessment_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own life_events" ON life_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own behavioral_events" ON behavioral_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own user_consent" ON user_consent FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own intelligence_snapshots" ON intelligence_snapshots FOR ALL USING (auth.uid() = user_id);
