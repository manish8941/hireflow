import puppeteer from 'puppeteer-core';
import path from 'path';

const APP_URL = 'http://127.0.0.1:5173';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\yadav\\.gemini\\antigravity-ide\\brain\\c6c5dd0b-8bcf-464e-8546-8b58f66d1394';

async function capture() {
  console.log('Capturing Stealth Obsidian Black & Grey Glass redesign screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--enable-webgl'],
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  // 1. Desktop Dashboard with Distribution Bar Chart
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'black_grey_desktop_dashboard.png'), fullPage: false });
  console.log('Saved black_grey_desktop_dashboard.png');

  // 2. Progression Curve
  await page.evaluate(() => {
    const curveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Progression Curve'));
    if (curveBtn) curveBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'black_grey_chart_curve.png'), fullPage: false });
  console.log('Saved black_grey_chart_curve.png');

  // 3. Candidate Directory
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('.nav-item-btn')).find(b => b.textContent.includes('Candidates'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'black_grey_candidates.png'), fullPage: false });
  console.log('Saved black_grey_candidates.png');

  // 4. Kanban Pipeline
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('.nav-item-btn')).find(b => b.textContent.includes('Hiring Pipeline'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'black_grey_pipeline.png'), fullPage: false });
  console.log('Saved black_grey_pipeline.png');

  // 5. Mobile Viewport (375x812)
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'black_grey_mobile_dashboard.png'), fullPage: false });
  console.log('Saved black_grey_mobile_dashboard.png');

  await browser.close();
  console.log('All black and grey screenshots successfully captured.');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
