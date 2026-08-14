"use client";

import { useMemo, useState } from "react";

export function useLocalStudyProgress(initialMastery: number) {
  const [mastery, setMastery] = useState(initialMastery);

  return useMemo(
    () => ({
      mastery,
      increase: (amount: number) => setMastery((value) => Math.min(100, value + amount)),
      decrease: (amount: number) => setMastery((value) => Math.max(0, value - amount)),
      reset: () => setMastery(initialMastery),
    }),
    [initialMastery, mastery],
  );
}

