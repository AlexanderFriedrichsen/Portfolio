---
title: "7.css Viability Audit"
category: "retro-desktop-web"
summary: "Three-tier fallback plan for shipping a Win7 Aero look on the modern web."
published: "2026-04-06"
readMin: 3
---

This window you're reading right now is the output of this audit. Meta, I know.

When I decided to rebuild the portfolio as a Windows 7 desktop, the first question was whether to hand-roll every piece of chrome or lean on [`7.css`](https://khang-nd.github.io/7.css/), a stylesheet that ports Win7 Aero components to the web. Scout (my research agent) ran the audit. Here's how I think about dependencies like this.

## The three-tier framework

Any third-party UI library gets evaluated against three tiers of commitment:

1. **Ship it straight.** The library covers everything, looks right, is maintained. Add it and move on.
2. **Ship it + shim.** The library covers 80% well. The remaining 20% you build yourself in the same visual language. Most libraries land here.
3. **Full fallback.** The library is too opinionated, too stale, or too broken. Hand-roll the whole thing.

The trap is defaulting to tier 3 because it feels safer ("I control all the code"). Hand-rolling is usually _more_ risk, not less — you're taking on maintenance of something that isn't your core work.

## The 7.css audit

**Covers well:** window chrome, title bars, buttons, tabs, progress bars, the classic inset/outset borders. About 70% of what I need visually.

**Doesn't cover:** Aero blur/glass effects (CSS `backdrop-filter` can get most of the way), the desktop surface itself, icons, a working taskbar, window z-index management, drag behavior. Zero JavaScript — this is pure CSS, by design.

**Maintenance status:** active enough. Not abandoned, not a moving target.

**Verdict: Tier 2.** Ship `7.css` scoped to the window components, shim the rest. Window management (drag, z-index, focus) is React state I own. Desktop chrome is custom. Aero glass is a `backdrop-filter` layer I tuned by eye.

## What I'd do differently on a larger project

For a one-person portfolio the tier-2 call is obviously right — saves maybe a week. On a larger product I'd be more suspicious. The question isn't "does it work today" but "what happens when I need to deviate?" Tier-2 deviations compound into a Frankenstein of library overrides. At some point the shim is bigger than the library and you should have picked tier 3 from the start.

The point of the framework isn't the answer. It's forcing the question to be asked explicitly rather than drifting into whatever felt comfortable at 11pm.
