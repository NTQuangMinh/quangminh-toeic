import crypto from "crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "toeic_token";
export const GUEST_COOKIE_NAME = "toeic_guest_id";

function getAuthSecret(): string {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }
  if (process.env.NODE_ENV === "production") {
    console.warn("⚠️ [SECURITY WARNING] AUTH_SECRET is not configured in environment. Using fallback secret.");
  }
  return "toeic-production-hardened-secret-key-2026-v2-salt";
}

const AUTH_SECRET = getAuthSecret();

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  isGuest?: boolean;
}

/**
 * Safe timing buffer comparison to prevent timing attacks and RangeError
 */
export function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
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
    return safeCompare(computedHash, originalHash);
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

    if (!safeCompare(signature, expectedSignature)) {
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
      isGuest: Boolean(payload.isGuest),
    };
  } catch {
    return null;
  }
}

/**
 * Get current session user from Next.js server cookie
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get(AUTH_COOKIE_NAME);
    if (tokenCookie?.value) {
      const verified = verifyToken(tokenCookie.value);
      if (verified) return verified;
    }

    // Check for isolated guest cookie
    const guestCookie = cookieStore.get(GUEST_COOKIE_NAME);
    if (guestCookie?.value) {
      return {
        id: guestCookie.value,
        email: "guest@toeic.local",
        name: "Học viên Khách",
        role: "USER",
        isGuest: true,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get effective userId for database actions:
 * Returns authenticated user ID, or isolated guest cookie ID, or deterministic fallback
 */
export async function getEffectiveUserId(): Promise<{ userId: string; isGuest: boolean }> {
  const session = await getSessionUser();
  if (session && !session.isGuest) {
    return { userId: session.id, isGuest: false };
  }
  if (session?.isGuest) {
    return { userId: session.id, isGuest: true };
  }
  // Try reading guest cookie directly
  try {
    const cookieStore = cookies();
    const guestCookie = cookieStore.get(GUEST_COOKIE_NAME);
    if (guestCookie?.value) {
      return { userId: guestCookie.value, isGuest: true };
    }
  } catch {}

  return { userId: "usr_demo_vietnam_001", isGuest: true };
}

/**
 * Sign quiz question verification token (Anti-Cheating)
 * Encrypts wordId, correctIndex and explanation so client cannot inspect or tamper.
 */
export function signQuizQuestionToken(data: {
  wordId: string;
  correctIndex: number;
  explanation: string;
}): string {
  const payload = JSON.stringify(data);
  const payloadB64 = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${signature}`;
}

export function verifyQuizQuestionToken(token: string): {
  wordId: string;
  correctIndex: number;
  explanation: string;
} | null {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;
    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(payloadB64)
      .digest("base64url");
    if (!safeCompare(signature, expectedSignature)) return null;
    return JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
