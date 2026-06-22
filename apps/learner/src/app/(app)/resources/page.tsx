import { FileText, BookOpen, Calculator, Video } from "lucide-react";
import Link from "next/link";

const MOCK_RESOURCES = [
  {
    id: "res-1",
    title: "Probability Formula Sheet",
    type: "PDF",
    icon: FileText,
    href: "#",
  },
  {
    id: "res-2",
    title: "GATE DA Previous Year Papers",
    type: "Papers",
    icon: BookOpen,
    href: "#",
  },
  {
    id: "res-3",
    title: "Combinatorics Quick Reference",
    type: "Notes",
    icon: Calculator,
    href: "#",
  },
  {
    id: "res-4",
    title: "Linear Algebra Intuition Playlist",
    type: "Video",
    icon: Video,
    href: "#",
  },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Resources</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Formulas, papers, and reference material.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MOCK_RESOURCES.map((resource) => (
          <Link
            key={resource.id}
            href={resource.href}
            className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <resource.icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-white">{resource.title}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{resource.type}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
