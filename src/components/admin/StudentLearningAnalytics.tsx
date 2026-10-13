import { createClient } from "@/lib/supabase/server";
import { AlertTriangle, Activity, FileQuestion, TrendingDown } from "lucide-react";

/**
 * Instructor view of one student's learning data (port of the colleague's
 * intervention queue). Reads concept_mastery / quiz_attempts / section_views
 * under the "Instructors read *" RLS policies — users themselves can only
 * read their own rows.
 */
export default async function StudentLearningAnalytics({ studentId }: { studentId: string }) {
  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [masteryResult, attemptsResult, viewsResult] = await Promise.all([
    supabase
      .from("concept_mastery")
      .select("concept_name, questions_attempted, questions_correct, is_weak")
      .eq("user_id", studentId)
      .gt("questions_attempted", 0)
      .order("questions_correct", { ascending: true })
      .limit(8),
    supabase
      .from("quiz_attempts")
      .select("score, max_score, passed, created_at")
      .eq("user_id", studentId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("section_views")
      .select("id", { count: "exact", head: true })
      .eq("user_id", studentId)
      .gte("created_at", weekAgo),
  ]);

  const mastery = masteryResult.data ?? [];
  const attempts = attemptsResult.data ?? [];
  const viewsThisWeek = viewsResult.count ?? 0;

  if (mastery.length === 0 && attempts.length === 0 && viewsThisWeek === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">Learning activity</h2>
        <p className="mt-2 text-sm text-zinc-500">
          No quiz attempts or study activity yet — the student hasn&apos;t started.
        </p>
      </div>
    );
  }

  const weak = mastery
    .map((m) => ({ ...m, pct: m.questions_attempted > 0 ? m.questions_correct / m.questions_attempted : 0 }))
    .sort((a, b) => a.pct - b.pct || b.questions_attempted - a.questions_attempted)
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Learning activity</h2>
        <span className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Activity className="h-3.5 w-3.5" />
          {viewsThisWeek} sections visited this week
        </span>
      </div>

      {weak.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-400">
            <TrendingDown className="h-3.5 w-3.5" />
            Intervention queue — weakest concepts
          </p>
          <ul className="space-y-1.5">
            {weak.map((m) => (
              <li key={m.concept_name} className="flex items-center gap-2 text-sm">
                <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${m.is_weak ? "text-red-400" : "text-zinc-600"}`} />
                <span className="truncate text-zinc-300">{m.concept_name}</span>
                <span className="ml-auto shrink-0 text-xs tabular-nums text-zinc-500">
                  {m.questions_correct}/{m.questions_attempted} ({Math.round(m.pct * 100)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {attempts.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <FileQuestion className="h-3.5 w-3.5" />
            Recent quiz attempts
          </p>
          <ul className="space-y-1.5">
            {attempts.map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${a.passed ? "bg-green-500" : "bg-red-500"}`}
                  title={a.passed ? "Passed" : "Failed"}
                />
                <span className="text-zinc-400">
                  {a.score}/{a.max_score}
                </span>
                <span className="ml-auto text-xs text-zinc-600">
                  {new Date(a.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
