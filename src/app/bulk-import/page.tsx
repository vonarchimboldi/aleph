import Link from "next/link";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { Database } from "lucide-react";

export default async function BulkImportAdminPage() {
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
    console.error("[BulkImportAdminPage] Auth check failed:", err);
    redirect("/login");
  }

  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    redirect("/login");
  }

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Bulk Import</h1>
          <p className="mt-2 text-zinc-400">Import content from legacy aleph files.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/bulk-import/dsa-practice"
            className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-700 hover:bg-zinc-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 group-hover:bg-zinc-700">
              <Database className="h-5 w-5 text-zinc-300" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white">DSA Month 1 Practice</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Import the non-Platinum DSA markdowns into the existing DSA subject.
            </p>
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
