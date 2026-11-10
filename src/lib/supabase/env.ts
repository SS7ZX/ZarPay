export interface SupabaseEnvironment {
  url: string;
  publishableKey: string;
}

export function getSupabaseEnvironment(): SupabaseEnvironment | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (
    !url ||
    !publishableKey ||
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
