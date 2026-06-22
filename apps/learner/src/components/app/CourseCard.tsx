"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Course } from "@/lib/courses/data";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const totalSections = course.chapters.reduce((acc, ch) => acc + ch.sections.length, 0);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
          <GraduationCap className="h-7 w-7" />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {course.exam}
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            {course.difficulty}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {course.duration}
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white lg:text-3xl">
          {course.title}
        </h2>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">{course.tagline}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/learn/${course.slug}`}
            className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Start course
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {expanded ? "Hide details" : "View curriculum"}
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-zinc-200 p-6 dark:border-zinc-800 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">What you&apos;ll learn</h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {course.outcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Curriculum</h3>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {course.chapters.length} chapters · {totalSections} sections
                  </span>
                </div>
                <div className="space-y-3">
                  {course.chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                            Chapter {chapter.number}
                          </p>
                          <h4 className="font-semibold text-zinc-900 dark:text-white">{chapter.title}</h4>
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{chapter.description}</p>
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {chapter.sections.length} sections
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {chapter.sections.slice(0, 5).map((section) => (
                          <span
                            key={section.id}
                            className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          >
                            {section.title}
                          </span>
                        ))}
                        {chapter.sections.length > 5 && (
                          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            +{chapter.sections.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-white">Prerequisites</h3>
                <ul className="mt-3 space-y-2">
                  {course.prerequisites.map((prereq, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                      {prereq}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-white">Course details</h3>
                <dl className="mt-3 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-zinc-500 dark:text-zinc-400">Exam</dt>
                    <dd className="font-medium text-zinc-900 dark:text-white">{course.exam}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500 dark:text-zinc-400">Difficulty</dt>
                    <dd className="font-medium text-zinc-900 dark:text-white">{course.difficulty}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500 dark:text-zinc-400">Duration</dt>
                    <dd className="font-medium text-zinc-900 dark:text-white">{course.duration}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
