import { NextResponse, type NextRequest } from "next/server";

export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
