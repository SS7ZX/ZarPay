import { BrandLogo } from "@/src/components/common/brand-logo";

export function DatabaseSetupMessage() {
  return (
    <main className="setup-screen">
      <section className="setup-card" role="alert">
        <BrandLogo />
        <p className="eyebrow">DATABASE PERLU DIPERIKSA</p>
        <h1>Dashboard belum dapat membaca database</h1>
        <p>
          Login berhasil, tetapi schema atau izin Supabase yang diperlukan
          belum siap. Pastikan kedua migrasi berikut sudah diterapkan pada
          project yang sama dengan Vercel, sesuai urutan:
        </p>
        <ol>
          <li><code>20261110130000_initial_schema.sql</code></li>
          <li><code>20261111195500_production_hardening.sql</code></li>
        </ol>
        <p>
          Jika migrasi sudah diterapkan, periksa grants dan kebijakan RLS untuk
          tabel <code>profiles</code> dan <code>applications</code>, serta
          pastikan <code>SUPABASE_SERVICE_ROLE_KEY</code> tersedia sebagai
          variable server-only di Vercel.
        </p>
      </section>
    </main>
  );
}
