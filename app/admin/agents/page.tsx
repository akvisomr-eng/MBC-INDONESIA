import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import AgentsClient from "./AgentsClient";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?next=/admin/agents");
  if (!user.isAdmin) return <main className="auth-page"><section className="auth-card"><p className="eyebrow">AKSES TERBATAS</p><h1>Akses agen AI belum diberikan.</h1><p>Akun {user.email} belum memiliki hak administrator.</p><Link className="primary-link" href="/admin">Kembali ke dashboard <span>↗</span></Link></section></main>;
  return <AgentsClient />;
}