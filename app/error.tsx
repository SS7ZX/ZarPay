"use client";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="setup-screen">
      <section className="setup-card" role="alert">
        <div className="brand-mark">Z</div>
        <p className="eyebrow">TERJADI GANGGUAN</p>
        <h1>Halaman tidak dapat dimuat</h1>
        <p>
          Data belum dapat ditampilkan. Periksa koneksi dan konfigurasi, lalu
          coba kembali.
        </p>
        <button className="button button-primary" onClick={reset} type="button">
          Coba lagi
        </button>
      </section>
    </main>
  );
}
