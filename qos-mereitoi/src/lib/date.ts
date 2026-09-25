import { config } from "../data/config";

export function calendarCells(date: string): (number | null)[] {
  const [year, month] = date.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return [...Array<null>(offset).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
}

export function calendarDaysLeft(now: Date, eventDate = config.event.date, timeZone = config.event.timeZone) {
  const parts = new Intl.DateTimeFormat("en", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  const today = Date.UTC(Number(part("year")), Number(part("month")) - 1, Number(part("day")));
  return Math.round((Date.parse(`${eventDate}T00:00:00Z`) - today) / 86_400_000);
}

export function countdownParts(now: Date, date: string, time: string, offset: string) {
  const delta = Math.max(0, Date.parse(`${date}T${time}:00${offset}`) - now.getTime());
  const seconds = Math.floor(delta / 1000);
  return { delta, values: [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60] };
}
