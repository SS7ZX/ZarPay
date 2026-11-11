import { describe, expect, it } from "vitest";
import { isDatabaseSetupError } from "./schema-errors";

describe("isDatabaseSetupError", () => {
  it.each(["42P01", "42501", "42883", "PGRST202", "PGRST205"])(
    "recognizes schema/setup error %s",
    (code) => {
      expect(isDatabaseSetupError({ code })).toBe(true);
    },
  );

  it("does not classify unrelated request errors as schema setup failures", () => {
    expect(isDatabaseSetupError({ code: "PGRST301" })).toBe(false);
    expect(isDatabaseSetupError({})).toBe(false);
  });
});
