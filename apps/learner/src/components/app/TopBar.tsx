"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import UserMenu from "../UserMenu";

const APP_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "Courses" },
  { href: "/tasks", label: "Tasks" },
  { href: "/tests", label: "Tests" },
  { href: "/feedback", label: "Feedback" },
  { href: "/resources", label: "Resources" },
] as const;

const LANDING_NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

interface TopBarProps {
  email: string | null;
  variant: "app" | "landing";
}

export default function TopBar({ email, variant }: TopBarProps) {
  const pathname = usePathname();
  const nav = variant === "app" ? APP_NAV : LANDING_NAV;
  const isLoggedIn = Boolean(email);

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href={isLoggedIn ? "/dashboard" : "/"}
          className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white"
        >
          <GraduationCap className="h-6 w-6" />
          <span className="hidden sm:inline">Aleph</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <UserMenu email={email} />
      </div>
    </header>
  );
}
