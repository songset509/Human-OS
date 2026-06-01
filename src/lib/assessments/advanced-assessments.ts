import type { Assessment, AssessmentQuestion } from "@/types";

export const ADVANCED_ASSESSMENTS: Assessment[] = [
  {
    id: "big-five",
    title: "Big Five Personality",
    description: "Discover your personality across Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.",
    question_count: 25,
    category: "big_five",
    icon: "brain",
    tier: "advanced",
    questionType: "likert",
  },
  {
    id: "iq-assessment",
    title: "Cognitive Ability Assessment",
    description: "Measure logical reasoning, pattern recognition, numerical, verbal, and spatial ability.",
    question_count: 15,
    category: "iq",
    icon: "zap",
    tier: "advanced",
    questionType: "multiple_choice",
  },
  {
    id: "attention-health",
    title: "Attention Health Assessment",
    description: "Understand your focus, distraction patterns, cognitive overload, and multitasking habits.",
    question_count: 10,
    category: "attention",
    icon: "target",
    tier: "advanced",
    questionType: "likert",
  },
  {
    id: "purpose-meaning",
    title: "Purpose & Meaning Assessment",
    description: "Explore life purpose, values alignment, motivation, and sense of meaning.",
    question_count: 10,
    category: "purpose",
    icon: "compass",
    tier: "advanced",
    questionType: "likert",
  },
  {
    id: "career-alignment",
    title: "Career Alignment Assessment",
    description: "Find career paths aligned with your interests, strengths, and personality.",
    question_count: 10,
    category: "career",
    icon: "briefcase",
    tier: "advanced",
    questionType: "likert",
  },
  {
    id: "relationship-intelligence",
    title: "Relationship Intelligence Assessment",
    description: "Measure communication, trust, vulnerability, and emotional awareness in relationships.",
    question_count: 10,
    category: "relationship",
    icon: "heart-handshake",
    tier: "advanced",
    questionType: "likert",
  },
];

const TRAITS = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"] as const;

function bigFiveQuestions(): AssessmentQuestion[] {
  const texts: Record<string, string[]> = {
    openness: [
      "I enjoy exploring new ideas and perspectives.",
      "I appreciate art, music, and creative expression.",
      "I am curious about how things work.",
      "I enjoy philosophical or abstract discussions.",
      "I seek out novel experiences.",
    ],
    conscientiousness: [
      "I follow through on my commitments.",
      "I keep my living and work spaces organized.",
      "I plan ahead rather than leaving things to chance.",
      "I pay attention to details.",
      "I work hard to achieve my goals.",
    ],
    extraversion: [
      "I feel energized when spending time with others.",
      "I enjoy being the center of attention.",
      "I start conversations easily with strangers.",
      "I prefer active social environments.",
      "I express my opinions confidently in groups.",
    ],
    agreeableness: [
      "I empathize easily with others' feelings.",
      "I prioritize harmony in relationships.",
      "I trust people until given reason not to.",
      "I enjoy helping others succeed.",
      "I avoid being critical of others.",
    ],
    neuroticism: [
      "I often feel anxious or worried.",
      "I get upset easily by small things.",
      "I dwell on negative experiences.",
      "I feel moody or irritable frequently.",
      "I struggle to calm down when stressed.",
    ],
  };

  const questions: AssessmentQuestion[] = [];
  let id = 1;
  for (const trait of TRAITS) {
    for (const text of texts[trait]) {
      questions.push({
        id: id++,
        text,
        trait,
        reverseScored: trait === "neuroticism" ? false : false,
      });
    }
  }
  // Neuroticism: lower agreement = better, reverse score neuroticism items
  return questions.map((q) =>
    q.trait === "neuroticism" ? { ...q, reverseScored: true } : q
  );
}

