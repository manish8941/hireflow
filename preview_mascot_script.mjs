import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  const svg = fs.readFileSync('test_mascot_ref.svg', 'utf8');
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: #121418;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .wrapper {
      width: 240px;
      height: 240px;
    }
  </style>
</head>
<body>
  <div class="wrapper">${svg}</div>
</body>
</html>
  `;
  fs.writeFileSync('preview_mascot.html', html);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 600, height: 600, deviceScaleFactor: 2 });
  await page.goto('file:///' + process.cwd().replace(/\\\\/g, '/') + '/preview_mascot.html');
  await page.screenshot({ path: 'mascot_vector_preview.png' });
  await browser.close();
  console.log('Preview captured');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
