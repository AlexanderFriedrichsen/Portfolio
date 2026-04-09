// Phase A polish — XP login / welcome screen, mitchivin-style layout.
// Click the avatar to fire login.wav and advance to desktop.
// Focus lands on the avatar on mount.

import React, { useEffect, useRef } from "react";
import Wordmark from "./Wordmark";

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    btnRef.current?.focus();
  }, []);

  const onRestart = () => {
    // Soft restart: reload the page. Return visitors short-circuit the boot.
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <div className="login-screen" role="dialog" aria-label="Welcome">
      <div className="login-wordmark-slot">
        <Wordmark size="md" />
      </div>
      <div className="login-body">
        <div className="login-user-card">
          <button
            ref={btnRef}
            type="button"
            className="login-avatar-btn"
            onClick={onLogin}
            aria-label="Log in as Alex Friedrichsen"
          >
            <img
              src="/Portfolio/assets/pictures/boot/user-avatar.png"
              alt=""
              className="login-avatar"
              draggable={false}
            />
          </button>
          <div className="login-name">Alex Friedrichsen</div>
          <div className="login-role">AI Engineer</div>
          <button
            type="button"
            className="login-restart"
            onClick={onRestart}
            aria-label="Restart"
          >
            <span className="login-restart-glyph" aria-hidden="true">
              ⟳
            </span>
            <span className="login-restart-label">Restart</span>
          </button>
        </div>
      </div>
      <div className="login-footer">
        <span className="login-hint">
          To begin, click your user name. Press F11 for the full experience.
        </span>
      </div>
    </div>
  );
}
