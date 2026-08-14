import { FlashcardReview } from "@/components/flashcard-review";
import { PageHeader } from "@/components/page-header";

export default function FlashcardsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Flashcards"
        title="Review flashcards"
        description="Practice starter cards with Again, Hard, Good, and Easy ratings."
      />
      <FlashcardReview />
    </>
  );
}

