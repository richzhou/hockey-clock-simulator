const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    for (const viewport of [{ width: 1440, height: 1100 }, { width: 375, height: 667 }]) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(process.argv[2] || 'http://127.0.0.1:8871');
      for (const model of ['871', 'mpc7']) {
        if (model === 'mpc7') await page.selectOption('#machine-model', model);
        const power = page.locator('.power-key');
        const snapshot = () => page.evaluate(() => JSON.stringify({ powered: game.powered, mode: game.mode, time: game.time, home: game.home, guest: game.guest, history, step: practice.stepIndex }));
        const before = await snapshot();
        await power.click();
        assert.equal(await page.locator('#power-dialog-title').textContent(), 'Turn console power off?');
        assert.equal(await page.locator('#cancel-power').evaluate(el => el === document.activeElement), true);
        assert.equal(await snapshot(), before);
        await page.locator('#cancel-power').click();
        assert.equal(await snapshot(), before);
        await power.click();
        await page.keyboard.press('Escape');
        assert.equal(await snapshot(), before);
        await power.click();
        await page.locator('#confirm-power').click();
        assert.equal(await page.evaluate(() => game.powered), false);
        const off = await snapshot();
        await power.click();
        assert.equal(await page.locator('#power-dialog-title').textContent(), 'Turn console power on?');
        await page.locator('#cancel-power').click();
        assert.equal(await snapshot(), off);
        await power.click();
        await page.locator('#confirm-power').click();
        assert.equal(await page.evaluate(() => game.powered), true);
        assert.equal(await page.evaluate(() => history.filter(key => key.startsWith('power-')).length), 2);
        console.log(`PASS ${model} ${viewport.width}: cancel, Escape, confirm on/off, unchanged practice and single action`);
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
