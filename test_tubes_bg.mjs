import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testTubes() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  const getHtml = (isLight) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: ${isLight ? '#F6F7FA' : '#060709'};
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .svg-wrap {
      width: 100%;
      height: 100%;
    }
    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  </style>
</head>
<body>
  <div class="svg-wrap">
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Soft Ambient Bloom Glow -->
        <filter id="ambientBloom" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="32" />
        </filter>

        <!-- Deep Recessed Trench Shadow -->
        <filter id="trenchShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="22" />
          <feOffset dx="0" dy="${isLight ? '18' : '26'}" />
        </filter>

        <!-- Close Crevice Shadow -->
        <filter id="innerCreviceShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
          <feOffset dx="0" dy="${isLight ? '12' : '16'}" />
        </filter>

        <!-- Diffused Top Lighting Blur -->
        <filter id="topLightBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" />
        </filter>

        <!-- Specular Ridge Blur -->
        <filter id="specularRidgeBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
        </filter>

        <!-- Cylindrical Shading Gradients -->
        <linearGradient id="tubeBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          ${isLight ? `
            <stop offset="0%" stop-color="#EFF1F7" />
            <stop offset="35%" stop-color="#DFE2EB" />
            <stop offset="70%" stop-color="#CFD3DE" />
            <stop offset="100%" stop-color="#B8BDCB" />
          ` : `
            <stop offset="0%" stop-color="#242630" />
            <stop offset="30%" stop-color="#1B1D24" />
            <stop offset="70%" stop-color="#121318" />
            <stop offset="100%" stop-color="#090A0D" />
          `}
        </linearGradient>

        <!-- Rim Lighting Gradient -->
        <linearGradient id="rimGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          ${isLight ? `
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
            <stop offset="45%" stop-color="#E4E7F0" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#C5CAD6" stop-opacity="0.0" />
          ` : `
            <stop offset="0%" stop-color="#A2A8BC" stop-opacity="0.85" />
            <stop offset="35%" stop-color="#555A68" stop-opacity="0.40" />
            <stop offset="70%" stop-color="#20222A" stop-opacity="0.08" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0.0" />
          `}
        </linearGradient>

        <!-- Specular Ridge Gradient -->
        <linearGradient id="specularGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          ${isLight ? `
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1.0" />
            <stop offset="60%" stop-color="#FFFFFF" stop-opacity="0.6" />
            <stop offset="100%" stop-color="#E0E4EE" stop-opacity="0.0" />
          ` : `
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
            <stop offset="40%" stop-color="#D8DCE8" stop-opacity="0.60" />
            <stop offset="100%" stop-color="#6B7285" stop-opacity="0.0" />
          `}
        </linearGradient>
      </defs>

      <!-- Base Canvas -->
      <rect width="1600" height="1000" fill="${isLight ? '#F6F7FA' : '#060709'}" />

      <!-- SHARED PATH GEOMETRY -->
      <g id="tubesGeometry" fill="none">
        <!-- Outer Top Track to Serpentine Labyrinth -->
        <path class="tube-path" fill="none" d="M 80 1080 L 80 340 A 240 240 0 0 1 320 100 L 1040 100 A 110 110 0 0 1 1040 320 L 520 320 A 115 115 0 0 0 520 550 L 1120 550 A 120 120 0 0 1 1120 790 L 480 790 A 105 105 0 0 0 480 1000 L 1680 1000" />

        <!-- Inner Left Concentric Corner -->
        <path class="tube-path" fill="none" d="M 280 1080 L 280 520 A 200 200 0 0 1 480 320" />

        <!-- Right Hairpin Column -->
        <path class="tube-path" fill="none" d="M 1320 1080 L 1320 220 A 115 115 0 0 1 1550 220 L 1550 1080" />
      </g>

      ${isLight ? `
        <!-- LIGHT THEME LAYERS -->
        <!-- 1. Soft Ambient Trench Shadow -->
        <use href="#tubesGeometry" 
             fill="none" 
             stroke="#9AA0B0" 
             stroke-width="160" 
             stroke-linecap="round" 
             stroke-linejoin="round" 
             filter="url(#trenchShadow)" 
             opacity="0.35" />

        <!-- 2. Close Crevice Shadow -->
        <use href="#tubesGeometry" 
             fill="none" 
             stroke="#707688" 
             stroke-width="138" 
             stroke-linecap="round" 
             stroke-linejoin="round" 
             filter="url(#innerCreviceShadow)" 
             opacity="0.25" />

        <!-- 3. Tube Body -->
        <use href="#tubesGeometry" 
             fill="none" 
             stroke="url(#tubeBodyGrad)" 
             stroke-width="124" 
             stroke-linecap="round" 
             stroke-linejoin="round" />

        <!-- 4. Lower Dark Contour Edge (for readable definition) -->
        <use href="#tubesGeometry" 
             fill="none" 
             stroke="#656B7A" 
             stroke-width="122" 
             stroke-linecap="round" 
             stroke-linejoin="round" 
             transform="translate(2, 6)" 
             opacity="0.18" />

        <!-- 5. Cylindrical Upper Rim Illumination -->
        <use href="#tubesGeometry" 
             fill="none" 
             stroke="url(#rimGlowGrad)" 
             stroke-width="112" 
             stroke-linecap="round" 
             stroke-linejoin="round" 
             filter="url(#topLightBlur)" 
             transform="translate(-4, -8)" 
             opacity="0.9" />

        <!-- 6. Specular Ridge Highlight -->
        <use href="#tubesGeometry" 
             fill="none" 
             stroke="url(#specularGlowGrad)" 
             stroke-width="32" 
             stroke-linecap="round" 
             stroke-linejoin="round" 
             filter="url(#specularRidgeBlur)" 
             transform="translate(-5, -10)" 
             opacity="0.85" />

        <!-- 7. Crisp Crest Line -->
        <use href="#tubesGeometry" 
             fill="none" 
             stroke="#FFFFFF" 
             stroke-width="3.5" 
             stroke-linecap="round" 
             stroke-linejoin="round" 
             transform="translate(-5, -10)" 
             opacity="0.8" />
      ` : `
        <!-- DARK THEME LAYERS -->
        <!-- 0. Ambient Bloom Halo -->
        <use href="#tubesGeometry" 
             fill="none" 
             stroke="#7E8496" 
             stroke-width="150" 
             stroke-linecap="round" 
             stroke-linejoin="round" 
             filter="url(#ambientBloom)" 
             opacity="0.32" 
             transform="translate(-4, -10)" />

        <!-- 1. Deep Recessed Trench Shadow -->
        <use href="#tubesGeometry" 
             fill="none" 
             stroke="#000000" 
             stroke-width="170" 
             stroke-linecap="round" 
             stroke-linejoin="round" 
             filter="url(#trenchShadow)" 
             opacity="0.98" />

        <!-- 2. Close Crevice Shadow -->
        <use href="#tubesGeometry" 
             fill="none" 
             stroke="#000000" 
             stroke-width="142" 
             stroke-linecap="round" 
             stroke-linejoin="round" 
             filter="url(#innerCreviceShadow)" 
             opacity="0.90" />

        <!-- 3. Tube Core Body -->
        <use href="#tubesGeometry" 
             fill="none" 
             stroke="url(#tubeBodyGrad)" 
             stroke-width="126" 
             stroke-linecap="round" 
             stroke-linejoin="round" />

        <!-- 4. Cylindrical Upper Rim Illumination -->
        <use href="#tubesGeometry" 
             fill="none" 
             stroke="url(#rimGlowGrad)" 
             stroke-width="114" 
             stroke-linecap="round" 
             stroke-linejoin="round" 
             filter="url(#topLightBlur)" 
             transform="translate(-4, -8)" 
             opacity="0.88" />

        <!-- 5. Soft Specular Ridge Glow -->
        <use href="#tubesGeometry" 
             fill="none" 
             stroke="url(#specularGlowGrad)" 
             stroke-width="38" 
             stroke-linecap="round" 
             stroke-linejoin="round" 
             filter="url(#specularRidgeBlur)" 
             transform="translate(-6, -11)" 
             opacity="0.75" />

        <!-- 6. Fine Specular Crest Line -->
        <use href="#tubesGeometry" 
             fill="none" 
             stroke="#FFFFFF" 
             stroke-width="4.5" 
             stroke-linecap="round" 
             stroke-linejoin="round" 
             transform="translate(-6, -11)" 
             opacity="0.45" />
      `}
    </svg>
  </div>
</body>
</html>
  `;

  // Dark test
  await page.setContent(getHtml(false));
  await page.screenshot({ path: 'C:/Users/yadav/.gemini/antigravity-ide/brain/271b0acf-86cf-4117-a190-6dccf4560019/prototype_tubes_dark.png' });
  console.log('Saved dark prototype');

  // Light test
  await page.setContent(getHtml(true));
  await page.screenshot({ path: 'C:/Users/yadav/.gemini/antigravity-ide/brain/271b0acf-86cf-4117-a190-6dccf4560019/prototype_tubes_light.png' });
  console.log('Saved light prototype');

  await browser.close();
}

testTubes();
