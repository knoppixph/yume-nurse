export type NursingLevel = {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  badge: string;
};

export const NURSING_LEVELS: NursingLevel[] = [
  { level: 1, title: "Nursing Student", minXp: 0, maxXp: 250, badge: "🌱" },
  { level: 2, title: "Study Buddy", minXp: 250, maxXp: 750, badge: "📚" },
  { level: 3, title: "Future Nurse", minXp: 750, maxXp: 1800, badge: "🩺" },
  { level: 4, title: "Clinical Ready", minXp: 1800, maxXp: 3500, badge: "⭐" },
  { level: 5, title: "Nursing Pro", minXp: 3500, maxXp: 10000, badge: "🏆" },
];

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "quiz" | "flashcard" | "streak" | "timer" | "mastery";
  unlockedAt?: string;
  progress: number; // 0 to 100
};

export type GamificationState = {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
  totalStudyMinutes: number;
  totalCardsReviewed: number;
  totalQuestionsAnswered: number;
  unlockedAchievements: string[];
};

const STORAGE_KEY_GAMIFICATION = "yumenurse_gamification_v2";

const DEFAULT_STATE: GamificationState = {
  totalXp: 0,
  currentStreak: 1,
  longestStreak: 1,
  lastStudyDate: new Date().toISOString().split("T")[0],
  totalStudyMinutes: 0,
  totalCardsReviewed: 0,
  totalQuestionsAnswered: 0,
  unlockedAchievements: [],
};

