"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { SubjectCard } from "@/components/subject-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { subjects } from "@/lib/study-data";
import { loadMasteryMap } from "@/lib/user-progress";

export default function SubjectsPage() {
  const [masteryMap, setMasteryMap] = useState<Record<string, number>>({});

  useEffect(() => {
    setMasteryMap(loadMasteryMap());
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Subjects"
        title="Nursing subject library"
        description="Browse starter reviewers by subject and topic."
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <h2 className="text-lg font-black text-slate-950">{subject.name}</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {subject.topics.map((topic) => {
                const topicMastery = masteryMap[topic.id] ?? 0;
                return (
                  <ProgressBar
                    key={topic.id}
                    value={topicMastery}
                    label={topicMastery === 0 ? `${topic.name} — Not started` : topic.name}
                  />
                );
              })}
            </CardBody>
          </Card>
        ))}
      </section>
    </>
  );
}
