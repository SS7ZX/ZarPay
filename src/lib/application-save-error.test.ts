import { describe, expect, it } from "vitest";
import {
  getApplicationReviewErrorMessage,
  getApplicationSaveErrorMessage,
} from "./application-save-error";

describe("getApplicationSaveErrorMessage", () => {
  it("points to the server key when Supabase rejects the admin write", () => {
    expect(getApplicationSaveErrorMessage("42501")).toContain(
      "SUPABASE_SERVICE_ROLE_KEY",
    );
  });

  describe("getApplicationReviewErrorMessage", () => {
    it("explains server-key and schema failures without exposing database details", () => {
      expect(getApplicationReviewErrorMessage("42501")).toContain(
        "SUPABASE_SERVICE_ROLE_KEY",
      );
      expect(getApplicationReviewErrorMessage("PGRST205")).toContain("migrasi");
      expect(getApplicationReviewErrorMessage("XX000")).toContain(
        "kode referensi",
      );
    });
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
