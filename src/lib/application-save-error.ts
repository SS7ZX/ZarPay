const serviceRoleErrorCodes = new Set(["401", "403", "42501", "PGRST301"]);
const schemaErrorCodes = new Set([
  "42P01",
  "42703",
  "PGRST204",
  "PGRST205",
]);

export function getApplicationSaveErrorMessage(
  code: string | undefined,
): string {
  if (code && serviceRoleErrorCodes.has(code)) {
    return "Supabase menolak penyimpanan. Pastikan SUPABASE_SERVICE_ROLE_KEY di Vercel adalah service-role key dari project yang sama, lalu deploy ulang.";
  }
  if (code && schemaErrorCodes.has(code)) {
    return "Schema tabel pengajuan belum lengkap. Pastikan migrasi Supabase sudah diterapkan pada project yang sama dengan Vercel.";
  }
  if (code === "23503") {
    return "Profil peminjam tidak ditemukan di database. Pastikan akun dan aplikasi menggunakan project Supabase yang sama.";
  }
  if (code === "23514") {
    return "Database menolak data berdasarkan aturan schema. Pastikan semua migrasi berhasil diterapkan.";
  }
  return "Pengajuan gagal disimpan. Coba lagi; jika masih gagal, kirim kode referensi ini ke administrator.";
}
