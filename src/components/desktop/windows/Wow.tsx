import React, { useEffect, useRef, useState, useCallback } from "react";

// Wow — fullscreen "World of Warcraft login screen" experience.
// Not a windowed component: this renders as a fixed-position overlay OUTSIDE
// the Rnd window system, same pattern as Fate. Double-clicking the WoW
// desktop icon opens this instead of adding 'wow' to openWindows.
//
// Assets sourced from the Xiexe/WoWLoginScreens GitHub repo (Vanilla era):
//   public/assets/videos/wow/vanilla-login.mp4 — looping login cinematic (~940 KB)
//   public/sounds/wow/vanilla-theme.ogg         — login theme music, looped (~3 MB)
//   public/sounds/wow/button-click.ogg          — UI click SFX (~4 KB)
//
// State machine on the overlay:
//   loading → login → (ESC/close) close
// The loading phase shows a "Connecting to server..." screen for ~1.5s, then
// the login phase starts the background video + theme music and renders the
// decorative login box.

const BASE = import.meta.env.BASE_URL;
const VIDEO_SRC = `${BASE}assets/videos/wow/vanilla-login.mp4`;
const THEME_SRC = `${BASE}sounds/wow/vanilla-theme.ogg`;
const CLICK_SRC = `${BASE}sounds/wow/button-click.ogg`;

const LOADING_DURATION_MS = 1500;

type Phase = "loading" | "login";

