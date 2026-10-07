import Link from "next/link";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { Users, ArrowRight } from "lucide-react";

export default async function StudentsListPage() {
  const supabase = await createClient();
  let user: User | null = null;
  let profile: { role: string } | null = null;
  let students: { id: string; email: string; full_name: string | null; role: string }[] | null = null;

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
      .select("id, email, full_name, role")
      .order("created_at", { ascending: false });

    if (error) throw error;
    students = data ?? [];
  } catch (err) {
    console.error("[StudentsListPage] Failed to load students:", err);
    students = [];
  }

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Students</h1>
          <p className="mt-2 text-zinc-400">Manage student enrollments and access.</p>
        </div>

        {students && students.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <Link
                key={student.id}
                href={`/students/${student.id}`}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-700 hover:bg-zinc-800"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 group-hover:bg-zinc-700">
                  <Users className="h-6 w-6 text-zinc-300" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">
                  {student.full_name || student.email || "Unnamed student"}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">{student.email}</p>
                <p className="mt-2 text-sm text-zinc-400 capitalize">Role: {student.role}</p>
                <div className="mt-4 flex items-center text-sm text-zinc-500 group-hover:text-zinc-300">
                  Manage enrollment <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center text-zinc-500">
            No students found. Students appear here after they sign up.
          </div>
        )}
      </div>
    </AdminShell>
  );
}
