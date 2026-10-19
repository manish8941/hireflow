import puppeteer from 'puppeteer-core';
import fs from 'fs';

const VIEWPORTS = [
  { name: 'desktop_1920x1080', width: 1920, height: 1080 },
  { name: 'desktop_1440x900', width: 1440, height: 900 },
  { name: 'tablet_1024x768', width: 1024, height: 768 },
  { name: 'tablet_768x1024', width: 768, height: 1024 },
  { name: 'mobile_390x844', width: 390, height: 844 },
  { name: 'mobile_320x700', width: 320, height: 700 },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[PAGE_ERROR] ${err.message}`));

  console.log('Testing Live Application...');

  // 1. Desktop Dashboard with Mascot in default state
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.mascot-face-svg', { timeout: 8000 });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: 'verify_01_dashboard_neutral.png' });
  console.log('Captured: verify_01_dashboard_neutral.png');

  // Zoomed-in crop of the mascot in bottom-right corner
  const mascotBtn = await page.$('.cloudee-mascot-btn');
  if (mascotBtn) {
    const box = await mascotBtn.boundingBox();
    if (box) {
      await page.screenshot({
        path: 'verify_02_mascot_closeup_neutral.png',
        clip: {
          x: Math.max(0, box.x - 30),
          y: Math.max(0, box.y - 30),
          width: box.width + 60,
          height: box.height + 60,
        }
      });
      console.log('Captured: verify_02_mascot_closeup_neutral.png');
    }
  }

  // 2. Click Mascot -> Trigger Happy reaction & open Helper Panel
  await page.click('.cloudee-mascot-btn');
  await page.waitForSelector('.cloudee-helper-panel', { timeout: 3000 });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'verify_03_mascot_panel_open.png' });
  console.log('Captured: verify_03_mascot_panel_open.png');

  // 3. Test sliding toggle inside Helper Panel (Turn OFF)
  const panelToggle = await page.$('.cloudee-helper-panel .cloudee-sliding-switch');
  if (panelToggle) {
    await panelToggle.click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'verify_04_mascot_turned_off.png' });
    console.log('Captured: verify_04_mascot_turned_off.png (Mascot hidden, panel closed)');

    // Turn back ON via collapsed pill
    const collapsedPill = await page.$('.cloudee-collapsed-pill');
    if (collapsedPill) {
      await collapsedPill.click();
      await new Promise(r => setTimeout(r, 600));
      await page.screenshot({ path: 'verify_05_mascot_restored_on.png' });
      console.log('Captured: verify_05_mascot_restored_on.png (Mascot restored neutral)');
    }
  }

  // 4. Test Candidate Directory Navigation & Search
  const searchInput = await page.$('.topbar-search-input');
  if (searchInput) {
    await searchInput.type('Elena');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'verify_06_search_active.png' });
    console.log('Captured: verify_06_search_active.png');
  }

  // 5. Test Settings Page with Mascot Controls & Themes
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  // Navigate to settings via Menu button
  const menuBtn = await page.$('.menu-pill-btn, .macos-island-pill');
  if (menuBtn) {
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 300));
    const settingsLink = await page.$('button[data-tab="settings"], .island-nav-item:last-child');
    if (settingsLink) {
      await settingsLink.click();
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // 6. Test Responsive Viewports
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: `verify_responsive_${vp.name}.png` });
    console.log(`Captured: verify_responsive_${vp.name}.png`);
  }

  console.log('\n--- BROWSER CONSOLE AUDIT ---');
  const errors = consoleLogs.filter(l => l.includes('[error]') || l.includes('[PAGE_ERROR]'));
  console.log(`Total logs: ${consoleLogs.length}, Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log('Errors encountered:', errors);
  } else {
    console.log('ZERO client-side errors detected during full interaction flow!');
  }

  await browser.close();
  console.log('Verification completed successfully.');
})();
