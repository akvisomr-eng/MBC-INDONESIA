"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) {
        setError("Email atau kata sandi tidak valid, atau akun belum dapat digunakan.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Layanan autentikasi belum tersedia. Silakan hubungi administrator.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="email">Email redaksi</label>
      <input id="email" name="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="password">Kata sandi</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button type="submit" disabled={pending}>{pending ? "Memeriksa akses…" : "Masuk dengan aman"}</button>
    </form>
  );
}
