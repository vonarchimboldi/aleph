import Link from "next/link";
import { getCourses } from "@/lib/data/db";
import DashboardCourseCard from "@/components/app/DashboardCourseCard";
import {
  BookOpen,
  CheckSquare,
  FileQuestion,
  MessageSquareText,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const courses = await getCourses();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Everything you need to study today.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/courses"
          className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <BookOpen className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white">Courses</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{courses.length} enrolled</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-zinc-400" />
        </Link>

        <Link
          href="/tasks"
          className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <CheckSquare className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white">Tasks</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Weekly board</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-zinc-400" />
        </Link>

        <Link
          href="/tests"
          className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <FileQuestion className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white">Tests</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Quizzes & reviews</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-zinc-400" />
        </Link>

        <Link
          href="/feedback"
          className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <MessageSquareText className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white">Feedback</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Repair actions</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-zinc-400" />
        </Link>
      </div>

      {/* Courses */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">My courses</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {courses.map((course) => (
            <DashboardCourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
