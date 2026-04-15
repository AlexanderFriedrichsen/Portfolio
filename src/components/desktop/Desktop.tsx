import React, { useCallback, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
// NOTE: xp.css (scoped) and desktop.css are imported from Desktop.astro frontmatter,
// not here, to keep the heavy CSS in a single route chunk instead of duplicating
// it into the React island JS chunk. See Desktop.astro for the rationale.

import BootScreen from "./boot/BootScreen";
import LoginScreen from "./boot/LoginScreen";
import WelcomeBalloon from "./boot/WelcomeBalloon";
import { useBootSequence } from "./boot/useBootSequence";
import { audioManager } from "./boot/audioManager";
import AgentTeam from "./windows/AgentTeam";
import ResearchVault from "./windows/ResearchVault";
import AboutMe from "./windows/AboutMe";
import HonestAlexFLLC from "./windows/HonestAlexFLLC";
import Fate from "./windows/Fate";
import Wow from "./windows/Wow";
import iconsData from "./data/icons.json";
import { DesktopGlyph } from "./xp-icons";

// ───────────────────────────────────────────────────────────────────────────
// R7 CRITICAL: The root <div> returned by this component IS the
// `bounds="parent"` target for every <Rnd>. NO Astro wrapper, NO React
// wrapper, NO fragment may sit between this root and any <Rnd>.
// Refactors that insert a wrapper here MUST re-verify drag bounds.
// ───────────────────────────────────────────────────────────────────────────

type WindowId = "agent-team" | "research-vault" | "about-me" | "llc";

type WindowDef = {
  id: WindowId;
  title: string;
  defaultPos: { x: number; y: number };
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  render: () => React.ReactNode;
};

// Static window metadata (position/size/title). The render closures that
// depend on component state are assembled inside the component body.
const WINDOW_META: Record<
  WindowId,
  Omit<WindowDef, "render"> & { render?: undefined }
> = {
  "about-me": {
    id: "about-me",
    title: "About Me — Properties",
    defaultPos: { x: 220, y: 70 },
    defaultSize: { width: 680, height: 500 },
    minSize: { width: 480, height: 360 },
  },
  "agent-team": {
    id: "agent-team",
    title: "Agent Team — 12 specialists",
    defaultPos: { x: 260, y: 90 },
    defaultSize: { width: 760, height: 520 },
    minSize: { width: 520, height: 360 },
  },
  "research-vault": {
    id: "research-vault",
    title: "Research Vault",
    defaultPos: { x: 200, y: 110 },
    defaultSize: { width: 820, height: 520 },
    minSize: { width: 560, height: 360 },
  },
  llc: {
    id: "llc",
    title: "HonestAlexF LLC — Company Info",
    defaultPos: { x: 300, y: 100 },
    defaultSize: { width: 460, height: 260 },
    minSize: { width: 360, height: 200 },
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

// D5: Clock formatter. "h:mm AM/PM" to match the real XP tray clock.
// Polish 2026-04-10: formatClockDate removed — date was dropped from the
// tray to match XP's behavior (date only appeared on hover tooltip).
function formatClockTime(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}

const WINDOW_IDS = new Set<string>(Object.keys(WINDOW_META));

// Media-query gate for the timers/class/hydration path. Kept in sync with
// index.astro and desktop.css @media rule.
const DESKTOP_MQ = "(min-width: 1024px) and (pointer: fine)";
function isDesktopViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(DESKTOP_MQ).matches;
}

type AboutTabId = "general" | "why-site" | "off-keyboard" | "contact";

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
  const [aboutInitialTab, setAboutInitialTab] = useState<AboutTabId>("general");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [balloonKey, setBalloonKey] = useState(0);
  const [balloonForced, setBalloonForced] = useState(false);
  // Fate launches as a fullscreen overlay OUTSIDE the Rnd window system
  // (it's a "you just launched the game" experience, not a window).
  const [fateLaunching, setFateLaunching] = useState(false);
  const fateReturnFocusRef = useRef<HTMLElement | null>(null);
  const closeFate = useCallback(() => {
    setFateLaunching(false);
    // Restore focus to the icon that launched Fate for keyboard users.
    const el = fateReturnFocusRef.current;
    fateReturnFocusRef.current = null;
    if (el && typeof el.focus === "function") {
      queueMicrotask(() => el.focus());
    }
  }, []);
  // Wow follows the same fullscreen-overlay pattern as Fate — a recreation
  // of the WoW login screen (loading → login box over looping cinematic).
  const [wowLaunching, setWowLaunching] = useState(false);
  const wowReturnFocusRef = useRef<HTMLElement | null>(null);
  const closeWow = useCallback(() => {
    setWowLaunching(false);
    const el = wowReturnFocusRef.current;
    wowReturnFocusRef.current = null;
    if (el && typeof el.focus === "function") {
      queueMicrotask(() => el.focus());
    }
  }, []);

  // R4 Fix 3: SSR hydration flash guard. `phase` initializes to 'desktop'
  // on both server and client to avoid hydration mismatch, and only flips
  // to 'boot' inside a useEffect. That leaves a paint window where the
  // fully-rendered desktop is briefly visible before the boot overlay
  // mounts. We render .retro-desktop with `visibility: hidden` until
  // (a) we've hydrated and (b) phase has settled on 'desktop'. We use
  // visibility rather than display:none so Rnd's bounds="parent"
  // measurements keep working (display:none would zero the bounds box).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Phase A: boot → login → desktop ceremony. The overlays render as
  // Fragment siblings of .retro-desktop (NOT wrappers) so R7 is preserved.
  const {
    phase,
    firstDesktopVisit,
    shuttingDown,
    advanceToLogin,
    advanceToDesktop,
    playBootSequence,
    logOff,
    shutdown,
  } = useBootSequence();

  // Preload audio once per island mount; browsers allow metadata fetch
  // without a user gesture. Actual play() is gated behind a user gesture.
  useEffect(() => {
    audioManager.preload();
  }, []);

  // R5 Fix 5: fullscreen state tracking. Browser default F11 often goes
  // through fullscreen at the chrome level (not document.fullscreenElement),
  // but when our clickable hint or tray icon triggers requestFullscreen()
  // the fullscreenchange event fires and we can hide the hint text.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      } else {
        document.documentElement.requestFullscreen?.();
      }
    } catch {
      /* ignore — user-initiated failures are silent */
    }
  }, []);

  const showWelcomeBalloon = useCallback(() => {
    setBalloonForced(true);
    setBalloonKey((k) => k + 1);
  }, []);

  // Trigger refs — captured when a menu/overlay opens so we can restore
  // focus to the trigger on close (WCAG focus-return pattern).
  const startBtnRef = useRef<HTMLButtonElement>(null);

  // Track the previous phase so we can detect the login→desktop transition
  // specifically (not arbitrary re-renders while phase==='desktop').
  const prevPhaseRef = useRef<typeof phase>(phase);
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;
    // Focus-return on login→desktop: when LoginScreen unmounts, focus falls
    // to <body>. Send it to the start button (a sensible taskbar landmark).
    // Gated on firstDesktopVisit so return visitors don't get focus ripped
    // to the start button on every page load.
    if (prev === "login" && phase === "desktop" && firstDesktopVisit) {
      window.setTimeout(() => startBtnRef.current?.focus(), 0);
    }
  }, [phase, firstDesktopVisit]);

  // Build render closures for each window. Kept inside component so they
  // can close over local state (e.g. aboutInitialTab for the Contact tab).
  const WINDOWS: Record<WindowId, WindowDef> = {
    "about-me": {
      ...WINDOW_META["about-me"],
      render: () => <AboutMe initialTab={aboutInitialTab} />,
    },
    "agent-team": {
      ...WINDOW_META["agent-team"],
      render: () => <AgentTeam />,
    },
    "research-vault": {
      ...WINDOW_META["research-vault"],
      render: () => <ResearchVault />,
    },
    llc: { ...WINDOW_META.llc, render: () => <HonestAlexFLLC /> },
  };

  // D5: live clock. Gated: only run on desktop viewport — no point burning
  // timers on mobile where the island isn't even visible.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (!isDesktopViewport()) return;
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
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

  // Activating an icon: open window, follow link, or launch a fullscreen
  // overlay experience (Fate, Wow). Overlay experiences are NOT in the
  // Rnd window system — they render as siblings of .retro-desktop.
  const activateIcon = useCallback(
    (icon: IconDef) => {
      if (icon.id === "fate") {
        const active = document.activeElement;
        fateReturnFocusRef.current =
          active instanceof HTMLElement ? active : null;
        setFateLaunching(true);
        return;
      }
      if (icon.id === "wow") {
        const active = document.activeElement;
        wowReturnFocusRef.current =
          active instanceof HTMLElement ? active : null;
        setWowLaunching(true);
        return;
      }
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
    <>
      <div
        className="xp-scope retro-desktop"
        aria-label="Retro desktop hero"
        style={{
          // R4 Fix 3: hide the desktop until hydration has completed AND
          // useBootSequence has settled on 'desktop'. visibility (not
          // display) so Rnd bounds measurements remain valid.
          visibility: hydrated && phase === "desktop" ? "visible" : "hidden",
          // R6 Fix A: wire the CEO-generated XP wallpaper. BASE_URL pattern
          // (Cipher carry-forward W from PR #5) so a future base change
          // doesn't silently break the wallpaper.
          backgroundImage: `url("${import.meta.env.BASE_URL}assets/pictures/carved-name-hillside.webp")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Desktop icons */}
        <div className="desk-icons">
          {ICONS.map((icon) => (
            <DesktopIconButton
              key={icon.id}
              label={icon.label}
              iconKey={icon.iconKey}
              extBadge={!!icon.extBadge}
              isOpen={
                icon.id === "fate"
                  ? fateLaunching
                  : icon.id === "wow"
                    ? wowLaunching
                    : icon.kind === "window" &&
                      WINDOW_IDS.has(icon.id) &&
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

        {/* Start menu */}
        {startOpen && (
          <StartMenu
            startBtnRef={startBtnRef}
            onClose={() => setStartOpen(false)}
            onPick={(action) => {
              setStartOpen(false);
              // Windows
              if (action === "about") {
                setAboutInitialTab("general");
                openWindow("about-me");
              } else if (action === "contact") {
                setAboutInitialTab("contact");
                openWindow("about-me");
              } else if (action === "agent-team") openWindow("agent-team");
              else if (action === "research-vault")
                openWindow("research-vault");
              // External
              else if (action === "mtg-analyzer")
                window.open(
                  "https://honestafblog.com/mtg-skill-analyzer",
                  "_blank",
                  "noopener",
                );
              else if (action === "resume")
                window.open("/Portfolio/resume/", "_blank", "noopener");
              // System
              else if (action === "logoff") logOff();
              else if (action === "shutdown") shutdown();
            }}
          />
        )}

        {/* Taskbar */}
        <div className="taskbar" role="toolbar" aria-label="Taskbar">
          <button
            ref={startBtnRef}
            type="button"
            className={"start-btn" + (startOpen ? " active" : "")}
            aria-label="Start"
            aria-haspopup="menu"
            aria-expanded={startOpen}
            onClick={(e) => {
              e.stopPropagation();
              setStartOpen((s) => !s);
            }}
          >
            {/* R6 Fix D: replace the CSS fake-orb with the real XP logo PNG.
                The PNG is pre-processed to have transparent background
                (R6 Fix E) so it composites cleanly on the green start-btn. */}
            <img
              src={`${import.meta.env.BASE_URL}assets/pictures/boot/xp-logo-2002.png`}
              alt=""
              className="start-orb-glyph"
              draggable={false}
              aria-hidden="true"
            />
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
            {/* R5 Fix 6: XP-style system tray icons to the LEFT of the clock. */}
            <button
              type="button"
              className="tb-tray-icon"
              aria-label="Show welcome message"
              title="Welcome"
              onClick={showWelcomeBalloon}
            >
              {/* Pixel polish: XP info-bubble SVG replaces CSS-styled 'i'. */}
              <img
                src={`${import.meta.env.BASE_URL}assets/pictures/icons/xp-tray-info-16.svg`}
                alt=""
                width={14}
                height={14}
                className="tb-tray-glyph tb-tray-welcome"
                draggable={false}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              className="tb-tray-icon"
              aria-label={
                isFullscreen ? "Exit full screen" : "Enter full screen"
              }
              title={isFullscreen ? "Exit full screen" : "Enter full screen"}
              onClick={toggleFullscreen}
            >
              {/* R5 r2 Cipher W1: distinct glyphs for enter vs exit. Pixel
                  polish: 16x16 SVGs for consistent rendering. */}
              <img
                src={`${import.meta.env.BASE_URL}assets/pictures/icons/${
                  isFullscreen
                    ? "xp-tray-fullscreen-exit-16.svg"
                    : "xp-tray-fullscreen-16.svg"
                }`}
                alt=""
                width={14}
                height={14}
                className="tb-tray-glyph tb-tray-fullscreen"
                draggable={false}
                aria-hidden="true"
              />
            </button>
            <div className="tb-clock" aria-label="Clock">
              {/* Polish 2026-04-10: real XP only showed time in the tray. */}
              <div>{now ? formatClockTime(now) : ""}</div>
            </div>
          </div>
        </div>

        {/* R5 Fix 4: shutdown grey overlay. Sits above desktop, below the
            boot screen so the boot fade can land on top. */}
        {shuttingDown && (
          <div className="shutdown-overlay" aria-hidden="true" />
        )}
      </div>
      {/* Phase A overlays — Fragment siblings of .retro-desktop (R7 safe). */}
      {phase === "boot" && <BootScreen onSkip={advanceToLogin} />}
      {phase === "login" && (
        <LoginScreen
          onLogin={advanceToDesktop}
          onRestart={playBootSequence}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      )}
      {phase === "desktop" && (firstDesktopVisit || balloonForced) && (
        <WelcomeBalloon key={balloonKey} immediate={balloonKey > 0} />
      )}
      {/* Fate fullscreen launch overlay — sibling of .retro-desktop (R7 safe).
          Rendered outside the window system; covers the whole viewport. */}
      {fateLaunching && <Fate onClose={closeFate} />}
      {/* Wow fullscreen login screen overlay — same R7-safe sibling pattern. */}
      {wowLaunching && <Wow onClose={closeWow} />}
    </>
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
// Taskbar height matches .taskbar CSS (desktop.css). The maximized window
// must not cover the taskbar, so we subtract this from the parent's inner
// height when computing the maximized size.
const TASKBAR_HEIGHT = 30;

type WindowRect = { x: number; y: number; width: number; height: number };

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
  const rndRef = useRef<Rnd>(null);

  // Polish 2026-04-14: Maximize toggle.
  //
  // We track maximized state + the pre-maximize rect so we can restore the
  // exact size/position on second click. When maximized, Rnd is driven by
  // the `position`/`size` props (controlled mode); drag + resize are
  // disabled. When restored, we clear those props so Rnd falls back to its
  // own internal state (uncontrolled), preserving whatever the user had.
  const [maximized, setMaximized] = useState(false);
  const [prevRect, setPrevRect] = useState<WindowRect | null>(null);
  const [maxRect, setMaxRect] = useState<WindowRect | null>(null);

  // Read the current Rnd state, fall back to defaults if the handle isn't
  // ready yet (shouldn't happen in practice since toggle is user-initiated
  // after mount, but keep the fallback to avoid NaNs).
  const readCurrentRect = useCallback((): WindowRect => {
    const rnd = rndRef.current;
    if (rnd) {
      const pos = rnd.getDraggablePosition();
      const el = rnd.getSelfElement();
      if (el) {
        return {
          x: pos.x,
          y: pos.y,
          width: el.offsetWidth,
          height: el.offsetHeight,
        };
      }
    }
    return {
      x: def.defaultPos.x,
      y: def.defaultPos.y,
      width: def.defaultSize.width,
      height: def.defaultSize.height,
    };
  }, [def]);

  // Compute maximized rect from the .retro-desktop parent's inner box, at
  // click time so a resized viewport maximizes correctly. Taskbar height is
  // subtracted so the window never sits under the taskbar.
  const computeMaxRect = useCallback((): WindowRect => {
    const rnd = rndRef.current;
    const el = rnd?.getSelfElement();
    const parent = el?.parentElement; // .retro-desktop
    if (parent) {
      const r = parent.getBoundingClientRect();
      return {
        x: 0,
        y: 0,
        width: Math.max(def.minSize.width, Math.floor(r.width)),
        height: Math.max(
          def.minSize.height,
          Math.floor(r.height - TASKBAR_HEIGHT),
        ),
      };
    }
    // Viewport fallback if parent isn't resolvable for any reason.
    return {
      x: 0,
      y: 0,
      width:
        typeof window !== "undefined"
          ? window.innerWidth
          : def.defaultSize.width,
      height:
        typeof window !== "undefined"
          ? window.innerHeight - TASKBAR_HEIGHT
          : def.defaultSize.height,
    };
  }, [def]);

  const toggleMaximize = useCallback(() => {
    if (maximized) {
      setMaximized(false);
      setMaxRect(null);
      // prevRect stays set briefly so the Rnd position/size props snap back;
      // clearing happens on next toggle.
    } else {
      const saved = readCurrentRect();
      setPrevRect(saved);
      setMaxRect(computeMaxRect());
      setMaximized(true);
    }
  }, [maximized, readCurrentRect, computeMaxRect]);

  // While maximized, keep filling the parent on viewport resize. Otherwise
  // a fullscreen toggle or window resize would leave a stale box size.
  useEffect(() => {
    if (!maximized) return;
    const onResize = () => setMaxRect(computeMaxRect());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [maximized, computeMaxRect]);

  useEffect(() => {
    if (!autofocus) return;
    const el = bodyRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]):not([tabindex="-1"]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    el?.focus();
    clearAutofocus();
  }, [autofocus, clearAutofocus]);

  // Rnd prop shape depends on maximized state:
  // - maximized: pass `position` + `size` (controlled) so Rnd is pinned
  // - restored: pass `default` only; let Rnd manage its own state
  //
  // When we transition maximized→restored we want Rnd to jump back to
  // prevRect. We do that by passing prevRect as position/size for one
  // render, then clearing it on the next interaction. The simplest
  // implementation: keep controlled props whenever we have an active
  // prevRect we want to apply. We reset prevRect when the user drags or
  // resizes so subsequent maximize/restore cycles start fresh.
  const controlledRect: WindowRect | null = maximized ? maxRect : prevRect;
  const rndPosition = controlledRect
    ? { x: controlledRect.x, y: controlledRect.y }
    : undefined;
  const rndSize = controlledRect
    ? { width: controlledRect.width, height: controlledRect.height }
    : undefined;

  // When restored, clear prevRect once the user interacts — otherwise the
  // controlled props would keep pinning the window to the saved rect.
  const clearPrevAfterRestore = useCallback(() => {
    if (!maximized && prevRect) setPrevRect(null);
  }, [maximized, prevRect]);

  return (
    <Rnd
      ref={rndRef}
      default={{
        x: def.defaultPos.x,
        y: def.defaultPos.y,
        width: def.defaultSize.width,
        height: def.defaultSize.height,
      }}
      position={rndPosition}
      size={rndSize}
      minWidth={def.minSize.width}
      minHeight={def.minSize.height}
      bounds="parent"
      dragHandleClassName="title-bar"
      cancel=".title-bar-controls button"
      disableDragging={maximized}
      enableResizing={!maximized}
      onDragStart={clearPrevAfterRestore}
      onResizeStart={clearPrevAfterRestore}
      style={{ zIndex }}
      onMouseDown={onFocus}
    >
      <div
        className={
          "window" +
          (isFocused ? " active" : "") +
          (maximized ? " is-maximized" : "")
        }
        role="region"
        aria-labelledby={titleId}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="title-bar"
          onDoubleClick={(e) => {
            // Double-click on the title-bar text region toggles maximize
            // (standard XP behavior). Ignore double-clicks that originated
            // from the controls buttons so Close/Min/Max don't double-fire.
            const target = e.target as HTMLElement;
            if (target.closest(".title-bar-controls")) return;
            e.stopPropagation();
            toggleMaximize();
          }}
        >
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
              aria-label={maximized ? "Restore" : "Maximize"}
              title={maximized ? "Restore" : "Maximize"}
              onClick={(e) => {
                e.stopPropagation();
                toggleMaximize();
              }}
            />
            <button
              type="button"
              aria-label="Close"
              title={`Close ${def.title}`}
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
          style={{ flex: 1, overflow: "auto" }}
        >
          {def.render()}
        </div>
      </div>
    </Rnd>
  );
}

// ─── Start menu ────────────────────────────────────────────────────────────
type StartAction =
  | "about"
  | "resume"
  | "contact"
  | "agent-team"
  | "research-vault"
  | "mtg-analyzer"
  | "logoff"
  | "shutdown";

type StartItem = {
  action: StartAction;
  label: string;
  iconKey: string;
  external?: boolean;
};

// Post-cull roster: only destinations that actually exist. Left column is
// the "core" identity / work surface; right column is external launches.
const SM_LEFT: StartItem[] = [
  { action: "about", label: "About Me", iconKey: "user" },
  { action: "contact", label: "Contact", iconKey: "user" },
  { action: "agent-team", label: "Agent Team", iconKey: "agents" },
  { action: "research-vault", label: "Research Vault", iconKey: "folder" },
];
const SM_RIGHT: StartItem[] = [
  {
    action: "mtg-analyzer",
    label: "MTG Skill Analyzer",
    iconKey: "mtg",
    external: true,
  },
  { action: "resume", label: "Resume", iconKey: "resume", external: true },
];
const SM_ALL: StartItem[] = [...SM_LEFT, ...SM_RIGHT];

function StartMenu({
  onClose,
  onPick,
  startBtnRef,
}: {
  onClose: () => void;
  onPick: (a: StartAction) => void;
  startBtnRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Roving tabindex across menuitems (left then right column, then footer
  // Log Off / Shut Down).
  const itemCount = SM_ALL.length + 2; // +2 footer items
  const [focusIdx, setFocusIdx] = useState(0);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Click-outside to dismiss.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      const target = e.target as Node;
      if (!ref.current.contains(target)) {
        const startBtn = (target as Element)?.closest?.(".start-btn");
        if (!startBtn) onClose();
      }
    };
    const id = window.setTimeout(
      () => document.addEventListener("mousedown", handler),
      0,
    );
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose]);

  // On mount: focus first item. On unmount: restore focus to the Start button.
  useEffect(() => {
    const toRestore = startBtnRef.current;
    itemRefs.current[0]?.focus();
    return () => {
      // Only restore if focus is still somewhere inside the menu (avoid
      // stealing focus if the user clicked a window open).
      const active = document.activeElement;
      if (!active || !ref.current || ref.current.contains(active)) {
        window.setTimeout(() => toRestore?.focus?.(), 0);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus the item matching focusIdx.
  useEffect(() => {
    itemRefs.current[focusIdx]?.focus();
  }, [focusIdx]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx((i) => (i + 1) % itemCount);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx((i) => (i - 1 + itemCount) % itemCount);
    }
    // Enter/Space naturally activate the focused <button>, no override.
  };

  const setRef = (idx: number) => (el: HTMLButtonElement | null) => {
    itemRefs.current[idx] = el;
  };

  const renderItem = (item: StartItem, idx: number) => (
    <button
      key={item.action}
      ref={setRef(idx)}
      type="button"
      className="sm-item"
      role="menuitem"
      tabIndex={focusIdx === idx ? 0 : -1}
      onClick={() => onPick(item.action)}
    >
      <DesktopGlyph kind={item.iconKey} small />
      <span className="sm-label">{item.label}</span>
      {item.external && (
        <span className="sm-ext" aria-hidden="true">
          ↗
        </span>
      )}
    </button>
  );

  return (
    <div
      className="start-menu"
      role="menu"
      aria-label="Start menu"
      ref={ref}
      onKeyDown={onKeyDown}
    >
      <div className="sm-header">
        <div className="sm-avatar" aria-hidden="true">
          <DesktopGlyph kind="user" />
        </div>
        <div className="sm-user">Alex Friedrichsen</div>
      </div>
      <div className="sm-body">
        <div className="sm-col left">
          {SM_LEFT.map((item, i) => renderItem(item, i))}
        </div>
        <div className="sm-col right">
          {SM_RIGHT.map((item, i) => renderItem(item, SM_LEFT.length + i))}
        </div>
      </div>
      <div className="sm-footer">
        <button
          ref={setRef(SM_ALL.length)}
          type="button"
          className="sm-logoff"
          role="menuitem"
          tabIndex={focusIdx === SM_ALL.length ? 0 : -1}
          onClick={() => onPick("logoff")}
        >
          Log Off
        </button>
        <button
          ref={setRef(SM_ALL.length + 1)}
          type="button"
          className="sm-shutdown"
          role="menuitem"
          tabIndex={focusIdx === SM_ALL.length + 1 ? 0 : -1}
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

// R5: BSOD component removed. Log Off and Shut Down now run proper XP-style
// flows (logoff → login screen; shutdown → grey overlay → boot replay).
