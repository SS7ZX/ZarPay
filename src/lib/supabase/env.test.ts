import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSupabaseEnvironment } from "./env";

describe("getSupabaseEnvironment", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts HTTPS projects and local HTTP development URLs", () => {
    expect(getSupabaseEnvironment()).not.toBeNull();

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    expect(getSupabaseEnvironment()?.url).toBe("http://127.0.0.1:54321");
  });

  it("rejects remote HTTP and malformed URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://project.example.com");
    expect(getSupabaseEnvironment()).toBeNull();

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not a URL");
    expect(getSupabaseEnvironment()).toBeNull();
  });

  it("requires HTTPS for production deployments", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");

    expect(getSupabaseEnvironment()).toBeNull();
  });
});
