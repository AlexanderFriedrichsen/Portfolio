#!/usr/bin/env node
// Scope xp.css under `.xp-scope` so its global rules (body, h1, ::scrollbar, etc.)
// don't bleed into the rest of the Portfolio.
// Reads node_modules/xp.css/dist/XP.css → writes src/components/desktop/xp.scoped.css.
//
// Strategy: parse top-level rules, prefix every selector list with `.xp-scope `.
// Bare element selectors like `body` are rewritten to `.xp-scope` (the scope IS the body
// surrogate). `@font-face`, `@keyframes`, and other at-rules pass through untouched.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, "../node_modules/xp.css/dist/XP.css");
const OUT = resolve(__dirname, "../src/components/desktop/xp.scoped.css");

let css = readFileSync(SRC, "utf8");

// ─── Strip ::-webkit-scrollbar* rules ────────────────────────────────────
// XP.css bundles a huge scrollbar skin with ~50 inlined data-URI bitmaps.
// That's ~20 KB gz of weight we don't need: the desktop component doesn't
// depend on XP scrollbar styling for layout (Cipher verified round-1), and
// default OS scrollbars look fine inside the windows. We rip them out before
// scoping so they never reach xp.scoped.css.
//
// IMPORTANT FOR FUTURE xp.css UPGRADERS: the scoper below uses comma-split
// selector-list prefixing. If a future xp.css release introduces a
// selector-list like `body, body.foo` where `.foo` is a *descendant* marker
// on body, our `/^(body|html)/` rewrite will silently drop the descendant
// relationship. Current XP.css (0.2.6) has 0 such occurrences, but if you
// upgrade and the desktop chrome breaks, grep for `body\.` in the raw
// XP.css and handle it explicitly.
{
  // Parse top-level rules; drop any whose selector list contains a
  // ::-webkit-scrollbar* or ::-webkit-resizer pseudo-element.
  const scrollbarPseudo =
    /::-webkit-(scrollbar(-button|-track(-piece)?|-thumb|-corner)?|resizer)\b/;
  let stripped = "";
  let p = 0;
  const L = css.length;
  while (p < L) {
    // preserve comments verbatim
    if (css[p] === "/" && css[p + 1] === "*") {
      const end = css.indexOf("*/", p + 2);
      if (end === -1) {
        stripped += css.slice(p);
        break;
      }
      stripped += css.slice(p, end + 2);
      p = end + 2;
      continue;
    }
    // at-rules pass through verbatim (the inner contents may contain
    // scrollbar rules, but XP.css doesn't wrap them in @media/@supports).
    if (css[p] === "@") {
      // find end of at-rule header
      let q = p;
      while (q < L && css[q] !== "{" && css[q] !== ";") q++;
      if (q >= L || css[q] === ";") {
        stripped += css.slice(p, q + 1);
        p = q + 1;
        continue;
      }
      // block at-rule: read to matching brace
      let depth = 0;
      let r = q;
      for (; r < L; r++) {
        if (css[r] === "{") depth++;
        else if (css[r] === "}") {
          depth--;
          if (depth === 0) break;
        }
      }
      stripped += css.slice(p, r + 1);
      p = r + 1;
      continue;
    }
    // normal rule: selector { body }
    const braceIdx = css.indexOf("{", p);
    if (braceIdx === -1) {
      stripped += css.slice(p);
      break;
    }
    let depth = 0;
    let r = braceIdx;
    for (; r < L; r++) {
      if (css[r] === "{") depth++;
      else if (css[r] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    const sel = css.slice(p, braceIdx);
    if (scrollbarPseudo.test(sel)) {
      // drop this rule entirely
    } else {
      stripped += css.slice(p, r + 1);
    }
    p = r + 1;
  }
  css = stripped;
}

// Walk the CSS, finding selector lists outside braces and at-rules.
// We tokenize at top level only — nested at-rules like @media still work because
// their inner rules are still selectors that need prefixing.
let out = "";
let i = 0;
const len = css.length;
const SCOPE = ".xp-scope";

function isAtRuleStart(idx) {
  return css[idx] === "@";
}

// Read until matching brace, returning [body, endIdx] where endIdx points at the closing }.
function readBlock(start) {
  let depth = 0;
  let j = start;
  for (; j < len; j++) {
    const c = css[j];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return j;
    }
  }
  return j;
}

function prefixSelectorList(sel) {
  // Split on commas not inside parentheses.
  const parts = [];
  let depth = 0;
  let buf = "";
  for (const c of sel) {
    if (c === "(") depth++;
    else if (c === ")") depth--;
    if (c === "," && depth === 0) {
      parts.push(buf);
      buf = "";
    } else {
      buf += c;
    }
  }
  if (buf.trim()) parts.push(buf);
  return parts
    .map((p) => {
      const t = p.trim();
      if (!t) return t;
      // Bare body / html → become the scope itself
      if (/^(body|html)\b/.test(t)) {
        return SCOPE + t.replace(/^(body|html)/, "");
      }
      // ::-webkit-scrollbar etc — pseudo-element on root → attach to scope
      if (t.startsWith("::")) return SCOPE + t;
      // Already starts with the scope → leave alone
      if (t.startsWith(SCOPE)) return t;
      return SCOPE + " " + t;
    })
    .join(", ");
}

while (i < len) {
  // Skip whitespace + comments verbatim
  if (css[i] === "/" && css[i + 1] === "*") {
    const end = css.indexOf("*/", i + 2);
    if (end === -1) {
      out += css.slice(i);
      break;
    }
    out += css.slice(i, end + 2);
    i = end + 2;
    continue;
  }

  if (isAtRuleStart(i)) {
    // Read at-rule name
    const nameMatch = /^@([a-zA-Z-]+)/.exec(css.slice(i));
    const name = nameMatch ? nameMatch[1] : "";
    // Find next ; or { at top level
    let j = i;
    let foundBrace = false;
    while (j < len) {
      if (css[j] === ";") {
        j++;
        break;
      }
      if (css[j] === "{") {
        foundBrace = true;
        break;
      }
      j++;
    }
    if (!foundBrace) {
      // statement at-rule like @import, @charset
      out += css.slice(i, j);
      i = j;
      continue;
    }
    // Block at-rule. For @media / @supports / @container, recurse on inner.
    // For @font-face / @keyframes / @page, copy verbatim.
    const prelude = css.slice(i, j); // includes "@name ..."
    const blockEnd = readBlock(j);
    const inner = css.slice(j + 1, blockEnd);
    if (/^@(media|supports|container|layer)\b/.test(prelude)) {
      out += prelude + "{" + scopeRules(inner) + "}";
    } else {
      // verbatim
      out += prelude + "{" + inner + "}";
    }
    i = blockEnd + 1;
    continue;
  }

  // Regular rule: selector list { ... }
  let braceIdx = css.indexOf("{", i);
  if (braceIdx === -1) {
    out += css.slice(i);
    break;
  }
  const sel = css.slice(i, braceIdx);
  const blockEnd = readBlock(braceIdx);
  const body = css.slice(braceIdx + 1, blockEnd);
  out += prefixSelectorList(sel) + "{" + body + "}";
  i = blockEnd + 1;
}

function scopeRules(chunk) {
  // Recursively scope a block of rules (used for @media inner).
  let s = "";
  let k = 0;
  const n = chunk.length;
  while (k < n) {
    if (chunk[k] === "/" && chunk[k + 1] === "*") {
      const end = chunk.indexOf("*/", k + 2);
      if (end === -1) {
        s += chunk.slice(k);
        break;
      }
      s += chunk.slice(k, end + 2);
      k = end + 2;
      continue;
    }
    if (chunk[k] === "@") {
      const nameMatch = /^@([a-zA-Z-]+)/.exec(chunk.slice(k));
      let kk = k;
      let foundBrace = false;
      while (kk < n) {
        if (chunk[kk] === ";") {
          kk++;
          break;
        }
        if (chunk[kk] === "{") {
          foundBrace = true;
          break;
        }
        kk++;
      }
      if (!foundBrace) {
        s += chunk.slice(k, kk);
        k = kk;
        continue;
      }
      const prelude = chunk.slice(k, kk);
      // Find matching brace within chunk
      let depth = 0;
      let endK = kk;
      for (; endK < n; endK++) {
        if (chunk[endK] === "{") depth++;
        else if (chunk[endK] === "}") {
          depth--;
          if (depth === 0) break;
        }
      }
      const innerInner = chunk.slice(kk + 1, endK);
      if (/^@(media|supports|container|layer)\b/.test(prelude)) {
        s += prelude + "{" + scopeRules(innerInner) + "}";
      } else {
        s += prelude + "{" + innerInner + "}";
      }
      k = endK + 1;
      continue;
    }
    let braceIdx = chunk.indexOf("{", k);
    if (braceIdx === -1) {
      s += chunk.slice(k);
      break;
    }
    const sel = chunk.slice(k, braceIdx);
    let depth = 0;
    let endK = braceIdx;
    for (; endK < n; endK++) {
      if (chunk[endK] === "{") depth++;
      else if (chunk[endK] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    const body = chunk.slice(braceIdx + 1, endK);
    s += prefixSelectorList(sel) + "{" + body + "}";
    k = endK + 1;
  }
  return s;
}

// Strip xp.css's bundled bitmap fonts entirely. We force Tahoma in our own CSS,
// so there's no reason to ship 100KB+ of pixel font files. This drops the
// @font-face blocks (which only declare Pixelated MS Sans Serif and DOS VGA).
const finalCss = out.replace(/@font-face\s*\{[^}]*\}/g, "");

writeFileSync(OUT, finalCss);
console.log(
  `scope-xpcss: wrote ${OUT} (${(finalCss.length / 1024).toFixed(1)} KB)`,
);
