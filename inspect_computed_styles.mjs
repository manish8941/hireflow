import puppeteer from 'puppeteer-core';

const APP_URL = 'http://127.0.0.1:5173';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function inspect() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('response', async res => {
    if (res.status() >= 400) {
      console.log('HTTP ERROR:', res.status(), res.url());
      try {
        console.log('RESPONSE BODY:', await res.text());
      } catch {}
    }
  });
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });

  const styles = await page.evaluate(() => {
    const getStyles = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const comp = window.getComputedStyle(el);
      return {
        background: comp.background,
        backgroundColor: comp.backgroundColor,
        backdropFilter: comp.backdropFilter || comp.webkitBackdropFilter,
        border: comp.border,
        boxShadow: comp.boxShadow,
        color: comp.color,
        fontFamily: comp.fontFamily,
        fontSize: comp.fontSize,
      };
    };

    return {
      body: getStyles('body'),
      appShell: getStyles('.app-shell'),
      appSidebar: getStyles('.app-sidebar'),
      appTopbar: getStyles('.app-topbar'),
      kpiCard: getStyles('.kpi-card'),
      panelCard: getStyles('.panel-card'),
      chartContainer: getStyles('.panel-body'),
      btnPrimary: getStyles('.btn-primary'),
      btnSecondary: getStyles('.btn-secondary'),
      dataTable: getStyles('.data-table'),
      liquidCanvas: (() => {
        const c = document.querySelector('.liquid-purple-canvas');
        if (!c) return { found: false };
        return {
          found: true,
          width: c.width,
          height: c.height,
          hasGl: Boolean(c.getContext('webgl') || c.getContext('experimental-webgl')),
        };
      })(),
    };
  });

  console.log(JSON.stringify(styles, null, 2));
  await browser.close();
}

inspect().catch(console.error);
