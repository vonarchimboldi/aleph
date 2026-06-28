import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { createTask, createQuizQuestion } from "@/lib/admin/actions";
import { getSectionById, getTasksBySection, getQuizBySection, getQuizQuestions } from "@/lib/admin/data";
import FormField from "@/components/forms/FormField";
import FormSelect from "@/components/forms/FormSelect";
import { Plus, CheckCircle, HelpCircle } from "lucide-react";

const taskLabels = [
  { value: "concept", label: "Concept" },
  { value: "mechanic", label: "Mechanic" },
  { value: "integration", label: "Integration" },
  { value: "challenge", label: "Challenge" },
  { value: "isi", label: "ISI" },
];

const questionFormats = [
  { value: "mcq", label: "MCQ" },
  { value: "msq", label: "MSQ" },
  { value: "nat", label: "NAT" },
];

const gateWeights = [
  { value: "", label: "None" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SectionDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const section = await getSectionById(id);
  if (!section) notFound();

  const tasks = await getTasksBySection(id);
  const quiz = await getQuizBySection(id);
  const questions = quiz ? await getQuizQuestions(quiz.id) : [];

  return (
    <AdminShell user={user}>
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/courses" className="hover:text-zinc-300">Courses</Link>
            <span>/</span>
            <span className="text-zinc-400">{section.title}</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">{section.title}</h1>
          <p className="mt-2 text-zinc-400">
            {section.type} · {section.estimated_minutes} min · {section.is_locked ? "Locked" : "Unlocked"}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Tasks */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Problems ({tasks.length})</h2>

            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
                No problems yet.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-300">#{idx + 1} {task.title || task.label}</span>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{task.label}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{task.statement}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-lg font-semibold text-white">Add Problem</h3>
              <form action={createTask} className="mt-4 space-y-4">
                <input type="hidden" name="section_id" value={section.id} />
                <FormField label="Title (optional)" name="title" />
                <FormSelect label="Label" name="label" required options={taskLabels} />
                <FormField label="Statement" name="statement" rows={4} required />
                <FormField label="Answer" name="answer" required />
                <FormField label="Solution" name="solution" rows={4} required />
                <FormField label="Hints (comma separated)" name="hints" />
                <FormField label="Difficulty (1-3)" name="difficulty" type="number" min={1} max={3} />
                <FormField label="Estimated Minutes" name="estimated_minutes" type="number" defaultValue={0} />
                <FormField label="Concept ID" name="concept_id" />
                <FormField label="Concept Name" name="concept_name" />
                <FormField label="Tags (comma separated)" name="tags" />
                <FormField label="Order" name="order_index" type="number" defaultValue={tasks.length} />
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 font-medium text-zinc-950 hover:bg-zinc-200"
                >
                  <Plus className="h-4 w-4" />
                  Add Problem
                </button>
              </form>
            </div>
          </div>

          {/* Quiz */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Quiz ({questions.length} questions)</h2>

            {questions.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
                No quiz questions yet.
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-300">Q{idx + 1}</span>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{q.format}</span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-500">{q.prompt}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-lg font-semibold text-white">Add Quiz Question</h3>
              <form action={createQuizQuestion} className="mt-4 space-y-4">
                <input type="hidden" name="section_id" value={section.id} />
                <FormSelect label="Format" name="format" required options={questionFormats} />
                <FormField label="Prompt" name="prompt" rows={3} required />
                <FormField
                  label="Options (one per line, for MCQ/MSQ)"
                  name="options"
                  rows={4}
                  placeholder="Option A\nOption B\nOption C\nOption D"
                />
                <FormField label="Correct Answer" name="correct_answer" required />
                <FormField label="Explanation" name="explanation" rows={3} />
                <FormField label="Difficulty (1-3)" name="difficulty" type="number" min={1} max={3} />
                <FormSelect label="Gate Weight" name="gate_weight" options={gateWeights} />
                <FormField label="Concept ID" name="concept_id" />
                <FormField label="Concept Name" name="concept_name" />
                <FormField label="Order" name="order_index" type="number" defaultValue={questions.length} />
                <FormField label="Quiz Passing Score %" name="passing_score" type="number" defaultValue={quiz?.passing_score ?? 70} />
                <FormField label="Quiz Time Limit (minutes)" name="time_limit_minutes" type="number" />
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 font-medium text-zinc-950 hover:bg-zinc-200"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
