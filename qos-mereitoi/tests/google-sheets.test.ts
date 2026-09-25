import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, verify } from "node:crypto";
import { appendRSVP, sheetsConfigured } from "../src/lib/google-sheets";

test("Сервисный аккаунт: RS256, RAW, четыре столбца, все статусы; ошибка не становится успехом", async () => {
  const originalFetch = globalThis.fetch;
  const keys = ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_PRIVATE_KEY", "GOOGLE_SHEET_ID", "GOOGLE_SHEET_NAME"];
  const before = keys.map(key => process.env[key]);
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "test@example.iam.gserviceaccount.com";
  process.env.GOOGLE_PRIVATE_KEY = privateKey.export({ type: "pkcs8", format: "pem" }).toString().replace(/\n/g, "\\n");
  process.env.GOOGLE_SHEET_ID = "unit-test-id";
  process.env.GOOGLE_SHEET_NAME = "Guests' replies";
  const rows: unknown[][] = [];
  let rejected = false;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.includes("oauth2.googleapis.com")) {
      const jwt = new URLSearchParams(String(init?.body)).get("assertion")!;
      const [head, body, signature] = jwt.split(".");
      assert.equal(verify("RSA-SHA256", Buffer.from(`${head}.${body}`), publicKey, Buffer.from(signature, "base64url")), true);
      assert.equal(JSON.parse(Buffer.from(body, "base64url").toString()).scope, "https://www.googleapis.com/auth/spreadsheets");
      return Response.json({ access_token: "test-token", expires_in: 3600 });
    }
    assert.ok(url.includes("valueInputOption=RAW"));
    assert.ok(decodeURIComponent(url).includes("'Guests'' replies'!A:D"));
    assert.equal((init?.headers as Record<string, string>).Authorization, "Bearer test-token");
    rows.push(JSON.parse(String(init?.body)).values[0]);
    return rejected ? Response.json({ error: "test" }, { status: 500 }) : Response.json({ updates: { updatedRows: 1, updatedCells: 4 } });
  };
  try {
    assert.equal(sheetsConfigured(), true);
    for (const [attendance, guests] of [["yes", 1], ["couple", 2], ["no", 0]] as const) await appendRSVP({ name: "=Қонақ", attendance, guests });
    assert.equal(rows.length, 3);
    assert.deepEqual(rows.map(row => row[3]), [1, 2, 0]);
    assert.equal(rows[0][1], "=Қонақ");
    assert.equal(rows[0].length, 4);
    rejected = true;
    await assert.rejects(appendRSVP({ name: "Қонақ", attendance: "yes", guests: 1 }));
  } finally {
    globalThis.fetch = originalFetch;
    keys.forEach((key, i) => { if (before[i] === undefined) delete process.env[key]; else process.env[key] = before[i]; });
  }
});
