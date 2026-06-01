import type { AssessmentBankMeta } from "./types";

export const ASSESSMENT_BANK_METADATA: Record<string, AssessmentBankMeta> = {
  "emotional-intelligence": {
    assessmentId: "emotional-intelligence",
    scientificBasis:
      "Based on the ability model of emotional intelligence (Mayer & Salovey) and self-report adaptations used in wellbeing research.",
    whyItMatters:
      "Emotional intelligence predicts relationship quality, stress recovery, and leadership effectiveness.",
    traitDimensions: [
      { id: "awareness", label: "Self-Awareness", description: "Recognizing emotions as they occur" },
      { id: "regulation", label: "Self-Regulation", description: "Managing emotional responses constructively" },
      { id: "empathy", label: "Empathy", description: "Understanding others' emotional states" },
      { id: "social_skills", label: "Social Skills", description: "Navigating relationships effectively" },
    ],
  },
  "self-esteem": {
    assessmentId: "self-esteem",
    scientificBasis: "Draws on Rosenberg self-esteem constructs and self-compassion research (Neff).",
    whyItMatters: "Self-esteem buffers against anxiety and supports goal persistence.",
    traitDimensions: [
      { id: "worth", label: "Self-Worth", description: "Core sense of value" },
      { id: "competence", label: "Competence", description: "Belief in capability" },
      { id: "self_compassion", label: "Self-Compassion", description: "Kindness toward self after failure" },
    ],
  },
  loneliness: {
    assessmentId: "loneliness",
    scientificBasis: "Informed by UCLA Loneliness Scale principles and social connection research.",
    whyItMatters: "Loneliness is linked to mortality risk comparable to smoking — connection is vital.",
    traitDimensions: [
      { id: "connection", label: "Connection", description: "Sense of belonging" },
      { id: "support", label: "Support", description: "Available help in need" },
      { id: "depth", label: "Depth", description: "Quality of relationships" },
    ],
  },
  resilience: {
    assessmentId: "resilience",
    scientificBasis: "Aligned with Connor-Davidson resilience concepts and post-traumatic growth literature.",
    whyItMatters: "Resilience predicts recovery from adversity and long-term mental health.",
    traitDimensions: [
      { id: "recovery", label: "Recovery", description: "Speed of bounce-back" },
      { id: "adaptability", label: "Adaptability", description: "Flexibility under change" },
      { id: "persistence", label: "Persistence", description: "Sustained effort through obstacles" },
    ],
  },
  "digital-wellness": {
    assessmentId: "digital-wellness",
    scientificBasis: "Informed by digital wellbeing frameworks and attention restoration theory.",
    whyItMatters: "Digital habits shape sleep, focus, and real-world relationships.",
    traitDimensions: [
      { id: "intention", label: "Intentional Use", description: "Purposeful technology use" },
      { id: "focus", label: "Focus", description: "Ability to concentrate" },
      { id: "balance", label: "Balance", description: "Healthy screen boundaries" },
    ],
  },
  "big-five": {
    assessmentId: "big-five",
    scientificBasis: "Five-Factor Model (Costa & McCrae) — the most validated personality framework in psychology.",
    whyItMatters: "Personality traits predict career fit, relationship patterns, and stress response.",
    traitDimensions: [
      { id: "openness", label: "Openness", description: "Curiosity and openness to experience" },
      { id: "conscientiousness", label: "Conscientiousness", description: "Organization and dependability" },
      { id: "extraversion", label: "Extraversion", description: "Social energy and assertiveness" },
      { id: "agreeableness", label: "Agreeableness", description: "Cooperation and trust" },
      { id: "neuroticism", label: "Emotional Stability", description: "Stress reactivity (inverted)" },
    ],
  },
  "iq-assessment": {
    assessmentId: "iq-assessment",
    scientificBasis: "Cognitive item formats inspired by matrix reasoning and working memory tasks (educational use only — not clinical IQ).",
    whyItMatters: "Cognitive skills support learning agility and problem-solving.",
    traitDimensions: [
      { id: "verbal", label: "Verbal Reasoning", description: "Language-based problem solving" },
      { id: "logical", label: "Logical Reasoning", description: "Pattern and sequence detection" },
      { id: "spatial", label: "Spatial Reasoning", description: "Visual-spatial manipulation" },
    ],
  },
  "attention-health": {
    assessmentId: "attention-health",
    scientificBasis: "Based on attention control theory and digital distraction research.",
    whyItMatters: "Attention is the gateway to learning, productivity, and mindful living.",
    traitDimensions: [
      { id: "focus", label: "Sustained Focus", description: "Deep work capacity" },
      { id: "distraction", label: "Distraction Resistance", description: "Managing interruptions" },
      { id: "overload", label: "Cognitive Load", description: "Mental overwhelm levels" },
    ],
  },
  "purpose-meaning": {
    assessmentId: "purpose-meaning",
    scientificBasis: "Purpose in Life Test (PIL) and Meaning in Life Questionnaire constructs.",
    whyItMatters: "Purpose predicts longevity, resilience, and life satisfaction.",
    traitDimensions: [
      { id: "alignment", label: "Alignment", description: "Actions match values" },
      { id: "direction", label: "Direction", description: "Sense of life path" },
      { id: "contribution", label: "Contribution", description: "Impact beyond self" },
    ],
  },
  "career-alignment": {
    assessmentId: "career-alignment",
    scientificBasis: "Holland RIASEC-inspired fit and values-based career assessment principles.",
    whyItMatters: "Career alignment reduces burnout and increases engagement.",
    traitDimensions: [
      { id: "strengths", label: "Strengths Use", description: "Leveraging natural talents" },
      { id: "values", label: "Values Fit", description: "Alignment with culture/mission" },
      { id: "growth", label: "Growth Path", description: "Perceived career trajectory" },
    ],
  },
  "relationship-intelligence": {
    assessmentId: "relationship-intelligence",
    scientificBasis: "Gottman communication principles and attachment-informed relationship skills.",
    whyItMatters: "Relationship quality is the strongest predictor of long-term happiness.",
    traitDimensions: [
      { id: "listening", label: "Active Listening", description: "Presence in conversation" },
      { id: "repair", label: "Conflict Repair", description: "Recovering after disagreement" },
      { id: "boundaries", label: "Boundaries", description: "Healthy limits" },
    ],
  },
};
