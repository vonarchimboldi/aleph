import { createClient } from "@/lib/supabase/server";
import TopBar from "./app/TopBar";

export async function Navbar() {
  let email: string | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    email = data.user?.email ?? null;
  } catch {
    // Supabase not configured — render navbar without auth state
  }

  return <TopBar email={email} variant={email ? "app" : "landing"} />;
}
