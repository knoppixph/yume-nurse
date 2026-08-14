import { PageHeader } from "@/components/page-header";
import { MaterialsManager } from "@/components/materials-uploader";

export default function MaterialsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Study Materials"
        title="Nursing Review Library & Upload"
        description="Access verified Philippine nursing lecture slides, open OER textbooks, or upload your own school reviewers to generate custom quizzes and flashcards."
      />

      <MaterialsManager />
    </div>
  );
}
