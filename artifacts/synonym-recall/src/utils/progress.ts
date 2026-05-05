const STORAGE_KEY = "synonym-recall-progress-v1";

export interface CardProgress {
  cardId: string;
  attempts: number;
  correctAttempts: number;
  wrongAttempts: number;
  lastResult: "correct" | "incorrect" | null;
  masteryScore: number;
  lastReviewedAt: string | null;
}

export type ProgressStore = Record<string, CardProgress>;

export function loadProgress(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressStore) : {};
  } catch {
    return {};
  }
}

export function saveProgress(store: ProgressStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function recordAnswer(
  store: ProgressStore,
  cardId: string,
  correct: boolean
): ProgressStore {
  const existing: CardProgress = store[cardId] ?? {
    cardId,
    attempts: 0,
    correctAttempts: 0,
    wrongAttempts: 0,
    lastResult: null,
    masteryScore: 0,
    lastReviewedAt: null,
  };

  const updated: CardProgress = {
    ...existing,
    attempts: existing.attempts + 1,
    correctAttempts: existing.correctAttempts + (correct ? 1 : 0),
    wrongAttempts: existing.wrongAttempts + (correct ? 0 : 1),
    lastResult: correct ? "correct" : "incorrect",
    masteryScore: correct
      ? Math.min(5, existing.masteryScore + 1)
      : Math.max(0, existing.masteryScore - 1),
    lastReviewedAt: new Date().toISOString(),
  };

  return { ...store, [cardId]: updated };
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isMastered(p: CardProgress): boolean {
  return p.attempts > 0 && p.masteryScore >= 4;
}

export function isWeak(p: CardProgress): boolean {
  return p.attempts > 0 && p.masteryScore <= 2;
}

export function masteryLabel(score: number): string {
  if (score >= 4) return "Mastered";
  if (score === 3) return "Good";
  if (score === 2) return "Learning";
  if (score === 1) return "Weak";
  return "New";
}

export function masteryColor(score: number): string {
  if (score >= 4) return "text-green-600";
  if (score === 3) return "text-blue-500";
  if (score === 2) return "text-yellow-500";
  if (score === 1) return "text-orange-500";
  return "text-gray-400";
}

export function masteryBg(score: number): string {
  if (score >= 4) return "bg-green-100 text-green-700";
  if (score === 3) return "bg-blue-100 text-blue-700";
  if (score === 2) return "bg-yellow-100 text-yellow-700";
  if (score === 1) return "bg-orange-100 text-orange-700";
  return "bg-gray-100 text-gray-500";
}
