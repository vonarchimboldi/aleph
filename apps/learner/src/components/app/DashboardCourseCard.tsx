import { BookOpen, Clock, GraduationCap } from "lucide-react";
import CourseActionButton from "./CourseActionButton";
import type { Course } from "@/lib/courses/data";

interface DashboardCourseCardProps {
  course: Course;
}

export default function DashboardCourseCard({ course }: DashboardCourseCardProps) {
  const totalSections = course.chapters.reduce((acc, ch) => acc + ch.sections.length, 0);

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
        <GraduationCap className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{course.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
        {course.tagline}
      </p>
      <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5" />
          {course.chapters.length} chapters
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {course.duration}
        </span>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className="h-full w-0 rounded-full bg-zinc-900 dark:bg-white" />
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">0% complete</p>
      <CourseActionButton courseSlug={course.slug} />
    </div>
  );
}
