import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-less public client for reading public content.
 * Use this for course/chapter/section/task/quiz queries so they can be cached
 * and do not depend on the request's auth cookies.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}
