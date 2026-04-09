// Phase A — full-viewport XP boot screen.
// Fixed overlay sibling to .retro-desktop (R7: does not wrap the desktop).
// Click anywhere skips the 2 s auto-advance hold.

import React from "react";

export default function BootScreen({ onSkip }: { onSkip: () => void }) {
  return (
    <div
      className="boot-screen"
      role="status"
      aria-label="Starting AlexOS XP"
      onClick={onSkip}
    >
      <div className="boot-inner">
        <img
          src="/Portfolio/assets/pictures/boot/boot-wordmark.png"
          alt="AlexOS XP"
          className="boot-wordmark"
          draggable={false}
        />
        <div className="boot-loadbar" aria-hidden="true">
          <div className="boot-loadbar-track" />
        </div>
        <div className="boot-copyright">Copyright © HonestAlexF LLC</div>
      </div>
    </div>
  );
}
