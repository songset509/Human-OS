-- Seed data for assessments and challenges

INSERT INTO assessments (id, title, description, question_count, category) VALUES
  ('emotional-intelligence', 'Emotional Intelligence Test', 'Measure your ability to understand and manage emotions effectively.', 20, 'emotional_health'),
  ('self-esteem', 'Self-Esteem Test', 'Evaluate your sense of self-worth and personal confidence.', 10, 'self_esteem'),
  ('loneliness', 'Loneliness Assessment', 'Understand your social connection and feelings of isolation.', 10, 'social_connection'),
  ('resilience', 'Resilience Assessment', 'Assess your ability to bounce back from adversity.', 10, 'resilience'),
  ('digital-wellness', 'Digital Wellness Assessment', 'Evaluate your relationship with technology and digital habits.', 10, 'digital_wellness')
ON CONFLICT (id) DO NOTHING;

INSERT INTO challenges (id, title, description, duration_days, icon) VALUES
  ('digital-detox', 'Digital Detox Challenge', 'Reduce screen time and reconnect with the physical world. Limit non-essential device use for 7 days.', 7, 'smartphone-off'),
  ('gratitude', 'Gratitude Challenge', 'Write down three things you are grateful for each day to cultivate positivity.', 7, 'heart'),
  ('mindfulness', 'Mindfulness Challenge', 'Practice 10 minutes of mindful breathing or meditation daily.', 7, 'brain'),
  ('call-a-friend', 'Call a Friend Challenge', 'Reach out to someone you care about each day for meaningful connection.', 7, 'phone')
ON CONFLICT (id) DO NOTHING;
