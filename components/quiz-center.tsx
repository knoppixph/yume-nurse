"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  HelpCircle,
  History,
  RotateCcw,
  Shuffle,
  Sparkles,
  Stethoscope,
  Timer,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Select } from "@/components/ui/select";
import { getSubjectName, getTopicName, subjects } from "@/lib/study-data";
import { useDynamicStudyData } from "@/lib/use-dynamic-study-data";
import {
  buildQuizQuestions,
  clearCorrectedMistake,
  loadMistakeBankQuestions,
  saveQuizAttempt,
  type QuizConfig,
  type QuizAttemptResult,
} from "@/lib/quiz-engine";
import { cn } from "@/lib/utils";
import type { Difficulty, QuestionType, QuizQuestion } from "@/types/study";

type QuizState = "config" | "active" | "results";

function normalized(value: string) {
  return value.trim().toLowerCase();
}

function isAnswerCorrect(question: QuizQuestion, selected: string[], textAnswer: string) {
  if (Array.isArray(question.correctAnswer)) {
    const expected = question.correctAnswer.map(normalized).sort();
    const actual = selected.map(normalized).sort();
    return expected.length === actual.length && expected.every((answer, index) => answer === actual[index]);
  }

  if (question.type === "Identification") {
    const input = normalized(textAnswer);
    const target = normalized(question.correctAnswer);
    if (input === target) return true;
    // Student-friendly recognition for common terms and aliases
    if (target.includes("6675") && input.includes("6675")) return true;
    if (target.includes("949") && input.includes("949")) return true;
    if (target.includes("winslow") && input.includes("winslow")) return true;
    if (target.includes("perfusion") && input.includes("perfusion")) return true;
    if (target.includes("pain") && input.includes("pain")) return true;
    if (target.includes("vagus") && input.includes("vagus")) return true;
    if (target.includes("protamine") && input.includes("protamine")) return true;
    if (target.includes("mcburney") && input.includes("mcburney")) return true;
    if (target.includes("acrocyanosis") && input.includes("acrocyanosis")) return true;
    if (target.includes("serotonin") && input.includes("serotonin")) return true;
    return false;
  }

  return normalized(selected[0] ?? "") === normalized(question.correctAnswer);
}

