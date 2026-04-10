// XP-flavored desktop icon glyphs. Inline SVG, no bitmaps.
// One component, switches on `kind` so the bundle stays small.
import React from "react";

type Props = { kind: string; small?: boolean };

export function DesktopGlyph({ kind, small = false }: Props) {
  const size = small ? 18 : 36;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 36 36",
    "aria-hidden": true as const,
  };
  switch (kind) {
    case "user":
      return (
        <svg {...common}>
          <circle
            cx="18"
            cy="13"
            r="6"
            fill="#ffe0b2"
            stroke="#5a3a14"
            strokeWidth="1.5"
          />
          <path
            d="M6 32c0-7 6-11 12-11s12 4 12 11"
            fill="#4a8bf0"
            stroke="#0a246a"
            strokeWidth="1.5"
          />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path
            d="M3 10h12l3 3h15v18H3z"
            fill="#ffd95a"
            stroke="#7a5800"
            strokeWidth="1.5"
          />
          <path
            d="M3 13h30v18H3z"
            fill="#ffe98a"
            stroke="#7a5800"
            strokeWidth="1.5"
          />
        </svg>
      );
    case "tools":
      return (
        <svg {...common}>
          <rect
            x="6"
            y="14"
            width="24"
            height="16"
            fill="#bfbfbf"
            stroke="#333"
            strokeWidth="1.5"
          />
          <path
            d="M10 14l4-8 8 0 4 8"
            fill="#4a8bf0"
            stroke="#0a246a"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="22" r="2" fill="#333" />
          <circle cx="18" cy="22" r="2" fill="#333" />
          <circle cx="24" cy="22" r="2" fill="#333" />
        </svg>
      );
    case "company":
      return (
        <svg {...common}>
          <rect
            x="5"
            y="8"
            width="26"
            height="24"
            fill="#e0e0e0"
            stroke="#333"
            strokeWidth="1.5"
          />
          <rect x="9" y="12" width="4" height="4" fill="#4a8bf0" />
          <rect x="16" y="12" width="4" height="4" fill="#4a8bf0" />
          <rect x="23" y="12" width="4" height="4" fill="#4a8bf0" />
          <rect x="9" y="19" width="4" height="4" fill="#4a8bf0" />
          <rect x="16" y="19" width="4" height="4" fill="#4a8bf0" />
          <rect x="23" y="19" width="4" height="4" fill="#4a8bf0" />
          <rect x="14" y="26" width="8" height="6" fill="#7a5800" />
        </svg>
      );
    case "agents":
      return (
        <svg {...common}>
          <circle
            cx="11"
            cy="14"
            r="5"
            fill="#ffd95a"
            stroke="#7a5800"
            strokeWidth="1.5"
          />
          <circle
            cx="25"
            cy="14"
            r="5"
            fill="#ff8a8a"
            stroke="#7a0000"
            strokeWidth="1.5"
          />
          <circle
            cx="18"
            cy="24"
            r="5"
            fill="#9aff9a"
            stroke="#0a5a0a"
            strokeWidth="1.5"
          />
        </svg>
      );
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
    case "blog":
      return (
        <svg {...common}>
          <rect
            x="4"
            y="6"
            width="28"
            height="24"
            fill="#4a8bf0"
            stroke="#0a246a"
            strokeWidth="1.5"
          />
          <rect
            x="4"
            y="6"
            width="28"
            height="6"
            fill="#fff"
            stroke="#0a246a"
            strokeWidth="1.5"
          />
          <circle cx="8" cy="9" r="1" fill="#ff5252" />
          <circle cx="11" cy="9" r="1" fill="#ffd95a" />
          <circle cx="14" cy="9" r="1" fill="#5fbf2e" />
          <line x1="8" y1="16" x2="28" y2="16" stroke="#fff" strokeWidth="1" />
          <line x1="8" y1="20" x2="28" y2="20" stroke="#fff" strokeWidth="1" />
        </svg>
      );
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
    case "resume":
      return (
        <svg {...common}>
          <rect
            x="6"
            y="3"
            width="24"
            height="30"
            fill="#fff"
            stroke="#333"
            strokeWidth="1.5"
          />
          <line x1="10" y1="9" x2="26" y2="9" stroke="#333" strokeWidth="1" />
          <line x1="10" y1="13" x2="26" y2="13" stroke="#333" strokeWidth="1" />
          <line x1="10" y1="17" x2="22" y2="17" stroke="#333" strokeWidth="1" />
          <line x1="10" y1="21" x2="26" y2="21" stroke="#333" strokeWidth="1" />
          <line x1="10" y1="25" x2="20" y2="25" stroke="#333" strokeWidth="1" />
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
