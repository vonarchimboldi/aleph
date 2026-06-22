"use client";

import Link from "next/link";
import { Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

interface CourseActionButtonProps {
  courseSlug: string;
}

export default function CourseActionButton({ courseSlug }: CourseActionButtonProps) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    try {
      const key = `aleph-workspace-${courseSlug}`;
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const state = JSON.parse(raw) as {
          completedTaskIds?: string[];
          quizAttempts?: unknown[];
        };
        const hasProgress =
          (state.completedTaskIds && state.completedTaskIds.length > 0) ||
          (state.quizAttempts && state.quizAttempts.length > 0);
        setStarted(Boolean(hasProgress));
      }
    } catch {
      setStarted(false);
    }
  }, [courseSlug]);

  return (
    <Link
      href={`/learn/${courseSlug}`}
      className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      {started ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      {started ? "Resume course" : "Start course"}
    </Link>
  );
}
