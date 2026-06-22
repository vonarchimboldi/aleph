import { notFound } from "next/navigation";
import Link from "next/link";
import { getSectionBySlug, getNextSection, getPreviousSection } from "@/lib/data/db";
import KaTeXRenderer from "@/components/learn/KaTeXRenderer";
import ProblemSetPanel from "@/components/learn/ProblemSetPanel";
import QuizPanel from "@/components/learn/QuizPanel";
import ReviewQuizPanel from "@/components/learn/ReviewQuizPanel";
import SectionBottomNav from "@/components/learn/SectionBottomNav";
import { ChevronLeft, Clock, BookOpen } from "lucide-react";

export const revalidate = 3600;

interface SectionPageProps {
  params: Promise<{ courseSlug: string; chapterSlug: string; sectionSlug: string }>;
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { courseSlug, chapterSlug, sectionSlug } = await params;
  const result = await getSectionBySlug(courseSlug, chapterSlug, sectionSlug);
  if (!result) notFound();

  const { course, chapter, section } = result;
  const next = await getNextSection(courseSlug, chapterSlug, sectionSlug);
  const prev = await getPreviousSection(courseSlug, chapterSlug, sectionSlug);

  const allSections = course.chapters.flatMap((ch) => ch.sections);
  const sectionIndex = allSections.findIndex((s) => s.slug === sectionSlug);
  const sectionNumber = sectionIndex >= 0 ? sectionIndex + 1 : 1;
  const totalSections = allSections.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      {/* Breadcrumb / header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/courses" className="hover:text-zinc-900 dark:hover:text-white">Courses</Link>
          <ChevronLeft className="h-3 w-3 rotate-180" />
          <Link href={`/courses/${courseSlug}`} className="hover:text-zinc-900 dark:hover:text-white">{course.title}</Link>
          <ChevronLeft className="h-3 w-3 rotate-180" />
          <span>Chapter {chapter.number}</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-zinc-900 dark:text-white">{section.title}</h1>
        <div className="mt-3 space-y-2 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {section.estimatedMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {chapter.title}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-900 dark:text-white">Section {sectionNumber} of {totalSections}</span>
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-green-600"
                style={{ width: `${Math.round((sectionNumber / totalSections) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reading content */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:p-8">
        <KaTeXRenderer content={section.content} />

        {section.readingQuestions && section.readingQuestions.length > 0 && (
          <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">Reading questions</h3>
            <div className="space-y-4">
              {section.readingQuestions.map((rq, idx) => (
                <details key={idx} className="group rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white">
                    {idx + 1}. {rq.question}
                  </summary>
                  <div className="border-t border-zinc-200 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                    <span className="font-medium">Hint:</span> {rq.hint}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Problem set */}
      {section.problems && section.problems.length > 0 && (
        <div className="mt-8">
          <ProblemSetPanel sectionId={section.id} problems={section.problems} />
        </div>
      )}

      {/* Section quiz */}
      {section.quiz && section.quiz.length > 0 && (
        <div className="mt-8">
          <QuizPanel sectionId={section.id} questions={section.quiz} />
        </div>
      )}

      {/* Review quiz */}
      {section.quiz && section.quiz.length > 0 && (
        <div className="mt-8">
          <ReviewQuizPanel sectionId={section.id} questions={section.quiz} />
        </div>
      )}

      {/* Bottom nav */}
      <SectionBottomNav
        courseSlug={courseSlug}
        currentSectionId={section.id}
        prev={prev ?? null}
        next={next ?? null}
      />
    </div>
  );
}
