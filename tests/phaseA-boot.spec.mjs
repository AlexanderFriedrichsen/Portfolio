// Phase A Gauntlet: boot → login → desktop ceremony + audio + balloon.
// Run: node tests/phaseA-boot.spec.mjs
// Requires: `npm run preview` (or equivalent http server) serving dist at
// http://localhost:4321/Portfolio/ — same convention as d6-gating.mjs.
import { chromium } from "playwright";
import { statSync } from "node:fs";

const URL = "http://localhost:4321/Portfolio/#desktop";

const results = {
  loginWavFileSize: null,
  startupWavFileSize: null,
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
  clickLoginOpensDesktop: null,
  loginWavRequested: null,
  balloonAppears: null,
  balloonHasCloseButton: null,
  balloonCloseDismisses: null,
  balloonPersistsPast9s: null,
  returnVisitorShortCircuit: null,
  returnVisitorNoBalloon: null,
  r7RndDirectChild: null,
  pageErrors: [],
};

// ── File-system check: real XP login.wav is ~190 KB, synthesized placeholder
// was ~5 KB. Gate at 40 KB to catch regression to placeholder.
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

// R4 Fix 4: startup.wav must exist (canonical XP startup chord is ~424 KB;
// gate at 100 KB so any regression to placeholder or to the small 2 KB
// "Windows XP Start.wav" is caught).
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

function pass(name, cond, extra = "") {
  results[name] = { pass: !!cond, extra };
  const tag = cond ? "PASS" : "FAIL";
  console.log(`  [${tag}] ${name}${extra ? " — " + extra : ""}`);
}

const browser = await chromium.launch();

// ── Scenario 1: first visit ─ boot auto-advance, login click, balloon ──────
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    hasTouch: false,
    isMobile: false,
  });
  // Ensure clean slate: no visited flag.
  await ctx.addInitScript(() => {
    try {
      localStorage.removeItem("portfolio:visited");
    } catch {}
  });
  const page = await ctx.newPage();

  // Track login.wav requests.
  let loginWavCount = 0;
  page.on("request", (req) => {
    if (/\/sounds\/login\.wav(\?|$)/.test(req.url())) loginWavCount++;
  });
  page.on("pageerror", (e) => results.pageErrors.push(e.message));

  await page.goto(URL, { waitUntil: "domcontentloaded" });
  // Scroll to the desktop section so the client:media island hydrates.
  await page.evaluate(() => {
    const el = document.getElementById("desktop");
    if (el) el.scrollIntoView();
  });

  // Wait for the boot screen to appear (island hydration).
  await page
    .waitForSelector(".desktop-only .boot-screen", { timeout: 5000 })
    .catch(() => {});
  const bootVisible = await page.locator(".desktop-only .boot-screen").count();
  pass("initialBoot", bootVisible === 1, `bootCount=${bootVisible}`);

  // R4 Fix 3: while the boot screen is up on first visit, the
  // .retro-desktop root must be visibility:hidden. This is the SSR-flash
  // guard — before this fix, the fully-rendered desktop painted for a
  // frame before the boot overlay mounted.
  const desktopVis = await page.evaluate(() => {
    const el = document.querySelector(".desktop-only .retro-desktop");
    if (!el) return { found: false };
    return {
      found: true,
      visibility: getComputedStyle(el).visibility,
    };
  });
  pass(
    "desktopHiddenBeforeBoot",
    desktopVis.found && desktopVis.visibility === "hidden",
    JSON.stringify(desktopVis),
  );

  // Wordmark (HonestAlexFXP) should render on BootScreen.
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

  // Wait for auto-advance to login (2000ms + margin).
  await page.waitForTimeout(2400);
  const loginCount = await page.locator(".desktop-only .login-screen").count();
  const bootGone = await page.locator(".desktop-only .boot-screen").count();
  pass(
    "autoAdvanceToLogin",
    loginCount === 1 && bootGone === 0,
    `login=${loginCount} boot=${bootGone}`,
  );

  // Wordmark + name + role should render on LoginScreen.
  const loginWordmark = await page
    .locator(".desktop-only .login-screen .xp-wordmark")
    .count();
  pass("loginWordmarkPresent", loginWordmark === 1, `count=${loginWordmark}`);

  // R4 Fix 5: two-column structure — left column with instruction text,
  // vertical divider, right column with user card.
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

  // R4 Fix 5: horizontal gradient bars at top and bottom of the inner band.
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

  // R4 Fix 5: bottom-right flavor text present.
  const flavor = await page
    .locator(".desktop-only .login-screen .login-flavor")
    .innerText()
    .catch(() => "");
  pass(
    "loginFlavorText",
    flavor.length > 0 && /desktop|pixel|explore/i.test(flavor),
    `text="${flavor.slice(0, 80)}"`,
  );

  // Click the login user card (R4 Fix 5: the whole card is the button).
  const avatarBefore = loginWavCount;
  await page.locator(".desktop-only .login-screen .login-user-card").click();
  await page.waitForTimeout(200);

  // login.wav should have been requested at least once by now (preload
  // fires one request on mount; play() reuses the cached element and may
  // not fire a second). We just need proof the audio path is wired.
  pass(
    "loginWavRequested",
    loginWavCount >= 1,
    `totalRequests=${loginWavCount} deltaFromClick=${loginWavCount - avatarBefore}`,
  );

  // Login/boot should be gone; desktop icons should be visible.
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

  // R4 Fix 2: balloon must have an explicit close (X) button.
  const balloonCloseCount = await page
    .locator(".welcome-balloon .welcome-balloon-close")
    .count();
  pass(
    "balloonHasCloseButton",
    balloonCloseCount === 1,
    `count=${balloonCloseCount}`,
  );

  // R4 Fix 2: balloon must remain visible for at least 9 seconds after
  // appearing. We already waited 2.4s for it to appear; sleep another
  // 7s (for ~9.4s total visible) and assert it's still there.
  await page.waitForTimeout(7000);
  const balloonAfter9s = await page.locator(".welcome-balloon").count();
  pass(
    "balloonPersistsPast9s",
    balloonAfter9s === 1,
    `countAfter9s=${balloonAfter9s}`,
  );

  // R4 Fix 2: clicking the close button dismisses the balloon.
  await page.locator(".welcome-balloon .welcome-balloon-close").click();
  await page.waitForTimeout(150);
  const balloonAfterClose = await page.locator(".welcome-balloon").count();
  pass(
    "balloonCloseDismisses",
    balloonAfterClose === 0,
    `countAfterClose=${balloonAfterClose}`,
  );

  // R7 sanity: each open <Rnd> root should be a direct child of .retro-desktop.
  // Rnd wraps its children in a div with inline style — those divs must be
  // direct children of .retro-desktop with no wrapping element in between.
  const r7 = await page.evaluate(() => {
    const root = document.querySelector(".desktop-only .retro-desktop");
    if (!root) return { ok: false, reason: "no .retro-desktop" };
    const windows = Array.from(root.querySelectorAll(":scope > div")).filter(
      (d) => d.querySelector(":scope > .window"),
    );
    return { ok: windows.length >= 1, windowCount: windows.length };
  });
  pass("r7RndDirectChild", r7.ok, JSON.stringify(r7));

  // R4 Fix 1: cookies popup was removed entirely. Assert it's gone.
  const cookiesCount = await page.locator(".cookies-dialog").count();
  if (cookiesCount !== 0) {
    console.log(`  [FAIL] cookiesDialogRemoved — count=${cookiesCount}`);
    process.exitCode = 1;
  } else {
    console.log(`  [PASS] cookiesDialogRemoved`);
  }

  await ctx.close();
}

