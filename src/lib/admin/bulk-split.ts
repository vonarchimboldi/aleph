export interface BulkSection {
  title: string;
  content: string;
}

/**
 * Split one pasted markdown document into sections.
 *
 * Primary rule: every `## Heading` starts a new section (title = heading text,
 * body = lines until the next `## `). A leading `# Doc title` is treated as the
 * document title and skipped, as is any preamble before the first `## `.
 *
 * Fallback rule: when the document has no `## ` headings at all, blank-line
 * delimited `---` rules split it into titled-by-first-line sections (a leading
 * markdown heading or bold line becomes the title; otherwise "Part N").
 */
export function splitMarkdownDoc(doc: string): BulkSection[] {
  const lines = doc.replace(/\r\n/g, "\n").split("\n");

  if (lines.some((l) => /^##\s+/.test(l))) {
    const sections: BulkSection[] = [];
    let current: { title: string; lines: string[] } | null = null;

    const flush = () => {
      if (!current) return;
      const content = current.lines.join("\n").trim();
      if (content || sections.length > 0 || current.title) {
        sections.push({ title: current.title, content });
      }
      current = null;
    };

    for (const line of lines) {
      const h2 = line.match(/^##\s+(.+?)\s*#*\s*$/);
      if (h2) {
        flush();
        current = { title: h2[1], lines: [] };
        continue;
      }
      // Skip the document-level `# ` title and any preamble before the first `## `
      if (!current) continue;
      current.lines.push(line);
    }
    flush();
    return sections.filter((s) => s.title);
  }

  // Fallback: `---` separated blocks.
  const blocks = doc
    .replace(/\r\n/g, "\n")
    .split(/\n\s*---+\s*\n/);
  const sections: BulkSection[] = [];
  for (const [i, raw] of blocks.entries()) {
    const blockLines = raw.split("\n");
    let title = "";
    let startIdx = 0;
    const first = blockLines[0]?.trim() ?? "";
    const headingMatch = first.match(/^#{1,6}\s+(.+)$/);
    const boldMatch = first.match(/^\*\*(.+?)\*\*$/);
    if (headingMatch) {
      title = headingMatch[1];
      startIdx = 1;
    } else if (boldMatch) {
      title = boldMatch[1];
      startIdx = 1;
    }
    const content = blockLines.slice(startIdx).join("\n").trim();
    if (!content && !title) continue;
    sections.push({ title: title || `Part ${i + 1}`, content });
  }
  return sections;
}
