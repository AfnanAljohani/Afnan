const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 2400, height: 1500 } });
  await p.goto('file://' + process.argv[2] + '/khair_daily.html');
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.fonts.ready);
  for (const a of await p.$$('section')) {
    await a.screenshot({ path: process.argv[3] + '/' + (await a.getAttribute('data-name')) + '.png' });
  }
  await b.close();
})();
