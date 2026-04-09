// D6 Gauntlet: gating matrix + CLS + touch interactions for retro desktop.
// Run: node tests/d6-gating.mjs  (requires http-server on :4321 serving dist at /Portfolio/)
import { chromium, devices } from "playwright";

// D7: now points at the integrated #desktop section on the real index page.
const URL = "http://localhost:4321/Portfolio/#desktop";

const viewports = [
  {
    name: "1920x1080 mouse",
    vw: 1920,
    vh: 1080,
    hasTouch: false,
    isMobile: false,
    expect: "desktop",
  },
  {
    name: "1280x800 mouse",
    vw: 1280,
    vh: 800,
    hasTouch: false,
    isMobile: false,
    expect: "desktop",
  },
  {
    name: "1024x768 mouse",
    vw: 1024,
    vh: 768,
    hasTouch: false,
    isMobile: false,
    expect: "desktop",
  },
  {
    name: "1023x768 mouse",
    vw: 1023,
    vh: 768,
    hasTouch: false,
    isMobile: false,
    expect: "mobile",
  },
  {
    name: "768x1024 tablet",
    vw: 768,
    vh: 1024,
    hasTouch: true,
    isMobile: true,
    expect: "mobile",
  },
  {
    name: "375x667 iPhone SE",
    vw: 375,
    vh: 667,
    hasTouch: true,
    isMobile: true,
    expect: "mobile",
  },
  {
    name: "1280x800 coarse",
    vw: 1280,
    vh: 800,
    hasTouch: true,
    isMobile: true,
    expect: "mobile",
  },
];

// Media-query gating in the preview page uses wrappers .desktop-only / .mobile-only.
// We probe getComputedStyle(display) on each.
async function probeGating(page) {
  return page.evaluate(() => {
    const d = document.querySelector(".desktop-only");
    const m = document.querySelector(".mobile-only");
    const dDisp = d ? getComputedStyle(d).display : "missing";
    const mDisp = m ? getComputedStyle(m).display : "missing";
    const xp = document.querySelector(".desktop-only .xp-scope");
    const mfRoot = document.querySelector(".mobile-only .mf-root");
    return { dDisp, mDisp, hasXp: !!xp, hasMfRoot: !!mfRoot };
  });
}

async function measureCLS(page) {
  // Inline PerformanceObserver for layout-shift — no CDN (sandbox has no network).
  await page.evaluate(() => {
    window.__cls = 0;
    window.__clsEntries = 0;
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__cls += entry.value;
          window.__clsEntries++;
        }
      }
    });
    po.observe({ type: "layout-shift", buffered: true });
    window.__po = po;
  });
  // let things settle + force layout events
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  // web-vitals reports CLS on hidden
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  return page.evaluate(() => window.__cls || 0);
}

const results = {
  gating: [],
  cls: {},
  touch: {},
  mobileLayout: {},
  console: {},
};

const browser = await chromium.launch();

// ---- 1. Gating matrix ----
for (const v of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: v.vw, height: v.vh },
    hasTouch: v.hasTouch,
    isMobile: v.isMobile,
  });
  // Phase A: pre-set the visited flag so the boot/login ceremony short-
  // circuits. Without this, the desk-icon selectors below race the 2s
  // boot auto-advance and flake. This is intentional, narrow, and only
  // applies to the d6 gating matrix — phaseA-boot.spec.mjs covers the
  // first-visit ceremony separately.
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("portfolio:visited", "1");
    } catch {}
  });
  const page = await ctx.newPage();
  const consoleErrs = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrs.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrs.push("pageerror: " + err.message));

  await page.goto(URL, { waitUntil: "networkidle" });
  // Stylesheets may flake under http-server load — retry once if probe shows
  // both visible (default unscoped state).
  let g = await probeGating(page);
  if (g.dDisp !== "none" && g.mDisp !== "none") {
    await page.reload({ waitUntil: "networkidle" });
    g = await probeGating(page);
  }
  const visible =
    g.dDisp !== "none" ? "desktop" : g.mDisp !== "none" ? "mobile" : "NEITHER";
  const both = g.dDisp !== "none" && g.mDisp !== "none";
  const pass = visible === v.expect && !both;
  results.gating.push({
    name: v.name,
    expect: v.expect,
    got: visible,
    both,
    ...g,
    pass,
  });
  results.console[v.name] = consoleErrs;
  await ctx.close();
}

