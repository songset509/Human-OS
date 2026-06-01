/** DistilBERT placeholder — keyword + lexicon sentiment until ML service is deployed */

const STRESS_WORDS = ["stress", "anxious", "overwhelm", "tired", "burnout", "worry", "panic", "exhaust"];
const MOTIVATION_WORDS = ["goal", "excited", "progress", "achieve", "motivated", "energy", "commit"];
const OPTIMISM_WORDS = ["grateful", "hope", "better", "growth", "opportunity", "positive", "thank"];
const NEGATIVE_WORDS = ["fail", "hate", "never", "worthless", "alone", "hopeless"];

function countMatches(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  return words.reduce((n, w) => (lower.includes(w) ? n + 1 : n), 0);
}

export interface JournalSentiment {
  sentiment: "positive" | "neutral" | "negative";
  stress: number;
  motivation: number;
  optimism: number;
  summary: string;
}

export function analyzeJournalText(text: string): JournalSentiment {
  if (!text.trim()) {
    return {
      sentiment: "neutral",
      stress: 0.5,
      motivation: 0.5,
      optimism: 0.5,
      summary: "No journal content to analyze.",
    };
  }

  const stress = Math.min(1, countMatches(text, STRESS_WORDS) / 4);
  const motivation = Math.min(1, countMatches(text, MOTIVATION_WORDS) / 3);
  const optimism = Math.min(1, countMatches(text, OPTIMISM_WORDS) / 3);
  const negative = countMatches(text, NEGATIVE_WORDS);

  const sentiment =
    negative >= 2 || stress > 0.6
      ? "negative"
      : optimism > 0.4 || motivation > 0.4
        ? "positive"
        : "neutral";

  const summary =
    sentiment === "negative"
      ? "Journal reflects elevated stress — consider recovery practices."
      : sentiment === "positive"
        ? "Journal reflects constructive motivation and optimism."
        : "Journal tone is balanced — continue reflective practice.";

  return { sentiment, stress, motivation, optimism, summary };
}

export function analyzeJournalCorpus(entries: string[]): JournalSentiment {
  if (entries.length === 0) {
    return analyzeJournalText("");
  }
  const combined = entries.join(" ");
  return analyzeJournalText(combined);
}
