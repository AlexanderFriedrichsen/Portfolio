## Project Brief: Portfolio Site Redesign — "Philosophy First" (v2, locked 2026-04-06)

**Status**: Intake complete. All open questions answered. Ready to build.
**Deadline**: SHIP TODAY (2026-04-06) — job application is the forcing function.
**Repo**: `/mnt/c/vault/dev/Portfolio` (existing). Deploys via GitHub Pages → `honestafblog.com/Portfolio/`.

---

### The Spine (in stone)

> **Grow with friends. Find joy in hard problems. Build things that help people.**

This triptych is the entire philosophy. Every beat on the page must visibly ladder to one of the three sentences. The cold open IS this triptych — text + visual effect, no hero photo, no name plate above it.

---

### Locked Decisions (do not relitigate)

| Decision                   | Locked value                                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stack**                  | **Astro** (Alex wants to learn it). Option A passthrough — see below.                                                                                                                             |
| **Astro config**           | `site: 'https://honestafblog.com'`, `base: '/Portfolio/'`. Every internal link MUST respect base.                                                                                                 |
| **Resume page**            | Lives at `public/resume/` as **byte-identical static passthrough**. DO NOT port to .astro syntax. DO NOT edit print CSS. The resume was Cipher-reviewed yesterday and is out of scope.            |
| **Deploy**                 | GitHub Action builds and deploys to `gh-pages` branch. Pages serves from that branch. Astro provides the workflow template.                                                                       |
| **CNAME cleanup**          | Delete the bogus root `CNAME` file containing `AlexanderFriedrichsen.github.io` — it's cruft, not a real custom domain entry. The honestafblog.com binding lives on the user-site repo, not here. |
| **Agent team**             | **Option (b) explicit cards only**. Per-agent name + role + one-line description. Sigils/icons are deferred to Phase 5. Text-first.                                                               |
| **Cold open**              | Triptych as type + visual effect. No hero photo. Pixel/Forge picks the visual treatment — typographic weight, subtle motion, gradient, whatever lands. Bryn-Loftness-style gravity.               |
| **"The train" pull-quote** | **CUT**. Removed from spec entirely. Do not include.                                                                                                                                              |
| **Timeline**               | Ship today.                                                                                                                                                                                       |
| **CEO gates**              | **2 only**: (1) design approval (Alex previews local build), (2) final ship approval before push. No interim phase reviews.                                                                       |

---

### The Three Movements

#### Movement 1 — Philosophy (cold open)

The triptych is the hero. Three sentences, large, weighted, clean. Alex's name and a one-line role descriptor sit subordinate (smaller, below or beside). No ambient particle field. Visual effect should enhance the type, not compete with it — gradient, subtle reveal, maybe a slow line-by-line fade-in on load. Must work with JS disabled (text is real text, not an image).

#### Movement 2 — Proof

Each beat tagged to which sentence(s) it proves. Beat order is curated for narrative — recommend opening with MTG arc (the longest-running receipt) and closing with the agent team segue.

| Beat                                  | Proves                                                | Imagery (in-repo, in `assets/pictures/beast_games/`)                                                                                                                                                                                                                                                                                                        |
| ------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MTG arc**                           | "Find joy in hard problems" + "Grow with friends"     | `03_SCG_CON_Atlanta_Constructed_Champion.png`, `05_Pro_Tour_Top8_Group_Stage.png`, `06_Pro_Tour_Fist_Pump.png`. Hero shot is the Pro Tour Fist Pump. The arc is Dragon Cup → SCG CON Atlanta → Pro Tour. Years of grinding, the arc upward.                                                                                                                 |
| **Wonders of the First**              | "Build things that help people" + "Grow with friends" | `01_Dragon_Cup_Winner_Official.png`, `02_Dragon_Cup_Group_Photo.png`, `04_Dragon_Cup_Winner_Candid.png`. **CRITICAL: Dragon Cup = Wonders of the First world championship, NOT MTG.** A CCG Alex built, a championship was held, friends came, someone won it. This is the strongest "build things that help people + grow with friends" proof on the page. |
| **MTG Skill Analyzer / data science** | "Build things that help people"                       | Screenshot from honestafblog.com/mtg-skill-analyzer (or pull from existing Portfolio assets). Link to live tool.                                                                                                                                                                                                                                            |
| **Climbing**                          | "Find joy in hard problems" + "Grow with friends"     | `08_Climbing_Ocean_Rock.jpg` (best — outdoor), `09_Climbing_Walltopia_Overhang_1.jpg` as supporting. Skip the gym selfie unless layout demands.                                                                                                                                                                                                             |
| **Piano**                             | "Find joy in hard problems"                           | Existing Keys Kyne 2022 photo from `assets/pictures/`.                                                                                                                                                                                                                                                                                                      |
| **Health/data instincts**             | "Build things that help people"                       | Optional. Cut if it doesn't strengthen the spine or if layout feels crowded.                                                                                                                                                                                                                                                                                |

