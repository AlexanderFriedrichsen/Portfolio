# Task Brief — Portfolio Cuts + About Me Rewrite

**Repo**: `/mnt/c/vault/dev/Portfolio` (junction to `/mnt/c/dev/GitHub/Portfolio`)
**Branch**: cut fresh from `main`, suggested name `polish/icon-cull-and-about-me`
**Worktree isolation**: DO NOT use — this repo's junction breaks worktree mode (see `meta/threads/infra-forge-worktree` + `portfolio-retro-desktop` 2026-04-11 update)

## Context

CEO reviewed the shipped retro desktop and wants two things:

1. **Cut the clutter** — hard-limit icons so people actually open the ones that remain.
2. **Rewrite the About Me** — current copy targets agentic engineers specifically; it should be broader and also explain _why this site looks like this_.

The existing data layer is `src/components/desktop/data/*.json`, parsed by `Desktop.tsx` + window components. Work within that SoT.

## Vision

**What**: Ship a leaner portfolio desktop with fewer icons, an About Me that represents Alex holistically (not just AI-engineer resume bait), and a research vault culled to only agentic-learning/dev content.

**Who sees this**: Hiring managers at agent-focused companies, peers, friends curious about the site. They should be able to click through in under two minutes and get what Alex is about.

**Done when**:

- Icon count reduced per "Icon Changes" section below
- `about.json` replaced with new copy (see "About Me Copy")
- `research-index.json` culled to agentic-only pieces
- Tools-I-Tried content folded into Research Vault window (merged section)
- MTG Skill Analyzer icon converted from window to direct external link to live app
- HonestAlexF LLC shrunk to a minimal placeholder window (one-liner: "Building something here. More later.") OR removed — your call based on what looks cleanest visually
- All removed icons' code paths cleanly deleted (no dead branches in `xp-icons.tsx`, `Desktop.tsx` activation, window component files if fully removed)
- Bundle still under 146.5 KB gz ceiling
- `npm run verify` (build + check-bundle + scrollbar-guard) green
- Rebased on current `main`, pushed, PR opened

**Is NOT**:

- Content expansion — if you find gaps in the new Research Vault (e.g., agent harness writeup, Twitter-log research evidence), leave a TODO comment and flag it. Quill will fill those in a separate task.
- Resume edits — separate workstream.
- New icons. Net icons should decrease.

## Icon Changes (concrete)

Starting state (`icons.json`): about-me, research-vault, tools, llc, agent-team, mtg-analyzer, fate, wow, wonders, gecco, blog, team-handshake, resume — **13 icons**.

### Remove entirely

- `tools` — fold content into Research Vault as a dedicated section/tab (see "Tools Merge" below)
- `wonders` — unfinished project, stub link `#`
- `gecco` — stub link `#`, not linking out
- `blog` — redundant, site root is already the blog
- `team-handshake` — stub link `#`

### Modify

- `mtg-analyzer`: change `kind` from `window` to `link`, `external: true`, `href` pointing to the live MTG Skill Analyzer app. Check the current window component for the live URL; if unclear, flag it and leave `href: "#"` with a TODO. No description, no screenshots — just launches the app in a new tab.
- `llc`: shrink to minimal placeholder OR remove. If keeping, the window body should be a single short sentence like _"Building something here. Come back later."_ — no multi-section copy. If removing feels cleaner visually, remove it.

### Keep (no structural change)

- `about-me` — copy update only (see "About Me Copy")
- `research-vault` — content update only (see "Research Index Cull" + "Tools Merge")
- `agent-team` — unchanged
- `fate` — unchanged
- `wow` — unchanged
- `resume` — unchanged

Target final icon count: **~7** (about-me, research-vault, agent-team, mtg-analyzer, fate, wow, resume, and maybe llc). Net reduction: 13 → 7 or 8.

## About Me Copy

Replace `about.json` content with the below. You may rename sections / adjust the React component (`src/components/desktop/windows/About.tsx` or similar) to fit — schema is not load-bearing, the copy is. Keep `photo`, `contact`, and `facts` structure mostly intact; replace the prose sections.

### Sections to use

**tagline**:
`Applied AI engineer. Optimizer, archivist, variance specialist.`

**general** (3 paragraphs, keep as array):

1. "I'm an applied AI engineer. Most of my energy right now goes into meta-level, auto-research-oriented, iterative improvement work — the fine edges and details most people skip past. It's a very competitive environment to be building in, which is exactly why I like it. It's the game, and I like being on the front end of it."
2. "My inherent skill sets — organization, archival, juggling many obligations at once — map cleanly onto what AI amplifies. Projects that used to sit on the shelf for years because I 'didn't have time' are finally getting finished."
3. "I play Magic, not chess. Magic has variance. LLM output has variance. I've spent a decade learning to operate effectively under variance in contexts where minimizing it is everything. That transfer is real."

**why_this_site** (new section — replace `philosophy` and `background` with this):

1. "This isn't a normal portfolio. That's the point."
2. "I like the retro aesthetic — nostalgia-evoking, alternative to the flat-modern-AI-CSS everyone else is shipping, and not trivially coded by an LLM. If you're curious enough to poke around, you'll find easter eggs."
3. "The site took shape after I ran an in-person Easter egg hunt for friends and remembered how much I love watching people explore something I built. Interactive beats static. If you came here just to verify a resume line, the resume is right there — but this is the part I'd want you to actually poke around in."

