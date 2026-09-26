import { config } from "@/data/config";
import { Reveal } from "./Reveal";
export function DressCode() {
  if (!config.visibility.dressCode || !config.dressCode.colors.length) return null;
  return <section className="section dress-section"><Reveal><h2>{config.dressCode.title}</h2><p>{config.dressCode.text}</p><ul className="swatches">{config.dressCode.colors.map(c => <li key={c.hex}><span style={{ backgroundColor: c.hex }} /><span className="sr-only">{c.label}</span></li>)}</ul></Reveal></section>;
}
