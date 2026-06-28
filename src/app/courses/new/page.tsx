import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { createCourse } from "@/lib/admin/actions";
import FormField from "@/components/forms/FormField";
import FormSelect from "@/components/forms/FormSelect";

export default async function NewCoursePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: exams } = await supabase.from("exams").select("id, title").order("title");

  async function handleSubmit(formData: FormData) {
    "use server";
    const id = await createCourse(formData);
    redirect(`/courses/${id}`);
  }

  return (
    <AdminShell user={user}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Create Course</h1>
          <p className="mt-2 text-zinc-400">Add a new course under an exam.</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <FormSelect
            label="Exam"
            name="exam_id"
            required
            options={exams?.map((e: any) => ({ value: e.id, label: e.title })) || []}
          />
          <FormField label="Title" name="title" required />
          <FormField label="Tagline" name="tagline" />
          <FormField label="Description" name="description" rows={3} />
          <FormField label="Difficulty" name="difficulty" placeholder="e.g. Beginner to Intermediate" />
          <FormField label="Duration" name="duration" placeholder="e.g. 40 hours" />
          <FormField label="Estimated Hours" name="estimated_hours" type="number" defaultValue={0} />

          <button
            type="submit"
            className="w-full rounded-xl bg-white px-4 py-2 font-medium text-zinc-950 hover:bg-zinc-200"
          >
            Create Course
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
