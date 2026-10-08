/**
 * Content audit — flags section content that will not render well.
 *
 * Shared by:
 *  - the learner renderer (dev-mode console warning),
 *  - the admin markdown editor (live panel + confirm-before-save),
 *  - scripts/audit-content.ts (bulk scan of every section).
 *
 * False-positive control: fenced code blocks and inline code are stripped
 * BEFORE prose checks, because inside code `<...>` and `&lt;...&gt;` are
 * intentional (C++ templates, comparisons) and render correctly.
 */

export type IssueSeverity = "error" | "warn" | "info";

export interface ContentIssue {
  severity: IssueSeverity;
  code: string;
  message: string;
  snippet: string;
}

export interface AuditOptions {
  /** Section type — some types legitimately have no reading content. */
  sectionType?: string;
}

/** HTML tags the renderer supports and that we consider "expected" content. */
const KNOWN_TAG =
  /<\/?(h[1-6]|p|ul|ol|li|div|span|table|thead|tbody|tr|th|td|code|pre|strong|em|b|i|u|s|a|img|br|hr|blockquote|sub|sup|kbd|details|summary)\b/i;

/** Tag-like token at end of line, e.g. `<div` or `<span class="x"` — likely a broken/unclosed tag. */
const SUSPECT_TAG = /<\/?[a-zA-Z][a-zA-Z0-9]*(\s[^<>]*)?(\n|$)/;

/** Types where empty content is suspicious (they exist to be read). */
const CONTENT_TYPES = new Set(["read", "concept"]);

const SHORT_LIMIT = 50;
const LONG_LIMIT = 30000;

/**
 * Remove code (fenced blocks, inline spans, and HTML code/pre elements) so
 * prose checks ignore it. Inside code, `<...>` and `&lt;...&gt;` are
 * intentional — C++ templates, comparisons — and render correctly.
 */
function stripCode(content: string): string {
  return content
    .replace(/```[\s\S]*?(```|$)/g, " ")
    .replace(/`[^`\n]*`/g, " ")
    .replace(/<(pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");
}

function count(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

export function auditContent(raw: string | null | undefined, opts: AuditOptions = {}): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const text = raw ?? "";
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    if (!opts.sectionType || CONTENT_TYPES.has(opts.sectionType)) {
      issues.push({
        severity: "warn",
        code: "EMPTY",
        message: "No content — learners will see an empty section",
        snippet: "",
      });
    }
    return issues;
  }

  const prose = stripCode(text);

  // Escaped tags in prose (&lt;div&gt;) display as literal "<div>" text.
  const escaped = prose.match(/&lt;\s*\/?\s*[a-zA-Z][^&]{0,40}?&gt;/);
  if (escaped) {
    issues.push({
      severity: "error",
      code: "DOUBLE_ESCAPED",
      message: "Escaped HTML (&lt;...&gt;) outside code — will show as literal tags",
      snippet: escaped[0].slice(0, 60),
    });
  }

  // Real HTML in prose. The learner renderer escapes raw HTML (html: false),
  const known = prose.match(KNOWN_TAG);
  if (known) {
    issues.push({
      severity: "info",
      code: "HTML",
      message: "Contains HTML tags — renders fine, but prefer markdown for portability",
      snippet: known[0].slice(0, 40),
    });
  }

  // Unclosed/broken tag-looking token in prose (not plain math like i<n).
  const suspect = prose.match(SUSPECT_TAG);
  if (suspect && !KNOWN_TAG.test(suspect[0])) {
    issues.push({
      severity: "warn",
      code: "SUSPECT_TAG",
      message: "Possible unclosed or broken tag",
      snippet: suspect[0].trim().slice(0, 60),
    });
  }

  // Unbalanced KaTeX delimiters.
  const openInline = count(prose, "\\(");
  const closeInline = count(prose, "\\)");
  const openDisplay = count(prose, "\\[");
  const closeDisplay = count(prose, "\\]");
  if (openInline !== closeInline || openDisplay !== closeDisplay) {
    issues.push({
      severity: "error",
      code: "UNBALANCED_MATH",
      message: `Unbalanced math delimiters — \\(×${openInline}, \\)×${closeInline}, \\[×${openDisplay}, \\]×${closeDisplay}`,
      snippet: "",
    });
  }

  if (trimmed.length < SHORT_LIMIT) {
    issues.push({
      severity: "info",
      code: "SHORT",
      message: `Very short (${trimmed.length} chars) — is this section complete?`,
      snippet: trimmed.slice(0, 40),
    });
  }
  if (text.length > LONG_LIMIT) {
    issues.push({
      severity: "info",
      code: "LONG",
      message: `Very long (${text.length.toLocaleString()} chars) — check review/render cost`,
      snippet: "",
    });
  }

  return issues;
}

/** Highest severity present, or null when clean. */
export function worstSeverity(issues: ContentIssue[]): IssueSeverity | null {
  if (issues.some((i) => i.severity === "error")) return "error";
  if (issues.some((i) => i.severity === "warn")) return "warn";
  if (issues.length > 0) return "info";
  return null;
}