const IQ_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1, text: "What comes next in the sequence: 2, 4, 8, 16, ?",
    trait: "pattern",
    options: [
      { value: 1, label: "24" },
      { value: 2, label: "32", correct: true },
      { value: 3, label: "20" },
      { value: 4, label: "28" },
    ],
  },
  {
    id: 2, text: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?",
    trait: "logical",
    options: [
      { value: 1, label: "Yes", correct: true },
      { value: 2, label: "No" },
      { value: 3, label: "Cannot determine" },
    ],
  },
  {
    id: 3, text: "A item costs $80 after a 20% discount. What was the original price?",
    trait: "numerical",
    options: [
      { value: 1, label: "$96" },
      { value: 2, label: "$100", correct: true },
      { value: 3, label: "$64" },
      { value: 4, label: "$90" },
    ],
  },
  {
    id: 4, text: "Which word is most opposite to ' ephemeral '?",
    trait: "verbal",
    options: [
      { value: 1, label: "Temporary" },
      { value: 2, label: "Permanent", correct: true },
      { value: 3, label: "Brief" },
      { value: 4, label: "Fleeting" },
    ],
  },
  {
    id: 5, text: "How many cubes are in a 3×3×3 stack?",
    trait: "spatial",
    options: [
      { value: 1, label: "9" },
      { value: 2, label: "27", correct: true },
      { value: 3, label: "18" },
      { value: 4, label: "36" },
    ],
  },
  {
    id: 6, text: "Complete: O, T, T, F, F, S, S, ?",
    trait: "pattern",
    options: [
      { value: 1, label: "E", correct: true },
      { value: 2, label: "N" },
      { value: 3, label: "T" },
      { value: 4, label: "O" },
    ],
  },
  {
    id: 7, text: "If 5 machines make 5 widgets in 5 minutes, how long for 100 machines to make 100 widgets?",
    trait: "logical",
    options: [
      { value: 1, label: "5 minutes", correct: true },
      { value: 2, label: "100 minutes" },
      { value: 3, label: "20 minutes" },
      { value: 4, label: "1 minute" },
    ],
  },
  {
    id: 8, text: "What is 15% of 240?",
    trait: "numerical",
    options: [
      { value: 1, label: "36", correct: true },
      { value: 2, label: "24" },
      { value: 3, label: "48" },
      { value: 4, label: "30" },
    ],
  },
  {
    id: 9, text: "Book is to Reading as Fork is to:",
    trait: "verbal",
    options: [
      { value: 1, label: "Drawing" },
      { value: 2, label: "Eating", correct: true },
      { value: 3, label: "Writing" },
      { value: 4, label: "Cooking" },
    ],
  },
  {
    id: 10, text: "A folded paper square cut diagonally unfolds to show how many triangles?",
    trait: "spatial",
    options: [
      { value: 1, label: "2", correct: true },
      { value: 2, label: "4" },
      { value: 3, label: "1" },
      { value: 4, label: "8" },
    ],
  },
  {
    id: 11, text: "What is the missing number: 3, 6, 11, 18, ?",
    trait: "pattern",
    options: [
      { value: 1, label: "25" },
      { value: 2, label: "27", correct: true },
      { value: 3, label: "24" },
      { value: 4, label: "29" },
    ],
  },
  {
    id: 12, text: "Some A are B. All B are C. Can we conclude some A are C?",
    trait: "logical",
    options: [
      { value: 1, label: "Yes", correct: true },
      { value: 2, label: "No" },
      { value: 3, label: "Only if all A are B" },
    ],
  },
  {
    id: 13, text: "If x + 2x = 45, what is x?",
    trait: "numerical",
    options: [
      { value: 1, label: "15", correct: true },
      { value: 2, label: "22.5" },
      { value: 3, label: "30" },
      { value: 4, label: "20" },
    ],
  },
  {
    id: 14, text: "Which is a synonym for 'pragmatic'?",
    trait: "verbal",
    options: [
      { value: 1, label: "Idealistic" },
      { value: 2, label: "Practical", correct: true },
      { value: 3, label: "Artistic" },
      { value: 4, label: "Theoretical" },
    ],
  },
  {
    id: 15, text: "Which 2D shape has the most sides: hexagon, pentagon, octagon?",
    trait: "spatial",
    options: [
      { value: 1, label: "Hexagon" },
      { value: 2, label: "Pentagon" },
      { value: 3, label: "Octagon", correct: true },
    ],
  },
];

