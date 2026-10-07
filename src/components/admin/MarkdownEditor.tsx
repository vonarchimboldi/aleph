"use client";

import { useMemo } from "react";
import MarkdownIt from "markdown-it";

interface MarkdownEditorProps {
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

export default function MarkdownEditor({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  rows = 12,
}: MarkdownEditorProps) {
  const html = useMemo(() => md.render(value || ""), [value]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-300">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-zinc-500"
        />

        <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Preview
          </p>
          <div
            className="prose prose-invert prose-zinc max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Use <code className="rounded bg-zinc-800 px-1">\( ... \)</code> for inline math and{" "}
        <code className="rounded bg-zinc-800 px-1">\[ ... \]</code> for display math. Add images
        with <code className="rounded bg-zinc-800 px-1">![alt](url)</code>. Preview shows markdown
        only; math/images render in the learner app.
      </p>
    </div>
  );
}
