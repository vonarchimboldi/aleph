import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import KaTeXRenderer from "@/components/learn/KaTeXRenderer";
import { getSectionById, getTasksBySection, getQuizBySection, getQuizQuestions } from "@/lib/admin/data";

interface Props {
  params: Promise<{ id: string }>;
}

async function getMdxContent(contentPath: string | null): Promise<string> {
  if (!contentPath) return "";
  try {
    const fullPath = join(process.cwd(), "content-demo", contentPath);
    const file = await readFile(fullPath, "utf-8");
    // Remove frontmatter
    return file.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
  } catch {
    return "";
  }
}

export default async function PreviewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const section = await getSectionById(id);
  if (!section) notFound();

  const [tasks, quiz, questions] = await Promise.all([
    getTasksBySection(id),
    getQuizBySection(id),
    getQuizBySection(id).then((q) => (q ? getQuizQuestions(q.id) : [])),
  ]);

  const mdxContent = await getMdxContent(section.content_path);

  return (
    <AdminShell user={user}>
      <div className="mx-auto max-w-4xl space-y-8 pb-16">
        <div className="border-b border-zinc-800 pb-6">
          <p className="text-sm font-medium text-emerald-400">Learner Preview</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{section.title}</h1>
          <p className="mt-2 text-zinc-400">
            {section.type} · {section.estimated_minutes} min · {section.is_locked ? "Locked" : "Unlocked"}
          </p>
        </div>

        {/* Reading content */}
        {mdxContent && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Reading</h2>
            <KaTeXRenderer content={mdxContent} />
          </div>
        )}

        {/* Reading questions */}
        {section.reading_questions && section.reading_questions.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Reading Questions</h2>
            <div className="space-y-4">
              {section.reading_questions.map((q, idx) => (
                <div key={idx} className="rounded-xl bg-zinc-950 p-4">
                  <p className="font-medium text-white">{idx + 1}. {q.question}</p>
                  <p className="mt-2 text-sm text-zinc-500">Hint: {q.hint}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problems */}
        {tasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Problems</h2>
            {tasks.map((task, idx) => (
              <div key={task.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Problem {idx + 1}</span>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{task.label}</span>
                </div>
                <div className="mt-4">
                  <KaTeXRenderer content={task.statement} />
                </div>
                <div className="mt-6 rounded-xl bg-zinc-950 p-4">
                  <p className="text-sm font-medium text-emerald-400">Answer</p>
                  <KaTeXRenderer content={task.answer} />
                </div>
                <div className="mt-4 rounded-xl bg-zinc-950 p-4">
                  <p className="text-sm font-medium text-zinc-400">Solution</p>
                  <KaTeXRenderer content={task.solution} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quiz */}
        {quiz && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Quiz</h2>
              <span className="text-sm text-zinc-500">
                Passing: {quiz.passing_score}% · Time: {quiz.time_limit_minutes || "unlimited"} min
              </span>
            </div>
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={q.id} className="rounded-xl bg-zinc-950 p-4">
                  <p className="font-medium text-white">{idx + 1}. {q.prompt}</p>
                  {q.options && q.options.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {q.options.map((opt) => (
                        <div key={opt.id} className="flex items-center gap-2 text-zinc-300">
                          <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs">{opt.id}</span>
                          <KaTeXRenderer content={opt.text} />
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-sm text-emerald-400">Correct: {q.correct_answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
