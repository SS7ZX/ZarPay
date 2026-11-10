export function ConfigMessage() {
  return (
    <main className="setup-screen">
      <div className="setup-card">
        <div className="brand-mark">Z</div>
        <p className="eyebrow">PENYIAPAN DIPERLUKAN</p>
        <h1>Hubungkan project Supabase Anda</h1>
        <p>
          ZarPay menggunakan Supabase Auth dan PostgreSQL. Tambahkan URL dan
          publishable key serta service role key khusus server ke{" "}
          <code>.env.local</code>, lalu jalankan migrasi SQL yang tersedia di
          folder <code>supabase/migrations</code>.
        </p>
        <code className="setup-code">
          NEXT_PUBLIC_SUPABASE_URL=...
          <br />
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
          <br />
          SUPABASE_SERVICE_ROLE_KEY=...
          <br />
          NEXT_PUBLIC_SITE_URL=http://localhost:3000
        </code>
      </div>
    </main>
  );
}
