import type { ExperienceLevels } from "@/types";

// 15개 카테고리별 경력 레벨 배수 (BLS OEWS + MWE 연구 기반, mid = 1.0x)
const CATEGORY_EXPERIENCE_DEFAULTS: Record<string, ExperienceLevels> = {
  Tech: {
    entry: { multiplier: 0.70, yearsRange: "0-2 years" },
    mid: { multiplier: 1.00, yearsRange: "3-7 years" },
    senior: { multiplier: 1.40, yearsRange: "8+ years" },
  },
  Healthcare: {
    entry: { multiplier: 0.78, yearsRange: "0-3 years" },
    mid: { multiplier: 1.00, yearsRange: "4-8 years" },
    senior: { multiplier: 1.22, yearsRange: "9+ years" },
  },
  Finance: {
    entry: { multiplier: 0.72, yearsRange: "0-2 years" },
    mid: { multiplier: 1.00, yearsRange: "3-7 years" },
    senior: { multiplier: 1.45, yearsRange: "8+ years" },
  },
  Business: {
    entry: { multiplier: 0.72, yearsRange: "0-2 years" },
    mid: { multiplier: 1.00, yearsRange: "3-7 years" },
    senior: { multiplier: 1.45, yearsRange: "8+ years" },
  },
  Engineering: {
    entry: { multiplier: 0.75, yearsRange: "0-3 years" },
    mid: { multiplier: 1.00, yearsRange: "4-8 years" },
    senior: { multiplier: 1.30, yearsRange: "9+ years" },
  },
  Legal: {
    entry: { multiplier: 0.68, yearsRange: "0-3 years" },
    mid: { multiplier: 1.00, yearsRange: "4-8 years" },
    senior: { multiplier: 1.50, yearsRange: "9+ years" },
  },
  Design: {
    entry: { multiplier: 0.68, yearsRange: "0-2 years" },
    mid: { multiplier: 1.00, yearsRange: "3-7 years" },
    senior: { multiplier: 1.50, yearsRange: "8+ years" },
  },
  Science: {
    entry: { multiplier: 0.75, yearsRange: "0-3 years" },
    mid: { multiplier: 1.00, yearsRange: "4-8 years" },
    senior: { multiplier: 1.30, yearsRange: "9+ years" },
  },
  Education: {
    entry: { multiplier: 0.82, yearsRange: "0-3 years" },
    mid: { multiplier: 1.00, yearsRange: "4-10 years" },
    senior: { multiplier: 1.20, yearsRange: "11+ years" },
  },
  Media: {
    entry: { multiplier: 0.70, yearsRange: "0-2 years" },
    mid: { multiplier: 1.00, yearsRange: "3-7 years" },
    senior: { multiplier: 1.40, yearsRange: "8+ years" },
  },
  Service: {
    entry: { multiplier: 0.80, yearsRange: "0-2 years" },
    mid: { multiplier: 1.00, yearsRange: "3-6 years" },
    senior: { multiplier: 1.25, yearsRange: "7+ years" },
  },
  "Public Service": {
    entry: { multiplier: 0.80, yearsRange: "0-3 years" },
    mid: { multiplier: 1.00, yearsRange: "4-10 years" },
    senior: { multiplier: 1.25, yearsRange: "11+ years" },
  },
  Trades: {
    entry: { multiplier: 0.75, yearsRange: "0-3 years" },
    mid: { multiplier: 1.00, yearsRange: "4-8 years" },
    senior: { multiplier: 1.30, yearsRange: "9+ years" },
  },
  Transportation: {
    entry: { multiplier: 0.78, yearsRange: "0-3 years" },
    mid: { multiplier: 1.00, yearsRange: "4-10 years" },
    senior: { multiplier: 1.25, yearsRange: "11+ years" },
  },
  Agriculture: {
    entry: { multiplier: 0.78, yearsRange: "0-3 years" },
    mid: { multiplier: 1.00, yearsRange: "4-8 years" },
    senior: { multiplier: 1.25, yearsRange: "9+ years" },
  },
};

// 폴백 기본값
const FALLBACK_DEFAULTS: ExperienceLevels = {
  entry: { multiplier: 0.75, yearsRange: "0-3 years" },
  mid: { multiplier: 1.00, yearsRange: "4-8 years" },
  senior: { multiplier: 1.30, yearsRange: "9+ years" },
};

export function getCategoryExperienceDefaults(category: string): ExperienceLevels {
  return CATEGORY_EXPERIENCE_DEFAULTS[category] || FALLBACK_DEFAULTS;
}
