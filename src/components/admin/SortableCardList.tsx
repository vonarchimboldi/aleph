"use client";

import { useState } from "react";
import Link from "next/link";
import { GripVertical, ChevronUp, ChevronDown, Check, Loader2, FileText } from "lucide-react";

export interface SortableItem {
  id: string;
  title: string;
  meta: string;
  href: string;
}

interface SortableCardListProps {
  items: SortableItem[];
  onReorder: (orderedIds: string[]) => Promise<void>;
  label: string;
}

function move(ids: string[], from: number, to: number): string[] {
  const next = [...ids];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}

/**
 * Drag-to-reorder card list (HTML5 DnD) with up/down buttons as the
 * keyboard/fine-grained alternative. Optimistically reorders locally, then
 * persists via onReorder; a failed save snaps back to the server order.
 */
export default function SortableCardList({ items, onReorder, label }: SortableCardListProps) {
  const [orderedIds, setOrderedIds] = useState<string[]>(() => items.map((i) => i.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  // Server order changed under us (item added/removed) — resync unless dirty.
  if (items.length !== orderedIds.length || !items.every((i) => orderedIds.includes(i.id))) {
    setOrderedIds(items.map((i) => i.id));
  }

  const byId = new Map(items.map((i) => [i.id, i]));
  const ordered = orderedIds
    .map((id) => byId.get(id))
    .filter((i): i is SortableItem => Boolean(i));

  async function commit(nextIds: string[]) {
    const previous = orderedIds;
    setOrderedIds(nextIds);
    setSaving(true);
    setSaved(false);
    setError(false);
    try {
      await onReorder(nextIds);
      setSaved(true);
    } catch (err) {
      console.error("[SortableCardList] reorder failed:", err);
      setOrderedIds(previous);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setOverId(null);
      return;
    }
    const from = orderedIds.indexOf(draggingId);
    const to = orderedIds.indexOf(targetId);
    setDraggingId(null);
    setOverId(null);
    if (from < 0 || to < 0) return;
    void commit(move(orderedIds, from, to));
  }

  function handleMove(id: string, delta: -1 | 1) {
    const from = orderedIds.indexOf(id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= orderedIds.length) return;
    void commit(move(orderedIds, from, to));
  }

  return (
    <div>
      <ul className="space-y-3" aria-label={label}>
        {ordered.map((item, index) => (
          <li
            key={item.id}
            draggable
            onDragStart={(e) => {
              setDraggingId(item.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setOverId(item.id);
            }}
            onDragLeave={() => setOverId((cur) => (cur === item.id ? null : cur))}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(item.id);
            }}
            onDragEnd={() => {
              setDraggingId(null);
              setOverId(null);
            }}
            className={`flex items-center gap-2 rounded-xl border bg-zinc-900 p-2 pl-3 transition ${
              draggingId === item.id
                ? "border-zinc-500 opacity-50"
                : overId === item.id && draggingId
                  ? "border-zinc-400"
                  : "border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-zinc-600 active:cursor-grabbing" aria-hidden />
            <Link
              href={item.href}
              className="flex min-w-0 flex-1 items-center justify-between gap-4 py-2"
            >
              <div className="min-w-0">
                <h3 className="truncate font-medium text-white">{item.title}</h3>
                <p className="truncate text-sm text-zinc-500">{item.meta}</p>
              </div>
              <FileText className="h-5 w-5 shrink-0 text-zinc-600" />
            </Link>
            <div className="flex shrink-0 items-center">
              <button
                type="button"
                aria-label={`Move ${item.title} up`}
                disabled={index === 0 || saving}
                onClick={() => handleMove(item.id, -1)}
                className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={`Move ${item.title} down`}
                disabled={index === ordered.length - 1 || saving}
                onClick={() => handleMove(item.id, 1)}
                className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div aria-live="polite" className="mt-2 h-4 text-xs">
        {saving && (
          <span className="flex items-center gap-1 text-zinc-500">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving order…
          </span>
        )}
        {!saving && saved && (
          <span className="flex items-center gap-1 text-green-400">
            <Check className="h-3 w-3" /> Order saved
          </span>
        )}
        {!saving && error && <span className="text-red-400">Save failed — reverted to last saved order</span>}
      </div>
    </div>
  );
}
