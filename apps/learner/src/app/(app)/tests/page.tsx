import { FileQuestion, CheckCircle2, Circle, Clock } from "lucide-react";
import Link from "next/link";

const MOCK_TESTS = [
  {
    id: "test-1",
    title: "Probability Foundations — Section Quiz",
    description: "Chapter 1 end-of-section assessment",
    status: "available",
    questions: 5,
    estimatedMinutes: 10,
    href: "/learn/probability/ch1-probability-foundations/section-quiz",
  },
  {
    id: "test-2",
    title: "Conditional Probability — Review Quiz",
    description: "Generated from your last attempt",
    status: "review",
    questions: 3,
    estimatedMinutes: 8,
    href: "/learn/probability/ch1-probability-foundations/section-quiz",
  },
  {
    id: "test-3",
    title: "Weekly ISI-style Review",
    description: "Mixed problems from Week 1",
    status: "locked",
    questions: 10,
    estimatedMinutes: 30,
    href: "#",
  },
];

export default function TestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Tests</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Quizzes, review quizzes, and mock exams.
        </p>
      </div>

      <div className="space-y-3">
        {MOCK_TESTS.map((test) => {
          const isLocked = test.status === "locked";
          const isReview = test.status === "review";
          return (
            <div
              key={test.id}
              className={`rounded-2xl border bg-white p-5 dark:bg-zinc-900 ${
                isLocked
                  ? "border-zinc-100 opacity-60 dark:border-zinc-800"
                  : isReview
                  ? "border-amber-200 dark:border-amber-900/50"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isLocked
                        ? "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                        : isReview
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    }`}
                  >
                    <FileQuestion className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">{test.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{test.description}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  {test.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <FileQuestion className="h-3.5 w-3.5" />
                  {test.questions} questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {test.estimatedMinutes} min
                </span>
                {test.status === "available" && (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Circle className="h-3.5 w-3.5" />
                    Ready
                  </span>
                )}
                {test.status === "review" && (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Retry after review
                  </span>
                )}
              </div>
              {!isLocked && (
                <Link
                  href={test.href}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {isReview ? "Start review" : "Start test"}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
