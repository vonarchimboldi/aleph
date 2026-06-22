"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ChevronLeft, GraduationCap } from "lucide-react";
import CourseSidebar from "./CourseSidebar";
import { useWorkspace } from "./WorkspaceProvider";
import type { Course } from "@/lib/courses/data";

interface CoursePlayerHeaderProps {
  course: Course;
}

export default function CoursePlayerHeader({ course }: CoursePlayerHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { completedSectionCount, totalSections } = useWorkspace();
  const progressPercent = totalSections > 0 ? Math.round((completedSectionCount / totalSections) * 100) : 0;

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/95 dark:supports-[backdrop-filter]:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Open course menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            href={`/courses/${course.slug}`}
            className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white"
          >
            <GraduationCap className="h-5 w-5" />
            <span className="max-w-[8rem] truncate sm:max-w-xs md:max-w-sm">{course.title}</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-zinc-900 transition-all dark:bg-white"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {progressPercent}%
            </span>
          </div>
          <Link
            href="/courses"
            className="hidden items-center gap-1 rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 sm:flex dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Courses
          </Link>
        </div>
      </header>

      <CourseSidebar course={course} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
