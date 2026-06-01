import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return Math.round(score).toString();
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-teal-400";
  if (score >= 40) return "text-amber-400";
  return "text-rose-400";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Flourishing";
  if (score >= 60) return "Growing";
  if (score >= 40) return "Developing";
  return "Needs Care";
}
