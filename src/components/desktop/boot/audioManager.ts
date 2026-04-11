// Phase A — thin audio manager for the boot/login/balloon ceremony.
//
// Design:
//   - Lazy HTMLAudioElement cache, one element per sound name.
//   - preload() is called from Desktop mount; browsers are allowed to fetch
//     metadata/decode without user gesture. Actual .play() is only called
//     inside a user gesture handler (the avatar click), which satisfies the
//     Chromium/WebKit autoplay policy.
//   - play() swallows the rejection that modern browsers return if autoplay
//     is still blocked — we never throw into React render paths.
//   - Each sound is clipped + reset before play so a rapid second call
//     restarts from 0 instead of stacking.
//
// Phase C (Restart/Turn Off) will reuse this module; no API changes expected.

export type SoundName = "login" | "logoff" | "balloon" | "startup" | "shutdown";

// Base URL is injected by Vite from astro.config.mjs (base: "/Portfolio/").
// Using import.meta.env.BASE_URL keeps the audio paths in sync with any
// future base change without duplicating the path literal here.
const BASE = import.meta.env.BASE_URL; // always has a trailing slash

const SOURCES: Record<SoundName, string> = {
  login: `${BASE}sounds/login.wav`,
  logoff: `${BASE}sounds/logoff.wav`,
  // Polish 2026-04-10: swap the generic balloon.wav for the canonical
  // Windows XP notify pop. SoundName stays "balloon" so callers don't move.
  balloon: `${BASE}sounds/Windows XP - Notify [01].opus`,
  // R4 Fix 4: canonical XP startup chord (~424 KB, ~5–6 s). Triggered on
  // the first user gesture during boot, because browser autoplay policy
  // blocks .play() before any gesture. See Desktop.tsx first-gesture hook.
  startup: `${BASE}sounds/startup.wav`,
  // R5 Fix 4: canonical XP shutdown sound, copied from the sound library
  // (Windows XP Shutdown.wav). Played when the user picks Shut Down.
  shutdown: `${BASE}sounds/shutdown.wav`,
};

const cache: Partial<Record<SoundName, HTMLAudioElement>> = {};

function ensure(name: SoundName): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!cache[name]) {
    const el = new Audio(SOURCES[name]);
    el.preload = "auto";
    el.volume = 0.7;
    cache[name] = el;
  }
  return cache[name] ?? null;
}

export const audioManager = {
  preload(): void {
    (Object.keys(SOURCES) as SoundName[]).forEach((n) => ensure(n));
  },
  play(name: SoundName): void {
    const el = ensure(name);
    if (!el) return;
    // R5 r2 Cipher W3: expose a per-sound play counter on window so tests
    // can assert actual .play() invocations (not just network requests,
    // which miss cached replays). Handful of bytes, always on.
    if (typeof window !== "undefined") {
      const w = window as unknown as {
        __audioPlayCount?: Record<string, number>;
      };
      w.__audioPlayCount ??= {};
      w.__audioPlayCount[name] = (w.__audioPlayCount[name] ?? 0) + 1;
    }
    try {
      el.currentTime = 0;
    } catch {
      /* some browsers throw if metadata not ready — ignore */
    }
    const p = el.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        /* autoplay blocked — swallow, caller doesn't care */
      });
    }
  },
};
