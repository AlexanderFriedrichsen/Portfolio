# D7: Integrate retro-desktop into index.astro + rollback dry-run

Repo: `/mnt/c/vault/dev/Portfolio`
Branch: `feat/retro-desktop-d2` HEAD `0ce4a43`
Prior phases D2-D6 green. Bundle 112.9 KB gz / 146.5 KB.

**Read first**:

- `/mnt/c/vault/brain/projects/portfolio-site-desktop-section.md` (D7 phase spec, R7 rule, locked decisions)
- `src/pages/index.astro` (find Movement I → Movement II seam)
- `src/components/desktop/Desktop.astro`, `MobileFallback.astro`, `desktop.css`
- `src/pages/desktop-preview.astro` (integration pattern: gating + sibling layout)

## R7 hard constraint

`Desktop.tsx`'s root `<div>` IS the `bounds="parent"` target. NO Astro element may sit between `<section id="desktop">` and the React island. Do not wrap `<Desktop>` in any extra div between the section and the island.

## Part 1 — CSS dedup investigation (DO FIRST)

Cipher flagged ~43 KB gz duplicated CSS chunks (`desktop-preview.*.css` × 2 at ~21 KB each).

- Reproduce: `npm run build`, then `ls -la dist/_astro/desktop-preview*.css` and `gzip -c <each> | wc -c`
- Diff the two files (`diff <(sort file1) <(sort file2)`) — confirm overlap
- Investigate root cause: (a) Astro emitting CSS for both route + island, (b) Vite chunk-split bug, (c) `Desktop.tsx` importing 7.css at module level vs `Desktop.astro` frontmatter
- Try: move `import "7.css/dist/7.scoped.css"` from `Desktop.tsx` into `Desktop.astro` frontmatter (if not already), OR a single shared CSS file, OR `vite.build.cssCodeSplit: false`
- Goal: cut ~20 KB gz. If can't safely dedupe, document why and leave note for follow-up — don't make it worse.
- Re-run `node tests/d6-gating.mjs` after fix — nothing should break.

## Part 2 — Rename `desktop-preview.astro` → `_desktop-preview.astro`

Astro convention: leading underscore = non-routable.

- `git mv src/pages/desktop-preview.astro src/pages/_desktop-preview.astro`
- After rebuild, `dist/desktop-preview/` should NOT exist
- Update `tests/d6-gating.mjs` — point at `http://localhost:4321/Portfolio/#desktop` after Part 3 integration so D6 tests run against the real production page

## Part 3 — Integrate into `index.astro`

Per plan, desktop section sits **between Movement I (philosophy) and Movement II (proof)**.

- Find seam between Movement I and Movement II
- Insert `<section id="desktop">` containing:
  - `<Desktop client:visible />` wrapped in `<div class="desktop-only">` (gated `(min-width: 1024px) and (pointer: fine)`)
  - `<MobileFallback />` wrapped in `<div class="mobile-only">` (inverse)
- Use SAME CSS gating as `_desktop-preview.astro` — extract into shared place if helpful
- MUST NOT break Movement III or anything below
- R7 applies — no extra wrapper divs between section and island
- Add `#desktop` anchor so research detail "← Back to desktop" link lands correctly

## Part 4 — Carry-forward fixes

1. `package.json` add scripts:
   ```
   "check-bundle": "node scripts/check-bundle.mjs",
   "verify": "npm run build && npm run check-bundle"
   ```
2. `.gitignore` add `.playwright-mcp/`
3. `research-index.json` `updated` vs schema `published` — reconcile to one (recommend keep `published`, drop/rename `updated`). Don't break the build.

## Part 5 — Build, verify, ship dry-run

1. `npm run build` — must be green
2. `npm run check-bundle` — report new total
3. `node tests/d6-gating.mjs` against new `/Portfolio/` integrated route — all checks pass (drag, close, gating, mobile no-overflow, CLS)
4. **Rollback dry-run**: write to `/mnt/c/vault/dev/Portfolio/.claude/d7-rollback-plan.md`:
   - Where prior build artifact lives
   - Exact `git revert` / branch-reset commands
   - How long it would take
   - Who to notify
5. Playwright screenshot: integrated `index.astro` at 1280×800 showing desktop section in context. Save to `.playwright-mcp/d7-integrated-1280.png`
6. Commit in logical commits (DO NOT push, DO NOT deploy):
   - `D7: dedupe CSS chunks` (Part 1)
   - `D7: rename _desktop-preview, update test target` (Part 2)
   - `D7: integrate desktop section into index.astro` (Part 3)
   - `D7: wire check-bundle, gitignore .playwright-mcp, reconcile schema` (Part 4)

## Report (return to orchestrator)

- CSS dedup result (before/after KB, root cause, what changed)
- New bundle total
- D6 test results post-integration
- Files touched per commit
- Rollback plan summary (3-4 lines from doc)
- Screenshot path
- Anything surprising or needing CEO input
- VERDICT: READY TO PUSH or NEEDS WORK (with blockers)
