// Phase A Round 4 — XP welcome-screen layout, mitchivin structural pattern.
//
// Layout:
//   [deep-blue outer frame]
//     ┌─ horizontal pale-blue gradient bar ─────────────────────┐
//     │  ┌ left column ────┐  │  ┌ right column ─────────────┐  │   <- inner band
//     │  │  HonestAlexFXP  │  │  │  avatar  Alex Friedrichsen │  │      (lighter blue)
//     │  │  "To begin,     │  │  │          AI Engineer       │  │
//     │  │   click Alex…"  │  │  └────────────────────────────┘  │
//     │  └─────────────────┘  │ ← vertical pale-blue divider
//     └─ horizontal pale-blue gradient bar ─────────────────────┘
//   [bottom row, outside inner band]
//     Restart (bottom-left)            Flavor text (bottom-right)
//                                      F11 hint (bottom-right corner)
//
// Focus lands on the avatar button on mount. Clicking the avatar fires
// login.wav and advances to desktop (wired from Desktop.tsx). The
// Restart entry calls playBootSequence() (wired from Desktop.tsx) —
// clean fix for Cipher's R1 warning about reload() stomping state.

import React, { useEffect, useRef } from "react";
import Wordmark from "./Wordmark";

type Props = {
  onLogin: () => void;
  onRestart: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
};

export default function LoginScreen({
  onLogin,
  onRestart,
  isFullscreen = false,
  onToggleFullscreen,
}: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    btnRef.current?.focus();
  }, []);

  return (
    <div className="login-screen" role="dialog" aria-label="Welcome">
      {/* Top gradient bar — signature XP welcome-screen chrome */}
      <div className="login-bar login-bar-top" aria-hidden="true" />

      {/* Inner band: two columns separated by a vertical divider */}
      <div className="login-band">
        <div className="login-col login-col-left">
          <div className="login-wordmark-slot">
            <Wordmark size="md" />
          </div>
          <p className="login-instruction">
            To begin, click
            <br />
            <span className="login-instruction-name">Alex Friedrichsen</span>
            <br />
            to log in.
          </p>
        </div>

        <div className="login-col-divider" aria-hidden="true" />

        <div className="login-col login-col-right">
          <button
            ref={btnRef}
            type="button"
            className="login-user-card"
            onClick={onLogin}
            aria-label="Log in as Alex Friedrichsen"
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/pictures/boot/user-avatar.png`}
              alt=""
              className="login-avatar"
              draggable={false}
            />
            <div className="login-user-text">
              <div className="login-name">Alex Friedrichsen</div>
              <div className="login-role">AI Engineer</div>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom gradient bar */}
      <div className="login-bar login-bar-bottom" aria-hidden="true" />

      {/* Bottom chrome: Restart left, flavor text + F11 hint right */}
      <div className="login-bottom">
        <button
          type="button"
          className="login-restart"
          onClick={onRestart}
          aria-label="Restart"
        >
          <img
            src={`${import.meta.env.BASE_URL}assets/pictures/icons/xp-restart-16.svg`}
            alt=""
            width={16}
            height={16}
            className="login-restart-icon"
            draggable={false}
            aria-hidden="true"
          />
          <span className="login-restart-label">Restart</span>
        </button>
        <div className="login-flavor">
          <div>After you log on, the desktop is yours to explore.</div>
          <div>Every pixel placed on purpose.</div>
        </div>
      </div>
      {/* R5 Fix 5: clickable F11 hint. Browsers intercept the real F11
          at the chrome layer so we can't bind it as a keystroke, but the
          click-to-fullscreen gesture works reliably. Hidden once the
          page is already in document fullscreen. */}
      {!isFullscreen && (
        <button
          type="button"
          className="login-f11-hint"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFullscreen?.();
          }}
        >
          Click here (or press F11) for the full experience
        </button>
      )}
    </div>
  );
}
