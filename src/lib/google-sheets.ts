import { createSign } from "node:crypto";
import { config } from "../data/config";
import type { RSVP } from "./rsvp";

// Этот модуль импортируется исключительно серверным route.ts.
// Авторизация сервисного аккаунта через подписанный RS256 JWT (без SDK).
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
let cachedToken: { value: string; expiresAt: number; email: string } | null = null;

export function sheetsConfigured() {
  return ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_PRIVATE_KEY", "GOOGLE_SHEET_ID", "GOOGLE_SHEET_NAME"].every(key => Boolean(process.env[key]?.trim()));
}

async function getAccessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!.trim();
  if (cachedToken && cachedToken.email === email && cachedToken.expiresAt > Date.now() + 60000) return cachedToken.value;
  const now = Math.floor(Date.now() / 1000);
  const encode = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const claims = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 })}`;
  const key = process.env.GOOGLE_PRIVATE_KEY!.trim().replace(/^"|"$/g, "").replace(/\\n/g, "\n");
  const signature = createSign("RSA-SHA256").update(claims).end().sign(key, "base64url");
  const response = await fetch(TOKEN_URL, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${claims}.${signature}` }),
    signal: AbortSignal.timeout(8000), cache: "no-store",
  });
  if (!response.ok) throw new Error("Google authentication failed");
  const data = await response.json();
  if (typeof data.access_token !== "string" || !data.access_token) throw new Error("Google authentication response invalid");
  cachedToken = { value: data.access_token, email, expiresAt: Date.now() + Math.min(Number(data.expires_in) || 3600, 3600) * 1000 };
  return cachedToken.value;
}

export async function appendRSVP(data: RSVP) {
  const token = await getAccessToken();
  const sheetId = process.env.GOOGLE_SHEET_ID!.trim();
  const sheetName = process.env.GOOGLE_SHEET_NAME!.trim().replace(/'/g, "''");
  const range = `'${sheetName}'!A:D`;
  // Официальный REST-метод spreadsheets.values.append. RAW исключает формулы из строк гостей.
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const status = config.rsvp.options.find(option => option.value === data.attendance)!.label;
  const receivedAt = new Intl.DateTimeFormat("sv-SE", { timeZone: config.event.timeZone, dateStyle: "short", timeStyle: "medium" }).format(new Date()) + ` UTC${config.event.utcOffset}`;
  let response = await fetch(url, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ majorDimension: "ROWS", values: [[receivedAt, data.name, status, data.guests]] }),
    signal: AbortSignal.timeout(12000), cache: "no-store",
  });
  if (!response.ok && response.status === 400) {
    // Если имя вкладки отличается от ожидаемого, пробуем автоопределение имени первой вкладки
    try {
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}?fields=sheets(properties(title))`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(6000), cache: "no-store",
      });
      if (metaRes.ok) {
        const meta = await metaRes.json();
        const firstTitle = meta.sheets?.[0]?.properties?.title;
        if (firstTitle && firstTitle !== sheetName) {
          const fallbackRange = `'${firstTitle.replace(/'/g, "''")}'!A:D`;
          const fallbackUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(fallbackRange)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
          response = await fetch(fallbackUrl, {
            method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ majorDimension: "ROWS", values: [[receivedAt, data.name, status, data.guests]] }),
            signal: AbortSignal.timeout(12000), cache: "no-store",
          });
        }
      }
    } catch { /* игнорируем ошибку чтения метаданных */ }
  }
  if (!response.ok) { if (response.status === 401) cachedToken = null; throw new Error("Google Sheets append failed"); }
  const result = await response.json();
  if (result.updates?.updatedRows !== 1 || result.updates?.updatedCells !== 4) throw new Error("Google Sheets did not confirm the row");
}
