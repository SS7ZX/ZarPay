import { describe, expect, it } from "vitest";
import { getApplicationSaveErrorMessage } from "./application-save-error";

describe("getApplicationSaveErrorMessage", () => {
  it("points to the server key when Supabase rejects the admin write", () => {
    expect(getApplicationSaveErrorMessage("42501")).toContain(
      "SUPABASE_SERVICE_ROLE_KEY",
    );
  });

  it("points to database migrations for missing schema objects", () => {
    expect(getApplicationSaveErrorMessage("PGRST205")).toContain("migrasi");
  });

  it("keeps unknown database errors generic", () => {
    expect(getApplicationSaveErrorMessage("XX000")).toContain(
      "kode referensi",
    );
  });
});
