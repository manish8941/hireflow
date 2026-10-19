import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/yadav/.gemini/antigravity-ide/brain/271b0acf-86cf-4117-a190-6dccf4560019';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyActionMenu() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // 1. Navigate to Candidate Directory
  await page.evaluate(() => {
    // Navigate by clicking Candidate Directory or triggering active tab
    const dirBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Candidate Directory'));
    if (dirBtn) dirBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Switch to Light Theme
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('hireflow_theme', 'light');
  });
  await new Promise(r => setTimeout(r, 400));

  // Find Marcus Vance's row and click its three dots button
  const marcusRowFound = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.data-table tbody tr'));
    const marcusRow = rows.find(r => r.textContent?.includes('Marcus Vance'));
    if (!marcusRow) return false;
    const actionBtn = marcusRow.querySelector('.action-trigger-btn');
    if (actionBtn) {
      actionBtn.click();
      return true;
    }
    return false;
  });

  console.log('Marcus Vance action button clicked in Light Theme:', marcusRowFound);
  await new Promise(r => setTimeout(r, 400));

  // Capture screenshot of light theme action menu
  const lightMenuPath = path.join(ARTIFACTS_DIR, 'candidates_action_menu_light.png');
  await page.screenshot({ path: lightMenuPath });
  console.log('Saved:', lightMenuPath);

  // Switch to Dark Theme
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('hireflow_theme', 'dark');
    // Click body to close any open menu
    document.body.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Re-open menu in dark theme on Marcus Vance
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.data-table tbody tr'));
    const marcusRow = rows.find(r => r.textContent?.includes('Marcus Vance'));
    if (!marcusRow) return;
    const actionBtn = marcusRow.querySelector('.action-trigger-btn');
    if (actionBtn) actionBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  const darkMenuPath = path.join(ARTIFACTS_DIR, 'candidates_action_menu_dark.png');
  await page.screenshot({ path: darkMenuPath });
  console.log('Saved:', darkMenuPath);

  // Also verify dashboard recent candidates table action menu
  await page.evaluate(() => {
    const overviewLink = Array.from(document.querySelectorAll('button, a')).find(b => b.textContent?.includes('Overview') || b.textContent?.includes('Dashboard'));
    if (overviewLink) overviewLink.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const table = document.querySelector('.recent-candidates-container .data-table');
    if (!table) return;
    const actionBtn = table.querySelector('.action-trigger-btn');
    if (actionBtn) actionBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  const dashboardMenuPath = path.join(ARTIFACTS_DIR, 'dashboard_recent_action_menu_dark.png');
  await page.screenshot({ path: dashboardMenuPath });
  console.log('Saved:', dashboardMenuPath);

  await browser.close();
}

verifyActionMenu().catch(console.error);
