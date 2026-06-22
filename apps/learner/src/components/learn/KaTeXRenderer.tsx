"use client";

import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface KaTeXRendererProps {
  content: string;
  className?: string;
}

export default function KaTeXRenderer({ content, className = "" }: KaTeXRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderMath = async () => {
      const nodes = containerRef.current?.querySelectorAll(".math");
      nodes?.forEach((node) => {
        const tex = node.getAttribute("data-tex") || "";
        const display = node.classList.contains("math-display");
        try {
          node.innerHTML = katex.renderToString(tex, {
            throwOnError: false,
            displayMode: display,
          });
        } catch {
          node.textContent = tex;
        }
      });
    };

    renderMath();
  }, [content]);

  // Convert \(...\) and \[...\] to spans with .math class
  const processedContent = content
    .replace(
      /\\\[([\s\S]*?)\\\]/g,
      '<span class="math math-display" data-tex="$1"></span>'
    )
    .replace(
      /\\\(([\s\S]*?)\\\)/g,
      '<span class="math math-inline" data-tex="$1"></span>'
    );

  return (
    <div
      ref={containerRef}
      className={`prose prose-zinc max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
