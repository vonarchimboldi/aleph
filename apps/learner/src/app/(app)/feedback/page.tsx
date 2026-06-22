import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

const MOCK_FEEDBACK = [
  {
    id: "fb-1",
    concept: "Conditional Probability",
    status: "weak",
    message: "You missed 2 of 3 conditional-probability quiz questions.",
    action: "Practice 3 repair problems",
    href: "/learn/probability/ch1-probability-foundations/core-ideas",
  },
  {
    id: "fb-2",
    concept: "Counting Rules",
    status: "strong",
    message: "You answered all counting-rule questions correctly.",
    action: "Move to the next section",
    href: "/learn/probability/ch1-probability-foundations/problem-solving-techniques",
  },
  {
    id: "fb-3",
    concept: "Bayes' Theorem",
    status: "review",
    message: "Prerequisite gap detected: independence vs. mutual exclusivity.",
    action: "Review prerequisite material",
    href: "/resources",
  },
];

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Feedback</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Concept strengths, gaps, and recommended next actions.
        </p>
      </div>

      <div className="space-y-3">
        {MOCK_FEEDBACK.map((item) => {
          const isWeak = item.status === "weak";
          const isStrong = item.status === "strong";
          return (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white p-5 dark:bg-zinc-900 ${
                isWeak
                  ? "border-red-200 dark:border-red-900/50"
                  : isStrong
                  ? "border-green-200 dark:border-green-900/50"
                  : "border-amber-200 dark:border-amber-900/50"
              }`}
            >
              <div className="flex items-start gap-3">
                {isWeak ? (
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                ) : isStrong ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                ) : (
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-zinc-900 dark:text-white">{item.concept}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.message}</p>
                  <Link
                    href={item.href}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 transition hover:underline dark:text-white"
                  >
                    {item.action}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