**Imagery rule**: every Movement 2 beat gets at least one image. Pictures are connective tissue.

**Additional photos** at `assets/pictures/alex_pics/` — 27 unlabeled candidates from Alex's Drive. Use any that visibly fit a beat. If a strong portrait is among them, it MAY be used as a secondary image alongside the cold open (but the cold open primary is still type + visual effect, not a photo).

#### Movement 3 — Practice (the agent team)

Explicit per-agent treatment. Says: _"Here is the team I built to scale my philosophy — every agent exists so one human can help more people, find joy in more hard problems, and grow with more friends."_

For each of the 12 native agents (read source: `/mnt/c/vault/brain/.claude/agents/`):

- **Atlas** — Chief strategist
- **Forge** — Software builder
- **Cipher** — Quality gate / reviewer
- **Gauntlet** — Tester / QA
- **Scout** — Researcher
- **Lens** — Data analyst
- **Quill** — Content writer
- **Pixel** — Visual designer
- **Anchor** — Operations / deployment
- **Sage** — Knowledge manager
- **Herald** — Project intake
- **Prism** — Design reviewer

Each card: name, role (one line), one-line description in Alex's voice. No sigils/icons (deferred). Pull descriptions from the agent definitions in `/mnt/c/vault/brain/.claude/agents/*.md` — read them, condense each to one sentence in plain language a hiring manager would understand.

The Movement 3 framing is the closer: the agent team is _how_ Alex now builds things that help people. It's the receipt that the philosophy scales beyond one human.

---

### Stack & Build Specifics

**Astro setup** (Forge — do these in this order):

1. `npm create astro@latest` in a temp dir, copy minimal scaffold into Portfolio repo root. Don't blow away existing files. Existing `index.html` becomes `index copy 2.html` (preserve as backup) before scaffold touches it.
2. Move existing `assets/`, `resume/` into `public/` so they ship as passthrough static files. Verify resume still loads at `/resume/`.
3. Configure `astro.config.mjs`:
   ```js
   export default {
     site: "https://honestafblog.com",
     base: "/Portfolio/",
   };
   ```
4. Build `src/pages/index.astro` with the three movements. Use Astro components for the agent card (one component, called 12 times with props).
5. Add GitHub Action workflow at `.github/workflows/deploy.yml` using Astro's official template (`withastro/action`). Configure to deploy to `gh-pages` branch.
6. Delete root `CNAME` file (the bogus `AlexanderFriedrichsen.github.io` one).
7. Test local build (`npm run build`) and local preview (`npm run preview`). Verify all internal links work with `/Portfolio/` base.
8. Verify resume at `/Portfolio/resume/` loads byte-identical to before.

**Visual direction** (Pixel territory but baked in here for speed):

