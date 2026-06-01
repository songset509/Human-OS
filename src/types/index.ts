export type MoodType = "happy" | "calm" | "neutral" | "stressed" | "sad";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string | null;
  question_count: number;
  category: AssessmentCategory;
  icon?: string;
  tier?: "core" | "advanced";
  questionType?: "likert" | "multiple_choice";
}

export type AssessmentCategory =
  | "emotional_health"
  | "self_esteem"
  | "social_connection"
  | "resilience"
  | "digital_wellness"
  | "big_five"
  | "iq"
  | "attention"
  | "purpose"
  | "career"
  | "relationship";

export interface AssessmentQuestion {
  id: number;
  text: string;
  reverseScored?: boolean;
  trait?: string;
  options?: { value: number; label: string; correct?: boolean }[];
}

export interface AssessmentResult {
  id: string;
  user_id: string;
  assessment_id: string;
  score: number;
  max_score: number;
  normalized_score: number;
  answers: Record<number, number>;
  detail_scores?: Record<string, number>;
  created_at: string;
  session_id?: string;
  confidence_level?: "high" | "medium" | "low";
  consistency_level?: "high" | "medium" | "low";
  confidence_reason?: string;
  engine_version?: string;
}

export interface ConfidenceInfo {
  level: "high" | "medium" | "low";
  reason: string;
}

export interface DigitalTwinProfile {
  personalitySummary: string;
  coreValues: string[];
  emotionalPatterns: string[];
  growthPriorities: string[];
  bestSelfPrinciples: string[];
  confidence?: ConfidenceInfo;
}

export interface MoodLog {
  id: string;
  user_id: string;
  mood: MoodType;
  note: string | null;
  logged_at: string;
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  duration_days: number;
  icon: string | null;
}

export interface ChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  completed_days: number[];
  streak: number;
  started_at: string;
  completed_at: string | null;
  is_active: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface FlourishingScores {
  overall: number;
  emotionalHealth: number;
  selfEsteem: number;
  resilience: number;
  mindfulness: number;
  socialConnection: number;
  digitalWellness: number;
}

export interface FlourishingInsight {
  strengths: string[];
  growthAreas: string[];
  recommendations: string[];
  nextActions: string[];
}

export interface DashboardData {
  scores: FlourishingScores;
  insight: FlourishingInsight;
  recentMoods: MoodLog[];
  activeChallenges: ChallengeProgress[];
  completedAssessments: number;
  totalAssessments: number;
}

// --- Upgrade types ---

export interface HumanBlueprint {
  archetype: string;
  tagline: string;
  strengths: string[];
  growthAreas: string[];
  riskFactors: string[];
  growthPath: string[];
  generatedAt: string;
}

export interface HPIDimensions {
  iq: number;
  eq: number;
  resilience: number;
  purpose: number;
  relationships: number;
  attention: number;
  digitalWellness: number;
  selfEsteem: number;
}

export interface HPIScore {
  overall: number;
  dimensions: HPIDimensions;
  label: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  requirement: string;
}

export interface GrowthTimelineEvent {
  id: string;
  event_type: "flourishing" | "hpi" | "mood" | "assessment" | "achievement";
  title: string;
  value?: number;
  recorded_at: string;
}

export interface FutureSelfInput {
  habits: string;
  goals: string;
  lifestyle: string;
}

export interface FutureSelfPrediction {
  flourishingScore: number;
  mentalWellbeing: number;
  relationships: number;
  productivity: number;
  purpose: number;
  narrative: string;
}

export interface FutureSelfScenario {
  scenarioA: FutureSelfPrediction;
  scenarioB: FutureSelfPrediction;
  timeframe: string;
  confidence?: ConfidenceInfo;
}

export interface GrowthPlanWeek {
  week: number;
  focus: string;
  actions: string[];
}

export interface CommunityPost {
  id: string;
  topic: string;
  content: string;
  created_at: string;
  is_anonymous: boolean;
}

export interface ResearchStats {
  avgFlourishing: number;
  avgDigitalWellness: number;
  avgRelationship: number;
  avgPurpose: number;
  avgHPI: number;
  sampleSize: number;
  trends: { month: string; flourishing: number; hpi: number }[];
}
