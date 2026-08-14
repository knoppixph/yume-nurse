import type { Difficulty, QuestionType, QuizQuestion } from "@/types/study";

export type QuizConfig = {
  subjectId: string;
  topicId: string;
  difficulty: "Mixed" | Difficulty;
  questionCount: number;
  questionType: "all" | QuestionType;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  isTimed: boolean;
  timeLimitSeconds: number; // e.g. 60s per question or total
};

export type QuizAttemptResult = {
  id: string;
  timestamp: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  timeSpentSeconds: number;
  subjectId: string;
  mistakes: QuizQuestion[];
  weakTopics: string[];
  strongTopics: string[];
};

export type MistakeRecord = {
  questionId: string;
  question: QuizQuestion;
  missCount: number;
  lastMissedAt: string;
};

const STORAGE_KEY_ATTEMPTS = "nursemate_quiz_attempts_v1";
const STORAGE_KEY_MISTAKES = "nursemate_mistake_bank_v1";

/**
 * Fisher-Yates Shuffle algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildQuizQuestions(
  allQuestions: QuizQuestion[],
  config: QuizConfig,
): QuizQuestion[] {
  let list = allQuestions.filter((q) => {
    const matchesSubject = config.subjectId === "all" || q.subjectId === config.subjectId;
    const matchesTopic = config.topicId === "all" || q.topicId === config.topicId;
    const matchesDifficulty = config.difficulty === "Mixed" || q.difficulty === config.difficulty;
    const matchesType = config.questionType === "all" || q.type === config.questionType;

    return matchesSubject && matchesTopic && matchesDifficulty && matchesType;
  });

  if (config.randomizeQuestions) {
    list = shuffleArray(list);
  }

  list = list.slice(0, config.questionCount);

  if (config.randomizeAnswers) {
    list = list.map((q) => {
      // Only shuffle options for Multiple Choice, True/False (keep T/F order or shuffle), SATA, Prioritization
      if (q.options && q.options.length > 0 && q.type !== "True/False") {
        return {
          ...q,
          options: shuffleArray(q.options),
        };
      }
      return q;
    });
  }

  return list;
}

export function saveQuizAttempt(result: QuizAttemptResult): void {
  if (typeof window === "undefined") return;
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
    const existing: QuizAttemptResult[] = existingRaw ? JSON.parse(existingRaw) : [];
    existing.unshift(result);
    localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(existing.slice(0, 50)));

    // Record mistakes in Mistake Bank
    recordMistakes(result.mistakes);
  } catch {
    // ignore
  }
}

export function loadQuizAttempts(): QuizAttemptResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordMistakes(mistakes: QuizQuestion[]): void {
  if (typeof window === "undefined" || !mistakes.length) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MISTAKES);
    const bank: Record<string, MistakeRecord> = raw ? JSON.parse(raw) : {};

    const now = new Date().toISOString();
    mistakes.forEach((q) => {
      if (bank[q.id]) {
        bank[q.id].missCount += 1;
        bank[q.id].lastMissedAt = now;
        bank[q.id].question = q;
      } else {
        bank[q.id] = {
          questionId: q.id,
          question: q,
          missCount: 1,
          lastMissedAt: now,
        };
      }
    });

    localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(bank));
  } catch {
    // ignore
  }
}

export function clearCorrectedMistake(questionId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MISTAKES);
    if (!raw) return;
    const bank: Record<string, MistakeRecord> = JSON.parse(raw);
    if (bank[questionId]) {
      if (bank[questionId].missCount > 1) {
        bank[questionId].missCount -= 1;
      } else {
        delete bank[questionId];
      }
      localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(bank));
    }
  } catch {
    // ignore
  }
}

export function loadMistakeBankQuestions(): QuizQuestion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MISTAKES);
    if (!raw) return [];
    const bank: Record<string, MistakeRecord> = JSON.parse(raw);
    return Object.values(bank)
      .sort((a, b) => b.missCount - a.missCount)
      .map((r) => r.question);
  } catch {
    return [];
  }
}