// ---- 2. CLS at two target viewports ----
for (const v of [
  {
    name: "1280x800 mouse",
    vw: 1280,
    vh: 800,
    hasTouch: false,
    isMobile: false,
  },
  { name: "375x667 mobile", vw: 375, vh: 667, hasTouch: true, isMobile: true },
]) {
  const ctx = await browser.newContext({
    viewport: { width: v.vw, height: v.vh },
    hasTouch: v.hasTouch,
    isMobile: v.isMobile,
  });
  // Phase A: pre-set the visited flag so the boot/login ceremony short-
  // circuits. Without this, the desk-icon selectors below race the 2s
  // boot auto-advance and flake. This is intentional, narrow, and only
  // applies to the d6 gating matrix — phaseA-boot.spec.mjs covers the
  // first-visit ceremony separately.
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("portfolio:visited", "1");
    } catch {}
  });
  const page = await ctx.newPage();
  // Install layout-shift observer before any page script runs so we catch
  // the client:visible hydration shift.
  await page.addInitScript(() => {
    window.__cls = 0;
    window.__clsEntries = 0;
    try {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__cls += entry.value;
            window.__clsEntries++;
          }
        }
      });
      po.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      window.__clsErr = String(e);
    }
  });
  await page.goto(URL, { waitUntil: "networkidle" });
  // Scroll to trigger client:visible hydration for the desktop island at larger vps.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  const cls = await page.evaluate(() => ({
    cls: window.__cls || 0,
    entries: window.__clsEntries || 0,
    err: window.__clsErr || null,
  }));
  results.cls[v.name] = cls;
  await ctx.close();
}

