import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/src/types";
import { getSupabaseEnvironment } from "@/src/lib/supabase/env";

export async function proxy(request: NextRequest) {
  const environment = getSupabaseEnvironment();
  if (!environment) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(
    environment.url,
    environment.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          for (const [name, value] of Object.entries(headers)) {
            response.headers.set(name, value);
          }
        },
      },
    },
  );

  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/apply/:path*",
    "/api/applications",
    "/api/applications/:path*",
    "/auth/callback",
  ],
};
