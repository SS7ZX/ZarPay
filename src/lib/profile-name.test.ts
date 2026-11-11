import { describe, expect, it } from "vitest";
import { getProfileName } from "./profile-name";

describe("getProfileName", () => {
  it("uses a valid metadata name", () => {
    expect(getProfileName({ full_name: "  Budi   Santoso " }, "budi@example.test"))
      .toBe("Budi Santoso");
  });

  it("falls back to the email name when metadata is missing or invalid", () => {
    expect(getProfileName({}, "budi.santoso@example.test")).toBe("budi santoso");
    expect(getProfileName({ full_name: "x" }, "budi@example.test")).toBe("budi");
  });

  it("uses a generic safe name when no usable name is available", () => {
    expect(getProfileName(null, "x@example.test")).toBe("Pengguna ZarPay");
  });
});
