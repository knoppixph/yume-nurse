"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { subjects } from "@/lib/study-data";
import { validateFileUpload } from "@/lib/auth/validation";
import { cn } from "@/lib/utils";
import { MaterialStudyModal } from "@/components/material-study-modal";
import { buildMaterialStudySet, type MaterialStudySet } from "@/services/material-study-pack";

export type StudyMaterial = {
  id: string;
  title: string;
  filename: string;
  source: string;
  subject: string;
  subjectId: string;
  topics: string;
  dateAdded: string;
  size: string;
  fileUrl: string;
  quizCount: number;
  flashcardCount: number;
  isCustom?: boolean;
  ownerId?: string | null;
  isOwner?: boolean;
};

const DEFAULT_MATERIALS: StudyMaterial[] = [
  {
    id: "chn-lesson-1",
    title: "Community Health Nursing I: Overview of Public Health Nursing in the Philippines",
    filename: "CHN-LESSON-1-JULY-29.pdf",
    source: "Lady of Lourdes Hospital & Colleges of Caybiga Inc.",
    subject: "Community Health Nursing (Philippines)",
    subjectId: "community-health-ph",
    topics: "Public Health (C.E. Winslow 3Ps), Araceli Maglaya CHN, Primary Health Care (LOI 949), 8 Elements, 4 A's, Generics Act (RA 6675), Healthcare Delivery Levels (RHU, BHS, PGH, PHC, POC, NCMH)",
    dateAdded: "July 29, 2026",
    size: "2.5 MB",
    fileUrl: "/materials/CHN-LESSON-1-JULY-29.pdf",
    quizCount: 9,
    flashcardCount: 6,
  },
  {
    id: "openrn-fundamentals",
    title: "Open RN Nursing Fundamentals & ADPIE Clinical Study Guide (2nd Edition)",
    filename: "OpenRN_Nursing_Fundamentals_Summary.md",
    source: "Open RN / NCBI Bookshelf (NBK610815)",
    subject: "Fundamentals of Nursing",
    subjectId: "fundamentals",
    topics: "ADPIE Nursing Process, Vital Signs, Korotkoff sounds, Standard/Contact/Droplet/Airborne Precautions, PPE Donning & Doffing Sequence, RACE Fire Safety, and Pain 5th Vital Sign",
    dateAdded: "August 2026",
    size: "2.3 KB",
    fileUrl: "/materials/OpenRN_Nursing_Fundamentals_Summary.md",
    quizCount: 7,
    flashcardCount: 4,
  },
  {
    id: "openrn-pharmacology",
    title: "Open RN Nursing Pharmacology & High-Alert PINCH Medication Guide (2nd Edition)",
    filename: "OpenRN_Nursing_Pharmacology_Summary.md",
    source: "Open RN / NCBI Bookshelf (NBK595000)",
    subject: "Pharmacology",
    subjectId: "pharmacology",
    topics: "Pharmacokinetics (ADME), Half-life, Peak/Trough, High-Alert PINCH Meds (Potassium, Insulin, Narcotics, Chemo, Heparin), 10 Rights of Med Admin, Critical Antidotes (Naloxone, Protamine, Vitamin K)",
    dateAdded: "August 2026",
    size: "2.2 KB",
    fileUrl: "/materials/OpenRN_Nursing_Pharmacology_Summary.md",
    quizCount: 7,
    flashcardCount: 3,
  },
  {
    id: "openrn-maternal-child",
    title: "Open RN Maternal & Child Health Nursing, Obstetric Calculations & APGAR Guide",
    filename: "OpenRN_Maternal_Child_Nursing_Summary.md",
    source: "Open RN / NCBI Bookshelf (NBK615319)",
    subject: "Maternal and Child Nursing",
    subjectId: "maternal-child",
    topics: "Naegele's Rule EDD Calculation, GTPAL Obstetric History, 4 Stages of Labor, True vs False Labor, Postpartum Hemorrhage & Fundal Massage, APGAR 1 & 5 min Scoring, Acrocyanosis",
    dateAdded: "August 2026",
    size: "1.9 KB",
    fileUrl: "/materials/OpenRN_Maternal_Child_Nursing_Summary.md",
    quizCount: 7,
    flashcardCount: 2,
  },
  {
    id: "openrn-mental-health",
    title: "Open RN Psychiatric & Mental Health Nursing, Communication & Psychopharm Guide",
    filename: "OpenRN_Mental_Health_Nursing_Summary.md",
    source: "Open RN / NCBI Bookshelf (NBK616982)",
    subject: "Psychiatric Nursing",
    subjectId: "psychiatric",
    topics: "Therapeutic Communication vs Non-Therapeutic Traps, Mild/Moderate/Severe/Panic Anxiety, Psychosis Reality Testing, Lithium Range (0.6-1.2 mEq/L), Serotonin Syndrome, Bipolar Nutrition",
    dateAdded: "August 2026",
    size: "1.9 KB",
    fileUrl: "/materials/OpenRN_Mental_Health_Nursing_Summary.md",
    quizCount: 7,
    flashcardCount: 2,
  },
  {
    id: "mchn-summary-doc",
    title: "Maternal and Child Health Nursing (MCHN) Comprehensive Reviewer",
    filename: "MCHN_Summary.docx",
    source: "Philippine Nursing Curriculum Summary",
    subject: "Maternal and Child Nursing",
    subjectId: "maternal-child",
    topics: "Goals of MCHN, 4 Phases of Health Care (Promotion, Maintenance, Restoration, Rehabilitation), Nursing Theories (Calista Roy, Dorothea Orem, Patricia Benner)",
    dateAdded: "July 2026",
    size: "28 KB",
    fileUrl: "/materials/MCHN_Summary.docx",
    quizCount: 7,
    flashcardCount: 2,
  },
  {
    id: "pharm-summary-doc",
    title: "Introduction to Nursing Pharmacology Reviewer",
    filename: "Introduction_to_Nursing_Pharmacology_Summary.docx",
    source: "Philippine Nursing Curriculum Summary",
    subject: "Pharmacology",
    subjectId: "pharmacology",
    topics: "Science of Pharmacology, ADME, Ethical Principles (Beneficence, Non-maleficence, Autonomy, Veracity, Fidelity), Forerunners of Pharmacology, Paracetamol Mechanism",
    dateAdded: "July 2026",
    size: "37 KB",
    fileUrl: "/materials/Introduction_to_Nursing_Pharmacology_Summary.docx",
    quizCount: 7,
    flashcardCount: 3,
  },
  {
    id: "chn-doc",
    title: "Community Health Nursing I Comprehensive Textbook Notes",
    filename: "Community_Health_Nursing_I.docx",
    source: "Philippine Nursing Curriculum Summary",
    subject: "Community Health Nursing (Philippines)",
    subjectId: "community-health-ph",
    topics: "Public Health Standards in the Philippines, Roles and Responsibilities of Community Health Nurse, 10 Essential Functions of Public Health",
    dateAdded: "July 2026",
    size: "33 KB",
    fileUrl: "/materials/Community_Health_Nursing_I.docx",
    quizCount: 9,
    flashcardCount: 6,
  },
];

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes > 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return Math.round(bytes / 1024) + " KB";
}

