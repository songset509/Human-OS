export type QuestionFormat = "likert" | "behavioral" | "multiple_choice";

export interface BankQuestion {
  id: number;
  text: string;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  trait: string;
  weight: number;
  format: QuestionFormat;
  reverseScored?: boolean;
  options?: { value: number; label: string; correct?: boolean }[];
}

export interface ConsistencyPair {
  idA: number;
  idB: number;
  /** positive = answers should align; negative = should diverge when reverse-scored */
  polarity: "positive" | "negative";
}

export interface AssessmentBankMeta {
  assessmentId: string;
  scientificBasis: string;
  whyItMatters: string;
  traitDimensions: { id: string; label: string; description: string }[];
}