- Type-forward. Big, confident, generous white space.
- Triptych in the cold open: each sentence on its own line, large, with deliberate rhythm.
- Color palette: keep it restrained. Off-white background, dark gray text, ONE accent color. Pick something that isn't Bootstrap blue. Suggestion: deep green or burnt orange — Forge picks, Alex approves at gate 1.
- Photos: full-bleed within their beat's column, generous borders, no rounded-corners-cliché. Treat them like exhibits in a gallery, not thumbnails.
- Mobile: single column, photos stack, cold open triptych scales to viewport.
- Dark mode: nice-to-have, not required for ship.
- Font: a real serif for the philosophy triptych (something with weight — Fraunces, EB Garamond, or similar) + a clean sans for body. NO system font stack on the cold open — the type IS the design.

**Out of scope (do not build)**:

- Contact form
- Blog
- CMS
- Astro content collections
- Any animation library beyond CSS
- Per-agent sigils/icons (Phase 5)
- A new color system for the resume page (resume is untouched)
- Dark mode toggle (nice-to-have, only if zero-cost)

---

### CEO Gates

**Gate 1 — Design approval**

- Trigger: Forge has cold open + Movement 2 first beat rendering locally
- Forge runs `npm run preview` and reports the preview URL
- Alex previews, approves direction OR requests changes
- Forge proceeds to finish the build

**Gate 2 — Ship approval**

- Trigger: Full build done, all 3 movements rendered, resume passthrough verified, local preview clean
- Alex previews the full site locally
- On approval: Forge commits, pushes to main, GitHub Action deploys, Anchor verifies live URL

---

### Verification (deterministic checks for SubagentStop)

```bash
# Repo location is correct
test -d /mnt/c/vault/dev/Portfolio
test -f /mnt/c/vault/dev/Portfolio/astro.config.mjs

# Astro config has the right base + site
grep -q "base.*'/Portfolio/'" /mnt/c/vault/dev/Portfolio/astro.config.mjs
grep -q "site.*'https://honestafblog.com'" /mnt/c/vault/dev/Portfolio/astro.config.mjs

# Resume passthrough preserved (in public/resume/)
test -f /mnt/c/vault/dev/Portfolio/public/resume/index.html

# Bogus CNAME deleted
test ! -f /mnt/c/vault/dev/Portfolio/CNAME

# Source page exists
test -f /mnt/c/vault/dev/Portfolio/src/pages/index.astro

# Philosophy triptych is in the source — all three sentences must appear
grep -qi "grow with friends"            /mnt/c/vault/dev/Portfolio/src/pages/index.astro
grep -qi "find joy in hard problems"    /mnt/c/vault/dev/Portfolio/src/pages/index.astro
grep -qi "build things that help people" /mnt/c/vault/dev/Portfolio/src/pages/index.astro

# Three-movement structure
grep -Eqi 'id="(philosophy|movement-1|cold-open)"' /mnt/c/vault/dev/Portfolio/src/pages/index.astro
grep -Eqi 'id="(proof|movement-2)"'                /mnt/c/vault/dev/Portfolio/src/pages/index.astro
grep -Eqi 'id="(practice|agents|movement-3|agent-team)"' /mnt/c/vault/dev/Portfolio/src/pages/index.astro

# All 12 agents named on page
agent_hits=$(grep -ioE 'atlas|forge|cipher|gauntlet|scout|lens|quill|pixel|anchor|sage|herald|prism' /mnt/c/vault/dev/Portfolio/src/pages/index.astro | sort -u | wc -l)
test "$agent_hits" -ge 12

# Beast Games photos referenced (Movement 2 imagery)
grep -q "beast_games" /mnt/c/vault/dev/Portfolio/src/pages/index.astro

# Dropped framings stay dropped
! grep -qi "peak vs consistency\|two.track" /mnt/c/vault/dev/Portfolio/src/pages/index.astro
! grep -qi "the train" /mnt/c/vault/dev/Portfolio/src/pages/index.astro

# Build succeeds
cd /mnt/c/vault/dev/Portfolio && npm run build
test -d /mnt/c/vault/dev/Portfolio/dist
test -f /mnt/c/vault/dev/Portfolio/dist/Portfolio/index.html || test -f /mnt/c/vault/dev/Portfolio/dist/index.html
```
