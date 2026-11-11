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
  return serviceRoleKey && !serviceRoleKey.startsWith("your-")
    ? serviceRoleKey
    : null;
}
