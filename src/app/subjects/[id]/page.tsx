import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { createChapter } from "@/lib/admin/actions";
import { getSubjectById, getChaptersBySubject } from "@/lib/admin/data";
import FormField from "@/components/forms/FormField";
import { Plus, Layers } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SubjectDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const subject = await getSubjectById(id);
  if (!subject) notFound();

  const chapters = await getChaptersBySubject(id);

  return (
    <AdminShell user={user}>
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/courses" className="hover:text-zinc-300">Courses</Link>
            <span>/</span>
            <span className="text-zinc-400">{subject.title}</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">{subject.title}</h1>
          <p className="mt-2 text-zinc-400">{subject.description}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-white">Chapters</h2>

            {chapters.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center text-zinc-500">
                No chapters yet.
              </div>
            ) : (
              <div className="space-y-3">
                {chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/chapters/${chapter.id}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-700 hover:bg-zinc-800"
                  >
                    <div>
                      <h3 className="font-medium text-white">
                        Ch {chapter.number}: {chapter.title}
                      </h3>
                      <p className="text-sm text-zinc-500">{chapter.estimated_minutes} min</p>
                    </div>
                    <Layers className="h-5 w-5 text-zinc-600" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-white">Add Chapter</h2>
            <form action={createChapter} className="mt-4 space-y-4">
              <input type="hidden" name="subject_id" value={subject.id} />
              <FormField label="Title" name="title" required />
              <FormField label="Chapter Number" name="number" type="number" defaultValue={chapters.length + 1} required />
              <FormField label="Description" name="description" rows={3} />
              <FormField label="Estimated Minutes" name="estimated_minutes" type="number" defaultValue={0} />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 font-medium text-zinc-950 hover:bg-zinc-200"
              >
                <Plus className="h-4 w-4" />
                Add Chapter
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
