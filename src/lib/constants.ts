import type { Challenge, MoodType } from "@/types";

export const CHALLENGES: Challenge[] = [
  {
    id: "digital-detox",
    title: "Digital Detox Challenge",
    description:
      "Reduce non-essential screen time for 7 days. Set device-free hours and reconnect with the physical world.",
    duration_days: 7,
    icon: "smartphone-off",
  },
  {
    id: "gratitude",
    title: "Gratitude Challenge",
    description:
      "Write down three things you're grateful for each day. Cultivate appreciation and positive focus.",
    duration_days: 7,
    icon: "heart",
  },
  {
    id: "mindfulness",
    title: "Mindfulness Challenge",
    description:
      "Practice 10 minutes of mindful breathing or meditation daily. Build presence and calm.",
    duration_days: 7,
    icon: "brain",
  },
  {
    id: "call-a-friend",
    title: "Call a Friend Challenge",
    description:
      "Reach out to someone you care about each day. Strengthen social bonds through meaningful connection.",
    duration_days: 7,
    icon: "phone",
  },
];

export const MOOD_OPTIONS: {
  value: MoodType;
  emoji: string;
  label: string;
  color: string;
}[] = [
  { value: "happy", emoji: "😀", label: "Happy", color: "bg-emerald-500/20 border-emerald-500/50" },
  { value: "calm", emoji: "🙂", label: "Calm", color: "bg-teal-500/20 border-teal-500/50" },
  { value: "neutral", emoji: "😐", label: "Neutral", color: "bg-slate-500/20 border-slate-500/50" },
  { value: "stressed", emoji: "😟", label: "Stressed", color: "bg-amber-500/20 border-amber-500/50" },
  { value: "sad", emoji: "😢", label: "Sad", color: "bg-rose-500/20 border-rose-500/50" },
];

export const COACH_TOPICS = [
  { id: "loneliness", label: "Loneliness", icon: "users" },
  { id: "stress", label: "Stress", icon: "cloud-rain" },
  { id: "confidence", label: "Confidence", icon: "sparkles" },
  { id: "relationships", label: "Relationships", icon: "heart" },
  { id: "focus", label: "Focus", icon: "target" },
  { id: "digital-addiction", label: "Digital Addiction", icon: "smartphone" },
];
