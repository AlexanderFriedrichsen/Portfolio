// Aero-gloss inline SVG icons. <2KB each, no bitmaps.
// All icons accept a `size` prop and inherit `aria-hidden` from parent.
import React from "react";

type IconProps = { size?: number };

export function FolderIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="desk-folderTop" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffe79a" />
          <stop offset="1" stopColor="#e8a724" />
        </linearGradient>
        <linearGradient id="desk-folderBody" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffd564" />
          <stop offset="0.55" stopColor="#e89c12" />
          <stop offset="1" stopColor="#9b5e07" />
        </linearGradient>
        <filter
          id="desk-folderShadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow dx="0" dy="2" stdDeviation="1.4" floodOpacity="0.55" />
        </filter>
      </defs>
      <g filter="url(#desk-folderShadow)">
        <path
          d="M4 14 h13 l4 4 h23 v22 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 z"
          fill="url(#desk-folderBody)"
          stroke="#5a3505"
          strokeWidth="0.8"
        />
        <path
          d="M4 14 h13 l4 4 h23 v3 H4 z"
          fill="url(#desk-folderTop)"
          stroke="#5a3505"
          strokeWidth="0.5"
        />
        <path
          d="M5 22 h38 v3 a0 0 0 0 1 0 0 H5 z"
          fill="rgba(255,255,255,0.45)"
        />
      </g>
    </svg>
  );
}

export function UserIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="desk-userBody" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#eaf6ff" />
          <stop offset="0.5" stopColor="#9cc7ee" />
          <stop offset="1" stopColor="#3a6f9e" />
        </linearGradient>
        <radialGradient id="desk-userHead" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#cfe6ff" />
          <stop offset="1" stopColor="#5a85b2" />
        </radialGradient>
        <filter
          id="desk-userShadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow dx="0" dy="2" stdDeviation="1.4" floodOpacity="0.55" />
        </filter>
      </defs>
      <g filter="url(#desk-userShadow)">
        <path
          d="M6 44 c2-12 12-16 18-16 s16 4 18 16 z"
          fill="url(#desk-userBody)"
          stroke="#1f3a5f"
          strokeWidth="1"
        />
        <circle
          cx="24"
          cy="16"
          r="9"
          fill="url(#desk-userHead)"
          stroke="#1f3a5f"
          strokeWidth="1"
        />
        <ellipse cx="20" cy="12" rx="3" ry="1.5" fill="rgba(255,255,255,0.7)" />
      </g>
    </svg>
  );
}

export function ToolsIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="desk-wrenchBody" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#dfe7ef" />
          <stop offset="0.5" stopColor="#8a98a8" />
          <stop offset="1" stopColor="#3a4452" />
        </linearGradient>
        <linearGradient id="desk-screwHandle" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ff7a5e" />
          <stop offset="1" stopColor="#7a1c08" />
        </linearGradient>
        <filter
          id="desk-toolShadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow dx="0" dy="2" stdDeviation="1.4" floodOpacity="0.55" />
        </filter>
      </defs>
      <g filter="url(#desk-toolShadow)">
        <rect
          x="4"
          y="28"
          width="32"
          height="6"
          rx="1"
          fill="url(#desk-wrenchBody)"
          stroke="#1f2a36"
          strokeWidth="0.8"
        />
        <rect
          x="4"
          y="28"
          width="32"
          height="2"
          fill="rgba(255,255,255,0.55)"
        />
        <rect
          x="28"
          y="8"
          width="6"
          height="22"
          rx="1"
          fill="url(#desk-screwHandle)"
          stroke="#400a02"
          strokeWidth="0.8"
        />
        <rect x="28" y="8" width="6" height="2" fill="rgba(255,255,255,0.55)" />
        <circle
          cx="36"
          cy="14"
          r="6"
          fill="#f4c41a"
          stroke="#6e5208"
          strokeWidth="0.8"
        />
        <circle cx="34" cy="12" r="2" fill="rgba(255,255,255,0.7)" />
      </g>
    </svg>
  );
}

