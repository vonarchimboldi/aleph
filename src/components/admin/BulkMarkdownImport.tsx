"use client";

import { useMemo, useState } from "react";
import { Loader2, Check, FileText } from "lucide-react";
import { splitMarkdownDoc } from "@/lib/admin/bulk-split";
import type { SectionType } from "@/lib/admin/types";

export interface ChapterOption {
  id: string;
  label: string;
}

interface BulkMarkdownImportProps {
  chapters: ChapterOption[];
  onImport: (
    chapterId: string,
    sections: { title: string; content: string }[],
    type: SectionType,
    estimatedMinutes: number
  ) => Promise<{ imported: number }>;
}

const sectionTypes: { value: SectionType; label: string }[] = [
  { value: "read", label: "Read" },
  { value: "concept", label: "Concept" },
  { value: "mechanic", label: "Mechanic" },
  { value: "integration", label: "Integration" },
  { value: "challenge", label: "Challenge" },
  { value: "summary", label: "Summary" },
];

export default function BulkMarkdownImport({ chapters, onImport }: BulkMarkdownImportProps) {
  const [chapterId, setChapterId] = useState("");
  const [doc, setDoc] = useState("");
  const [type, setType] = useState<SectionType>("read");
  const [minutes, setMinutes] = useState(10);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sections = useMemo(() => splitMarkdownDoc(doc), [doc]);
  const emptyBodies = sections.filter((s) => s.content.trim().length === 0).length;

  async function handleImport() {
    if (!chapterId || sections.length === 0) return;
    setImporting(true);
    setResult(null);
    setError(null);
    try {
      const res = await onImport(chapterId, sections, type, minutes);
      setResult(res.imported);
      setDoc("");
    } catch (err) {
      console.error("[BulkMarkdownImport] failed:", err);
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Target chapter</label>
        <select
          value={chapterId}
          onChange={(e) => setChapterId(e.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-500 focus:outline-none"
        >
          <option value="">Select a chapter…</option>
          {chapters.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Section type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as SectionType)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-500 focus:outline-none"
          >
            {sectionTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Est. minutes per section</label>
          <input
            type="number"
            min={0}
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Markdown document</label>
        <textarea
          value={doc}
          onChange={(e) => setDoc(e.target.value)}
          rows={16}
          placeholder={"# Course notes\n\n## Section one title\n\nMarkdown content…\n\n## Section two title\n\nMore content…"}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Splits on <code className="rounded bg-zinc-800 px-1">## headings</code> (one section per heading).
          Documents without <code className="rounded bg-zinc-800 px-1">## </code> split on{" "}
          <code className="rounded bg-zinc-800 px-1">---</code> rules instead. Math with{" "}
          <code className="rounded bg-zinc-800 px-1">\( \)</code> / <code className="rounded bg-zinc-800 px-1">\[ \]</code> renders in the learner app.
        </p>
      </div>

      {doc.trim() && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Preview — {sections.length} section{sections.length === 1 ? "" : "s"}
            {emptyBodies > 0 && ` · ${emptyBodies} empty`}
          </p>
          <ul className="max-h-56 space-y-1.5 overflow-y-auto">
            {sections.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                <FileText className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                <span className="truncate">{s.title}</span>
                <span className="ml-auto shrink-0 text-xs tabular-nums text-zinc-500">
                  {s.content.trim().length.toLocaleString()} chars
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={!chapterId || sections.length === 0 || importing}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
      >
        {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {importing ? "Importing…" : `Import ${sections.length || "…"} sections`}
      </button>

      {result !== null && (
        <p className="flex items-center gap-1.5 text-sm text-green-400">
          <Check className="h-4 w-4" /> Imported {result} sections — they were appended after existing ones.
        </p>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
