"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MaterialStudySet } from "@/services/material-study-pack";

type MaterialStudyModalProps = {
  studySet: MaterialStudySet;
  initialMode: "quiz" | "flashcards";
  onClose: () => void;
};

export function MaterialStudyModal({ studySet, initialMode, onClose }: MaterialStudyModalProps) {
  const [mode, setMode] = useState<"quiz" | "flashcards">(initialMode);

  // Quiz interactive state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showRationale, setShowRationale] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Flashcards interactive state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => setMode("quiz")}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-black transition",
                  mode === "quiz" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                Practice Quiz
              </button>
              <button
                onClick={() => setMode("flashcards")}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-black transition",
                  mode === "flashcards" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                Flashcards
              </button>
            </div>
            <h3 className="text-base font-black text-slate-900 line-clamp-1">{studySet.title}</h3>
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
          <div className="space-y-4">
            {!quizCompleted ? (
              <>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Question {currentQuestionIndex + 1} of {studySet.questions.length}</span>
                  <span>Score: {quizScore} / {currentQuestionIndex + (showRationale ? 1 : 0)}</span>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-sm font-bold text-slate-900 leading-relaxed">
                    {studySet.questions[currentQuestionIndex].prompt}
                  </p>
                </div>

                <div className="space-y-2">
                  {studySet.questions[currentQuestionIndex].options.map((option, idx) => {
                    const isCorrect = option === studySet.questions[currentQuestionIndex].correctAnswer;
                    const isSelected = selectedOption === option;

                    let btnStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";
                    if (showRationale) {
                      if (isCorrect) {
                        btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                      } else if (isSelected) {
                        btnStyle = "border-rose-500 bg-rose-50 text-rose-900";
                      }
                    } else if (isSelected) {
                      btnStyle = "border-sky-500 bg-sky-50 text-sky-900 font-bold";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={showRationale}
                        onClick={() => setSelectedOption(option)}
                        className={cn(
                          "w-full text-left rounded-xl p-3 text-xs border transition flex items-start gap-2",
                          btnStyle
                        )}
                      >
                        <span className="font-black text-slate-400 shrink-0">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                {showRationale && (
                  <div className="rounded-xl bg-sky-50 p-3 border border-sky-200 text-xs text-sky-900 space-y-1">
                    <span className="font-bold block">Clinical Rationale:</span>
                    <p>{studySet.questions[currentQuestionIndex].explanation}</p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  {!showRationale ? (
                    <Button
                      disabled={!selectedOption}
                      onClick={() => {
                        setShowRationale(true);
                        if (selectedOption === studySet.questions[currentQuestionIndex].correctAnswer) {
                          setQuizScore((s) => s + 1);
                        }
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Check Answer
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        if (currentQuestionIndex + 1 < studySet.questions.length) {
                          setCurrentQuestionIndex((i) => i + 1);
                          setSelectedOption(null);
                          setShowRationale(false);
                        } else {
                          setQuizCompleted(true);
                        }
                      }}
                      className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
                    >
                      {currentQuestionIndex + 1 < studySet.questions.length ? "Next Question →" : "View Results"}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">Quiz Completed!</h4>
                  <p className="text-sm font-semibold text-slate-600 mt-1">
                    Score: {quizScore} / {studySet.questions.length} (
                    {Math.round((quizScore / studySet.questions.length) * 100)}%)
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    onClick={() => {
                      setCurrentQuestionIndex(0);
                      setSelectedOption(null);
                      setShowRationale(false);
                      setQuizScore(0);
                      setQuizCompleted(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Retake Quiz
                  </Button>
                  <Button onClick={onClose} variant="secondary" className="text-xs font-bold">
                    Done
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
