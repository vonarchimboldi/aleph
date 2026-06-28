import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { createSubject } from "@/lib/admin/actions";
import { getCourseById, getSubjectsByCourse } from "@/lib/admin/data";
import FormField from "@/components/forms/FormField";
import { Plus, BookOpen } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const course = await getCourseById(id);
  if (!course) notFound();

  const subjects = await getSubjectsByCourse(id);

  return (
    <AdminShell user={user}>
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/courses" className="hover:text-zinc-300">Courses</Link>
            <span>/</span>
            <span>{course.title}</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">{course.title}</h1>
          <p className="mt-2 text-zinc-400">{course.tagline}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Subjects</h2>
            </div>

            {subjects.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center text-zinc-500">
                No subjects yet.
              </div>
            ) : (
              <div className="space-y-3">
                {subjects.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/subjects/${subject.id}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-700 hover:bg-zinc-800"
                  >
                    <div>
                      <h3 className="font-medium text-white">{subject.title}</h3>
                      <p className="text-sm text-zinc-500">Weight: {subject.weight_in_exam_percent}%</p>
                    </div>
                    <BookOpen className="h-5 w-5 text-zinc-600" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-white">Add Subject</h2>
            <form action={createSubject} className="mt-4 space-y-4">
              <input type="hidden" name="course_id" value={course.id} />
              <FormField label="Title" name="title" required />
              <FormField label="Description" name="description" rows={3} />
              <FormField label="Order" name="order_index" type="number" defaultValue={subjects.length} />
              <FormField label="Outcomes (comma separated)" name="outcomes" />
              <FormField label="Prerequisites (comma separated)" name="prerequisites" />
              <FormField label="Weight in Exam %" name="weight_in_exam_percent" type="number" defaultValue={0} />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 font-medium text-zinc-950 hover:bg-zinc-200"
              >
                <Plus className="h-4 w-4" />
                Add Subject
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
