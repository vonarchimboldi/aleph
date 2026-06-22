import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";

export default async function ConceptGraphsAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <AdminShell user={user}>
      <div>
        <h1 className="text-3xl font-bold text-white">Concept Graphs</h1>
        <p className="mt-2 text-zinc-400">
          Edit concept nodes, prerequisites, and repair material.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <p className="text-zinc-500">Concept graph editor coming soon.</p>
        </div>
      </div>
    </AdminShell>
  );
}
