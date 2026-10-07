"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronRight, ChevronLeft, BookOpen } from "lucide-react";
import MarkdownEditor from "./MarkdownEditor";
import { createCourseBundleAction } from "@/lib/admin/actions";
import type { SectionType } from "@/lib/admin/types";

interface Exam {
  id: string;
  title: string;
}

interface SectionDraft {
  title: string;
  slug: string;
  type: SectionType;
  estimatedMinutes: number;
  content: string;
}

interface ChapterDraft {
  title: string;
  slug: string;
  description: string;
  estimatedMinutes: number;
  sections: SectionDraft[];
}

interface CourseWizardProps {
  exams: Exam[];
}

const sectionTypes: SectionType[] = [
  "read",
  "concept",
  "mechanic",
  "integration",
  "challenge",
  "quiz",
  "review",
  "summary",
];

const inputClasses =
  "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-white outline-none focus:border-zinc-500";

export default function CourseWizard({ exams }: CourseWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [examChoice, setExamChoice] = useState<string>(exams[0]?.id || "new");
  const [newExamTitle, setNewExamTitle] = useState("");
  const [newExamMonth, setNewExamMonth] = useState("");
  const [newExamYear, setNewExamYear] = useState("");

  const [courseTitle, setCourseTitle] = useState("");
  const [courseTagline, setCourseTagline] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseDifficulty, setCourseDifficulty] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [courseEstimatedHours, setCourseEstimatedHours] = useState("");

  const [subjectTitle, setSubjectTitle] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");

  const [isActive, setIsActive] = useState(true);

  const [chapters, setChapters] = useState<ChapterDraft[]>([
    { title: "", slug: "", description: "", estimatedMinutes: 0, sections: [] },
  ]);

  function updateChapter(index: number, patch: Partial<ChapterDraft>) {
    setChapters((prev) =>
      prev.map((ch, i) => (i === index ? { ...ch, ...patch } : ch))
    );
  }

  function addChapter() {
    setChapters((prev) => [
      ...prev,
      { title: "", slug: "", description: "", estimatedMinutes: 0, sections: [] },
    ]);
  }

  function removeChapter(index: number) {
    setChapters((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSection(
    chapterIndex: number,
    sectionIndex: number,
    patch: Partial<SectionDraft>
  ) {
    setChapters((prev) =>
      prev.map((ch, ci) => {
        if (ci !== chapterIndex) return ch;
        return {
          ...ch,
          sections: ch.sections.map((sec, si) =>
            si === sectionIndex ? { ...sec, ...patch } : sec
          ),
        };
      })
    );
  }

  function addSection(chapterIndex: number) {
    setChapters((prev) =>
      prev.map((ch, i) => {
        if (i !== chapterIndex) return ch;
        return {
          ...ch,
          sections: [
            ...ch.sections,
            { title: "", slug: "", type: "read", estimatedMinutes: 0, content: "" },
          ],
        };
      })
    );
  }

  function removeSection(chapterIndex: number, sectionIndex: number) {
    setChapters((prev) =>
      prev.map((ch, i) => {
        if (i !== chapterIndex) return ch;
        return { ...ch, sections: ch.sections.filter((_, si) => si !== sectionIndex) };
      })
    );
  }

  function sectionCount() {
    return chapters.reduce((sum, ch) => sum + ch.sections.length, 0);
  }

  function canProceed() {
    if (step === 1) {
      if (examChoice === "new" && !newExamTitle.trim()) return false;
      if (!courseTitle.trim() || !subjectTitle.trim()) return false;
    }
    if (step === 2) {
      if (chapters.length === 0 || chapters.some((ch) => !ch.title.trim())) return false;
    }
    if (step === 3) {
      if (sectionCount() === 0) return false;
      if (chapters.some((ch) => ch.sections.some((s) => !s.title.trim()))) return false;
    }
    return true;
  }

  function handleSubmit() {
    setError(null);
    const payload = {
      examChoice,
      examTitle: newExamTitle,
      examMonth: newExamMonth,
      examYear: newExamYear,
      course: {
        title: courseTitle,
        tagline: courseTagline,
        description: courseDescription,
        difficulty: courseDifficulty,
        duration: courseDuration,
        estimated_hours: courseEstimatedHours,
      },
      subject: {
        title: subjectTitle,
        description: subjectDescription,
      },
      chapters: chapters.map((ch) => ({
        title: ch.title,
        slug: ch.slug,
        description: ch.description,
        estimated_minutes: ch.estimatedMinutes,
        sections: ch.sections.map((sec) => ({
          title: sec.title,
          slug: sec.slug,
          type: sec.type,
          estimated_minutes: sec.estimatedMinutes,
          content: sec.content,
        })),
      })),
      isActive,
    };

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("payload", JSON.stringify(payload));
        const courseId = await createCourseBundleAction(formData);
        router.push(`/courses/${courseId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create course");
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        {["Metadata", "Chapters", "Sections", "Review"].map((label, idx) => {
          const s = idx + 1;
          const active = step === s;
          const completed = step > s;
          return (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  active
                    ? "bg-white text-zinc-950"
                    : completed
                    ? "bg-zinc-700 text-white"
                    : "border border-zinc-700 text-zinc-500"
                }`}
              >
                {s}
              </span>
              <span className={active ? "text-white" : ""}>{label}</span>
              {idx < 3 && <ChevronRight className="h-4 w-4" />}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-white">Exam</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Select or create exam <span className="text-red-400">*</span>
                </label>
                <select
                  value={examChoice}
                  onChange={(e) => setExamChoice(e.target.value)}
                  className={inputClasses}
                >
                  <option value="new">+ Create new exam</option>
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>

              {examChoice === "new" && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-zinc-300">
                      New exam title <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={newExamTitle}
                      onChange={(e) => setNewExamTitle(e.target.value)}
                      className={inputClasses}
                      placeholder="e.g. GATE DA 2027"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300">Month</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={newExamMonth}
                      onChange={(e) => setNewExamMonth(e.target.value)}
                      className={inputClasses}
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300">Year</label>
                    <input
                      type="number"
                      value={newExamYear}
                      onChange={(e) => setNewExamYear(e.target.value)}
                      className={inputClasses}
                      placeholder="2027"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-white">Course</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Course title <span className="text-red-400">*</span>
                </label>
                <input
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className={inputClasses}
                  placeholder="e.g. DSA for GATE DA"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-300">Tagline</label>
                <input
                  value={courseTagline}
                  onChange={(e) => setCourseTagline(e.target.value)}
                  className={inputClasses}
                  placeholder="Short marketing line"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-300">Description</label>
                <textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  rows={3}
                  className={inputClasses}
                  placeholder="What the learner will achieve"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">Difficulty</label>
                <input
                  value={courseDifficulty}
                  onChange={(e) => setCourseDifficulty(e.target.value)}
                  className={inputClasses}
                  placeholder="e.g. Beginner to Intermediate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">Duration</label>
                <input
                  value={courseDuration}
                  onChange={(e) => setCourseDuration(e.target.value)}
                  className={inputClasses}
                  placeholder="e.g. 40 hours"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">Estimated hours</label>
                <input
                  type="number"
                  min={0}
                  value={courseEstimatedHours}
                  onChange={(e) => setCourseEstimatedHours(e.target.value)}
                  className={inputClasses}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-white">Subject</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Subject title <span className="text-red-400">*</span>
                </label>
                <input
                  value={subjectTitle}
                  onChange={(e) => setSubjectTitle(e.target.value)}
                  className={inputClasses}
                  placeholder="e.g. Data Structures and Algorithms"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">Description</label>
                <textarea
                  value={subjectDescription}
                  onChange={(e) => setSubjectDescription(e.target.value)}
                  rows={3}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 rounded border-zinc-700 bg-zinc-950 text-white"
            />
            <div>
              <p className="font-medium text-white">Publish immediately</p>
              <p className="text-sm text-zinc-400">Learners can see the course once active.</p>
            </div>
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {chapters.map((chapter, chIdx) => (
            <div key={chIdx} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Chapter {chIdx + 1}</h3>
                {chapters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChapter(chIdx)}
                    className="text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300">
                    Chapter title <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={chapter.title}
                    onChange={(e) => updateChapter(chIdx, { title: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300">Slug (optional)</label>
                  <input
                    value={chapter.slug}
                    onChange={(e) => updateChapter(chIdx, { slug: e.target.value })}
                    className={inputClasses}
                    placeholder="auto-generated if empty"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300">
                    Estimated minutes
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={chapter.estimatedMinutes}
                    onChange={(e) =>
                      updateChapter(chIdx, { estimatedMinutes: parseInt(e.target.value) || 0 })
                    }
                    className={inputClasses}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300">Description</label>
                  <textarea
                    value={chapter.description}
                    onChange={(e) => updateChapter(chIdx, { description: e.target.value })}
                    rows={2}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addChapter}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 py-3 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white"
          >
            <Plus className="h-4 w-4" />
            Add chapter
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          {chapters.map((chapter, chIdx) => (
            <div key={chIdx} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="font-semibold text-white">
                Chapter {chIdx + 1}: {chapter.title || "Untitled"}
              </h3>

              <div className="mt-4 space-y-4">
                {chapter.sections.map((section, secIdx) => (
                  <div
                    key={secIdx}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-zinc-300">Section {secIdx + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeSection(chIdx, secIdx)}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 grid gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-zinc-400">
                          Title <span className="text-red-400">*</span>
                        </label>
                        <input
                          value={section.title}
                          onChange={(e) =>
                            updateSection(chIdx, secIdx, { title: e.target.value })
                          }
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-400">Type</label>
                        <select
                          value={section.type}
                          onChange={(e) =>
                            updateSection(chIdx, secIdx, { type: e.target.value as SectionType })
                          }
                          className={inputClasses}
                        >
                          {sectionTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-400">
                          Est. minutes
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={section.estimatedMinutes}
                          onChange={(e) =>
                            updateSection(chIdx, secIdx, {
                              estimatedMinutes: parseInt(e.target.value) || 0,
                            })
                          }
                          className={inputClasses}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-zinc-400">
                          Slug (optional)
                        </label>
                        <input
                          value={section.slug}
                          onChange={(e) =>
                            updateSection(chIdx, secIdx, { slug: e.target.value })
                          }
                          className={inputClasses}
                          placeholder="auto-generated if empty"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <MarkdownEditor
                        label="Content"
                        value={section.content}
                        onChange={(value) => updateSection(chIdx, secIdx, { content: value })}
                        rows={8}
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addSection(chIdx)}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add section to "{chapter.title || "this chapter"}"
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">Review</h2>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            <p>
              <span className="text-zinc-500">Course:</span> {courseTitle || "Untitled"}
            </p>
            <p>
              <span className="text-zinc-500">Subject:</span> {subjectTitle || "Untitled"}
            </p>
            <p>
              <span className="text-zinc-500">Chapters:</span> {chapters.length}
            </p>
            <p>
              <span className="text-zinc-500">Sections:</span> {sectionCount()}
            </p>
            <p>
              <span className="text-zinc-500">Published:</span> {isActive ? "Yes" : "No"}
            </p>
          </div>
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="flex items-center gap-2 text-sm text-zinc-400">
              <BookOpen className="h-4 w-4" />
              After creation you can add tasks, quizzes, and resources from the course page.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(4, s + 1))}
            disabled={!canProceed()}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !canProceed()}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-40"
          >
            {isPending ? "Creating..." : "Create course"}
          </button>
        )}
      </div>
    </div>
  );
}
