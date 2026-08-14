export type Difficulty = "Easy" | "Medium" | "Hard";

export type QuestionType =
  | "Multiple Choice"
  | "True/False"
  | "Select All That Apply"
  | "Identification"
  | "Prioritization"
  | "Patient Scenario";

export type Topic = {
  id: string;
  name: string;
  description: string;
  mastery: number;
};

export type Subject = {
  id: string;
  name: string;
  description: string;
  icon: string;
  accent: "pink" | "purple" | "blue" | "teal" | "amber" | "rose" | "emerald";
  topics: Topic[];
};

export type Flashcard = {
  id: string;
  subjectId: string;
  topicId: string;
  front: string;
  back: string;
  explanation: string;
  difficulty: Difficulty;
  tags: string[];
  source: string;
  due: "Due now" | "Today" | "Tomorrow" | "Later";
  mastery: number;
};

export type QuizQuestion = {
  id: string;
  subjectId: string;
  topicId: string;
  type: QuestionType;
  prompt: string;
  scenario?: {
    patient: string;
    vitals: string[];
    assessment: string;
  };
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: Difficulty;
  tags: string[];
  source: string;
};

export type StudyStat = {
  label: string;
  value: string;
  detail: string;
};

