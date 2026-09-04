import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export type DailyMotivationMessage = {
  message: string;
  sender: string;
  updatedAt: string;
};

const STORAGE_KEY_DAILY_MESSAGE = "nursemate_daily_message_v1";

export const DEFAULT_MESSAGE: DailyMotivationMessage = {
  message: "Keep going, future nurse. I know you're tired sometimes, but I believe in you. One topic at a time. One quiz at a time. You've got this. ❤️",
  sender: "Yume Nurse Study Team",
  updatedAt: new Date().toISOString(),
};

/**
 * Synchronously load the last cached message from localStorage (or fallback default).
 * Ensures instant UI rendering without layout shift.
 */
export function loadDailyMessage(): DailyMotivationMessage {
  if (typeof window === "undefined") return DEFAULT_MESSAGE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DAILY_MESSAGE);
    return raw ? JSON.parse(raw) : DEFAULT_MESSAGE;
  } catch {
    return DEFAULT_MESSAGE;
  }
}

/**
 * Asynchronously fetch the latest motivation note from Supabase.
 * Checks app_settings table first, falls back to study-materials bucket storage,
 * and updates localStorage cache for all accounts.
 */
export async function fetchDailyMessage(): Promise<DailyMotivationMessage> {
  const cached = loadDailyMessage();
  if (!isSupabaseConfigured()) return cached;

  try {
    const supabase = createClient();

    // 1. Try fetching from public.app_settings table
    try {
      const { data, error } = await (supabase as any)
        .from("app_settings")
        .select("value")
        .eq("key", "daily_motivation_note")
        .maybeSingle();

      if (!error && data?.value && typeof data.value === "object") {
        const val = data.value as DailyMotivationMessage;
        if (val.message) {
          const fresh: DailyMotivationMessage = {
            message: val.message,
            sender: val.sender || "Yume Nurse Study Team",
            updatedAt: val.updatedAt || new Date().toISOString(),
          };
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(STORAGE_KEY_DAILY_MESSAGE, JSON.stringify(fresh));
            } catch {
              // ignore
            }
          }
          return fresh;
        }
      }
    } catch {
      // Table may not exist yet; try storage fallback
    }

    // 2. Try fetching from study-materials storage bucket
    try {
      const { data: fileData, error: fileErr } = await supabase.storage
        .from("study-materials")
        .download("settings/motivation_note.json");

      if (!fileErr && fileData) {
        const text = await fileData.text();
        const parsed = JSON.parse(text) as DailyMotivationMessage;
        if (parsed?.message) {
          const fresh: DailyMotivationMessage = {
            message: parsed.message,
            sender: parsed.sender || "Yume Nurse Study Team",
            updatedAt: parsed.updatedAt || new Date().toISOString(),
          };
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(STORAGE_KEY_DAILY_MESSAGE, JSON.stringify(fresh));
            } catch {
              // ignore
            }
          }
          return fresh;
        }
      }
    } catch {
      // storage file may not exist yet
    }
  } catch (err) {
    console.warn("fetchDailyMessage warning:", err);
  }

  return cached;
}

/**
 * Save the daily motivation message both to localStorage and to Supabase
 * so it synchronizes across all accounts and student devices in real time.
 */
export async function saveDailyMessage(
  message: string,
  sender: string = "NurseMate Study Team"
): Promise<{ success: boolean; error?: string }> {
  const payload: DailyMotivationMessage = {
    message: message.trim(),
    sender: sender.trim() || "NurseMate Study Team",
    updatedAt: new Date().toISOString(),
  };

  // 1. Immediately save to localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_DAILY_MESSAGE, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  let dbSaved = false;
  let lastError: string | undefined;

  try {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();

    // 2. Try to upsert into public.app_settings table
    try {
      const { error: dbErr } = await (supabase as any)
        .from("app_settings")
        .upsert(
          {
            key: "daily_motivation_note",
            value: payload,
            updated_at: new Date().toISOString(),
            updated_by: authData.user?.id ?? null,
          },
          { onConflict: "key" }
        );

      if (!dbErr) {
        dbSaved = true;
      } else {
        lastError = dbErr.message;
      }
    } catch (e: any) {
      lastError = e?.message;
    }

    // 3. Also upload to study-materials storage bucket as resilient fallback
    try {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      const { error: storageErr } = await supabase.storage
        .from("study-materials")
        .upload("settings/motivation_note.json", blob, {
          upsert: true,
          contentType: "application/json",
        });

      if (!storageErr) {
        dbSaved = true;
      } else if (!dbSaved && !lastError) {
        lastError = storageErr.message;
      }
    } catch (e: any) {
      console.warn("Storage sync note:", e);
    }
  } catch (err: any) {
    lastError = err?.message || "Failed to reach database";
  }

  return { success: dbSaved || !lastError, error: lastError };
}
