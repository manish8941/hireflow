import puppeteer from 'puppeteer-core';
import path from 'path';

const APP_URL = 'http://127.0.0.1:5173';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\yadav\\.gemini\\antigravity-ide\\brain\\271b0acf-86cf-4117-a190-6dccf4560019';

async function navigateToTab(page, tabName) {
  await page.evaluate(() => {
    const trigger = document.querySelector('.dynamic-island-trigger');
    if (trigger && !document.querySelector('.dynamic-island-menu')) {
      trigger.click();
    }
  });
  await new Promise(r => setTimeout(r, 250));
  await page.evaluate((name) => {
    const navBtn = Array.from(document.querySelectorAll('.nav-item-btn')).find(b => b.textContent.includes(name));
    if (navBtn) {
      navBtn.click();
    }
  }, tabName);
  await new Promise(r => setTimeout(r, 350));
}

async function capture() {
  console.log('Capturing Minimal Editorial Monochrome macOS redesign screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Desktop Minimal Editorial Hero in Dark Theme
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('hireflow_theme', 'dark');
  });
  await new Promise(r => setTimeout(r, 300));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'editorial_dark_hero.png'),
    fullPage: false,
  });
  console.log('Saved editorial_dark_hero.png');

  // 2. Dynamic Island Expanded State
  await page.evaluate(() => {
    const trigger = document.querySelector('.dynamic-island-trigger');
    if (trigger) trigger.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'editorial_dynamic_island_expanded.png'),
    fullPage: false,
  });
  console.log('Saved editorial_dynamic_island_expanded.png');

  // Close Dynamic Island with Escape
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));

  // 3. Desktop Minimal Editorial Hero in Light Theme (Pristine Off-White)
  await page.evaluate(() => {
    const themeBtn = document.querySelector('.dynamic-island-theme-btn');
    if (themeBtn) themeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'editorial_light_hero.png'),
    fullPage: false,
  });
  console.log('Saved editorial_light_hero.png');

  // 4. Scroll down to Operational Workspace in Light Theme
  await page.evaluate(() => {
    window.scrollTo({ top: 780, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'editorial_workspace_scrolled.png'),
    fullPage: false,
  });
  console.log('Saved editorial_workspace_scrolled.png');

  // Switch back to Dark Theme
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const themeBtn = document.querySelector('.dynamic-island-theme-btn');
    if (themeBtn) themeBtn.click();
  });
  await new Promise(r => setTimeout(r, 350));

  // 5. Candidates Directory Tab
  await navigateToTab(page, 'Candidates');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'editorial_candidates.png'),
    fullPage: false,
  });
  console.log('Saved editorial_candidates.png');

  // 6. Hiring Pipeline Kanban Tab
  await navigateToTab(page, 'Hiring Pipeline');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'editorial_pipeline.png'),
    fullPage: false,
  });
  console.log('Saved editorial_pipeline.png');

  // 7. Mobile Viewport (375x812)
  await navigateToTab(page, 'Dashboard');
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'editorial_mobile.png'),
    fullPage: false,
  });
  console.log('Saved editorial_mobile.png');

  await browser.close();
  console.log('All editorial screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
