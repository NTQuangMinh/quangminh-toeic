import crypto from "crypto";
import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "toeic_token";
const AUTH_SECRET = process.env.AUTH_SECRET || "toeic-default-secret-salt-2026-key";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}

/**
 * Hash password securely with PBKDF2 + salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password against salt:hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) return false;
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(computedHash, "hex"), Buffer.from(originalHash, "hex"));
  } catch {
    return false;
  }
}

/**
 * Sign payload into token string
 */
export function signToken(user: SessionUser, expiresInHours = 24 * 30): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const payload = {
    ...user,
    exp,
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadBase64)
    .digest("base64url");
  return `${payloadBase64}.${signature}`;
}

/**
 * Verify and decode token string
 */
export function verifyToken(token: string): SessionUser | null {
  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(payloadBase64)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

/**
 * Get current session user from Next.js server cookie
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get(AUTH_COOKIE_NAME);
  if (!tokenCookie?.value) return null;
  return verifyToken(tokenCookie.value);
}

export { AUTH_COOKIE_NAME };
