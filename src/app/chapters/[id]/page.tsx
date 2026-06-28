import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { createSection } from "@/lib/admin/actions";
import { getChapterById, getSectionsByChapter } from "@/lib/admin/data";
import FormField from "@/components/forms/FormField";
import FormSelect from "@/components/forms/FormSelect";
import { Plus, FileText } from "lucide-react";

const sectionTypes = [
  { value: "read", label: "Read" },
  { value: "concept", label: "Concept" },
  { value: "mechanic", label: "Mechanic" },
  { value: "integration", label: "Integration" },
  { value: "challenge", label: "Challenge" },
  { value: "quiz", label: "Quiz" },
  { value: "review", label: "Review" },
  { value: "summary", label: "Summary" },
];

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChapterDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const chapter = await getChapterById(id);
  if (!chapter) notFound();

  const sections = await getSectionsByChapter(id);

  return (
    <AdminShell user={user}>
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/courses" className="hover:text-zinc-300">Courses</Link>
            <span>/</span>
            <span className="text-zinc-400">Ch {chapter.number}</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">{chapter.title}</h1>
          <p className="mt-2 text-zinc-400">{chapter.description}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-white">Sections</h2>

            {sections.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center text-zinc-500">
                No sections yet.
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((section) => (
                  <Link
                    key={section.id}
                    href={`/sections/${section.id}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-700 hover:bg-zinc-800"
                  >
                    <div>
                      <h3 className="font-medium text-white">{section.title}</h3>
                      <p className="text-sm text-zinc-500">
                        {section.type} · {section.estimated_minutes} min · {section.is_locked ? "Locked" : "Unlocked"}
                      </p>
                    </div>
                    <FileText className="h-5 w-5 text-zinc-600" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-white">Add Section</h2>
            <form action={createSection} className="mt-4 space-y-4">
              <input type="hidden" name="chapter_id" value={chapter.id} />
              <FormField label="Title" name="title" required />
              <FormSelect label="Type" name="type" required options={sectionTypes} />
              <FormField label="Order" name="order_index" type="number" defaultValue={sections.length} />
              <FormField label="Estimated Minutes" name="estimated_minutes" type="number" defaultValue={0} />
              <FormField label="Content Path (MDX)" name="content_path" placeholder="e.g. courses/probability/ch1/core-ideas.mdx" />
              <FormField label="Intro Content" name="content" rows={4} />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_locked" name="is_locked" className="h-4 w-4 rounded border-zinc-700 bg-zinc-950" />
                <label htmlFor="is_locked" className="text-sm text-zinc-300">Locked by default</label>
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 font-medium text-zinc-950 hover:bg-zinc-200"
              >
                <Plus className="h-4 w-4" />
                Add Section
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
