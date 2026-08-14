"use client";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <Card>
      <CardBody>
        <h1 className="text-2xl font-black text-slate-950">Something went wrong</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Yume Nurse could not load this screen.</p>
        <Button className="mt-5" onClick={reset}>
          Try again
        </Button>
      </CardBody>
    </Card>
  );
}

