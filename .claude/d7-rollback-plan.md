# D7 Rollback Plan — Portfolio Retro Desktop

Branch: `feat/retro-desktop-d2` → `main`
Commits in PR: `664a0ed`, `8df750d`, `e2e7b1a`, `28b976b`
Bundle: 91.9 KB gz / 146.5 KB budget. D6 gauntlet green.

## Rollback Options

### Option A — Revert merge commit (PREFERRED, non-destructive)

```bash
# <MERGE_SHA> = the merge commit created when PR lands on main
git checkout main
git pull origin main
git revert -m 1 <MERGE_SHA>
git push origin main
```

Deploy lag: ~2–3 min (Actions build + Pages deploy). Total to live: ~3–5 min.

### Option B — Hard reset + force-push (DESTRUCTIVE, last resort)

Only if Option A conflicts badly or the merge corrupted main.

```bash
git checkout main
git fetch origin
git reset --hard <PRE_MERGE_SHA>   # SHA of main tip BEFORE the merge
git push --force-with-lease origin main
```

Deploy lag: ~2–3 min. Destroys history; requires Alex's explicit OK.

### Option C — Re-run prior successful Pages deploy (FASTEST)

GitHub → Actions → "Deploy Portfolio to GitHub Pages" → pick the last green run on `main` before the merge → "Re-run all jobs". Republishes the previous `dist/` artifact without touching git.

Deploy lag: ~1–2 min. Use this when git history is fine but the live site is broken and you want the old bits back immediately. Follow up with Option A to sync git.

## Verification After Rollback

1. `curl -sI https://honestafblog.com/ | head -5` → 200 OK
2. Load `https://honestafblog.com/` in browser:
   - Hero / Movement I renders
   - `#desktop` section: should be GONE (or replaced by the prior placeholder if any)
   - Movement II (research index) and Movement III still render
3. `https://honestafblog.com/research/` still lists entries
4. DevTools console: no 404s on `Desktop.*.js` chunks
5. CNAME: `dig honestafblog.com +short` still points at Pages (CNAME lives in repo settings, NOT in `public/`, so rollback does not affect DNS)

## Notify

- Alex (Discord DM or in-terminal). Personal portfolio — no other stakeholders.

## Pre-Merge Checklist

- [x] `npm run verify` green (build + check-bundle PASS, 91.9 KB gz)
- [x] D6 gauntlet suite 100% green against integrated `index.astro`
- [x] `dist/desktop-preview/` does NOT exist (non-routable rename confirmed)
- [x] `src/pages/index.astro` contains `<Desktop />` and `<MobileFallback />` siblings inside `<section id="desktop">`
- [x] `_serve/` in `.gitignore`
- [x] `.playwright-mcp/` in `.gitignore`
- [x] `package.json` has `check-bundle` and `verify` scripts
- [ ] Cipher final review on integrated branch
- [ ] Manual screenshot review at 1440px + 375px
- [ ] CEO approval gate (public-facing deploy)

## Dry-Run Result

Executed on throwaway branch `d7-rollback-dryrun` off `feat/retro-desktop-d2`:

- `git log main..HEAD --oneline` confirmed 7 commits would be reverted in a squash-less merge (D2, D3, D4, D5, D6 gating, D6 fix, 4x D7). For a squash merge, Option A reverts 1 commit; for a merge commit, `-m 1` handles it.
- `git revert HEAD~3..HEAD --no-commit` applied cleanly with no conflicts, then `git revert --abort` restored state.
- `npm run verify` green on throwaway branch (build 6.31s, 91.9 KB gz PASS).
- Throwaway branch deleted cleanly.

Rollback path is unobstructed.

## Known Carry-Forwards (shipping with this PR)

- **Node 20 deprecation** in `withastro/action@v3` — lands June 2026, not a D7 blocker. Track for Q2 2026 workflow bump.
- **Cipher deferred nits** from D6 review (non-blocking polish items).
- **Quill `about.json` placeholders** — content stubs in research vault, flagged for D8+ fill-in.
- **`_serve/Portfolio/`** — local-only staging dir, gitignored, never deployed.
- **`.playwright-mcp/`** — local MCP artifacts, gitignored.
