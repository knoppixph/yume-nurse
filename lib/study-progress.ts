import { flashcards, quizQuestions, subjects } from "@/lib/study-data";
import type { StudyStat } from "@/types/study";

export const weeklyActivity = [
  { day: "Mon", questions: 0, minutes: 0 },
  { day: "Tue", questions: 0, minutes: 0 },
  { day: "Wed", questions: 0, minutes: 0 },
  { day: "Thu", questions: 0, minutes: 0 },
  { day: "Fri", questions: 0, minutes: 0 },
  { day: "Sat", questions: 0, minutes: 0 },
  { day: "Sun", questions: 0, minutes: 0 },
];

export function dashboardGoal() {
  return {
    label: "Complete 20 review questions",
    done: 0,
    total: 20,
  };
}

export function nextReviewCards() {
  // Return the first 6 flashcards as the starting review queue (no mastery gating yet)
  return flashcards.slice(0, 6);
}

export function progressSummary() {
  const topicCount = subjects.flatMap((subject) => subject.topics).length;

  return {
    averageMastery: 0,   // Always 0 until user studies
    dueCards: flashcards.length > 0 ? 6 : 0,
    weakTopics: [],
    totalSubjects: subjects.length,
    totalTopics: topicCount,
    totalFlashcards: flashcards.length,
    totalQuestions: quizQuestions.length,
  };
}
