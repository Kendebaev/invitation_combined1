import test from "node:test";
import assert from "node:assert/strict";
import { calendarCells, calendarDaysLeft, countdownParts } from "../src/lib/date";
import { validateRSVP } from "../src/lib/rsvp";

test("Декабрь 2026: понедельник первый; 26 декабря — суббота", () => {
  const days = calendarCells("2026-12-26");
  assert.equal(days[0], null); assert.equal(days[1], 1);
  assert.equal(days.indexOf(26) % 7, 5); assert.equal(days.filter(Boolean).length, 31);
});
test("Календарные дни меняются в полночь UTC+05, не в UTC", () => {
  assert.equal(calendarDaysLeft(new Date("2026-12-25T18:59:59Z")), 1);
  assert.equal(calendarDaysLeft(new Date("2026-12-25T19:00:00Z")), 0);
  assert.equal(calendarDaysLeft(new Date("2026-12-26T19:00:00Z")), -1);
});
test("Известное время использует смещение +05:00 и не уходит в минус", () => {
  assert.deepEqual(countdownParts(new Date("2026-12-26T12:00:00Z"), "2026-12-26", "18:00", "+05:00").values, [0, 1, 0, 0]);
  assert.deepEqual(countdownParts(new Date("2026-12-26T14:00:00Z"), "2026-12-26", "18:00", "+05:00").values, [0, 0, 0, 0]);
});
test("Все три варианта RSVP и казахское имя проходят проверку", () => {
  for (const [attendance, guests] of [["yes", 1], ["couple", 2], ["no", 0]]) assert.equal(validateRSVP({ name: "Әлия Құрман", attendance, guests }).ok, true);
});
test("Сервер отвергает пустое имя, неверный статус, дробные и несогласованные числа", () => {
  const base = { name: "Қонақ", attendance: "yes", guests: 1 };
  for (const change of [{ name: "  " }, { attendance: "maybe" }, { guests: 1.5 }, { guests: 11 }, { guests: "2" }, { attendance: "couple", guests: 1 }, { attendance: "no", guests: 1 }, { name: "а".repeat(161) }]) assert.equal(validateRSVP({ ...base, ...change }).ok, false);
});
