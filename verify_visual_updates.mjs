import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/yadav/.gemini/antigravity-ide/brain/271b0acf-86cf-4117-a190-6dccf4560019';

async function verify() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // 1. Switch to Light Theme
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('hireflow_theme', 'light');
    window.dispatchEvent(new Event('storage'));
  });
  await new Promise(r => setTimeout(r, 600));

  // Measure geometry of the circular hero composition
  const heroMetrics = await page.evaluate(() => {
    const stage = document.querySelector('.hero-talent-circle-stage');
    const centerpiece = document.querySelector('.hero-centerpiece-card');
    const cards = Array.from(document.querySelectorAll('.hero-candidate-squircle'));
    const guideRing = document.querySelector('.hero-orbit-guide-ring');
    const wallpaper = document.querySelector('.monterey-light-wallpaper');

    if (!stage || !centerpiece || cards.length === 0) {
      return { error: 'Hero elements not found' };
    }

    const stageRect = stage.getBoundingClientRect();
    const centerRect = centerpiece.getBoundingClientRect();
    const ringRect = guideRing ? guideRing.getBoundingClientRect() : null;

    // Find card furthest to the left and furthest to the right
    let leftCard = cards[0];
    let rightCard = cards[0];

    cards.forEach(c => {
      const r = c.getBoundingClientRect();
      if (r.left < leftCard.getBoundingClientRect().left) leftCard = c;
      if (r.right > rightCard.getBoundingClientRect().right) rightCard = c;
    });

    const leftRect = leftCard.getBoundingClientRect();
    const rightRect = rightCard.getBoundingClientRect();

    // Distance between left card's right edge and center card's left edge
    const leftGap = centerRect.left - leftRect.right;
    // Distance between center card's right edge and right card's left edge
    const rightGap = rightRect.left - centerRect.right;

    return {
      stageWidth: stageRect.width,
      stageHeight: stageRect.height,
      centerpieceWidth: centerRect.width,
      centerpieceHeight: centerRect.height,
      leftCardWidth: leftRect.width,
      rightCardWidth: rightRect.width,
      leftGapPixels: leftGap,
      rightGapPixels: rightGap,
      ringDiameter: ringRect ? ringRect.width : null,
      wallpaperFound: !!wallpaper,
      wallpaperFilter: wallpaper ? window.getComputedStyle(wallpaper).filter : null,
      totalCards: cards.length
    };
  });

  console.log('Hero Metrics (Desktop):', JSON.stringify(heroMetrics, null, 2));

  // Take screenshot in Light Theme
  const lightShotPath = path.join(ARTIFACTS_DIR, 'white_theme_monterey_blurred_hero.png');
  await page.screenshot({ path: lightShotPath });
  console.log('Saved light screenshot:', lightShotPath);

  // 2. Switch back to Dark Theme
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('hireflow_theme', 'dark');
    window.dispatchEvent(new Event('storage'));
  });
  await new Promise(r => setTimeout(r, 600));

  const darkShotPath = path.join(ARTIFACTS_DIR, 'dark_theme_hero_updated.png');
  await page.screenshot({ path: darkShotPath });
  console.log('Saved dark screenshot:', darkShotPath);

  // 3. Mobile Viewport 375px in Light Theme
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('hireflow_theme', 'light');
  });
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 400));

  const mobileShotPath = path.join(ARTIFACTS_DIR, 'mobile_375px_white_theme.png');
  await page.screenshot({ path: mobileShotPath });
  console.log('Saved mobile light screenshot:', mobileShotPath);

  await browser.close();
}

verify().catch(console.error);
