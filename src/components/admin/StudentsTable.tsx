"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

interface Student {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  account_type: string;
  created_at: string;
}

interface StudentsTableProps {
  students: Student[];
}

export default function StudentsTable({ students }: StudentsTableProps) {
  const [query, setQuery] = useState("");

  const filtered = students.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      s.email.toLowerCase().includes(q) ||
      (s.full_name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-2 pl-10 pr-4 text-white outline-none focus:border-zinc-500"
        />
      </div>

      {filtered.length > 0 ? (
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
                {filtered.map((student) => (
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
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
          No students match “{query}”.
        </div>
      )}
    </div>
  );
}
