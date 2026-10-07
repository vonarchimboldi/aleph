import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import ResourceUploader from "@/components/admin/ResourceUploader";

export default async function NewResourcePage() {
  const supabase = await createClient();
  let user: User | null = null;
  let profile: { role: string } | null = null;
  let courses: { id: string; title: string }[] = [];
  let subjects: { id: string; title: string }[] = [];

  try {
    const { data: { user: u } } = await supabase.auth.getUser();
    user = u;
    if (!user) redirect("/login");

    const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    profile = p;
  } catch (err) {
    console.error("[NewResourcePage] Auth check failed:", err);
    redirect("/login");
  }

  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    redirect("/login");
  }

  try {
    const [coursesResult, subjectsResult] = await Promise.all([
      supabase.from("courses").select("id, title").order("title"),
      supabase.from("subjects").select("id, title").order("title"),
    ]);
    courses = coursesResult.data ?? [];
    subjects = subjectsResult.data ?? [];
  } catch (err) {
    console.error("[NewResourcePage] Failed to load courses/subjects:", err);
  }

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Upload Resource</h1>
          <p className="mt-2 text-zinc-400">Add a PDF, video, or reference link to Storage.</p>
        </div>

        <ResourceUploader courses={courses} subjects={subjects} />
      </div>
    </AdminShell>
  );
}
