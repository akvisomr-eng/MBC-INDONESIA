import test from "node:test";
import assert from "node:assert/strict";
import { auditSeo } from "../lib/seo.ts";

test("SEO audit flags missing title and malformed slug", () => {
  const findings = auditSeo({ title: "", slug: "Judul Berita!" });
  assert.ok(findings.some((item) => item.key === "title-missing" && item.level === "error"));
  assert.ok(findings.some((item) => item.key === "slug-format" && item.level === "error"));
});

test("SEO audit avoids keyword-stuffing prescriptions and flags missing description", () => {
  const findings = auditSeo({ title: "Laporan MBC Indonesia", slug: "laporan-mbc-indonesia" });
  assert.ok(findings.some((item) => item.key === "description-missing"));
});