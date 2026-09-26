import { config, type Attendance } from "../data/config";

export type RSVP = { name: string; attendance: Attendance; guests: number };
export type RSVPField = keyof RSVP;
export type Validation = { ok: true; data: RSVP } | { ok: false; field: RSVPField; message: string };

export function validateRSVP(input: unknown): Validation {
  const f = config.rsvp;
  const obj = (input && typeof input === "object" && !Array.isArray(input) ? input : {}) as Record<string, unknown>;
  if (typeof obj.name !== "string" || !obj.name.trim()) return { ok: false, field: "name", message: f.errors.name };
  const name = obj.name.trim();
  if (name.length > f.maxNameLength) return { ok: false, field: "name", message: f.errors.nameLength };
  if (!["yes", "couple", "no"].includes(String(obj.attendance))) return { ok: false, field: "attendance", message: f.errors.attendance };
  const attendance = obj.attendance as Attendance;
  const min = attendance === "couple" ? 2 : attendance === "no" ? 0 : 1;
  if (typeof obj.guests !== "number" || !Number.isInteger(obj.guests) || obj.guests < min || obj.guests > f.maxGuests || (attendance === "no" && obj.guests !== 0)) {
    return { ok: false, field: "guests", message: f.errors.guests };
  }
  return { ok: true, data: { name, attendance, guests: obj.guests } };
}
