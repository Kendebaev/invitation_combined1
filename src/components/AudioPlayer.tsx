"use client";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { config } from "@/data/config";

export type AudioHandle = { play: () => void };

export const AudioPlayer = forwardRef<AudioHandle>(function AudioPlayer(_, ref) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    if (!audio.current) return;
    try {
      const promise = audio.current.play();
      if (promise !== undefined) {
        promise.catch(() => {
          setPlaying(false);
        });
      }
    } catch {
      setPlaying(false);
    }
  };

  const toggle = () => {
    if (!audio.current) return;
    if (playing) {
      audio.current.pause();
    } else {
      play();
    }
  };

  useImperativeHandle(ref, () => ({ play }));

  if (!config.music.src) return null;

  return (
    <aside className="audio-control" aria-label="Музыка">
      <audio
        ref={audio}
        src={config.music.src}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
      />
      <button
        type="button"
        className={`music-button ${playing ? "is-playing" : ""}`}
        onClick={toggle}
        aria-label={playing ? config.music.pause : config.music.play}
        aria-pressed={playing}
      >
        {playing ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}
      </button>
    </aside>
  );
});
