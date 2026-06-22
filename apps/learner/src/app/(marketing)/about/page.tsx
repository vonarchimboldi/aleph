import Link from "next/link";
import { ArrowRight, Construction } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="px-4 pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
            Built by people who cracked it.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            aleph was built by exam top-rankers who believe the best way to learn
            is to solve hard problems under continuous feedback. Covers GATE DA, ISI,
            CMI, and other quantitative exams. No shortcuts. No spectacle. Just rigor.
          </p>
        </div>
      </section>

      {/* Team — placeholder */}
      <section className="border-t border-zinc-200 px-4 py-16 dark:border-zinc-800">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-500">
            <Construction className="h-4 w-4" />
            <span className="text-sm font-medium">Team bios coming soon</span>
          </div>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            We're a small team of exam top-rankers, researchers, and educators.
            Detailed team profiles will be added shortly.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-200 px-4 py-16 dark:border-zinc-800">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Learn from people who've been there.
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Every problem set, every quiz, every explanation is written by
            top-rankers who know exactly what these exams ask — and what students miss.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Start learning
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Read our methodology
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
              href="/"
              className="text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/docs"
              className="text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white"
            >
              Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
