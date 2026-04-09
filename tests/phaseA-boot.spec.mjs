// Phase A Gauntlet: boot → login → desktop ceremony + audio + balloon.
// Run: node tests/phaseA-boot.spec.mjs
// Requires: `npm run preview` (or equivalent http server) serving dist at
// http://localhost:4321/Portfolio/ — same convention as d6-gating.mjs.
//
// R5: the portfolio:visited localStorage short-circuit was removed. Every
// page load (for real users) runs the full ceremony. Automated tests that
// need to skip boot use ?skipBoot=1 — the test-only URL escape hatch.
import { chromium } from "playwright";
import { statSync } from "node:fs";

const URL = "http://localhost:4321/Portfolio/#desktop";

const results = {
  loginWavFileSize: null,
  startupWavFileSize: null,
  shutdownWavFileSize: null,
  initialBoot: null,
  desktopHiddenBeforeBoot: null,
  bootWordmarkPresent: null,
  autoAdvanceToLogin: null,
  loginWordmarkPresent: null,
  loginTwoColumnStructure: null,
  loginGradientBars: null,
  loginNameText: null,
  loginRoleText: null,
  loginFlavorText: null,
  loginF11HintClickable: null,
  clickLoginOpensDesktop: null,
  startupWavPlayedOnFirstLogin: null,
  loginWavNotPlayedOnFirstLogin: null,
  balloonAppears: null,
  balloonHasCloseButton: null,
  balloonCloseDismisses: null,
  balloonPersistsPast9s: null,
  trayWelcomeIconPresent: null,
  trayFullscreenIconPresent: null,
  returnVisitorStillBoots: null,
  skipBootEscapeHatchWorks: null,
  r7RndDirectChild: null,
  pageErrors: [],
};

// File-system sound gates.
{
  try {
    const s = statSync("public/sounds/login.wav");
    const ok = s.size > 40 * 1024;
    results.loginWavFileSize = { pass: ok, extra: `size=${s.size}` };
    console.log(
      `  [${ok ? "PASS" : "FAIL"}] loginWavFileSize — size=${s.size}`,
    );
  } catch (e) {
    results.loginWavFileSize = { pass: false, extra: String(e) };
    console.log(`  [FAIL] loginWavFileSize — ${e}`);
  }
}
{
  try {
    const s = statSync("public/sounds/startup.wav");
    const ok = s.size > 100 * 1024;
    results.startupWavFileSize = { pass: ok, extra: `size=${s.size}` };
    console.log(
      `  [${ok ? "PASS" : "FAIL"}] startupWavFileSize — size=${s.size}`,
    );
  } catch (e) {
    results.startupWavFileSize = { pass: false, extra: String(e) };
    console.log(`  [FAIL] startupWavFileSize — ${e}`);
  }
}
{
  try {
    const s = statSync("public/sounds/shutdown.wav");
    const ok = s.size > 40 * 1024;
    results.shutdownWavFileSize = { pass: ok, extra: `size=${s.size}` };
    console.log(
      `  [${ok ? "PASS" : "FAIL"}] shutdownWavFileSize — size=${s.size}`,
    );
  } catch (e) {
    results.shutdownWavFileSize = { pass: false, extra: String(e) };
    console.log(`  [FAIL] shutdownWavFileSize — ${e}`);
  }
}

function pass(name, cond, extra = "") {
  results[name] = { pass: !!cond, extra };
  const tag = cond ? "PASS" : "FAIL";
  console.log(`  [${tag}] ${name}${extra ? " — " + extra : ""}`);
}

const browser = await chromium.launch();

