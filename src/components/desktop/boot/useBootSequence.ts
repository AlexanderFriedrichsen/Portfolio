// Phase A — boot/login/desktop state machine hook.
//
// Phases:
//   'boot'    — BootScreen overlay visible, auto-advances to 'login' after 2 s.
//   'login'   — LoginScreen overlay visible, avatar click advances to 'desktop'.
//   'desktop' — no overlay; existing Desktop.tsx content is revealed.
//
// Return-visitor short-circuit:
//   If localStorage['portfolio:visited'] is set, the initial phase is 'desktop'
//   and boot/login never render. The flag is written the first time we reach
//   'desktop' so future sessions skip the ceremony.
//
// Phase C (Turn Off → Restart) will call `playBootSequence()` to replay the
// ceremony. Because the state is component-local, the cleanest way for Phase C
// to trigger a replay is to call `advanceToBoot()` on the same instance. The
// `playBootSequence` name is exported as an alias so Phase C has a stable
// entry point that reads intuitively at call-sites.

import { useCallback, useEffect, useState } from "react";

export type BootPhase = "boot" | "login" | "desktop";

const VISITED_KEY = "portfolio:visited";
const BOOT_HOLD_MS = 2000;

// SSR renders as 'desktop' to avoid hydration-mismatch flash. The boot
// ceremony is deliberately client-side only: on mount, if the visitor has
// not seen it before, we flip to 'boot' and let the state machine run.
// Return visitors stay on 'desktop' forever.
//
// firstDesktopVisit: true ONLY after we reach desktop via a user gesture
// (avatar click on LoginScreen, or a Phase C Restart chain from the shutdown
// menu). The return-visit localStorage short-circuit leaves it false, which
// means the welcome balloon — and its autoplay-gated balloon.wav — must be
// gated on this flag, not on `phase === 'desktop'` alone. Without this
// guard, return visits silently fail the autoplay policy and the balloon
// would visually re-appear on every page load, breaking mitchivin parity.
export function useBootSequence() {
  const [phase, setPhase] = useState<BootPhase>("desktop");
  const [firstDesktopVisit, setFirstDesktopVisit] = useState(false);

  // Client-mount: start the ceremony if this is a first-time visitor.
  useEffect(() => {
    try {
      if (!window.localStorage.getItem(VISITED_KEY)) {
        setPhase("boot");
      }
    } catch {
      /* ignore */
    }
  }, []);

  const advanceToLogin = useCallback(() => {
    setPhase((p) => (p === "boot" ? "login" : p));
  }, []);

  const advanceToDesktop = useCallback(() => {
    // This is the user-gesture path (avatar click). Mark the gesture-chained
    // flag so the balloon + balloon.wav can fire inside the same gesture.
    setFirstDesktopVisit(true);
    setPhase("desktop");
  }, []);

  const playBootSequence = useCallback(() => {
    // Phase C entry point: replay the ceremony. Clear the visited flag so the
    // boot screen actually renders on the next reach-desktop, and reset the
    // gesture flag to false — it will be set back to true when the user
    // clicks the avatar on the replayed login screen, so the balloon and its
    // sound fire again on that gesture.
    try {
      window.localStorage.removeItem(VISITED_KEY);
    } catch {
      /* ignore */
    }
    setFirstDesktopVisit(false);
    setPhase("boot");
  }, []);

  // Auto-advance boot → login after BOOT_HOLD_MS.
  useEffect(() => {
    if (phase !== "boot") return;
    const id = window.setTimeout(() => {
      setPhase((p) => (p === "boot" ? "login" : p));
    }, BOOT_HOLD_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  // Persist the visited flag the first time we reach desktop.
  useEffect(() => {
    if (phase !== "desktop") return;
    try {
      window.localStorage.setItem(VISITED_KEY, "1");
    } catch {
      /* ignore */
    }
  }, [phase]);

  return {
    phase,
    firstDesktopVisit,
    advanceToLogin,
    advanceToDesktop,
    playBootSequence,
  };
}
