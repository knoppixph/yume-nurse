import Link from "next/link";
import { Brain, ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { nextReviewCards, progressSummary } from "@/lib/study-progress";
import { getSubjectName, getTopicName, weakTopics } from "@/lib/study-data";

export default function ReviewPage() {
  const dueCards = nextReviewCards();
  const summary = progressSummary();

  return (
    <>
      <PageHeader
        eyebrow="Smart Review"
        title="Questions you need to review"
        description="Local weak-topic detection prioritizes due cards, lower mastery, and recent misses."
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-sky-700" aria-hidden="true" />
              <h2 className="text-xl font-black text-slate-950">Priority queue</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {dueCards.map((card) => (
              <div key={card.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-950">{card.front}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {getSubjectName(card.subjectId)} - {getTopicName(card.subjectId, card.topicId)}
                    </p>
                  </div>
                  <span className="w-fit rounded-md bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">{card.due}</span>
                </div>
                <div className="mt-4">
                  <ProgressBar value={card.mastery} label="Mastery" />
                </div>
              </div>
            ))}
            <Link
              href="/flashcards"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Review Flashcards
            </Link>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 text-teal-700" aria-hidden="true" />
                <h2 className="text-xl font-black text-slate-950">Weak areas</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {weakTopics().map((topic) => (
                <ProgressBar key={topic.id} value={topic.mastery} label={topic.name} />
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-black text-slate-950">Review stats</h2>
            </CardHeader>
            <CardBody className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-slate-100 p-4">
                <p className="text-xs font-bold text-slate-500">Due cards</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{summary.dueCards}</p>
              </div>
              <div className="rounded-md bg-slate-100 p-4">
                <p className="text-xs font-bold text-slate-500">Weak topics</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{summary.weakTopics.length}</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>
    </>
  );
}

