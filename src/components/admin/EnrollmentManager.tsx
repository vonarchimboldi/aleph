"use client";

import { useState, useTransition } from "react";
import {
  assignEnrollmentAction,
  removeEnrollmentAction,
  updateAccountTypeAction,
} from "@/lib/admin/actions";

interface Enrollment {
  id: string;
  status: string;
  progress_percentage: number;
  subject: { id: string; title: string } | null;
}

interface Subject {
  id: string;
  title: string;
}

interface EnrollmentManagerProps {
  studentId: string;
  currentAccountType: string;
  enrollments: Enrollment[];
  availableSubjects: Subject[];
}

const accountTypes = [
  "gate-da-basic",
  "gate-da-advanced",
  "gate-da-premium",
  "gate-da-platinum",
];

export default function EnrollmentManager({
  studentId,
  currentAccountType,
  enrollments,
  availableSubjects,
}: EnrollmentManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [accountType, setAccountType] = useState(currentAccountType);
  const [message, setMessage] = useState<string | null>(null);

  function handleAssign() {
    if (!selectedSubject) return;
    setMessage(null);
    startTransition(async () => {
      try {
        await assignEnrollmentAction(studentId, selectedSubject);
        setMessage("Enrolled successfully");
        setSelectedSubject("");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Failed to enroll");
      }
    });
  }

  function handleRemove(enrollmentId: string) {
    setMessage(null);
    startTransition(async () => {
      try {
        await removeEnrollmentAction(enrollmentId, studentId);
        setMessage("Enrollment removed");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Failed to remove enrollment");
      }
    });
  }

  function handleAccountTypeChange() {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateAccountTypeAction(studentId, accountType);
        setMessage("Account type updated");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Failed to update account type");
      }
    });
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            message.includes("Failed")
              ? "border-red-900 bg-red-950/30 text-red-400"
              : "border-emerald-900 bg-emerald-950/30 text-emerald-400"
          }`}
        >
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">Account type</h2>
        <div className="mt-4 flex items-center gap-3">
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-white outline-none focus:border-zinc-500 sm:w-64"
          >
            {accountTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAccountTypeChange}
            disabled={isPending}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-40"
          >
            Update
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">Current enrollments</h2>
        {enrollments.length > 0 ? (
          <ul className="mt-4 divide-y divide-zinc-800">
            {enrollments.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-white">{e.subject?.title || "Unknown subject"}</p>
                  <p className="text-xs text-zinc-500">
                    {e.status} · {e.progress_percentage}% complete
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(e.id)}
                  disabled={isPending}
                  className="text-sm text-red-400 hover:text-red-300 disabled:opacity-40"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">Not enrolled in any subjects yet.</p>
        )}
      </div>

      {availableSubjects.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">Assign to subject</h2>
          <div className="mt-4 flex items-center gap-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-white outline-none focus:border-zinc-500 sm:w-64"
            >
              <option value="">Select a subject</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAssign}
              disabled={isPending || !selectedSubject}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-40"
            >
              Enroll
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
