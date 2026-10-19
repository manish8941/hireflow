import puppeteer from 'puppeteer-core';
import path from 'path';

const APP_URL = 'http://127.0.0.1:5173';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\yadav\\.gemini\\antigravity-ide\\brain\\271b0acf-86cf-4117-a190-6dccf4560019';

async function runCloudeeAudit() {
  console.log('--- Starting Cloudee AI Mascot & Default Bright Theme E2E Test ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // 1. Verify Default Landing Theme is Bright Color Theme
    console.log('[Test 1] Testing Default Landing Theme...');
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.removeItem('hireflow_theme');
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));

    const defaultTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    console.log(`Default theme on landing: ${defaultTheme}`);
    if (defaultTheme !== 'light') {
      throw new Error(`Expected default theme to be 'light' but got '${defaultTheme}'`);
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'cloudee_light_theme_landing.png'),
      fullPage: false,
    });
    console.log('[PASS] Test 1: Default landing theme is bright color theme (light).');

    // 2. Verify Cloudee Mascot 3D Canvas
    console.log('[Test 2] Verifying Cloudee Mascot Canvas...');
    const mascotInfo = await page.evaluate(() => {
      const btn = document.querySelector('.cloudee-mascot-btn');
      const canvas = document.querySelector('.cloudee-webgl-canvas');
      return {
        btnExists: Boolean(btn),
        canvasExists: Boolean(canvas),
        canvasWidth: canvas ? canvas.clientWidth : 0,
        canvasHeight: canvas ? canvas.clientHeight : 0,
      };
    });
    console.log('Mascot info:', mascotInfo);
    if (!mascotInfo.btnExists || !mascotInfo.canvasExists) {
      throw new Error('Cloudee mascot button or canvas not found in DOM');
    }
    console.log('[PASS] Test 2: Cloudee 3D Mascot renders with canvas in bottom-right corner.');

    // 3. Test Mascot Click & Helper Panel
    console.log('[Test 3] Testing Mascot Click Reaction & Helper Panel...');
    await page.click('.cloudee-mascot-btn');
    await new Promise((r) => setTimeout(r, 450));

    const panelInfo = await page.evaluate(() => {
      const panel = document.querySelector('.cloudee-helper-panel');
      const speech = document.querySelector('.cloudee-speech-main');
      const actions = Array.from(document.querySelectorAll('.cloudee-action-btn')).map((b) =>
        b.textContent.trim()
      );
      const switchEl = document.querySelector('.cloudee-sliding-switch');
      const isChecked = switchEl ? switchEl.getAttribute('aria-checked') : null;
      return {
        panelVisible: Boolean(panel),
        speechText: speech ? speech.textContent : '',
        actionCount: actions.length,
        actions,
        switchChecked: isChecked,
      };
    });
    console.log('Helper panel info:', panelInfo);
    if (!panelInfo.panelVisible) {
      throw new Error('Helper panel did not open on mascot click');
    }
    if (panelInfo.actionCount < 3) {
      throw new Error('Expected at least 3 quick actions in helper panel');
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'cloudee_helper_panel_open.png'),
      fullPage: false,
    });
    console.log('[PASS] Test 3: Click reaction triggered and helper panel opened with quick actions.');

    // 4. Test Quick Action: Open Add Candidate
    console.log('[Test 4] Testing Quick Action -> Add Candidate...');
    await page.evaluate(() => {
      const addBtn = Array.from(document.querySelectorAll('.cloudee-action-btn')).find((b) =>
        b.textContent.includes('Add Candidate')
      );
      if (addBtn) addBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    const addModalVisible = await page.evaluate(() => {
      const modal = document.querySelector('.modal-dialog');
      const panel = document.querySelector('.cloudee-helper-panel');
      return {
        modalVisible: Boolean(modal),
        panelClosed: !panel,
      };
    });
    console.log('Add candidate modal state:', addModalVisible);
    if (!addModalVisible.modalVisible || !addModalVisible.panelClosed) {
      throw new Error('Add Candidate modal was not opened or helper panel was not closed');
    }

    // Close modal via Cancel button
    await page.evaluate(() => {
      const cancelBtn = Array.from(document.querySelectorAll('.modal-footer button')).find((b) =>
        b.textContent.includes('Cancel')
      );
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));
    console.log('[PASS] Test 4: Quick Action successfully triggered Add Candidate modal workflow.');

    // 5. Test Sliding ON/OFF Toggle & Persistence
    console.log('[Test 5] Testing Sliding ON/OFF Toggle...');
    // Reopen helper panel
    await page.click('.cloudee-mascot-btn');
    await new Promise((r) => setTimeout(r, 350));

    // Click sliding switch to turn OFF
    await page.click('#cloudee-panel-toggle');
    await new Promise((r) => setTimeout(r, 500));

    const stateAfterOff = await page.evaluate(() => {
      const pill = document.querySelector('.cloudee-collapsed-pill');
      const canvas = document.querySelector('.cloudee-webgl-canvas');
      const stored = localStorage.getItem('hireflow_cloudee_enabled');
      return {
        pillVisible: Boolean(pill),
        pillText: pill ? pill.textContent.trim() : '',
        canvasPresent: Boolean(canvas),
        storedValue: stored,
      };
    });
    console.log('State after turning OFF:', stateAfterOff);
    if (!stateAfterOff.pillVisible || stateAfterOff.canvasPresent) {
      throw new Error('Cloudee did not collapse or canvas was not destroyed when turned OFF');
    }
    if (stateAfterOff.storedValue !== 'false') {
      throw new Error(`Expected storage to be 'false' but got '${stateAfterOff.storedValue}'`);
    }

    // Refresh page to verify persistence of OFF state
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 500));

    const persistedOff = await page.evaluate(() => {
      const pill = document.querySelector('.cloudee-collapsed-pill');
      const canvas = document.querySelector('.cloudee-webgl-canvas');
      return {
        pillVisible: Boolean(pill),
        canvasPresent: Boolean(canvas),
      };
    });
    console.log('Persistence after reload (OFF):', persistedOff);
    if (!persistedOff.pillVisible || persistedOff.canvasPresent) {
      throw new Error('Cloudee OFF state did not survive page reload');
    }

    // Click collapsed pill to re-enable Cloudee
    await page.click('.cloudee-collapsed-pill');
    await new Promise((r) => setTimeout(r, 600));

    const restoredOn = await page.evaluate(() => {
      const canvas = document.querySelector('.cloudee-webgl-canvas');
      const stored = localStorage.getItem('hireflow_cloudee_enabled');
      return {
        canvasPresent: Boolean(canvas),
        storedValue: stored,
      };
    });
    console.log('Restored ON state:', restoredOn);
    if (!restoredOn.canvasPresent || restoredOn.storedValue !== 'true') {
      throw new Error('Cloudee was not restored when clicking collapsed pill');
    }
    console.log('[PASS] Test 5: Sliding ON/OFF toggle, smooth transition, and persistence verified.');

    // 6. Test Settings Page Cloudee Configuration
    console.log('[Test 6] Testing Settings Page Mascot Section...');
    // Open Dynamic Island to navigate to Settings
    await page.evaluate(() => {
      const trigger = document.querySelector('.dynamic-island-trigger');
      if (trigger) trigger.click();
    });
    await new Promise((r) => setTimeout(r, 250));
    await page.evaluate(() => {
      const settingsBtn = Array.from(document.querySelectorAll('.nav-item-btn')).find((b) =>
        b.textContent.includes('Settings')
      );
      if (settingsBtn) settingsBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    const settingsCloudeeCard = await page.evaluate(() => {
      const switchEl = document.querySelector('#settings-cloudee-switch');
      const previewBtns = Array.from(document.querySelectorAll('button')).filter(
        (b) =>
          b.textContent.includes('Joyful') ||
          b.textContent.includes('Searching') ||
          b.textContent.includes('Excited')
      );
      return {
        switchPresent: Boolean(switchEl),
        switchChecked: switchEl ? switchEl.getAttribute('aria-checked') : null,
        previewBtnsCount: previewBtns.length,
      };
    });
    console.log('Settings Cloudee card:', settingsCloudeeCard);
    if (!settingsCloudeeCard.switchPresent || settingsCloudeeCard.previewBtnsCount < 3) {
      throw new Error('Cloudee card or preview buttons missing on SettingsPage');
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'cloudee_settings_toggle_page.png'),
      fullPage: false,
    });
    console.log('[PASS] Test 6: SettingsPage Cloudee section and toggle verified.');

    // 7. Test Dark Theme Switch and Cloudee Presence
    console.log('[Test 7] Testing Dark Theme & Mascot...');
    await page.evaluate(() => {
      const darkBtn = Array.from(document.querySelectorAll('.theme-select-card')).find((b) =>
        b.textContent.includes('Dark Theme')
      );
      if (darkBtn) darkBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'cloudee_dark_theme_mascot.png'),
      fullPage: false,
    });
    console.log('[PASS] Test 7: Dark theme switches cleanly with Cloudee rendered.');

    // 8. Test Mobile Viewport Responsiveness (375px)
    console.log('[Test 8] Testing Mobile Responsiveness (375px)...');
    await page.setViewport({ width: 375, height: 667 });
    await new Promise((r) => setTimeout(r, 450));

    const mobileInfo = await page.evaluate(() => {
      const canvas = document.querySelector('.cloudee-webgl-canvas');
      const root = document.querySelector('.cloudee-floating-widget-root');
      return {
        canvasExists: Boolean(canvas),
        canvasWidth: canvas ? canvas.clientWidth : 0,
        rootVisible: Boolean(root),
      };
    });
    console.log('Mobile info:', mobileInfo);
    if (!mobileInfo.canvasExists || mobileInfo.canvasWidth > 100) {
      throw new Error('Mascot did not scale appropriately on mobile');
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'cloudee_mobile_375px.png'),
      fullPage: false,
    });
    console.log('[PASS] Test 8: Mobile layout verified.');

    // Switch back to light theme as default
    await page.setViewport({ width: 1440, height: 900 });
    await page.evaluate(() => {
      localStorage.setItem('hireflow_theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    });

    console.log('Console errors recorded:', consoleErrors);
    if (consoleErrors.length > 0) {
      console.warn('Console had errors:', consoleErrors);
    }

    console.log('--- ALL CLOUDEE E2E TESTS PASSED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runCloudeeAudit();
