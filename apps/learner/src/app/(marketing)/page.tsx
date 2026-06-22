import Link from "next/link";
import { ArrowRight, BookOpen, Target, Lock, CheckCircle } from "lucide-react";
import { FeedbackLoop } from "@/components/illustrations/FeedbackLoop";
import { ParallelSubjects } from "@/components/illustrations/ParallelSubjects";
import { ConceptGraph } from "@/components/illustrations/ConceptGraph";
import { ReviewCycle } from "@/components/illustrations/ReviewCycle";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <Target className="mr-1.5 h-3.5 w-3.5" />
            Quantitative Exam Preparation
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl dark:text-white">
            Know what you don't know.{" "}
            <span className="text-zinc-400 dark:text-zinc-500">Then fix it.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            aleph is an exam preparation platform built on continuous feedback.
            Three subjects in parallel. A 15-day adaptive cumulative review that resurfaces
            weak concepts and fades mastered ones. Every quiz exposes your gaps.
            You don't move forward until the system is sure you understand.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {["GATE DA", "ISI", "CMI", "IIT JAM", "NBHM"].map((exam) => (
              <span
                key={exam}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              >
                {exam}
              </span>
            ))}
            <span className="text-xs text-zinc-400 dark:text-zinc-600">and more</span>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-zinc-900/20 transition hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/30 sm:w-auto dark:bg-white dark:text-zinc-900 dark:shadow-zinc-500/10 dark:hover:bg-zinc-200"
            >
              Create free account
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-zinc-900 bg-white px-8 py-4 text-base font-semibold text-zinc-900 transition hover:bg-zinc-50 sm:w-auto dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-zinc-800"
            >
              Already have an account? Sign in
            </Link>
          </div>

          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
            No credit card required. Start with free problem sets.
          </p>

          <div className="mt-16 flex justify-center text-zinc-400 dark:text-zinc-600">
            <FeedbackLoop />
          </div>
        </div>
      </section>

      {/* How it works — with visual */}
      <section className="border-t border-zinc-200 px-4 py-20 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-zinc-900 dark:text-white">
            How aleph works
          </h2>

          {/* Parallel subjects diagram */}
          <div className="mt-10 flex justify-center">
            <ParallelSubjects />
          </div>
          <p className="mx-auto mt-3 max-w-md text-center text-xs text-zinc-500 dark:text-zinc-500">
            Three subjects progress in parallel. You don't finish one before starting the next.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BookOpen,
                title: "Read the theory",
                desc: "Concise, rigorous material. No fluff. No 40-minute videos.",
              },
              {
                icon: Target,
                title: "Solve problem sets",
                desc: "Concept, integration, and challenge problems. Each set is calibrated to the section's difficulty.",
              },
              {
                icon: Lock,
                title: "Pass the quiz",
                desc: "Demonstrate understanding to unlock the next section. Fall short? Get a targeted review quiz and retry.",
              },
              {
                icon: CheckCircle,
                title: "Build mastery",
                desc: "Concept graphs track dependencies across subjects. Weak on combinatorics? The system knows and adapts.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <feature.icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Continuous feedback — with visuals */}
      <section className="border-t border-zinc-200 px-4 py-20 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-zinc-900 dark:text-white">
            Continuous feedback. No blind spots.
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-600 dark:text-zinc-400">
            Most platforms tell you your score. aleph tells you exactly what to fix.
          </p>

          {/* Two large visual cards */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {/* Concept graph card */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex-shrink-0">
                  <ConceptGraph />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Diagnose every gap
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Every quiz question maps to a specific concept node. Get one wrong?
                    The system traces the dependency graph and tells you exactly which
                    prerequisite to review — not just "you got 3 wrong."
                  </p>
                </div>
              </div>
            </div>

            {/* Review cycle card */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex-shrink-0">
                  <ReviewCycle />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Adaptive cumulative review
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Every 15 days, a review quiz surfaces weak concepts, skips mastered
                    ones, and brings back high-weight exam topics. No two students see
                    the same quiz — it adapts to your actual performance graph.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Third card — strengths */}
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <CheckCircle className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Know your strengths too
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  The concept graph tracks mastery across all topics. Green nodes mean you own it.
                  Red nodes mean it needs work. Gray nodes mean you haven't reached it yet.
                  No more studying what you already know.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses preview */}
      <section className="border-t border-zinc-200 px-4 py-20 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-zinc-900 dark:text-white">
            Courses
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-600 dark:text-zinc-400">
            Each course is a complete roadmap from fundamentals to exam-level problems.
            Applicable across GATE DA, ISI, CMI, and other quantitative exams.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Probability & Statistics
                </h3>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  Built
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Chapters 1–10. Combinatorics through expectation and inequalities.
                Labelled practice problems with full worked solutions.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
                <span>10 chapters</span>
                <span>&middot;</span>
                <span>80+ sections</span>
                <span>&middot;</span>
                <span>Built</span>
              </div>
              <div className="mt-4">
                <Link
                  href="/docs"
                  className="text-sm font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
                >
                  Browse content &rarr;
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Linear Algebra
                </h3>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  Built
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Chapters 1–4. Matrices, eigenvalues, vector spaces, and linear transformations.
                Structured for exam depth.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
                <span>4 chapters</span>
                <span>&middot;</span>
                <span>32+ sections</span>
                <span>&middot;</span>
                <span>Built</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pedagogy */}
      <section className="border-t border-zinc-200 px-4 py-20 dark:border-zinc-800">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Built on pedagogical rigor
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Every problem set passes a 6-dimension quality rubric.
            Explanations are banned from using "clearly," "obviously," or "trivially."
            Solutions show every step. No hand-waving. No skipped algebra.
          </p>
          <div className="mt-8">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Read our methodology
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 px-4 py-8 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} aleph
          </p>
          <div className="flex gap-4">
            <Link
              href="/docs"
              className="text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white"
            >
              Docs
            </Link>
            <Link
              href="/login"
              className="text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white"
            >
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
