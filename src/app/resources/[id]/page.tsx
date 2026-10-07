import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface ResourceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const { id } = await params;
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
    console.error("[ResourceDetailPage] Auth check failed:", err);
    redirect("/login");
  }

  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    redirect("/login");
  }

  let resource: {
    id: string;
    title: string;
    description: string | null;
    url: string | null;
    type: string;
    tags: string[] | null;
    created_at: string;
  } | null = null;

  try {
    const { data, error } = await supabase
      .from("resources")
      .select("id, title, description, url, type, tags, created_at")
      .eq("id", id)
      .single();
    if (error) throw error;
    resource = data;
  } catch (err) {
    console.error("[ResourceDetailPage] Failed to load resource:", err);
  }

  if (!resource) {
    notFound();
  }

  return (
    <AdminShell user={user}>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to resources
        </Link>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium uppercase text-zinc-400">
              {resource.type}
            </span>
            <span className="text-xs text-zinc-500">
              Added {new Date(resource.created_at).toLocaleDateString()}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold text-white">{resource.title}</h1>

          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
            >
              Open resource
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          {resource.description ? (
            <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {resource.description}
            </div>
          ) : (
            <p className="mt-6 text-sm text-zinc-500">No description provided.</p>
          )}

          {resource.tags && resource.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
