"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Infinity,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  generateQuestionBank,
  type CustomQuizQuestion,
  type MaterialStudySet,
} from "@/services/material-study-pack";

type MaterialStudyModalProps = {
  studySet: MaterialStudySet;
  initialMode: "quiz" | "flashcards";
  onClose: () => void;
};

export function MaterialStudyModal({ studySet, initialMode, onClose }: MaterialStudyModalProps) {
  const [mode, setMode] = useState<"quiz" | "flashcards">(initialMode);

  // Dynamic question bank
  const [questions, setQuestions] = useState<CustomQuizQuestion[]>(studySet.questions);
  const [targetCount, setTargetCount] = useState<number | "unlimited">(25);

  // Quiz interactive state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showRationale, setShowRationale] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Flashcards interactive state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Load more questions dynamically for unlimited practice
  function handleLoadMoreQuestions() {
    const more = generateQuestionBank(
      studySet.materialId,
      studySet.title,
      questions.length + 50
    );
    setQuestions(more);
  }

  const effectiveTotal =
    targetCount === "unlimited"
      ? questions.length
      : Math.min(targetCount, questions.length);

  const currentQ = questions[currentQuestionIndex] ?? questions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <button
                onClick={() => setMode("quiz")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-black transition flex items-center gap-1.5",
                  mode === "quiz" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" /> Practice Quiz ({questions.length}+ Questions)
              </button>
              <button
                onClick={() => setMode("flashcards")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-black transition flex items-center gap-1.5",
                  mode === "flashcards" ? "bg-sky-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <BookOpen className="h-3.5 w-3.5" /> Flashcards ({studySet.flashcards.length})
              </button>
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 line-clamp-1">{studySet.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* QUIZ MODE */}
        {mode === "quiz" && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Quiz Size / Count Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">Quiz Target:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {([10, 25, 50, 100, 200] as const).map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => {
                      setTargetCount(cnt);
                      if (cnt > questions.length) {
                        const more = generateQuestionBank(studySet.materialId, studySet.title, cnt);
                        setQuestions(more);
                      }
                    }}
                    className={cn(
                      "rounded-lg px-2.5 py-1 font-bold text-[11px] transition",
                      targetCount === cnt
                        ? "bg-slate-950 text-white shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                    )}
                  >
                    {cnt} Qs
                  </button>
                ))}
                <button
                  onClick={() => setTargetCount("unlimited")}
                  className={cn(
                    "rounded-lg px-2.5 py-1 font-bold text-[11px] transition flex items-center gap-1",
                    targetCount === "unlimited"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                  )}
                >
                  <Infinity className="h-3.5 w-3.5" /> Unlimited
                </button>
              </div>
            </div>

            {!quizCompleted ? (
              <>
                {/* Stats Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                    <span>
                      Question {currentQuestionIndex + 1}
                      {targetCount === "unlimited" ? "" : ` of ${effectiveTotal}`}
                    </span>
                    {currentQ?.topicCategory && (
                      <span className="rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-black text-teal-800">
                        {currentQ.topicCategory}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {currentStreak > 1 && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
                        {currentStreak} Streak!
                      </span>
                    )}
                    <span>
                      Score: {quizScore} / {answeredCount} (
                      {answeredCount > 0 ? Math.round((quizScore / answeredCount) * 100) : 100}%)
                    </span>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-sm font-bold text-slate-900 leading-relaxed">
                    {currentQ?.prompt}
                  </p>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2">
                  {currentQ?.options.map((option, idx) => {
                    const isCorrect = option === currentQ.correctAnswer;
                    const isSelected = selectedOption === option;

                    let btnStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";
                    if (showRationale) {
                      if (isCorrect) {
                        btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500";
                      } else if (isSelected) {
                        btnStyle = "border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-500";
                      }
                    } else if (isSelected) {
                      btnStyle = "border-sky-500 bg-sky-50 text-sky-900 font-bold ring-1 ring-sky-500";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={showRationale}
                        onClick={() => setSelectedOption(option)}
                        className={cn(
                          "w-full text-left rounded-xl p-3 text-xs border transition flex items-start gap-2.5",
                          btnStyle
                        )}
                      >
                        <span className="font-black text-slate-500 shrink-0 w-5">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span className="leading-relaxed">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Clinical Rationale Feedback */}
                {showRationale && (
                  <div className="rounded-xl bg-sky-50 p-3.5 border border-sky-200 text-xs text-sky-950 space-y-1.5 animate-in fade-in duration-150">
                    <span className="font-bold flex items-center gap-1.5 text-sky-900">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Clinical Rationale:
                    </span>
                    <p className="leading-relaxed text-slate-800">{currentQ?.explanation}</p>
                  </div>
                )}

                {/* Navigation and Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleLoadMoreQuestions}
                    className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> +50 More Questions
                  </button>

                  <div className="flex items-center gap-2">
                    {!showRationale ? (
                      <Button
                        disabled={!selectedOption}
                        onClick={() => {
                          setShowRationale(true);
                          setAnsweredCount((c) => c + 1);
                          if (selectedOption === currentQ.correctAnswer) {
                            setQuizScore((s) => s + 1);
                            setCurrentStreak((st) => st + 1);
                          } else {
                            setCurrentStreak(0);
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5"
                      >
                        Check Answer
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          const nextIdx = currentQuestionIndex + 1;
                          const isFinished =
                            targetCount !== "unlimited" && nextIdx >= effectiveTotal;

                          if (isFinished) {
                            setQuizCompleted(true);
                          } else {
                            // If approaching end of loaded questions, auto-generate more
                            if (nextIdx >= questions.length - 2) {
                              const more = generateQuestionBank(
                                studySet.materialId,
                                studySet.title,
                                questions.length + 50
                              );
                              setQuestions(more);
                            }
                            setCurrentQuestionIndex(nextIdx);
                            setSelectedOption(null);
                            setShowRationale(false);
                          }
                        }}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5"
                      >
                        {targetCount !== "unlimited" && currentQuestionIndex + 1 >= effectiveTotal
                          ? "Finish & View Results"
                          : "Next Question →"}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Quiz Completion Summary */
              <div className="text-center py-8 space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
                  <Trophy className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-950">Quiz Set Completed!</h4>
                  <p className="text-sm font-semibold text-slate-600 mt-1">
                    Final Score: <span className="font-bold text-slate-950">{quizScore} / {answeredCount}</span> (
                    <span className="font-black text-emerald-700">
                      {answeredCount > 0 ? Math.round((quizScore / answeredCount) * 100) : 0}%
                    </span>
                    )
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {quizScore / (answeredCount || 1) >= 0.75
                      ? "🎉 Passing PNLE & NCLEX Benchmark (75%+)"
                      : "Good practice! Review your rationales and try another set to hit 75%+."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <Button
                    onClick={() => {
                      setCurrentQuestionIndex(0);
                      setSelectedOption(null);
                      setShowRationale(false);
                      setQuizScore(0);
                      setAnsweredCount(0);
                      setCurrentStreak(0);
                      setQuizCompleted(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                  >
                    <RotateCcw className="h-4 w-4" /> Retake This Set
                  </Button>
                  <Button
                    onClick={() => {
                      const more = generateQuestionBank(studySet.materialId, studySet.title, questions.length + 50);
                      setQuestions(more);
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                      setSelectedOption(null);
                      setShowRationale(false);
                      setQuizCompleted(false);
                    }}
                    className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs gap-1.5"
                  >
                    <PlusCircle className="h-4 w-4" /> Continue Next 50 Questions
                  </Button>
                  <Button onClick={onClose} variant="secondary" className="text-xs font-bold">
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FLASHCARDS MODE */}
        {mode === "flashcards" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Card {currentCardIndex + 1} of {studySet.flashcards.length}</span>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-sky-800 text-[10px]">
                {studySet.flashcards[currentCardIndex].difficulty}
              </span>
            </div>

            <div
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className={cn(
                "min-h-[170px] cursor-pointer rounded-2xl p-6 flex flex-col justify-center items-center text-center transition-all duration-300 shadow-sm border",
                isCardFlipped
                  ? "bg-sky-50 border-sky-300 text-sky-950"
                  : "bg-white border-slate-200 hover:border-sky-300 text-slate-900"
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                {isCardFlipped ? "Answer (Click to flip)" : "Question / Cue (Click to flip)"}
              </span>
              <p className="text-base font-bold leading-relaxed">
                {isCardFlipped
                  ? studySet.flashcards[currentCardIndex].back
                  : studySet.flashcards[currentCardIndex].front}
              </p>
              {isCardFlipped && (
                <p className="mt-3 text-xs text-sky-700 italic">
                  Rationale: {studySet.flashcards[currentCardIndex].explanation}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Button
                disabled={currentCardIndex === 0}
                onClick={() => {
                  setCurrentCardIndex((i) => i - 1);
                  setIsCardFlipped(false);
                }}
                variant="secondary"
                className="text-xs font-bold gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                variant="secondary"
                className="text-xs font-bold"
              >
                {isCardFlipped ? "Show Front" : "Flip Card"}
              </Button>
              <Button
                disabled={currentCardIndex + 1 >= studySet.flashcards.length}
                onClick={() => {
                  setCurrentCardIndex((i) => i + 1);
                  setIsCardFlipped(false);
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
