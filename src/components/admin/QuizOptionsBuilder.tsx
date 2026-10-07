"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface QuizOptionsBuilderProps {
  name?: string;
  defaultValue?: string;
}

export default function QuizOptionsBuilder({
  name = "options",
  defaultValue = "",
}: QuizOptionsBuilderProps) {
  const [options, setOptions] = useState<string[]>(() =>
    defaultValue
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const [draft, setDraft] = useState("");

  function addOption() {
    const text = draft.trim();
    if (!text) return;
    setOptions((prev) => [...prev, text]);
    setDraft("");
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300">
        Options (for MCQ/MSQ)
      </label>

      <div className="mt-2 space-y-2">
        {options.length === 0 && (
          <p className="text-xs text-zinc-500">No options yet. Add at least two.</p>
        )}

        {options.map((opt, idx) => {
          const letter = String.fromCharCode(97 + idx);
          return (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2"
            >
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs font-medium text-zinc-300">
                {letter.toUpperCase()}
              </span>
              <span className="flex-1 text-sm text-zinc-300">{opt}</span>
              <button
                type="button"
                onClick={() => removeOption(idx)}
                className="text-zinc-500 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}

        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addOption();
              }
            }}
            placeholder="Type an option and press Enter"
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-white outline-none focus:border-zinc-500"
          />
          <button
            type="button"
            onClick={addOption}
            className="rounded-xl bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <input type="hidden" name={name} value={options.join("\n")} />
    </div>
  );
}
