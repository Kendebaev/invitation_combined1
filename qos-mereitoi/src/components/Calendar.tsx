"use client";
import { motion, useReducedMotion } from "framer-motion";
import { config } from "@/data/config";
import { calendarCells } from "@/lib/date";
import { Countdown } from "./Countdown";
import { Reveal } from "./Reveal";
import { Ornament } from "./Ornament";

export function Calendar() {
  const reduced = useReducedMotion();
  const cells = calendarCells(config.event.date);
  const selected = Number(config.event.date.slice(8));

  return (
    <section className="section date-section" aria-labelledby="date-title">
      <Reveal>
        <p className="eyebrow">{config.calendar.eyebrow}</p>
        <h2 id="date-title">{config.calendar.title}</h2>
        <p className="large-date">{config.event.dateLabel}</p>
        {config.event.startTime && (
          <div className="start-time-badge">
            <span className="start-time-line" aria-hidden="true" />
            <span className="start-time-text">
              {config.calendar.beginning} {config.event.startTime}
            </span>
            <span className="start-time-line" aria-hidden="true" />
          </div>
        )}
        <p className="calendar-year">{config.event.date.slice(0, 4)}</p>
      </Reveal>
      <Reveal className="calendar">
        <div
          className="calendar-grid"
          role="list"
          aria-label={`${config.event.dateLabel}, ${config.event.date.slice(0, 4)}`}
        >
          {config.calendar.weekdays.map(d => (
            <span className="weekday" key={d} aria-hidden="true">
              {d}
            </span>
          ))}
          {cells.map((d, i) => (
            <span
              key={i}
              className={`calendar-day ${d === selected ? "selected-day" : ""}`}
              role={d ? "listitem" : undefined}
              aria-label={d === selected ? `${d} — ${config.calendar.marked}` : undefined}
            >
              {d === selected && (
                <svg viewBox="0 0 52 48" fill="none" aria-hidden="true">
                  <motion.path
                    d="M26 44C18 38 3 29 3 16C3 2 19-1 26 10C34-1 49 2 49 16C49 29 33 38 26 44Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    initial={reduced ? false : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                  />
                </svg>
              )}
              {d}
            </span>
          ))}
        </div>
      </Reveal>
      <Reveal>
        <Countdown />
        <Ornament />
      </Reveal>
    </section>
  );
}
