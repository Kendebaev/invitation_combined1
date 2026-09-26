import { ArrowUpRight, MapPin } from "lucide-react";
import { config } from "@/data/config";
import { Botanical, Ornament } from "./Ornament";
import { Reveal } from "./Reveal";

export function Location() {
  return (
    <section className="section location-section" aria-labelledby="location-title">
      <Botanical className="location-leaf" />
      <Reveal>
        <p className="eyebrow">{config.venue.eyebrow}</p>
        <h2 id="location-title">{config.venue.title}</h2>
        {config.venue.city && <p className="venue-city">{config.venue.city}</p>}
      </Reveal>
      <Reveal className="venue-arch">
        {config.images.venue ? (
          <img className="venue-image" src={config.images.venue} alt={config.images.venueAlt} loading="lazy" />
        ) : (
          <Ornament />
        )}
        <MapPin className="venue-pin" size={24} strokeWidth={1} aria-hidden="true" />
        <h3>{config.venue.name}</h3>
        <p>{config.venue.description}</p>
        {config.venue.address && <p>{config.venue.address}</p>}
      </Reveal>
      <Reveal>
        <a className="button map-button" href={config.venue.mapUrl} target="_blank" rel="noopener noreferrer">
          {config.venue.mapLabel}
          <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </Reveal>
    </section>
  );
}
