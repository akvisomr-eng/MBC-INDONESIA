import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unavailable = () => Response.json(
  { error: "Autentikasi belum dikonfigurasi untuk environment ini." },
  { status: 503, headers: { "Cache-Control": "no-store" } }
);

const handler = auth?.handler();
export const GET = handler?.GET ?? unavailable;
export const POST = handler?.POST ?? unavailable;
export const PUT = handler?.PUT ?? unavailable;
export const PATCH = handler?.PATCH ?? unavailable;
export const DELETE = handler?.DELETE ?? unavailable;