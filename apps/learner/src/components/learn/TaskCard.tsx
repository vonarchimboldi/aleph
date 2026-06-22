"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Lightbulb, Eye, SkipForward, RotateCcw } from "lucide-react";
import KaTeXRenderer from "./KaTeXRenderer";
import { useWorkspace } from "./WorkspaceProvider";
import type { Problem } from "@/lib/courses/data";

interface TaskCardProps {
  problem: Problem;
  index: number;
}

export default function TaskCard({ problem, index }: TaskCardProps) {
  const {
    completedTaskIds,
    skippedTaskIds,
    viewedSolutionTaskIds,
    completeTask,
    skipTask,
    unskipTask,
    markSolutionViewed,
  } = useWorkspace();

  const isCompleted = completedTaskIds.includes(problem.id);
  const isSkipped = skippedTaskIds.includes(problem.id);
  const hasViewedSolution = viewedSolutionTaskIds.includes(problem.id);

  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const isCorrect = checked && answer.trim().toLowerCase() === problem.answer.toLowerCase();
  const isWrong = checked && !isCorrect;

  const handleCheck = () => {
    setChecked(true);
    if (answer.trim().toLowerCase() === problem.answer.toLowerCase()) {
      completeTask(problem.id);
    }
  };

  const handleToggleSolution = () => {
    if (!showSolution) {
      markSolutionViewed(problem.id);
    }
    setShowSolution(!showSolution);
  };

  const statusBadge = () => {
    if (isSkipped) {
      return (
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          Skipped
        </span>
      );
    }
    if (hasViewedSolution) {
      return (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          Completed via solution
        </span>
      );
    }
    if (isCompleted) {
      return (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Completed
        </span>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
          problem.label === "concept" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
          problem.label === "mechanic" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
          problem.label === "integration" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
          problem.label === "isi" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        }`}>
          {problem.label}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Problem {index}</span>
        {statusBadge()}
      </div>

      <KaTeXRenderer content={problem.statement} className="mb-4" />

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={answer}
          onChange={(e) => { setAnswer(e.target.value); setChecked(false); }}
          placeholder="Your answer"
          disabled={isCompleted || isSkipped}
          className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-white dark:focus:ring-white"
        />
        <button
          onClick={handleCheck}
          disabled={isCompleted || isSkipped}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Check
        </button>
      </div>

      {isCorrect && (
        <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" /> Correct
        </div>
      )}
      {isWrong && !isSkipped && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <XCircle className="h-4 w-4" /> Try again
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {problem.hints && problem.hints.length > 0 && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1 rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            {showHint ? "Hide hint" : "Hint"}
          </button>
        )}
        <button
          onClick={handleToggleSolution}
          className="flex items-center gap-1 rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Eye className="h-3.5 w-3.5" />
          {showSolution ? "Hide solution" : "Solution"}
        </button>
        {!isCompleted && !isSkipped ? (
          <button
            onClick={() => skipTask(problem.id)}
            className="flex items-center gap-1 rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <SkipForward className="h-3.5 w-3.5" />
            Skip
          </button>
        ) : isSkipped ? (
          <button
            onClick={() => unskipTask(problem.id)}
            className="flex items-center gap-1 rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry
          </button>
        ) : null}
      </div>

      {showHint && problem.hints && (
        <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          {problem.hints[0]}
        </div>
      )}
      {showSolution && (
        <div className="mt-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950">
          <p className="mb-1 text-xs font-medium uppercase text-zinc-500">Solution</p>
          <KaTeXRenderer content={problem.solution} />
        </div>
      )}
    </div>
  );
}
