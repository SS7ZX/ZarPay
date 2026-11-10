import Link from "next/link";
import type { ReactNode } from "react";

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
    title: "Skor yang bisa dijelaskan",
    description:
      "Lihat skor 300–850 beserta kontribusi setiap faktor. Tidak ada angka misterius tanpa konteks.",
  },
  {
    icon: "chart" as const,
    title: "DTI dengan cicilan baru",
    description:
      "Bandingkan kewajiban saat ini dengan pendapatan setelah estimasi cicilan pinjaman ikut dihitung.",
  },
  {
    icon: "review" as const,
    title: "Alur evaluasi terstruktur",
    description:
      "Evaluator meninjau profil, faktor risiko, dan status pengajuan pada satu dashboard.",
  },
  {
    icon: "shield" as const,
    title: "Akses berbasis peran",
    description:
      "Peminjam hanya melihat pengajuannya sendiri. Akses evaluator diberikan oleh administrator.",
  },
];

const scoreTiers = [
  { range: "740–850", label: "Risiko rendah", detail: "Profil simulasi relatif kuat", className: "tier-low" },
  { range: "670–739", label: "Risiko moderat", detail: "Tinjau faktor pembentuk skor", className: "tier-moderate" },
  { range: "580–669", label: "Perlu perhatian", detail: "Ada faktor yang perlu dievaluasi", className: "tier-elevated" },
  { range: "300–579", label: "Risiko tinggi", detail: "Simulasi menunjukkan tekanan risiko", className: "tier-high" },
];

