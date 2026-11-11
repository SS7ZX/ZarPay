export interface SupabaseEnvironment {
  url: string;
  publishableKey: string;
}

function isAllowedSupabaseUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol === "https:") return true;
  const isLocalHost =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]";
  return (
    process.env.NODE_ENV !== "production" &&
    url.protocol === "http:" &&
    isLocalHost
  );
}

export function getSupabaseEnvironment(): SupabaseEnvironment | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (
    !url ||
    !publishableKey ||
    !isAllowedSupabaseUrl(url) ||
    url.includes("your-project.supabase.co") ||
    publishableKey.startsWith("your-")
  ) {
    return null;
  }
  return { url, publishableKey };
}

export function getServiceRoleKey(): string | null {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || serviceRoleKey.startsWith("your-")) return null;
  if (serviceRoleKey.startsWith("sb_secret_")) return serviceRoleKey;

  const parts = serviceRoleKey.split(".");
  if (parts.length !== 3 || !parts[1]) return null;

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      "=",
    );
    const bytes = Uint8Array.from(atob(paddedPayload), (character) =>
      character.charCodeAt(0),
    );
    const claims: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (
      typeof claims === "object" &&
      claims !== null &&
      "role" in claims &&
      claims.role === "service_role"
    ) {
      return serviceRoleKey;
    }
  } catch {
    return null;
  }
  return null;
}
