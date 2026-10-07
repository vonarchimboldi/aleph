"use client";

import { useState, useTransition } from "react";
import { importDsaPracticeAction } from "@/lib/admin/actions";

export default function DsaImportForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ chaptersCreated: number; sectionsCreated: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  function handleImport() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const res = await importDsaPracticeAction();
        setResult(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import failed");
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-emerald-900 bg-emerald-950/30 p-4 text-sm text-emerald-400">
          Imported {result.chaptersCreated} chapters and {result.sectionsCreated} sections.
        </div>
      )}

      <button
        type="button"
        onClick={handleImport}
        disabled={isPending}
        className="w-full rounded-xl bg-white px-4 py-3 font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-40"
      >
        {isPending ? "Importing..." : "Run DSA month-1 import"}
      </button>
    </div>
  );
}
