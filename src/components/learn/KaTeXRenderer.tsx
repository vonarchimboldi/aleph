"use client";

import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface KaTeXRendererProps {
  content: string;
  className?: string;
}

export default function KaTeXRenderer({ content, className = "" }: KaTeXRendererProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    let html = content
      .replace(/\\\[([\s\S]*?)\\\]/g, (_, tex) => {
        try {
          return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
        } catch {
          return `<div class="text-red-400">${tex}</div>`;
        }
      })
      .replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) => {
        try {
          return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
        } catch {
          return `<span class="text-red-400">${tex}</span>`;
        }
      });

    // Convert markdown bold/italic/lists/headings simply
    html = html
      .replace(/^### (.*$)/gim, "<h3 class=\"text-lg font-semibold mt-6 mb-2\">$1</h3>")
      .replace(/^## (.*$)/gim, "<h2 class=\"text-xl font-bold mt-8 mb-3\">$1</h2>")
      .replace(/^> (.*$)/gim, "<blockquote class=\"border-l-4 border-zinc-600 pl-4 italic text-zinc-400 my-4\">$1</blockquote>")
      .replace(/\*\*(.*?)\*\*/g, "<strong class=\"text-white\">$1</strong>")
      .replace(/\*(.*?)\*/g, "<em class=\"text-zinc-300\">$1</em>")
      .replace(/^- (.*$)/gim, "<li class=\"ml-5 list-disc\">$1</li>")
      .replace(/\n/g, "<br />");

    ref.current.innerHTML = html;
  }, [content]);

  return <div ref={ref} className={`prose prose-invert max-w-none ${className}`} />;
}
