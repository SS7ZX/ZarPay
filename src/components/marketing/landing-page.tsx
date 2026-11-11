import Link from "next/link";
import { BrandLogo } from "@/src/components/common/brand-logo";
import { LandingSections } from "@/src/components/marketing/landing-sections";

export function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Link className="brand-lockup" href="/" aria-label="ZarPay beranda">
            <BrandLogo markOnly />
          </Link>
          <nav className="landing-nav-links" aria-label="Navigasi utama">
            <a href="#fitur">Fitur</a>
            <a href="#cara-kerja">Cara kerja</a>
            <a href="#penilaian">Skala penilaian</a>
            <a href="#faq">FAQ</a>
          </nav>
          <details className="landing-mobile-menu">
            <summary>
              <svg
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
              <span>Menu</span>
            </summary>
            <nav aria-label="Navigasi halaman">
              <a href="#fitur">Fitur</a>
              <a href="#cara-kerja">Cara kerja</a>
              <a href="#penilaian">Skala penilaian</a>
              <a href="#faq">FAQ</a>
            </nav>
          </details>
          <div className="landing-nav-actions">
            <Link className="landing-login-link" href="/login">Masuk</Link>
            <Link className="button button-primary landing-nav-cta" href="/login">
              Masuk atau daftar
            </Link>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-container hero-grid">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="hero-kicker-dot" />
              Simulasi penilaian kredit
            </div>
            <h1>
              Hitung cicilan.
              <br />
              <span>Pahami hasilnya.</span>
            </h1>
            <p className="hero-description">
              Masukkan pendapatan, kewajiban, dan rencana pinjaman untuk melihat
              estimasi cicilan, rasio utang terhadap pendapatan (DTI), serta
              faktor yang membentuk skor.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary hero-primary-cta" href="/login">
                Masuk atau daftar
              </Link>
              <a className="hero-secondary-cta" href="#cara-kerja">
                Lihat cara kerja <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero-footnote">
              <span className="hero-footnote-icon" aria-hidden="true">i</span>
              Untuk pembelajaran. Gunakan angka hipotetis, bukan data keuangan pribadi.
            </div>
          </div>

          <div className="hero-art" role="group" aria-label="Ringkasan simulasi yang menunggu data">
            <div className="preview-window">
              <div className="preview-window-top">
                <strong className="preview-brand">Ringkasan simulasi</strong>
                <span className="preview-sample-tag">Menunggu data Anda</span>
              </div>
              <div className="preview-score-card">
                <div className="preview-score-copy">
                  <span>Skor simulasi</span>
                  <strong>Belum dihitung</strong>
                  <small>Isi simulasi untuk melihat hasil</small>
                </div>
                <div className="preview-gauge" aria-hidden="true">
                  <div className="preview-gauge-inner">
                    <strong>—</strong><span>Skor</span>
                  </div>
                </div>
              </div>
              <div className="preview-dti">
                <div className="preview-dti-heading">
                  <span>DTI setelah pinjaman</span>
                  <strong>Belum dihitung</strong>
                </div>
                <div className="preview-dti-track" aria-hidden="true" />
                <small>Dihitung dari pendapatan, kewajiban, dan cicilan.</small>
              </div>
              <div className="preview-factors">
                <div><span className="factor-indicator">01</span><span>Kemampuan bayar</span></div>
                <div><span className="factor-indicator">02</span><span>Stabilitas pekerjaan</span></div>
                <div><span className="factor-indicator">03</span><span>Riwayat kredit</span></div>
                <div><span className="factor-indicator">04</span><span>Rencana pinjaman</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingSections />
    </main>
  );
}
