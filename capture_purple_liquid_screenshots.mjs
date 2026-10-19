import puppeteer from 'puppeteer-core';
import path from 'path';

const APP_URL = 'http://127.0.0.1:5173';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\yadav\\.gemini\\antigravity-ide\\brain\\c6c5dd0b-8bcf-464e-8546-8b58f66d1394';

async function capture() {
  console.log('Capturing Immersive Purple Liquid Glass redesign screenshots...');
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

  // Verify WebGL Canvas is active
  const canvasInfo = await page.evaluate(() => {
    const c = document.querySelector('.liquid-purple-canvas');
    if (!c) return { exists: false };
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    return {
      exists: true,
      width: c.width,
      height: c.height,
      hasGl: Boolean(gl),
    };
  });
  console.log('Liquid Purple Canvas WebGL verification:', canvasInfo);

  // Take Desktop Dashboard Screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'purple_liquid_desktop_dashboard.png'), fullPage: false });
  console.log('Saved purple_liquid_desktop_dashboard.png');

  // 2. Interactive mouse movement test & screenshot
  console.log('Simulating mouse movement to trigger liquid ripple...');
  await page.mouse.move(300, 200);
  await new Promise(r => setTimeout(r, 100));
  await page.mouse.move(500, 350);
  await new Promise(r => setTimeout(r, 100));
  await page.mouse.move(720, 450);
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'purple_liquid_mouse_interactive.png'), fullPage: false });
  console.log('Saved purple_liquid_mouse_interactive.png');

  // 3. Desktop Dashboard with Progression Curve
  await page.evaluate(() => {
    const curveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Progression Curve'));
    if (curveBtn) curveBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'purple_liquid_chart_curve.png'), fullPage: false });
  console.log('Saved purple_liquid_chart_curve.png');

  // 4. Desktop Candidates Directory
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('.nav-item-btn')).find(b => b.textContent.includes('Candidates'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'purple_liquid_candidates.png'), fullPage: false });
  console.log('Saved purple_liquid_candidates.png');

  // 5. Desktop Hiring Pipeline (Kanban)
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('.nav-item-btn')).find(b => b.textContent.includes('Hiring Pipeline'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'purple_liquid_pipeline.png'), fullPage: false });
  console.log('Saved purple_liquid_pipeline.png');

  // 6. Mobile Dashboard (375x812)
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('.nav-item-btn')).find(b => b.textContent.includes('Dashboard'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'purple_liquid_mobile_dashboard.png'), fullPage: false });
  console.log('Saved purple_liquid_mobile_dashboard.png');

  await browser.close();
  console.log('All Purple Liquid Glass screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
