import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import StudentsTable from "@/components/admin/StudentsTable";

export default async function StudentsListPage() {
  const supabase = await createClient();
  let user: User | null = null;
  let profile: { role: string } | null = null;
  let students: {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    account_type: string;
    created_at: string;
  }[] = [];

  try {
    const { data: { user: u } } = await supabase.auth.getUser();
    user = u;
    if (!user) redirect("/login");

    const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    profile = p;
  } catch (err) {
    console.error("[StudentsListPage] Auth check failed:", err);
    redirect("/login");
  }

  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    redirect("/login");
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, account_type, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    students = data ?? [];
  } catch (err) {
    console.error("[StudentsListPage] Failed to load students:", err);
  }

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Students</h1>
          <p className="mt-2 text-zinc-400">Manage student enrollments and access.</p>
        </div>

        <StudentsTable students={students} />
      </div>
    </AdminShell>
  );
}