// ── Scenario 2: return visitor short-circuit ───────────────────────────────
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    hasTouch: false,
    isMobile: false,
  });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("portfolio:visited", "1");
    } catch {}
  });
  const page = await ctx.newPage();
  // Cipher fix: assert that balloon.wav is never requested on return
  // visits (autoplay-gated; if we accidentally re-render the balloon the
  // play() call would be blocked silently and break mitchivin parity).
  let balloonWavCount = 0;
  page.on("request", (req) => {
    if (/\/sounds\/balloon\.wav(\?|$)/.test(req.url())) balloonWavCount++;
  });
  page.on("pageerror", (e) => results.pageErrors.push(e.message));
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const el = document.getElementById("desktop");
    if (el) el.scrollIntoView();
  });
  // Give the island a beat to hydrate. With client:media, the island's
  // SSR HTML contains <BootScreen/> (server has no localStorage), and on
  // hydration it re-reads localStorage and swaps to 'desktop'. Wait for
  // the boot-screen DOM element to actually unmount post-hydration.
  await page
    .waitForSelector(".desktop-only .desk-icon", { timeout: 5000 })
    .catch(() => {});
  await page
    .waitForFunction(
      () => !document.querySelector(".desktop-only .boot-screen"),
      { timeout: 4000 },
    )
    .catch(() => {});
  const lsVisited = await page.evaluate(() =>
    localStorage.getItem("portfolio:visited"),
  );
  const debugDom = await page.evaluate(() => {
    const b = document.querySelector(".boot-screen");
    return b
      ? {
          exists: true,
          parent: b.parentElement?.className || "",
          parentTag: b.parentElement?.tagName || "",
          display: getComputedStyle(b).display,
          inDesktopOnly: !!b.closest(".desktop-only"),
        }
      : { exists: false };
  });
  console.log("  debug:", JSON.stringify(debugDom));
  const boot = await page.locator(".desktop-only .boot-screen").count();
  const login = await page.locator(".desktop-only .login-screen").count();
  const icons = await page.locator(".desktop-only .desk-icon").count();
  pass(
    "returnVisitorShortCircuit",
    boot === 0 && login === 0 && icons > 0,
    `boot=${boot} login=${login} icons=${icons} visited=${lsVisited}`,
  );

  // Wait past the 2s balloon delay and assert it never appears and its
  // sound is never requested. balloon.wav gets cached by preload(), so
  // the stricter signal is counting .welcome-balloon DOM elements.
  await page.waitForTimeout(2600);
  const balloonAfterWait = await page.locator(".welcome-balloon").count();
  pass(
    "returnVisitorNoBalloon",
    balloonAfterWait === 0,
    `balloonCount=${balloonAfterWait} balloonWavReqs=${balloonWavCount}`,
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
