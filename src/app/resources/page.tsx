import Link from "next/link";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { Plus, FileText, BookOpen, Video, ExternalLink, Calculator } from "lucide-react";

const iconByType: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  article: BookOpen,
  cheatsheet: Calculator,
  video: Video,
  link: ExternalLink,
};

export default async function ResourcesListPage() {
  const supabase = await createClient();
  let user: User | null = null;
  let profile: { role: string } | null = null;
  let resources: { id: string; title: string; type: string; url: string | null }[] | null = null;

  try {
    const { data: { user: u } } = await supabase.auth.getUser();
    user = u;
    if (!user) redirect("/login");

    const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    profile = p;
  } catch (err) {
    console.error("[ResourcesListPage] Auth check failed:", err);
    redirect("/login");
  }

  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    redirect("/login");
  }

  try {
    const { data } = await supabase
      .from("resources")
      .select("id, title, type, url")
      .order("order_index", { ascending: true })
      .order("title");
    resources = data ?? [];
  } catch (err) {
    console.error("[ResourcesListPage] Failed to load resources:", err);
    resources = [];
  }

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Resources</h1>
            <p className="mt-2 text-zinc-400">Upload PDFs, videos, and reference material.</p>
          </div>
          <Link
            href="/resources/new"
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-medium text-zinc-950 hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Upload
          </Link>
        </div>

        {resources && resources.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => {
              const Icon = iconByType[r.type] ?? BookOpen;
              return (
                <a
                  key={r.id}
                  href={r.url || "#"}
                  target={r.url ? "_blank" : undefined}
                  rel={r.url ? "noopener noreferrer" : undefined}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-700 hover:bg-zinc-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 group-hover:bg-zinc-700">
                    <Icon className="h-5 w-5 text-zinc-300" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-white">{r.title}</h2>
                  <p className="mt-1 text-sm text-zinc-500 capitalize">{r.type}</p>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center text-zinc-500">
            No resources yet. Upload a PDF or video to get started.
          </div>
        )}
      </div>
    </AdminShell>
  );
}
