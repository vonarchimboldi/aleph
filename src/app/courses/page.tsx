import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { Plus, BookOpen } from "lucide-react";

export default async function CoursesListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: courses } = await supabase
    .from("courses")
    .select("*, exams(title)")
    .order("title");

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Courses</h1>
            <p className="mt-2 text-zinc-400">Manage courses, subjects, chapters, and sections.</p>
          </div>
          <Link
            href="/courses/new"
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-medium text-zinc-950 hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            New Course
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses?.map((course: any) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-700 hover:bg-zinc-800"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 group-hover:bg-zinc-700">
                <BookOpen className="h-5 w-5 text-zinc-300" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white">{course.title}</h2>
              <p className="mt-1 text-sm text-zinc-500">{course.exams?.title}</p>
              {course.tagline && (
                <p className="mt-2 text-sm text-zinc-400">{course.tagline}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
