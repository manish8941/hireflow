import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:/Users/yadav/.gemini/antigravity-ide/brain/271b0acf-86cf-4117-a190-6dccf4560019';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Desktop Dark Hiring Overview Dashboard
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const curTheme = document.documentElement.getAttribute('data-theme');
    if (curTheme === 'light') {
      const themeBtn = document.querySelector('.dynamic-island-theme-btn');
      if (themeBtn) themeBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/hiring_overview_dark.png`, fullPage: false });
  console.log('Saved hiring_overview_dark.png');

  // 2. Desktop Light Hiring Overview Dashboard (toggle via theme button)
  await page.evaluate(() => {
    const themeBtn = document.querySelector('.dynamic-island-theme-btn');
    if (themeBtn) themeBtn.click();
  });
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: `${ARTIFACT_DIR}/hiring_overview_light.png`, fullPage: false });
  console.log('Saved hiring_overview_light.png');

  // Toggle back to dark
  await page.evaluate(() => {
    const themeBtn = document.querySelector('.dynamic-island-theme-btn');
    if (themeBtn) themeBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // 3. Dynamic Island Expanded in Dark Mode
  await page.click('.dynamic-island-trigger');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${ARTIFACT_DIR}/dynamic_island_expanded.png`, fullPage: false });
  console.log('Saved dynamic_island_expanded.png');

  // 4. Candidate Directory in Dark Mode
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 200));
  await page.evaluate(() => {
    const trigger = document.querySelector('.dynamic-island-trigger');
    if (trigger) trigger.click();
  });
  await new Promise(r => setTimeout(r, 250));
  await page.evaluate(() => {
    const candidatesBtn = Array.from(document.querySelectorAll('.nav-item-btn')).find(b => b.textContent.includes('Candidates'));
    if (candidatesBtn) candidatesBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/candidates_directory_dark.png`, fullPage: false });
  console.log('Saved candidates_directory_dark.png');

  // 5. Hiring Pipeline in Dark Mode
  await page.evaluate(() => {
    const trigger = document.querySelector('.dynamic-island-trigger');
    if (trigger) trigger.click();
  });
  await new Promise(r => setTimeout(r, 250));
  await page.evaluate(() => {
    const pipelineBtn = Array.from(document.querySelectorAll('.nav-item-btn')).find(b => b.textContent.includes('Pipeline'));
    if (pipelineBtn) pipelineBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/pipeline_kanban_dark.png`, fullPage: false });
  console.log('Saved pipeline_kanban_dark.png');

  // 6. Mobile 375px Viewport
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    const trigger = document.querySelector('.dynamic-island-trigger');
    if (trigger) trigger.click();
  });
  await new Promise(r => setTimeout(r, 250));
  await page.evaluate(() => {
    const dashBtn = Array.from(document.querySelectorAll('.nav-item-btn')).find(b => b.textContent.includes('Dashboard'));
    if (dashBtn) dashBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_overview_375px.png`, fullPage: false });
  console.log('Saved mobile_overview_375px.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture();
