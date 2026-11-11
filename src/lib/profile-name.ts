export function getProfileName(
  metadata: unknown,
  email?: string | null,
): string {
  const metadataName =
    typeof metadata === "object" &&
    metadata !== null &&
    "full_name" in metadata
      ? metadata.full_name
      : undefined;
  if (typeof metadataName === "string") {
    const name = metadataName.trim().replace(/\s+/g, " ");
    if (name.length >= 2 && name.length <= 100) return name;
  }

  const emailName = (email?.split("@")[0] ?? "")
    .replace(/[._-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 100);
  return emailName.length >= 2 ? emailName : "Pengguna ZarPay";
}
