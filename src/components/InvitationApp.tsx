"use client";
import { useCallback, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import { config } from "@/data/config";
import { AudioPlayer, type AudioHandle } from "./AudioPlayer";
import { EnvelopeIntro } from "./EnvelopeIntro";
import { Hero } from "./Hero";
import { Invitation } from "./Invitation";
import { Calendar } from "./Calendar";
import { Timeline } from "./Timeline";
import { Location } from "./Location";
import { DressCode } from "./DressCode";
import { RSVPForm } from "./RSVPForm";
import { Footer } from "./Footer";
export function InvitationApp() {
  const audio = useRef<AudioHandle>(null);
  const [introVisible, setIntroVisible] = useState(false);
  const visibility = useCallback((visible: boolean) => setIntroVisible(visible), []);
  return <MotionConfig reducedMotion="user"><div className="invitation-shell w-full max-w-md mx-auto min-h-screen relative overflow-x-hidden">
    <div inert={introVisible}>
      <a className="skip-link" href="#rsvp-title">{config.a11y.skip}</a>
      <AudioPlayer ref={audio} />
      <main><Hero /><Invitation /><Calendar /><Timeline /><Location /><DressCode /><RSVPForm /></main><Footer />
    </div>
    <EnvelopeIntro onOpen={() => audio.current?.play()} onVisibility={visibility} />
  </div></MotionConfig>;
}
