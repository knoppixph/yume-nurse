/**
 * Per-user topic mastery tracking stored in localStorage.
 * Keys are "topicId" and values are 0-100.
 * This is separate from the static study-data which defines curriculum content only.
 */

const STORAGE_KEY = "yumenurse_topic_mastery_v1";

type MasteryMap = Record<string, number>; // topicId -> mastery 0-100

export function loadMasteryMap(): MasteryMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveMasteryMap(map: MasteryMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getTopicMastery(topicId: string): number {
  const map = loadMasteryMap();
  return map[topicId] ?? 0;
}

export function setTopicMastery(topicId: string, mastery: number): void {
  const map = loadMasteryMap();
  map[topicId] = Math.min(100, Math.max(0, Math.round(mastery)));
  saveMasteryMap(map);
}

export function incrementTopicMastery(topicId: string, amount: number): number {
  const current = getTopicMastery(topicId);
  const updated = Math.min(100, current + amount);
  setTopicMastery(topicId, updated);
  return updated;
}

export function getSubjectMastery(topicIds: string[]): number {
  if (topicIds.length === 0) return 0;
  const map = loadMasteryMap();
  const total = topicIds.reduce((sum, id) => sum + (map[id] ?? 0), 0);
  return Math.round(total / topicIds.length);
}
