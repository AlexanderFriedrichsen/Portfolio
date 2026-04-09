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
export function useBootSequence() {
  const [phase, setPhase] = useState<BootPhase>("desktop");

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
    setPhase("desktop");
  }, []);

  const playBootSequence = useCallback(() => {
    // Phase C entry point: replay the ceremony. Also clears the visited flag
    // so the boot screen actually renders (otherwise readInitialPhase would
    // immediately short-circuit on any state reset).
    try {
      window.localStorage.removeItem(VISITED_KEY);
    } catch {
      /* ignore */
    }
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

  return { phase, advanceToLogin, advanceToDesktop, playBootSequence };
}
