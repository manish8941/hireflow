import fs from 'fs';
import puppeteer from 'puppeteer-core';

const MASCOT_BODY_PATH = [
  'M 111,22',
  'L 129,22',
  'C 135,22 139,26 139,32',
  'L 139,52',
  'C 139,58 143,62 148,59',
  'C 152,56 155,51 157,46',
  'A 36 36 0 1 1 206,78',
  'C 208,82 210,88 211,96',
  'C 213,124 213,156 211,176',
  'C 208,202 192,216 160,216',
  'C 142,216.5 98,216.5 80,216',
  'C 48,216 32,202 29,176',
  'C 27,156 27,124 29,96',
  'C 30,88 32,82 34,78',
  'A 36 36 0 1 1 80,46',
  'C 82,53 85,59 90,62',
  'C 96,66 100,62 100,54',
  'L 100,30',
  'C 100,25 103,22 108,22',
  'Z'
].join(' ');

// Define exact eye geometry & transforms for all 14 expressions
export const EXPRESSION_DATA = {
  neutral: {
    label: 'neutral',
    left: { x: 76, y: 90, w: 32, h: 70, rx: 16 },
    right: { x: 132, y: 90, w: 32, h: 70, rx: 16 },
  },
  happy: {
    label: 'happy',
    // Friendly curved arch eyes (^ ^)
    customEyes: `
      <path d="M 74,124 C 74,96 110,96 110,124 C 110,120 102,106 92,106 C 82,106 74,120 74,124 Z" fill="#FFFFFF" />
      <path d="M 130,124 C 130,96 166,96 166,124 C 166,120 158,106 148,106 C 138,106 130,120 130,124 Z" fill="#FFFFFF" />
    `,
  },
  excited: {
    label: 'excited',
    left: { x: 74, y: 86, w: 36, h: 74, rx: 18 },
    right: { x: 130, y: 86, w: 36, h: 74, rx: 18 },
    headTransform: 'translateY(-4px)',
  },
  curious: {
    label: 'curious',
    // Left eye glances slightly up and inquisitive
    left: { x: 76, y: 82, w: 32, h: 74, rx: 16 },
    right: { x: 133, y: 92, w: 31, h: 68, rx: 15.5 },
    headTransform: 'rotate(2deg) translateY(-2px)',
  },
  thinking: {
    label: 'thinking',
    // Eyes glance upward right
    left: { x: 82, y: 82, w: 30, h: 66, rx: 15 },
    right: { x: 138, y: 82, w: 30, h: 66, rx: 15 },
    headTransform: 'rotate(-2deg) translateY(-2px)',
  },
  listening: {
    label: 'listening',
    left: { x: 77, y: 93, w: 31, h: 67, rx: 15.5 },
    right: { x: 132, y: 93, w: 31, h: 67, rx: 15.5 },
  },
  confused: {
    label: 'confused',
    // Subtle asymmetry without distortion
    left: { x: 76, y: 86, w: 32, h: 72, rx: 16 },
    right: { x: 133, y: 98, w: 30, h: 52, rx: 15 },
    headTransform: 'rotate(-3deg)',
  },
  surprised: {
    label: 'surprised',
    // Eyes widen slightly while keeping alignment
    left: { x: 73, y: 84, w: 38, h: 78, rx: 19 },
    right: { x: 129, y: 84, w: 38, h: 78, rx: 19 },
  },
  sleepy: {
    label: 'sleepy',
    // Eyelids partially closed smoothly (gentle horizontal pills)
    left: { x: 76, y: 114, w: 32, h: 26, rx: 13 },
    right: { x: 132, y: 114, w: 32, h: 26, rx: 13 },
  },
  shy: {
    label: 'shy',
    // Downward glance
    left: { x: 77, y: 104, w: 30, h: 60, rx: 15 },
    right: { x: 133, y: 104, w: 30, h: 60, rx: 15 },
    headTransform: 'translateY(3px)',
  },
  sad: {
    label: 'sad',
    // Softened, slightly lowered eyes with subtle angle
    left: { x: 76, y: 98, w: 30, h: 62, rx: 15, transform: 'rotate(-5deg 91 129)' },
    right: { x: 134, y: 98, w: 30, h: 62, rx: 15, transform: 'rotate(5deg 149 129)' },
  },
  working: {
    label: 'working',
    // Focused, steady eyes
    left: { x: 77, y: 94, w: 30, h: 64, rx: 15 },
    right: { x: 133, y: 94, w: 30, h: 64, rx: 15 },
  },
  error: {
    label: 'error',
    // Restrained concerned expression
    left: { x: 76, y: 96, w: 31, h: 58, rx: 15.5, transform: 'rotate(-4deg 91 125)' },
    right: { x: 133, y: 96, w: 31, h: 58, rx: 15.5, transform: 'rotate(4deg 148 125)' },
  },
  success: {
    label: 'success',
    // Happy eyes with bright bounce
    customEyes: `
      <path d="M 74,120 C 74,92 110,92 110,120 C 110,116 102,102 92,102 C 82,102 74,116 74,120 Z" fill="#FFFFFF" />
      <path d="M 130,120 C 130,92 166,92 166,120 C 166,116 158,102 148,102 C 138,102 130,116 130,120 Z" fill="#FFFFFF" />
    `,
    headTransform: 'translateY(-5px)',
  },
};

function renderMascotSvg(key) {
  const data = EXPRESSION_DATA[key];
  const headStyle = data.headTransform ? `transform: ${data.headTransform}; transform-origin: 120px 120px; transition: transform 0.25s ease;` : '';

  let eyesHtml = '';
  if (data.customEyes) {
    eyesHtml = data.customEyes;
  } else {
    const l = data.left;
    const r = data.right;
    const lTr = l.transform ? ` transform="${l.transform}"` : '';
    const rTr = r.transform ? ` transform="${r.transform}"` : '';
    eyesHtml = `
      <rect x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" rx="${l.rx}" ry="${l.rx}" fill="#FFFFFF"${lTr} style="transition: all 0.2s ease;" />
      <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${r.rx}" ry="${r.rx}" fill="#FFFFFF"${rTr} style="transition: all 0.2s ease;" />
    `;
  }

  return `
<div class="mascot-card">
  <div class="mascot-title">${key}</div>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="130" height="130">
    <g style="${headStyle}">
      <path d="${MASCOT_BODY_PATH}" fill="#FF4A0A" />
      <g class="mascot-eyes">
        ${eyesHtml}
      </g>
    </g>
  </svg>
</div>
`;
}

(async () => {
  const keys = Object.keys(EXPRESSION_DATA);
  const cardsHtml = keys.map(k => renderMascotSvg(k)).join('\n');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: #0d1117;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 30px;
      margin: 0;
    }
    h1 {
      font-size: 22px;
      margin-bottom: 20px;
      color: #f0f6fc;
      text-align: center;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .mascot-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .mascot-title {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #a0aec0;
      text-transform: capitalize;
    }
  </style>
</head>
<body>
  <h1>HireFlow ATS Custom Mascot: 14 Controlled Expressions</h1>
  <div class="grid">
    ${cardsHtml}
  </div>
</body>
</html>
  `;

  fs.writeFileSync('preview_expressions.html', html);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 600, deviceScaleFactor: 2 });
  await page.goto('file:///' + process.cwd().replace(/\\\\/g, '/') + '/preview_expressions.html');
  await page.screenshot({ path: 'expressions_grid_preview.png' });
  await browser.close();
  console.log('Expressions grid preview captured');
})();
