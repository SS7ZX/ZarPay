import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/src/components/common/brand-logo";

type IconName = "score" | "shield" | "chart" | "review" | "borrower" | "evaluator";

const iconPaths: Record<IconName, ReactNode> = {
  score: (
    <>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 3-4 3 2 5-7" />
      <path d="M15 6h3v3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 19 6v5c0 4.5-2.7 7.6-7 10-4.3-2.4-7-5.5-7-10V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-4" />
      <path d="M12 16V8" />
      <path d="M16 16v-7" />
    </>
  ),
  review: (
    <>
      <path d="M5 4h14v16l-3.5-2-3.5 2-3.5-2L5 20V4Z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  borrower: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M5 20c.7-3.4 3.1-5 7-5s6.3 1.6 7 5" />
    </>
  ),
  evaluator: (
    <>
      <path d="M4 5h16v12H4z" />
      <path d="m8 13 2.5-2.5 2 1.5L16 8" />
      <path d="M9 21h6m-3-4v4" />
    </>
  ),
};

function LineIcon({ name }: { name: IconName }) {
  return (
    <svg
      aria-hidden="true"
      className="landing-icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {iconPaths[name]}
    </svg>
  );
}

const features = [
  {
    icon: "score" as const,
    title: "Skor dengan rincian faktor",
    description:
      "Lihat nilai simulasi pada skala 300 sampai 850 beserta poin dari setiap faktor.",
  },
  {
    icon: "chart" as const,
    title: "Rasio utang setelah pinjaman",
    description:
      "Perkiraan cicilan ditambahkan ke kewajiban bulanan sebelum rasio DTI dihitung.",
  },
  {
    icon: "review" as const,
    title: "Tinjauan pengajuan",
    description:
      "Evaluator dapat meninjau data dan status pengajuan dari dashboard.",
  },
  {
    icon: "shield" as const,
    title: "Akses sesuai peran",
    description:
      "Peminjam hanya dapat melihat pengajuannya sendiri. Administrator mengatur akses evaluator.",
  },
];

