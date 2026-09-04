/**
 * useDynamicStudyData
 *
 * Merges the built-in study-data with materials uploaded to Supabase.
 * - Removed / hidden default materials are filtered out so deleted items don't linger.
 * - Uploaded materials (e.g. NDT Reviewer) generate 100-200+ practice questions and flashcards.
 * - Subject dropdown dynamically includes Nutrition & Diet Therapy (NDT) and all active subjects.
 */
"use client";

import { useEffect, useState } from "react";
import {
  flashcards as staticFlashcards,
  quizQuestions as staticQuizQuestions,
  subjects as allRegisteredSubjects,
} from "@/lib/study-data";
import { generateQuestionBank, generateFlashcardBank } from "@/services/material-study-pack";
import type { Difficulty, Flashcard, QuizQuestion, Subject } from "@/types/study";

const HIDDEN_DEFAULTS_KEY = "nursemate_hidden_default_materials";

export type DynamicStudyData = {
  questions: QuizQuestion[];
  flashcards: Flashcard[];
  subjects: Subject[];
  isLoading: boolean;
};

/** Resolves subject ID and display name from material attributes */
function resolveSubjectInfo(
  rawSubjectId: string | null | undefined,
  title: string = "",
  fileName: string = "",
  summary: string = ""
): { id: string; name: string } {
  const combined = `${rawSubjectId ?? ""} ${title} ${fileName} ${summary}`.toLowerCase();

  if (
    combined.includes("ndt") ||
    combined.includes("nutri") ||
    combined.includes("diet") ||
    combined.includes("food") ||
    combined.includes("feed") ||
    combined.includes("tpn") ||
    combined.includes("vitamin")
  ) {
    return { id: "nutrition-diet-therapy", name: "Nutrition and Diet Therapy (NDT)" };
  }

  if (
    combined.includes("communit") ||
    combined.includes("phc") ||
    combined.includes("chn") ||
    combined.includes("bhw") ||
    combined.includes("public health") ||
    combined.includes("winslow") ||
    combined.includes("maglaya")
  ) {
    return { id: "community-health-ph", name: "Community Health Nursing (Philippines)" };
  }

  if (
    combined.includes("pharm") ||
    combined.includes("drug") ||
    combined.includes("medication") ||
    combined.includes("dosage")
  ) {
    return { id: "pharmacology", name: "Pharmacology" };
  }

  if (
    combined.includes("med-surg") ||
    combined.includes("medical-surgical") ||
    combined.includes("surgery") ||
    combined.includes("cardiac") ||
    combined.includes("postop")
  ) {
    return { id: "medical-surgical", name: "Medical-Surgical Nursing" };
  }

  if (
    combined.includes("maternal") ||
    combined.includes("child") ||
    combined.includes("obstetric") ||
    combined.includes("newborn") ||
    combined.includes("apgar") ||
    combined.includes("pedia")
  ) {
    return { id: "maternal-child", name: "Maternal and Child Nursing" };
  }

  if (
    combined.includes("psych") ||
    combined.includes("mental") ||
    combined.includes("depression") ||
    combined.includes("bipolar") ||
    combined.includes("lithium")
  ) {
    return { id: "psychiatric", name: "Psychiatric Nursing" };
  }

  if (
    combined.includes("anatomy") ||
    combined.includes("physiol") ||
    combined.includes("pacemaker")
  ) {
    return { id: "anatomy-physiology", name: "Anatomy and Physiology" };
  }

  const map: Record<string, { id: string; name: string }> = {
    "community-health-ph": { id: "community-health-ph", name: "Community Health Nursing (Philippines)" },
    fundamentals: { id: "fundamentals", name: "Fundamentals of Nursing" },
    "anatomy-physiology": { id: "anatomy-physiology", name: "Anatomy and Physiology" },
    pharmacology: { id: "pharmacology", name: "Pharmacology" },
    "medical-surgical": { id: "medical-surgical", name: "Medical-Surgical Nursing" },
    "maternal-child": { id: "maternal-child", name: "Maternal and Child Nursing" },
    psychiatric: { id: "psychiatric", name: "Psychiatric Nursing" },
    "nutrition-diet-therapy": { id: "nutrition-diet-therapy", name: "Nutrition and Diet Therapy (NDT)" },
  };

  if (rawSubjectId && map[rawSubjectId]) {
    return map[rawSubjectId];
  }
  return { id: "fundamentals", name: "Fundamentals of Nursing" };
}

