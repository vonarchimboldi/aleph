import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { calculatePredictedMarks } from "@/lib/admin/predicted-marks";
import { Target, TrendingUp, Activity } from "lucide-react";

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // For demo, calculate for the current admin user
  const result = await calculatePredictedMarks(user.id);

  return (
    <AdminShell user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Score Predictor Preview</h1>
          <p className="mt-2 text-zinc-400">
            This is how the learner dashboard will show predicted scores based on concept mastery.
          </p>
        </div>

        {result ? (
          <>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
                  <Target className="h-6 w-6 text-zinc-300" />
                </div>
                <p className="mt-4 text-sm text-zinc-400">Predicted Total Score</p>
                <p className="text-3xl font-bold text-white">{result.predictedScore}/100</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
                  <TrendingUp className="h-6 w-6 text-zinc-300" />
                </div>
                <p className="mt-4 text-sm text-zinc-400">Confidence</p>
                <p className="text-3xl font-bold text-white">{result.confidence}%</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
                  <Activity className="h-6 w-6 text-zinc-300" />
                </div>
                <p className="mt-4 text-sm text-zinc-400">Subjects Tracked</p>
                <p className="text-3xl font-bold text-white">{result.breakdown.length}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-lg font-semibold text-white">Strength by Subject</h2>
              <div className="mt-6 space-y-6">
                {result.breakdown.map((item) => (
                  <div key={item.subjectId}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-white">{item.subjectTitle}</span>
                      <span className="text-zinc-400">
                        Weight {item.weightInExamPercent}% · Strength {item.strength}/100
                      </span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${item.strength}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      Contribution: {item.contribution.toFixed(1)} pts · {item.questionsAttempted} questions attempted
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <p className="text-zinc-500">No subjects configured yet.</p>
            <p className="mt-2 text-sm text-zinc-600">
              Add subjects with weights to see the score predictor in action.
            </p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
