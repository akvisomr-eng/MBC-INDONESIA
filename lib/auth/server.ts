import { createNeonAuth } from "@neondatabase/auth/next/server";

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

export const auth = baseUrl && cookieSecret && cookieSecret.length >= 32
  ? createNeonAuth({ baseUrl, cookies: { secret: cookieSecret } })
  : null;

export async function getCurrentUser() {
  if (!auth) return null;
  try {
    const { data, error } = await auth.getSession();
    if (error || !data?.user?.email) return null;
    const allowedEmails = (process.env.MBC_ADMIN_EMAILS || "")
      .split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
    const email = data.user.email.toLowerCase();
    return {
      email: data.user.email,
      name: data.user.name || data.user.email,
      isAdmin: allowedEmails.includes(email)
    };
  } catch {
    return null;
  }
}