// ── Scenario 1: first visit — full boot → login → desktop ceremony ──────────
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    hasTouch: false,
    isMobile: false,
  });
  const page = await ctx.newPage();

  let startupWavCount = 0;
  let loginWavCount = 0;
  page.on("request", (req) => {
    if (/\/sounds\/startup\.wav(\?|$)/.test(req.url())) startupWavCount++;
    if (/\/sounds\/login\.wav(\?|$)/.test(req.url())) loginWavCount++;
  });
  page.on("pageerror", (e) => results.pageErrors.push(e.message));

  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const el = document.getElementById("desktop");
    if (el) el.scrollIntoView();
  });

  await page
    .waitForSelector(".desktop-only .boot-screen", { timeout: 5000 })
    .catch(() => {});
  const bootVisible = await page.locator(".desktop-only .boot-screen").count();
  pass("initialBoot", bootVisible === 1, `bootCount=${bootVisible}`);

  const desktopVis = await page.evaluate(() => {
    const el = document.querySelector(".desktop-only .retro-desktop");
    if (!el) return { found: false };
    return { found: true, visibility: getComputedStyle(el).visibility };
  });
  pass(
    "desktopHiddenBeforeBoot",
    desktopVis.found && desktopVis.visibility === "hidden",
    JSON.stringify(desktopVis),
  );

  const bootWordmark = await page
    .locator(".desktop-only .boot-screen .xp-wordmark")
    .count();
  const bootWordmarkText = bootWordmark
    ? await page
        .locator(".desktop-only .boot-screen .xp-wordmark-text")
        .innerText()
    : "";
  pass(
    "bootWordmarkPresent",
    bootWordmark === 1 && /HonestAlexF\s*XP/i.test(bootWordmarkText),
    `count=${bootWordmark} text="${bootWordmarkText}"`,
  );

  await page.waitForTimeout(2400);
  const loginCount = await page.locator(".desktop-only .login-screen").count();
  const bootGone = await page.locator(".desktop-only .boot-screen").count();
  pass(
    "autoAdvanceToLogin",
    loginCount === 1 && bootGone === 0,
    `login=${loginCount} boot=${bootGone}`,
  );

  const loginWordmark = await page
    .locator(".desktop-only .login-screen .xp-wordmark")
    .count();
  pass("loginWordmarkPresent", loginWordmark === 1, `count=${loginWordmark}`);

  const structure = await page.evaluate(() => {
    const left = document.querySelector(
      ".desktop-only .login-screen .login-col-left",
    );
    const right = document.querySelector(
      ".desktop-only .login-screen .login-col-right",
    );
    const div = document.querySelector(
      ".desktop-only .login-screen .login-col-divider",
    );
    const instr = document.querySelector(
      ".desktop-only .login-screen .login-instruction",
    );
    const card = document.querySelector(
      ".desktop-only .login-screen .login-user-card",
    );
    return {
      left: !!left,
      right: !!right,
      divider: !!div,
      instruction: !!instr,
      userCard: !!card,
      instructionText: instr?.textContent?.trim() || "",
    };
  });
  pass(
    "loginTwoColumnStructure",
    structure.left &&
      structure.right &&
      structure.divider &&
      structure.instruction &&
      structure.userCard &&
      /click/i.test(structure.instructionText),
    JSON.stringify(structure),
  );

  const bars = await page.evaluate(() => {
    const top = document.querySelector(
      ".desktop-only .login-screen .login-bar-top",
    );
    const bot = document.querySelector(
      ".desktop-only .login-screen .login-bar-bottom",
    );
    return { top: !!top, bot: !!bot };
  });
  pass("loginGradientBars", bars.top && bars.bot, JSON.stringify(bars));

  const nameText = await page
    .locator(".desktop-only .login-screen .login-name")
    .innerText()
    .catch(() => "");
  pass(
    "loginNameText",
    /Alex\s+Friedrichsen/i.test(nameText),
    `text="${nameText}"`,
  );
  const roleText = await page
    .locator(".desktop-only .login-screen .login-role")
    .innerText()
    .catch(() => "");
  pass("loginRoleText", /AI\s+Engineer/i.test(roleText), `text="${roleText}"`);

  const flavor = await page
    .locator(".desktop-only .login-screen .login-flavor")
    .innerText()
    .catch(() => "");
  pass(
    "loginFlavorText",
    flavor.length > 0 && /desktop|pixel|explore/i.test(flavor),
    `text="${flavor.slice(0, 80)}"`,
  );

  // R5 Fix 5: the F11 hint is now a real <button>, not a pointer-events:none span.
  const f11Hint = await page.evaluate(() => {
    const el = document.querySelector(
      ".desktop-only .login-screen .login-f11-hint",
    );
    if (!el) return { found: false };
    return {
      found: true,
      tag: el.tagName,
      clickable: getComputedStyle(el).pointerEvents !== "none",
      text: el.textContent || "",
    };
  });
  pass(
    "loginF11HintClickable",
    f11Hint.found && f11Hint.tag === "BUTTON" && f11Hint.clickable,
    JSON.stringify(f11Hint),
  );

  // R5 r2 Cipher W3: assert actual audioManager.play() invocations via the
  // window.__audioPlayCount instrumentation. The network-request approach
  // missed cached replays (preload() warmed the cache, click-time play()
  // emitted no new request). This is the real signal.
  const playBefore = await page.evaluate(() => {
    const w = window;
    return {
      startup: w.__audioPlayCount?.startup ?? 0,
      login: w.__audioPlayCount?.login ?? 0,
    };
  });
  await page.locator(".desktop-only .login-screen .login-user-card").click();
  await page.waitForTimeout(300);
  const playAfter = await page.evaluate(() => {
    const w = window;
    return {
      startup: w.__audioPlayCount?.startup ?? 0,
      login: w.__audioPlayCount?.login ?? 0,
    };
  });
  pass(
    "startupWavPlayedOnFirstLogin",
    playAfter.startup - playBefore.startup === 1,
    `delta=${playAfter.startup - playBefore.startup}`,
  );
  pass(
    "loginWavNotPlayedOnFirstLogin",
    playAfter.login - playBefore.login === 0,
    `delta=${playAfter.login - playBefore.login}`,
  );

  const loginGone = await page.locator(".desktop-only .login-screen").count();
  const deskIcons = await page.locator(".desktop-only .desk-icon").count();
  pass(
    "clickLoginOpensDesktop",
    loginGone === 0 && deskIcons > 0,
    `login=${loginGone} icons=${deskIcons}`,
  );

  // Welcome balloon appears ~2s after desktop.
  await page.waitForTimeout(2400);
  const balloon = await page.locator(".welcome-balloon").count();
  const balloonText = balloon
    ? await page.locator(".welcome-balloon").innerText()
    : "";
  pass(
    "balloonAppears",
    balloon === 1 && /Welcome, Alex/i.test(balloonText),
    `count=${balloon} text="${balloonText.slice(0, 40)}"`,
  );

  const balloonCloseCount = await page
    .locator(".welcome-balloon .welcome-balloon-close")
    .count();
  pass(
    "balloonHasCloseButton",
    balloonCloseCount === 1,
    `count=${balloonCloseCount}`,
  );

  await page.waitForTimeout(7000);
  const balloonAfter9s = await page.locator(".welcome-balloon").count();
  pass(
    "balloonPersistsPast9s",
    balloonAfter9s === 1,
    `countAfter9s=${balloonAfter9s}`,
  );

  await page.locator(".welcome-balloon .welcome-balloon-close").click();
  await page.waitForTimeout(150);
  const balloonAfterClose = await page.locator(".welcome-balloon").count();
  pass(
    "balloonCloseDismisses",
    balloonAfterClose === 0,
    `countAfterClose=${balloonAfterClose}`,
  );

  // R5 Fix 6: tray icons present to the left of the clock.
  const welcomeIcon = await page
    .locator(".desktop-only .tb-tray .tb-tray-welcome")
    .count();
  pass("trayWelcomeIconPresent", welcomeIcon >= 1, `count=${welcomeIcon}`);
  const fullscreenIcon = await page
    .locator(".desktop-only .tb-tray .tb-tray-fullscreen")
    .count();
  pass(
    "trayFullscreenIconPresent",
    fullscreenIcon >= 1,
    `count=${fullscreenIcon}`,
  );

  // R7 sanity.
  const r7 = await page.evaluate(() => {
    const root = document.querySelector(".desktop-only .retro-desktop");
    if (!root) return { ok: false, reason: "no .retro-desktop" };
    const windows = Array.from(root.querySelectorAll(":scope > div")).filter(
      (d) => d.querySelector(":scope > .window"),
    );
    return { ok: windows.length >= 1, windowCount: windows.length };
  });
  pass("r7RndDirectChild", r7.ok, JSON.stringify(r7));

  // R5 Fix 2: cookies popup still gone; legacy content no longer in DOM.
  const cookiesCount = await page.locator(".cookies-dialog").count();
  if (cookiesCount !== 0) {
    console.log(`  [FAIL] cookiesDialogRemoved — count=${cookiesCount}`);
    process.exitCode = 1;
  } else {
    console.log(`  [PASS] cookiesDialogRemoved`);
  }

  // R5 Fix 2: assert no legacy editorial sections are in the DOM at all.
  const legacyCount = await page.evaluate(() => {
    return document.querySelectorAll(
      ".legacy-section, #proof, .triptych, .agent-grid",
    ).length;
  });
  if (legacyCount !== 0) {
    console.log(`  [FAIL] legacyContentRemoved — count=${legacyCount}`);
    process.exitCode = 1;
  } else {
    console.log(`  [PASS] legacyContentRemoved`);
  }

  await ctx.close();
}

