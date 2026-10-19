import puppeteer from 'puppeteer-core';
import path from 'path';

const APP_URL = 'http://127.0.0.1:5173';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\yadav\\.gemini\\antigravity-ide\\brain\\c6c5dd0b-8bcf-464e-8546-8b58f66d1394';

async function capture() {
  console.log('Capturing macOS M3 redesign screenshots via Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Desktop Dashboard with Distribution Bar Chart
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'macos_desktop_dashboard.png'), fullPage: false });
  console.log('Saved macos_desktop_dashboard.png');

  // 2. Desktop Dashboard with Progression Curve
  await page.evaluate(() => {
    const curveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Progression Curve'));
    if (curveBtn) curveBtn.click();
  });
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'macos_desktop_chart_curve.png'), fullPage: false });
  console.log('Saved macos_desktop_chart_curve.png');

  // 3. Desktop Candidates Directory
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('.nav-item-btn')).find(b => b.textContent.includes('Candidates'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'macos_desktop_candidates.png'), fullPage: false });
  console.log('Saved macos_desktop_candidates.png');

  // 4. Desktop Hiring Pipeline (Kanban)
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('.nav-item-btn')).find(b => b.textContent.includes('Hiring Pipeline'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'macos_desktop_pipeline.png'), fullPage: false });
  console.log('Saved macos_desktop_pipeline.png');

  // 5. Desktop Settings
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('.nav-item-btn')).find(b => b.textContent.includes('Settings'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'macos_desktop_settings.png'), fullPage: false });
  console.log('Saved macos_desktop_settings.png');

  // 6. Mobile Dashboard (375x812)
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('.nav-item-btn')).find(b => b.textContent.includes('Dashboard'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'macos_mobile_dashboard.png'), fullPage: false });
  console.log('Saved macos_mobile_dashboard.png');

  await browser.close();
  console.log('All 6 macOS screenshots captured successfully with 2x retina clarity!');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