function toQuizQuestion(
  q: ReturnType<typeof generateQuestionBank>[number],
  subjectId: string,
  topicId: string,
  source: string
): QuizQuestion {
  return {
    id: q.id,
    subjectId,
    topicId,
    type: "Multiple Choice",
    prompt: q.prompt,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    difficulty: q.difficulty as Difficulty,
    tags: [q.topicCategory ?? "General"],
    source,
  };
}

function toFlashcard(
  fc: ReturnType<typeof generateFlashcardBank>[number],
  subjectId: string,
  topicId: string,
  source: string
): Flashcard {
  return {
    id: fc.id,
    subjectId,
    topicId,
    front: fc.front,
    back: fc.back,
    explanation: fc.explanation,
    difficulty: fc.difficulty as Difficulty,
    tags: [fc.topicCategory ?? "General"],
    source,
    due: "Due now",
    mastery: 0,
  };
}

export function useDynamicStudyData(): DynamicStudyData {
  const [questions, setQuestions] = useState<QuizQuestion[]>(staticQuizQuestions);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(staticFlashcards);
  const [subjectsList, setSubjectsList] = useState<Subject[]>(allRegisteredSubjects);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let hiddenIds: string[] = [];
        try {
          const stored = localStorage.getItem(HIDDEN_DEFAULTS_KEY);
          if (stored) hiddenIds = JSON.parse(stored) as string[];
        } catch {
          // ignore
        }

        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const { data, error } = await (supabase as any)
          .from("study_materials")
          .select("id, title, subject_id, summary, file_name, storage_path, created_at")
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("useDynamicStudyData: could not load materials:", error.message);
        }

        if (data) {
          const dbHidden = (data as any[])
            .filter((r) => typeof r.storage_path === "string" && r.storage_path.startsWith("hidden-stock-"))
            .map((r) => (r.storage_path as string).replace("hidden-stock-", ""));
          if (dbHidden.length > 0) {
            hiddenIds = Array.from(new Set([...hiddenIds, ...dbHidden]));
          }
        }

        if (cancelled) return;

        // Filter out static questions and flashcards whose stock material has been removed
        const hiddenSet = new Set(hiddenIds);
        const allStockRemoved =
          hiddenSet.has("chn-lesson-1") &&
          hiddenSet.has("openrn-fundamentals") &&
          hiddenSet.has("openrn-pharmacology") &&
          hiddenSet.has("openrn-maternal-child") &&
          hiddenSet.has("openrn-mental-health");

        const filteredStaticQuestions = allStockRemoved
          ? []
          : staticQuizQuestions.filter((q) => {
              if (
                (hiddenSet.has("chn-lesson-1") || hiddenSet.has("chn-doc")) &&
                q.subjectId === "community-health-ph"
              ) {
                return false;
              }
              if (hiddenSet.has("openrn-fundamentals") && q.subjectId === "fundamentals") {
                return false;
              }
              if (
                (hiddenSet.has("openrn-pharmacology") || hiddenSet.has("pharm-summary-doc")) &&
                q.subjectId === "pharmacology"
              ) {
                return false;
              }
              if (
                (hiddenSet.has("openrn-maternal-child") || hiddenSet.has("mchn-summary-doc")) &&
                q.subjectId === "maternal-child"
              ) {
                return false;
              }
              if (hiddenSet.has("openrn-mental-health") && q.subjectId === "psychiatric") {
                return false;
              }
              return true;
            });

        const filteredStaticFlashcards = allStockRemoved
          ? []
          : staticFlashcards.filter((fc) => {
              if (
                (hiddenSet.has("chn-lesson-1") || hiddenSet.has("chn-doc")) &&
                fc.subjectId === "community-health-ph"
              ) {
                return false;
              }
              if (hiddenSet.has("openrn-fundamentals") && fc.subjectId === "fundamentals") {
                return false;
              }
              if (
                (hiddenSet.has("openrn-pharmacology") || hiddenSet.has("pharm-summary-doc")) &&
                fc.subjectId === "pharmacology"
              ) {
                return false;
              }
              if (
                (hiddenSet.has("openrn-maternal-child") || hiddenSet.has("mchn-summary-doc")) &&
                fc.subjectId === "maternal-child"
              ) {
                return false;
              }
              if (hiddenSet.has("openrn-mental-health") && fc.subjectId === "psychiatric") {
                return false;
              }
              return true;
            });

        // Generate questions & flashcards from all uploaded materials
        const uploadedQuestions: QuizQuestion[] = [];
        const uploadedFlashcards: Flashcard[] = [];

        const realRows = ((data ?? []) as any[]).filter(
          (r) => typeof r.storage_path !== "string" || !r.storage_path.startsWith("hidden-stock-")
        );

        for (const row of realRows) {
          const subjectInfo = resolveSubjectInfo(
            row.subject_id,
            row.title,
            row.file_name,
            row.summary
          );
          const subjectId = subjectInfo.id;
          const topicId = subjectId + "-uploaded";
          const source = (row.file_name ?? row.title ?? "Uploaded Material") as string;
          const title = (row.title ?? "Study Material") as string;
          const summaryText = (row.summary ?? "") as string;

          // Generate 150 practice questions & 50 flashcards per material
          const genQ = generateQuestionBank(row.id, title, 150, subjectInfo.name, summaryText);
          const genFC = generateFlashcardBank(row.id, 50, title, subjectInfo.name, summaryText);

          for (const q of genQ) {
            uploadedQuestions.push(toQuizQuestion(q, subjectId, topicId, source));
          }
          for (const fc of genFC) {
            uploadedFlashcards.push(toFlashcard(fc, subjectId, topicId, source));
          }
        }

        if (cancelled) return;

        const mergedQuestions = [...filteredStaticQuestions, ...uploadedQuestions];
        const mergedFlashcards = [...filteredStaticFlashcards, ...uploadedFlashcards];

        // Collect all subject IDs that have questions or flashcards
        const activeSubjectIds = new Set<string>();
        for (const q of mergedQuestions) activeSubjectIds.add(q.subjectId);
        for (const fc of mergedFlashcards) activeSubjectIds.add(fc.subjectId);

        // Filter subjects to those that either have items or are registered
        const dynamicSubjects = allRegisteredSubjects.filter(
          (s) => activeSubjectIds.has(s.id) || !allStockRemoved
        );

        // Ensure any uploaded subject that might not be in standard list is included
        for (const row of realRows) {
          const info = resolveSubjectInfo(row.subject_id, row.title, row.file_name, row.summary);
          if (!dynamicSubjects.some((s) => s.id === info.id)) {
            dynamicSubjects.push({
              id: info.id,
              name: info.name,
              description: `Uploaded study materials for ${info.name}`,
              icon: "BookOpen",
              accent: "teal",
              topics: [
                {
                  id: info.id + "-uploaded",
                  name: "Uploaded Notes & Reviewers",
                  description: "Questions and flashcards generated from uploaded study files.",
                  mastery: 0,
                },
              ],
            });
          }
        }

        setQuestions(mergedQuestions);
        setFlashcards(mergedFlashcards);
        setSubjectsList(dynamicSubjects);
      } catch (err) {
        console.error("useDynamicStudyData error:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { questions, flashcards, subjects: subjectsList, isLoading };
}
