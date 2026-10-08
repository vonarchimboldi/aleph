"use client";

import { useMemo } from "react";
import MarkdownIt from "markdown-it";
import { AlertTriangle, OctagonAlert, Info } from "lucide-react";
import { auditContent, type ContentIssue } from "@/lib/content/audit";

interface MarkdownEditorProps {
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

// html: true matches the learner renderer exactly, so the preview shows
// what learners will see (admin-authored content is RBAC-protected).
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const SEVERITY_STYLES: Record<
  ContentIssue["severity"],
  { icon: typeof Info; row: string; label: string }
> = {
  error: { icon: OctagonAlert, row: "text-red-400", label: "Will break" },
  warn: { icon: AlertTriangle, row: "text-amber-400", label: "Check" },
  info: { icon: Info, row: "text-zinc-400", label: "Note" },
};

function IssueList({ issues }: { issues: ContentIssue[] }) {
  return (
    <ul className="space-y-1.5">
      {issues.map((issue, idx) => {
        const style = SEVERITY_STYLES[issue.severity];
        const Icon = style.icon;
        return (
          <li key={idx} className={`flex items-start gap-2 text-xs ${style.row}`}>
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              <span className="font-medium">[{issue.code}]</span> {issue.message}
              {issue.snippet && (
                <code className="ml-1 break-all rounded bg-zinc-800 px-1 text-zinc-400">
                  {issue.snippet}
                </code>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

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
  const issues = useMemo(() => auditContent(value), [value]);

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

      {issues.length > 0 && (
        <div
          className={`rounded-xl border p-3 ${
            issues.some((i) => i.severity === "error")
              ? "border-red-800 bg-red-950/40"
              : issues.some((i) => i.severity === "warn")
                ? "border-amber-800 bg-amber-950/30"
                : "border-zinc-800 bg-zinc-900"
          }`}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Content warnings ({issues.length})
          </p>
          <IssueList issues={issues} />
        </div>
      )}

      <p className="text-xs text-zinc-500">
        Use <code className="rounded bg-zinc-800 px-1">\( ... \)</code> for inline math and{" "}
        <code className="rounded bg-zinc-800 px-1">\[ ... \]</code> for display math. Add images
        with <code className="rounded bg-zinc-800 px-1">![alt](url)</code>. Preview matches the
        learner app exactly.
      </p>
    </div>
  );
}
