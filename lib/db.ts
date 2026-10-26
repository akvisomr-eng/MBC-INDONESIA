import { neon } from "@neondatabase/serverless";

export function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  return neon(connectionString);
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}