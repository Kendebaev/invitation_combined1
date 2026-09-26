import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../src/app/api/rsvp/route";
import { generateKeyPairSync } from "node:crypto";

const guest = { name: "Әлия Құрман", attendance: "yes", guests: 1 };
function request(body: unknown, origin = "https://invitation.example") {
  return new NextRequest("https://invitation.example/api/rsvp", { method: "POST", headers: { "Content-Type": "application/json", origin }, body: JSON.stringify(body) });
}
test("API: ошибочные запросы отклоняются, без ключей — 503", async () => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  try {
    assert.equal((await POST(request(guest))).status, 503);
    assert.equal((await POST(request({ ...guest, name: "" }))).status, 400);
    assert.equal((await POST(request(guest, "https://another.example"))).status, 403);
    assert.equal((await POST(request({ ...guest, name: "а".repeat(20000) }))).status, 413);
  } finally { if (email) process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = email; }
});
test("API: успех только после ответа Google; неподтверждённая запись — 502", async () => {
  const originalFetch = globalThis.fetch;
  const keys = ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_PRIVATE_KEY", "GOOGLE_SHEET_ID", "GOOGLE_SHEET_NAME"];
  const before = keys.map(key => process.env[key]);
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "api-test@example.iam.gserviceaccount.com";
  process.env.GOOGLE_PRIVATE_KEY = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  process.env.GOOGLE_SHEET_ID = "unit-test"; process.env.GOOGLE_SHEET_NAME = "RSVP";
  let confirmed = true;
  globalThis.fetch = async input => String(input).includes("oauth2.googleapis.com")
    ? Response.json({ access_token: "test", expires_in: 3600 })
    : Response.json({ updates: { updatedRows: confirmed ? 1 : 0, updatedCells: confirmed ? 4 : 0 } });
  try {
    for (const [attendance, guests] of [["yes", 1], ["couple", 2], ["no", 0]]) {
      const response = await POST(request({ ...guest, attendance, guests }));
      assert.equal(response.status, 200); assert.deepEqual(await response.json(), { ok: true });
    }
    confirmed = false;
    assert.equal((await POST(request(guest))).status, 502);
  } finally {
    globalThis.fetch = originalFetch;
    keys.forEach((key, i) => { if (before[i] === undefined) delete process.env[key]; else process.env[key] = before[i]; });
  }
});
