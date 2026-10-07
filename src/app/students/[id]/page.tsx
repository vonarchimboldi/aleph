import { redirect, notFound } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import EnrollmentManager from "@/components/admin/EnrollmentManager";

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
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
    console.error("[StudentDetailPage] Auth check failed:", err);
    redirect("/login");
  }

  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    redirect("/login");
  }

  let student: { id: string; email: string; full_name: string | null; account_type: string } | null = null;
  let enrollments: { id: string; status: string; progress_percentage: number; subject: { id: string; title: string } | null }[] = [];
  let subjects: { id: string; title: string }[] = [];

  try {
    const { data: s } = await supabase
      .from("profiles")
      .select("id, email, full_name, account_type")
      .eq("id", id)
      .single();
    student = s;
  } catch (err) {
    console.error("[StudentDetailPage] Failed to load student:", err);
  }

  if (!student) {
    notFound();
  }

  try {
    const [enrollmentsResult, subjectsResult] = await Promise.all([
      supabase
        .from("enrollments")
        .select("id, status, progress_percentage, subject:subject_id (id, title)")
        .eq("user_id", id),
      supabase.from("subjects").select("id, title").order("title"),
    ]);

    const enrolledSubjectIds = new Set<string>();
    enrollments = (enrollmentsResult.data ?? []).map((e: any) => {
      const subject = Array.isArray(e.subject) ? e.subject[0] : e.subject;
      if (subject?.id) enrolledSubjectIds.add(subject.id);
      return { ...e, subject };
    });

    subjects = (subjectsResult.data ?? []).filter((s) => !enrolledSubjectIds.has(s.id));
  } catch (err) {
    console.error("[StudentDetailPage] Failed to load enrollments/subjects:", err);
  }

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {student.full_name || "Unnamed student"}
          </h1>
          <p className="mt-2 text-zinc-400">{student.email}</p>
        </div>

        <EnrollmentManager
          studentId={student.id}
          currentAccountType={student.account_type}
          enrollments={enrollments}
          availableSubjects={subjects}
        />
      </div>
    </AdminShell>
  );
}
