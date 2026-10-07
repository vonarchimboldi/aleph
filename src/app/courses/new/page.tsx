import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import CourseWizard from "@/components/admin/CourseWizard";

export default async function NewCoursePage() {
  const supabase = await createClient();
  let user: User | null = null;
  let profile: { role: string } | null = null;
  let exams: { id: string; title: string }[] | null = null;

  try {
    const { data: { user: u } } = await supabase.auth.getUser();
    user = u;
    if (!user) {
      redirect("/login");
    }

    const { data: p } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    profile = p;
  } catch (err) {
    console.error("[NewCoursePage] Auth check failed:", err);
    redirect("/login");
  }

  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    redirect("/login");
  }

  try {
    const { data } = await supabase.from("exams").select("id, title").order("title");
    exams = data ?? [];
  } catch (err) {
    console.error("[NewCoursePage] Failed to load exams:", err);
    exams = [];
  }

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Quick Course Builder</h1>
          <p className="mt-2 text-zinc-400">
            Create an exam, course, subject, chapters, and sections in one flow.
          </p>
        </div>

        <CourseWizard exams={exams} />
      </div>
    </AdminShell>
  );
}