export const ADVANCED_QUESTIONS: Record<string, AssessmentQuestion[]> = {
  "big-five": bigFiveQuestions(),
  "iq-assessment": IQ_QUESTIONS,
  "attention-health": [
    { id: 1, text: "I can sustain focus on important tasks for extended periods.", trait: "focus" },
    { id: 2, text: "I get distracted by notifications and alerts easily.", trait: "distraction", reverseScored: true },
    { id: 3, text: "I feel mentally overloaded by too many inputs at once.", trait: "overload", reverseScored: true },
    { id: 4, text: "I multitask even when it reduces my performance.", trait: "multitasking", reverseScored: true },
    { id: 5, text: "I can return to deep work after interruptions.", trait: "focus" },
    { id: 6, text: "My mind wanders frequently during conversations or meetings.", trait: "distraction", reverseScored: true },
    { id: 7, text: "I take regular breaks to restore mental clarity.", trait: "focus" },
    { id: 8, text: "I feel exhausted from constant context-switching.", trait: "overload", reverseScored: true },
    { id: 9, text: "I single-task when the work truly matters.", trait: "focus" },
    { id: 10, text: "Digital distractions significantly reduce my productivity.", trait: "distraction", reverseScored: true },
  ],
  "purpose-meaning": [
    { id: 1, text: "I have a clear sense of what gives my life meaning." },
    { id: 2, text: "My daily actions align with my core values." },
    { id: 3, text: "I feel motivated by a larger purpose beyond myself." },
    { id: 4, text: "I understand what I want to contribute to the world." },
    { id: 5, text: "I feel my life has direction and intention." },
    { id: 6, text: "I reflect regularly on what truly matters to me." },
    { id: 7, text: "I feel energized by my long-term vision." },
    { id: 8, text: "My work or activities feel meaningful." },
    { id: 9, text: "I can articulate my personal values clearly." },
    { id: 10, text: "I feel connected to something greater than daily routines." },
  ],
  "career-alignment": [
    { id: 1, text: "My current path aligns with my natural interests." },
    { id: 2, text: "I use my strongest abilities in my daily work." },
    { id: 3, text: "My personality fits my professional environment." },
    { id: 4, text: "I feel curious and engaged by my field." },
    { id: 5, text: "I see a clear growth trajectory in my career." },
    { id: 6, text: "My work allows me to express my authentic self." },
    { id: 7, text: "I feel my talents are valued and utilized." },
    { id: 8, text: "I would choose a similar career path again." },
    { id: 9, text: "My career supports my desired lifestyle." },
    { id: 10, text: "I feel a sense of calling in my professional life." },
  ],
  "relationship-intelligence": [
    { id: 1, text: "I communicate my needs clearly and respectfully." },
    { id: 2, text: "I build trust through consistency and honesty." },
    { id: 3, text: "I allow myself to be vulnerable with people I trust." },
    { id: 4, text: "I notice and respond to others' emotional cues." },
    { id: 5, text: "I repair conflicts constructively." },
    { id: 6, text: "I listen to understand, not just to respond." },
    { id: 7, text: "I set healthy boundaries in relationships." },
    { id: 8, text: "I express appreciation regularly to people I care about." },
    { id: 9, text: "I take responsibility for my part in misunderstandings." },
    { id: 10, text: "I invest time in nurturing important relationships." },
  ],
};

export function getAdvancedQuestions(id: string): AssessmentQuestion[] {
  return ADVANCED_QUESTIONS[id] ?? [];
}

export function getAdvancedAssessment(id: string): Assessment | undefined {
  return ADVANCED_ASSESSMENTS.find((a) => a.id === id);
}

export const CAREER_RECOMMENDATIONS: Record<string, string[]> = {
  high_openness: ["Creative Director", "Research Scientist", "Writer", "UX Designer", "Entrepreneur"],
  high_conscientiousness: ["Project Manager", "Surgeon", "Accountant", "Engineer", "Operations Lead"],
  high_extraversion: ["Sales Leader", "Teacher", "Public Speaker", "HR Director", "Event Planner"],
  high_agreeableness: ["Counselor", "Social Worker", "Nurse", "Mediator", "Nonprofit Leader"],
  balanced: ["Product Manager", "Consultant", "Architect", "Data Analyst", "Coach"],
};
