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
    return "Supabase menolak penyimpanan. Pastikan SUPABASE_SERVICE_ROLE_KEY di server adalah service-role atau secret key dari project yang sama.";
  }
  if (code && schemaErrorCodes.has(code)) {
    return "Schema tabel pengajuan belum lengkap. Pastikan migrasi Supabase sudah diterapkan pada project yang sama dengan backend.";
  }
  if (code === "23503") {
    return "Profil peminjam tidak ditemukan di database. Pastikan akun dan aplikasi menggunakan project Supabase yang sama.";
  }
  if (code === "23514") {
    return "Database menolak data berdasarkan aturan schema. Pastikan semua migrasi berhasil diterapkan.";
  }
  return "Pengajuan gagal disimpan. Coba lagi; jika masih gagal, kirim kode referensi ini ke administrator.";
}

export function getApplicationReviewErrorMessage(
  code: string | undefined,
): string {
  if (code && serviceRoleErrorCodes.has(code)) {
    return "Supabase menolak penyimpanan keputusan. Pastikan SUPABASE_SERVICE_ROLE_KEY adalah service-role atau secret key dari project yang sama.";
  }
  if (code && schemaErrorCodes.has(code)) {
    return "Schema tinjauan belum lengkap. Pastikan migrasi Supabase sudah diterapkan pada project yang sama.";
  }
  if (code === "23514") {
    return "Catatan keputusan tidak memenuhi aturan database. Periksa panjang catatan lalu coba kembali.";
  }
  return "Keputusan gagal disimpan. Coba lagi; jika masih gagal, kirim kode referensi ini ke administrator.";
}
