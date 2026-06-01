/** Progressive assessment schedule — reduces fatigue, builds longitudinal signal */
export const PROGRESSIVE_PHASES = [
  { phase: 1, questionCount: 10, minDaysSinceStart: 0 },
  { phase: 2, questionCount: 5, minDaysSinceStart: 3 },
  { phase: 3, questionCount: 5, minDaysSinceStart: 7 },
  { phase: 4, questionCount: 5, minDaysSinceStart: 14 },
  { phase: 5, questionCount: 5, minDaysSinceStart: 21 },
] as const;

export function getPhaseForDay(daysSinceStart: number): (typeof PROGRESSIVE_PHASES)[number] {
  let current: (typeof PROGRESSIVE_PHASES)[number] = PROGRESSIVE_PHASES[0];
  for (const p of PROGRESSIVE_PHASES) {
    if (daysSinceStart >= p.minDaysSinceStart) current = p;
  }
  return current;
}

export function daysSince(isoDate: string): number {
  const start = new Date(isoDate).getTime();
  return Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
}
