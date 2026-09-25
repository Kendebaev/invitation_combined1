"use client";
import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { config } from "@/data/config";
import { Botanical, Ornament } from "./Ornament";

export function Hero() {
  const [failed, setFailed] = useState(false);
  const portrait = config.images.portrait && !failed;

  return (
    <header id="invitation" className="hero" tabIndex={-1}>
      <p className="hero-eyebrow">{config.hero.eyebrow}</p>
      <div className={`portrait-stage ${portrait ? "" : "portrait-stage-empty"}`}>
        <div className="portrait-arch" />
        <span className="arch-star" aria-hidden="true">✧</span>
        <Botanical className="hero-leaf hero-leaf-left" />
        <Botanical className="hero-leaf hero-leaf-right" />
        {portrait ? (
          <img
            className="portrait"
            src={config.images.portrait!}
            alt={config.images.portraitAlt}
            width={config.images.portraitWidth}
            height={config.images.portraitHeight}
            fetchPriority="high"
            decoding="async"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="portrait-monogram" aria-label={config.a11y.portraitFallback}>
            {config.monogram}
            <Ornament />
          </div>
        )}
      </div>
      <div className="hero-type">
        <h1 className="names">
          {config.people.map((person, index) => (
            <span className="person" key={person.name}>
              {index > 0 && (
                <span className="name-divider" aria-hidden="true">
                  <i />✧<i />
                </span>
              )}
              <span className="person-line">
                <span className="person-name">{person.name}</span>
                <span className="person-age">
                  — {person.age} <span>{config.event.ageLabel}</span>
                </span>
              </span>
            </span>
          ))}
        </h1>
        <p className="occasion">{config.event.title}</p>
      </div>
      <a href="#letter" className="scroll-link">
        {config.hero.scroll}
        <ArrowDown size={16} strokeWidth={1} aria-hidden="true" />
      </a>
    </header>
  );
}
