import React, { useCallback, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import "7.css/dist/7.scoped.css";
import "./desktop.css";

import AgentTeam from "./windows/AgentTeam";
import ResearchVault from "./windows/ResearchVault";
import AboutMe from "./windows/AboutMe";
import ToolsITried from "./windows/ToolsITried";
import HonestAlexFLLC from "./windows/HonestAlexFLLC";
import { FolderIcon, UserIcon, ToolsIcon, CompanyIcon } from "./icons";

// ───────────────────────────────────────────────────────────────────────────
// R7 CRITICAL: The root <div> returned by this component IS the
// `bounds="parent"` target for every <Rnd>. NO Astro wrapper, NO React
// wrapper, NO fragment may sit between this root and any <Rnd>.
// Refactors that insert a wrapper here MUST re-verify drag bounds.
// ───────────────────────────────────────────────────────────────────────────

type WindowId = "agent-team" | "research-vault" | "about-me" | "tools" | "llc";

type WindowDef = {
  id: WindowId;
  title: string;
  defaultPos: { x: number; y: number };
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  bodyClass?: string;
  render: () => React.ReactNode;
};

const WINDOWS: Record<WindowId, WindowDef> = {
  "agent-team": {
    id: "agent-team",
    title: "Agent Team — 12 specialists",
    defaultPos: { x: 240, y: 60 },
    defaultSize: { width: 760, height: 520 },
    minSize: { width: 520, height: 360 },
    render: () => <AgentTeam />,
  },
  "research-vault": {
    id: "research-vault",
    title: "Research Vault",
    defaultPos: { x: 180, y: 110 },
    defaultSize: { width: 820, height: 520 },
    minSize: { width: 560, height: 360 },
    render: () => <ResearchVault />,
  },
  "about-me": {
    id: "about-me",
    title: "About Me — Properties",
    defaultPos: { x: 220, y: 140 },
    defaultSize: { width: 680, height: 500 },
    minSize: { width: 480, height: 360 },
    render: () => <AboutMe />,
  },
  tools: {
    id: "tools",
    title: "Tools I've Tried",
    defaultPos: { x: 260, y: 100 },
    defaultSize: { width: 760, height: 480 },
    minSize: { width: 540, height: 320 },
    render: () => <ToolsITried />,
  },
  llc: {
    id: "llc",
    title: "HonestAlexF LLC — Company Info",
    defaultPos: { x: 280, y: 90 },
    defaultSize: { width: 700, height: 540 },
    minSize: { width: 520, height: 360 },
    render: () => <HonestAlexFLLC />,
  },
};

const DESKTOP_ICONS: {
  id: WindowId;
  label: string;
  Icon: React.FC<{ size?: number }>;
}[] = [
  { id: "research-vault", label: "Research Vault", Icon: FolderIcon },
  { id: "about-me", label: "About Me", Icon: UserIcon },
  { id: "tools", label: "Tools I've Tried", Icon: ToolsIcon },
  { id: "llc", label: "HonestAlexF LLC", Icon: CompanyIcon },
];

const SECTION_HEIGHT = 720;

export default function Desktop() {
  // Initial state per CEO decision: Agent Team open, others as icons.
  const [openWindows, setOpenWindows] = useState<WindowId[]>(["agent-team"]);
  const [zOrder, setZOrder] = useState<WindowId[]>(["agent-team"]);
  const [focused, setFocused] = useState<WindowId | null>("agent-team");
  // Track windows that just opened so we can autofocus their first focusable.
  const [justOpened, setJustOpened] = useState<WindowId | null>(null);

  const open = useCallback((id: WindowId) => {
    setOpenWindows((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setZOrder((prev) => [...prev.filter((x) => x !== id), id]);
    setFocused(id);
    setJustOpened(id);
  }, []);

  const close = useCallback((id: WindowId) => {
    setOpenWindows((prev) => prev.filter((x) => x !== id));
    setZOrder((prev) => prev.filter((x) => x !== id));
    setFocused((cur) => (cur === id ? null : cur));
  }, []);

  const focus = useCallback((id: WindowId) => {
    setZOrder((prev) => [...prev.filter((x) => x !== id), id]);
    setFocused(id);
  }, []);

  return (
    <div
      className="win7 retro-desktop"
      style={{ height: SECTION_HEIGHT }}
      aria-label="Retro desktop section"
    >
      {/* Desktop icons (single-click + Enter or double-click activate) */}
      <div className="desk-icons">
        {DESKTOP_ICONS.map(({ id, label, Icon }) => (
          <DesktopIconButton
            key={id}
            label={label}
            onActivate={() => open(id)}
            isOpen={openWindows.includes(id)}
          >
            <Icon size={48} />
          </DesktopIconButton>
        ))}
      </div>

      {/* Windows. Each <Rnd> is a DIRECT child of the root .retro-desktop div. */}
      {openWindows.map((id) => {
        const def = WINDOWS[id];
        const z = 10 + zOrder.indexOf(id); // 10..999 reserved for windows
        const isFocused = focused === id;
        return (
          <WindowFrame
            key={id}
            def={def}
            zIndex={z}
            isFocused={isFocused}
            onFocus={() => focus(id)}
            onClose={() => close(id)}
            autofocus={justOpened === id}
            clearAutofocus={() =>
              setJustOpened((cur) => (cur === id ? null : cur))
            }
          />
        );
      })}

      {/* Taskbar */}
      <div className="taskbar" role="toolbar" aria-label="Taskbar">
        <div className="start-orb" aria-hidden="true" />
        {openWindows.map((id) => {
          const def = WINDOWS[id];
          return (
            <button
              key={id}
              type="button"
              className={"tb-task" + (focused === id ? " active" : "")}
              onClick={() => focus(id)}
              aria-label={`Focus ${def.title}`}
            >
              {def.title.split(" — ")[0]}
            </button>
          );
        })}
        <div className="tb-spacer" />
        <div className="tb-clock" aria-hidden="true">
          <div>3:14 PM</div>
          <div>4/7/2026</div>
        </div>
      </div>
    </div>
  );
}

// ─── Desktop icon button ───────────────────────────────────────────────────
function DesktopIconButton({
  label,
  children,
  onActivate,
  isOpen,
}: {
  label: string;
  children: React.ReactNode;
  onActivate: () => void;
  isOpen: boolean;
}) {
  // Both single-click+Enter (via the native <button>) AND double-click activate.
  // Single-click does NOT auto-open, matching real desktop behavior.
  return (
    <button
      type="button"
      className={"desk-icon" + (isOpen ? " is-open" : "")}
      onDoubleClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      aria-label={`Open ${label}`}
    >
      <span className="glyph">{children}</span>
      <span className="label">{label}</span>
    </button>
  );
}

// ─── Window frame (Rnd shell) ──────────────────────────────────────────────
function WindowFrame({
  def,
  zIndex,
  isFocused,
  onFocus,
  onClose,
  autofocus,
  clearAutofocus,
}: {
  def: WindowDef;
  zIndex: number;
  isFocused: boolean;
  onFocus: () => void;
  onClose: () => void;
  autofocus: boolean;
  clearAutofocus: () => void;
}) {
  const titleId = `window-${def.id}-title`;
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autofocus) return;
    const el = bodyRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]):not([tabindex="-1"]), [href], [tabindex]:not([tabindex="-1"])',
    );
    el?.focus();
    clearAutofocus();
  }, [autofocus, clearAutofocus]);

  return (
    <Rnd
      default={{
        x: def.defaultPos.x,
        y: def.defaultPos.y,
        width: def.defaultSize.width,
        height: def.defaultSize.height,
      }}
      minWidth={def.minSize.width}
      minHeight={def.minSize.height}
      bounds="parent"
      dragHandleClassName="title-bar"
      // Cancel drag on title-bar control buttons so close/min/max don't drag the window.
      cancel=".title-bar-controls button"
      style={{ zIndex }}
      onMouseDown={onFocus}
    >
      <div
        className={"window glass" + (isFocused ? " active" : "")}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="title-bar">
          <div className="title-bar-text" id={titleId}>
            {def.title}
          </div>
          <div className="title-bar-controls">
            {/* Min/max are visual-only in v1 per plan */}
            <button
              type="button"
              aria-label="Minimize"
              aria-disabled="true"
              tabIndex={-1}
            />
            <button
              type="button"
              aria-label="Maximize"
              aria-disabled="true"
              tabIndex={-1}
            />
            <button
              type="button"
              aria-label={`Close ${def.title}`}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            />
          </div>
        </div>
        <div
          className="window-body"
          ref={bodyRef}
          style={{ padding: 0, flex: 1, overflow: "auto" }}
        >
          {def.render()}
        </div>
      </div>
    </Rnd>
  );
}
