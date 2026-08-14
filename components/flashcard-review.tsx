"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Flame,
  RotateCcw,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Select } from "@/components/ui/select";
import { flashcards, getSubjectName, getTopicName, subjects } from "@/lib/study-data";
import {
  calculateSM2,
  formatDueTime,
  isCardDue,
  loadAllProgress,
  loadFavorites,
  saveCardProgress,
  toggleFavoriteStorage,
  type CardProgress,
  type ReviewGrade,
} from "@/lib/spaced-repetition";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "due" | "favorites";

export function FlashcardReview() {
  const [subjectId, setSubjectId] = useState("all");
  const [topicId, setTopicId] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, CardProgress>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [lastGradeFeedback, setLastGradeFeedback] = useState<{ grade: ReviewGrade; nextIn: string } | null>(null);

  // Load progress and favorites on mount
  useEffect(() => {
    setProgressMap(loadAllProgress());
    setFavorites(loadFavorites());
  }, []);

  const currentSubject = subjects.find((s) => s.id === subjectId);
  const availableTopics = currentSubject ? currentSubject.topics : [];

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return flashcards.filter((card) => {
      const matchesSubject = subjectId === "all" || card.subjectId === subjectId;
      const matchesTopic = topicId === "all" || card.topicId === topicId;
      const matchesDifficulty = difficulty === "all" || card.difficulty === difficulty;

      const progress = progressMap[card.id];
      const isFav = favorites.has(card.id);
      const isDue = isCardDue(progress);

      let matchesStatus = true;
      if (statusFilter === "due") matchesStatus = isDue;
      if (statusFilter === "favorites") matchesStatus = isFav;

      const searchSpace = [
        card.front,
        card.back,
        card.explanation,
        getSubjectName(card.subjectId),
        getTopicName(card.subjectId, card.topicId),
        card.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesSubject &&
        matchesTopic &&
        matchesDifficulty &&
        matchesStatus &&
        (!normalizedQuery || searchSpace.includes(normalizedQuery))
      );
    });
  }, [difficulty, favorites, progressMap, query, statusFilter, subjectId, topicId]);

  const activeCard = filteredCards[activeIndex] ?? filteredCards[0];
  const cardProgress = activeCard ? progressMap[activeCard.id] : undefined;
  const mastery = cardProgress?.masteryScore ?? 0;
  const isFav = activeCard ? favorites.has(activeCard.id) : false;
  const dueLabel = formatDueTime(cardProgress);

  const moveToCard = useCallback((index: number) => {
    setActiveIndex(index);
    setFlipped(false);
    setLastGradeFeedback(null);
  }, []);

  const nextCard = useCallback(() => {
    if (filteredCards.length > 1) {
      moveToCard((activeIndex + 1) % filteredCards.length);
    }
  }, [activeIndex, filteredCards.length, moveToCard]);

  const prevCard = useCallback(() => {
    if (filteredCards.length > 1) {
      moveToCard((activeIndex - 1 + filteredCards.length) % filteredCards.length);
    }
  }, [activeIndex, filteredCards.length, moveToCard]);

  const handleGrade = useCallback((grade: ReviewGrade) => {
    if (!activeCard) return;

    const newProgress = calculateSM2(progressMap[activeCard.id], grade);
    newProgress.cardId = activeCard.id;
    newProgress.favorite = favorites.has(activeCard.id);

    saveCardProgress(newProgress);
    setProgressMap((current) => ({ ...current, [activeCard.id]: newProgress }));

    const nextIn = formatDueTime(newProgress);
    setLastGradeFeedback({ grade, nextIn });

    window.setTimeout(() => {
      if (filteredCards.length > 1) {
        moveToCard((activeIndex + 1) % filteredCards.length);
      }
    }, 450);
  }, [activeCard, activeIndex, favorites, filteredCards.length, moveToCard, progressMap]);

  const toggleFavorite = useCallback(() => {
    if (!activeCard) return;
    const nowFav = toggleFavoriteStorage(activeCard.id);
    setFavorites((current) => {
      const updated = new Set(current);
      if (nowFav) updated.add(activeCard.id);
      else updated.delete(activeCard.id);
      return updated;
    });
  }, [activeCard]);

  // Keyboard navigation & rating
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger shortcuts if user is typing in an input
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === "Space" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextCard();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevCard();
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFavorite();
      } else if (flipped) {
        if (e.key === "1") handleGrade("Again");
        if (e.key === "2") handleGrade("Hard");
        if (e.key === "3") handleGrade("Good");
        if (e.key === "4") handleGrade("Easy");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flipped, handleGrade, nextCard, prevCard, toggleFavorite]);

  const dueCount = useMemo(() => {
    return flashcards.filter((c) => isCardDue(progressMap[c.id])).length;
  }, [progressMap]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-4">
        {/* Filter Controls Bar */}
        <Card>
          <CardBody className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
                <Input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    moveToCard(0);
                  }}
                  className="pl-9"
                  placeholder="Search cards, concepts, drugs, topics..."
                  aria-label="Search flashcards"
                />
              </label>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    moveToCard(0);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-bold transition",
                    statusFilter === "all"
                      ? "bg-slate-950 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )}
                >
                  All ({flashcards.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("due");
                    moveToCard(0);
                  }}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold transition",
                    statusFilter === "due"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100",
                  )}
                >
                  <Clock className="h-3 w-3" /> Due ({dueCount})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("favorites");
                    moveToCard(0);
                  }}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold transition",
                    statusFilter === "favorites"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100",
                  )}
                >
                  <Star className="h-3 w-3" /> Starred ({favorites.size})
                </button>
              </div>
            </div>

            {/* Sub-Filters */}
            <div className="grid gap-2 sm:grid-cols-3">
              <Select
                value={subjectId}
                onChange={(event) => {
                  setSubjectId(event.target.value);
                  setTopicId("all");
                  moveToCard(0);
                }}
                aria-label="Filter by subject"
              >
                <option value="all">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </Select>

              <Select
                value={topicId}
                onChange={(event) => {
                  setTopicId(event.target.value);
                  moveToCard(0);
                }}
                disabled={subjectId === "all"}
                aria-label="Filter by topic"
              >
                <option value="all">All Topics</option>
                {availableTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </Select>

              <Select
                value={difficulty}
                onChange={(event) => {
                  setDifficulty(event.target.value);
                  moveToCard(0);
                }}
                aria-label="Filter by difficulty"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Active Card Viewer */}
        {activeCard ? (
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
                    {getSubjectName(activeCard.subjectId)}
                  </p>
                  <h2 className="mt-0.5 text-base font-black text-slate-950">
                    {getTopicName(activeCard.subjectId, activeCard.topicId)}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-bold",
                      dueLabel.includes("Due")
                        ? "bg-rose-100 text-rose-800"
                        : "bg-slate-200 text-slate-700",
                    )}
                  >
                    {dueLabel}
                  </span>

                  <button
                    type="button"
                    onClick={toggleFavorite}
                    className={cn(
                      "rounded-md p-1.5 transition hover:bg-slate-200",
                      isFav ? "text-amber-500" : "text-slate-400 hover:text-slate-600",
                    )}
                    title={isFav ? "Remove from favorites (F)" : "Add to favorites (F)"}
                  >
                    <Star className={cn("h-5 w-5", isFav && "fill-amber-400")} />
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardBody className="p-6">
              {/* Flip Flashcard */}
              <button
                className={cn(
                  "relative min-h-[320px] w-full rounded-2xl border p-8 text-left transition-all duration-300",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400",
                  flipped
                    ? "border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white shadow-lg"
                    : "border-slate-200 bg-gradient-to-br from-white via-rose-50/40 to-sky-50/40 text-slate-950 shadow-sm hover:border-slate-300",
                )}
                onClick={() => setFlipped((value) => !value)}
                aria-pressed={flipped}
              >
                <div className="flex h-full min-h-[260px] flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-xs font-black uppercase tracking-wider",
                          flipped ? "bg-sky-900/60 text-sky-200" : "bg-slate-200/70 text-slate-700",
                        )}
                      >
                        {flipped ? "Answer / Back" : "Question / Front"}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {activeIndex + 1} of {filteredCards.length}
                      </span>
                    </div>

                    <p className="mt-6 text-xl sm:text-2xl font-black leading-snug">
                      {flipped ? activeCard.back : activeCard.front}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <p className={cn("text-xs font-semibold", flipped ? "text-slate-300" : "text-slate-500")}>
                      Tap card or press <kbd className="rounded bg-slate-200 px-1 py-0.5 text-slate-800">Space</kbd> to {flipped ? "flip back" : "reveal answer"}
                    </p>
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-bold",
                        activeCard.difficulty === "Easy"
                          ? "bg-teal-100 text-teal-800"
                          : activeCard.difficulty === "Hard"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-sky-100 text-sky-800",
                      )}
                    >
                      {activeCard.difficulty}
                    </span>
                  </div>
                </div>
              </button>

              {/* Rationale & Source (Shown when flipped) */}
              {flipped ? (
                <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50/70 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-sky-950">Clinical Explanation</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{activeCard.explanation}</p>
                  <p className="mt-3 text-xs font-medium text-slate-500">Source: {activeCard.source}</p>
                </div>
              ) : null}

              {/* Mastery Meter */}
              <div className="mt-5">
                <ProgressBar value={mastery} label="Spaced Repetition Mastery" />
              </div>

              {/* SM-2 Grading Buttons */}
              <div className="mt-5">
                <p className="mb-2 text-xs font-bold text-slate-500">
                  {flipped ? "Rate your recall to schedule next review:" : "Flip card first to grade your recall:"}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Button
                    variant="danger"
                    onClick={() => handleGrade("Again")}
                    disabled={!flipped}
                    className="flex-col py-2.5 h-auto text-center"
                  >
                    <span className="font-black text-sm">1. Again</span>
                    <span className="text-[10px] font-normal opacity-90">1 day (Reset)</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleGrade("Hard")}
                    disabled={!flipped}
                    className="flex-col py-2.5 h-auto text-center border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100"
                  >
                    <span className="font-black text-sm">2. Hard</span>
                    <span className="text-[10px] font-normal opacity-80">2-3 days</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleGrade("Good")}
                    disabled={!flipped}
                    className="flex-col py-2.5 h-auto text-center border-sky-300 bg-sky-50 text-sky-950 hover:bg-sky-100"
                  >
                    <span className="font-black text-sm">3. Good</span>
                    <span className="text-[10px] font-normal opacity-80">6 days</span>
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleGrade("Easy")}
                    disabled={!flipped}
                    className="flex-col py-2.5 h-auto text-center bg-teal-600 hover:bg-teal-700"
                  >
                    <span className="font-black text-sm">4. Easy</span>
                    <span className="text-[10px] font-normal opacity-90">10+ days</span>
                  </Button>
                </div>
              </div>

              {/* Feedback Alert */}
              {lastGradeFeedback ? (
                <p className="mt-4 flex items-center gap-2 rounded-lg bg-teal-50 px-3.5 py-2.5 text-xs font-bold text-teal-800">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                  Rated as {lastGradeFeedback.grade} — Next review scheduled for {lastGradeFeedback.nextIn}.
                </p>
              ) : null}

              {/* Navigation Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <Button variant="secondary" onClick={prevCard} disabled={filteredCards.length <= 1}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>

                <p className="text-xs font-semibold text-slate-500">
                  Card {activeIndex + 1} of {filteredCards.length}
                </p>

                <Button variant="secondary" onClick={nextCard} disabled={filteredCards.length <= 1}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <EmptyState
            title="No flashcards match filters"
            description="Try changing the subject, topic, difficulty, or status filter."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSubjectId("all");
                  setTopicId("all");
                  setDifficulty("all");
                  setStatusFilter("all");
                  setQuery("");
                  moveToCard(0);
                }}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset all filters
              </Button>
            }
          />
        )}
      </section>

      {/* Spaced Repetition Queue Sidebar */}
      <aside className="space-y-4">
        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-950">Study Queue</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                {filteredCards.length} Cards
              </span>
            </div>
          </CardHeader>
          <CardBody className="max-h-[580px] space-y-2 overflow-y-auto p-3">
            {filteredCards.map((card, index) => {
              const p = progressMap[card.id];
              const dueText = formatDueTime(p);
              const isDue = isCardDue(p);

              return (
                <button
                  key={card.id}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition",
                    activeCard?.id === card.id
                      ? "border-slate-950 bg-slate-50 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50",
                  )}
                  onClick={() => moveToCard(index)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-xs font-bold text-slate-950">{card.front}</p>
                    {favorites.has(card.id) ? (
                      <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" />
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">{getSubjectName(card.subjectId).split(" ")[0]}</span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 font-bold",
                        isDue ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {dueText}
                    </span>
                  </div>
                </button>
              );
            })}
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}