export function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Link className="brand-lockup" href="/" aria-label="ZarPay beranda">
            <span className="brand-mark">Z</span>
            <span>ZarPay</span>
          </Link>
          <nav className="landing-nav-links" aria-label="Navigasi landing page">
            <a href="#fitur">Fitur</a>
            <a href="#cara-kerja">Cara kerja</a>
            <a href="#penilaian">Skala penilaian</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="landing-nav-actions">
            <Link className="landing-login-link" href="/login">Masuk</Link>
            <Link className="button button-primary landing-nav-cta" href="/login">
              Mulai simulasi <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-container hero-grid">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="hero-kicker-dot" />
              PLATFORM SIMULASI PENILAIAN KREDIT
            </div>
            <h1>
              Kenali risiko.
              <br />
              <span>Pahami keputusan.</span>
            </h1>
            <p className="hero-description">
              ZarPay membantu peminjam dan evaluator memahami kemampuan bayar
              melalui skor kredit yang transparan, rasio DTI, dan faktor risiko
              yang mudah ditelusuri.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary hero-primary-cta" href="/login">
                Mulai simulasi <span aria-hidden="true">→</span>
              </Link>
              <a className="hero-secondary-cta" href="#cara-kerja">
                Pelajari cara kerja <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero-footnote">
              <span className="hero-footnote-icon" aria-hidden="true">i</span>
              Simulasi akademik — bukan keputusan pinjaman aktual.
            </div>
          </div>

          <div className="hero-art" aria-label="Pratinjau dashboard penilaian ZarPay">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
            <div className="hero-art-dot dot-one" />
            <div className="hero-art-dot dot-two" />
            <div className="preview-window">
              <div className="preview-window-top">
                <div className="preview-brand">
                  <span className="preview-brand-mark">Z</span>
                  <span>Ringkasan risiko</span>
                </div>
                <span className="preview-sample-tag">CONTOH SIMULASI</span>
              </div>
              <div className="preview-person">
                <span className="preview-person-avatar">AR</span>
                <span><strong>Profil peminjam</strong><small>Contoh data, bukan pengguna nyata</small></span>
                <span className="preview-status">Menunggu tinjauan</span>
              </div>
              <div className="preview-score-card">
                <div className="preview-score-copy">
                  <span>SKOR KREDIT</span>
                  <strong>742</strong>
                  <small>Rentang simulasi 300–850</small>
                  <span className="preview-risk">Risiko rendah</span>
                </div>
                <div className="preview-gauge" aria-hidden="true">
                  <div className="preview-gauge-inner">
                    <strong>742</strong><span>SKOR</span>
                  </div>
                </div>
              </div>
              <div className="preview-dti">
                <div className="preview-dti-heading">
                  <span>Debt-to-Income (DTI)</span>
                  <strong>28,4%</strong>
                </div>
                <div className="preview-dti-track"><span /></div>
                <small>Estimasi setelah cicilan pinjaman baru</small>
              </div>
              <div className="preview-factors">
                <div><span className="factor-indicator factor-positive">+</span><span>Riwayat kredit</span><strong>Baik</strong></div>
                <div><span className="factor-indicator factor-neutral">↗</span><span>Rasio utang</span><strong>Terukur</strong></div>
              </div>
            </div>
            <div className="floating-insight">
              <span className="floating-insight-icon"><LineIcon name="chart" /></span>
              <span><strong>Faktor transparan</strong><small>Setiap skor punya penjelasan</small></span>
              <span className="floating-arrow" aria-hidden="true">↗</span>
            </div>
            <span className="hero-art-caption">DASHBOARD · PRATINJAU VISUAL</span>
          </div>
        </div>
      </section>

      <section className="landing-proof-strip" aria-label="Kapabilitas ZarPay">
        <div className="landing-container proof-grid">
          <div><strong>300–850</strong><span>rentang skor kredit</span></div>
          <div><strong>DTI</strong><span>kemampuan bayar terukur</span></div>
          <div><strong>6 faktor</strong><span>pembentuk skor dijelaskan</span></div>
          <div><strong>2 peran</strong><span>peminjam & evaluator</span></div>
        </div>
      </section>

      <section className="landing-section feature-section" id="fitur">
        <div className="landing-container">
          <div className="section-intro">
            <span className="landing-eyebrow">DIBANGUN UNTUK KEJELASAN</span>
            <h2>Penilaian risiko yang mudah dipahami</h2>
            <p>
              Informasi pinjaman diringkas menjadi sinyal yang relevan, bukan
              sekadar angka yang sulit ditafsirkan.
            </p>
          </div>
          <div className="feature-grid">
            {features.map((feature, index) => (
              <article className="feature-card" key={feature.title}>
                <div className={`feature-icon feature-icon-${index + 1}`}>
                  <LineIcon name={feature.icon} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="feature-index">0{index + 1}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section process-section" id="cara-kerja">
        <div className="landing-container process-layout">
          <div className="section-intro process-intro">
            <span className="landing-eyebrow">ALUR YANG SEDERHANA</span>
            <h2>Dari profil ke penilaian, dalam tiga langkah</h2>
            <p>
              Isi profil simulasi, pahami hasilnya, lalu tinjau status pengajuan
              secara terstruktur.
            </p>
            <Link className="text-link" href="/login">
              Buat akun untuk memulai <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="process-steps">
            <article className="process-step">
              <span className="process-number">01</span>
              <div><h3>Lengkapi profil keuangan</h3><p>Masukkan pendapatan, kewajiban, kondisi pekerjaan, dan rencana pinjaman.</p></div>
            </article>
            <article className="process-step">
              <span className="process-number">02</span>
              <div><h3>Pahami skor dan DTI</h3><p>Lihat estimasi cicilan, rasio utang pascapinjaman, kategori risiko, dan faktor pembentuk skor.</p></div>
            </article>
            <article className="process-step">
              <span className="process-number">03</span>
              <div><h3>Pantau tinjauan</h3><p>Peminjam melihat statusnya; evaluator meninjau pengajuan sesuai akses peran.</p></div>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section scoring-section" id="penilaian">
        <div className="landing-container scoring-layout">
          <div className="section-intro scoring-intro">
            <span className="landing-eyebrow">PENILAIAN TERBUKA</span>
            <h2>Skor punya konteks. Risiko punya alasan.</h2>
            <p>
              Simulasi skor berada pada rentang 300 sampai 850. Hasil
              dikelompokkan agar lebih mudah dibaca, bukan untuk menggantikan
              pemeriksaan kredit profesional.
            </p>
            <div className="scoring-note">
              <span aria-hidden="true">i</span>
              Model saat ini menggunakan aturan contoh dan asumsi bunga 12% per
              tahun untuk menghitung cicilan.
            </div>
          </div>
          <div className="tier-panel">
            <div className="tier-panel-heading">
              <div><span className="landing-eyebrow">KATEGORI SIMULASI</span><h3>Skala skor ZarPay</h3></div>
              <span className="tier-scale-label">300 <i /> 850</span>
            </div>
            <div className="tier-list">
              {scoreTiers.map((tier) => (
                <div className="tier-row" key={tier.range}>
                  <span className={`tier-marker ${tier.className}`} />
                  <strong className="tier-range">{tier.range}</strong>
                  <span className="tier-label"><strong>{tier.label}</strong><small>{tier.detail}</small></span>
                  <span className={`tier-mini-pill ${tier.className}`}>Skor</span>
                </div>
              ))}
            </div>
            <div className="factor-chips">
              <span>DTI pascapinjaman</span><span>Pendapatan</span><span>Stabilitas kerja</span>
              <span>Riwayat kredit</span><span>Beban pinjaman</span><span>Tunggakan terbaru</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section audience-section">
        <div className="landing-container">
          <div className="section-intro audience-intro">
            <span className="landing-eyebrow">SATU PLATFORM, DUA PERSPEKTIF</span>
            <h2>Dirancang untuk peminjam dan evaluator</h2>
          </div>
          <div className="audience-grid">
            <article className="audience-card borrower-card">
              <div className="audience-icon"><LineIcon name="borrower" /></div>
              <span className="audience-label">UNTUK PEMINJAM</span>
              <h3>Kenali kemampuan bayar Anda</h3>
              <p>
                Buat simulasi, pahami faktor yang memengaruhi skor, dan pantau
                status pengajuan dari dashboard pribadi.
              </p>
              <Link className="text-link" href="/login">Mulai sebagai peminjam <span aria-hidden="true">→</span></Link>
            </article>
            <article className="audience-card evaluator-card">
              <div className="audience-icon"><LineIcon name="evaluator" /></div>
              <span className="audience-label">UNTUK EVALUATOR</span>
              <h3>Tinjau profil dengan konteks</h3>
              <p>
                Telusuri skor, DTI, serta faktor risiko dan catat status
                evaluasi pada pengajuan yang dapat Anda akses.
              </p>
              <Link className="text-link" href="/login">Masuk sebagai evaluator <span aria-hidden="true">→</span></Link>
            </article>
          </div>
          <p className="role-footnote">
            Akun baru terdaftar sebagai peminjam. Peran evaluator hanya dapat
            diatur oleh administrator project.
          </p>
        </div>
      </section>

      <section className="landing-section faq-section" id="faq">
        <div className="landing-container faq-layout">
          <div className="section-intro">
            <span className="landing-eyebrow">PERTANYAAN UMUM</span>
            <h2>Hal yang perlu diketahui</h2>
            <p>Transparansi juga berarti menjelaskan batasan simulasi.</p>
          </div>
          <div className="faq-list">
            <details>
              <summary>Apakah skor ZarPay adalah skor kredit resmi?</summary>
              <p>
                Bukan. Skor dihitung dari aturan simulasi akademik yang
                transparan dan tidak terhubung ke biro kredit atau lembaga
                keuangan.
              </p>
            </details>
            <details>
              <summary>Apakah hasil simulasi menjamin pinjaman disetujui?</summary>
              <p>
                Tidak. Hasil bukan persetujuan, penawaran, atau rekomendasi
                finansial. Keputusan nyata memerlukan pemeriksaan dan kebijakan
                lembaga pemberi pinjaman.
              </p>
            </details>
            <details>
              <summary>Bagaimana estimasi cicilan dan DTI dihitung?</summary>
              <p>
                Cicilan menggunakan rumus angsuran bulanan tetap dengan asumsi
                bunga 12% per tahun. DTI menghitung kewajiban bulanan saat ini
                ditambah estimasi cicilan baru, dibagi pendapatan bulanan.
              </p>
            </details>
            <details>
              <summary>Siapa yang dapat melihat pengajuan saya?</summary>
              <p>
                Peminjam hanya dapat membaca pengajuannya sendiri. Evaluator
                dapat meninjau data sesuai peran yang diberikan administrator,
                dengan pembatasan akses di aplikasi dan database.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="landing-cta-section">
        <div className="landing-container landing-cta">
          <div>
            <span className="landing-eyebrow">MULAI DENGAN INFORMASI YANG JELAS</span>
            <h2>Siap memahami profil risiko Anda?</h2>
            <p>Buat akun untuk memulai simulasi dan melihat hasil yang dapat dijelaskan.</p>
          </div>
          <Link className="button landing-cta-button" href="/login">
            Mulai simulasi <span aria-hidden="true">→</span>
          </Link>
          <div className="cta-decoration" aria-hidden="true">Z</div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container footer-top">
          <div className="footer-brand">
            <Link className="brand-lockup" href="/">
              <span className="brand-mark">Z</span><span>ZarPay</span>
            </Link>
            <p>Simulasi penilaian kredit yang transparan untuk pembelajaran risiko pinjaman.</p>
          </div>
          <div className="footer-links">
            <div><strong>Jelajahi</strong><a href="#fitur">Fitur</a><a href="#cara-kerja">Cara kerja</a><a href="#penilaian">Skala penilaian</a></div>
            <div><strong>Akun</strong><Link href="/login">Masuk / daftar</Link><Link href="/dashboard">Dashboard</Link></div>
            <div><strong>Catatan</strong><a href="#faq">Pertanyaan umum</a><span>Proyek akademik</span></div>
          </div>
        </div>
        <div className="landing-container footer-bottom">
          <span>© ZarPay</span>
          <span>Hasil merupakan simulasi, bukan keputusan kredit aktual.</span>
        </div>
      </footer>
    </main>
  );
}