export function CompanyIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="desk-bldgBody" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f2f7fc" />
          <stop offset="0.5" stopColor="#9cb8d6" />
          <stop offset="1" stopColor="#324f73" />
        </linearGradient>
        <linearGradient id="desk-bldgRoof" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5b8bbd" />
          <stop offset="1" stopColor="#1a3656" />
        </linearGradient>
        <filter
          id="desk-bldgShadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow dx="0" dy="2" stdDeviation="1.4" floodOpacity="0.55" />
        </filter>
      </defs>
      <g filter="url(#desk-bldgShadow)">
        <rect
          x="6"
          y="12"
          width="36"
          height="32"
          fill="url(#desk-bldgBody)"
          stroke="#0f2238"
          strokeWidth="0.9"
        />
        <rect x="6" y="12" width="36" height="4" fill="url(#desk-bldgRoof)" />
        <g fill="#1f5fa0" stroke="#0f2238" strokeWidth="0.4">
          <rect x="10" y="19" width="5" height="5" />
          <rect x="17" y="19" width="5" height="5" />
          <rect x="24" y="19" width="5" height="5" />
          <rect x="31" y="19" width="5" height="5" />
          <rect x="10" y="27" width="5" height="5" />
          <rect x="17" y="27" width="5" height="5" />
          <rect x="31" y="27" width="5" height="5" />
        </g>
        <rect
          x="22"
          y="34"
          width="6"
          height="10"
          fill="#5a3505"
          stroke="#0f2238"
          strokeWidth="0.5"
        />
        <circle cx="26.5" cy="39" r="0.6" fill="#f4c41a" />
        <rect
          x="10"
          y="19"
          width="5"
          height="2"
          fill="rgba(255,255,255,0.55)"
        />
      </g>
    </svg>
  );
}

// Tree-view icons (small, inline, aria-hidden)
export function FolderSmall({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: "-2px", marginRight: 4 }}
    >
      <path
        d="M1 4 h4 l1.5 1.5 H15 v9 a1 1 0 0 1 -1 1 H2 a1 1 0 0 1 -1 -1 z"
        fill="#f2c552"
        stroke="#7a5410"
        strokeWidth="0.6"
      />
      <path d="M1 6 h14 v1.5 H1 z" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}

export function FileSmall({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: "-2px", marginRight: 4 }}
    >
      <path
        d="M3 1 h7 l3 3 v11 a1 1 0 0 1 -1 1 H3 a1 1 0 0 1 -1 -1 V2 a1 1 0 0 1 1 -1 z"
        fill="#ffffff"
        stroke="#4a6890"
        strokeWidth="0.7"
      />
      <path d="M10 1 v3 h3" fill="none" stroke="#4a6890" strokeWidth="0.7" />
      <path d="M4 7 h7 M4 9 h7 M4 11 h5" stroke="#7a8aa0" strokeWidth="0.6" />
    </svg>
  );
}

// Stub-state file icon: same base shape as FileSmall, with a small padlock in
// the lower-right corner. The lock keeps the leaf clearly recognizable as a
// file while signalling "not openable" at a glance. Body and rules are greyed
// so the icon also reads as muted in the tree without needing CSS overrides.
export function FileLockedSmall({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: "-2px", marginRight: 4 }}
    >
      <path
        d="M3 1 h7 l3 3 v11 a1 1 0 0 1 -1 1 H3 a1 1 0 0 1 -1 -1 V2 a1 1 0 0 1 1 -1 z"
        fill="#f2f2f2"
        stroke="#8a8a8a"
        strokeWidth="0.7"
      />
      <path d="M10 1 v3 h3" fill="none" stroke="#8a8a8a" strokeWidth="0.7" />
      <path d="M4 7 h6 M4 9 h5" stroke="#b0b0b0" strokeWidth="0.6" />
      {/* Padlock, lower-right corner. Shackle (arc), then body, then keyhole. */}
      <path
        d="M9.6 11.6 v-1 a1.3 1.3 0 0 1 2.6 0 v1"
        fill="none"
        stroke="#3a3a3a"
        strokeWidth="0.7"
      />
      <rect
        x="8.9"
        y="11.6"
        width="4"
        height="3.2"
        rx="0.4"
        fill="#d4a72c"
        stroke="#3a3a3a"
        strokeWidth="0.6"
      />
      <circle cx="10.9" cy="13.1" r="0.45" fill="#3a3a3a" />
    </svg>
  );
}
