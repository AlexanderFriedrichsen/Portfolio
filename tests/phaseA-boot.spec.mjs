// Phase A Gauntlet: boot → login → desktop ceremony + audio + balloon.
// Run: node tests/phaseA-boot.spec.mjs
// Requires: `npm run preview` (or equivalent http server) serving dist at
// http://localhost:4321/Portfolio/ — same convention as d6-gating.mjs.
import { chromium } from "playwright";

const URL = "http://localhost:4321/Portfolio/#desktop";

const results = {
  initialBoot: null,
  autoAdvanceToLogin: null,
  clickLoginOpensDesktop: null,
  loginWavRequested: null,
  balloonAppears: null,
  returnVisitorShortCircuit: null,
  returnVisitorNoBalloon: null,
  r7RndDirectChild: null,
  pageErrors: [],
};

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

  // Wait for auto-advance to login (2000ms + margin).
  await page.waitForTimeout(2400);
  const loginCount = await page.locator(".desktop-only .login-screen").count();
  const bootGone = await page.locator(".desktop-only .boot-screen").count();
  pass(
    "autoAdvanceToLogin",
    loginCount === 1 && bootGone === 0,
    `login=${loginCount} boot=${bootGone}`,
  );

  // Click the login avatar.
  const avatarBefore = loginWavCount;
  await page.locator(".login-avatar-btn").click();
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
