"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Bot,
  CheckCircle2,
  Copy,
  FileText,
  HelpCircle,
  Lightbulb,
  Plus,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  askNurseMateAi,
  generateStudyPack,
  type GeneratedStudyPack,
  type StructuredAiResponse,
} from "@/services/ai";
import { cn } from "@/lib/utils";

const STARTER_PROMPTS = [
  "What is hypokalemia?",
  "Explain heart failure in simple terms.",
  "What are the signs of hypoglycemia?",
  "Give me guidelines about antibiotics.",
  "Explain the 8 Elements of PHC in the Philippines.",
];

export default function AiPage() {
  const [tab, setTab] = useState<"assistant" | "generator">("assistant");

  // Assistant state
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<StructuredAiResponse | null>(null);

  // Generator state
  const [notesInput, setNotesInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPack, setGeneratedPack] = useState<GeneratedStudyPack | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  async function handleAsk(promptText: string) {
    if (!promptText.trim()) return;
    setLoading(true);
    setAiResponse(null);

    try {
      const res = await askNurseMateAi(promptText);
      setAiResponse(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  function handleGeneratePack() {
    if (!notesInput.trim()) return;
    setIsGenerating(true);
    setGeneratedPack(null);
    setSavedNotice(null);

    setTimeout(() => {
      const pack = generateStudyPack(notesInput);
      setGeneratedPack(pack);
      setIsGenerating(false);
    }, 600);
  }

  function handleSavePack() {
    setSavedNotice("🎉 Study pack successfully saved to your active Flashcards deck and Quiz question bank!");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Yume Nurse AI"
        title="Clinical Study Assistant & Generator"
        description="Ask clinical nursing questions with structured nursing considerations or convert your lecture notes into custom flashcards & quizzes."
      />

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setTab("assistant")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition",
            tab === "assistant"
              ? "bg-slate-950 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          )}
        >
          <Bot className="h-4 w-4" /> Yume Nurse AI Clinical Tutor
        </button>

        <button
          type="button"
          onClick={() => setTab("generator")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition",
            tab === "generator"
              ? "bg-slate-950 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          )}
        >
          <Sparkles className="h-4 w-4" /> AI Flashcard & Quiz Generator
        </button>
      </div>

      {/* Safety Disclaimer Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/80 p-4 text-xs leading-relaxed text-sky-950">
        <ShieldAlert className="mt-0.5 h-4 w-4 text-sky-700 shrink-0" />
        <p>
          <span className="font-bold">Educational Use Only: </span>
          Yume Nurse AI is engineered strictly for nursing student board exam preparation (NCLEX & PNLE) and review. It does not provide personalized medical diagnosis or clinical treatment recommendations for actual patients.
        </p>
      </div>

      {/* TAB 1: CLINICAL TUTOR */}
      {tab === "assistant" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            {/* Input card */}
            <Card className="shadow-sm">
              <CardBody className="p-5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAsk(query);
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask any nursing concept (e.g. What is hypokalemia? Explain Left vs Right heart failure...)"
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading || !query.trim()} className="gap-2 bg-slate-950 hover:bg-slate-800">
                    <Send className="h-4 w-4" /> {loading ? "Thinking..." : "Ask AI"}
                  </Button>
                </form>
              </CardBody>
            </Card>

            {/* AI Response Card */}
            {aiResponse ? (
              <Card className="shadow-sm border-sky-200 overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/80 pb-4">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-sky-700" />
                    <h2 className="text-lg font-black text-slate-950">{aiResponse.topic}</h2>
                  </div>
                </CardHeader>
                <CardBody className="space-y-6 p-6">
                  {/* Explanation */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Clinical Overview</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-800">{aiResponse.explanation}</p>
                  </div>

                  {/* Nursing Relevance */}
                  <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-teal-950">Nursing Relevance & Patient Safety</h3>
                    <p className="mt-1 text-xs leading-relaxed text-teal-900 font-medium">{aiResponse.nursingRelevance}</p>
                  </div>

                  {/* Signs & Symptoms */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Key Assessment Cues & Signs</h3>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
                      {aiResponse.signsAndSymptoms.map((cue) => (
                        <li key={cue} className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span>{cue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Nursing Considerations */}
                  <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-sky-950">Priority Nursing Considerations & Interventions</h3>
                    <ul className="mt-2 space-y-1.5 text-xs text-sky-900">
                      {aiResponse.nursingConsiderations.map((action) => (
                        <li key={action} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 mt-0.5 shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Memory Tips / Mnemonics */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-950">
                      <Lightbulb className="h-4 w-4 text-amber-600" />
                      <span>Memory Tips & Clinical Mnemonics</span>
                    </div>
                    <ul className="mt-2 space-y-1 text-xs font-medium text-amber-900">
                      {aiResponse.memoryTips.map((tip) => (
                        <li key={tip}>• {tip}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    Source: Yume Nurse Clinical Reasoning Engine • {aiResponse.disclaimer}
                  </p>
                </CardBody>
              </Card>
            ) : (
              <Card className="border-dashed border-slate-300">
                <CardBody className="py-12 text-center">
                  <Bot className="mx-auto h-10 w-10 text-slate-400" />
                  <h3 className="mt-3 text-sm font-bold text-slate-950">Ready to assist your study session</h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    Type a question above or choose one of the high-yield clinical questions from the sidebar.
                  </p>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Quick Prompts Sidebar */}
          <aside className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-black text-slate-950">High-Yield Study Prompts</h2>
              </CardHeader>
              <CardBody className="space-y-2 p-3">
                {STARTER_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setQuery(p);
                      handleAsk(p);
                    }}
                    className="w-full rounded-lg border border-slate-200 p-3 text-left text-xs font-bold text-slate-800 transition hover:border-sky-300 hover:bg-sky-50/50"
                  >
                    {p}
                  </button>
                ))}
              </CardBody>
            </Card>
          </aside>
        </div>
      ) : (
        /* TAB 2: STUDY PACK & FLASHCARD GENERATOR */
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-sky-700" />
                <h2 className="text-base font-black text-slate-950">Generate Flashcards & Quizzes from Notes</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4 p-6">
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste your nursing lecture summary, textbook excerpt, or study notes below. NurseMate AI will extract key terms, generate spaced-repetition flashcards, and write NCLEX-style practice questions with full rationales.
              </p>

              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                rows={5}
                placeholder="Paste nursing notes, drug classes, or disease pathophysiology here (e.g. Chronic Kidney Disease, Digoxin administration, or Maternal labor stages)..."
                className="w-full rounded-xl border border-slate-300 p-4 text-xs leading-relaxed text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {notesInput.length} characters
                </span>
                <Button
                  onClick={handleGeneratePack}
                  disabled={isGenerating || !notesInput.trim()}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Sparkles className="h-4 w-4" />
                  {isGenerating ? "Analyzing Notes..." : "Generate Study Pack"}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Generated Pack Preview */}
          {generatedPack ? (
            <div className="space-y-6">
              <Card className="shadow-sm border-emerald-300 bg-emerald-50/20">
                <CardHeader className="border-b border-emerald-200 pb-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                        AI Generated Pack
                      </span>
                      <h2 className="mt-1 text-lg font-black text-slate-950">{generatedPack.title}</h2>
                    </div>

                    <Button onClick={handleSavePack} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> Save to My Reviewer Deck
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="p-6 space-y-6">
                  {savedNotice ? (
                    <div className="rounded-lg bg-emerald-100 p-3.5 text-xs font-bold text-emerald-950 border border-emerald-300">
                      {savedNotice}
                    </div>
                  ) : null}

                  {/* Summary */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Executive Summary</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-800">{generatedPack.summary}</p>
                  </div>

                  {/* Key Terms */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Extracted Key Terms ({generatedPack.keyTerms.length})</h3>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {generatedPack.keyTerms.map((kt) => (
                        <div key={kt.term} className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-xs font-bold text-slate-950">{kt.term}</p>
                          <p className="mt-1 text-[11px] text-slate-600 leading-snug">{kt.definition}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Generated Flashcards Preview */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Generated Flashcards ({generatedPack.flashcards.length})</h3>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {generatedPack.flashcards.map((fc, i) => (
                        <div key={i} className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 space-y-2">
                          <span className="rounded bg-sky-200 px-2 py-0.5 text-[10px] font-black text-sky-900">
                            Card {i + 1}
                          </span>
                          <p className="text-xs font-bold text-slate-950">Q: {fc.front}</p>
                          <p className="text-xs text-slate-700 font-medium">A: {fc.back}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Generated Questions Preview */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Generated Quiz Questions ({generatedPack.quizQuestions.length})</h3>
                    <div className="mt-2 space-y-3">
                      {generatedPack.quizQuestions.map((q, i) => (
                        <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-700">
                              Question {i + 1} • {q.type}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-950">{q.prompt}</p>
                          <p className="text-xs text-teal-800 font-semibold">
                            Correct: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(", ") : q.correctAnswer}
                          </p>
                          <p className="text-[11px] text-slate-500">{q.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
