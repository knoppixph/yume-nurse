/**
 * Admin Curriculum Manager
 * Allows admins to add/remove subjects and topics.
 * Stored in localStorage under "yumenurse_curriculum_v1".
 * Structure mirrors the Subject type from @/types/study.
 */

import type { Subject } from "@/types/study";
import { subjects as defaultSubjects } from "@/lib/study-data";

const STORAGE_KEY = "yumenurse_curriculum_v1";

export type CurriculumStore = {
  // IDs of default subjects that have been hidden by admin
  hiddenSubjectIds: string[];
  // Admin-created custom subjects
  customSubjects: Subject[];
};

const DEFAULT_STORE: CurriculumStore = {
  hiddenSubjectIds: [],
  customSubjects: [],
};

export function loadCurriculum(): CurriculumStore {
  if (typeof window === "undefined") return DEFAULT_STORE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STORE, ...JSON.parse(raw) } : DEFAULT_STORE;
  } catch {
    return DEFAULT_STORE;
  }
}

export function saveCurriculum(store: CurriculumStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

/** Get all visible subjects (default - hidden + custom) */
export function getActiveSubjects(): Subject[] {
  const store = loadCurriculum();
  const visibleDefaults = defaultSubjects.filter(
    (s) => !store.hiddenSubjectIds.includes(s.id)
  );
  return [...visibleDefaults, ...store.customSubjects];
}

/** Hide a default subject or delete a custom subject */
export function removeSubject(subjectId: string): void {
  const store = loadCurriculum();
  const isDefault = defaultSubjects.some((s) => s.id === subjectId);

  if (isDefault) {
    if (!store.hiddenSubjectIds.includes(subjectId)) {
      store.hiddenSubjectIds.push(subjectId);
    }
  } else {
    store.customSubjects = store.customSubjects.filter((s) => s.id !== subjectId);
  }

  saveCurriculum(store);
}

/** Restore a hidden default subject */
export function restoreSubject(subjectId: string): void {
  const store = loadCurriculum();
  store.hiddenSubjectIds = store.hiddenSubjectIds.filter((id) => id !== subjectId);
  saveCurriculum(store);
}

/** Add a new custom subject */
export function addSubject(subject: Subject): void {
  const store = loadCurriculum();
  // Prevent duplicate IDs
  if (!store.customSubjects.some((s) => s.id === subject.id)) {
    store.customSubjects.push(subject);
  }
  saveCurriculum(store);
}

/** Add a topic to a custom subject */
export function addTopicToSubject(
  subjectId: string,
  topic: Subject["topics"][number]
): void {
  const store = loadCurriculum();
  const subject = store.customSubjects.find((s) => s.id === subjectId);
  if (subject && !subject.topics.some((t) => t.id === topic.id)) {
    subject.topics.push(topic);
    saveCurriculum(store);
  }
}

/** Remove a topic from a custom subject */
export function removeTopicFromSubject(subjectId: string, topicId: string): void {
  const store = loadCurriculum();
  const subject = store.customSubjects.find((s) => s.id === subjectId);
  if (subject) {
    subject.topics = subject.topics.filter((t) => t.id !== topicId);
    saveCurriculum(store);
  }
}
