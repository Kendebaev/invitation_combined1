"use client";
import { useEffect, useState } from "react";
import { config } from "@/data/config";
import { countdownParts } from "@/lib/date";

export function Countdown() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!mounted || !now) {
    return <div className="countdown-placeholder" aria-hidden="true" />;
  }

  const c = config.calendar;
  const { delta, values } = countdownParts(
    now,
    config.event.date,
    config.event.startTime || "18:00",
    config.event.utcOffset
  );

  if (delta === 0) {
    return <p className="countdown-message">{c.started}</p>;
  }

  return (
    <div className="countdown">
      <p className="countdown-title">{c.countdown}</p>
      <div className="countdown-grid">
        {values.map((value, i) => (
          <div className="countdown-item" key={i}>
            <strong className="countdown-number">{String(value).padStart(2, "0")}</strong>
            <span className="countdown-unit">{c.units[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