// ── Scenario 2: reload still runs the ceremony (no return-visit short-circuit) ──
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    hasTouch: false,
    isMobile: false,
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => results.pageErrors.push(e.message));

  // First visit: let it reach the desktop.
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page
    .waitForSelector(".desktop-only .boot-screen", { timeout: 5000 })
    .catch(() => {});
  await page.waitForTimeout(2400);
  await page.locator(".desktop-only .login-screen .login-user-card").click();
  await page.waitForTimeout(300);

  // Reload: the ceremony MUST run again.
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const el = document.getElementById("desktop");
    if (el) el.scrollIntoView();
  });
  await page
    .waitForSelector(".desktop-only .boot-screen", { timeout: 5000 })
    .catch(() => {});
  const bootAgain = await page.locator(".desktop-only .boot-screen").count();
  pass("returnVisitorStillBoots", bootAgain === 1, `bootCount=${bootAgain}`);

  await ctx.close();
}

// ── Scenario 3: ?skipBoot=1 test escape hatch ───────────────────────────────
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    hasTouch: false,
    isMobile: false,
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => results.pageErrors.push(e.message));

  await page.goto("http://localhost:4321/Portfolio/?skipBoot=1#desktop", {
    waitUntil: "domcontentloaded",
  });
  await page.evaluate(() => {
    const el = document.getElementById("desktop");
    if (el) el.scrollIntoView();
  });
  await page
    .waitForSelector(".desktop-only .desk-icon", { timeout: 5000 })
    .catch(() => {});
  // Give hydration a moment to settle — boot should never mount in this mode.
  await page.waitForTimeout(300);
  const boot = await page.locator(".desktop-only .boot-screen").count();
  const login = await page.locator(".desktop-only .login-screen").count();
  const icons = await page.locator(".desktop-only .desk-icon").count();
  pass(
    "skipBootEscapeHatchWorks",
    boot === 0 && login === 0 && icons > 0,
    `boot=${boot} login=${login} icons=${icons}`,
  );

  await ctx.close();
}

await browser.close();

const failed = Object.entries(results)
  .filter(([k]) => k !== "pageErrors")
  .filter(([, v]) => v && v.pass === false);

console.log("\n" + JSON.stringify(results, null, 2));
if (failed.length > 0 || results.pageErrors.length > 0) {
  console.error(
    `\nFAIL: ${failed.length} assertion(s), ${results.pageErrors.length} pageerror(s)`,
  );
  process.exit(1);
}
console.log("\nPASS");
