"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = mode === "sign-in"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name });
      if (result.error) {
        setError(result.error.message || "Autentikasi gagal. Periksa data lalu coba lagi.");
        return;
      }
      const nextPath = new URLSearchParams(window.location.search).get("next");
      router.replace(nextPath?.startsWith("/") ? nextPath : "/admin");
      router.refresh();
    } catch {
      setError("Layanan autentikasi belum tersedia. Periksa konfigurasi Neon Auth pada environment ini.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand" href="/"><span className="brand-mark">M</span><span>MBC <b>INDONESIA</b></span></Link>
        <p className="eyebrow">RUANG REDAKSI</p>
        <h1>{mode === "sign-in" ? "Selamat datang." : "Buat akun."}</h1>
        <p>Akses dashboard internal memerlukan akun yang diizinkan administrator.</p>
        <form className="auth-form" onSubmit={submit}>
          {mode === "sign-up" ? <label>Nama lengkap<input autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} /></label> : null}
          <label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Kata sandi<input type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error ? <p className="auth-error" role="alert">{error}</p> : null}
          <button type="submit" disabled={pending}>{pending ? "Memproses…" : mode === "sign-in" ? "Masuk ke ruang redaksi" : "Daftar akun"}</button>
        </form>
        <p className="auth-switch">{mode === "sign-in" ? "Belum punya akun?" : "Sudah punya akun?"}<button type="button" onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setError(""); }}>{mode === "sign-in" ? "Buat akun" : "Masuk"}</button></p>
        <p className="admin-note">Pendaftaran akun tidak otomatis memberikan hak akses admin. Akses internal dikendalikan oleh allowlist admin.</p>
      </section>
    </main>
  );
}