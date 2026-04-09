import React, { useRef, useState } from "react";

// Fate — homage window for the 2005 WildTangent dungeon crawler.
// Hero is the pre-cropped intro MP4 (800x600, ~16s, muted autoplay loop with
// a click-to-unmute button). Below the video: Alex's personal intro copy, an
// audio row with two tracks (narrator + main theme), and a link to the wiki.
//
// Assets are referenced via import.meta.env.BASE_URL so a base change can't
// silently 404 them (Cipher carry-forward W from PR #5).
const BASE = import.meta.env.BASE_URL;

const VIDEO_SRC = `${BASE}assets/videos/fate-intro.mp4`;
const POSTER_SRC = `${BASE}assets/pictures/fate/intrologo.png`;
const NARRATOR_SRC = `${BASE}sounds/fate-narrator-intro.mp3`;
const THEME_SRC = `${BASE}sounds/fate-title-theme.mp3`;
const WIKI_URL = "https://fate.fandom.com/wiki/Fate";

export default function Fate() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    // Chromium sometimes pauses when unmuting after autoplay; kick it back on.
    if (!v.muted && v.paused) v.play().catch(() => {});
  };

  return (
    <div
      style={{
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Hero video */}
      <div
        style={{ position: "relative", background: "#000", borderRadius: 2 }}
      >
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{ width: "100%", height: "auto", display: "block" }}
          aria-label="Fate intro: WildTangent logo into the title screen"
        />
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute intro video" : "Mute intro video"}
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            padding: "4px 10px",
            background: "rgba(0,0,0,0.65)",
            color: "#fff",
            border: "1px solid #fff",
            borderRadius: 2,
            fontFamily: "Tahoma, sans-serif",
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          {muted ? "🔇 Click to unmute" : "🔊 Mute"}
        </button>
      </div>

      {/* Intro copy */}
      <div style={{ fontSize: 12, lineHeight: 1.55 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 14 }}>
          Fate (WildTangent, 2005)
        </h2>
        <p style={{ margin: "0 0 8px" }}>
          Before I knew what a roguelike was, before Diablo and Torchlight were
          shorthand for anything, there was <b>Fate</b>. A dungeon crawler that
          shipped bundled on half the family PCs of the early 2000s, free from
          WildTangent, infinite in the way games felt infinite when you were
          ten. You picked a pet — a dog or a cat — and together you went
          downstairs forever.
        </p>
        <p style={{ margin: "0 0 8px" }}>
          The loot grind was pure dopamine. The pet would run your junk back to
          town to sell while you kept killing things. You could fish in the town
          pond and — if you caught the right fish and fed it to your pet — it
          would <i>permanently transform</i> into a dragon or a wolf or a hell
          beast. I spent hours at that pond. I still think about the title
          theme, Captain O'Kane's <i>The Clergy's Lamentation</i>, which is
          somehow a legitimately haunting piece of Celtic music buried inside a
          shareware ARPG.
        </p>
        <p style={{ margin: 0 }}>
          Fate is the reason I like games that respect a kid's patience. It
          never explained itself, it just let you go deeper. This window is a
          love letter. Play the narrator intro for the full effect.{" "}
          <a href={WIKI_URL} target="_blank" rel="noopener noreferrer">
            Fate Fandom wiki ↗
          </a>
        </p>
      </div>

      {/* Audio row */}
      <fieldset style={{ margin: 0, padding: "8px 10px" }}>
        <legend style={{ fontSize: 11, padding: "0 4px" }}>Soundtrack</legend>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              fontSize: 11,
            }}
          >
            <span>Narrator Intro — play for the full effect</span>
            <audio
              controls
              preload="none"
              src={NARRATOR_SRC}
              aria-label="Narrator Intro — play for the full effect"
              style={{ width: "100%" }}
            />
          </label>
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              fontSize: 11,
            }}
          >
            <span>
              Title Theme — Captain O'Kane, <i>The Clergy's Lamentation</i>
            </span>
            <audio
              controls
              preload="none"
              src={THEME_SRC}
              aria-label="Title Theme — Captain O'Kane, The Clergy's Lamentation"
              style={{ width: "100%" }}
            />
          </label>
        </div>
      </fieldset>

      <div className="status-bar">
        <p className="status-bar-field">Bundled with WildTangent · 2005</p>
        <p className="status-bar-field">
          <a href={WIKI_URL} target="_blank" rel="noopener noreferrer">
            fate.fandom.com
          </a>
        </p>
      </div>
    </div>
  );
}
