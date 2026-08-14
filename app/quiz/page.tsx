import { QuizCenter } from "@/components/quiz-center";
import { PageHeader } from "@/components/page-header";

export default function QuizPage() {
  return (
    <>
      <PageHeader
        eyebrow="Quiz Center"
        title="NCLEX-style practice"
        description="Answer nursing practice questions, submit before seeing rationales, and review missed items."
      />
      <QuizCenter />
    </>
  );
}

