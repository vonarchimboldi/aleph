"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import type { Course, Problem, QuizQuestion } from "@/lib/courses/data";

export type QuizAttempt = {
  id: string;
  sectionId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  answers: Record<string, string>;
  submittedAt: string;
};

export type ReviewQuizAttempt = {
  id: string;
  sectionId: string;
  triggeredByAttemptId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  answers: Record<string, string>;
  submittedAt: string;
};

export type WorkspaceState = {
  currentSectionId: string | null;
  currentTaskIdsBySection: Record<string, string | null>;
  completedTaskIds: string[];
  skippedTaskIds: string[];
  viewedSolutionTaskIds: string[];
  quizAttempts: QuizAttempt[];
  reviewQuizAttempts: ReviewQuizAttempt[];
};

const EMPTY_STATE: WorkspaceState = {
  currentSectionId: null,
  currentTaskIdsBySection: {},
  completedTaskIds: [],
  skippedTaskIds: [],
  viewedSolutionTaskIds: [],
  quizAttempts: [],
  reviewQuizAttempts: [],
};

type WorkspaceContextValue = WorkspaceState & {
  isSectionLocked: (sectionId: string) => boolean;
  isSectionCompleted: (sectionId: string, tasks?: Problem[]) => boolean;
  isSectionReadyForQuiz: (sectionId: string, tasks?: Problem[]) => boolean;
  hasPassedQuiz: (sectionId: string) => boolean;
  hasPassedReviewQuiz: (sectionId: string) => boolean;
  getLastQuizAttempt: (sectionId: string) => QuizAttempt | undefined;
  needsReview: (sectionId: string) => boolean;
  getSectionTaskProgress: (sectionId: string, tasks?: Problem[]) => { completed: number; total: number };
  currentTaskId: string | null;
  setCurrentTaskId: (taskId: string | null) => void;
  completeTask: (taskId: string) => void;
  skipTask: (taskId: string) => void;
  unskipTask: (taskId: string) => void;
  markSolutionViewed: (taskId: string) => void;
  submitQuiz: (sectionId: string, answers: Record<string, string>, questions: QuizQuestion[]) => string;
  submitReviewQuiz: (
    sectionId: string,
    triggeredByAttemptId: string,
    answers: Record<string, string>,
    questions: QuizQuestion[]
  ) => string;
  resetSection: (sectionId: string) => void;
  completedSectionCount: number;
  totalSections: number;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function storageKey(courseSlug: string) {
  return `aleph-workspace-${courseSlug}`;
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function gradeAnswers(answers: Record<string, string>, questions: QuizQuestion[]) {
  let score = 0;
  for (const q of questions) {
    const answer = answers[q.id];
    if (answer && answer.toLowerCase() === q.correctAnswer.toLowerCase()) {
      score += 1;
    }
  }
  return { score, maxScore: questions.length };
}

export function WorkspaceProvider({
  course,
  children,
}: {
  course: Course;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<WorkspaceState>(EMPTY_STATE);

  const sections = useMemo(
    () => course.chapters.flatMap((ch) => ch.sections),
    [course]
  );
  const sectionIndexById = useMemo(() => {
    const map = new Map<string, number>();
    sections.forEach((s, idx) => map.set(s.id, idx));
    return map;
  }, [sections]);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(storageKey(course.slug)) : null;
      const parsed = raw ? (JSON.parse(raw) as WorkspaceState) : null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(parsed ? { ...EMPTY_STATE, ...parsed } : EMPTY_STATE);
    } catch {
      setState(EMPTY_STATE);
    }
    setReady(true);
  }, [course.slug]);

  // Save to localStorage
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(storageKey(course.slug), JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state, course.slug, ready]);

  // Sync current section from URL
  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "learn" && segments[1] === course.slug && segments[2] && segments[3]) {
      const chapterSlug = segments[2];
      const sectionSlug = segments[3];
      const section = course.chapters
        .find((ch) => ch.slug === chapterSlug)
        ?.sections.find((s) => s.slug === sectionSlug);
      if (section) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState((prev) => ({
          ...prev,
          currentSectionId: section.id,
        }));
      }
    }
  }, [pathname, course]);

  const isSectionLocked = useCallback(
    (sectionId: string) => {
      const idx = sectionIndexById.get(sectionId);
      if (idx === undefined || idx === 0) return false;
      const previous = sections[idx - 1];
      if (!previous) return false;
      const passed = state.quizAttempts.some(
        (a) => a.sectionId === previous.id && a.passed
      );
      return !passed;
    },
    [sections, sectionIndexById, state.quizAttempts]
  );

  const hasPassedQuiz = useCallback(
    (sectionId: string) =>
      state.quizAttempts.some((a) => a.sectionId === sectionId && a.passed),
    [state.quizAttempts]
  );

  const getLastQuizAttempt = useCallback(
    (sectionId: string) => {
      const attempts = state.quizAttempts
        .filter((a) => a.sectionId === sectionId)
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
      return attempts[0];
    },
    [state.quizAttempts]
  );

  const hasPassedReviewQuiz = useCallback(
    (sectionId: string) =>
      state.reviewQuizAttempts.some((a) => a.sectionId === sectionId && a.passed),
    [state.reviewQuizAttempts]
  );

  const needsReview = useCallback(
    (sectionId: string) => {
      const last = getLastQuizAttempt(sectionId);
      if (!last || last.passed) return false;
      return !hasPassedReviewQuiz(sectionId);
    },
    [getLastQuizAttempt, hasPassedReviewQuiz]
  );

  const getSectionTaskProgress = useCallback(
    (_sectionId: string, tasks?: Problem[]) => {
      const total = tasks?.length ?? 0;
      const completed =
        tasks?.filter((t) => state.completedTaskIds.includes(t.id)).length ?? 0;
      return { completed, total };
    },
    [state.completedTaskIds]
  );

  const isSectionReadyForQuiz = useCallback(
    (sectionId: string, tasks?: Problem[]) => {
      if (!tasks || tasks.length === 0) return true;
      const pending = tasks.filter(
        (t) =>
          !state.completedTaskIds.includes(t.id) &&
          !state.skippedTaskIds.includes(t.id)
      );
      return pending.length === 0;
    },
    [state.completedTaskIds, state.skippedTaskIds]
  );

  const isSectionCompleted = useCallback(
    (sectionId: string, tasks?: Problem[]) => {
      const quizDone = hasPassedQuiz(sectionId);
      if (!tasks || tasks.length === 0) return quizDone;
      const allTasksDone = tasks.every(
        (t) =>
          state.completedTaskIds.includes(t.id) ||
          state.skippedTaskIds.includes(t.id)
      );
      return allTasksDone && quizDone;
    },
    [hasPassedQuiz, state.completedTaskIds, state.skippedTaskIds]
  );

  const completedSectionCount = useMemo(
    () =>
      sections.filter((s) => isSectionCompleted(s.id, s.problems ?? [])).length,
    [sections, isSectionCompleted]
  );

  const setCurrentTaskId = useCallback((taskId: string | null) => {
    setState((prev) => {
      if (!prev.currentSectionId) return prev;
      return {
        ...prev,
        currentTaskIdsBySection: {
          ...prev.currentTaskIdsBySection,
          [prev.currentSectionId]: taskId,
        },
      };
    });
  }, []);

  const completeTask = useCallback((taskId: string) => {
    setState((prev) => ({
      ...prev,
      completedTaskIds: Array.from(new Set([...prev.completedTaskIds, taskId])),
      skippedTaskIds: prev.skippedTaskIds.filter((id) => id !== taskId),
    }));
  }, []);

  const skipTask = useCallback((taskId: string) => {
    setState((prev) => ({
      ...prev,
      skippedTaskIds: Array.from(new Set([...prev.skippedTaskIds, taskId])),
      completedTaskIds: prev.completedTaskIds.filter((id) => id !== taskId),
    }));
  }, []);

  const unskipTask = useCallback((taskId: string) => {
    setState((prev) => ({
      ...prev,
      skippedTaskIds: prev.skippedTaskIds.filter((id) => id !== taskId),
    }));
  }, []);

  const markSolutionViewed = useCallback((taskId: string) => {
    setState((prev) => ({
      ...prev,
      viewedSolutionTaskIds: Array.from(
        new Set([...prev.viewedSolutionTaskIds, taskId])
      ),
      completedTaskIds: Array.from(new Set([...prev.completedTaskIds, taskId])),
      skippedTaskIds: prev.skippedTaskIds.filter((id) => id !== taskId),
    }));
  }, []);

  const submitQuiz = useCallback(
    (sectionId: string, answers: Record<string, string>, questions: QuizQuestion[]) => {
      const { score, maxScore } = gradeAnswers(answers, questions);
      const passed = maxScore === 0 ? true : score / maxScore >= 0.7;
      const attempt: QuizAttempt = {
        id: generateId(),
        sectionId,
        score,
        maxScore,
        passed,
        answers,
        submittedAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        quizAttempts: [...prev.quizAttempts, attempt],
      }));
      return attempt.id;
    },
    []
  );

  const submitReviewQuiz = useCallback(
    (
      sectionId: string,
      triggeredByAttemptId: string,
      answers: Record<string, string>,
      questions: QuizQuestion[]
    ) => {
      const { score, maxScore } = gradeAnswers(answers, questions);
      const passed = maxScore === 0 ? true : score / maxScore >= 0.7;
      const attempt: ReviewQuizAttempt = {
        id: generateId(),
        sectionId,
        triggeredByAttemptId,
        score,
        maxScore,
        passed,
        answers,
        submittedAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        reviewQuizAttempts: [...prev.reviewQuizAttempts, attempt],
      }));
      return attempt.id;
    },
    []
  );

  const resetSection = useCallback((sectionId: string) => {
    setState((prev) => {
      const tasksInSection = sections
        .find((s) => s.id === sectionId)
        ?.problems?.map((p) => p.id) ?? [];
      return {
        ...prev,
        completedTaskIds: prev.completedTaskIds.filter(
          (id) => !tasksInSection.includes(id)
        ),
        skippedTaskIds: prev.skippedTaskIds.filter(
          (id) => !tasksInSection.includes(id)
        ),
        viewedSolutionTaskIds: prev.viewedSolutionTaskIds.filter(
          (id) => !tasksInSection.includes(id)
        ),
        quizAttempts: prev.quizAttempts.filter((a) => a.sectionId !== sectionId),
        reviewQuizAttempts: prev.reviewQuizAttempts.filter(
          (a) => a.sectionId !== sectionId
        ),
        currentTaskIdsBySection: {
          ...prev.currentTaskIdsBySection,
          [sectionId]: null,
        },
      };
    });
  }, [sections]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      ...state,
      isSectionLocked,
      isSectionCompleted,
      isSectionReadyForQuiz,
      hasPassedQuiz,
      hasPassedReviewQuiz,
      getLastQuizAttempt,
      needsReview,
      getSectionTaskProgress,
      currentTaskId: state.currentSectionId
        ? state.currentTaskIdsBySection[state.currentSectionId] ?? null
        : null,
      setCurrentTaskId,
      completeTask,
      skipTask,
      unskipTask,
      markSolutionViewed,
      submitQuiz,
      submitReviewQuiz,
      resetSection,
      completedSectionCount,
      totalSections: sections.length,
    }),
    [
      state,
      isSectionLocked,
      isSectionCompleted,
      isSectionReadyForQuiz,
      hasPassedQuiz,
      hasPassedReviewQuiz,
      getLastQuizAttempt,
      needsReview,
      getSectionTaskProgress,
      setCurrentTaskId,
      completeTask,
      skipTask,
      unskipTask,
      markSolutionViewed,
      submitQuiz,
      submitReviewQuiz,
      resetSection,
      completedSectionCount,
      sections.length,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
