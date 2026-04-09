// Phase A — boot/login/desktop state machine hook.
//
// R5 Fix 1: the return-visit localStorage short-circuit was removed entirely.
// Every page load now runs the full boot → login → desktop ceremony. Automated
// tests that need to skip the ceremony pass ?skipBoot=1 in the URL — a test-
// only escape hatch that is NEVER wired into production UI.
//
// R5 Fix 3: logOff() takes the session back to the login screen (no boot).
// R5 Fix 4: shutdown() dims the screen, plays shutdown.wav, then replays the
//           full boot ceremony.
// R5 Fix 7: the very first avatar click of the session plays startup.wav
//           (the iconic chord). Subsequent avatar clicks (e.g. after a log off)
//           play login.wav (the shorter logon chime). See Desktop.tsx for wiring.
//
// Phases:
//   'boot'     — BootScreen overlay visible, auto-advances to 'login' after 2s.
//   'login'    — LoginScreen overlay visible, avatar click advances to 'desktop'.
//   'desktop'  — no overlay; Desktop content is revealed.

import { useCallback, useEffect, useRef, useState } from "react";
import { audioManager } from "./audioManager";

export type BootPhase = "boot" | "login" | "desktop";

const BOOT_HOLD_MS = 2000;
const SHUTDOWN_HOLD_MS = 1500;

// Test-only escape hatch. Any URL containing ?skipBoot=1 lands directly on
// the desktop, skipping the boot/login ceremony. This exists so Playwright
// specs that target post-login behaviour (d6-gating) don't have to replay
// the ceremony on every test context. It is never exposed in the UI.
function shouldSkipBoot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("skipBoot") === "1";
  } catch {
    return false;
  }
}

// SSR renders as 'desktop' to avoid a hydration-mismatch flash. On client
// mount we flip to 'boot' unless ?skipBoot=1 is present. Desktop.tsx hides
// the .retro-desktop div with visibility:hidden until both hydrated AND
// phase === 'desktop', so the pre-flip frame is never painted.
export function useBootSequence() {
  const [phase, setPhase] = useState<BootPhase>("desktop");
  const [firstDesktopVisit, setFirstDesktopVisit] = useState(false);
  const [hasLoggedInOnce, setHasLoggedInOnce] = useState(false);
  const [shuttingDown, setShuttingDown] = useState(false);
  // R5 r2 Cipher warning 2: track the shutdown timer so we can cancel it
  // on unmount (HMR, route change, test teardown). Without this cleanup a
  // fired callback hits a dead component and React warns.
  const shutdownTimerRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (shutdownTimerRef.current !== null) {
        window.clearTimeout(shutdownTimerRef.current);
        shutdownTimerRef.current = null;
      }
    };
  }, []);

  // Client-mount: always start the ceremony unless the test escape hatch
  // is set. R5 Fix 1 removed the portfolio:visited localStorage short-circuit.
  useEffect(() => {
    if (!shouldSkipBoot()) {
      setPhase("boot");
    }
  }, []);

  const advanceToLogin = useCallback(() => {
    setPhase((p) => (p === "boot" ? "login" : p));
  }, []);

  // User-gesture path: avatar click on the login screen. Plays the right
  // sound for the scenario (startup chord on first login of session; the
  // shorter logon chime on re-login after a log off) and advances to desktop.
  const advanceToDesktop = useCallback(() => {
    setHasLoggedInOnce((prev) => {
      audioManager.play(prev ? "login" : "startup");
      return true;
    });
    setFirstDesktopVisit(true);
    setPhase("desktop");
  }, []);

  // Intentional asymmetry with shutdown(): the Restart button on the login
  // screen is NOT a cold boot — the user is already inside the session and
  // has technically "logged in once" (that's how they got here via the
  // avatar). So we deliberately do NOT reset hasLoggedInOnce; the next
  // avatar click plays login.wav (logon chime), not startup.wav. Only
  // shutdown() resets the session entirely. Do not "fix" this.
  const playBootSequence = useCallback(() => {
    setFirstDesktopVisit(false);
    setPhase("boot");
  }, []);

  // R5 Fix 3: Log Off returns to the login screen without boot. Plays the
  // logoff chime and resets firstDesktopVisit so the welcome balloon fires
  // again on the next login (matches XP behaviour).
  const logOff = useCallback(() => {
    audioManager.play("logoff");
    setFirstDesktopVisit(false);
    setPhase("login");
  }, []);

  // R5 Fix 4: Shut Down fades the screen to grey, plays the shutdown sound,
  // then replays the full boot ceremony. Simple stand-in for the proper XP
  // shutdown dialog — Phase C will layer the modal confirmation on top.
  const shutdown = useCallback(() => {
    setShuttingDown(true);
    audioManager.play("shutdown");
    if (shutdownTimerRef.current !== null) {
      window.clearTimeout(shutdownTimerRef.current);
    }
    shutdownTimerRef.current = window.setTimeout(() => {
      shutdownTimerRef.current = null;
      setShuttingDown(false);
      setFirstDesktopVisit(false);
      setHasLoggedInOnce(false);
      setPhase("boot");
    }, SHUTDOWN_HOLD_MS);
  }, []);

  // Auto-advance boot → login after BOOT_HOLD_MS.
  useEffect(() => {
    if (phase !== "boot") return;
    const id = window.setTimeout(() => {
      setPhase((p) => (p === "boot" ? "login" : p));
    }, BOOT_HOLD_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  return {
    phase,
    firstDesktopVisit,
    shuttingDown,
    advanceToLogin,
    advanceToDesktop,
    playBootSequence,
    logOff,
    shutdown,
  };
}
