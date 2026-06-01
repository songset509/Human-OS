import type { Assessment, AssessmentQuestion } from "@/types";
import {
  ADVANCED_ASSESSMENTS,
  ADVANCED_QUESTIONS,
  getAdvancedAssessment,
} from "@/lib/assessments/advanced-assessments";

export const ASSESSMENTS: Assessment[] = [
  {
    id: "emotional-intelligence",
    title: "Emotional Intelligence Test",
    description:
      "Discover how well you recognize, understand, and manage your emotions and those of others.",
    question_count: 20,
    category: "emotional_health",
    icon: "heart-pulse",
  },
  {
    id: "self-esteem",
    title: "Self-Esteem Test",
    description:
      "Evaluate your sense of self-worth, confidence, and how you view your capabilities.",
    question_count: 10,
    category: "self_esteem",
    icon: "sparkles",
  },
  {
    id: "loneliness",
    title: "Loneliness Assessment",
    description:
      "Understand your feelings of social connection and identify areas for deeper relationships.",
    question_count: 10,
    category: "social_connection",
    icon: "users",
  },
  {
    id: "resilience",
    title: "Resilience Assessment",
    description:
      "Measure your ability to adapt, recover, and grow through life's challenges.",
    question_count: 10,
    category: "resilience",
    icon: "shield",
  },
  {
    id: "digital-wellness",
    title: "Digital Wellness Assessment",
    description:
      "Evaluate your relationship with technology and its impact on your well-being.",
    question_count: 10,
    category: "digital_wellness",
    icon: "smartphone",
  },
];

export const ASSESSMENT_QUESTIONS: Record<string, AssessmentQuestion[]> = {
  "emotional-intelligence": [
    { id: 1, text: "I can easily identify what emotion I am feeling in the moment." },
    { id: 2, text: "I understand why I react emotionally in certain situations." },
    { id: 3, text: "I can manage my emotions without being overwhelmed by them." },
    { id: 4, text: "I notice emotional cues in others' body language and tone." },
    { id: 5, text: "I empathize with others when they share their feelings." },
    { id: 6, text: "I can calm myself down when I feel angry or frustrated." },
    { id: 7, text: "I express my feelings in healthy, constructive ways." },
    { id: 8, text: "I recognize how my mood affects my decisions." },
    { id: 9, text: "I can read the emotional atmosphere of a group or room." },
    { id: 10, text: "I handle criticism without becoming overly defensive." },
    { id: 11, text: "I am aware of emotional triggers from my past." },
    { id: 12, text: "I can motivate myself through difficult emotions." },
    { id: 13, text: "I listen actively when someone shares their feelings." },
    { id: 14, text: "I adapt my communication based on others' emotional states." },
    { id: 15, text: "I take responsibility for my emotional reactions." },
    { id: 16, text: "I can sit with uncomfortable emotions without avoiding them." },
    { id: 17, text: "I use emotions as useful information for decision-making." },
    { id: 18, text: "I build trust by being emotionally authentic with others." },
    { id: 19, text: "I recover emotionally after setbacks or disappointments." },
    { id: 20, text: "I help others feel understood and validated." },
  ],
  "self-esteem": [
    { id: 1, text: "I feel good about who I am as a person." },
    { id: 2, text: "I believe I deserve respect from others." },
    { id: 3, text: "I am proud of my accomplishments, big and small." },
    { id: 4, text: "I treat myself with kindness when I make mistakes." },
    { id: 5, text: "I feel confident in my ability to handle challenges." },
    { id: 6, text: "I compare myself to others in a healthy way." },
    { id: 7, text: "I speak positively about myself internally." },
    { id: 8, text: "I feel comfortable expressing my opinions." },
    { id: 9, text: "I believe I have valuable qualities to offer the world." },
    { id: 10, text: "I accept myself, including my imperfections." },
  ],
  loneliness: [
    { id: 1, text: "I often feel left out of social activities.", reverseScored: true },
    { id: 2, text: "I have people I can turn to when I need support." },
    { id: 3, text: "I feel disconnected from the people around me.", reverseScored: true },
    { id: 4, text: "I have meaningful conversations regularly." },
    { id: 5, text: "I feel like nobody truly understands me.", reverseScored: true },
    { id: 6, text: "I feel a sense of belonging in my community." },
    { id: 7, text: "I spend too much time feeling alone.", reverseScored: true },
    { id: 8, text: "I have close relationships that nourish me." },
    { id: 9, text: "I wish I had more people to share my life with.", reverseScored: true },
    { id: 10, text: "I feel connected to something larger than myself." },
  ],
  resilience: [
    { id: 1, text: "I bounce back quickly after difficult experiences." },
    { id: 2, text: "I see challenges as opportunities to grow." },
    { id: 3, text: "I maintain hope even during tough times." },
    { id: 4, text: "I have coping strategies that help me manage stress." },
    { id: 5, text: "I learn valuable lessons from my failures." },
    { id: 6, text: "I adapt well when plans change unexpectedly." },
    { id: 7, text: "I can find meaning in difficult experiences." },
    { id: 8, text: "I reach out for support when I need it." },
    { id: 9, text: "I stay focused on what I can control." },
    { id: 10, text: "I believe I can overcome whatever life throws at me." },
  ],
  "digital-wellness": [
    { id: 1, text: "I use technology intentionally rather than habitually." },
    { id: 2, text: "Screen time often interferes with my sleep.", reverseScored: true },
    { id: 3, text: "I take regular breaks from my devices." },
    { id: 4, text: "I feel anxious when I cannot check my phone.", reverseScored: true },
    { id: 5, text: "Technology enhances rather than detracts from my relationships." },
    { id: 6, text: "I scroll social media without realizing how much time has passed.", reverseScored: true },
    { id: 7, text: "I have boundaries around when and where I use devices." },
    { id: 8, text: "Digital distractions make it hard for me to focus.", reverseScored: true },
    { id: 9, text: "I feel refreshed after time away from screens." },
    { id: 10, text: "I compare my life negatively to others on social media.", reverseScored: true },
  ],
};

export const LIKERT_LABELS = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

export function getAssessmentById(id: string): Assessment | undefined {
  return ASSESSMENTS.find((a) => a.id === id) ?? getAdvancedAssessment(id);
}

export function getQuestionsByAssessmentId(id: string): AssessmentQuestion[] {
  return ASSESSMENT_QUESTIONS[id] ?? ADVANCED_QUESTIONS[id] ?? [];
}

export function getAllAssessments(): Assessment[] {
  return [...ASSESSMENTS.map((a) => ({ ...a, tier: "core" as const })), ...ADVANCED_ASSESSMENTS];
}

export function getCoreAssessments(): Assessment[] {
  return ASSESSMENTS.map((a) => ({ ...a, tier: "core" as const }));
}

export function getAdvancedAssessmentsList(): Assessment[] {
  return ADVANCED_ASSESSMENTS;
}
