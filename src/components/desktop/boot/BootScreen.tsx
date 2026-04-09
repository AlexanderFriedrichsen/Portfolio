// Phase A — full-viewport XP boot screen.
// Fixed overlay sibling to .retro-desktop (R7: does not wrap the desktop).
// Click anywhere skips the 2 s auto-advance hold.

import React from "react";
import Wordmark from "./Wordmark";

export default function BootScreen({ onSkip }: { onSkip: () => void }) {
  return (
    <div
      className="boot-screen"
      role="status"
      aria-label="Starting HonestAlexFXP"
      onClick={onSkip}
    >
      <div className="boot-inner">
        <Wordmark size="lg" />
        <div className="boot-loadbar" aria-hidden="true">
          <div className="boot-loadbar-track" />
        </div>
        <div className="boot-copyright">Copyright © HonestAlexF LLC</div>
      </div>
    </div>
  );
}
