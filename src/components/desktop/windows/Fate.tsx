import React, { useEffect, useRef, useState, useCallback } from "react";

// Fate — fullscreen "you just launched the game" experience for the 2005
// WildTangent dungeon crawler. Not a windowed component: this renders as a
// fixed-position overlay OUTSIDE the Rnd window system. The Fate desktop icon
// double-click opens this instead of adding 'fate' to openWindows.
//
// Video sections (fate-intro.mp4, 800x600, 129.5s total):
//   0.00 – 5.63s : WildTangent loading screen (plays once, unmuted)
//   5.63 – 16.50s: Title menu — LOOPED, video muted, fate-title-theme.mp3 plays
//   16.50 – 129.5s: Narrator parchment + gameplay (after user click)
//
// State machine on a single <video> + single <audio>:
//   loading → titleLoop → playthrough → close
// Transitions driven by ontimeupdate + click handler.

const BASE = import.meta.env.BASE_URL;
const VIDEO_SRC = `${BASE}assets/videos/fate-intro.mp4`;
const THEME_SRC = `${BASE}sounds/fate-title-theme.mp3`;

const LOOP_START = 5.63;
// LOOP_END has 0.25s of slack vs the true cut at 16.5 — ontimeupdate fires
// at ~4Hz, so without slack the seek-back can fire after the user has already
// glimpsed several frames of the narrator section.
const LOOP_END = 16.25;
const LOOP_RESEEK = 16.5;
const VIDEO_END = 129.5;

type Phase = "loading" | "titleLoop" | "playthrough";

export default function Fate({ onClose }: { onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const themeRef = useRef<HTMLAudioElement>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const phaseRef = useRef<Phase>("loading");
  const [showHint, setShowHint] = useState(false);

  // Keep a ref in sync with phase so the ontimeupdate handler can see the
  // current phase without stale-closure bugs.
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Escape closes the overlay at any time.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Unobtrusive "ESC to exit" hint fades in after 3s.
  useEffect(() => {
    const id = window.setTimeout(() => setShowHint(true), 3000);
    return () => window.clearTimeout(id);
  }, []);

  // Kick off playback on mount. The parent only renders this component after
  // a user double-click, so autoplay-with-sound is allowed.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    rootRef.current?.focus();
    v.currentTime = 0;
    v.muted = false;
    v.play().catch(() => {
      // If autoplay-with-sound is somehow blocked, retry muted so the visuals
      // still run. The loading audio is incidental; not worth blocking on.
      v.muted = true;
      v.play().catch(() => {});
    });
  }, []);

  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    const theme = themeRef.current;
    if (!v) return;
    const t = v.currentTime;
    const cur = phaseRef.current;

    if (cur === "loading" && t >= LOOP_START) {
      // Transition into titleLoop: mute video, start title theme.
      v.muted = true;
      if (theme) {
        theme.currentTime = 0;
        theme.loop = true;
        theme.play().catch(() => {});
      }
      setPhase("titleLoop");
      return;
    }

    if (cur === "titleLoop" && t >= LOOP_END) {
      // Loop guard: jump back to LOOP_START.
      v.currentTime = LOOP_START;
      return;
    }

    if (cur === "playthrough" && t >= VIDEO_END) {
      // Experience is over — close the overlay.
      onClose();
    }
  }, [onClose]);

  // Pause media on unmount so audio doesn't leak if the overlay is torn down
  // mid-playback (Escape, parent unmount, etc.).
  useEffect(
    () => () => {
      themeRef.current?.pause();
      videoRef.current?.pause();
    },
    [],
  );

  const handleClick = useCallback(() => {
    if (phaseRef.current !== "titleLoop") return;
    const v = videoRef.current;
    const theme = themeRef.current;
    if (!v) return;
    // Stop title theme, unmute video, let narrator carry from LOOP_RESEEK forward.
    if (theme) {
      theme.pause();
    }
    v.muted = false;
    // Jump past the true cut so the narrator section starts cleanly.
    if (v.currentTime < LOOP_RESEEK) {
      v.currentTime = LOOP_RESEEK;
    }
    setPhase("playthrough");
    // Chromium occasionally pauses the element on currentTime jumps; kick it.
    if (v.paused) v.play().catch(() => {});
  }, []);

  return (
    <div
      ref={rootRef}
      onClick={handleClick}
      role="dialog"
      aria-modal="true"
      aria-label="Fate — launching"
      tabIndex={-1}
      style={{
        outline: "none",
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: phase === "titleLoop" ? "pointer" : "default",
      }}
    >
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        playsInline
        preload="auto"
        onTimeUpdate={onTimeUpdate}
        onEnded={onClose}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          background: "#000",
        }}
        aria-label="Fate intro sequence"
      />
      <audio ref={themeRef} src={THEME_SRC} preload="auto" />
      {showHint && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 16,
            right: 20,
            color: "rgba(255,255,255,0.55)",
            fontFamily: "Tahoma, sans-serif",
            fontSize: 11,
            letterSpacing: 0.5,
            pointerEvents: "none",
            textShadow: "0 1px 2px rgba(0,0,0,0.8)",
          }}
        >
          ESC to exit
        </div>
      )}
    </div>
  );
}
