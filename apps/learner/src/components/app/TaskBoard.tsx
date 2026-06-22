"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import type { Course } from "@/lib/courses/data";

interface TaskBoardProps {
  courses: Course[];
}

const MOCK_TASKS = [
  {
    id: "task-1",
    title: "Read Section 1.2 — Counting Rules",
    href: "/learn/probability/ch1-probability-foundations/core-ideas",
    priority: 1,
    done: false,
  },
  {
    id: "task-2",
    title: "Solve 3 remaining problems in Section 1.2",
    href: "/learn/probability/ch1-probability-foundations/core-ideas",
    priority: 2,
    done: false,
  },
  {
    id: "task-3",
    title: "Take Section 1.1 Quiz",
    href: "/learn/probability/ch1-probability-foundations/section-quiz",
    priority: 3,
    done: false,
  },
  {
    id: "task-4",
    title: "Review missed concept — Conditional Probability",
    href: "/feedback",
    priority: 4,
    done: true,
  },
];

export default function TaskBoard({ courses }: TaskBoardProps) {
  const [tasks, setTasks] = useState(MOCK_TASKS);

  useEffect(() => {
    // Future: read workspace state and generate real tasks per course.
    // For now we keep the mock list but mark items done from localStorage.
    try {
      const course = courses[0];
      if (!course) return;
      const key = `aleph-workspace-${course.slug}`;
      const raw = window.localStorage.getItem(key);
      if (!raw) return;
      const state = JSON.parse(raw) as {
        completedTaskIds?: string[];
        quizAttempts?: { sectionId: string; passed: boolean }[];
      };
      setTasks((prev) =>
        prev.map((t) => {
          if (t.title.includes("Quiz") && state.quizAttempts?.some((a) => a.passed)) {
            return { ...t, done: true };
          }
          return t;
        })
      );
    } catch {
      // ignore
    }
  }, [courses]);

  return (
    <div className="space-y-3">
      {tasks
        .slice()
        .sort((a, b) => (a.done === b.done ? a.priority - b.priority : a.done ? 1 : -1))
        .map((task) => (
          <Link
            key={task.id}
            href={task.href}
            className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            {task.done ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-zinc-400" />
            )}
            <span
              className={`flex-1 text-sm font-medium ${
                task.done ? "text-zinc-500 line-through dark:text-zinc-400" : "text-zinc-900 dark:text-white"
              }`}
            >
              {task.title}
            </span>
            {!task.done && <ArrowRight className="h-4 w-4 text-zinc-400" />}
          </Link>
        ))}
    </div>
  );
}
