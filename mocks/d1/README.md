# D1 Visual Mocks — Retro Desktop Section

Static HTML mocks for the Win7 Aero retro-desktop slab that lives between Movement I (philosophy) and Movement II (proof) in `index.astro`. Built on `7.css` (CDN) + `.glass` window class with a small inline shim per file.

All mocks are **desktop-only** (target viewport >= 1024px, fine pointer). Mobile fallback is D4 and out of scope here.

## Files

| #   | File                      | Shows                                                                                                                                                                                      |
| --- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 01  | `01-default-desktop.html` | Full section view: Aero wallpaper, 4 desktop icons in a left column, **Agent Team** window open center, taskbar with Start orb + clock. First-paint state.                                 |
| 02  | `02-agent-team.html`      | Agent Team window content: 12-card 3-column grid (Atlas, Forge, Cipher, Gauntlet, Scout, Lens, Quill, Pixel, Anchor, Sage, Herald, Prism). Each card = name + role + one-line description. |
| 03  | `03-research-vault.html`  | Two-pane explorer feel: tree on left (folders + .md files), preview pane on right with a sample research doc rendered. Content is fresh, NOT pulled from the vault.                        |
| 04  | `04-about-me.html`        | Bio window with photo placeholder (CSS/SVG), tagline, two paragraphs, and a Quick Facts dl block. Tabbed chrome (General/Background/Contact).                                              |
| 05  | `05-tools-i-tried.html`   | Sortable-looking table: Tool / Category / Verdict (★ rating) / Notes. 7 sample tools. Software-review vibe.                                                                                |
| 06  | `06-honestalexf-llc.html` | Company one-pager: header with monogram logo, "What it is", 4-card services grid, contact dl.                                                                                              |

## Design Decisions (for Cipher / Prism / Alex)

### Aesthetic commitment

- **Wallpaper**: blue radial gradient mimicking the Win7 "Harmony"/Aero default. Pure CSS, no image asset. Soft white bloom + dark vignette overlay. Open question: do we want a more distinctive wallpaper (e.g. Bliss-style hill) or stay generic-Aero?
- **Glass windows**: relying on `7.css`'s `.glass` class. Did not modify titlebar gradients — staying canonical.
- **Start orb**: pure CSS radial gradient (green Win7 orb). No bitmap.
- **Desktop icons**: inline SVG, ~48px, with the classic white-text-black-shadow label underneath. Hover state = pale blue selection box (matches Win7 Explorer hover).

### Layout / sizing

- Section frame in mock 01 is `720px` tall, full-width, `min-width:1024px`. Forge will need to confirm the final height — I picked 720 because it lets one window + taskbar + icon column breathe without scrolling inside the section. Could go to 640 if vertical real estate is precious.
- Default-state window (`Agent Team`) is `560px` wide and offset to roughly center-left. Mock 02 (full Agent Team standalone) is `760px` wide because the 3-column grid demands it. **Question for Alex**: should the default-state window match its standalone width (760), forcing a wider section, or stay compact (560) and reflow on user resize? I lean compact-by-default for first paint.
- Single-window mocks 02–06 are presented on a wallpaper backdrop with the window centered, so reviewers can judge content layout in isolation without the icon column distracting.

### Color choices

- Background gradient stops: `#5fbfff → #2a78c2 → #0e2f5c → #061528`. Pure Aero blue.
- Window body backgrounds: `#f6faff → #e2ecf8` linear gradients on cards/rows for the subtle Win7 sheen.
- Title-bar text uses 7.css defaults (do not override).
- Accent / heading text: `#0e3766` (deep navy). Body: `#1f2a3a`. Muted: `#4870a0`. Border: `#b8c8dc`.
- One color decision to flag: I'm using **Aero blue everywhere**. The rest of the portfolio (Movements I & II) uses a restrained off-white + accent palette. The retro-desktop section is intentionally a tonal break — but Prism should confirm the jarring shift is the right call vs. retinting the desktop to the site accent.

### Accessibility

- Desktop icon labels: white text with double drop-shadow for legibility on the gradient. Contrast against the lightest part of the wallpaper (`#5fbfff`) is roughly 4.6:1 — passes AA for small text but tight. Consider darkening the wallpaper light center if Prism flags it.
- Window body text: `#1f2a3a` on `#f6faff` ≈ 14.5:1 — passes AAA easily.
- Muted/role text: `#4870a0` on white ≈ 5.0:1 — AA pass.
- All windows use real semantic HTML (`role="dialog"`, `aria-label`, `<menu role="tablist">` for the About Me tabs). Tree view in mock 03 uses `<nav>` + `<ul>`; Forge will need to wire keyboard navigation in D2.
- Desktop icons are `tabindex="0"` so they're keyboard-reachable; Forge handles double-click → Enter/Space activation in D2.

### What's intentionally NOT in these mocks

- No drag-and-drop affordances (Forge — D2)
- No window stacking / z-order beyond the one open window (Forge — D2)
- No mobile fallback (D4)
- No active/inactive titlebar contrast pair shown side-by-side — only the active state. Inactive state is implicit via 7.css default behavior; Prism can request a dedicated mock if needed.
- No sound, no analytics, no easter eggs (per task brief v1 non-goals)
- No Start menu open state (taskbar shows Start orb only; clicking it is a D3 concern at earliest)

## Open Questions for Review

1. **Wallpaper character**: pure-Aero generic vs. distinctive (custom gradient with brand hint)?
2. **Section height**: 720px the right slab? Or shrink to 640 / let it flex?
3. **Default open window choice**: Agent Team is the obvious "wow" window, but it also spoils Movement III. Should the default-open window be **About Me** instead, with Agent Team as a teaser the user has to click?
4. **Icon order**: I went Research Vault → About Me → Tools → LLC top-to-bottom. Is that the priority Alex wants?
5. **Color jolt**: Aero blue mid-page is intentional rupture. Confirm with Prism it's the right vibe, not jarring.
6. **Tree view authenticity in mock 03**: I used emoji `📁/📄` glyphs as a quick stand-in. Production should use inline SVG of the classic Win7 folder/file icons. Flagging so it doesn't ship as-is.

## Recommendation

Hand to **Cipher** for review (who will pull in **Prism** for aesthetic/brand check). No code changes downstream until Alex weighs in on the open questions above — particularly #3 (default-open window) and #5 (color jolt), since both are load-bearing decisions for D2 implementation.
