import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServiceRoleKey, getSupabaseEnvironment } from "./env";

describe("getSupabaseEnvironment", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  });

  describe("getServiceRoleKey", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("accepts a legacy service-role JWT and a modern secret key", () => {
      const legacyKey =
        "header.eyJyb2xlIjoic2VydmljZV9yb2xlIn0=.signature";
      vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", legacyKey);
      expect(getServiceRoleKey()).toBe(legacyKey);

      vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_test");
      expect(getServiceRoleKey()).toBe("sb_secret_test");
    });

    it("rejects an anonymous JWT and malformed values", () => {
      vi.stubEnv(
        "SUPABASE_SERVICE_ROLE_KEY",
        "header.eyJyb2xlIjoiYW5vbiJ9.signature",
      );
      expect(getServiceRoleKey()).toBeNull();

      vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "not-a-server-key");
      expect(getServiceRoleKey()).toBeNull();
    });
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
