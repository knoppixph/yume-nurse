export type DailyMotivationMessage = {
  message: string;
  sender: string;
  updatedAt: string;
};

const STORAGE_KEY_DAILY_MESSAGE = "nursemate_daily_message_v1";

const DEFAULT_MESSAGE: DailyMotivationMessage = {
  message: "Keep going, future nurse. I know you're tired sometimes, but I believe in you. One topic at a time. One quiz at a time. You've got this. ❤️",
  sender: "Yume Nurse Study Team",
  updatedAt: new Date().toISOString(),
};

export function loadDailyMessage(): DailyMotivationMessage {
  if (typeof window === "undefined") return DEFAULT_MESSAGE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DAILY_MESSAGE);
    return raw ? JSON.parse(raw) : DEFAULT_MESSAGE;
  } catch {
    return DEFAULT_MESSAGE;
  }
}

export function saveDailyMessage(message: string, sender: string = "NurseMate Study Team"): void {
  if (typeof window === "undefined") return;
  try {
    const data: DailyMotivationMessage = {
      message,
      sender,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_DAILY_MESSAGE, JSON.stringify(data));
  } catch {
    // ignore
  }
}
