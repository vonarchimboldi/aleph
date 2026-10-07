import { redirect } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { BookOpen, FileText, Database, Upload, Users } from "lucide-react";

export default async function AdminDashboardPage() {
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
    console.error("[AdminDashboardPage] Auth check failed:", err);
    redirect("/login");
  }

  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    redirect("/login");
  }

  const navCards = [
    {
      title: "Courses",
      description: "Manage exams, courses, subjects, chapters, and sections.",
      href: "/courses",
      icon: BookOpen,
    },
    {
      title: "Students",
      description: "Manage student enrollments and account types.",
      href: "/students",
      icon: Users,
    },
    {
      title: "Resources",
      description: "Upload PDFs, videos, and reference material.",
      href: "/resources",
      icon: Upload,
    },
    {
      title: "Material Sets",
      description: "Create standalone problem sets and quizzes.",
      href: "/material-sets",
      icon: FileText,
    },
    {
      title: "Bulk Import",
      description: "Import legacy content like DSA practice modules.",
      href: "/bulk-import",
      icon: Database,
    },
  ];

  return (
    <AdminShell user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Aleph Studio</h1>
          <p className="mt-2 text-zinc-400">
            Content administration for the Aleph learning platform.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {navCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-700 hover:bg-zinc-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 group-hover:bg-zinc-700">
                <card.icon className="h-6 w-6 text-zinc-300" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white">{card.title}</h2>
              <p className="mt-2 text-sm text-zinc-400">{card.description}</p>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">Quick tips</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-zinc-400">
            <li>
              Use <strong>Quick Course Builder</strong> to create a whole course, subject, and
              chapters in one flow.
            </li>
            <li>
              Write section content in markdown. Use{" "}
              <code className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-200">\( ... \)</code> for
              inline math and{" "}
              <code className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-200">\[ ... \]</code> for
              display math.
            </li>
            <li>
              Concept graphs and insights live in the learner dashboard and are greyed out until
              Platinum launches.
            </li>
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
