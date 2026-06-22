"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useWorkspace } from "./WorkspaceProvider";
import type { QuizQuestion } from "@/lib/courses/data";

interface QuizPanelProps {
  sectionId: string;
  questions: QuizQuestion[];
  title?: string;
  onResult?: (passed: boolean, attemptId: string) => void;
}

export default function QuizPanel({ sectionId, questions, title = "Section quiz", onResult }: QuizPanelProps) {
  const { submitQuiz, getLastQuizAttempt, hasPassedQuiz } = useWorkspace();
  const lastAttempt = getLastQuizAttempt(sectionId);
  const alreadyPassed = hasPassedQuiz(sectionId);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.every((q) => answers[q.id]);
  const score = questions.filter((q) => answers[q.id]?.toLowerCase() === q.correctAnswer.toLowerCase()).length;
  const passed = questions.length === 0 ? true : score / questions.length >= 0.7;

  const handleSubmit = () => {
    if (!allAnswered) return;
    const attemptId = submitQuiz(sectionId, answers, questions);
    setSubmitted(true);
    onResult?.(passed, attemptId);
  };

  if (alreadyPassed && lastAttempt && !submitted) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Quiz passed</h2>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          You scored {lastAttempt.score} / {lastAttempt.maxScore} on this section quiz.
          The next section is unlocked.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {questions.length} questions · 70% to pass
          </p>
        </div>
        {submitted && (
          <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
            passed
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
            {passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            {score}/{questions.length}
          </span>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const selected = answers[q.id];
          const showCorrect = submitted && selected?.toLowerCase() === q.correctAnswer.toLowerCase();
          const showWrong = submitted && selected && selected.toLowerCase() !== q.correctAnswer.toLowerCase();
          return (
            <div key={q.id} className="border-b border-zinc-100 pb-6 last:border-0 last:pb-0 dark:border-zinc-800">
              <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-white">
                {idx + 1}. {q.prompt}
              </p>
              {q.format === "mcq" && q.options && (
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const isSelected = selected === opt.id;
                    const isCorrectOpt = submitted && opt.id === q.correctAnswer;
                    const isWrongOpt = submitted && isSelected && opt.id !== q.correctAnswer;
                    return (
                      <button
                        key={opt.id}
                        disabled={submitted}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition ${
                          isCorrectOpt
                            ? "border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                            : isWrongOpt
                            ? "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                            : isSelected
                            ? "border-zinc-900 bg-zinc-100 text-zinc-900 dark:border-white dark:bg-zinc-800 dark:text-white"
                            : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-400 text-xs dark:border-zinc-500">
                          {opt.id}
                        </span>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
              )}
              {q.format === "nat" && (
                <input
                  type="text"
                  disabled={submitted}
                  value={selected || ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Type your answer"
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 disabled:opacity-60 dark:bg-zinc-950 dark:text-white ${
                    showCorrect
                      ? "border-green-300 focus:border-green-300 focus:ring-green-300 dark:border-green-800 dark:focus:border-green-800"
                      : showWrong
                      ? "border-red-300 focus:border-red-300 focus:ring-red-300 dark:border-red-800 dark:focus:border-red-800"
                      : "border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:border-white dark:focus:ring-white"
                  }`}
                />
              )}
              {submitted && (
                <div className={`mt-3 rounded-lg p-3 text-sm ${
                  selected?.toLowerCase() === q.correctAnswer.toLowerCase()
                    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                }`}>
                  <span className="font-medium">
                    {selected?.toLowerCase() === q.correctAnswer.toLowerCase() ? "Correct. " : "Incorrect. "}
                  </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="mt-6 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Submit quiz
        </button>
      ) : (
        <div className={`mt-6 rounded-lg p-4 text-center ${
          passed
            ? "bg-green-50 dark:bg-green-900/20"
            : "bg-red-50 dark:bg-red-900/20"
        }`}>
          <p className={`text-lg font-semibold ${
            passed ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
          }`}>
            {passed ? "Section complete!" : "Review needed"}
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {passed
              ? "You passed the quiz. The next section is unlocked."
              : "You need 70% to unlock the next section. A review quiz will help you close the gap."}
          </p>
          {!passed && (
            <button
              onClick={() => { setAnswers({}); setSubmitted(false); }}
              className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Retake quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}
