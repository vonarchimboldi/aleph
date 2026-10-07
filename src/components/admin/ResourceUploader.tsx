"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Video, BookOpen, ExternalLink, Calculator, Image } from "lucide-react";
import { uploadResourceAction } from "@/lib/admin/actions";

interface Course {
  id: string;
  title: string;
}

interface Subject {
  id: string;
  title: string;
}

interface ResourceUploaderProps {
  courses: Course[];
  subjects: Subject[];
}

const resourceTypes = [
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "video", label: "Video", icon: Video },
  { value: "image", label: "Image", icon: Image },
  { value: "article", label: "Article", icon: BookOpen },
  { value: "cheatsheet", label: "Cheatsheet", icon: Calculator },
  { value: "link", label: "External link", icon: ExternalLink },
];

const inputClasses =
  "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-white outline-none focus:border-zinc-500";

export default function ResourceUploader({ courses, subjects }: ResourceUploaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const id = await uploadResourceAction(formData);
        router.push(`/resources?id=${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    });
  }

  return (
    <form action={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-zinc-300">
          File <span className="text-red-400">*</span>
        </label>
        <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900 px-6 py-10 hover:border-zinc-500">
          <Upload className="h-8 w-8 text-zinc-400" />
          <p className="mt-2 text-sm text-zinc-300">
            {file ? file.name : "Click to select a file"}
          </p>
          <p className="text-xs text-zinc-500">PDFs and videos up to 50 MB</p>
          <input
            name="file"
            type="file"
            required
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300">
          Title <span className="text-red-400">*</span>
        </label>
        <input name="title" required className={inputClasses} placeholder="Resource title" />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300">Type</label>
        <select name="type" className={inputClasses}>
          {resourceTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300">Description</label>
        <textarea
          name="description"
          rows={3}
          className={inputClasses}
          placeholder="Optional short description"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-300">Link to course</label>
          <select name="course_id" className={inputClasses}>
            <option value="">None</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300">Link to subject</label>
          <select name="subject_id" className={inputClasses}>
            <option value="">None</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300">Order index</label>
        <input
          name="order_index"
          type="number"
          defaultValue={0}
          className={inputClasses}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-white px-4 py-2 font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-40"
      >
        {isPending ? "Uploading..." : "Upload resource"}
      </button>
    </form>
  );
}
