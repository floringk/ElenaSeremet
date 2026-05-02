import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/server-env";

const COOKIE_NAME = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8;

function sign(value: string): string {
  return crypto.createHmac("sha256", serverEnv.adminSessionSecret).update(value).digest("hex");
}

function createToken(username: string): string {
  const payload = `${username}:${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string): boolean {
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;
  const expected = sign(payload);
  if (expected !== mac) return false;
  const [username, timestamp] = payload.split(":");
  if (username !== serverEnv.adminUser) return false;
  const ageMs = Date.now() - Number(timestamp);
  return Number.isFinite(ageMs) && ageMs < MAX_AGE_SECONDS * 1000;
}

export async function createAdminSession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, createToken(serverEnv.adminUser), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : false;
}
