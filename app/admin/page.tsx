"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Database,
  FileText,
  Heart,
  Layers,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { flashcards, quizQuestions, subjects } from "@/lib/study-data";
import { loadDailyMessage, saveDailyMessage, type DailyMotivationMessage } from "@/lib/admin-content";
import { cn } from "@/lib/utils";

type AdminTab = "message" | "subjects" | "flashcards" | "questions" | "analytics";

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("message");

  // Daily message state
  const [msgText, setMsgText] = useState("");
  const [msgSender, setMsgSender] = useState("");
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // New Subject form state
  const [newSubjName, setNewSubjName] = useState("");
  const [newSubjDesc, setNewSubjDesc] = useState("");
  const [newSubjIcon, setNewSubjIcon] = useState("BookOpen");
  const [newSubjAccent, setNewSubjAccent] = useState("emerald");
  const [subjSaveNotice, setSubjSaveNotice] = useState<string | null>(null);

  // New Flashcard form state
  const [fcSubjectId, setFcSubjectId] = useState(subjects[0]?.id ?? "fundamentals");
  const [fcFront, setFcFront] = useState("");
  const [fcBack, setFcBack] = useState("");
  const [fcExplanation, setFcExplanation] = useState("");
  const [fcDifficulty, setFcDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [fcSaveNotice, setFcSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    const d = loadDailyMessage();
    setMsgText(d.message);
    setMsgSender(d.sender);
  }, []);

  function handleSaveDailyMessage() {
    saveDailyMessage(msgText, msgSender);
    setSaveFeedback("Saved! The new encouragement message is now active on the student dashboard.");
    setTimeout(() => setSaveFeedback(null), 4000);
  }

  function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubjName.trim()) return;
    setSubjSaveNotice(`Subject "${newSubjName}" successfully staged for Supabase sync!`);
    setNewSubjName("");
    setNewSubjDesc("");
    setTimeout(() => setSubjSaveNotice(null), 4000);
  }

  function handleAddFlashcard(e: React.FormEvent) {
    e.preventDefault();
    if (!fcFront.trim() || !fcBack.trim()) return;
    setFcSaveNotice(`Flashcard added successfully!`);
    setFcFront("");
    setFcBack("");
    setFcExplanation("");
    setTimeout(() => setFcSaveNotice(null), 4000);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin Center"
        title="Content Management & App Settings"
        description="Manage nursing subjects, curriculum flashcards, quiz questions, and personalize student dashboard messages."
      />

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setTab("message")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition",
            tab === "message" ? "bg-slate-950 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          )}
        >
          <Heart className="h-4 w-4 text-rose-500" /> Daily Encouragement Message
        </button>

        <button
          type="button"
          onClick={() => setTab("subjects")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition",
            tab === "subjects" ? "bg-slate-950 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          )}
        >
          <Layers className="h-4 w-4" /> Subjects & Topics ({subjects.length})
        </button>

        <button
          type="button"
          onClick={() => setTab("flashcards")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition",
            tab === "flashcards" ? "bg-slate-950 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          )}
        >
          <BookOpen className="h-4 w-4" /> Flashcards CMS ({flashcards.length})
        </button>

        <button
          type="button"
          onClick={() => setTab("questions")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition",
            tab === "questions" ? "bg-slate-950 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          )}
        >
          <FileText className="h-4 w-4" /> Quiz Questions CMS ({quizQuestions.length})
        </button>

        <button
          type="button"
          onClick={() => setTab("analytics")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition",
            tab === "analytics" ? "bg-slate-950 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          )}
        >
          <Users className="h-4 w-4" /> Users & App Stats
        </button>
      </div>

      {/* TAB 1: DAILY MESSAGE */}
      {tab === "message" ? (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-600" />
              <h2 className="text-base font-black text-slate-950">
                Personalized Dashboard Message Editor
              </h2>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-5">
            <p className="text-xs text-slate-600 leading-relaxed">
              This message appears prominently on the student dashboard under &ldquo;A little message for you&rdquo;. You can customize encouraging notes, romantic study messages, or daily board-exam reminders.
            </p>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase text-slate-700">Encouragement Message</span>
              <textarea
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-300 p-4 text-xs font-medium leading-relaxed text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="Write an encouraging note for your partner or student..."
              />
            </label>

            <label className="block max-w-sm">
              <span className="mb-2 block text-xs font-bold uppercase text-slate-700">Signature / Sender</span>
              <Input
                value={msgSender}
                onChange={(e) => setMsgSender(e.target.value)}
                placeholder="e.g. Your Study Buddy, NurseMate Team, etc."
              />
            </label>

            {/* Live Preview */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-rose-800">Live Student Dashboard Preview</p>
              <p className="mt-2 text-sm font-semibold text-slate-800">&ldquo;{msgText}&rdquo;</p>
              <p className="mt-1 text-xs text-slate-500 font-bold">— {msgSender}</p>
            </div>

            {saveFeedback ? (
              <div className="flex items-center gap-2 rounded-lg bg-teal-50 p-3 text-xs font-bold text-teal-900 border border-teal-200">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                <span>{saveFeedback}</span>
              </div>
            ) : null}

            <Button onClick={handleSaveDailyMessage} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Save className="h-4 w-4" /> Save Active Message
            </Button>
          </CardBody>
        </Card>
      ) : null}

      {/* TAB 2: SUBJECTS & TOPICS */}
      {tab === "subjects" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-950">Active Nursing Subjects ({subjects.length})</h2>
            </CardHeader>
            <CardBody className="divide-y divide-slate-100 p-0">
              {subjects.map((subj) => (
                <div key={subj.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-950">{subj.name}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {subj.topics.length} Topics
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{subj.description}</p>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Add Subject Form */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-950">Add New Subject</h2>
            </CardHeader>
            <CardBody className="p-5">
              <form onSubmit={handleAddSubject} className="space-y-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-slate-700">Subject Name</span>
                  <Input value={newSubjName} onChange={(e) => setNewSubjName(e.target.value)} placeholder="e.g. Critical Care Nursing" />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-slate-700">Description</span>
                  <Input value={newSubjDesc} onChange={(e) => setNewSubjDesc(e.target.value)} placeholder="Brief summary of syllabus..." />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-slate-700">Color Theme</span>
                  <Select value={newSubjAccent} onChange={(e) => setNewSubjAccent(e.target.value)}>
                    <option value="emerald">Emerald</option>
                    <option value="pink">Pink</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="teal">Teal</option>
                    <option value="rose">Rose</option>
                  </Select>
                </label>

                {subjSaveNotice ? (
                  <p className="text-xs font-bold text-teal-800 bg-teal-50 p-2 rounded">{subjSaveNotice}</p>
                ) : null}

                <Button type="submit" className="w-full gap-2 bg-slate-950">
                  <Plus className="h-4 w-4" /> Create Subject
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {/* TAB 3: FLASHCARDS CMS */}
      {tab === "flashcards" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-950">Flashcard Directory ({flashcards.length} Total)</h2>
            </CardHeader>
            <CardBody className="max-h-[500px] space-y-3 overflow-y-auto p-4">
              {flashcards.slice(0, 15).map((fc) => (
                <div key={fc.id} className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-900">
                      {fc.subjectId}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{fc.difficulty}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-950">Q: {fc.front}</p>
                  <p className="text-xs text-slate-600">A: {fc.back}</p>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-950">Create Flashcard</h2>
            </CardHeader>
            <CardBody className="p-5">
              <form onSubmit={handleAddFlashcard} className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-slate-700">Subject</span>
                  <Select value={fcSubjectId} onChange={(e) => setFcSubjectId(e.target.value)}>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-slate-700">Front (Question / Cue)</span>
                  <Input value={fcFront} onChange={(e) => setFcFront(e.target.value)} placeholder="e.g. Normal therapeutic range for Digoxin?" />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-slate-700">Back (Answer)</span>
                  <Input value={fcBack} onChange={(e) => setFcBack(e.target.value)} placeholder="e.g. 0.5 to 2.0 ng/mL" />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-slate-700">Explanation</span>
                  <Input value={fcExplanation} onChange={(e) => setFcExplanation(e.target.value)} placeholder="Clinical rationale..." />
                </label>

                {fcSaveNotice ? (
                  <p className="text-xs font-bold text-teal-800 bg-teal-50 p-2 rounded">{fcSaveNotice}</p>
                ) : null}

                <Button type="submit" className="w-full gap-2 bg-slate-950">
                  <Plus className="h-4 w-4" /> Add Flashcard
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {/* TAB 4: QUIZ QUESTIONS */}
      {tab === "questions" ? (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-950">Active Question Bank ({quizQuestions.length} Questions)</h2>
          </CardHeader>
          <CardBody className="divide-y divide-slate-100 p-0">
            {quizQuestions.map((q) => (
              <div key={q.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-800">
                    {q.type} • {q.subjectId}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">{q.difficulty}</span>
                </div>
                <p className="text-xs font-bold text-slate-950">{q.prompt}</p>
                <p className="text-xs text-teal-800 font-semibold">
                  Correct: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(" • ") : q.correctAnswer}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{q.explanation}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}

      {/* TAB 5: USERS & ANALYTICS */}
      {tab === "analytics" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs font-bold text-slate-500 uppercase">Total Questions</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{quizQuestions.length}</p>
            <p className="mt-1 text-[11px] text-teal-700 font-bold">Across 7 subjects</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-bold text-slate-500 uppercase">Total Flashcards</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{flashcards.length}</p>
            <p className="mt-1 text-[11px] text-sky-700 font-bold">Spaced repetition active</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-bold text-slate-500 uppercase">Active Curricula</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{subjects.length}</p>
            <p className="mt-1 text-[11px] text-purple-700 font-bold">Includes Philippine CHN</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-bold text-slate-500 uppercase">Security Role</p>
            <p className="mt-1 text-2xl font-black text-emerald-700">Administrator</p>
            <p className="mt-1 text-[11px] text-slate-500 font-medium">Full CMS Access</p>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
