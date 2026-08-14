export type ReviewGrade = "Again" | "Hard" | "Good" | "Easy";

export type CardProgress = {
  cardId: string;
  repetitions: number;
  intervalDays: number;
  easeFactor: number; // typically 1.3 to 2.5
  lastReviewedAt: string;
  nextReviewAt: string;
  masteryScore: number; // 0 - 100
  favorite?: boolean;
};

const STORAGE_KEY_PROGRESS = "nursemate_flashcard_progress_v1";
const STORAGE_KEY_FAVORITES = "nursemate_flashcard_favorites_v1";

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 */
export function calculateSM2(
  current: CardProgress | undefined,
  grade: ReviewGrade,
): CardProgress {
  const now = new Date();
  let repetitions = current?.repetitions ?? 0;
  let intervalDays = current?.intervalDays ?? 1;
  let easeFactor = current?.easeFactor ?? DEFAULT_EASE_FACTOR;
  let masteryScore = current?.masteryScore ?? 50;

  // Grade to SM-2 quality (0 to 5)
  const qualityMap: Record<ReviewGrade, number> = {
    Again: 1, // Complete blackout / incorrect
    Hard: 3,  // Correct response with significant difficulty
    Good: 4,  // Correct response with hesitation
    Easy: 5,  // Perfect, effortless recall
  };

  const quality = qualityMap[grade];

  // Adjust ease factor based on response quality
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < MIN_EASE_FACTOR) {
    easeFactor = MIN_EASE_FACTOR;
  }

  // Calculate new interval and repetitions
  if (quality < 3) {
    // Again / failed
    repetitions = 0;
    intervalDays = 1;
    masteryScore = Math.max(10, masteryScore - 20);
  } else {
    // Successful recall
    if (repetitions === 0) {
      intervalDays = grade === "Hard" ? 1 : 1;
    } else if (repetitions === 1) {
      intervalDays = grade === "Hard" ? 3 : grade === "Good" ? 6 : 8;
    } else {
      const multiplier = grade === "Hard" ? 1.2 : grade === "Easy" ? easeFactor * 1.3 : easeFactor;
      intervalDays = Math.max(intervalDays + 1, Math.round(intervalDays * multiplier));
    }
    repetitions += 1;

    const masteryBonus = grade === "Easy" ? 18 : grade === "Good" ? 12 : 6;
    masteryScore = Math.min(100, masteryScore + masteryBonus);
  }

  const nextReviewDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    cardId: current?.cardId ?? "",
    repetitions,
    intervalDays,
    easeFactor: Math.round(easeFactor * 100) / 100,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: nextReviewDate.toISOString(),
    masteryScore,
    favorite: current?.favorite ?? false,
  };
}

export function loadAllProgress(): Record<string, CardProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCardProgress(progress: CardProgress): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadAllProgress();
    all[progress.cardId] = progress;
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(all));
  } catch {
    // ignore quota errors
  }
}

export function loadFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function toggleFavoriteStorage(cardId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const favs = loadFavorites();
    const isFav = favs.has(cardId);
    if (isFav) {
      favs.delete(cardId);
    } else {
      favs.add(cardId);
    }
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(Array.from(favs)));
    return !isFav;
  } catch {
    return false;
  }
}

export function isCardDue(progress?: CardProgress): boolean {
  if (!progress || !progress.nextReviewAt) return true;
  const now = new Date().getTime();
  const next = new Date(progress.nextReviewAt).getTime();
  return now >= next;
}

export function formatDueTime(progress?: CardProgress): string {
  if (!progress || !progress.nextReviewAt) return "Due now";
  const now = new Date().getTime();
  const next = new Date(progress.nextReviewAt).getTime();
  const diffHours = (next - now) / (1000 * 60 * 60);

  if (diffHours <= 0) return "Due now";
  if (diffHours < 24) return "Due today";
  if (diffHours < 48) return "Tomorrow";
  const days = Math.round(diffHours / 24);
  return `In ${days} days`;
}
