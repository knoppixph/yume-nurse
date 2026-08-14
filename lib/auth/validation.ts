export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialActionState: ActionState = {
  status: "idle",
  message: "",
};

export function formString(formData: FormData, key: string, maxLength = 1000): string {
  const value = formData.get(key);
  if (typeof value !== "string") return "";
  // Strip control characters and sanitize
  const sanitized = value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  return sanitized.slice(0, maxLength);
}

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
    email,
  );
}

export function isValidPassword(password: string): { valid: boolean; reason?: string } {
  if (!password || password.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters long." };
  }
  if (password.length > 128) {
    return { valid: false, reason: "Password cannot exceed 128 characters." };
  }
  return { valid: true };
}

export function cleanInternalPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value || typeof value !== "string") return fallback;
  // Prevent open redirect attacks (e.g. //evil.com or javascript:)
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("\r") || value.includes("\n")) {
    return fallback;
  }
  return value;
}

export function sanitizeClientError(error: unknown, fallbackMessage = "An unexpected error occurred. Please try again."): string {
  if (!error) return fallbackMessage;

  const msg = error instanceof Error ? error.message : typeof error === "string" ? error : "";

  // Filter out internal SQL, connection strings, or system paths
  if (
    msg.includes("violates foreign key") ||
    msg.includes("syntax error at or near") ||
    msg.includes("relation") ||
    msg.includes("column") ||
    msg.includes("supabase.co") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("PGRST") ||
    msg.includes("JWT")
  ) {
    return fallbackMessage;
  }

  return msg || fallbackMessage;
}

export type FileValidationResult = {
  valid: boolean;
  error?: string;
};

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
  "text/markdown",
  "text/plain",
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export function validateFileUpload(file: File | null | undefined): FileValidationResult {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "File exceeds the 25MB maximum upload limit." };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx|doc|md|txt)$/i)) {
    return { valid: false, error: "Unsupported file type. Please upload a PDF, Word document, or Markdown notes." };
  }

  return { valid: true };
}

export function authSetupMessage(): string {
  return "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.";
}
