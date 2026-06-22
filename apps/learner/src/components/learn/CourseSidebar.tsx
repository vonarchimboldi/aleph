"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Lock,
  CheckCircle2,
  Circle,
  Play,
  AlertCircle,
  X,
} from "lucide-react";
import { useWorkspace } from "./WorkspaceProvider";
import type { Course, Section } from "@/lib/courses/data";

interface CourseSidebarProps {
  course: Course;
  isOpen?: boolean;
  onClose?: () => void;
}

const SECTION_LABELS: Record<Section["type"], string> = {
  read: "Read",
  concept: "Concept",
  mechanic: "Mechanic",
  integration: "Integration",
  challenge: "Challenge",
  quiz: "Quiz",
  review: "Review",
  summary: "Summary",
};

function SectionRow({
  course,
  chapter,
  section,
  isActive,
}: {
  course: Course;
  chapter: { slug: string };
  section: Section;
  isActive: boolean;
}) {
  const {
    isSectionLocked,
    isSectionCompleted,
    getSectionTaskProgress,
    needsReview,
  } = useWorkspace();

  const locked = isSectionLocked(section.id);
  const completed = isSectionCompleted(section.id, section.problems ?? []);
  const reviewNeeded = needsReview(section.id);
  const { completed: tasksDone, total: tasksTotal } = getSectionTaskProgress(
    section.id,
    section.problems ?? []
  );

  const content = (
    <>
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {locked ? (
          <Lock className="h-4 w-4 text-zinc-400" />
        ) : reviewNeeded ? (
          <AlertCircle className="h-4 w-4 text-amber-600" />
        ) : completed ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : isActive ? (
          <Play className="h-4 w-4 fill-current text-zinc-900 dark:text-white" />
        ) : (
          <Circle className="h-4 w-4 text-zinc-400" />
        )}
      </span>
      <span className="flex-1 truncate">{section.title}</span>
      {tasksTotal > 0 && (
        <span className="hidden shrink-0 text-[10px] text-zinc-400 sm:inline dark:text-zinc-500">
          {tasksDone}/{tasksTotal}
        </span>
      )}
      <span
        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
          isActive
            ? "bg-zinc-800 text-zinc-200 dark:bg-zinc-700 dark:text-zinc-100"
            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        }`}
      >
        {SECTION_LABELS[section.type]}
      </span>
    </>
  );

  const baseClasses =
    "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition";
  const activeClasses =
    "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900";
  const inactiveClasses =
    "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900";
  const lockedClasses =
    "cursor-not-allowed text-zinc-400 dark:text-zinc-500";

  if (locked) {
    return (
      <span className={`${baseClasses} ${lockedClasses}`}>{content}</span>
    );
  }

  return (
    <Link
      href={`/learn/${course.slug}/${chapter.slug}/${section.slug}`}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {content}
    </Link>
  );
}

export default function CourseSidebar({ course, isOpen, onClose }: CourseSidebarProps) {
  const pathname = usePathname();
  const { isSectionCompleted } = useWorkspace();
  const segments = pathname.split("/").filter(Boolean);
  const activeChapterSlug = segments[2] || "";
  const activeSectionSlug = segments[3] || "";

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    course.chapters.forEach((ch) => {
      initial[ch.slug] = ch.slug === activeChapterSlug;
    });
    return initial;
  });

  // Close drawer on route change (mobile)
  useEffect(() => {
    onClose?.();
  }, [pathname, onClose]);

  const toggleChapter = (slug: string) => {
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const sidebarContent = (
    <>
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <Link
            href={`/courses/${course.slug}`}
            className="text-sm font-medium text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
          >
            {course.title}
          </Link>
          <button
            onClick={() => onClose?.()}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 lg:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {course.chapters.length} chapters · {course.chapters.reduce(
            (acc, ch) => acc + ch.sections.length,
            0
          )}{" "}
          sections
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <nav className="space-y-1">
          {course.chapters.map((chapter) => {
            const isActive = chapter.slug === activeChapterSlug;
            const isExpanded = expanded[chapter.slug] ?? isActive;
            const chapterTotal = chapter.sections.length;
            const chapterCompleted = chapter.sections.filter((s) =>
              isSectionCompleted(s.id, s.problems ?? [])
            ).length;

            return (
              <div key={chapter.id}>
                <button
                  onClick={() => toggleChapter(chapter.slug)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      {chapter.number}. {chapter.title}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
                    )}
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-green-600"
                      style={{ width: `${chapterTotal > 0 ? Math.round((chapterCompleted / chapterTotal) * 100) : 0}%` }}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-1 space-y-0.5 pl-3">
                    {chapter.sections.map((section) => {
                      const isSectionActive =
                        isActive && section.slug === activeSectionSlug;
                      return (
                        <SectionRow
                          key={section.id}
                          course={course}
                          chapter={chapter}
                          section={section}
                          isActive={isSectionActive}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-full w-72 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => onClose?.()}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-200 bg-white shadow-xl transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
