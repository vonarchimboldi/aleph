"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Lock, CheckCircle } from "lucide-react";
import { useWorkspace } from "./WorkspaceProvider";

interface SectionNavTarget {
  chapterSlug: string;
  sectionSlug: string;
  sectionId: string;
}

interface SectionBottomNavProps {
  courseSlug: string;
  currentSectionId: string;
  prev: SectionNavTarget | null;
  next: SectionNavTarget | null;
}

export default function SectionBottomNav({ courseSlug, currentSectionId, prev, next }: SectionBottomNavProps) {
  const { isSectionLocked, hasPassedQuiz } = useWorkspace();
  const nextLocked = next ? isSectionLocked(next.sectionId) : false;
  const passedCurrent = hasPassedQuiz(currentSectionId);

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-6 sm:flex-row dark:border-zinc-800">
      {prev ? (
        <Link
          href={`/learn/${courseSlug}/${prev.chapterSlug}/${prev.sectionSlug}`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 sm:w-auto dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        nextLocked ? (
          <span className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-500 sm:w-auto dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
            <Lock className="h-4 w-4" />
            Pass quiz to unlock
          </span>
        ) : (
          <Link
            href={`/learn/${courseSlug}/${next.chapterSlug}/${next.sectionSlug}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 sm:w-auto dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        )
      ) : passedCurrent ? (
        <Link
          href="/courses"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 sm:w-auto dark:bg-green-600 dark:hover:bg-green-500"
        >
          <CheckCircle className="h-4 w-4" />
          Course complete
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </div>
  );
}
