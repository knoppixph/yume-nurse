"use client";

import { useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { subjects } from "@/lib/study-data";
import { validateFileUpload } from "@/lib/auth/validation";
import { cn } from "@/lib/utils";

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

export function MaterialsManager() {
  const [materials, setMaterials] = useState<StudyMaterial[]>(DEFAULT_MATERIALS);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "fundamentals");
  const [topics, setTopics] = useState("");
  const [source, setSource] = useState("My Nursing School Reviewer");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  function handleUpload(e: React.FormEvent) {
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

    setTimeout(() => {
      const selectedSubject = subjects.find((s) => s.id === subjectId);
      const sizeFormatted =
        selectedFile.size > 1024 * 1024
          ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(selectedFile.size / 1024)} KB`;

      const newMaterial: StudyMaterial = {
        id: "custom-" + Date.now(),
        title: title.trim(),
        filename: selectedFile.name,
        source: source.trim() || "Uploaded Nursing Material",
        subject: selectedSubject?.name ?? "General Nursing",
        subjectId,
        topics: topics.trim() || "Custom nursing study notes and clinical reference material.",
        dateAdded: "Today",
        size: sizeFormatted,
        fileUrl: "#",
        quizCount: 5,
        flashcardCount: 5,
        isCustom: true,
      };

      setMaterials((prev) => [newMaterial, ...prev]);
      setSuccess(`"${title}" uploaded successfully! 5 practice quiz questions and flashcards staged.`);
      setSelectedFile(null);
      setTitle("");
      setTopics("");
      setIsUploading(false);
    }, 600);
  }

  function handleDelete(id: string) {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Upload Form Card */}
      <Card className="shadow-sm border-sky-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-800">
              <Upload className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-950">Upload Nursing Study Material</h2>
              <p className="text-xs text-slate-600">
                Upload PDF lecture slides or DOCX reviewers to sync with your flashcard and quiz generator.
              </p>
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
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              {isUploading ? "Uploading & Processing..." : "Upload Material"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Materials List */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-950">Active Nursing Review Library ({materials.length})</h2>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              {materials.length} Active Guides
            </span>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 p-6">
          {materials.map((material) => (
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
                  <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Quizzes Synced ({material.quizCount} questions)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-950">{material.title}</h3>
                <p className="text-xs font-semibold text-slate-500">Source: {material.source}</p>
                <p className="text-xs leading-relaxed text-slate-600 max-w-2xl">{material.topics}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
                {material.fileUrl !== "#" ? (
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4" />
                    View File
                  </a>
                ) : null}
                <Link
                  href="/quiz"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <Sparkles className="h-4 w-4" />
                  Practice Quiz
                </Link>
                <Link
                  href="/flashcards"
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700"
                >
                  <BookOpen className="h-4 w-4" />
                  Flashcards
                </Link>
                {material.isCustom ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(material.id)}
                    className="rounded-lg p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Material"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
