"use client";
import { useEffect, useRef, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { config, type Attendance } from "@/data/config";
export function SuccessModal({ attendance, onClose, returnFocus }: { attendance: Attendance | null; onClose: () => void; returnFocus: RefObject<HTMLButtonElement | null> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!attendance) return;
    const element = dialog.current;
    element?.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = before; returnFocus.current?.focus({ preventScroll: true }); };
  }, [attendance, returnFocus]);
  if (!attendance) return null;
  return <dialog ref={dialog} className="success-modal" aria-labelledby="success-title" aria-describedby="success-description" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) { const b = event.currentTarget.getBoundingClientRect(); if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) onClose(); } }}>
    <svg className="success-check" viewBox="0 0 68 68" fill="none" aria-hidden="true"><circle cx="34" cy="34" r="32" stroke="currentColor" strokeWidth="1" /><motion.path d="m20 34 10 10 19-21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.65 }} /></svg>
    <h2 id="success-title">{config.rsvp.successTitle}</h2>
    <p id="success-description">{attendance === "no" ? config.rsvp.successNo : config.rsvp.successYes}</p>
    <button className="button primary-button" onClick={onClose} autoFocus>{config.rsvp.close}</button>
  </dialog>;
}
