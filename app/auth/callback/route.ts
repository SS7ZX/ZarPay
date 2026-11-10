import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnvironment } from "@/src/lib/supabase/env";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!getSupabaseEnvironment()) {
    return NextResponse.redirect(new URL("/login?error=configuration", request.url));
  }
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=confirmation", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("Supabase auth callback failed:", error.message);
    return NextResponse.redirect(new URL("/login?error=confirmation", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
