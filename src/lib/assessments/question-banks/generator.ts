import type { BankQuestion, ConsistencyPair } from "./types";

/** Deterministic seeded shuffle for reproducible per-user draws */
export function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function expandLikertPool(
  assessmentId: string,
  stems: { text: string; trait: string; category: string; reverseScored?: boolean; behavioral?: string }[],
  targetSize: number
): { questions: BankQuestion[]; pairs: ConsistencyPair[] } {
  const questions: BankQuestion[] = [];
  const pairs: ConsistencyPair[] = [];
  let id = 1;

  for (const stem of stems) {
    questions.push({
      id: id++,
      text: stem.text,
      category: stem.category,
      difficulty: 2,
      trait: stem.trait,
      weight: 1,
      format: "likert",
      reverseScored: stem.reverseScored,
    });
    if (stem.behavioral) {
      questions.push({
        id: id++,
        text: stem.behavioral,
        category: stem.category,
        difficulty: 2,
        trait: stem.trait,
        weight: 1.2,
        format: "behavioral",
      });
    }
  }

  const modifiers = [
    "In the past two weeks, ",
    "Compared to last month, ",
    "When reflecting on a typical week, ",
    "In high-pressure situations, ",
    "With close friends or family, ",
  ];

  const baseLen = questions.length;
  let modIdx = 0;
  while (questions.length < targetSize) {
    const src = stems[(questions.length - baseLen) % stems.length];
    const prefix = modifiers[modIdx % modifiers.length];
    modIdx++;
    const qid = id++;
    questions.push({
      id: qid,
      text: `${prefix}${src.text.charAt(0).toLowerCase()}${src.text.slice(1)}`,
      category: src.category,
      difficulty: (2 + (modIdx % 3)) as 1 | 2 | 3 | 4 | 5,
      trait: src.trait,
      weight: 0.9,
      format: "likert",
      reverseScored: src.reverseScored,
    });
  }

  // Consistency pairs: opposite stems on same trait
  const byTrait = new Map<string, number[]>();
  for (const q of questions.filter((q) => q.format === "likert").slice(0, 80)) {
    if (!byTrait.has(q.trait)) byTrait.set(q.trait, []);
    byTrait.get(q.trait)!.push(q.id);
  }
  for (const ids of byTrait.values()) {
    if (ids.length >= 2) {
      pairs.push({ idA: ids[0], idB: ids[1], polarity: "positive" });
      if (ids.length >= 4) {
        const rev = questions.find((q) => q.id === ids[2] && q.reverseScored);
        const norm = questions.find((q) => q.id === ids[3] && !q.reverseScored);
        if (rev && norm) pairs.push({ idA: rev.id, idB: norm.id, polarity: "negative" });
      }
    }
  }

  return { questions, pairs };
}

export function selectQuestions(
  pool: BankQuestion[],
  count: number,
  seed: string,
  excludeIds: number[] = []
): BankQuestion[] {
  const rng = seededRandom(seed);
  const available = pool.filter((q) => !excludeIds.includes(q.id));
  const shuffled = [...available].sort(() => rng() - 0.5);

  // Stratify by trait where possible
  const byTrait = new Map<string, BankQuestion[]>();
  for (const q of shuffled) {
    if (!byTrait.has(q.trait)) byTrait.set(q.trait, []);
    byTrait.get(q.trait)!.push(q);
  }

  const selected: BankQuestion[] = [];
  const traits = [...byTrait.keys()];
  let ti = 0;
  while (selected.length < count && selected.length < shuffled.length) {
    const trait = traits[ti % traits.length];
    const list = byTrait.get(trait)!;
    const pick = list.shift();
    if (pick && !selected.find((s) => s.id === pick.id)) selected.push(pick);
    ti++;
    if (ti > count * traits.length * 2) break;
  }

  for (const q of shuffled) {
    if (selected.length >= count) break;
    if (!selected.find((s) => s.id === q.id)) selected.push(q);
  }

  return selected.slice(0, count);
}
