import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "./AdminNav";

interface AdminShellProps {
  children: React.ReactNode;
  user: { email?: string | null };
}

export default function AdminShell({ children, user }: AdminShellProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold text-white">
            Aleph Studio
          </Link>
        </div>
        <AdminNav />
        <div className="absolute bottom-0 w-64 border-t border-zinc-800 p-4">
          <p className="truncate text-sm text-zinc-400">{user.email}</p>
          <form action="/logout" method="post">
            <button
              type="submit"
              className="mt-2 text-sm text-zinc-500 hover:text-zinc-300"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
