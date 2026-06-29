import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { enrollStudent, unenrollStudent } from "@/lib/admin/actions";
import FormSelect from "@/components/forms/FormSelect";
import { BookOpen, X } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: student } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!student) notFound();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, subjects (*, courses (title, exams (title)))")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*, courses (title, exams (title))")
    .eq("is_active", true)
    .order("title");

  const enrolledSubjectIds = new Set(enrollments?.map((e) => e.subject_id) || []);
  const availableSubjects = subjects?.filter((s) => !enrolledSubjectIds.has(s.id)) || [];

  return (
    <AdminShell user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {student.full_name || student.email || "Student"}
          </h1>
          <p className="mt-2 text-zinc-400">{student.email}</p>
          <p className="mt-1 text-sm text-zinc-500 capitalize">Role: {student.role}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Enrollments */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Current Enrollments</h2>
            {enrollments && enrollments.length > 0 ? (
              <div className="space-y-3">
                {enrollments.map((enrollment: any) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4"
                  >
                    <div>
                      <h3 className="font-medium text-white">{enrollment.subjects?.title}</h3>
                      <p className="text-sm text-zinc-500">
                        {enrollment.subjects?.courses?.exams?.title} · {enrollment.subjects?.courses?.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        Progress: {enrollment.progress_percentage}% · Status: {enrollment.status}
                      </p>
                    </div>
                    <form action={unenrollStudent}>
                      <input type="hidden" name="enrollment_id" value={enrollment.id} />
                      <input type="hidden" name="user_id" value={id} />
                      <button
                        type="submit"
                        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
                Not enrolled in any subject yet.
              </div>
            )}
          </div>

          {/* Enroll form */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-white">Enroll in Subject</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Select a subject this student should have access to.
            </p>

            {availableSubjects.length > 0 ? (
              <form action={enrollStudent} className="mt-4 space-y-4">
                <input type="hidden" name="user_id" value={id} />
                <FormSelect
                  label="Subject"
                  name="subject_id"
                  required
                  options={availableSubjects.map((s: any) => ({
                    value: s.id,
                    label: `${s.title} (${s.courses?.exams?.title} · ${s.courses?.title})`,
                  }))}
                />
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 font-medium text-zinc-950 hover:bg-zinc-200"
                >
                  <BookOpen className="h-4 w-4" />
                  Enroll Student
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">
                No available subjects. Either all subjects are already assigned or no active subjects exist.
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
