import { flashcards, quizQuestions, subjects, weakTopics } from "@/lib/study-data";
import type { StudyStat } from "@/types/study";

export const studyStats: StudyStat[] = [
  {
    label: "Current streak",
    value: "4 days",
    detail: "One meaningful session today keeps it alive.",
  },
  {
    label: "Study time",
    value: "7h 35m",
    detail: "Across quizzes, flashcards, and review.",
  },
  {
    label: "Questions answered",
    value: "128",
    detail: `${quizQuestions.length} sample questions available now.`,
  },
  {
    label: "Average score",
    value: "78%",
    detail: "Local MVP estimate from practice history.",
  },
  {
    label: "Flashcards mastered",
    value: `${flashcards.filter((card) => card.mastery >= 75).length}`,
    detail: `${flashcards.length} starter cards in the deck.`,
  },
  {
    label: "Overall progress",
    value: `${Math.round(
      subjects.flatMap((subject) => subject.topics).reduce((sum, topic) => sum + topic.mastery, 0) /
        subjects.flatMap((subject) => subject.topics).length,
    )}%`,
    detail: "Calculated from starter topic mastery.",
  },
];

export const weeklyActivity = [
  { day: "Mon", questions: 18, minutes: 42 },
  { day: "Tue", questions: 12, minutes: 25 },
  { day: "Wed", questions: 24, minutes: 56 },
  { day: "Thu", questions: 20, minutes: 44 },
  { day: "Fri", questions: 14, minutes: 31 },
  { day: "Sat", questions: 28, minutes: 63 },
  { day: "Sun", questions: 12, minutes: 28 },
];

export function dashboardGoal() {
  return {
    label: "Complete 20 review questions",
    done: 12,
    total: 20,
  };
}

export function nextReviewCards() {
  return flashcards
    .filter((card) => card.due === "Due now" || card.due === "Today")
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 6);
}

export function progressSummary() {
  const topicCount = subjects.flatMap((subject) => subject.topics).length;
  const averageMastery = Math.round(
    subjects.flatMap((subject) => subject.topics).reduce((sum, topic) => sum + topic.mastery, 0) / topicCount,
  );

  return {
    averageMastery,
    dueCards: nextReviewCards().length,
    weakTopics: weakTopics(),
    totalSubjects: subjects.length,
    totalTopics: topicCount,
    totalFlashcards: flashcards.length,
    totalQuestions: quizQuestions.length,
  };
}

