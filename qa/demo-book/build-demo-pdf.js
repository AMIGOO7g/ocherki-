// Builds the demo book «Семья Евстафиади» with the real engine and renders
// it as a PDF of spreads (560 × 280 mm each; the cover and the back cover
// stand alone on their spread). Also writes a PNG of every spread for a
// quick look. Usage: start a static server in the project root on PORT
// (default 8849), then
//   node qa/demo-book/build-demo-pdf.js [PORT] [out.pdf] [format]
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const PORT = process.argv[2] || '8849';
const OUT = path.resolve(process.argv[3] || path.join(__dirname, 'demo-book.pdf'));
const FORMAT = process.argv[4] || 'square';
const H = FORMAT === 'portrait' ? 1196 : 1000;
const MM = FORMAT === 'portrait' ? 335 : 280;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2000, height: H } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${PORT}/qa/README.md`);
  const scripts = ['geo-cities', 'geo-atlas', 'design-pack-01', 'book-engine', 'design-pack-01.layout', 'layout-pagination-engine'].map(name => `<script charset="utf-8" src="../book-renderer/${name}.js"></script>`).join('');
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><base href="http://127.0.0.1:${PORT}/qa/">
    <link rel="stylesheet" href="../book-renderer/fonts.css"><link rel="stylesheet" href="../book-renderer/design-pack-01.css">
    <style>@page{size:${MM * 2}mm ${MM}mm;margin:0}html,body{margin:0;padding:0;background:#fff}
      .spread{width:2000px;height:${H}px;display:flex;overflow:hidden;break-after:page;page-break-after:always;position:relative;background:#e9e5de}
      .side{position:relative;width:1000px;height:${H}px;overflow:hidden;--book-page-w:1000px;--book-page-h:${H}px;background:#fff}
      .side.empty{background:#e9e5de}
      .spread::after{content:'';position:absolute;left:999px;top:0;bottom:0;width:2px;background:linear-gradient(90deg,rgba(0,0,0,.06),rgba(0,0,0,0));pointer-events:none}
      body{zoom:${(MM * 2 / 25.4 * 96 / 2000).toFixed(5)}}</style></head>
    <body><div id="book"></div>${scripts}<script charset="utf-8" src="demo-book/demo-structure.js"></script></body></html>`, { waitUntil: 'networkidle' });
  const summary = await page.evaluate(async ([format]) => {
    await OcherkiLayoutPagination.readyFonts();
    const { structure, meta } = window.OcherkiDemoBook;
    const book = OcherkiLayoutPagination.build(structure, { ...meta, format, continuationPages: true });

    if (book.ready === false) return { error: book.message };
    const host = document.getElementById('book');
    for (const spread of book.spreads) {
      const row = document.createElement('div');
      row.className = 'spread';
      row.dataset.master = spread.master;
      for (const side of ['left', 'right']) {
        const cell = document.createElement('div');
        cell.className = 'side' + (spread[side] ? '' : ' empty');
        if (spread[side]) cell.innerHTML = OcherkiLayoutPagination.renderPage(spread[side], side, { ...meta, format });
        row.appendChild(cell);
      }
      host.appendChild(row);
    }
    // Lazy images outside the view never load on their own: load them all.
    for (const img of document.images) img.loading = 'eager';
    await Promise.race([Promise.all([...document.images].map(img => img.complete ? null : new Promise(done => { img.onload = img.onerror = done; }))), new Promise(done => setTimeout(done, 20000))]);
    return { spreads: book.spreads.length, pages: book.pages.length, masters: book.spreads.map(spread => spread.master.replace('D01-SPREAD-', '')) };
  }, [FORMAT]);
  if (summary.error) { console.error('Сборка не удалась:', summary.error); process.exit(1); }
  await page.waitForTimeout(1500);
  await page.pdf({ path: OUT, width: `${MM * 2}mm`, height: `${MM}mm`, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  // PNG previews of every spread.
  const previews = path.join(path.dirname(OUT), 'spreads');
  fs.mkdirSync(previews, { recursive: true });
  await page.evaluate(() => { document.body.style.zoom = '1'; });
  const rows = await page.$$('.spread');
  for (let i = 0; i < rows.length; i++) await rows[i].screenshot({ path: path.join(previews, `${String(i + 1).padStart(2, '0')}.png`) });
  console.log(JSON.stringify({ ...summary, pdf: OUT, errors }, null, 1));
  await browser.close();
})();
