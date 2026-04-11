// XP-flavored desktop icon glyphs. Inline SVG, no bitmaps.
// One component, switches on `kind` so the bundle stays small.
//
// Polish 2026-04-10:
//   - Size bumped 36 → 48 to match real XP desktop icons (viewBox unchanged
//     at 0 0 36 36 — the existing geometry scales up cleanly).
//   - Higher-fidelity, more authentic XP-era glyphs for user / folder /
//     tools / company / agents / blog / resume. Gradients + highlights
//     instead of flat fills, so they read as real icons at 48px.
//   - mtg / wonders / gecco / handshake / fate kept as-is per brief.
import React from "react";

type Props = { kind: string; small?: boolean };

export function DesktopGlyph({ kind, small = false }: Props) {
  const size = small ? 18 : 48;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 36 36",
    "aria-hidden": true as const,
  };
  switch (kind) {
    case "user": {
      // "My Documents"-adjacent user profile: manila card with a head &
      // shoulders silhouette stamped on the front. XP Luna palette.
      return (
        <svg {...common}>
          <defs>
            <linearGradient id="user-card" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff4c2" />
              <stop offset="1" stopColor="#e8b84a" />
            </linearGradient>
            <linearGradient id="user-head" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe3b3" />
              <stop offset="1" stopColor="#d99a4a" />
            </linearGradient>
            <linearGradient id="user-shirt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6aa8ff" />
              <stop offset="1" stopColor="#1e4fb8" />
            </linearGradient>
          </defs>
          <path
            d="M5 7h16l4 4h6v21H5z"
            fill="url(#user-card)"
            stroke="#6a4a0a"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M5 11h26" stroke="#6a4a0a" strokeWidth="0.8" opacity="0.5" />
          <circle
            cx="18"
            cy="17"
            r="4.5"
            fill="url(#user-head)"
            stroke="#6a3a0a"
            strokeWidth="1"
          />
          <path
            d="M9 31c0-5 4-8 9-8s9 3 9 8"
            fill="url(#user-shirt)"
            stroke="#0a246a"
            strokeWidth="1"
          />
        </svg>
      );
    }
    case "folder": {
      // Canonical XP manila folder: back tab peeking up, front flap with
      // highlight + shadow for depth.
      return (
        <svg {...common}>
          <defs>
            <linearGradient id="folder-back" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe08a" />
              <stop offset="1" stopColor="#d68a1a" />
            </linearGradient>
            <linearGradient id="folder-front" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffeaa0" />
              <stop offset="0.5" stopColor="#f7c44a" />
              <stop offset="1" stopColor="#c67a0a" />
            </linearGradient>
          </defs>
          {/* back tab */}
          <path
            d="M3 11h11l3 3h16v4H3z"
            fill="url(#folder-back)"
            stroke="#6a4008"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* front flap */}
          <path
            d="M3 14h30v17H3z"
            fill="url(#folder-front)"
            stroke="#6a4008"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* top highlight */}
          <path d="M4 15h28" stroke="#fff4c2" strokeWidth="0.8" opacity="0.9" />
        </svg>
      );
    }
    case "tools": {
      // Control Panel style: hammer + wrench crossed on a square tile.
      return (
        <svg {...common}>
          <defs>
            <linearGradient id="tools-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eef2fa" />
              <stop offset="1" stopColor="#a9b6cf" />
            </linearGradient>
          </defs>
          <rect
            x="4"
            y="4"
            width="28"
            height="28"
            rx="2"
            fill="url(#tools-bg)"
            stroke="#3a4a66"
            strokeWidth="1"
          />
          {/* wrench (silver) */}
          <path
            d="M8 27l12-12 3 3-12 12zM19 13a4 4 0 1 1 4 4l-2-2z"
            fill="#d8dce6"
            stroke="#3a4a66"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* hammer head */}
          <path
            d="M24 7l5 5-2 2-5-5z"
            fill="#c8ccd8"
            stroke="#3a4a66"
            strokeWidth="1"
          />
          {/* hammer handle */}
          <path
            d="M14 25l8-8 3 3-8 8z"
            fill="#a06a2a"
            stroke="#3a1a00"
            strokeWidth="1"
          />
        </svg>
      );
    }
    case "company": {
      // Briefcase: classic XP "My Briefcase" shape, leather + brass clasp.
      return (
        <svg {...common}>
          <defs>
            <linearGradient id="case-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#c68a3a" />
              <stop offset="0.5" stopColor="#8a4a0a" />
              <stop offset="1" stopColor="#5a2a00" />
            </linearGradient>
            <linearGradient id="case-handle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6a3a0a" />
              <stop offset="1" stopColor="#3a1a00" />
            </linearGradient>
          </defs>
          {/* handle */}
          <path
            d="M13 10v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"
            fill="none"
            stroke="url(#case-handle)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* body */}
          <rect
            x="4"
            y="11"
            width="28"
            height="20"
            rx="1.5"
            fill="url(#case-body)"
            stroke="#2a1000"
            strokeWidth="1"
          />
          {/* center divider */}
          <rect x="4" y="19" width="28" height="1.5" fill="#2a1000" />
          {/* brass clasp */}
          <rect
            x="16"
            y="17"
            width="4"
            height="5"
            fill="#f7d65a"
            stroke="#6a4a00"
            strokeWidth="0.8"
          />
        </svg>
      );
    }
    case "agents": {
      // Networked computers: two CRT monitors linked by a cable, XP
      // "My Network Places" lineage.
      return (
        <svg {...common}>
          <defs>
            <linearGradient id="mon-screen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4aa8ff" />
              <stop offset="1" stopColor="#0a2a6a" />
            </linearGradient>
            <linearGradient id="mon-case" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f0f0ea" />
              <stop offset="1" stopColor="#a8a89a" />
            </linearGradient>
          </defs>
          {/* cable link */}
          <path
            d="M10 22c6 6 12 6 18 0"
            fill="none"
            stroke="#2a2a2a"
            strokeWidth="1"
          />
          {/* back monitor */}
          <rect
            x="14"
            y="4"
            width="18"
            height="14"
            rx="1"
            fill="url(#mon-case)"
            stroke="#3a3a2a"
            strokeWidth="1"
          />
          <rect
            x="16"
            y="6"
            width="14"
            height="9"
            fill="url(#mon-screen)"
            stroke="#0a1a3a"
            strokeWidth="0.8"
          />
          <rect x="20" y="18" width="6" height="2" fill="#a8a89a" />
          {/* front monitor */}
          <rect
            x="3"
            y="14"
            width="18"
            height="14"
            rx="1"
            fill="url(#mon-case)"
            stroke="#3a3a2a"
            strokeWidth="1"
          />
          <rect
            x="5"
            y="16"
            width="14"
            height="9"
            fill="url(#mon-screen)"
            stroke="#0a1a3a"
            strokeWidth="0.8"
          />
          <rect x="9" y="28" width="6" height="2" fill="#a8a89a" />
        </svg>
      );
    }
    case "mtg":
      return (
        <svg {...common}>
          <rect
            x="6"
            y="4"
            width="24"
            height="28"
            rx="2"
            fill="#fff"
            stroke="#333"
            strokeWidth="1.5"
          />
          <text
            x="18"
            y="22"
            textAnchor="middle"
            fontFamily="Tahoma"
            fontSize="14"
            fontWeight="bold"
            fill="#c00"
          >
            M
          </text>
        </svg>
      );
    case "wonders":
      return (
        <svg {...common}>
          <polygon
            points="18,3 33,12 28,30 8,30 3,12"
            fill="#7a3aa8"
            stroke="#2a0d4a"
            strokeWidth="1.5"
          />
          <circle
            cx="18"
            cy="18"
            r="5"
            fill="#ffd95a"
            stroke="#7a5800"
            strokeWidth="1.5"
          />
        </svg>
      );
    case "gecco":
      return (
        <svg {...common}>
          <rect
            x="6"
            y="4"
            width="24"
            height="28"
            fill="#fff"
            stroke="#333"
            strokeWidth="1.5"
          />
          <line
            x1="10"
            y1="10"
            x2="26"
            y2="10"
            stroke="#333"
            strokeWidth="1.2"
          />
          <line
            x1="10"
            y1="14"
            x2="26"
            y2="14"
            stroke="#333"
            strokeWidth="1.2"
          />
          <line
            x1="10"
            y1="18"
            x2="22"
            y2="18"
            stroke="#333"
            strokeWidth="1.2"
          />
          <line
            x1="10"
            y1="22"
            x2="26"
            y2="22"
            stroke="#333"
            strokeWidth="1.2"
          />
          <text
            x="18"
            y="31"
            textAnchor="middle"
            fontFamily="Tahoma"
            fontSize="6"
            fontWeight="bold"
            fill="#333"
          >
            GECCO
          </text>
        </svg>
      );
    case "blog": {
      // Internet Explorer "e" on a globe — the real XP IE shortcut glyph.
      return (
        <svg {...common}>
          <defs>
            <radialGradient id="ie-globe" cx="0.35" cy="0.35" r="0.75">
              <stop offset="0" stopColor="#eaf4ff" />
              <stop offset="0.5" stopColor="#6aa8ff" />
              <stop offset="1" stopColor="#0a3a9a" />
            </radialGradient>
          </defs>
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="url(#ie-globe)"
            stroke="#0a246a"
            strokeWidth="1.2"
          />
          {/* meridians */}
          <ellipse
            cx="18"
            cy="18"
            rx="6"
            ry="14"
            fill="none"
            stroke="#0a246a"
            strokeWidth="0.8"
            opacity="0.5"
          />
          <line
            x1="4"
            y1="18"
            x2="32"
            y2="18"
            stroke="#0a246a"
            strokeWidth="0.8"
            opacity="0.5"
          />
          {/* bold italic e */}
          <text
            x="19"
            y="26"
            textAnchor="middle"
            fontFamily="Times New Roman, serif"
            fontSize="22"
            fontStyle="italic"
            fontWeight="bold"
            fill="#fff"
            stroke="#0a246a"
            strokeWidth="0.6"
          >
            e
          </text>
          {/* orbit ring */}
          <ellipse
            cx="18"
            cy="15"
            rx="16"
            ry="5"
            fill="none"
            stroke="#f7c44a"
            strokeWidth="1.4"
            transform="rotate(-18 18 15)"
          />
        </svg>
      );
    }
    case "handshake":
      // SVG glyph placeholder per task brief — flag as carry-forward.
      // TODO(carry-forward): replace with a real handshake icon when one is sourced.
      return (
        <svg {...common}>
          <path
            d="M4 18 L14 14 L20 20 L28 12 L32 18 L28 26 L18 22 L8 28 Z"
            fill="#ff8a3a"
            stroke="#7a3a00"
            strokeWidth="1.5"
          />
          <circle cx="18" cy="20" r="2" fill="#fff" />
        </svg>
      );
    case "fate":
      // Fate uses a raster icon from the game (the only bitmap glyph in this
      // set). Rendered as an <img> instead of inline SVG. BASE_URL-templated.
      return (
        <img
          src={`${import.meta.env.BASE_URL}assets/pictures/Fate-Icon-72px.webp`}
          alt=""
          width={size}
          height={size}
          draggable={false}
          aria-hidden="true"
          style={{ display: "block", imageRendering: "auto" }}
        />
      );
    case "resume": {
      // Notepad-style document with a dog-ear fold and clean ruled lines.
      return (
        <svg {...common}>
          <defs>
            <linearGradient id="doc-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#e4e4d8" />
            </linearGradient>
          </defs>
          <path
            d="M6 3h18l6 6v24H6z"
            fill="url(#doc-body)"
            stroke="#3a3a2a"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          {/* dog-ear fold */}
          <path
            d="M24 3v6h6"
            fill="#d8d8c8"
            stroke="#3a3a2a"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          {/* ruled lines */}
          <line
            x1="10"
            y1="14"
            x2="26"
            y2="14"
            stroke="#5a6a8a"
            strokeWidth="0.9"
          />
          <line
            x1="10"
            y1="18"
            x2="26"
            y2="18"
            stroke="#5a6a8a"
            strokeWidth="0.9"
          />
          <line
            x1="10"
            y1="22"
            x2="22"
            y2="22"
            stroke="#5a6a8a"
            strokeWidth="0.9"
          />
          <line
            x1="10"
            y1="26"
            x2="26"
            y2="26"
            stroke="#5a6a8a"
            strokeWidth="0.9"
          />
          <line
            x1="10"
            y1="30"
            x2="20"
            y2="30"
            stroke="#5a6a8a"
            strokeWidth="0.9"
          />
        </svg>
      );
    }
    case "wow":
      // World of Warcraft — stylized portal/rune glyph. Dark arcane circle
      // with a golden "W" rune at its center, evoking the Dark Portal and
      // the game's iconic gold-on-black login typography.
      return (
        <svg {...common}>
          <defs>
            <radialGradient id="wow-portal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6a1f8a" />
              <stop offset="55%" stopColor="#2a0844" />
              <stop offset="100%" stopColor="#0a0015" />
            </radialGradient>
          </defs>
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="url(#wow-portal)"
            stroke="#d4a84a"
            strokeWidth="1.5"
          />
          <circle
            cx="18"
            cy="18"
            r="11"
            fill="none"
            stroke="#d4a84a"
            strokeWidth="0.8"
            opacity="0.6"
          />
          <text
            x="18"
            y="24"
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontSize="18"
            fontWeight="bold"
            fill="#f0c850"
            stroke="#7a4a00"
            strokeWidth="0.5"
          >
            W
          </text>
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect
            x="4"
            y="4"
            width="28"
            height="28"
            fill="#bfbfbf"
            stroke="#333"
            strokeWidth="1.5"
          />
        </svg>
      );
  }
}
