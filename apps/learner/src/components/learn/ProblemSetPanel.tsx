"use client";

import TaskCard from "./TaskCard";
import { useWorkspace } from "./WorkspaceProvider";
import type { Problem } from "@/lib/courses/data";

interface ProblemSetPanelProps {
  sectionId: string;
  problems: Problem[];
}

const TIERS = [
  {
    key: "foundation",
    title: "Foundation",
    subtitle: "Concept + Mechanic",
    labels: new Set<Problem["label"]>(["concept", "mechanic"]),
  },
  {
    key: "integration",
    title: "Integration",
    subtitle: "Multi-concept problems",
    labels: new Set<Problem["label"]>(["integration"]),
  },
  {
    key: "challenge",
    title: "Challenge",
    subtitle: "Hard / ISI-level",
    labels: new Set<Problem["label"]>(["challenge", "isi"]),
  },
] as const;

export default function ProblemSetPanel({ sectionId, problems }: ProblemSetPanelProps) {
  const { completedTaskIds, skippedTaskIds, isSectionReadyForQuiz } = useWorkspace();
  const readyForQuiz = isSectionReadyForQuiz(sectionId, problems);

  const tierGroups = TIERS.map((tier) => ({
    ...tier,
    tasks: problems.filter((p) => tier.labels.has(p.label)),
  })).filter((g) => g.tasks.length > 0);

  const completedOrSkipped = problems.filter(
    (p) => completedTaskIds.includes(p.id) || skippedTaskIds.includes(p.id)
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Practice problems</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {problems.length} problems · {completedOrSkipped} completed or skipped
          </p>
        </div>
        {readyForQuiz && (
          <span className="self-start rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Ready for quiz
          </span>
        )}
      </div>

      {tierGroups.map((group) => {
        const groupDone = group.tasks.filter(
          (p) => completedTaskIds.includes(p.id) || skippedTaskIds.includes(p.id)
        ).length;
        return (
          <section key={group.key}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white">{group.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{group.subtitle}</p>
              </div>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {groupDone}/{group.tasks.length}
              </span>
            </div>
            <div className="space-y-4">
              {group.tasks.map((problem, idx) => (
                <TaskCard key={problem.id} problem={problem} index={idx + 1} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
