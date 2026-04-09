// Phase A — XP login / welcome screen.
// Click the avatar to fire login.wav and advance to desktop.
// Focus lands on the avatar on mount.

import React, { useEffect, useRef } from "react";

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    btnRef.current?.focus();
  }, []);

  return (
    <div className="login-screen" role="dialog" aria-label="Welcome">
      <div className="login-header">
        <div className="login-brand">AlexOS XP</div>
        <div className="login-tagline">To begin, click your user name</div>
      </div>
      <div className="login-body">
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
          <div className="login-meta">
            <div className="login-name">Alex Friedrichsen</div>
            <div className="login-role">Chief Strategist</div>
            <div className="login-mission">
              Building AI-augmented software, one honest experiment at a time.
            </div>
          </div>
        </button>
      </div>
      <div className="login-footer">
        <span className="login-hint">Press F11 for the full experience.</span>
      </div>
    </div>
  );
}