const scoreTiers = [
  { range: "740 sampai 850", label: "Risiko rendah", className: "tier-low" },
  { range: "670 sampai 739", label: "Risiko moderat", className: "tier-moderate" },
  { range: "580 sampai 669", label: "Perlu perhatian", className: "tier-elevated" },
  { range: "300 sampai 579", label: "Risiko tinggi", className: "tier-high" },
];

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
              Untuk pembelajaran. Gunakan data contoh, bukan informasi keuangan pribadi.
            </div>
          </div>

          <div className="hero-art" role="group" aria-label="Contoh tampilan hasil simulasi">
            <div className="preview-window">
              <div className="preview-window-top">
                <strong className="preview-brand">Hasil simulasi</strong>
                <span className="preview-sample-tag">Data ilustrasi</span>
              </div>
              <div className="preview-person">
                <span className="preview-person-avatar" aria-hidden="true">i</span>
                <span><strong>Profil contoh</strong><small>Angka tidak mewakili pengguna nyata</small></span>
              </div>
              <div className="preview-score-card">
                <div className="preview-score-copy">
                  <span>Skor simulasi</span>
                  <strong>742</strong>
                  <small>Skala 300 sampai 850</small>
                  <span className="preview-risk">Risiko rendah</span>
                </div>
                <div className="preview-gauge" aria-hidden="true">
                  <div className="preview-gauge-inner">
                    <strong>742</strong><span>Skor</span>
                  </div>
                </div>
              </div>
              <div className="preview-dti">
                <div className="preview-dti-heading">
                  <span>DTI setelah cicilan</span>
                  <strong>28,4%</strong>
                </div>
                <div className="preview-dti-track"><span /></div>
                <small>Utang bulanan dibandingkan dengan pendapatan</small>
              </div>
              <div className="preview-factors">
                <div><span className="factor-indicator factor-positive">+</span><span>Riwayat kredit</span><strong>Baik</strong></div>
                <div><span className="factor-indicator factor-neutral">↗</span><span>Rasio utang</span><strong>Terukur</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-proof-strip" aria-label="Cakupan simulasi ZarPay">
        <div className="landing-container proof-grid">
          <div><strong>Skor 300 sampai 850</strong><span>Rentang nilai simulasi</span></div>
          <div><strong>Estimasi cicilan</strong><span>Asumsi bunga tahunan 12%</span></div>
          <div><strong>Enam faktor penilaian</strong><span>Poin setiap faktor ditampilkan</span></div>
          <div><strong>DTI pascapinjaman</strong><span>Memperhitungkan estimasi cicilan</span></div>
        </div>
      </section>

      <section className="landing-section feature-section" id="fitur">
        <div className="landing-container">
          <div className="section-intro">
            <span className="landing-eyebrow">Fitur</span>
            <h2>Informasi untuk memahami hasil simulasi</h2>
            <p>
              Periksa estimasi cicilan, rasio utang, dan rincian skor dalam satu
              tempat.
            </p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <div className="feature-icon">
                  <LineIcon name={feature.icon} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section process-section" id="cara-kerja">
        <div className="landing-container process-layout">
          <div className="section-intro process-intro">
            <span className="landing-eyebrow">Cara kerja</span>
            <h2>Mulai dari data, lanjutkan dengan hasil</h2>
            <p>
              Isi profil keuangan untuk melihat hasil simulasi. Peminjam juga
              dapat memantau status pengajuan setelah dikirim.
            </p>
            <Link className="text-link" href="/login">
              Masuk atau daftar <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="process-steps">
            <article className="process-step">
              <span className="process-icon"><LineIcon name="borrower" /></span>
              <div><h3>Isi profil keuangan</h3><p>Masukkan pendapatan, kewajiban bulanan, kondisi pekerjaan, dan rencana pinjaman.</p></div>
            </article>
            <article className="process-step">
              <span className="process-icon"><LineIcon name="score" /></span>
              <div><h3>Tinjau hasil simulasi</h3><p>Lihat estimasi cicilan, rasio DTI, kategori risiko, dan poin dari setiap faktor.</p></div>
            </article>
            <article className="process-step">
              <span className="process-icon"><LineIcon name="review" /></span>
              <div><h3>Pantau status pengajuan</h3><p>Setelah dikirim, peminjam dapat memeriksa status dan evaluator dapat meninjau pengajuan.</p></div>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section scoring-section" id="penilaian">
        <div className="landing-container scoring-layout">
          <div className="section-intro scoring-intro">
            <span className="landing-eyebrow">Metode penilaian</span>
            <h2>Ketahui cara skor dihitung</h2>
            <p>
              Skor dimulai dari 300, lalu poin dari enam faktor ditambahkan.
              Nilai akhirnya dibatasi sampai 850.
            </p>
            <div className="scoring-note">
              <span aria-hidden="true">i</span>
              Aturan ini dibuat untuk proyek akademik dan belum divalidasi untuk
              menilai pengajuan pinjaman nyata.
            </div>
          </div>
          <div className="tier-panel">
            <div className="tier-panel-heading">
              <div><span className="landing-eyebrow">Rentang skor</span><h3>Kategori hasil simulasi</h3></div>
              <span className="tier-scale-label">300 <i /> 850</span>
            </div>
            <div className="tier-list">
              {scoreTiers.map((tier) => (
                <div className="tier-row" key={tier.range}>
                  <span className={`tier-marker ${tier.className}`} />
                  <strong className="tier-range">{tier.range}</strong>
                  <span className="tier-label"><strong>{tier.label}</strong></span>
                </div>
              ))}
            </div>
            <p className="factor-list-label">Faktor yang masuk ke dalam perhitungan</p>
            <ul className="factor-list">
              <li>Rasio utang terhadap pendapatan</li>
              <li>Pendapatan bulanan</li>
              <li>Lama bekerja</li>
              <li>Riwayat kredit</li>
              <li>Jumlah pinjaman</li>
              <li>Tunggakan terbaru</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="landing-section audience-section">
        <div className="landing-container">
          <div className="section-intro audience-intro">
            <span className="landing-eyebrow">Peran pengguna</span>
            <h2>Fitur untuk peminjam dan evaluator</h2>
          </div>
          <div className="audience-grid">
            <article className="audience-card borrower-card">
              <div className="audience-icon"><LineIcon name="borrower" /></div>
              <span className="audience-label">Peminjam</span>
              <h3>Kenali kemampuan bayar Anda</h3>
              <p>
                Buat simulasi, pahami faktor yang memengaruhi skor, dan pantau
                status pengajuan dari dashboard pribadi.
              </p>
              <Link className="text-link" href="/login">Masuk atau daftar <span aria-hidden="true">→</span></Link>
            </article>
            <article className="audience-card evaluator-card">
              <div className="audience-icon"><LineIcon name="evaluator" /></div>
              <span className="audience-label">Evaluator</span>
              <h3>Tinjau profil dengan konteks</h3>
              <p>
                Tinjau profil, skor, DTI, dan faktor penilaian. Akses evaluator
                diaktifkan oleh administrator.
              </p>
              <p className="audience-access-note">Tidak tersedia melalui pendaftaran mandiri.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section faq-section" id="faq">
        <div className="landing-container faq-layout">
          <div className="section-intro">
            <span className="landing-eyebrow">Pertanyaan umum</span>
            <h2>Informasi sebelum Anda mulai</h2>
            <p>Ketahui batasan perhitungan dan pengelolaan akses.</p>
          </div>
          <div className="faq-list">
            <details>
              <summary>Apakah skor ini digunakan oleh bank atau biro kredit?</summary>
              <p>
                Tidak. Skor dihitung dari aturan simulasi di aplikasi ini dan
                tidak terhubung ke bank atau biro kredit.
              </p>
            </details>
            <details>
              <summary>Apakah hasilnya menjamin pinjaman disetujui?</summary>
              <p>
                Tidak. Hasilnya bukan persetujuan, penawaran, atau rekomendasi
                keuangan. Keputusan pinjaman nyata ditentukan oleh pemberi
                pinjaman melalui proses mereka sendiri.
              </p>
            </details>
            <details>
              <summary>Bagaimana cicilan dan DTI dihitung?</summary>
              <p>
                Estimasi cicilan memakai asumsi bunga tahunan 12% dengan
                angsuran bulanan tetap. DTI membandingkan kewajiban bulanan,
                termasuk estimasi cicilan, dengan pendapatan bulanan. Biaya lain
                tidak termasuk.
              </p>
            </details>
            <details>
              <summary>Siapa yang dapat melihat pengajuan saya?</summary>
              <p>
                Peminjam dapat melihat pengajuannya sendiri. Evaluator hanya
                mendapat akses setelah administrator mengaktifkan perannya.
              </p>
            </details>
            <details>
              <summary>Bagaimana data yang saya masukkan digunakan?</summary>
              <p>
                Pengajuan disimpan dalam database aplikasi agar hasil dan
                statusnya dapat ditampilkan. Untuk proyek akademik ini, gunakan
                data contoh dan hindari informasi keuangan atau identitas pribadi.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="landing-cta-section">
        <div className="landing-container landing-cta">
          <div>
            <span className="landing-eyebrow">Mulai menggunakan ZarPay</span>
            <h2>Lihat perhitungan simulasi Anda</h2>
            <p>Masuk ke akun atau daftar sebagai peminjam untuk mengisi profil keuangan.</p>
          </div>
          <Link className="button landing-cta-button" href="/login">
            Masuk atau daftar <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container footer-top">
          <div className="footer-brand">
            <Link className="brand-lockup" href="/">
              <BrandLogo />
            </Link>
            <p>Alat simulasi akademik untuk memahami skor dan risiko pinjaman.</p>
          </div>
          <div className="footer-links">
            <div><strong>Jelajahi</strong><a href="#fitur">Fitur</a><a href="#cara-kerja">Cara kerja</a><a href="#penilaian">Metode penilaian</a></div>
            <div><strong>Akun</strong><Link href="/login">Masuk atau daftar</Link><Link href="/dashboard">Dashboard</Link></div>
            <div><strong>Informasi</strong><a href="#faq">Pertanyaan umum</a><span>Simulasi akademik</span></div>
          </div>
        </div>
        <div className="landing-container footer-bottom">
          <span>© ZarPay</span>
          <span>Hasil simulasi bukan keputusan pinjaman.</span>
        </div>
      </footer>
    </main>
  );
}