const HIDDEN_DEFAULTS_KEY = "nursemate_hidden_default_materials";

export function MaterialsManager() {
  const [customMaterials, setCustomMaterials] = useState<StudyMaterial[]>([]);
  const [hiddenDefaultIds, setHiddenDefaultIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "fundamentals");
  const [topics, setTopics] = useState("");
  const [source, setSource] = useState("My Nursing School Reviewer");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [studySet, setStudySet] = useState<MaterialStudySet | null>(null);
  const [studyMode, setStudyMode] = useState<"quiz" | "flashcards" | null>(null);

  // Load hidden default items from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(HIDDEN_DEFAULTS_KEY);
        if (stored) {
          setHiddenDefaultIds(JSON.parse(stored));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Load all shared materials from Supabase
  const loadMaterials = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const uid = user?.id ?? null;
      setCurrentUserId(uid);

      // Query ALL shared study materials so all accounts sync
      const { data, error: dbError } = await supabase
        .from("study_materials")
        .select("*")
        .order("created_at", { ascending: false });

      if (dbError) {
        console.error("Failed to load materials:", dbError.message);
        return;
      }

      if (data) {
        // Sync any stock guides hidden by either account
        const dbHidden = data
          .filter((r) => r.storage_path.startsWith("hidden-stock-"))
          .map((r) => r.storage_path.replace("hidden-stock-", ""));
        if (dbHidden.length > 0) {
          setHiddenDefaultIds((prev) => Array.from(new Set([...prev, ...dbHidden])));
        }

        const realRows = data.filter((r) => !r.storage_path.startsWith("hidden-stock-"));

        const loaded: StudyMaterial[] = await Promise.all(
          realRows.map(async (row) => {
            let fileUrl = "#";
            try {
              const { data: publicUrlData } = supabase.storage
                .from("study-materials")
                .getPublicUrl(row.storage_path);

              if (publicUrlData?.publicUrl) {
                fileUrl = publicUrlData.publicUrl;
              }

              const { data: signedData } = await supabase.storage
                .from("study-materials")
                .createSignedUrl(row.storage_path, 60 * 60 * 24);

              if (signedData?.signedUrl) {
                fileUrl = signedData.signedUrl;
              }
            } catch (storageErr) {
              console.warn("Storage lookup warning:", storageErr);
            }

            // Extract subject ID if tagged in summary
            let matchedSubjectId = row.subject_id;
            let displayTopics = row.summary ?? "Custom nursing study notes and clinical reference material.";
            if (row.summary?.startsWith("[Subject:")) {
              const match = row.summary.match(/^\[Subject:([^\]]+)\]\s*([\s\S]*)$/);
              if (match) {
                if (!matchedSubjectId) matchedSubjectId = match[1];
                displayTopics = match[2] || "Custom nursing study notes and clinical reference material.";
              }
            }

            const selectedSubject = subjects.find((s) => s.id === matchedSubjectId);

            return {
              id: row.id,
              title: row.title,
              filename: row.file_name,
              source: displayTopics,
              subject: selectedSubject?.name ?? "General Nursing",
              subjectId: matchedSubjectId ?? "fundamentals",
              topics: displayTopics,
              dateAdded: new Date(row.created_at).toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              size: formatBytes(row.file_size_bytes),
              fileUrl,
              quizCount: 5,
              flashcardCount: 5,
              isCustom: true,
              ownerId: row.owner_id,
              isOwner: Boolean(uid && row.owner_id === uid),
            };
          })
        );
        setCustomMaterials(loaded);
      }
    } catch (err) {
      console.error("Unexpected error loading materials:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();

    // Set up real-time multi-account synchronization
    let channel: any = null;
    import("@/lib/supabase/client")
      .then(({ createClient }) => {
        const supabase = createClient();
        channel = supabase
          .channel("study_materials_sync")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "study_materials" },
            () => {
              loadMaterials();
            }
          )
          .subscribe();
      })
      .catch((err) => console.error("Realtime subscription error:", err));

    return () => {
      if (channel) {
        import("@/lib/supabase/client").then(({ createClient }) => {
          const supabase = createClient();
          supabase.removeChannel(channel);
        });
      }
    };
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setError(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const check = validateFileUpload(file);
    if (!check.valid) {
      setError(check.error || "Invalid file.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedFile) {
      setError("Please select a study material file (PDF, DOCX, or MD).");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title for the study material.");
      return;
    }

    setIsUploading(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError(
          "Please log in to your account first so your uploaded materials synchronize across all devices and accounts."
        );
        setIsUploading(false);
        return;
      }

      const timestamp = Date.now();
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${user.id}/${timestamp}-${safeName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("study-materials")
        .upload(storagePath, selectedFile, {
          cacheControl: "3600",
          upsert: true,
          contentType: selectedFile.type || "application/octet-stream",
        });

      if (uploadError) {
        if (
          uploadError.message.toLowerCase().includes("bucket not found") ||
          uploadError.message.toLowerCase().includes("row-level security")
        ) {
          setError(
            `Supabase Storage: ${uploadError.message}. Make sure the 'study-materials' bucket is created in Supabase Dashboard -> Storage.`
          );
        } else {
          setError(`Upload failed: ${uploadError.message}`);
        }
        setIsUploading(false);
        return;
      }

      // Verify if subjectId exists in the database subjects table to avoid foreign key errors
      let validSubjectId: string | null = null;
      if (subjectId) {
        try {
          const { data: dbSub } = await (supabase as any)
            .from("subjects")
            .select("id")
            .eq("id", subjectId)
            .maybeSingle();
          if (dbSub?.id) {
            validSubjectId = dbSub.id;
          }
        } catch {
          validSubjectId = null;
        }
      }

      const summaryWithSubject = `[Subject:${subjectId}] ${topics.trim() || source.trim() || ""}`;

      // 2. Insert into study_materials table with visibility: 'public' so all accounts see it
      const { data: row, error: dbError } = await supabase
        .from("study_materials")
        .insert({
          owner_id: user.id,
          uploaded_by: user.id,
          subject_id: validSubjectId,
          title: title.trim(),
          file_name: selectedFile.name,
          storage_bucket: "study-materials",
          storage_path: storagePath,
          mime_type: selectedFile.type || "application/octet-stream",
          file_size_bytes: selectedFile.size,
          summary: summaryWithSubject,
          visibility: "public",
        })
        .select()
        .single();

      if (dbError) {
        await supabase.storage.from("study-materials").remove([storagePath]);
        setError(`Database save error: ${dbError.message}`);
        setIsUploading(false);
        return;
      }

      let fileUrl = "#";
      const { data: signedData } = await supabase.storage
        .from("study-materials")
        .createSignedUrl(storagePath, 60 * 60 * 24);

      if (signedData?.signedUrl) {
        fileUrl = signedData.signedUrl;
      }

      const selectedSubject = subjects.find((s) => s.id === subjectId);
      const newMaterial: StudyMaterial = {
        id: row.id,
        title: title.trim(),
        filename: selectedFile.name,
        source: source.trim() || "Uploaded Nursing Material",
        subject: selectedSubject?.name ?? "General Nursing",
        subjectId: subjectId || "fundamentals",
        topics: topics.trim() || "Custom nursing study notes and clinical reference material.",
        dateAdded: "Just now",
        size: formatBytes(selectedFile.size),
        fileUrl,
        quizCount: 5,
        flashcardCount: 5,
        isCustom: true,
        ownerId: user.id,
        isOwner: true,
      };

      setCustomMaterials((prev) => [newMaterial, ...prev]);
      setSuccess(
        `"${title.trim()}" uploaded successfully! Synced across all accounts and ready for quizzes & flashcards.`
      );
      setSelectedFile(null);
      setTitle("");
      setTopics("");

      const fileInput = document.getElementById("material-file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: unknown) {
      setError(`Unexpected error: ${err instanceof Error ? err.message : "Please try again."}`);
    } finally {
      setIsUploading(false);
    }
  }

  // Open interactive quiz for this specific material
  function handleOpenQuiz(material: StudyMaterial) {
    const set = buildMaterialStudySet(
      material.id,
      material.title,
      material.topics,
      material.subject
    );
    setStudySet(set);
    setStudyMode("quiz");
  }

  // Open interactive flashcards for this specific material
  function handleOpenFlashcards(material: StudyMaterial) {
    const set = buildMaterialStudySet(
      material.id,
      material.title,
      material.topics,
      material.subject
    );
    setStudySet(set);
    setStudyMode("flashcards");
  }

  // Remove all stock default guides at once
  async function handleRemoveAllStock() {
    const confirmRemove = window.confirm(
      "Remove all default stock guides so only your uploaded files remain in the library?"
    );
    if (!confirmRemove) return;

    const allStockIds = DEFAULT_MATERIALS.map((m) => m.id);
    setHiddenDefaultIds(allStockIds);
    if (typeof window !== "undefined") {
      localStorage.setItem(HIDDEN_DEFAULTS_KEY, JSON.stringify(allStockIds));
    }

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const inserts = DEFAULT_MATERIALS.map((m) => ({
        owner_id: user?.id ?? null,
        title: `HIDDEN_STOCK:${m.id}`,
        file_name: m.filename,
        storage_bucket: "study-materials",
        storage_path: `hidden-stock-${m.id}`,
        mime_type: "text/plain",
        file_size_bytes: 1,
        visibility: "public" as const,
      }));

      await supabase.from("study_materials").upsert(inserts, { onConflict: "storage_path" });
    } catch (err) {
      console.warn("Non-blocking remove stock note:", err);
    }

    setSuccess("All stock guides removed! Only your uploaded files now appear in your library.");
  }

  // Remove uploaded or default material
  async function handleRemove(material: StudyMaterial) {
    const confirmRemove = window.confirm(
      `Are you sure you want to remove "${material.title}"?`
    );
    if (!confirmRemove) return;

    setDeletingId(material.id);
    setError(null);

    // If it's a default preloaded material, hide it and sync to DB across accounts
    if (!material.isCustom) {
      const nextHidden = [...hiddenDefaultIds, material.id];
      setHiddenDefaultIds(nextHidden);
      if (typeof window !== "undefined") {
        localStorage.setItem(HIDDEN_DEFAULTS_KEY, JSON.stringify(nextHidden));
      }

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("study_materials").insert({
          owner_id: user?.id ?? null,
          title: `HIDDEN_STOCK:${material.id}`,
          file_name: material.filename,
          storage_bucket: "study-materials",
          storage_path: `hidden-stock-${material.id}`,
          mime_type: "text/plain",
          file_size_bytes: 1,
          visibility: "public",
        });
      } catch (err) {
        console.warn("Non-blocking hidden stock note:", err);
      }

      setDeletingId(null);
      setSuccess(`"${material.title}" removed from your study library.`);
      return;
    }

    // If it's a custom/uploaded material, delete from Supabase DB and Storage
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error: dbError } = await supabase
        .from("study_materials")
        .delete()
        .eq("id", material.id);

      if (dbError) {
        setError(`Failed to delete material: ${dbError.message}`);
        setDeletingId(null);
        return;
      }

      // Clean up storage file if available
      try {
        await supabase.storage
          .from("study-materials")
          .remove([`${material.ownerId}/${material.filename}`]);
      } catch {
        // non-blocking
      }

      setCustomMaterials((prev) => prev.filter((m) => m.id !== material.id));
      setSuccess(`"${material.title}" has been permanently removed.`);
    } catch (err) {
      console.error("Delete error:", err);
      setError("An unexpected error occurred while deleting the material.");
    } finally {
      setDeletingId(null);
    }
  }

  // Reset hidden default materials
  function handleRestoreDefaults() {
    setHiddenDefaultIds([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(HIDDEN_DEFAULTS_KEY);
    }
    setSuccess("Default nursing review library guides restored.");
  }

  const visibleDefaults = DEFAULT_MATERIALS.filter(
    (m) => !hiddenDefaultIds.includes(m.id)
  );

  const allMaterials = [...customMaterials, ...visibleDefaults];

  return (
    <div className="space-y-6">
      {/* Upload Form Card */}
      <Card className="shadow-sm border-sky-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-800">
                <Upload className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950">Upload Nursing Study Material</h2>
                <p className="text-xs text-slate-600">
                  Upload PDF slides, DOCX reviewers, or notes. Synchronized in real-time across all accounts!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <Users className="h-3.5 w-3.5 text-emerald-600" />
              <span>Multi-Account Sync Active</span>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-700">Document Title</span>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pharmacology - Cardiovascular Drugs Reviewer"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-700">Nursing Subject</span>
                <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-700">Source / College</span>
                <Input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. School Lecture Notes / OER Reference"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-700">Topics Covered</span>
                <Input
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  placeholder="e.g. ACE Inhibitors, Beta Blockers, Digoxin toxicity"
                />
              </label>
            </div>

            {/* File Input */}
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
              <input
                type="file"
                id="material-file-upload"
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.md,.txt"
                className="hidden"
              />
              <label
                htmlFor="material-file-upload"
                className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-900 border border-slate-300 shadow-2xs hover:bg-slate-50"
              >
                <Upload className="h-4 w-4 text-sky-700" />
                {selectedFile ? selectedFile.name : "Choose PDF / DOCX / Markdown File"}
              </label>
              <p className="mt-2 text-[11px] text-slate-500">
                Max file size: 25MB (PDF, Word Document, or Markdown notes)
              </p>
            </div>

            {error ? (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-bold text-rose-800 border border-rose-200">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div className="flex items-center gap-2 rounded-lg bg-teal-50 p-3 text-xs font-bold text-teal-800 border border-teal-200">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                <span>{success}</span>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <Plus className="h-4 w-4" />
              {isUploading ? "Uploading & Syncing..." : "Upload & Sync Material"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Materials List */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-950">Active Nursing Review Library</h2>
              <button
                onClick={() => loadMaterials()}
                className="rounded-md p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title="Refresh Library"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {visibleDefaults.length > 0 && (
                <button
                  onClick={handleRemoveAllStock}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                  title="Remove all default stock guides so only your uploads appear"
                >
                  <Trash2 className="h-3 w-3 text-rose-500" />
                  <span>Remove All Stock Files ({visibleDefaults.length})</span>
                </button>
              )}
              {hiddenDefaultIds.length > 0 && (
                <button
                  onClick={handleRestoreDefaults}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                  title="Restore hidden default guides"
                >
                  <RotateCcw className="h-3 w-3" />
                  Restore Defaults ({hiddenDefaultIds.length} hidden)
                </button>
              )}
              {customMaterials.length > 0 && (
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
                  {customMaterials.length} Shared Uploads
                </span>
              )}
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                {allMaterials.length} Active Guides
              </span>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-6 text-sm text-slate-500 gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-sky-600" />
              <span>Syncing study library...</span>
            </div>
          )}

          {allMaterials.map((material) => (
            <div
              key={material.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-emerald-300 hover:bg-emerald-50/30 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-900">
                    {material.subject}
                  </span>
                  <span className="rounded-md bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    {material.size}
                  </span>
                  {material.isCustom ? (
                    material.isOwner ? (
                      <span className="rounded-md bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800">
                        Uploaded by You
                      </span>
                    ) : (
                      <span className="rounded-md bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 flex items-center gap-1">
                        <Users className="h-3 w-3" /> Shared Study Material
                      </span>
                    )
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Quizzes Synced ({material.quizCount} questions)
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-950">{material.title}</h3>
                <p className="text-xs font-semibold text-slate-500">Source: {material.source}</p>
                <p className="text-xs leading-relaxed text-slate-600 max-w-2xl">{material.topics}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
                {material.fileUrl && material.fileUrl !== "#" ? (
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={material.filename}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4 text-slate-600" />
                    View File
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleOpenQuiz(material)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <Sparkles className="h-4 w-4" />
                  Practice Quiz
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenFlashcards(material)}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700"
                >
                  <BookOpen className="h-4 w-4" />
                  Flashcards
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(material)}
                  disabled={deletingId === material.id}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-2 text-xs font-bold text-rose-600 shadow-2xs transition hover:bg-rose-50 hover:border-rose-300 disabled:opacity-50"
                  title="Remove Material"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Interactive Practice Quiz & Flashcard Modal */}
      {studyMode && studySet && (
        <MaterialStudyModal
          studySet={studySet}
          initialMode={studyMode}
          onClose={() => {
            setStudyMode(null);
            setStudySet(null);
          }}
        />
      )}
    </div>
  );
}
