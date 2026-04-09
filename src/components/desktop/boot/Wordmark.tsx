// Phase A polish — XP-style wordmark used on BootScreen and LoginScreen.
// Composite of the Windows 2002 logo PNG + "HonestAlexFXP" text.
// Homage pattern (same posture as mitchivin.com "MitchIvin XP").

import React from "react";

export default function Wordmark({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={`xp-wordmark xp-wordmark-${size}`}
      aria-label="HonestAlexFXP"
    >
      <img
        src="/Portfolio/assets/pictures/boot/xp-logo-2002.png"
        alt=""
        className="xp-wordmark-flag"
        draggable={false}
      />
      <span className="xp-wordmark-text">
        <span className="xp-wordmark-honest">HonestAlexF</span>
        <span className="xp-wordmark-xp">XP</span>
      </span>
    </div>
  );
}
