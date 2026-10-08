"use client";

import { useRef, type FormEvent, type ReactNode } from "react";
import { auditContent } from "@/lib/content/audit";

interface AuditFormProps {
  action: (formData: FormData) => void | Promise<void>;
  /** Names of textarea/content fields to audit before submitting. */
  auditFields: string[];
  className?: string;
  children: ReactNode;
}

/**
 * Wraps a server-action form. Before submit, audits the named content fields;
 * if any have error-level issues, asks the admin to confirm saving anyway.
 */
export default function AuditForm({ action, auditFields, className, children }: AuditFormProps) {
  const confirmed = useRef(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    if (confirmed.current) {
      confirmed.current = false;
      return;
    }

    const problems: string[] = [];
    for (const name of auditFields) {
      const el = e.currentTarget.elements.namedItem(name);
      const value = el && "value" in el ? String((el as unknown as HTMLTextAreaElement).value) : "";
      for (const issue of auditContent(value)) {
        if (issue.severity === "error") {
          problems.push(`• ${name}: ${issue.code} — ${issue.message}`);
        }
      }
    }

    if (problems.length === 0) return;

    e.preventDefault();
    const shown = problems.slice(0, 5).join("\n");
    const more = problems.length > 5 ? `\n…and ${problems.length - 5} more.` : "";
    const ok = window.confirm(
      `This content has ${problems.length} problem(s) that will NOT render well:\n\n${shown}${more}\n\nSave anyway?`
    );
    if (ok) {
      confirmed.current = true;
      e.currentTarget.requestSubmit();
    }
  }

  return (
    <form action={action} onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
}
