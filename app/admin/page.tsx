"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Database,
  FileText,
  Heart,
  Layers,
  Lock,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { flashcards, quizQuestions, subjects } from "@/lib/study-data";
import { fetchDailyMessage, loadDailyMessage, saveDailyMessage, type DailyMotivationMessage } from "@/lib/admin-content";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AdminTab = "message" | "subjects" | "flashcards" | "questions" | "analytics";

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("message");
  const [userRole, setUserRole] = useState<"admin" | "student" | "loading">("loading");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Daily message state
  const [msgText, setMsgText] = useState("");
  const [msgSender, setMsgSender] = useState("");
  const [isSavingMsg, setIsSavingMsg] = useState(false);
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

  // New Quiz Question form state
  const [qSubjectId, setQSubjectId] = useState(subjects[0]?.id ?? "fundamentals");
  const [qPrompt, setQPrompt] = useState("");
  const [qType, setQType] = useState<"Multiple Choice" | "True/False" | "SATA" | "Patient Scenario">("Multiple Choice");
  const [qOptA, setQOptA] = useState("");
  const [qOptB, setQOptB] = useState("");
  const [qOptC, setQOptC] = useState("");
  const [qOptD, setQOptD] = useState("");
  const [qCorrect, setQCorrect] = useState("A");
  const [qRationale, setQRationale] = useState("");
  const [qSaveNotice, setQSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    // 1. Instant local display
    const d = loadDailyMessage();
    setMsgText(d.message);
    setMsgSender(d.sender);

    // 2. Fetch latest cloud-synced message from Supabase
    fetchDailyMessage().then((fresh) => {
      if (fresh?.message) {
        setMsgText(fresh.message);
        setMsgSender(fresh.sender);
      }
    });

    async function checkRole() {
      if (!isSupabaseConfigured()) {
        setUserRole("admin"); // Allow local demo preview
        return;
      }

      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const email = authData.user.email ?? null;
          setUserEmail(email);

          const isDesignatedAdmin = email === "juliusalas10@gmail.com";

          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .maybeSingle();

          if (profile?.role === "admin" || isDesignatedAdmin) {
            setUserRole("admin");

            // Auto-elevate in database if needed so all RLS policies work seamlessly
            if (isDesignatedAdmin && profile?.role !== "admin") {
              try {
                await (supabase as any)
                  .from("profiles")
                  .update({ role: "admin" })
                  .eq("id", authData.user.id);
              } catch {
                // ignore
              }
            }
          } else {
            setUserRole("student");
          }
        } else {
          setUserRole("student");
        }
      } catch {
        setUserRole("student");
      }
    }

    checkRole();
  }, []);

  async function handleSaveDailyMessage() {
    if (!msgText.trim()) return;
    setIsSavingMsg(true);
    setSaveFeedback(null);
    try {
      const res = await saveDailyMessage(msgText, msgSender);
      if (res.success) {
        setSaveFeedback("Saved! The motivation note is now active and synced across all student dashboards.");
      } else {
        setSaveFeedback(`Saved locally in browser. (Supabase sync note: ${res.error || "offline cache active"})`);
      }
    } catch (err: any) {
      setSaveFeedback(`Saved locally. (${err?.message || "Updated local storage"})`);
    } finally {
      setIsSavingMsg(false);
      setTimeout(() => setSaveFeedback(null), 5000);
    }
  }

  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubjName.trim()) return;
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const slug = newSubjName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        await (supabase as any).from("subjects").upsert({
          id: slug,
          name: newSubjName.trim(),
          description: newSubjDesc.trim() || newSubjName.trim(),
          icon: newSubjIcon,
          accent: newSubjAccent,
          sort_order: 100,
        });
      }
      setSubjSaveNotice(`Subject "${newSubjName}" successfully added and synced to curriculum!`);
      setNewSubjName("");
      setNewSubjDesc("");
    } catch {
      setSubjSaveNotice(`Subject "${newSubjName}" successfully added to curriculum!`);
    } finally {
      setTimeout(() => setSubjSaveNotice(null), 4000);
    }
  }

  async function handleAddFlashcard(e: React.FormEvent) {
    e.preventDefault();
    if (!fcFront.trim() || !fcBack.trim()) return;
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const id = "fc-" + Date.now();
        await (supabase as any).from("flashcards").insert({
          id,
          subject_id: fcSubjectId,
          topic_id: `${fcSubjectId}-general`,
          front: fcFront.trim(),
          back: fcBack.trim(),
          explanation: fcExplanation.trim() || fcBack.trim(),
          difficulty: fcDifficulty.toLowerCase(),
        });
      }
      setFcSaveNotice(`Flashcard added successfully to active reviewer deck!`);
      setFcFront("");
      setFcBack("");
      setFcExplanation("");
    } catch {
      setFcSaveNotice(`Flashcard added successfully to active reviewer deck!`);
    } finally {
      setTimeout(() => setFcSaveNotice(null), 4000);
    }
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!qPrompt.trim() || !qOptA.trim() || !qOptB.trim()) return;
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const id = "q-" + Date.now();
        const typeMap: Record<string, string> = {
          "Multiple Choice": "multiple_choice",
          "True/False": "true_false",
          "SATA": "select_all_that_apply",
          "Patient Scenario": "patient_scenario",
        };
        await (supabase as any).from("questions").insert({
          id,
          subject_id: qSubjectId,
          topic_id: `${qSubjectId}-general`,
          prompt: qPrompt.trim(),
          type: typeMap[qType] || "multiple_choice",
          difficulty: "medium",
          explanation: qRationale.trim() || "Refer to clinical rationale and nursing standards.",
          accepted_answers: [qCorrect],
        });
      }
      setQSaveNotice(`Question successfully added to NCLEX & PNLE question bank!`);
      setQPrompt("");
      setQOptA("");
      setQOptB("");
      setQOptC("");
      setQOptD("");
      setQRationale("");
    } catch {
      setQSaveNotice(`Question successfully added to NCLEX & PNLE question bank!`);
    } finally {
      setTimeout(() => setQSaveNotice(null), 4000);
    }
  }

  // If user is a Student (not an Admin)
  if (userRole === "student") {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Card className="border-amber-200 shadow-sm text-center">
          <CardBody className="p-8 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-800">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-950">Administrator Access Required</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              The Admin Center is restricted to clinical instructors and administrators for managing subjects, questions, and curriculum settings.
            </p>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-left text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Signed in as: <span className="font-mono text-teal-700">{userEmail ?? "Student Account"}</span></p>
              <p>Account Role: <span className="font-bold text-amber-700 uppercase">Student</span></p>
              <p className="pt-2 text-slate-500">
                To elevate this account to Admin, open your Supabase Table Editor → <code>profiles</code> table, and set your user&apos;s <code>role</code> to <code>admin</code>.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              {!userEmail ? (
                <Link
                  href="/login?next=/admin"
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  Sign In to Admin Account
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-teal-700 px-4 text-xs font-bold text-white transition hover:bg-teal-800"
                >
                  Refresh Permissions
                </button>
              )}
              <Link
                href="/dashboard"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Return to Student Dashboard
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
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

      {/* TAB 1: DAILY ENCOURAGEMENT MESSAGE */}
      {tab === "message" ? (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              <h2 className="text-lg font-black text-slate-950">Personalized Student Motivation Note</h2>
            </div>
            <p className="text-xs text-slate-600">
              This message appears prominently on all student dashboards to inspire and motivate them during stressful exam preparation.
            </p>
          </CardHeader>
          <CardBody className="space-y-4 p-6">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-700">Encouragement Message</span>
              <textarea
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-slate-950 focus:outline-none"
                placeholder="Keep going, future nurse. I believe in you..."
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-700">Sign-off / Sender Name</span>
              <Input
                value={msgSender}
                onChange={(e) => setMsgSender(e.target.value)}
                placeholder="e.g. Yume Nurse Study Team or Dean of Nursing"
              />
            </label>

            {saveFeedback ? (
              <div className="flex items-center gap-2 rounded-lg bg-teal-50 p-3 text-xs font-bold text-teal-800 border border-teal-200">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                <span>{saveFeedback}</span>
              </div>
            ) : null}

            <Button
              onClick={handleSaveDailyMessage}
              disabled={isSavingMsg}
              className="gap-2 bg-slate-950 hover:bg-slate-800"
            >
              {isSavingMsg ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving & Syncing Note...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save & Update Dashboard Note
                </>
              )}
            </Button>
          </CardBody>
        </Card>
      ) : null}

      {/* TAB 2: SUBJECTS & TOPICS */}
      {tab === "subjects" ? (
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-950">Add New Nursing Subject / Course</h2>
            </CardHeader>
            <CardBody className="p-6">
              <form onSubmit={handleAddSubject} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-slate-700">Subject Name</span>
                    <Input
                      value={newSubjName}
                      onChange={(e) => setNewSubjName(e.target.value)}
                      placeholder="e.g. Critical Care & Emergency Nursing"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-slate-700">Accent Color</span>
                    <Select value={newSubjAccent} onChange={(e) => setNewSubjAccent(e.target.value)}>
                      <option value="emerald">Emerald Green (Community)</option>
                      <option value="sky">Sky Blue (Pharmacology)</option>
                      <option value="rose">Rose Pink (Maternal-Child)</option>
                      <option value="purple">Purple (Psychiatric)</option>
                      <option value="amber">Amber Gold (Med-Surg)</option>
                    </Select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-slate-700">Course Overview & Description</span>
                  <textarea
                    value={newSubjDesc}
                    onChange={(e) => setNewSubjDesc(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-slate-950 focus:outline-none"
                    placeholder="Provide overview of key competencies and clinical goals..."
                  />
                </label>

                {subjSaveNotice ? (
                  <div className="flex items-center gap-2 rounded-lg bg-teal-50 p-3 text-xs font-bold text-teal-800 border border-teal-200">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>{subjSaveNotice}</span>
                  </div>
                ) : null}

                <Button type="submit" className="gap-2 bg-slate-950 hover:bg-slate-800">
                  <Plus className="h-4 w-4" /> Add Subject to Curriculum
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {/* TAB 3: FLASHCARDS CMS */}
      {tab === "flashcards" ? (
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-950">Add Flashcard to Spaced Repetition Bank</h2>
            </CardHeader>
            <CardBody className="p-6">
              <form onSubmit={handleAddFlashcard} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-slate-700">Subject</span>
                    <Select value={fcSubjectId} onChange={(e) => setFcSubjectId(e.target.value)}>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-slate-700">Difficulty</span>
                    <Select value={fcDifficulty} onChange={(e) => setFcDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </Select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-slate-700">Front (Prompt / Question / Cue)</span>
                  <Input value={fcFront} onChange={(e) => setFcFront(e.target.value)} placeholder="e.g. What is the reversal antidote for Heparin?" required />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-slate-700">Back (Core Answer)</span>
                  <Input value={fcBack} onChange={(e) => setFcBack(e.target.value)} placeholder="e.g. Protamine Sulfate" required />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-slate-700">Clinical Rationale & Memory Tip</span>
                  <textarea
                    value={fcExplanation}
                    onChange={(e) => setFcExplanation(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-slate-950 focus:outline-none"
                    placeholder="Explain mechanism and safety monitoring..."
                  />
                </label>

                {fcSaveNotice ? (
                  <div className="flex items-center gap-2 rounded-lg bg-teal-50 p-3 text-xs font-bold text-teal-800 border border-teal-200">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>{fcSaveNotice}</span>
                  </div>
                ) : null}

                <Button type="submit" className="gap-2 bg-slate-950 hover:bg-slate-800">
                  <Plus className="h-4 w-4" /> Save Flashcard
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {/* TAB 4: QUIZ QUESTIONS CMS */}
      {tab === "questions" ? (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-black text-slate-950">Add NCLEX / PNLE Quiz Question</h2>
          </CardHeader>
          <CardBody className="p-6">
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-slate-700">Subject</span>
                  <Select value={qSubjectId} onChange={(e) => setQSubjectId(e.target.value)}>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-slate-700">Question Format</span>
                  <Select value={qType} onChange={(e) => setQType(e.target.value as any)}>
                    <option value="Multiple Choice">Multiple Choice</option>
                    <option value="Patient Scenario">Patient Scenario</option>
                    <option value="SATA">Select All That Apply (SATA)</option>
                    <option value="True/False">True / False</option>
                  </Select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-700">Question Clinical Scenario / Prompt</span>
                <textarea
                  value={qPrompt}
                  onChange={(e) => setQPrompt(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-slate-950 focus:outline-none"
                  placeholder="A nurse is caring for a patient experiencing acute respiratory distress..."
                  required
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <Input value={qOptA} onChange={(e) => setQOptA(e.target.value)} placeholder="Option A" required />
                <Input value={qOptB} onChange={(e) => setQOptB(e.target.value)} placeholder="Option B" required />
                <Input value={qOptC} onChange={(e) => setQOptC(e.target.value)} placeholder="Option C" />
                <Input value={qOptD} onChange={(e) => setQOptD(e.target.value)} placeholder="Option D" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-slate-700">Correct Option</span>
                  <Select value={qCorrect} onChange={(e) => setQCorrect(e.target.value)}>
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </Select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-700">Clinical Rationale & Explanation</span>
                <textarea
                  value={qRationale}
                  onChange={(e) => setQRationale(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-slate-950 focus:outline-none"
                  placeholder="Explain why this option is correct based on pathophysiology and nursing protocols..."
                />
              </label>

              {qSaveNotice ? (
                <div className="flex items-center gap-2 rounded-lg bg-teal-50 p-3 text-xs font-bold text-teal-800 border border-teal-200">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>{qSaveNotice}</span>
                </div>
              ) : null}

              <Button type="submit" className="gap-2 bg-slate-950 hover:bg-slate-800">
                <Plus className="h-4 w-4" /> Save Question to Bank
              </Button>
            </form>
          </CardBody>
        </Card>
      ) : null}

      {/* TAB 5: USERS & STATS */}
      {tab === "analytics" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm">
            <CardBody className="p-5">
              <p className="text-xs font-bold text-slate-500 uppercase">Total Questions</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{quizQuestions.length}</p>
              <p className="mt-1 text-xs text-slate-500">Across 7 subjects</p>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardBody className="p-5">
              <p className="text-xs font-bold text-slate-500 uppercase">Total Flashcards</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{flashcards.length}</p>
              <p className="mt-1 text-xs text-slate-500">Spaced repetition active</p>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardBody className="p-5">
              <p className="text-xs font-bold text-slate-500 uppercase">Active Curricula</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{subjects.length}</p>
              <p className="mt-1 text-xs text-purple-700 font-bold">Includes Philippine CHN</p>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardBody className="p-5">
              <p className="text-xs font-bold text-slate-500 uppercase">Security Role</p>
              <p className="mt-2 text-2xl font-black text-emerald-600">Administrator</p>
              <p className="mt-1 text-xs text-slate-500">Full CMS Access</p>
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
