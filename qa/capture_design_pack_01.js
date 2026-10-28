const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const proofFile = path.join(root, 'book-renderer', 'master-proof.html');
const output = path.resolve(process.argv[2] || path.join(__dirname, 'design-pack-01-screenshots'));
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1800, height: 1200 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`file://${proofFile}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.OCHERKI_MASTER_PROOF_QA);

  const proofs = page.locator('.proof');
  const count = await proofs.count();
  const manifest = [];
  for (let index = 0; index < count; index += 1) {
    const proof = proofs.nth(index);
    const title = await proof.locator('.proof-head h2').innerText();
    const filename = `master-${String(index + 1).padStart(2, '0')}.png`;
    await proof.screenshot({ path: path.join(output, filename) });
    manifest.push({ index: index + 1, title, filename });
  }
  await page.screenshot({ path: path.join(output, 'master-proof-full.png'), fullPage: true });
  const qa = await page.evaluate(() => window.OCHERKI_MASTER_PROOF_QA);
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify({ count, errors, qa, manifest }, null, 2));
  await browser.close();
  console.log(JSON.stringify({ count, errors: errors.length, qa, output }));
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
