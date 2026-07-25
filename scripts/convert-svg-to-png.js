const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const svgPath = path.join(__dirname, '../docs/architecture-diagram.svg');
  const pngPath = path.join(__dirname, '../docs/architecture-diagram.png');
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  const html = `<!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; padding: 0; background: #0D0F1A; display: flex; justify-content: center; align-items: center; }
      svg { width: 900px; height: 560px; }
    </style>
  </head>
  <body>
    ${svgContent}
  </body>
  </html>`;

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 900, height: 560, deviceScaleFactor: 2 });
  await page.setContent(html);
  await page.screenshot({ path: pngPath, type: 'png' });
  await browser.close();

  console.log('✅ Generated docs/architecture-diagram.png successfully!');
})();
