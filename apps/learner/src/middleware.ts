import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    const { supabaseResponse, user } = await updateSession(request);

    // Protect app routes
    const protectedPaths = [
      "/dashboard",
      "/courses",
      "/learn",
      "/tasks",
      "/tests",
      "/feedback",
      "/resources",
      "/profile",
    ];
    const isProtected = protectedPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );
    if (isProtected && !user) {
      return Response.redirect(new URL("/login", request.url));
    }

    // Redirect authenticated users away from auth pages
    if (
      (request.nextUrl.pathname === "/login" ||
        request.nextUrl.pathname === "/signup") &&
      user
    ) {
      return Response.redirect(new URL("/dashboard", request.url));
    }

    // NOTE: We intentionally do not check profiles.role here.
    // Admin users can also use the learner app as regular students.
    // The admin app is the only place where role = 'admin' is enforced.

    return supabaseResponse;
  } catch (err) {
    console.error("[middleware] Unhandled error:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