export function loadGamification(): GamificationState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GAMIFICATION);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveGamification(state: GamificationState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_GAMIFICATION, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function addXp(amount: number, reason?: string): GamificationState {
  const current = loadGamification();
  const updated = {
    ...current,
    totalXp: current.totalXp + amount,
  };
  saveGamification(updated);
  return updated;
}

export function addXpAndRecordActivity(
  xpAmount: number,
  metadata?: {
    studyMinutes?: number;
    cardsReviewed?: number;
    questionsAnswered?: number;
  },
): { newlyUnlocked: string[]; updated: GamificationState } {
  const current = loadGamification();
  const today = new Date().toISOString().split("T")[0];

  let newStreak = current.currentStreak;
  if (current.lastStudyDate !== today) {
    const lastDate = new Date(current.lastStudyDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  const newStudyMinutes = current.totalStudyMinutes + (metadata?.studyMinutes ?? 0);
  const newCards = current.totalCardsReviewed + (metadata?.cardsReviewed ?? 0);
  const newQuestions = current.totalQuestionsAnswered + (metadata?.questionsAnswered ?? 0);
  const newXp = current.totalXp + xpAmount;

  const newlyUnlocked: string[] = [];
  const achievements = [...current.unlockedAchievements];

  function checkUnlock(id: string, condition: boolean) {
    if (condition && !achievements.includes(id)) {
      achievements.push(id);
      newlyUnlocked.push(id);
    }
  }

  checkUnlock("first_quiz", newQuestions >= 1);
  checkUnlock("questions_50", newQuestions >= 50);
  checkUnlock("cards_10", newCards >= 10);
  checkUnlock("cards_50", newCards >= 50);
  checkUnlock("study_1h", newStudyMinutes >= 60);
  checkUnlock("streak_7", newStreak >= 7);

  const updated: GamificationState = {
    ...current,
    totalXp: newXp,
    totalStudyMinutes: newStudyMinutes,
    totalCardsReviewed: newCards,
    totalQuestionsAnswered: newQuestions,
    currentStreak: newStreak,
    longestStreak: Math.max(current.longestStreak, newStreak),
    lastStudyDate: today,
    unlockedAchievements: achievements,
  };

  saveGamification(updated);
  return { newlyUnlocked, updated };
}

export function recordStudySession(minutes: number): GamificationState {
  const { updated } = addXpAndRecordActivity(Math.round(minutes * 2), {
    studyMinutes: minutes,
  });
  return updated;
}

export function recordQuizCompletion(scorePercent: number, questionCount: number): GamificationState {
  const earnedXp = Math.round(questionCount * 10 * (scorePercent / 100));
  const { updated } = addXpAndRecordActivity(earnedXp, {
    questionsAnswered: questionCount,
  });
  return updated;
}

export function recordFlashcardReviewed(): GamificationState {
  const { updated } = addXpAndRecordActivity(5, {
    cardsReviewed: 1,
  });
  return updated;
}

export function getCurrentLevel(xp: number): {
  current: NursingLevel;
  next: NursingLevel | null;
  progressPercent: number;
} {
  const current =
    [...NURSING_LEVELS].reverse().find((lvl) => xp >= lvl.minXp) ?? NURSING_LEVELS[0];

  const currentIndex = NURSING_LEVELS.findIndex((lvl) => lvl.level === current.level);
  const next = NURSING_LEVELS[currentIndex + 1] ?? null;

  let progressPercent = 100;
  if (next) {
    const range = next.minXp - current.minXp;
    const gained = xp - current.minXp;
    progressPercent = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));
  }

  return { current, next, progressPercent };
}

export const BASE_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_quiz",
    title: "First Clinical Step",
    description: "Complete your first nursing practice quiz.",
    icon: "🎯",
    category: "quiz",
    progress: 0,
  },
  {
    id: "perfect_quiz",
    title: "Clinical Excellence",
    description: "Score 100% on any practice quiz.",
    icon: "💯",
    category: "quiz",
    progress: 0,
  },
  {
    id: "cards_10",
    title: "Active Recall Beginner",
    description: "Review 10 flashcards using spaced repetition.",
    icon: "🎴",
    category: "flashcard",
    progress: 0,
  },
  {
    id: "cards_50",
    title: "Memory Master",
    description: "Review 50 flashcards across all nursing topics.",
    icon: "🧠",
    category: "flashcard",
    progress: 0,
  },
  {
    id: "streak_7",
    title: "Dedication Habit",
    description: "Maintain a 7-day continuous study streak.",
    icon: "🔥",
    category: "streak",
    progress: 0,
  },
  {
    id: "study_1h",
    title: "Deep Focus",
    description: "Log at least 60 minutes with the Pomodoro study timer.",
    icon: "⏳",
    category: "timer",
    progress: 0,
  },
  {
    id: "pharma_master",
    title: "Pharmacology Whiz",
    description: "Master high-alert PINCH medications and antidotes.",
    icon: "💊",
    category: "mastery",
    progress: 0,
  },
  {
    id: "chn_pro",
    title: "Public Health Champion",
    description: "Complete the Philippine Community Health Nursing curriculum.",
    icon: "🇵🇭",
    category: "mastery",
    progress: 0,
  },
];

export function getAllAchievements(state?: GamificationState): Achievement[] {
  const g = state ?? loadGamification();

  return BASE_ACHIEVEMENTS.map((ach) => {
    const isUnlocked = g.unlockedAchievements.includes(ach.id);
    let progress = isUnlocked ? 100 : 0;

    if (!isUnlocked) {
      switch (ach.id) {
        case "first_quiz":
          progress = g.totalQuestionsAnswered >= 1 ? 100 : 0;
          break;
        case "questions_50":
          progress = Math.min(100, Math.round((g.totalQuestionsAnswered / 50) * 100));
          break;
        case "cards_10":
          progress = Math.min(100, Math.round((g.totalCardsReviewed / 10) * 100));
          break;
        case "cards_50":
          progress = Math.min(100, Math.round((g.totalCardsReviewed / 50) * 100));
          break;
        case "study_1h":
          progress = Math.min(100, Math.round((g.totalStudyMinutes / 60) * 100));
          break;
        case "streak_7":
          progress = Math.min(100, Math.round((g.currentStreak / 7) * 100));
          break;
      }
    }

    return {
      ...ach,
      progress,
      unlockedAt: isUnlocked ? "Unlocked" : undefined,
    };
  });
}
