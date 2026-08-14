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

const STORAGE_KEY_GAMIFICATION = "nursemate_gamification_v1";

const DEFAULT_STATE: GamificationState = {
  totalXp: 450,
  currentStreak: 4,
  longestStreak: 7,
  lastStudyDate: new Date().toISOString().split("T")[0],
  totalStudyMinutes: 455, // ~7.5 hours
  totalCardsReviewed: 38,
  totalQuestionsAnswered: 42,
  unlockedAchievements: ["first_quiz", "cards_10", "study_1h"],
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

export function getCurrentLevel(xp: number): { current: NursingLevel; next?: NursingLevel; progressPercent: number } {
  const current =
    NURSING_LEVELS.slice().reverse().find((l) => xp >= l.minXp) ?? NURSING_LEVELS[0];
  const next = NURSING_LEVELS.find((l) => l.level === current.level + 1);

  let progressPercent = 100;
  if (next) {
    const range = next.minXp - current.minXp;
    const earned = xp - current.minXp;
    progressPercent = Math.min(100, Math.max(0, Math.round((earned / range) * 100)));
  }

  return { current, next, progressPercent };
}

export function addXpAndRecordActivity(
  xpToAdd: number,
  options?: {
    cardsReviewed?: number;
    questionsAnswered?: number;
    studyMinutes?: number;
  },
): { state: GamificationState; newlyUnlocked: Achievement[] } {
  const state = loadGamification();
  const today = new Date().toISOString().split("T")[0];

  // Streak calculation (prevents duplicate increment on same day)
  if (state.lastStudyDate !== today) {
    const lastDate = new Date(state.lastStudyDate);
    const currDate = new Date(today);
    const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      state.currentStreak += 1;
      state.totalXp += 50; // Streak bonus
    } else if (diffDays > 1) {
      state.currentStreak = 1;
    }
    state.lastStudyDate = today;
    if (state.currentStreak > state.longestStreak) {
      state.longestStreak = state.currentStreak;
    }
  }

  state.totalXp += xpToAdd;
  if (options?.cardsReviewed) state.totalCardsReviewed += options.cardsReviewed;
  if (options?.questionsAnswered) state.totalQuestionsAnswered += options.questionsAnswered;
  if (options?.studyMinutes) state.totalStudyMinutes += options.studyMinutes;

  // Check achievements
  const allAchievements = getAllAchievements(state);
  const newlyUnlocked: Achievement[] = [];

  allAchievements.forEach((ach) => {
    if (ach.progress >= 100 && !state.unlockedAchievements.includes(ach.id)) {
      state.unlockedAchievements.push(ach.id);
      newlyUnlocked.push(ach);
      state.totalXp += 100; // Achievement bonus XP
    }
  });

  saveGamification(state);
  return { state, newlyUnlocked };
}

export function getAllAchievements(state: GamificationState): Achievement[] {
  const isUnlocked = (id: string) => state.unlockedAchievements.includes(id);

  return [
    {
      id: "first_quiz",
      title: "First Step into Clinicals",
      description: "Complete your first practice quiz.",
      icon: "🎯",
      category: "quiz",
      progress: state.totalQuestionsAnswered >= 1 ? 100 : 0,
      unlockedAt: isUnlocked("first_quiz") ? "Completed" : undefined,
    },
    {
      id: "streak_7",
      title: "7-Day Dedication",
      description: "Maintain a continuous 7-day study streak.",
      icon: "🔥",
      category: "streak",
      progress: Math.min(100, Math.round((state.currentStreak / 7) * 100)),
      unlockedAt: isUnlocked("streak_7") ? "Completed" : undefined,
    },
    {
      id: "cards_50",
      title: "Flashcard Enthusiast",
      description: "Review 50 flashcards using spaced repetition.",
      icon: "🃏",
      category: "flashcard",
      progress: Math.min(100, Math.round((state.totalCardsReviewed / 50) * 100)),
      unlockedAt: isUnlocked("cards_50") ? "Completed" : undefined,
    },
    {
      id: "cards_100",
      title: "Memory Master",
      description: "Review 100 flashcards across all nursing topics.",
      icon: "🧠",
      category: "flashcard",
      progress: Math.min(100, Math.round((state.totalCardsReviewed / 100) * 100)),
      unlockedAt: isUnlocked("cards_100") ? "Completed" : undefined,
    },
    {
      id: "questions_100",
      title: "Question Centurion",
      description: "Answer 100 NCLEX and PNLE style questions.",
      icon: "💯",
      category: "quiz",
      progress: Math.min(100, Math.round((state.totalQuestionsAnswered / 100) * 100)),
      unlockedAt: isUnlocked("questions_100") ? "Completed" : undefined,
    },
    {
      id: "study_10h",
      title: "10 Clinical Study Hours",
      description: "Log 600 minutes (10 hours) of focused study sessions.",
      icon: "⏱️",
      category: "timer",
      progress: Math.min(100, Math.round((state.totalStudyMinutes / 600) * 100)),
      unlockedAt: isUnlocked("study_10h") ? "Completed" : undefined,
    },
    {
      id: "cardiac_expert",
      title: "Cardiac Expert",
      description: "Complete Cardiovascular anatomy & Med-Surg cardiac practice.",
      icon: "❤️",
      category: "mastery",
      progress: 85,
      unlockedAt: isUnlocked("cardiac_expert") ? "Completed" : undefined,
    },
  ];
}
