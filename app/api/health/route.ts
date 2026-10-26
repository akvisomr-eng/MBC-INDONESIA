import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const pool = getPool();
  if (!pool) {
    return NextResponse.json(
      { status: "degraded", checks: { application: "ok", database: "not_configured" } },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    await pool.query("SELECT 1");
    return NextResponse.json(
      { status: "ok", checks: { application: "ok", database: "ok" }, timestamp: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { status: "degraded", checks: { application: "ok", database: "unavailable" } },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
