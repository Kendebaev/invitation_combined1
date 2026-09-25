"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { config } from "@/data/config";
import { Ornament } from "./Ornament";
const SESSION_KEY = "qos-mereitoi-opened-v1";
export function EnvelopeIntro({ onOpen, onVisibility }: { onOpen: () => void; onVisibility: (visible: boolean) => void }) {
  const [visible, setVisible] = useState(false);
  const [opening, setOpening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let already = false;
    try { already = sessionStorage.getItem(SESSION_KEY) === "1"; } catch { /* Режим без хранилища тоже поддерживается. */ }
    setVisible(!already); onVisibility(!already);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [onVisibility]);
  useEffect(() => {
    if (!visible) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    button.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = before; };
  }, [visible]);
  const open = () => {
    if (opening) return;
    setOpening(true);
    onOpen();
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* Открытие не зависит от sessionStorage. */ }
    if (!reduced) void import("canvas-confetti").then(({ default: confetti }) => confetti({ particleCount: 28, spread: 65, startVelocity: 15, gravity: 0.55, scalar: 0.65, colors: ["#C5A368", "#E8DDD0", "#B98B50"], origin: { x: 0.5, y: 0.54 }, disableForReducedMotion: true, zIndex: 110 })).catch(() => {});
    timer.current = setTimeout(() => {
      setVisible(false); onVisibility(false);
      requestAnimationFrame(() => document.getElementById("invitation")?.focus({ preventScroll: true }));
    }, reduced ? 0 : 1600);
  };
  return <AnimatePresence>{visible && <motion.div className="intro-overlay" role="dialog" aria-modal="true" aria-labelledby="envelope-title" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.3 }}>
    <div className="intro-heading"><Ornament /><p>{config.intro.dedication}</p></div>
    <motion.div className={`envelope ${opening ? "opening" : ""}`} animate={opening ? { y: reduced ? 0 : 35, opacity: 0 } : { y: 0, opacity: 1 }} transition={{ delay: reduced ? 0 : 1.05, duration: reduced ? 0 : 0.55 }}>
      <div className="envelope-border" />
      <div className="envelope-letter"><span>{config.monogram}</span><Ornament /></div>
      <div className="envelope-folds" />
      <div className="envelope-flap" />
      <div className="envelope-face">
        <h2 id="envelope-title">{config.intro.title}</h2>
        <button ref={button} type="button" onClick={open} className="seal-button" aria-label={`${config.intro.title}. ${config.intro.action}`} aria-disabled={opening}>
          <span className="wax-seal"><span>{config.monogram}</span></span>
        </button>
        <p>{config.intro.action}</p>
      </div>
    </motion.div>
    <span className="intro-bottom">{config.event.title}</span>
  </motion.div>}</AnimatePresence>;
}
