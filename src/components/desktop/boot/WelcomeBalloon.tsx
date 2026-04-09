// Phase A — XP-style tray balloon that appears ~2 s after the desktop unveils.
// Anchored bottom-right near the clock. Auto-dismisses after 10 s or when the
// user clicks the explicit close (X) button. Clicks elsewhere do NOT dismiss
// (R4 fix 2 — CEO wants reading time, not accidental dismiss).
// balloon.wav plays on mount (still within the same user-gesture chain from
// the avatar click that advanced us into desktop state).

import React, { useEffect, useState } from "react";
import { audioManager } from "./audioManager";

const APPEAR_DELAY_MS = 2000;
// R4 Fix 2: 10s visible (was 6s). Long enough for a normal reader to finish.
const VISIBLE_MS = 10000;

export default function WelcomeBalloon({
  immediate = false,
}: {
  // R6 Fix C: when the tray "i" icon re-triggers the balloon via the
  // balloonKey remount trick, we want it to appear *now*, not after the
  // 2s initial-ceremony delay. CEO reported "nothing happens on click" —
  // the remount was working but the 2s appear delay made it look dead.
  immediate?: boolean;
}) {
  const [visible, setVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) {
      audioManager.play("balloon");
      return;
    }
    const appearId = window.setTimeout(() => {
      setVisible(true);
      audioManager.play("balloon");
    }, APPEAR_DELAY_MS);
    return () => window.clearTimeout(appearId);
  }, [immediate]);

  useEffect(() => {
    if (!visible) return;
    const hideId = window.setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => window.clearTimeout(hideId);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="welcome-balloon" role="status" aria-live="polite">
      <button
        type="button"
        className="welcome-balloon-close"
        aria-label="Dismiss welcome message"
        onClick={(e) => {
          e.stopPropagation();
          setVisible(false);
        }}
      >
        ×
      </button>
      <div className="welcome-balloon-title">
        <span className="welcome-balloon-icon" aria-hidden="true">
          i
        </span>
        Welcome, Alex
      </div>
      <div className="welcome-balloon-body">
        Your desktop is ready. Double-click any icon to explore — or hit Start
        for the full menu.
      </div>
      <div className="welcome-balloon-arrow" aria-hidden="true" />
    </div>
  );
}
