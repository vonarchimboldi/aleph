import Link from "next/link";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { ArrowRight } from "lucide-react";

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
  }[] | null = null;

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
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-950 text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-zinc-800/50">
                      <td className="px-4 py-3 font-medium text-white">
                        {student.full_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{student.email}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-300">
                          {student.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{student.account_type}</td>
                      <td className="px-4 py-3 text-zinc-500">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/students/${student.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-300 hover:text-white"
                        >
                          Manage <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
