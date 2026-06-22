"use client";

import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  email: string | null;
}

export default function AppShell({ children, email }: AppShellProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-zinc-50 dark:bg-zinc-950">
      <TopBar email={email} variant="app" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 lg:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
