import React, { useCallback, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
// NOTE: xp.css (scoped) and desktop.css are imported from Desktop.astro frontmatter,
// not here, to keep the heavy CSS in a single route chunk instead of duplicating
// it into the React island JS chunk. See Desktop.astro for the rationale.

import AgentTeam from "./windows/AgentTeam";
import ResearchVault from "./windows/ResearchVault";
import AboutMe from "./windows/AboutMe";
import ToolsITried from "./windows/ToolsITried";
import HonestAlexFLLC from "./windows/HonestAlexFLLC";
import MtgAnalyzer from "./windows/MtgAnalyzer";
import iconsData from "./data/icons.json";
import { DesktopGlyph } from "./xp-icons";

// ───────────────────────────────────────────────────────────────────────────
// R7 CRITICAL: The root <div> returned by this component IS the
// `bounds="parent"` target for every <Rnd>. NO Astro wrapper, NO React
// wrapper, NO fragment may sit between this root and any <Rnd>.
// Refactors that insert a wrapper here MUST re-verify drag bounds.
// ───────────────────────────────────────────────────────────────────────────

type WindowId =
  | "agent-team"
  | "research-vault"
  | "about-me"
  | "tools"
  | "llc"
  | "mtg-analyzer";

type WindowDef = {
  id: WindowId;
  title: string;
  defaultPos: { x: number; y: number };
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  render: () => React.ReactNode;
};

const WINDOWS: Record<WindowId, WindowDef> = {
  "about-me": {
    id: "about-me",
    title: "About Me — Properties",
    defaultPos: { x: 220, y: 70 },
    defaultSize: { width: 680, height: 500 },
    minSize: { width: 480, height: 360 },
    render: () => <AboutMe />,
  },
  "agent-team": {
    id: "agent-team",
    title: "Agent Team — 12 specialists",
    defaultPos: { x: 260, y: 90 },
    defaultSize: { width: 760, height: 520 },
    minSize: { width: 520, height: 360 },
    render: () => <AgentTeam />,
  },
  "research-vault": {
    id: "research-vault",
    title: "Research Vault",
    defaultPos: { x: 200, y: 110 },
    defaultSize: { width: 820, height: 520 },
    minSize: { width: 560, height: 360 },
    render: () => <ResearchVault />,
  },
  tools: {
    id: "tools",
    title: "Tools I've Tried",
    defaultPos: { x: 280, y: 130 },
    defaultSize: { width: 760, height: 480 },
    minSize: { width: 540, height: 320 },
    render: () => <ToolsITried />,
  },
  llc: {
    id: "llc",
    title: "HonestAlexF LLC — Company Info",
    defaultPos: { x: 300, y: 100 },
    defaultSize: { width: 700, height: 540 },
    minSize: { width: 520, height: 360 },
    render: () => <HonestAlexFLLC />,
  },
  "mtg-analyzer": {
    id: "mtg-analyzer",
    title: "MTG Skill Analyzer",
    defaultPos: { x: 320, y: 80 },
    defaultSize: { width: 720, height: 560 },
    minSize: { width: 520, height: 360 },
    render: () => <MtgAnalyzer />,
  },
};

type IconDef = {
  id: string;
  label: string;
  kind: "window" | "link";
  href?: string;
  external?: boolean;
  extBadge?: boolean;
  openByDefault?: boolean;
  iconKey: string;
  todo?: string;
};

const ICONS = iconsData as IconDef[];

// D5: Clock formatters. "h:mm AM/PM" / "M/D/YYYY" to match prior hardcoded text.
function formatClockTime(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}
function formatClockDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

const WINDOW_IDS = new Set<string>(Object.keys(WINDOWS));

export default function Desktop() {
  const defaultOpen = ICONS.filter(
    (i) => i.kind === "window" && i.openByDefault && WINDOW_IDS.has(i.id),
  ).map((i) => i.id as WindowId);

  const [openWindows, setOpenWindows] = useState<WindowId[]>(defaultOpen);
  const [zOrder, setZOrder] = useState<WindowId[]>(defaultOpen);
  const [focused, setFocused] = useState<WindowId | null>(
    defaultOpen[0] ?? null,
  );
  const [justOpened, setJustOpened] = useState<WindowId | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [bsod, setBsod] = useState(false);
  const [cookiesVisible, setCookiesVisible] = useState(false);

  // D5: live clock. Client-only.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Cookies popup: 1.5s delay after mount.
  useEffect(() => {
    const id = window.setTimeout(() => setCookiesVisible(true), 1500);
    return () => window.clearTimeout(id);
  }, []);

  const openWindow = useCallback((id: WindowId) => {
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

  // Activating an icon: open window, or follow link.
  const activateIcon = useCallback(
    (icon: IconDef) => {
      if (icon.kind === "window" && WINDOW_IDS.has(icon.id)) {
        openWindow(icon.id as WindowId);
      } else if (icon.kind === "link" && icon.href) {
        if (icon.external) window.open(icon.href, "_blank", "noopener");
        else window.location.href = icon.href;
      }
    },
    [openWindow],
  );

  return (
    <div className="xp-scope retro-desktop" aria-label="Retro desktop hero">
      {/* Wallpaper layer (Bliss CSS gradient stand-in).
          TODO: swap to bliss.jpg once /assets/wallpapers/bliss.jpg is sourced.
          Single-line swap: change .retro-desktop background in desktop.css. */}

      {/* Desktop icons */}
      <div className="desk-icons">
        {ICONS.map((icon) => (
          <DesktopIconButton
            key={icon.id}
            label={icon.label}
            iconKey={icon.iconKey}
            extBadge={!!icon.extBadge}
            isOpen={
              icon.kind === "window" &&
              openWindows.includes(icon.id as WindowId)
            }
            onActivate={() => activateIcon(icon)}
          />
        ))}
      </div>

      {/* Windows. Each <Rnd> is a DIRECT child of the root .retro-desktop. */}
      {openWindows.map((id) => {
        const def = WINDOWS[id];
        const z = 10 + zOrder.indexOf(id);
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

      {/* Cookies popup (now a child of Desktop, not index.astro) */}
      {cookiesVisible && (
        <CookiesDialog onClose={() => setCookiesVisible(false)} />
      )}

      {/* Start menu */}
      {startOpen && (
        <StartMenu
          onClose={() => setStartOpen(false)}
          onPick={(action) => {
            setStartOpen(false);
            if (action === "about") openWindow("about-me");
            else if (action === "resume")
              window.open("/Portfolio/resume/", "_blank", "noopener");
            else if (action === "contact") openWindow("about-me");
            else if (action === "shutdown") setBsod(true);
          }}
        />
      )}

      {/* BSOD overlay */}
      {bsod && <Bsod onDismiss={() => setBsod(false)} />}

      {/* Taskbar */}
      <div className="taskbar" role="toolbar" aria-label="Taskbar">
        <button
          type="button"
          className={"start-btn" + (startOpen ? " active" : "")}
          aria-label="Start"
          aria-expanded={startOpen}
          onClick={(e) => {
            e.stopPropagation();
            setStartOpen((s) => !s);
          }}
        >
          <span className="start-orb-glyph" aria-hidden="true" />
          <span className="start-text">start</span>
        </button>
        <div className="tb-tasks">
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
        </div>
        <div className="tb-tray">
          <div className="tb-clock" aria-label="Clock">
            <div>{now ? formatClockTime(now) : ""}</div>
            <div>{now ? formatClockDate(now) : ""}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Desktop icon button ───────────────────────────────────────────────────
function DesktopIconButton({
  label,
  iconKey,
  extBadge,
  isOpen,
  onActivate,
}: {
  label: string;
  iconKey: string;
  extBadge: boolean;
  isOpen: boolean;
  onActivate: () => void;
}) {
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
      <span className="glyph">
        <DesktopGlyph kind={iconKey} />
        {extBadge && (
          <span className="ext" aria-hidden="true" title="Opens in new tab">
            ↗
          </span>
        )}
      </span>
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
      'button:not([disabled]):not([tabindex="-1"]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
      cancel=".title-bar-controls button"
      style={{ zIndex }}
      onMouseDown={onFocus}
    >
      <div
        className={"window" + (isFocused ? " active" : "")}
        role="region"
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
            <button
              type="button"
              aria-label="Minimize"
              disabled
              tabIndex={-1}
            />
            <button
              type="button"
              aria-label="Maximize"
              disabled
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

// ─── Cookies dialog (XP-styled, lives inside .retro-desktop) ───────────────
function CookiesDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="cookies-dialog window"
      role="dialog"
      aria-label="Cookies and vibes"
    >
      <div className="title-bar">
        <div className="title-bar-text">cookies and vibes</div>
        <div className="title-bar-controls">
          <button
            type="button"
            aria-label="Close cookies dialog"
            onClick={onClose}
          />
        </div>
      </div>
      <div className="window-body">
        <div className="cookie-row">
          <div className="cookie-icon" aria-hidden="true" />
          <div>
            <p style={{ margin: "0 0 4px" }}>
              <strong>This site serves cookies and vibes.</strong>
            </p>
            <p style={{ margin: 0 }}>
              By continuing to browse, you accept both. The vibes are
              non-optional.
            </p>
          </div>
        </div>
        <div className="dialog-buttons">
          <button type="button" onClick={onClose}>
            OK
          </button>
          <button type="button" onClick={onClose}>
            More info
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Start menu ────────────────────────────────────────────────────────────
type StartAction = "about" | "resume" | "contact" | "shutdown";

function StartMenu({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (a: StartAction) => void;
}) {
  // Click-outside to dismiss.
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      const target = e.target as Node;
      if (!ref.current.contains(target)) {
        // Don't dismiss when the click was on the start button itself —
        // its onClick toggles state, this would re-open immediately.
        const startBtn = (target as Element)?.closest?.(".start-btn");
        if (!startBtn) onClose();
      }
    };
    // Defer to next tick so the click that opened us doesn't immediately close us.
    const id = window.setTimeout(
      () => document.addEventListener("mousedown", handler),
      0,
    );
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose]);

  return (
    <div className="start-menu" role="menu" aria-label="Start menu" ref={ref}>
      <div className="sm-header">
        <div className="sm-avatar" aria-hidden="true">
          <DesktopGlyph kind="user" />
        </div>
        <div className="sm-user">Alex Friedrichsen</div>
      </div>
      <div className="sm-body">
        <button
          type="button"
          className="sm-item"
          role="menuitem"
          onClick={() => onPick("about")}
        >
          <DesktopGlyph kind="user" small />
          About Me
        </button>
        <button
          type="button"
          className="sm-item"
          role="menuitem"
          onClick={() => onPick("resume")}
        >
          <DesktopGlyph kind="resume" small />
          Resume <span style={{ marginLeft: "auto", fontSize: 10 }}>↗</span>
        </button>
        <button
          type="button"
          className="sm-item"
          role="menuitem"
          onClick={() => onPick("contact")}
        >
          <DesktopGlyph kind="blog" small />
          Contact
        </button>
      </div>
      <div className="sm-footer">
        <button
          type="button"
          className="sm-shutdown"
          onClick={() => onPick("shutdown")}
        >
          <span className="pwr" aria-hidden="true">
            ⏻
          </span>
          Shut Down
        </button>
      </div>
    </div>
  );
}

// ─── BSOD ──────────────────────────────────────────────────────────────────
function Bsod({ onDismiss }: { onDismiss: () => void }) {
  // Click anywhere or any key dismisses.
  useEffect(() => {
    const click = () => onDismiss();
    const key = () => onDismiss();
    document.addEventListener("click", click);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("click", click);
      document.removeEventListener("keydown", key);
    };
  }, [onDismiss]);

  return (
    <div
      className="bsod"
      role="alertdialog"
      aria-label="System error"
      tabIndex={-1}
    >
      <div className="bsod-inner">
        <p>
          A problem has been detected and Windows has been shut down to prevent
          damage to your computer.
        </p>
        <p>PORTFOLIO_VIBES_OVERFLOW</p>
        <p>
          If this is the first time you've seen this stop error screen, restart
          your computer. If this screen appears again, follow these steps:
        </p>
        <p>
          Check to be sure you have adequate disk space. If a driver is
          identified in the stop message, disable the driver or check with the
          manufacturer for driver updates. Try changing video adapters.
        </p>
        <p>Technical information:</p>
        <p>
          *** STOP: 0x000000F3 (0x00000420, 0x0000C0DE, 0xDEADBEEF, 0x00000000)
        </p>
        <p style={{ marginTop: 24 }}>
          Press any key, or click anywhere, to continue _
        </p>
      </div>
    </div>
  );
}