export default function Wow({ onClose }: { onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const themeRef = useRef<HTMLAudioElement>(null);
  const clickRef = useRef<HTMLAudioElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [showHint, setShowHint] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

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

  // Focus the overlay root immediately so the keyboard focus is trapped.
  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  // Loading → login transition. Kick off video + audio when we enter login.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setPhase("login");
    }, LOADING_DURATION_MS);
    return () => window.clearTimeout(id);
  }, []);

  // Start media playback and move focus to the username field once we're
  // in the login phase. Parent only mounts this overlay after a user
  // double-click, so autoplay-with-sound is permitted.
  useEffect(() => {
    if (phase !== "login") return;
    const v = videoRef.current;
    const theme = themeRef.current;
    if (v) {
      v.currentTime = 0;
      v.loop = true;
      v.muted = true; // video is ambient; audio comes from the theme track
      v.play().catch(() => {});
    }
    if (theme) {
      theme.currentTime = 0;
      theme.loop = true;
      theme.volume = 0.6;
      theme.play().catch(() => {
        // Autoplay-with-sound blocked — the decorative login box still
        // works, we just lose the theme music. Not worth blocking on.
      });
    }
    // Move focus into the login box for keyboard users.
    queueMicrotask(() => usernameRef.current?.focus());
  }, [phase]);

  // Pause media on unmount so audio doesn't leak if the overlay is torn
  // down mid-playback (Escape, parent unmount, etc.).
  useEffect(
    () => () => {
      themeRef.current?.pause();
      videoRef.current?.pause();
    },
    [],
  );

  // Focus trap: keep Tab cycling between the fields and the close button.
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const root = rootRef.current;
    if (!root) return;
    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.offsetParent !== null || el === root);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const playClick = useCallback(() => {
    const c = clickRef.current;
    if (!c) return;
    try {
      c.currentTime = 0;
      c.volume = 0.7;
      c.play().catch(() => {});
    } catch {
      /* ignore */
    }
  }, []);

  const handleLogin = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      playClick();
      setLoginMessage("Connecting to realm...");
      window.setTimeout(() => {
        setLoginMessage("All realms are currently full. Please try again.");
      }, 2200);
    },
    [playClick],
  );

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="World of Warcraft Login Screen"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      style={{
        outline: "none",
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: "#f0c850",
        overflow: "hidden",
      }}
    >
      {/* Background video — only mounted during the login phase so the
          loading screen stays pitch black. */}
      {phase === "login" && (
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          playsInline
          preload="auto"
          muted
          loop
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            background: "#000",
          }}
        />
      )}
      <audio ref={themeRef} src={THEME_SRC} preload="auto" />
      <audio ref={clickRef} src={CLICK_SRC} preload="auto" />

      {/* Loading phase — "Connecting to server..." over black. */}
      {phase === "loading" && (
        <div
          style={{
            position: "relative",
            textAlign: "center",
            textShadow: "0 2px 8px rgba(0,0,0,0.9)",
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: 2,
              color: "#d4a84a",
              marginBottom: 14,
            }}
          >
            Connecting to server
            <LoadingDots />
          </div>
          <div style={{ fontSize: 12, color: "#7a6a3a", letterSpacing: 1 }}>
            WORLD OF WARCRAFT
          </div>
        </div>
      )}

      {/* Login phase — dim overlay + decorative login box. */}
      {phase === "login" && (
        <>
          {/* Dim scrim over the video so the login box reads cleanly. */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.75) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* WoW logo wordmark (CSS/text — no bitmap) at the top. */}
          <div
            style={{
              position: "absolute",
              top: "6vh",
              left: 0,
              right: 0,
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(28px, 4.5vw, 64px)",
                fontWeight: 700,
                letterSpacing: 4,
                color: "#f0c850",
                textShadow:
                  "0 0 16px rgba(240,200,80,0.55), 0 2px 6px rgba(0,0,0,0.9)",
                lineHeight: 1,
              }}
            >
              WORLD<span style={{ opacity: 0.6, margin: "0 0.4em" }}>of</span>
              WARCRAFT
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: "clamp(11px, 1vw, 14px)",
                letterSpacing: 6,
                color: "#7a6a3a",
              }}
            >
              CLASSIC
            </div>
          </div>

          {/* Login box — centered, decorative. */}
          <form
            onSubmit={handleLogin}
            style={{
              position: "relative",
              width: "min(420px, 85vw)",
              padding: "28px 32px 24px",
              background:
                "linear-gradient(180deg, rgba(20,10,0,0.85) 0%, rgba(10,5,0,0.92) 100%)",
              border: "1.5px solid #6a4a14",
              borderRadius: 6,
              boxShadow:
                "0 0 0 1px rgba(240,200,80,0.15) inset, 0 8px 32px rgba(0,0,0,0.7), 0 0 24px rgba(240,200,80,0.08)",
              color: "#e8d8a8",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: 14,
                letterSpacing: 3,
                color: "#d4a84a",
                marginBottom: 18,
                textTransform: "uppercase",
              }}
            >
              Subscriber Login
            </div>

            <label
              style={{
                display: "block",
                fontSize: 11,
                letterSpacing: 1.5,
                color: "#b8a878",
                marginBottom: 4,
                textTransform: "uppercase",
              }}
            >
              Account Name
            </label>
            <input
              ref={usernameRef}
              type="text"
              autoComplete="off"
              spellCheck={false}
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                padding: "7px 10px",
                marginBottom: 14,
                background: "rgba(0,0,0,0.55)",
                border: "1px solid #6a4a14",
                borderRadius: 3,
                color: "#f0e0b0",
                fontFamily: "inherit",
                fontSize: 14,
                outline: "none",
              }}
            />

            <label
              style={{
                display: "block",
                fontSize: 11,
                letterSpacing: 1.5,
                color: "#b8a878",
                marginBottom: 4,
                textTransform: "uppercase",
              }}
            >
              Password
            </label>
            <input
              type="password"
              autoComplete="off"
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                padding: "7px 10px",
                marginBottom: 18,
                background: "rgba(0,0,0,0.55)",
                border: "1px solid #6a4a14",
                borderRadius: 3,
                color: "#f0e0b0",
                fontFamily: "inherit",
                fontSize: 14,
                outline: "none",
              }}
            />

            <button
              type="submit"
              style={{
                display: "block",
                width: "100%",
                padding: "10px 14px",
                background: "linear-gradient(180deg, #6a4a14 0%, #4a2e0a 100%)",
                border: "1px solid #8a6a24",
                borderRadius: 3,
                color: "#f0e0b0",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                cursor: "pointer",
                boxShadow:
                  "0 0 0 1px rgba(240,200,80,0.2) inset, 0 2px 6px rgba(0,0,0,0.5)",
              }}
            >
              Log In
            </button>

            {loginMessage && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  marginTop: 14,
                  textAlign: "center",
                  fontSize: 12,
                  color: "#f0c850",
                  letterSpacing: 1,
                }}
              >
                {loginMessage}
              </div>
            )}
          </form>

          {/* Close button (top right) — X exits back to desktop. */}
          <button
            ref={closeBtnRef}
            type="button"
            aria-label="Close World of Warcraft"
            onClick={() => {
              playClick();
              onClose();
            }}
            style={{
              position: "absolute",
              top: 16,
              right: 20,
              width: 32,
              height: 32,
              background: "rgba(0,0,0,0.55)",
              border: "1px solid #6a4a14",
              borderRadius: 3,
              color: "#d4a84a",
              fontFamily: "inherit",
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            ×
          </button>

          {/* Fake build stamp in the bottom left — decorative flavor. */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 14,
              left: 18,
              fontSize: 10,
              color: "rgba(212,168,74,0.45)",
              letterSpacing: 1,
              pointerEvents: "none",
            }}
          >
            Version 1.12.1 (5875) (Release)
          </div>
        </>
      )}

      {showHint && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 16,
            right: 20,
            color: "rgba(240,200,80,0.55)",
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

// Three-dot animated ellipsis for the loading screen. Pure CSS keyframes
// via a style tag scoped to this component (no global CSS mutation).
function LoadingDots() {
  return (
    <>
      <style>{`
        @keyframes wow-dot { 0%,20% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
        .wow-dot { animation: wow-dot 1.4s infinite; display: inline-block; }
        .wow-dot:nth-child(2) { animation-delay: 0.2s; }
        .wow-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
      <span className="wow-dot">.</span>
      <span className="wow-dot">.</span>
      <span className="wow-dot">.</span>
    </>
  );
}
