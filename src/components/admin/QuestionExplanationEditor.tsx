"use client";

import { useState } from "react";
import { Loader2, Check, Pencil } from "lucide-react";

interface QuestionExplanationEditorProps {
  questionId: string;
  explanation: string | null;
  onSave: (questionId: string, explanation: string) => Promise<void>;
}

export default function QuestionExplanationEditor({
  questionId,
  explanation,
  onSave,
}: QuestionExplanationEditorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(explanation ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await onSave(questionId, value);
      setSaved(true);
      setTimeout(() => setOpen(false), 600);
    } catch (err) {
      console.error("[QuestionExplanationEditor] save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 border-t border-zinc-800 pt-3">
      {!open ? (
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm ${explanation ? "text-zinc-400" : "italic text-zinc-600"}`}>
            {explanation ? (
              <>
                <span className="font-medium text-zinc-500">Explanation: </span>
                {explanation.length > 220 ? `${explanation.slice(0, 220)}…` : explanation}
              </>
            ) : (
              "No explanation yet."
            )}
          </p>
          <button
            onClick={() => setOpen(true)}
            className="flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Pencil className="h-3 w-3" />
            {explanation ? "Edit" : "Add"}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={5}
            placeholder="Why is the correct answer right? Address the tempting wrong option. Markdown + \( math \) supported."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : null}
              {saving ? "Saving…" : saved ? "Saved" : "Save explanation"}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setValue(explanation ?? "");
              }}
              className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
