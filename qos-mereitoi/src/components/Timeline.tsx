"use client";
import { Heart, Music2, Utensils, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { config } from "@/data/config";
const icons = { welcome: Sparkles, dinner: Utensils, music: Music2, heart: Heart };
export function Timeline() {
  const reduced = useReducedMotion();
  if (!config.visibility.timeline || !config.timeline.items.length) return null;
  return <section className="section timeline-section"><h2>{config.timeline.title}</h2><ol className="timeline">{config.timeline.items.map((item, i) => {
    const Icon = icons[item.icon];
    return <motion.li key={`${item.time}-${i}`} initial={reduced ? false : { opacity: 0, x: i % 2 ? 16 : -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: i * 0.08 }}><span className="timeline-icon"><Icon size={18} aria-hidden="true" /></span><time>{item.time}</time><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</motion.li>;
  })}</ol></section>;
}
