import { config } from "@/data/config";
import { Ornament } from "./Ornament";
import { Reveal } from "./Reveal";
export function Invitation() {
  const c = config.invitation;
  return <section id="letter" className="section letter-section">
    <Reveal><Ornament /><p className="eyebrow">{c.eyebrow}</p></Reveal>
    <Reveal className="invitation-letter">
      <h2>{c.title}</h2>
      <div className="letter-opening">{c.opening.map(p => <p key={p}>{p}</p>)}</div>
      {c.paragraphs.map(p => <p key={p}>{p}</p>)}
      <p className="letter-closing">{c.closing}</p>
      <div className="signature"><span>{c.regards}</span><strong>{c.signature}</strong></div>
    </Reveal>
  </section>;
}
