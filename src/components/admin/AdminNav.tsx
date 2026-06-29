"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, Layers, Database, Home, Target, Eye, Users } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/students", label: "Students", icon: Users },
  { href: "/material-sets", label: "Material Sets", icon: FileText },
  { href: "/concept-graphs", label: "Concept Graphs", icon: Layers },
  { href: "/insights", label: "Insights", icon: Target },
  { href: "/preview/55555555-5555-5555-5555-555555555555", label: "Preview", icon: Eye },
  { href: "/bulk-import", label: "Bulk Import", icon: Database },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-4">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
