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

export type SoundName = "login" | "logoff" | "balloon";

const SOURCES: Record<SoundName, string> = {
  login: "/Portfolio/sounds/login.wav",
  logoff: "/Portfolio/sounds/logoff.wav",
  balloon: "/Portfolio/sounds/balloon.wav",
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