**off_keyboard** (new section):

1. "Climber, squash player, runner, pianist. Magic pro. Food lover, big traveler, competitor, strategist."
2. "High openness, low conformity. I like being the first one to try something, and I'd rather ask forgiveness than permission when chasing a long shot."
3. "Voracious audiobook consumer: progression fantasy, rationalist fiction, world building, high fantasy, sci-fi, self-improvement."
4. "I don't take myself too seriously day-to-day. I find joy in bringing people together, seeing friends laugh, maintaining relationships and forming new ones."

**contact**: unchanged from current (email, GitHub, LinkedIn, X). Drop the `Blog:` line since the site root is the blog.

**facts** (trim to 3):

- `{ "k": "Based in", "v": "Boston, MA" }`
- `{ "k": "Currently", "v": "Applied AI engineer, open to senior IC roles" }`
- `{ "k": "Stack", "v": "TypeScript, Python, Astro, Supabase, Claude Code agent teams" }`

**Remove entirely**: `philosophy`, `background` (placeholder TODO), and the stale `tagline` about "Solo dev, MTG pro, Wonders of the First creator."

### Component adjustments

If the About window uses tabs (General / Philosophy / Background / Contact), the new tabs should be something like: **About** (general), **Why this site** (why_this_site), **Off the keyboard** (off_keyboard), **Contact** (contact + facts). Your call on exact layout; keep it XP-native.

## Research Index Cull

`research-index.json` currently has 6 pieces:

- handoff-protocol (agent-teams) — **KEEP**
- failure-modes (agent-teams) — **KEEP**
- landscape-2026 (agent-teams) — **KEEP**
- 7css-viability (retro-desktop-web) — **REMOVE** (not agentic)
- tcg-gap-fills (high-ev-competitions) — **REMOVE** (not agentic)
- agent-economies (agent-economies) — **KEEP** (agentic)

Also delete the corresponding entries in `src/content/research/` for the removed slugs, or leave the content collection entries but filter them out in the index. Your call — whichever is simpler without breaking the `[slug].astro` route.

## Tools Merge

`tools.json` content should fold into the Research Vault window as a new section/tab like "Tools I've Tried." If the Research Vault window currently has a flat list, add a tab/section divider. If it's already structured, find the natural place.

After the merge, delete `tools.json` or leave it unused — the goal is no standalone Tools icon, no standalone Tools window code path.

## TODOs to leave for Quill (flag, don't build)

Leave a `<!-- TODO -->` comment or a note in `project.md` for:

- New Research Vault piece: **agent harness principles + research backing** (CEO wants to showcase the agent team Alex built, with research references)
- New Research Vault piece: **Twitter log evidence from nightly cron** (demonstrates live research practice — @Apfriedr likes/bookmarks feed into agent improvements)
- Possibly: **Guiding sources / micro-vault microcosm** — chronological AI development OR "who taught me what" (Karpathy, Cherney, Gary Tan, etc.)

These are substantive copy tasks for Quill, not your job in this PR.

## Constraints

- Bundle ceiling: 146.5 KB gz
- Keep `7.css`/`xp.css` idioms intact — this is an XP desktop, stay in style
- No new dependencies
- Run `npm run verify` before pushing

## Execution Plan

1. Read `icons.json`, `about.json`, `research-index.json`, `tools.json`, `llc.json`
2. Branch off main
3. Apply icon changes in `icons.json` (remove 5, modify 2)
4. Update `about.json` with new copy + adjust `About.tsx` (or equivalent) for new tab/section structure
5. Cull `research-index.json` + remove orphaned content collection entries
6. Fold tools content into Research Vault window
7. Shrink or delete `llc.json` + corresponding window code
8. Delete dead code paths: xp-icons.tsx cases for removed icons, Desktop.tsx activation branches, orphaned window components
9. `npm run verify` — fix any failures
10. Commit in logical chunks (icon cuts, about rewrite, research cull, tools merge)
11. Push, open PR
12. Update `.claude/project.md` with summary + flag the Quill TODOs

## Verification

```bash
# Run from repo root
cd /mnt/c/vault/dev/Portfolio

# Build passes
npm run verify

# About copy no longer references old Wonders-creator framing
! grep -q "Wonders of the First creator" src/components/desktop/data/about.json

# Research index has no non-agentic slugs
! grep -vE "(7css-viability|tcg-gap-fills)" src/components/desktop/data/research-index.json > /dev/null && ! grep -qE "(7css-viability|tcg-gap-fills)" src/components/desktop/data/research-index.json

# Dead link icons removed
! grep -qE "\"(wonders|gecco|blog|team-handshake)\"" src/components/desktop/data/icons.json

# Tools icon removed
! grep -q "\"id\": \"tools\"" src/components/desktop/data/icons.json

# Icon count check (expect ≤ 8)
test $(node -e "console.log(JSON.parse(require('fs').readFileSync('src/components/desktop/data/icons.json')).length)") -le 8
```
