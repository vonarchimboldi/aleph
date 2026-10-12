import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import BulkMarkdownImport from "@/components/admin/BulkMarkdownImport";
import { bulkImportSections } from "@/lib/admin/actions";

export default async function BulkMarkdownPage() {
  const supabase = await createClient();
  let user: User | null = null;
  let profile: { role: string } | null = null;

  try {
    const { data: { user: u } } = await supabase.auth.getUser();
    user = u;
    if (!user) redirect("/login");

    const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    profile = p;
  } catch (err) {
    console.error("[BulkMarkdownPage] Auth check failed:", err);
    redirect("/login");
  }

  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    redirect("/login");
  }

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, number, title, subjects (title, courses (title))")
    .order("number");

  const options = (chapters ?? []).map((ch) => {
    const rel = ch.subjects as { title: string; courses: { title: string } | { title: string }[] | null } | { title: string; courses: { title: string } | { title: string }[] | null }[] | null;
    const subject = Array.isArray(rel) ? rel[0] : rel;
    const courseRel = subject?.courses;
    const course = Array.isArray(courseRel) ? courseRel[0] : courseRel;
    const scope = course?.title ? `${course.title} · ` : "";
    return {
      id: ch.id,
      label: `${scope}${subject?.title ?? ""} — Ch ${ch.number}: ${ch.title}`,
    };
  });

  return (
    <AdminShell user={user}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Bulk Import: Markdown</h1>
          <p className="mt-2 text-zinc-400">
            Paste one markdown document, pick a chapter, and get sections in minutes instead of
            per-section forms.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <BulkMarkdownImport
            chapters={options}
            onImport={async (chapterId, sections, type, minutes) => {
              "use server";
              return bulkImportSections(chapterId, sections, type, minutes);
            }}
          />
        </div>
      </div>
    </AdminShell>
  );
}
