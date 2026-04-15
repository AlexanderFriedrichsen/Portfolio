---
name: Portfolio
---


## Icon Cull + About Me Rewrite — 2026-04-14

- **PR**: https://github.com/AlexanderFriedrichsen/Portfolio/pull/17
- **Branch**: `polish/icon-cull-and-about-me`
- **Bundle**: 114.2 KB gz (was 115.7 KB, ceiling 146.5 KB)

### What shipped

- Desktop icon roster cut 13 → 8: about-me, research-vault, llc, agent-team, mtg-analyzer, fate, wow, resume
- Removed entirely: `tools` (folded into Research Vault), `wonders`, `gecco`, `team-handshake`, `blog`
- `mtg-analyzer`: window → direct external link (`https://honestafblog.com/mtg-skill-analyzer`)
- `llc`: collapsed to minimal placeholder (`Building something here. Come back later.`) with compact inline layout; default window 460x260
- About Me: new copy replacing the Wonders-creator framing; tabs are now About / Why this site / Off the keyboard / Contact
- Research Vault: dropped `7css-viability` and `tcg-gap-fills` (not agentic); added a Research <-> Tools section toggle to fold the Tools-I've-Tried table inside
- Dead code deleted: `MtgAnalyzer.tsx`, `ToolsITried.tsx`, and glyph cases for `tools` / `wonders` / `gecco` / `handshake` / `blog` in `xp-icons.tsx`; `.philosophy-triptych` / `.mtg-window` / `.mtg-shot` CSS in `desktop.css`

### Files touched

- `src/components/desktop/data/icons.json` — roster cut, mtg-analyzer -> link
- `src/components/desktop/data/about.json` — full copy rewrite
- `src/components/desktop/data/research-index.json` — agentic-only
- `src/components/desktop/data/llc.json` — `{ name, body }` only
- `src/components/desktop/data/tools.json` — unchanged, now consumed only by Research Vault
- `src/content/research/{7css-viability,tcg-gap-fills}.md` — deleted
- `src/components/desktop/Desktop.tsx` — WindowId / WINDOW_META / WINDOWS / start menu / activateIcon trimmed
- `src/components/desktop/xp-icons.tsx` — 5 glyph cases removed
- `src/components/desktop/windows/AboutMe.tsx` — new tab set
- `src/components/desktop/windows/ResearchVault.tsx` — section toggle
- `src/components/desktop/windows/HonestAlexFLLC.tsx` — compact layout
- `src/components/desktop/windows/{MtgAnalyzer,ToolsITried}.tsx` — deleted
- `src/components/desktop/MobileFallback.astro` — mirror the About + LLC changes
- `src/components/desktop/desktop.css` — dead rules removed

### Quill follow-ups (flagged, NOT built in this PR)

Per CEO brief these are substantive copy tasks that belong to a separate pipeline:

1. **Agent harness principles + research backing** — new Research Vault piece showcasing the 12-agent team with research references
2. **Twitter log evidence from nightly cron** — demonstrates live research practice (@Apfriedr likes/bookmarks feeding agent improvements)
3. **Guiding sources / micro-vault microcosm** — chronological AI development OR "who taught me what" (Karpathy, Cherney, Gary Tan, etc.)

### Carry-forwards

- Cipher review needed before merge
- Screenshots `public/screenshots/mtg-analyzer-{hero,results}.png` are now orphaned from the desktop but may still be referenced elsewhere; left in place rather than pruned proactively
- `tools.json` remains a standalone data file (different shape from research index); only consumer now is `ResearchVault.tsx`

---



## WoW Login App — 2026-04-10

- **PR**: https://github.com/AlexanderFriedrichsen/Portfolio/pull/15
- **Branch**: `feat/wow-login-screen`
- **Bundle delta**: Desktop chunk 98.98 KB raw / 29.37 KB gz (main baseline ~29.86 KB gz). Well under the 150 KB gz ceiling. Media assets live in `public/`, not bundled.

### What shipped

- New `wow` entry in `src/components/desktop/data/icons.json`
- New `wow` glyph case in `src/components/desktop/xp-icons.tsx` (dark portal + golden W rune, uses existing `size` variable)
- New `src/components/desktop/windows/Wow.tsx` fullscreen overlay, follows the Fate pattern exactly (state machine loading → login, ESC to exit, Tab focus trap, aria-modal, role=dialog, focus return)
- `Desktop.tsx` wiring: `wowLaunching`, `wowReturnFocusRef`, `closeWow`, `activateIcon` wow branch, DesktopIconButton isOpen, overlay render

### Assets sourced vs stubbed

All real, sourced from [Xiexe/WoWLoginScreens](https://github.com/Xiexe/WoWLoginScreens) (Vanilla era — smallest files):

- `public/assets/videos/wow/vanilla-login.mp4` (~940 KB)
- `public/sounds/wow/vanilla-theme.ogg` (~3 MB)
- `public/sounds/wow/button-click.ogg` (~4 KB)

Nothing stubbed. The WoW wordmark is styled text (no bitmap).

### Carry-forwards

- Cipher review needed before merge.
- Swap expansion by changing the paths at the top of `Wow.tsx`; the rest is expansion-agnostic. WotLK is a strong alt but its mp4 is ~9 MB vs Vanilla's 940 KB.
- The decorative login box could host a Konami-style easter egg if desired (`handleLogin` is the branch point).
- `public/favicon/` and edits to `Layout.astro`, `audioManager.ts`, and the `xp-icons.tsx` size/glyph polish belong to the concurrent polish PR and are NOT in this branch.

### Coordination notes

The two concurrent Forge agents shared one working tree and raced on tracked files several times. Resolved by stashing polish work, re-applying WoW additions, and committing immediately. No polish-branch work was lost — preserved in stashes tagged `wow-agent: polish work carried over, do not lose` and similar. The polish Forge should find its WIP intact when it resumes.
