import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import DsaImportForm from "@/components/admin/DsaImportForm";

export default async function DsaBulkImportPage() {
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
    console.error("[DsaBulkImportPage] Auth check failed:", err);
    redirect("/login");
  }

  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    redirect("/login");
  }

  return (
    <AdminShell user={user}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Import DSA Practice (Month 1)</h1>
          <p className="mt-2 text-zinc-400">
            Bulk-import the non-Platinum DSA practice markdowns into the existing DSA subject.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">What will be created</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-zinc-400">
            <li>Chapter 14 — Month 1 Overview</li>
            <li>Chapter 15 — Week 1: Search & Sort</li>
            <li>Chapter 16 — Week 2: Problem Ladder</li>
            <li>Chapter 17 — Week 4: Insight Ladder</li>
          </ul>
          <p className="mt-4 text-xs text-zinc-500">
            Sorting-pattern files (Platinum) are excluded. Running this again deletes the
            previously imported month-1 chapters and recreates them.
          </p>
        </div>

        <DsaImportForm />
      </div>
    </AdminShell>
  );
}
