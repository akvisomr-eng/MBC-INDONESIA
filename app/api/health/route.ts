import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getSql();
  if (!sql) {
    return NextResponse.json(
      { status: "degraded", service: "mbc-indonesia", checks: { application: "ok", database: "not_configured" }, timestamp: new Date().toISOString() },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
  try {
    await sql`SELECT 1 AS health_check`;
    return NextResponse.json(
      { status: "ok", service: "mbc-indonesia", checks: { application: "ok", database: "ok" }, timestamp: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { status: "degraded", service: "mbc-indonesia", checks: { application: "ok", database: "unavailable" }, timestamp: new Date().toISOString() },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}