// ---- 3. Touch/mouse interactions on 1280x800 desktop ----
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    hasTouch: false,
    isMobile: false,
  });
  // Phase A: pre-set the visited flag so the boot/login ceremony short-
  // circuits. Without this, the desk-icon selectors below race the 2s
  // boot auto-advance and flake. This is intentional, narrow, and only
  // applies to the d6 gating matrix — phaseA-boot.spec.mjs covers the
  // first-visit ceremony separately.
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("portfolio:visited", "1");
    } catch {}
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(URL, { waitUntil: "networkidle" });
  // wait for island hydration
  await page.waitForSelector(".desktop-only .xp-scope .desk-icon", {
    timeout: 10000,
  });
  await page.waitForTimeout(800); // rnd init

  const t = results.touch;

  // Initial state: Desktop.tsx pre-opens "agent-team" window on hydration.
  t.baselineWindows = await page.locator(".desktop-only .window").count();
  // Double-click second desk icon to open another window
  const firstIcon = page.locator(".desk-icons .desk-icon").nth(1);
  await firstIcon.dblclick();
  await page.waitForTimeout(400);
  t.afterDblClick = await page.locator(".desktop-only .window").count();
  t.dblClickOpens = t.afterDblClick - t.baselineWindows; // expect 1

  // Focus after open: look for .window.active
  t.focusAfterOpen =
    (await page.locator(".desktop-only .window.active").count()) >= 1;

  // Drag window by title-bar. Scope to Rnd wrapper (direct child of .retro-desktop)
  // to avoid matching any nested `.title-bar` that 7.css may render inside window bodies.
  const rndWrapper = page
    .locator(".desktop-only .retro-desktop > div")
    .filter({ has: page.locator("> .window") })
    .first();
  const titleBar = rndWrapper.locator("> .window > .title-bar");
  t.titleBarCount = await titleBar.count();
  t.titleBarVisible = await titleBar.isVisible().catch(() => false);
  const bbBefore = await rndWrapper.boundingBox();
  await titleBar.hover({ force: true });
  await page.mouse.down();
  await page.mouse.move(
    bbBefore.x + bbBefore.width / 2 + 150,
    bbBefore.y + 20,
    { steps: 10 },
  );
  await page.mouse.up();
  await page.waitForTimeout(200);
  const bbAfter = await rndWrapper.boundingBox();
  t.dragDelta = {
    dx: Math.round(bbAfter.x - bbBefore.x),
    dy: Math.round(bbAfter.y - bbBefore.y),
  };
  t.dragWorks = Math.abs(bbAfter.x - bbBefore.x) > 50;

  // Close window via close button. Use force: true since 7.css styles the buttons
  // with pseudo-elements that can trip Playwright's visibility heuristic (bbox OK).
  const closeBtn = rndWrapper.locator(
    "> .window > .title-bar > .title-bar-controls button[aria-label^='Close']",
  );
  const closeCount = await closeBtn.count();
  t.closeBtnCount = closeCount;
  t.closeBtnBox = await closeBtn
    .first()
    .boundingBox()
    .catch(() => null);
  t.closeBtnStyle = await closeBtn
    .first()
    .evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        display: s.display,
        visibility: s.visibility,
        opacity: s.opacity,
        w: el.offsetWidth,
        h: el.offsetHeight,
      };
    })
    .catch(() => null);
  if (closeCount > 0) {
    await closeBtn.first().click({ force: true });
  } else {
    // fallback — last child button in title-bar-controls
    await page
      .locator(".desktop-only .window .title-bar-controls button")
      .last()
      .click();
  }
  await page.waitForTimeout(300);
  t.afterClose = await page.locator(".desktop-only .window").count();

  // Keyboard: focus a *different* icon (nth(2)) and press Enter
  const kbdIcon = page.locator(".desk-icons .desk-icon").nth(2);
  await kbdIcon.focus();
  await kbdIcon.press("Enter");
  await page.waitForTimeout(400);
  const afterEnter = await page.locator(".desktop-only .window").count();
  t.enterOpens = afterEnter;
  t.enterIncreased = afterEnter > t.afterClose;

  // ---- v2 assertions ----
  // Visible close X (regression: v1 had an invisible-X bug from 7.css).
  // Re-open a window so we have a fresh close button to inspect.
  const reIcon = page.locator(".desk-icons .desk-icon").nth(0);
  await reIcon.dblclick();
  await page.waitForTimeout(300);
  const xBtn = page
    .locator(
      ".desktop-only .window .title-bar-controls button[aria-label^='Close']",
    )
    .first();
  t.closeXBox = await xBtn.boundingBox().catch(() => null);
  t.closeXVisible =
    !!t.closeXBox && t.closeXBox.width >= 8 && t.closeXBox.height >= 8;

  // Regression guard: the v1 invisible-X bug was caused by `aria-label`
  // including the window title (e.g. "Close My Window"), which broke the
  // xp.css selector `[aria-label=Close]` so the SVG glyph background-image
  // never applied. The button still had a 21x21 bbox from the generic
  // `.title-bar-controls button` rule, so a bbox-only check was insufficient.
  // Assert all three control glyphs actually have a background-image set.
  t.controlGlyphs = await page.evaluate(() => {
    // Inspect EVERY window's title-bar-controls — every window must have all
    // three glyphs painted, not just the first one in DOM order.
    const wins = Array.from(document.querySelectorAll(".desktop-only .window"));
    if (wins.length === 0) return { error: "no windows" };
    const summary = { windowCount: wins.length, perWindow: [] };
    summary.allButtons = Array.from(
      document.querySelectorAll(
        ".desktop-only .window .title-bar-controls button",
      ),
    ).map((b) => b.getAttribute("aria-label"));
    let allGood = true;
    for (const win of wins) {
      const row = { title: "" };
      const titleEl = win.querySelector(".title-bar-text");
      row.title = titleEl ? titleEl.textContent : "(no title)";
      for (const label of ["Close", "Minimize", "Maximize"]) {
        const btn = win.querySelector(
          `.title-bar-controls button[aria-label="${label}"]`,
        );
        if (!btn) {
          row[label] = "missing";
          // Cookies dialog only has Close, so missing Min/Max is OK there.
          if (label === "Close") allGood = false;
          continue;
        }
        const bg = getComputedStyle(btn).backgroundImage;
        const ok = bg && bg !== "none" && bg.includes("url(");
        row[label] = ok ? "ok" : `BAD:${(bg || "").slice(0, 30)}`;
        if (!ok) allGood = false;
      }
      summary.perWindow.push(row);
    }
    summary.allGood = allGood;
    return summary;
  });
  t.controlGlyphsAllPresent = !!t.controlGlyphs.allGood;

  // Cookies popup is INSIDE the desktop bounds (child of .retro-desktop, not body).
  await page.waitForTimeout(1700); // 1.5s mount delay
  t.cookiesInsideDesktop = await page.evaluate(() => {
    const c = document.querySelector(".cookies-dialog");
    if (!c) return false;
    return !!c.closest(".retro-desktop");
  });

  // Start button toggles the menu.
  const startBtn = page.locator(".desktop-only .start-btn").first();
  t.startBtnCount = await startBtn.count();
  await startBtn.click();
  await page.waitForTimeout(150);
  t.startMenuOpenAfterClick = await page
    .locator(".desktop-only .start-menu")
    .count();
  // v2 r2: Start menu should live inside .retro-desktop (parallel to
  // cookiesInsideDesktop).
  t.startMenuInsideDesktop = await page.evaluate(() => {
    const sm = document.querySelector(".start-menu");
    if (!sm) return false;
    return !!sm.closest(".retro-desktop");
  });
  // BSOD via Shut Down menuitem. Use raw .click() on the DOM node so we
  // bypass any overlapping element / click-outside handler timing weirdness.
  await page.evaluate(() => {
    const b = document.querySelector(".sm-shutdown");
    if (b) b.click();
  });
  await page.waitForTimeout(250);
  t.bsodVisible = (await page.locator(".desktop-only .bsod").count()) === 1;
  // v2 r2: BSOD should live inside .retro-desktop.
  t.bsodInsideDesktop = await page.evaluate(() => {
    const b = document.querySelector(".bsod");
    if (!b) return false;
    return !!b.closest(".retro-desktop");
  });
  // Click anywhere dismisses
  await page.mouse.click(400, 400);
  await page.waitForTimeout(200);
  t.bsodDismissed = (await page.locator(".desktop-only .bsod").count()) === 0;

  // No vertical scroll on the html element at >=1024 fine.
  t.noScroll = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollHeight <= root.clientHeight + 1;
  });

  t.pageErrors = errs;
  await ctx.close();
}

// ---- 4. Mobile layout checks on 375x667 ----
{
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 667 },
    hasTouch: true,
    isMobile: true,
  });
  // Phase A: pre-set the visited flag so the boot/login ceremony short-
  // circuits. Without this, the desk-icon selectors below race the 2s
  // boot auto-advance and flake. This is intentional, narrow, and only
  // applies to the d6 gating matrix — phaseA-boot.spec.mjs covers the
  // first-visit ceremony separately.
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("portfolio:visited", "1");
    } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  const m = await page.evaluate(() => {
    const root = document.documentElement;
    const cards = document.querySelectorAll(".mobile-only .mf-card");
    return {
      scrollWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
      cardCount: cards.length,
      noHScroll: root.scrollWidth <= root.clientWidth + 1,
    };
  });
  results.mobileLayout = m;
  await ctx.close();
}

await browser.close();

console.log(JSON.stringify(results, null, 2));
