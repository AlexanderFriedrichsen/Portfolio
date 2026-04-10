#!/usr/bin/env node
// Static-asset guard: the XP scrollbar visual story.
//
// Background: scripts/scope-xpcss.mjs deliberately strips every
// ::-webkit-scrollbar* rule out of the generated xp.scoped.css because
// xp.css bundles ~20 KB of inline data-URI bitmaps for the Luna scrollbar
// skin. A hand-curated 98-style grey scrollbar block lives in
// src/components/desktop/desktop.css as the replacement.
//
// Two things can regress this setup silently:
//   1. Someone deletes the manual block from desktop.css thinking it's
//      dead code -> scrollbars in .xp-scope suddenly render as default OS
//      chrome. This test catches that.
//   2. An xp.css upgrade changes the selector shape and the strip in
//      scope-xpcss.mjs stops matching -> we start shipping 20 KB of
//      dataURIs again. This test catches that too.
//
// Run: node tests/scrollbar-guard.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DESKTOP_CSS = resolve(__dirname, "../src/components/desktop/desktop.css");
const SCOPED_CSS = resolve(
  __dirname,
  "../src/components/desktop/xp.scoped.css",
);

let failed = 0;

// 1. desktop.css must contain the manual scrollbar block.
const desktopCss = readFileSync(DESKTOP_CSS, "utf8");
if (!desktopCss.includes("::-webkit-scrollbar")) {
  console.error(
    "FAIL: src/components/desktop/desktop.css no longer contains a ::-webkit-scrollbar rule.",
  );
  console.error(
    "      This is the hand-curated replacement for the XP Luna scrollbar that",
  );
  console.error(
    "      scripts/scope-xpcss.mjs strips. Restoring the scrollbar block or the",
  );
  console.error(
    "      XP desktop will show default OS scrollbars in .xp-scope.",
  );
  failed++;
} else {
  console.log("OK: desktop.css contains ::-webkit-scrollbar block.");
}

// 2. xp.scoped.css must NOT contain any ::-webkit-scrollbar rule (the strip
//    in scope-xpcss.mjs must still be working).
try {
  const scopedCss = readFileSync(SCOPED_CSS, "utf8");
  if (scopedCss.includes("::-webkit-scrollbar")) {
    console.error(
      "FAIL: src/components/desktop/xp.scoped.css contains ::-webkit-scrollbar.",
    );
    console.error(
      "      The strip in scripts/scope-xpcss.mjs is no longer matching — likely",
    );
    console.error(
      "      an xp.css upgrade changed the selector shape. Ship weight will",
    );
    console.error("      balloon by ~20 KB until this is fixed.");
    failed++;
  } else {
    console.log("OK: xp.scoped.css is free of ::-webkit-scrollbar rules.");
  }
} catch (e) {
  console.error(
    "FAIL: could not read xp.scoped.css — run `npm run build` first to generate it.",
  );
  console.error("      " + e.message);
  failed++;
}

if (failed > 0) {
  console.error(`\nscrollbar-guard: ${failed} assertion(s) failed.`);
  process.exit(1);
}
console.log("\nscrollbar-guard: all assertions passed.");
