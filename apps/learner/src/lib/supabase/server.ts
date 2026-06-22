import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });
}

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  account_type: string;
  created_at: string;
  updated_at: string;
};

/**
 * Ensures a profile row exists for the given user.
 * If the trigger on auth.users failed to create one, this creates it on demand.
 * If the profiles table doesn't exist yet, returns a fallback object.
 */
export async function ensureProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: User
): Promise<Profile> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      return profile as Profile;
    }

    const { data: inserted } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "",
        role: "student",
        account_type: "gate-da-basic",
      })
      .select()
      .single();

    if (inserted) {
      return inserted as Profile;
    }
  } catch {
    // profiles table doesn't exist yet — return fallback
  }

  return {
    id: user.id,
    email: user.email || "",
    full_name: user.user_metadata?.full_name || null,
    role: "student",
    account_type: "gate-da-basic",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
