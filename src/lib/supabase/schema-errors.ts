const schemaErrorCodes = new Set([
  "42P01",
  "42501",
  "42703",
  "42883",
  "PGRST202",
  "PGRST204",
  "PGRST205",
]);

export function isDatabaseSetupError(error: { code?: string }): boolean {
  return Boolean(error.code && schemaErrorCodes.has(error.code));
}

export class SupabaseSchemaSetupError extends Error {
  constructor() {
    super("Supabase database schema or permissions are not ready.");
    this.name = "SupabaseSchemaSetupError";
  }
}
