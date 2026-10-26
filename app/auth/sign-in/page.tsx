import type { Metadata } from "next";
import Link from "next/link";
import SignInForm from "./sign-in-form";

export const metadata: Metadata = {
  title: "Masuk Redaksi",
  robots: { index: false, follow: false }
};

export default function SignInPage() {
  return (
    <main className="auth-page" id="konten">
      <section className="auth-card">
        <Link href="/" className="auth-brand"><span>MBC</span><small>INDONESIA</small></Link>
        <p className="eyebrow">AKSES INTERNAL</p>
        <h1>Masuk ke ruang redaksi</h1>
        <p className="auth-intro">Gunakan akun redaksi yang telah didaftarkan administrator. Pendaftaran publik tidak tersedia.</p>
        <SignInForm />
        <p className="auth-back"><Link href="/">← Kembali ke portal berita</Link></p>
      </section>
    </main>
  );
}
