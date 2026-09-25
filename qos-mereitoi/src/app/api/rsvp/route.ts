import { NextRequest, NextResponse } from "next/server";
import { config } from "@/data/config";
import { validateRSVP } from "@/lib/rsvp";
import { appendRSVP, sheetsConfigured } from "@/lib/google-sheets";
export const runtime = "nodejs";
export const maxDuration = 30;

function fail(status: number, message: string) {
  return NextResponse.json({ ok: false, message }, { status, headers: { "Cache-Control": "no-store" } });
}

function isValidOrigin(origin: string | null, request: NextRequest) {
  if (!origin) return true;
  if (origin === request.nextUrl.origin) return true;
  try {
    const originUrl = new URL(origin);
    const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host");
    if (hostHeader) {
      if (originUrl.host === hostHeader) return true;
      const originHostname = originUrl.hostname;
      const hostHostname = hostHeader.split(":")[0];
      const localHosts = ["localhost", "127.0.0.1", "0.0.0.0"];
      if (localHosts.includes(originHostname) && localHosts.includes(hostHostname)) return true;
    }
  } catch {
    return false;
  }
  return false;
}

export async function POST(request: NextRequest) {
  const error = config.rsvp.errors;
  const origin = request.headers.get("origin");
  if (!isValidOrigin(origin, request)) return fail(403, error.failed);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return fail(415, error.failed);
  // Ограничиваем фактически прочитанное тело, включая запросы без Content-Length.
  const limit = 16384;
  if (Number(request.headers.get("content-length") || 0) > limit) return fail(413, error.failed);
  let input: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return fail(400, error.failed);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); return fail(413, error.failed); }
      chunks.push(value);
    }
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch { return fail(400, error.failed); }
  const result = validateRSVP(input);
  if (!result.ok) return fail(400, result.message);
  if (!sheetsConfigured()) return fail(503, error.unavailable);
  try {
    await appendRSVP(result.data);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // Не выводим ключи, ответы Google и персональные данные в публичный ответ или логи.
    return fail(502, error.failed);
  }
}
