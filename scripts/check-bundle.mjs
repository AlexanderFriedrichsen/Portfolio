#!/usr/bin/env node
// Bundle ceiling check for the desktop island.
// Sums GZIPPED JS+CSS shipped under /_astro/ and fails over the limit.
// Per D2 plan: ≤150000 bytes gz total, ≤80 KB gz delta beyond spike (65.2 KB).
import { readdirSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const LIMIT = 150_000; // bytes gz
const DIST = new URL("../dist/_astro/", import.meta.url);

let total = 0;
let totalRaw = 0;
const files = [];
try {
  for (const f of readdirSync(DIST)) {
    if (!/\.(js|css)$/.test(f)) continue;
    const buf = readFileSync(new URL(f, DIST));
    const gz = gzipSync(buf).length;
    totalRaw += buf.length;
    total += gz;
    files.push({ f, raw: buf.length, gz });
  }
} catch (e) {
  console.error("check-bundle: dist not found at", DIST.pathname);
  process.exit(1);
}

files.sort((a, b) => b.gz - a.gz);
for (const { f, raw, gz } of files) {
  console.log(
    `  ${(gz / 1024).toFixed(1).padStart(7)} KB gz  (${(raw / 1024).toFixed(1).padStart(7)} KB raw)  ${f}`,
  );
}
console.log(`\nTotal gz: ${(total / 1024).toFixed(1)} KB (${total} bytes)`);
console.log(`Raw:      ${(totalRaw / 1024).toFixed(1)} KB`);
console.log(`Limit:    ${(LIMIT / 1024).toFixed(1)} KB (${LIMIT} bytes gz)`);

if (total > LIMIT) {
  console.error(`\nFAIL: bundle exceeds ${LIMIT} bytes gz`);
  process.exit(1);
}
console.log("PASS");