export function QuizCenter() {
  const [quizState, setQuizState] = useState<QuizState>("config");

  // Dynamic questions and subjects that include uploaded materials from Supabase
  const { questions: allQuestions, subjects: dynamicSubjects } = useDynamicStudyData();

  // Configuration state
  const [subjectId, setSubjectId] = useState("all");
  const [topicId, setTopicId] = useState("all");
  const [difficulty, setDifficulty] = useState<"Mixed" | Difficulty>("Mixed");
  const [questionCount, setQuestionCount] = useState("10");
  const [questionType, setQuestionType] = useState<"all" | QuestionType>("all");
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeAnswers, setRandomizeAnswers] = useState(true);
  const [isTimed, setIsTimed] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);

  // Active Quiz State
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [mistakes, setMistakes] = useState<QuizQuestion[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);

  // Mistake bank count
  const [mistakeBankCount, setMistakeBankCount] = useState(0);

  useEffect(() => {
    setMistakeBankCount(loadMistakeBankQuestions().length);
  }, [quizState]);

  const currentSubject = dynamicSubjects.find((s) => s.id === subjectId);
  const availableTopics = currentSubject ? currentSubject.topics : [];

  const configuredQuestionsPreview = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchesSubject = subjectId === "all" || q.subjectId === subjectId;
      const matchesTopic = topicId === "all" || q.topicId === topicId;
      const matchesDifficulty = difficulty === "Mixed" || q.difficulty === difficulty;
      const matchesType = questionType === "all" || q.type === questionType;
      return matchesSubject && matchesTopic && matchesDifficulty && matchesType;
    });
  }, [allQuestions, difficulty, questionType, subjectId, topicId]);

  const activeQuestion = activeQuestions[activeIndex];
  const currentCorrect = activeQuestion ? isAnswerCorrect(activeQuestion, selected, textAnswer) : false;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter(Boolean).length;
  const percent = activeQuestions.length ? Math.round((correctCount / activeQuestions.length) * 100) : 0;

  function resetQuestionState() {
    setSelected([]);
    setTextAnswer("");
    setSubmitted(false);
  }

  const finishQuiz = useCallback(() => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const correctTopics = new Set(
      Object.entries(answers)
        .filter(([, ok]) => ok)
        .map(([id]) => {
          const q = activeQuestions.find((item) => item.id === id);
          return q ? getTopicName(q.subjectId, q.topicId) : "";
        })
        .filter(Boolean),
    );

    const missedTopics = new Set(
      mistakes.map((q) => getTopicName(q.subjectId, q.topicId)).filter(Boolean),
    );

    const result: QuizAttemptResult = {
      id: "attempt-" + Date.now(),
      timestamp: new Date().toISOString(),
      totalQuestions: activeQuestions.length,
      correctCount,
      scorePercent: percent,
      timeSpentSeconds: timeSpent,
      subjectId,
      mistakes,
      weakTopics: Array.from(missedTopics),
      strongTopics: Array.from(correctTopics),
    };

    saveQuizAttempt(result);
    setQuizState("results");
  }, [activeQuestions, answers, correctCount, mistakes, percent, startTime, subjectId]);

  // Timed quiz countdown effect
  useEffect(() => {
    if (quizState !== "active" || !isTimed || timeRemainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [finishQuiz, isTimed, quizState, timeRemainingSeconds]);

  function startQuiz(customQuestions?: QuizQuestion[]) {
    const config: QuizConfig = {
      subjectId,
      topicId,
      difficulty,
      questionCount: Number(questionCount),
      questionType,
      randomizeQuestions,
      randomizeAnswers,
      isTimed,
      timeLimitSeconds: timeLimitMinutes * 60,
    };

    const questionsToRun = customQuestions ?? buildQuizQuestions(allQuestions, config);
    if (!questionsToRun.length) return;

    setActiveQuestions(questionsToRun);
    setQuizState("active");
    setActiveIndex(0);
    setAnswers({});
    setMistakes([]);
    resetQuestionState();
    setStartTime(Date.now());
    setTimeRemainingSeconds(timeLimitMinutes * 60);
  }

  function startMistakeBankQuiz() {
    const bankQuestions = loadMistakeBankQuestions();
    if (!bankQuestions.length) return;
    startQuiz(bankQuestions.slice(0, 20));
  }

  function toggleOption(option: string) {
    if (!activeQuestion || submitted) return;

    if (Array.isArray(activeQuestion.correctAnswer)) {
      setSelected((current) =>
        current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
      );
      return;
    }

    setSelected([option]);
  }

  function submitAnswer() {
    if (!activeQuestion) return;

    const correct = isAnswerCorrect(activeQuestion, selected, textAnswer);
    setAnswers((current) => ({ ...current, [activeQuestion.id]: correct }));
    if (!correct) {
      setMistakes((current) => [...current, activeQuestion]);
    } else {
      clearCorrectedMistake(activeQuestion.id);
    }
    setSubmitted(true);
  }

  function nextQuestion() {
    if (activeIndex + 1 >= activeQuestions.length) {
      finishQuiz();
      return;
    }

    setActiveIndex((index) => index + 1);
    resetQuestionState();
  }

  function retryMistakes() {
    if (!mistakes.length) return;
    startQuiz(mistakes);
  }

  // Format timer MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // ==========================================
  // RESULTS SCREEN
  // ==========================================
  if (quizState === "results") {
    const weakTopics = Array.from(new Set(mistakes.map((q) => getTopicName(q.subjectId, q.topicId))));

    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sky-700">NCLEX-Style Performance</p>
                <h2 className="mt-1 text-3xl font-black text-slate-950">{percent}%</h2>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-black",
                  percent >= 75
                    ? "bg-teal-100 text-teal-800"
                    : percent >= 50
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800",
                )}
              >
                {percent >= 75 ? "Passing Score" : "Needs Review"}
              </span>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-teal-50 p-4">
                <p className="text-xs font-bold text-teal-800">Correct Answers</p>
                <p className="mt-1 text-2xl font-black text-teal-950">{correctCount}</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-4">
                <p className="text-xs font-bold text-rose-800">Missed Questions</p>
                <p className="mt-1 text-2xl font-black text-rose-950">{activeQuestions.length - correctCount}</p>
              </div>
              <div className="rounded-xl bg-sky-50 p-4">
                <p className="text-xs font-bold text-sky-800">Overall Accuracy</p>
                <p className="mt-1 text-2xl font-black text-sky-950">{percent}%</p>
              </div>
            </div>

            <div className="mt-6">
              <ProgressBar value={percent} label="Quiz Score" />
            </div>

            <div className="mt-6">
              <p className="text-sm font-bold text-slate-950">Identified Weak Areas</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(weakTopics.length ? weakTopics : ["No weak topics identified in this quiz!"]).map((topic) => (
                  <span key={topic} className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => startQuiz()} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Try Again
              </Button>
              {mistakes.length > 0 ? (
                <Button
                  onClick={retryMistakes}
                  variant="secondary"
                  className="gap-2 border-rose-300 bg-rose-50 text-rose-950 hover:bg-rose-100"
                >
                  <Brain className="h-4 w-4 text-rose-700" /> Review Missed Questions ({mistakes.length})
                </Button>
              ) : null}
              <Button variant="secondary" onClick={() => setQuizState("config")}>
                New Quiz Setup
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Mistake Bank Card */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-950">Mistake Bank from This Attempt</h2>
          </CardHeader>
          <CardBody className="max-h-[500px] space-y-3 overflow-y-auto p-4">
            {mistakes.length ? (
              mistakes.map((question) => (
                <div key={question.id} className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
                  <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-800">
                    {question.type}
                  </span>
                  <p className="mt-2 text-xs font-bold text-slate-950">{question.prompt}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{question.explanation}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="mx-auto h-8 w-8 text-teal-600" />
                <p className="mt-2 text-sm font-bold text-slate-950">Perfect attempt!</p>
                <p className="mt-1 text-xs text-slate-500">No missed questions recorded for this session.</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  // ==========================================
  // CONFIGURATION SCREEN
  // ==========================================
  if (quizState === "config") {
    return (
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
                  NCLEX-RN & PNLE Comprehensive Practice Bank
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">Custom Quiz Setup</h2>
              </div>

              {mistakeBankCount > 0 ? (
                <Button
                  onClick={startMistakeBankQuiz}
                  variant="secondary"
                  className="gap-2 border-rose-300 bg-rose-50 text-rose-950 hover:bg-rose-100"
                >
                  <Brain className="h-4 w-4 text-rose-700" /> Practice Mistake Bank ({mistakeBankCount})
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardBody className="space-y-6 p-6">
            {/* Primary Selectors */}
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase text-slate-700">Subject</span>
                <Select
                  value={subjectId}
                  onChange={(event) => {
                    setSubjectId(event.target.value);
                    setTopicId("all");
                  }}
                >
                  <option value="all">All Nursing Subjects</option>
                  {dynamicSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase text-slate-700">Topic</span>
                <Select
                  value={topicId}
                  onChange={(event) => setTopicId(event.target.value)}
                  disabled={subjectId === "all"}
                >
                  <option value="all">All Topics</option>
                  {availableTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase text-slate-700">Difficulty</span>
                <Select
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value as "Mixed" | Difficulty)}
                >
                  <option value="Mixed">Mixed Difficulties</option>
                  <option value="Easy">Easy Only</option>
                  <option value="Medium">Medium Only</option>
                  <option value="Hard">Hard / Priority Scenarios</option>
                </Select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase text-slate-700">Question Format</span>
                <Select
                  value={questionType}
                  onChange={(event) => setQuestionType(event.target.value as "all" | QuestionType)}
                >
                  <option value="all">All Question Types</option>
                  <option value="Multiple Choice">Multiple Choice</option>
                  <option value="Select All That Apply">Select All That Apply (SATA)</option>
                  <option value="Patient Scenario">Patient Clinical Scenarios</option>
                  <option value="Prioritization">Prioritization</option>
                  <option value="Identification">Identification</option>
                  <option value="True/False">True / False</option>
                </Select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase text-slate-700">Question Count</span>
                <Select value={questionCount} onChange={(event) => setQuestionCount(event.target.value)}>
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="20">20 Questions</option>
                  <option value="50">50 Questions (Full Mock)</option>
                </Select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase text-slate-700">Timed Exam Mode</span>
                <Select
                  value={isTimed ? `${timeLimitMinutes}` : "off"}
                  onChange={(event) => {
                    if (event.target.value === "off") {
                      setIsTimed(false);
                    } else {
                      setIsTimed(true);
                      setTimeLimitMinutes(Number(event.target.value));
                    }
                  }}
                >
                  <option value="off">Untimed (Self-Paced)</option>
                  <option value="5">Timed: 5 Minutes</option>
                  <option value="10">Timed: 10 Minutes</option>
                  <option value="15">Timed: 15 Minutes (NCLEX Speed)</option>
                  <option value="30">Timed: 30 Minutes</option>
                </Select>
              </label>
            </div>

            {/* Randomization Toggles */}
            <div className="flex flex-wrap items-center gap-6 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={randomizeQuestions}
                  onChange={(e) => setRandomizeQuestions(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <Shuffle className="h-3.5 w-3.5 text-slate-500" /> Randomize Questions
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={randomizeAnswers}
                  onChange={(e) => setRandomizeAnswers(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <Shuffle className="h-3.5 w-3.5 text-slate-500" /> Randomize Option Order
              </label>
            </div>

            {/* Action footer */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-600">
                <span className="font-bold text-slate-950">{configuredQuestionsPreview.length}</span> verified questions match this configuration.
              </p>

              <Button
                onClick={() => startQuiz()}
                disabled={!configuredQuestionsPreview.length}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <Sparkles className="h-4 w-4" /> Start Custom Quiz
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ==========================================
  // ACTIVE QUESTION SCREEN
  // ==========================================
  if (!activeQuestion) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
                {getSubjectName(activeQuestion.subjectId)}
              </p>
              <h2 className="mt-0.5 text-lg font-black text-slate-950">
                Question {activeIndex + 1} of {activeQuestions.length}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {isTimed ? (
                <span className="flex items-center gap-1.5 rounded-md bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">
                  <Timer className="h-3.5 w-3.5 text-amber-700 animate-pulse" /> {formatTimer(timeRemainingSeconds)}
                </span>
              ) : null}

              <span
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-bold",
                  activeQuestion.type === "Patient Scenario"
                    ? "bg-rose-100 text-rose-900"
                    : activeQuestion.type === "Select All That Apply"
                    ? "bg-purple-100 text-purple-900"
                    : "bg-slate-100 text-slate-700",
                )}
              >
                {activeQuestion.type}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <ProgressBar
              value={Math.round(((activeIndex + 1) / activeQuestions.length) * 100)}
              label="Quiz Completion"
            />
          </div>
        </CardHeader>

        <CardBody className="p-6">
          {/* Distinct Patient Scenario Card */}
          {activeQuestion.scenario ? (
            <div className="mb-6 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/80 via-white to-sky-50/50 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sky-950 font-black text-sm">
                <Stethoscope className="h-4 w-4 text-sky-700" />
                <span>Clinical Patient Case Chart</span>
              </div>

              <p className="mt-2 text-sm leading-relaxed font-semibold text-slate-800">
                {activeQuestion.scenario.patient}
              </p>

              {/* Vitals Grid */}
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {activeQuestion.scenario.vitals.map((vital) => (
                  <div
                    key={vital}
                    className="flex items-center gap-1.5 rounded-lg border border-sky-200/80 bg-white px-3 py-2 text-xs font-bold text-sky-950 shadow-2xs"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                    <span>{vital}</span>
                  </div>
                ))}
              </div>

              {/* Nursing Assessment Box */}
              <div className="mt-3 rounded-lg bg-sky-100/60 p-3 text-xs leading-relaxed text-sky-950 font-medium border border-sky-200/60">
                <span className="font-bold">Nurse Assessment: </span>
                {activeQuestion.scenario.assessment}
              </div>
            </div>
          ) : null}

          {/* Prompt */}
          <p className="text-lg font-bold leading-relaxed text-slate-950">{activeQuestion.prompt}</p>

          {activeQuestion.type === "Select All That Apply" ? (
            <p className="mt-1 text-xs font-semibold text-purple-700">
              * Select all options that apply before submitting.
            </p>
          ) : null}

          {/* Identification Input */}
          {activeQuestion.type === "Identification" ? (
            <label className="mt-6 block">
              <span className="mb-2 block text-xs font-bold uppercase text-slate-700">Your Clinical Answer</span>
              <Input
                value={textAnswer}
                onChange={(event) => setTextAnswer(event.target.value)}
                disabled={submitted}
                placeholder="Type your answer here..."
                className="max-w-md"
              />
            </label>
          ) : (
            /* Options list */
            <div className="mt-6 grid gap-3">
              {activeQuestion.options.map((option) => {
                const checked = selected.includes(option);
                const correct =
                  submitted &&
                  (Array.isArray(activeQuestion.correctAnswer)
                    ? activeQuestion.correctAnswer.includes(option)
                    : activeQuestion.correctAnswer === option);
                const wrong = submitted && checked && !correct;

                return (
                  <button
                    key={option}
                    type="button"
                    className={cn(
                      "flex min-h-12 items-center gap-3.5 rounded-xl border p-4 text-left text-sm font-semibold transition shadow-2xs",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400",
                      checked && !submitted && "border-slate-950 bg-slate-50 ring-1 ring-slate-950",
                      !checked && !submitted && "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300",
                      correct && "border-teal-400 bg-teal-50/80 text-teal-950",
                      wrong && "border-rose-400 bg-rose-50/80 text-rose-950",
                    )}
                    onClick={() => toggleOption(option)}
                    disabled={submitted}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-black transition",
                        checked && !submitted && "border-slate-950 bg-slate-950 text-white",
                        !checked && !submitted && "border-slate-300 bg-white",
                        correct && "border-teal-600 bg-teal-600 text-white",
                        wrong && "border-rose-600 bg-rose-600 text-white",
                      )}
                    >
                      {checked ? "✓" : ""}
                    </span>
                    <span className="leading-snug">{option}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Submission Rationale Feedback */}
          {submitted ? (
            <div
              className={cn(
                "mt-6 rounded-2xl border p-5 transition-all shadow-sm",
                currentCorrect ? "border-teal-300 bg-teal-50/80" : "border-rose-300 bg-rose-50/80",
              )}
            >
              <div className="flex items-center gap-2">
                {currentCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0" aria-hidden="true" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-700 shrink-0" aria-hidden="true" />
                )}
                <p className={cn("font-black text-sm", currentCorrect ? "text-teal-950" : "text-rose-950")}>
                  {currentCorrect ? "Correct Response" : "Incorrect Response"}
                </p>
              </div>

              {!currentCorrect ? (
                <div className="mt-2 text-xs font-bold text-rose-900">
                  <span>Correct Answer: </span>
                  <span className="underline">
                    {Array.isArray(activeQuestion.correctAnswer)
                      ? activeQuestion.correctAnswer.join(" • ")
                      : activeQuestion.correctAnswer}
                  </span>
                </div>
              ) : null}

              <div className="mt-3 border-t border-slate-200/60 pt-3">
                <p className="text-xs font-black uppercase tracking-wider text-slate-800">Clinical Rationale</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{activeQuestion.explanation}</p>
                <p className="mt-2 text-[11px] font-medium text-slate-500">Source: {activeQuestion.source}</p>
              </div>
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4">
            {!submitted ? (
              <Button
                onClick={submitAnswer}
                disabled={activeQuestion.type === "Identification" ? !textAnswer.trim() : selected.length === 0}
                className="bg-slate-950 hover:bg-slate-800"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={nextQuestion} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                {activeIndex + 1 >= activeQuestions.length ? "View Final Results" : "Next Question"}{" "}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            <Button variant="secondary" onClick={() => setQuizState("config")}>
              Exit Quiz
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Sidebar Attempt Stats */}
      <aside className="space-y-4">
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-950">Live Attempt Tracker</h2>
          </CardHeader>
          <CardBody className="space-y-4 p-5">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Score</p>
              <p className="mt-1 text-3xl font-black text-slate-950">
                {correctCount} / {answeredCount || activeQuestions.length}
              </p>
            </div>

            <ProgressBar
              value={activeQuestions.length ? Math.round((answeredCount / activeQuestions.length) * 100) : 0}
              label="Answered Questions"
            />

            <div className="rounded-xl bg-slate-100/80 p-3.5">
              <p className="text-xs font-bold text-slate-700">Current Topic</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {getTopicName(activeQuestion.subjectId, activeQuestion.topicId)}
              </p>
            </div>

            <div className="rounded-xl bg-sky-50 p-3.5 text-xs text-sky-900 font-medium">
              <p className="font-bold flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" /> NCLEX Tip
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-sky-800">
                Read all options before selecting. Eliminate clearly incorrect distractors first.
              </p>
            </div>
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}
