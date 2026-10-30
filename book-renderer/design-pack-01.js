(function (global) {
  'use strict';

  const PACK = Object.freeze({
    id: 'design-01-editorial',
    version: '1.16.0-stable-important-reflow',
    page: { width: 1000, height: 1000, trimMm: [280, 280], formats: { square: [280, 280], portrait: [280, 335] } },
    masters: Object.freeze([
      { id: 'D01-COVER', role: 'cover', capacity: { photos: 1, words: 18 } },
      { id: 'D01-ENDPAPER', role: 'endpaper', capacity: { photos: 0, words: 0 } },
      { id: 'D01-HALF-TITLE', role: 'half-title', capacity: { photos: 0, words: 16 } },
      { id: 'D01-TITLE', role: 'title', capacity: { photos: 0, words: 32 } },
      { id: 'D01-EPIGRAPH', role: 'epigraph', capacity: { photos: 0, words: 42 } },
      { id: 'D01-CONTENTS', role: 'contents', capacity: { items: 10 } },
      { id: 'D01-CHAPTER-PHOTO', role: 'chapter-photo', capacity: { photos: 1, words: 0 } },
      { id: 'D01-CHAPTER-TEXT', role: 'chapter-text', capacity: { photos: 0, words: 105 } },
      { id: 'D01-CHAPTER-INITIAL', role: 'chapter-initial', capacity: { photos: 0, words: 70 } },
      { id: 'D01-PHOTO', role: 'photo', capacity: { photos: 1, words: 0 } },
      { id: 'D01-PHOTO-TEXT', role: 'photo-text', capacity: { photos: 0, words: 340 } },
      { id: 'D01-TEXT', role: 'text', capacity: { photos: 0, words: 360 } },
      { id: 'D01-TEXT-QUOTE', role: 'text-quote', capacity: { photos: 0, words: 360 } },
      { id: 'D01-TEXT-IMPORTANT', role: 'text-important', capacity: { photos: 0, words: 340 } },
      { id: 'D01-TEXT-MARGIN', role: 'text-margin', capacity: { photos: 0, words: 360 } },
      { id: 'D01-TEXT-INLINE-QUOTE', role: 'text-inline-quote', capacity: { photos: 0, words: 320 } },
      { id: 'D01-TEXT-IMPORTANT-MARGIN', role: 'text-important-margin', capacity: { photos: 0, words: 320 } },
      { id: 'D01-QUOTE', role: 'quote', capacity: { photos: 0, words: 42 } },
      { id: 'D01-LARGE-PHOTO', role: 'large-photo', capacity: { photos: 1, words: 0 } },
      { id: 'D01-CTX-DETAIL-SQ', role: 'ctx-detail-sq', capacity: { photos: 1, words: 0 } },
      { id: 'D01-DARK-FADE-2.2', role: 'dark-fade', capacity: { photos: 1, words: 0 } },
      { id: 'D01-PANORAMA', role: 'panorama', capacity: { photos: 1, words: 0 } },
      { id: 'D01-THREE-PHOTO', role: 'three-photo', capacity: { photos: 3, words: 0 } },
      { id: 'D01-TWO-PHOTO', role: 'two-photo', capacity: { photos: 2, words: 0 } },
      { id: 'D01-PHOTO-OVER-TEXT', role: 'photo-over-text', capacity: { photos: 1, words: 250 } },
      { id: 'D01-PHOTO-RAIL', role: 'photo-rail', capacity: { photos: 1, words: 300 } },
      { id: 'D01-PHOTO-SIDE-TEXT', role: 'photo-side-text', capacity: { photos: 1, words: 300 } },
      { id: 'D01-STACKED-TEXT', role: 'stacked-text', capacity: { photos: 2, words: 230 } },
      { id: 'D01-MOSAIC', role: 'mosaic', capacity: { photos: 12, words: 0 } },
      { id: 'D01-BLEED-TEXT', role: 'bleed-text', capacity: { photos: 1, words: 230 } },
      { id: 'D01-DARK-SPLIT', role: 'dark-split', capacity: { photos: 1, words: 170 } },
      { id: 'D01-DARK-PHOTO-PAIR', role: 'dark-photo-pair', capacity: { photos: 2, words: 340 } },
      { id: 'D01-PHOTO-OVERLAY-TEXT', role: 'photo-overlay-text', capacity: { photos: 1, words: 100 } },
      { id: 'D01-PHOTO-GRADIENT-TEXT', role: 'photo-gradient-text', capacity: { photos: 1, words: 100 } },
      { id: 'D01-DARK-GRADIENT-PHOTO', role: 'dark-gradient-photo', capacity: { photos: 1, words: 100 } },
      { id: 'D01-TEXT-OVER-PHOTO', role: 'text-over-photo', capacity: { photos: 1, words: 210 } },
      { id: 'D01-QUOTE-BAND-PHOTO', role: 'quote-band-photo', capacity: { photos: 1, words: 35 } },
      { id: 'D01-DARK-TEXT', role: 'dark-text', capacity: { photos: 0, words: 340 } },
      { id: 'D01-DARK-TEXT-PAIR', role: 'dark-text-pair', capacity: { photos: 0, words: 680 } },
      { id: 'D01-DATE-ERA', role: 'date-era', capacity: { photos: 0, words: 220 } },
      { id: 'D01-DOCUMENT', role: 'document', capacity: { photos: 1, words: 120 } },
      { id: 'D01-DOCUMENT-COMMENT', role: 'document-comment', capacity: { photos: 0, words: 220 } },
      { id: 'D01-INTRO', role: 'final', capacity: { photos: 0, words: 120 } },
      { id: 'D01-AUTHOR', role: 'final', capacity: { photos: 0, words: 120 } },
      { id: 'D01-TIMELINE', role: 'timeline', capacity: { items: 8 } },
      { id: 'D01-FINAL', role: 'final', capacity: { photos: 0, words: 90 } },
      { id: 'D01-THANKS', role: 'final', capacity: { photos: 0, words: 120 } },
      { id: 'D01-SOURCES', role: 'final', capacity: { photos: 0, words: 120 } },
      { id: 'D01-COLOPHON', role: 'colophon', capacity: { items: 8 } },
      { id: 'D01-BACK-COVER', role: 'back-cover', capacity: { photos: 1, words: 55 } }
    ])
  });

  const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);
  const clean = value => String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  const cleanText = value => clean(value).replace(/([.!?…»”])(?=[А-ЯЁа-яё])/g, '$1 ');
  const cleanEpisode = value => clean(value).replace(/^Эпизод\s+\d+[.:]?\s*/i, '').trim();
  const escapeHtml = value => clean(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
  const marginNoteParts = value => {
    const words = clean(value).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    // Keep the handwritten marginal mark as one complete phrase. Splitting
    // it into lanes made short notes show one word per line.
    return [words.join(' ')];
  };
  function resolveRole(page) {
    const kind = clean(page && page.kind).toLowerCase();
    const layout = clean(page && page.layout).toLowerCase();
    if (kind === 'cover' || layout === 'cover') return 'cover';
    if (kind === 'endpaper' || layout === 'endpaper' || kind === 'blank') return kind === 'blank' ? 'blank' : 'endpaper';
    if (kind === 'half-title' || layout === 'half-title') return 'half-title';
    if (kind === 'title' || layout === 'title-page') return 'title';
    if (kind === 'epigraph' || kind === 'dedication') return kind;
    if (kind === 'contents-right' || kind === 'contents-left') return 'contents';
    if (layout === 'chapter-photo') return 'chapter-photo';
    if (layout === 'chapter-intro' || layout === 'chapter-mark') return 'chapter-text';
    if (layout === 'chapter-initial' || kind === 'chapter-initial') return 'chapter-initial';
    if (layout === 'hspread-photo' || kind === 'hspread-photo') return 'hspread-photo';
    if (layout === 't06-hero' || kind === 't06-hero') return 't06-hero';
    if (layout === 't07-photos' || kind === 't07-photos') return 't07-photos';
    if (layout === 't08-pause' || kind === 't08-pause') return 't08-pause';
    if (layout === 't10-photos' || kind === 't10-photos') return 't10-photos';
    if (layout === 't12-photo' || kind === 't12-photo') return 't12-photo';
    if (layout === 'episode-photo' || kind === 'episode-photo') return 'episode-photo';
    if (layout === 'notes-page' || kind === 'notes-page') return 'notes-page';
    if (layout === 'i01-timeline' || kind === 'i01-timeline') return 'i01-timeline';
    if (layout === 'i02-route' || kind === 'i02-route') return 'i02-route';
    if (layout === 'i03-tree' || kind === 'i03-tree') return 'i03-tree';
    if (layout === 'who-photo' || kind === 'who-photo') return 'who-photo';
    if (layout === 'who-legend' || kind === 'who-legend') return 'who-legend';
    if (layout === 'voices-page' || kind === 'voices-page') return 'voices-page';
    if (layout === 'recipe-left' || kind === 'recipe-left') return 'recipe-left';
    if (layout === 'then-now' || kind === 'then-now') return 'then-now';
    if (layout === 'interview-page' || kind === 'interview-page') return 'interview-page';
    if (layout === 'recipe-right' || kind === 'recipe-right') return 'recipe-right';
    if (layout === 'p01-portrait' || kind === 'p01-portrait') return 'p01-portrait';
    if (layout === 'p01-text' || kind === 'p01-text') return 'p01-text';
    if (layout === 'panorama' || page?.panorama === true || page?.master === 'D01-PANORAMA') return 'panorama';
    if (layout === 'photo-fullspread' || (page && page.master === 'MS-04')) return 'large-photo';
    if (layout === 'photo-triptych' || kind === 'three-photo') return 'three-photo';
    if (layout === 'photo-duo' || kind === 'two-photo') return 'two-photo';
    if (layout === 'photo-over-text' || kind === 'photo-over-text') return 'photo-over-text';
    if (layout === 'photo-rail-image' || kind === 'photo-rail-image') return 'photo-rail-image';
    if (layout === 'photo-rail-text' || kind === 'photo-rail-text') return 'photo-rail-text';
    if (layout === 'photo-side-text' || kind === 'photo-side-text') return 'photo-side-text';
    if (layout === 'stacked-text' || kind === 'stacked-text') return 'stacked-text';
    if (layout === 'mosaic' || kind === 'mosaic') return 'mosaic';
    if (layout === 'bleed-text' || kind === 'bleed-text') return 'bleed-text';
    if (layout === 'dark-split' || kind === 'dark-split') return 'dark-split';
    if (layout === 'photo-overlay-text' || kind === 'photo-overlay-text') return 'photo-overlay-text';
    if (layout === 'photo-gradient-text' || kind === 'photo-gradient-text') return 'photo-gradient-text';
    if (layout === 'dark-gradient-photo' || kind === 'dark-gradient-photo') return 'dark-gradient-photo';
    if (layout === 'text-over-photo' || kind === 'text-over-photo') return 'text-over-photo';
    if (layout === 'quote-band-photo' || kind === 'quote-band-photo') return 'quote-band-photo';
    if (layout === 'dark-text' || kind === 'dark-text') return 'dark-text';
    if (layout === 'date-era' || kind === 'date-era') return 'date-era';
    if (layout === 'ctx-detail-sq' || kind === 'ctx-detail-sq') return 'ctx-detail-sq';
    if (layout === 'dark-fade-2.2' || kind === 'dark-fade' || page?.master === 'D01-DARK-FADE-2.2') return 'dark-fade';
    if (layout === 'photo-left-page' || layout === 'full-photo' || layout === 'prose-photo') return 'photo';
    if (layout === 'editorial-prose') return 'photo-text';
    if (layout === 'quote') return 'quote';
    if (layout === 'prose-dense' || layout === 'prose') {
      const rhythm = clean(page?.rhythm).toLowerCase();
      if (rhythm === 'important') return 'text-important';
      if (rhythm === 'important-margin') return 'text-important-margin';
      if (rhythm === 'margin') return 'text-margin';
      if (rhythm === 'inline-quote') return 'text-inline-quote';
      return page && page.pullQuote ? 'text-quote' : 'text';
    }
    if (layout === 'document-letter') return 'document';
    if (kind === 'document-comment') return 'document-comment';
    if (kind === 'timeline') return 'timeline';
    if (kind === 'final') return 'final';
    if (kind === 'epilogue' || kind === 'intro' || kind === 'author-note' || kind === 'thanks' || kind === 'sources') return 'final';
    if (kind === 'colophon') return 'colophon';
    if (kind === 'back-cover' || layout === 'back-cover') return 'back-cover';
    return '';
  }

  // I02-A family route map. The whole spread (2000 × H) is laid out once in
  // spread coordinates and each page draws its half, so the coastline and the
  // route run through the fold without a break. Deterministic: the same data
  // always gives the same map.
  const I02_CACHE = new WeakMap();
  function i02Layout(data) {
    if (I02_CACHE.has(data)) return I02_CACHE.get(data);
    const H = data.pageFormat === 'portrait' ? 1196 : 1000, W = 2000, gutter = [920, 1080], title = { x: 90, y: 60, w: 640, h: 190 };
    const places = data.places || [], lat0 = places.reduce((sum, place) => sum + place.lat, 0) / Math.max(1, places.length);
    const kx = Math.cos(lat0 * Math.PI / 180), pts = places.map(place => [place.lon * kx, -place.lat]);
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const spanX = Math.max(6, Math.max(...xs) - Math.min(...xs)), spanY = Math.max(4, Math.max(...ys) - Math.min(...ys));
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    const base = Math.min(1420 / spanX, (H - 560) / spanY), midY = 270 + (H - 400) / 2;
    const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    const byKey = (at, key) => at[places.findIndex(place => place.key === key)];
    // Stops for one view; stops closer than 100px are eased apart (at most
    // 24px from the true spot, never into the fold) so labels have room.
    const stopsFor = view => {
      const at = pts.map(p => [1000 + view.pan + (p[0] - cx) * view.k, midY + (p[1] - cy) * view.k]), home = at.map(p => p.slice());
      for (let pass = 0; pass < 40; pass++) for (let i = 0; i < at.length; i++) for (let j = i + 1; j < at.length; j++) {
        const dx = at[j][0] - at[i][0], dy = at[j][1] - at[i][1], d = Math.hypot(dx, dy) || 1;
        if (d >= 100) continue;
        const push = (100 - d) / 4, ux = dx / d, uy = dy / d;
        at[i][0] -= ux * push; at[i][1] -= uy * push; at[j][0] += ux * push; at[j][1] += uy * push;
        for (const k of [i, j]) {
          const ox = at[k][0] - home[k][0], oy = at[k][1] - home[k][1], o = Math.hypot(ox, oy);
          if (o > 24) { at[k][0] = home[k][0] + ox * 24 / o; at[k][1] = home[k][1] + oy * 24 / o; }
          if (at[k][0] > gutter[0] - 20 && at[k][0] < gutter[1] + 20) at[k][0] = home[k][0];
        }
      }
      return at;
    };
    const routeSamples = at => {
      const route = (data.route || []).map(key => byKey(at, key)).filter(Boolean), samples = [];
      for (let i = 0; i < route.length - 1; i++) for (let t = 0; t <= 1; t += .04) samples.push([route[i][0] + (route[i + 1][0] - route[i][0]) * t, route[i][1] + (route[i + 1][1] - route[i][1]) * t]);
      return { route, samples };
    };
    const scorer = (boxes, samples) => box => {
      let s = 0;
      if (box.x < 110 || box.x + box.w > W - 110 || box.y < 90 || box.y + box.h > H - 90) s += 1000;
      if (box.x < gutter[1] && box.x + box.w > gutter[0]) s += 1000;
      for (const other of boxes) if (hit(box, other)) s += 500;
      for (const [x, y] of samples) if (x > box.x - 4 && x < box.x + box.w + 4 && y > box.y - 4 && y < box.y + box.h + 4) s += 25;
      return s;
    };
    // Labels: place name, date, one short note. Near positions first;
    // farther ones get a thin leader line.
    const placeLabels = (at, boxes, score) => places.map((place, i) => {
      const [x, y] = at[i], note = String(place.text || '');
      const w = Math.max(String(place.name).length * 14 + 8, String(place.date || '').length * 8, note ? 190 : 0);
      const lines = note ? Math.min(2, Math.ceil(note.length * 7.4 / 190)) : 0;
      const h = 34 + (place.date ? 22 : 0) + (lines ? lines * 20 + 6 : 0);
      const options = [[18, -17], [-18 - w, -17], [-10, -h - 16], [-10, 16], [10 - w, -h - 16], [10 - w, 16], [18, -h + 12], [-18 - w, -h + 12], [18, -4], [-18 - w, -4], [-w / 2, -h - 22], [-w / 2, 22]];
      let best = null;
      for (const reach of [0, 60, 120]) options.forEach(([dx, dy], order) => {
        const bx = dx + w / 2, by = dy + h / 2, len = Math.hypot(bx, by) || 1;
        const box = { x: x + dx + bx / len * reach, y: y + dy + by / len * reach, w, h }, s = score(box) + order + reach / 3;
        if (!best || s < best.s) best = { s, box, reach, side: box.x + w <= x + 12 ? 'left' : 'right' };
      });
      boxes.push(best.box);
      const leader = best.reach ? [[x, y], [Math.min(Math.max(x, best.box.x), best.box.x + w), Math.min(Math.max(y, best.box.y + 18), best.box.y + h)]] : null;
      return { ...best.box, side: best.side, place, leader, s: best.s };
    });
    // Try zoom / pan views and keep the one whose labels sit most cleanly:
    // no stop in the fold, all inside the page, fewest collisions.
    let chosen = null;
    for (const zoom of [1, .9, .8, .7, .6]) for (const pan of [0, 60, -60, 120, -120, 180, -180, 260, -260, 500, -500]) {
      const view = { k: base * zoom, pan }, at = stopsFor(view);
      if (!at.every(([x, y]) => (x < gutter[0] - 20 || x > gutter[1] + 20) && x > 170 && x < 1830 && y > 280 && y < H - 150)) continue;
      const { samples } = routeSamples(at), boxes = [title, ...at.map(([x, y]) => ({ x: x - 12, y: y - 12, w: 24, h: 24 }))];
      const labels = placeLabels(at, boxes, scorer(boxes, samples));
      const total = labels.reduce((sum, label) => sum + label.s, 0) + Math.abs(pan) / 20 + (1 - zoom) * 120;
      if (!chosen || total < chosen.total) chosen = { total, view, at, labels, boxes, samples };
    }
    if (!chosen) {
      const view = { k: base * .6, pan: 0 }, at = stopsFor(view), { samples } = routeSamples(at), boxes = [title];
      chosen = { view, at, boxes, samples, labels: placeLabels(at, boxes, scorer(boxes, samples)) };
    }
    const { view, at, labels, boxes, samples } = chosen, score = scorer(boxes, samples);
    const project = (lon, lat) => [1000 + view.pan + (lon * kx - cx) * view.k, midY + (-lat - cy) * view.k];
    // Coastline as one path; rings far outside the spread are skipped.
    const geo = global.OcherkiGeo, landPath = [];
    if (geo) for (const ring of geo.land()) {
      const points = ring.map(([lon, lat]) => project(lon, lat));
      const rx = points.map(p => p[0]), ry = points.map(p => p[1]);
      if (Math.max(...rx) < -100 || Math.min(...rx) > W + 100 || Math.max(...ry) < -100 || Math.min(...ry) > H + 100) continue;
      landPath.push('M' + points.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L') + 'Z');
    }
    const step = view.k > 90 ? 2 : view.k > 40 ? 5 : 10, grid = [];
    for (let lon = -180; lon <= 200; lon += step) { const [x] = project(lon, 0); if (x > 0 && x < W) grid.push(`M${x.toFixed(1)} 0V${H}`); }
    for (let lat = -60; lat <= 85; lat += step) { const y = project(0, lat)[1]; if (y > 0 && y < H) grid.push(`M0 ${y.toFixed(1)}H${W}`); }
    // Route: a soft Catmull-Rom curve through the stops in story order.
    const routePts = routeSamples(at).route;
    let route = routePts.length ? `M${routePts[0][0].toFixed(1)} ${routePts[0][1].toFixed(1)}` : '';
    for (let i = 0; i < routePts.length - 1; i++) {
      const p0 = routePts[i - 1] || routePts[i], p1 = routePts[i], p2 = routePts[i + 1], p3 = routePts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      route += `C${c1.map(v => v.toFixed(1)).join(' ')} ${c2.map(v => v.toFixed(1)).join(' ')} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    // Photos (up to four) sit close to their own stop with a short link.
    const photos = [];
    places.forEach((place, i) => {
      if (!place.photo || photos.length >= 4) return;
      const ratio = Math.min(1.6, Math.max(.7, Number(place.photo.ratio) || 1.4)), w = Math.round(Math.sqrt(23000 * ratio)), h = Math.round(w / ratio);
      const [x, y] = at[i], label = labels[i], options = [];
      for (const gap of [26, 70, 120]) for (let a = 0; a < 16; a++) {
        const ux = Math.cos(a * Math.PI / 8), uy = Math.sin(a * Math.PI / 8), t = Math.min(Math.abs(w / 2 / (ux || 1e-6)), Math.abs(h / 2 / (uy || 1e-6)));
        options.push([x + ux * (t + gap) - w / 2, y + uy * (t + gap) - h / 2]);
      }
      let best = null;
      for (const [px, py] of options) { const box = { x: Math.round(px), y: Math.round(py), w, h }, s = score(box) + Math.hypot(px + w / 2 - x, py + h / 2 - y) / 8; if (!best || s < best.s) best = { s, box }; }
      if (!best || best.s >= 400) return;
      const near = [Math.min(Math.max(x, best.box.x), best.box.x + w), Math.min(Math.max(y, best.box.y), best.box.y + h)];
      if (Math.hypot(near[0] - x, near[1] - y) > 130) return;
      boxes.push(best.box);
      photos.push({ ...best.box, src: place.photo.src, link: Math.hypot(near[0] - x, near[1] - y) > 34 ? [near, [x, y]] : null });
    });
    // Names of the lands as they were in the story's years (no borders).
    // Only lands around the route are named, each may shift a little to
    // find a clear spot.
    const lands = [], ax = at.map(p => p[0]), ay = at.map(p => p[1]);
    const near = { x0: Math.min(...ax) - 260, x1: Math.max(...ax) + 260, y0: Math.min(...ay) - 220, y1: Math.max(...ay) + 220 };
    for (const land of (geo?.eraLabels ? geo.eraLabels(data.year) : [])) {
      const [lx, ly] = project(land.lon, land.lat);
      if (lx < near.x0 || lx > near.x1 || ly < near.y0 || ly > near.y1) continue;
      for (const [dx, dy] of [[0, 0], [0, -36], [0, 36], [-60, 0], [60, 0], [0, -72], [0, 72]]) {
        const x = lx + dx, y = ly + dy, box = { x: x - land.name.length * 7.5, y: y - 10, w: land.name.length * 15, h: 20 };
        if (score(box) < 6) { boxes.push(box); lands.push({ x, y, name: land.name }); break; }
      }
    }
    const seas = [];
    for (const sea of (geo?.seas || [])) {
      const [x, y] = project(sea.lon, sea.lat), box = { x: x - sea.name.length * 6, y: y - 10, w: sea.name.length * 12, h: 20 };
      if (score(box) < 6) { boxes.push(box); seas.push({ x, y, name: sea.name }); }
    }
    const layout = { H, landPath: landPath.join(''), grid: grid.join(''), route, at, labels, photos, seas, lands };
    I02_CACHE.set(data, layout);
    return layout;
  }

  // I03 family tree solver. People are blocks (name / years / place, an
  // optional small portrait); a person with spouses forms one family unit
  // ([spouse, person, spouse] for two unions). Children hang from their own
  // union's link; generations are rows. Leaves are laid left to right, a unit
  // is centred over its children, nothing sits in the fold, and the result
  // reports whether it fits without shrinking type (otherwise the engine
  // splits the tree into branches).
  const I03_CACHE = new WeakMap();
  function familyTreeLayout(data) {
    if (I03_CACHE.has(data)) return I03_CACHE.get(data);
    const H = data.pageFormat === 'portrait' ? 1196 : 1000, X0 = 270, X1 = 1930, G0 = 925, G1 = 1075, top = 280, bottom = H - 110, gap = 34, link = 46;
    const portraits = data.mode === 'portraits';
    // Names wrap to at most two lines where possible; a key person's
    // portrait sits beside the text so rows keep their height.
    const measure = person => {
      const words = String(person.name || 'Имя неизвестно').split(/\s+/u), dates = String(person.dates || ''), place = String(person.place || '');
      const nameLen = words.join(' ').length * 11.4;
      const textW = Math.round(Math.min(230, Math.max(112, Math.max(...words.map(word => word.length * 11.4), nameLen / 2 + 12, dates.length * 8.8, place.length * 8.6) + 14)));
      let lines = 1, run = 0;
      for (const word of words) { const len = word.length * 11.4; if (run && run + 6 + len > textW - 8) { lines++; run = len; } else run += (run ? 6 : 0) + len; }
      const photo = portraits && person.photo ? 1 : 0, textH = lines * 25 + (dates ? 23 : 0) + (place ? 22 : 0);
      return { w: textW + (photo ? 106 : 0), textW, photo, h: Math.max(textH, photo ? 118 : 0), lines };
    };
    const rows = [], boxes = [], lines = [];
    const depth = person => 1 + Math.max(0, ...(person.unions || []).flatMap(union => union.children.map(depth)));
    const gens = Math.max(1, ...(data.roots || []).map(depth));
    for (let g = 0; g < gens; g++) rows.push({ right: X0 - gap, h: 0, people: [] });
    // Pass 1: heights per row.
    const walkH = (person, g) => { const m = measure(person); rows[g].h = Math.max(rows[g].h, m.h); for (const union of person.unions || []) { if (union.spouse) rows[g].h = Math.max(rows[g].h, measure(union.spouse).h); union.children.forEach(child => walkH(child, g + 1)); } };
    (data.roots || []).forEach(root => walkH(root, 0));
    const free = bottom - top - rows.reduce((sum, row) => sum + row.h, 0), spacing = gens > 1 ? Math.min(150, free / (gens - 1)) : 0;
    let y = top + Math.max(0, (bottom - top - rows.reduce((sum, row) => sum + row.h, 0) - spacing * (gens - 1)) / 2);
    rows.forEach(row => { row.y = Math.round(y); y += row.h + spacing; });
    let fits = gens <= 5 && (gens === 1 || spacing >= 64);
    let shift = 0;
    const place = (person, g) => {
      const unions = (person.unions || []).filter(union => union.spouse || union.children.length);
      // A family's descendants never start left of where its own row has
      // reached, so children stay under their parents.
      for (let d = g + 1; d < rows.length; d++) rows[d].right = Math.max(rows[d].right, rows[g].right);
      const childUnits = unions.map(union => union.children.map(child => place(child, g + 1)));
      const order = unions.length >= 2 && unions[0].spouse ? [unions[0].spouse, person, ...unions.slice(1).map(union => union.spouse).filter(Boolean)] : [person, ...unions.map(union => union.spouse).filter(Boolean)];
      const sizes = order.map(measure), unitW = sizes.reduce((sum, size) => sum + size.w, 0) + link * (order.length - 1);
      const kids = childUnits.flat();
      let x = kids.length ? (kids[0].center + kids.at(-1).center) / 2 - unitW / 2 : Math.max(rows[g].right + gap, X0 + shift);
      x = Math.max(x, rows[g].right + gap);
      if (x < G1 && x + unitW > G0) x = x + unitW / 2 < 1000 && G0 - unitW >= rows[g].right + gap ? G0 - unitW : G1;
      if (x + unitW > X1) fits = false;
      rows[g].right = x + unitW;
      const row = rows[g], placed = [];
      let cursor = x;
      order.forEach((who, i) => {
        const size = sizes[i], box = { x: cursor, y: row.y, w: size.w, textW: size.textW, h: size.h, photo: size.photo, person: who };
        boxes.push(box); placed.push(box); row.people.push(who); cursor += size.w + link;
      });
      const self = placed[order.indexOf(person)];
      // Couple links and the drop to each union's children.
      unions.forEach((union, u) => {
        const partner = union.spouse ? placed[order.indexOf(union.spouse)] : null, ly = row.y + 14;
        let dropX = self.x + self.w / 2, dropY = self.y + self.h + 8;
        if (partner) {
          const a = partner.x < self.x ? partner : self, b = partner.x < self.x ? self : partner;
          lines.push(`M${(a.x + a.w + 8).toFixed(1)} ${ly}H${(b.x - 8).toFixed(1)}`);
          dropX = (a.x + a.w + b.x) / 2; dropY = ly;
        }
        const children = childUnits[u];
        if (!children.length) return;
        // With two marriages each union gets its own bar height, so the
        // children of one never read as children of the other.
        const barY = rows[g + 1].y - Math.min(40, spacing / 2) - (unions.length - 1 - u) * 18;
        const left = Math.min(dropX, ...children.map(child => child.center)), right = Math.max(dropX, ...children.map(child => child.center));
        lines.push(`M${dropX.toFixed(1)} ${dropY.toFixed(1)}V${barY.toFixed(1)}`);
        if (right - left > 1) lines.push(`M${left.toFixed(1)} ${barY.toFixed(1)}H${right.toFixed(1)}`);
        for (const child of children) lines.push(`M${child.center.toFixed(1)} ${barY.toFixed(1)}V${(rows[g + 1].y - 8).toFixed(1)}`);
      });
      return { center: self.x + self.w / 2 };
    };
    // Lay out once, then again shifted so the tree sits centred between the
    // generation column and the outer edge (the fold rule is re-applied).
    const run = offset => {
      shift = offset; boxes.length = 0; lines.length = 0; fits = baseFits;
      rows.forEach(row => { row.right = X0 + offset - gap; row.people = []; });
      (data.roots || []).forEach(root => place(root, 0));
      return Math.max(...boxes.map(box => box.x + box.w));
    };
    const baseFits = fits, used = run(0);
    // A small tree that fits one page is not split by the fold: it is
    // centred on the right-hand page, away from the title.
    if (fits && used <= G0) {
      run(Math.round((G1 + X1) / 2 - (X0 + used) / 2));
      if (!fits || boxes.some(box => box.x < G1)) run(0);
    }
    else if (fits && used < X1 - 40) {
      let best = { offset: 0, off: Infinity };
      for (let offset = 0; offset <= X1 - used; offset += 30) {
        run(offset);
        if (!fits) break;
        const left = Math.min(...boxes.map(box => box.x)), right = Math.max(...boxes.map(box => box.x + box.w)), off = Math.abs((left + right) / 2 - (X0 + X1) / 2);
        if (off < best.off) best = { offset, off };
      }
      run(best.offset);
    }
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const labels = rows.map((row, g) => {
      const years = row.people.map(who => Number(String(who.dates || '').match(/\d{4}/u)?.[0])).filter(Boolean);
      return { y: row.y, numeral: roman[g + (data.genOffset || 0)] || '', range: years.length ? `${Math.min(...years)}–${Math.max(...years)}` : '' };
    });
    const layout = { H, fits, boxes, lines, labels, people: boxes.length };
    I03_CACHE.set(data, layout);
    return layout;
  }

  function renderPage(page, side, context) {
    if (!page) return '';
    const role = resolveRole(page);
    if (!role) return '';
    const ctx = context || {};
    const esc = ctx.esc || escapeHtml;
    const editorialAttrs = kind => page.editorialAccentEditable === false ? '' :
      ` data-editorial-accent="${esc(kind)}" data-editorial-key="${esc((page.editorialOverrideKey || '') + (page.rhythm === 'important-margin' && kind === 'margin' ? ':margin' : ''))}" data-editorial-source="${esc(page.editorialSourcePageUid || page.sourcePageUid || '')}" title="Нажмите, чтобы исправить"`;
    const source = page.source || {};
    const meta = Object.assign({}, ctx.meta || {}, page.meta || {});
    const title = esc(page.title || source.title || page.episode || source.episode || '');
    const episode = esc(cleanEpisode(page.episode || source.episode || 'Семейная хроника'));
    const episodeNo = String(Number(page.episodeNo) || 1).padStart(2, '0');
    const text = page.measuredFlow ? '' : esc(cleanText(own(page, 'text') ? page.text : source.text || ''));
    const quote = page.measuredFlow ? '' : esc(page.quote || (ctx.quoteFrom ? ctx.quoteFrom(source) : '') || '');
    const pageSide = side === 'left' ? 'left' : 'right';
    const pageNo = Number(page.pageNo) || '';
    const inferred = source.inferred || (ctx.inferMeta ? ctx.inferMeta(source) : {}) || {};
    const sourceSegment = page.sourcePageUid && Array.isArray(source.segments)
      ? source.segments.find(segment => segment && segment.sourcePageUid === page.sourcePageUid)
      : null;
    const dateWatermarkValue = clean(
      page.dateWatermark || sourceSegment?.dateWatermark ||
      (String(page.dateMode || '').toLowerCase() === 'watermark' ? (page.dateLabel || page.eraDate || '') : '')
    );
    const photoToneClass = photo => {
      // «Colour for the new ones»: without an explicit choice, photographs
      // dated before 1990 are printed in black and white.
      const year=Number(String(photo?.year||'').match(/\d{4}/)?.[0]||0);
      const explicit=photo&&['color','colour','bw','black-white','monochrome'].includes(String(photo.photoMode||'').toLowerCase());
      if(!explicit&&meta.bookPhotoMode==='era'&&year&&year<1990)return 'dpk-photo-image-bw';
      const raw = photo && (
        photo.photoMode ?? photo.tone ??
        (photo.grayscale === true || photo.blackWhite === true || photo.bw === true ? 'bw' : '')
      );
      const mode = String(raw || '').toLowerCase();
      if (mode === 'bw' || mode === 'black-white' || mode === 'monochrome') return 'dpk-photo-image-bw';
      if (mode === 'color' || mode === 'colour') return 'dpk-photo-image-color';
      return '';
    };
    const image = index => {
      const src = ctx.image ? ctx.image(source, index) : '';
      const tone = photoToneClass(source?.photos?.[index]);
      return src ? `<img${tone ? ` class="${tone}"` : ''} src="${esc(src)}" alt="" loading="lazy" decoding="async">` : '<span class="dpk-photo-missing"></span>';
    };
    const caption = index => esc(ctx.caption ? ctx.caption(source, index) : '');
    // One source image in one viewport across both pages of the spread.
    const hspreadPhoto = index => `<figure class="dpk-hspread-photo" data-source-photo-index="${index}">${image(index).replace('loading="lazy"','loading="eager"')}</figure>`;
    // T06: two related frames in one strict row above the text. Both share one
    // height; widths follow their proportions so neither is cut aggressively.
    const photoRatio = index => { const photo=source?.photos?.[index]||{}; const ratio=Number(photo.width)>0&&Number(photo.height)>0?Number(photo.width)/Number(photo.height):1; return Math.min(1.6,Math.max(.7,ratio)); };
    // A quiet caption line by the folio, only from the author's photo data.
    const captionLine = indices => { const text=indices.map(index=>caption(index)).filter(Boolean).join(' · '); return text?`<div class="dpk-caption dpk-caption-line">${text}</div>`:''; };
    // T10: main photo and an angled card placed in spread coordinates; each
    // page draws its own part, so elements cross the fold without a seam.
    const t10Layer = layout => {
      if(!layout)return '';
      const offset=pageSide==='left'?0:1000,box=(item,extra='')=>`left:${item.x-offset}px;top:${item.y}px;width:${item.w}px;height:${item.h}px${extra}`;
      const main=`<figure class="dpk-t10-main" style="${box(layout.main)}">${image(layout.main.index).replace('loading="lazy"','loading="eager"')}</figure>`;
      const card=`<figure class="dpk-t10-card" style="${box(layout.card,`;transform:rotate(${layout.card.angle}deg)`)}">${image(layout.card.index).replace('loading="lazy"','loading="eager"')}</figure>`;
      return main+card;
    };
    const t06Pair = indices => {
      const width=839,gutter=18,ratios=indices.map(photoRatio),height=Math.min(340,Math.round((width-gutter)/(ratios[0]+ratios[1])));
      const widths=ratios.map(ratio=>Math.round((width-gutter)*ratio/(ratios[0]+ratios[1])));
      return {height,origin:70+height+64,html:`<div class="dpk-t06-pair" style="height:${height}px">${indices.map((index,position)=>`<figure class="dpk-t06-photo" data-source-photo-index="${index}" style="width:${widths[position]}px">${image(index).replace('loading="lazy"','loading="eager"')}</figure>`).join('')}</div>`};
    };
    const running = `<div class="dpk-running">${episode || 'Семейная хроника'}</div>`;
    const folio = `<div class="dpk-folio">${pageNo}</div>`;
    const photoMode = String(meta.photoMode || ctx.photoMode || 'color').toLowerCase() === 'bw' ? 'dpk-photo-bw' : 'dpk-photo-color';
    const showDateWatermark = dateWatermarkValue && role !== 'date-era' && page.layout !== 'chapter-intro' && page.master !== 'D01-CHAPTER-TEXT';
    // The two halves of the 1.5-page rail have different semantic roles
    // (image/text), but they share one geometric contract.  Keep the family
    // class on both nodes so the continuous crop and the text rail use the
    // same CSS coordinates in preview and export.
    const familyRole = role === 'photo-rail-image' || role === 'photo-rail-text' ? 'dpk-photo-rail' : '';
    const article = (master, body, extra = '') => `<article lang="ru" class="dpk-page dpk-${role} ${familyRole} ${pageSide} ${photoMode} ${extra}" data-design-pack="${PACK.id}" data-master="${master}">${showDateWatermark ? `<div class="dpk-date-watermark" aria-hidden="true">${esc(dateWatermarkValue)}</div>` : ''}${body}</article>`;

    if (role === 'cover') {
      const coverSource = ctx.image ? ctx.image(source, 0) : '';
      const coverTone = photoToneClass(source?.photos?.[0]);
      const footer=esc(meta.coverFooter || '');
      return article('D01-COVER', `${coverSource ? `<img class="dpk-cover-image${coverTone ? ` ${coverTone}` : ''}" src="${esc(coverSource)}" alt="" loading="lazy" decoding="async">` : ''}<div class="dpk-cover-scrim"></div><div class="dpk-cover-kicker"><span>Семейная хроника</span><span>${esc(meta.year || '')}</span></div>${meta.title?`<h1>${esc(meta.title)}</h1>`:''}<div class="dpk-cover-rule"></div><div class="dpk-cover-subtitle">${esc(meta.subtitle || '')}</div>${footer?`<div class="dpk-cover-author">${footer}</div>`:''}`);
    }
    if (role === 'endpaper') {
      // F-END / B-END — typographic grid pattern: the first letter of the book
      // title on one strict grid across the whole spread (every other row
      // shifted by half a step); each page draws its part, so the spine does
      // not restart the grid.
      const letter=esc((String(meta.title||'Семейная хроника').match(/\p{L}/u)?.[0]||'С').toUpperCase());
      const stepX=212,stepY=92,offset=pageSide==='left'?0:1000,glyphs=[];
      for(let row=0;row*stepY<1260;row++){
        const shift=row%2?stepX/2:0;
        for(let x=58+shift;x<2000;x+=stepX){const local=x-offset;if(local>-80&&local<1040)glyphs.push(`<span style="left:${Math.round(local)}px;top:${36+row*stepY}px">${letter}</span>`);}
      }
      return article('D01-ENDPAPER', `<div class="dpk-endpaper-pattern" aria-hidden="true">${glyphs.join('')}</div>`, 'dpk-endpaper-grid');
    }
    if (role === 'blank') return article('D01-ENDPAPER', '');
    if (role === 'half-title') return article('D01-HALF-TITLE', `<div class="dpk-kicker">Очерки жизни</div><h1>${esc(meta.title || 'Семейная хроника')}</h1><div class="dpk-half-meta">${esc(meta.subtitle || '')}</div>${folio}`);
    if (role === 'title') return article('D01-TITLE', `<div class="dpk-title-wrap"><div class="dpk-kicker">Семейная история</div><h1>${esc(meta.title || '')}</h1><div class="dpk-short-rule"></div><p>${esc(meta.subtitle || '')}</p></div>${meta.author?`<div class="dpk-title-author">${esc(meta.author)}</div>`:''}`);
    if (role === 'epigraph') return article('D01-EPIGRAPH', `<div class="dpk-centered"><div class="dpk-kicker">Эпиграф</div><blockquote>${esc(page.epigraphText || text)}</blockquote>${page.epigraphSource ? `<div class="dpk-source">${esc(page.epigraphSource)}</div>` : ''}</div>${folio}`);
    if (role === 'dedication') return article('D01-EPIGRAPH', `<div class="dpk-centered"><div class="dpk-kicker">Посвящение</div><blockquote>${esc(page.dedicationText || text)}</blockquote>${page.dedicationSign ? `<div class="dpk-source">${esc(page.dedicationSign)}</div>` : ''}</div>${folio}`);
    if (role === 'contents') {
      const items = (page.items || []).map((item, index) => `<div class="dpk-content-row"><span>${esc(item.title || `Глава ${index + 1}`)}</span><i></i><b>${esc(item.page || '')}</b></div>`).join('');
      return article('D01-CONTENTS', `<div class="dpk-kicker">Содержание</div><div class="dpk-contents">${items}</div>${folio}`);
    }
    if (page.measuredFlow) {
      const flow=page.measuredFlow,mode=flow.mode;
      const cell=index=>{
        const ranges=(flow.inlineRanges?.[index]||[]).map(item=>({...item,attrs:item.editable?editorialAttrs('important'):''}));
        return `<div class="dpk-flow-cell" data-flow-cell="${index}"><p class="dpk-source-copy" data-source-stream>${sourceMarkup(flow.cells[index]||'',flow.cellBreaks[index]||[],ranges,true,Boolean(flow.paragraphStarts?.[index]))}</p></div>`;
      };
      const overflowClass=kind=>flow.accentOverflow?.[kind]?' dpk-accent-overflow':'';
      const quote=()=>`<div class="dpk-quote-reservation"><p class="dpk-inline-quote${overflowClass('quote')}"${editorialAttrs('inline-quote')}>${sourceMarkup(page.inlineQuote||'')}</p></div>`;
      const margin=['margin','important-margin'].includes(mode)?`<aside class="dpk-margin-note"><span class="${overflowClass('margin').trim()}"${editorialAttrs('margin')}>${sourceMarkup(page.marginNote||'')}</span></aside>`:'';
      const quotedColumn=(top,bottom)=>`<div class="dpk-flow-column dpk-flow-column-quote">${cell(top)}${quote()}${cell(bottom)}</div>`;
      const plainColumn=index=>`<div class="dpk-flow-column">${cell(index)}</div>`;
      const content=mode==='inline-quote'
        ?flow.quoteColumn==='right'?`${plainColumn(0)}${quotedColumn(1,2)}`:`${quotedColumn(0,1)}${plainColumn(2)}`
        :`${plainColumn(0)}${plainColumn(1)}`;
      const style=Object.entries(flow.geometry).map(([key,value])=>`--dpk-flow-${key}:${typeof value==='number'?`${value}px`:value}`).join(';');
      // H-SPREAD v1.2: one horizontal photograph runs across the top of the
      // spread; the page only tells the shared engine where its text starts.
      const pair=page.topPair?t06Pair(page.topPair.photoIndices):null;
      // T08: one vertical photograph running into the fold; the text keeps a
      // single outer column (the second flow cell has zero height).
      const spinePhoto=page.spinePhoto?`<figure class="dpk-t08-photo" data-source-photo-index="${page.spinePhoto.photoIndex}">${image(page.spinePhoto.photoIndex).replace('loading="lazy"','loading="eager"')}</figure>`:'';
      const topPhoto=page.topPhoto?hspreadPhoto(page.topPhoto.photoIndex):pair?pair.html:'';
      const chapterHeader=mode==='chapter'?`<div class="dpk-chapter-kicker">Глава ${String(page.chapterNo||1).padStart(2,'0')}</div><div class="dpk-chapter-title"><h1>${title}</h1><div>${episode}</div></div><div class="dpk-chapter-rule"></div>`:topPhoto||page.episodeOpening?'':running;
      const t10=page.t10?t10Layer(page.t10):'';
      // Episode opening: title in one line in the heading colour, a long
      // horizontal handwritten line, air, then the shared text flow.
      const episodeHead=page.episodeOpening?`<div class="dpk-episode-head"><h2${String(page.episodeOpening.title||'').length>30?' class="dpk-episode-long"':''}>${esc(page.episodeOpening.title||'')}</h2>${page.episodeOpening.line?`<p class="dpk-episode-line" style="font-size:${(()=>{const n=String(page.episodeOpening.line).length;return n<=40?28:n<=52?24:n<=64?21:18;})()}px">${esc(page.episodeOpening.line)}</p>`:''}</div>`:'';
      const photoCaption=page.topPhoto&&pageSide==='left'?captionLine([page.topPhoto.photoIndex]):pair?captionLine(page.topPair.photoIndices):page.spinePhoto?captionLine([page.spinePhoto.photoIndex]):'';
      return article(page.master,`${topPhoto}${spinePhoto}${t10}${episodeHead}${chapterHeader}${margin}<div class="dpk-measured-flow dpk-flow-mode-${mode}">${content}</div>${photoCaption}${folio}`,`dpk-dom-paginated${page.topPhoto?' dpk-hspread':pair?' dpk-t06-text':spinePhoto?' dpk-t08-text':t10?' dpk-t10 dpk-t10-text':episodeHead?' dpk-episode-open':''}`)
        .replace('data-design-pack=',`style="${style}${pair?`;--dpk-flow-origin:${pair.origin}px`:''}" data-design-pack=`);
    }
    const words = cleanText(own(page, 'text') ? page.text : source.text || '').split(/\s+/).filter(Boolean);
    if (role === 'chapter-photo') return article('D01-CHAPTER-PHOTO', `<figure>${image(page.photoIndex || 0)}</figure>${caption(page.photoIndex || 0) ? `<div class="dpk-caption">${caption(page.photoIndex || 0)}</div>` : ''}${folio}`);
    if (role === 'chapter-text') {
      const byline = esc([inferred.place, inferred.date].filter(Boolean).join(' · ') || page.episode || source.episode || '');
      return article('D01-CHAPTER-TEXT', `<div class="dpk-chapter-kicker">Глава ${String(page.chapterNo || 1).padStart(2, '0')}</div><div class="dpk-chapter-title"><h1>${title}</h1>${byline ? `<div>${byline}</div>` : ''}</div><div class="dpk-chapter-rule"></div><div class="dpk-columns dpk-chapter-copy"><p>${text}</p></div>${folio}`);
    }
    if (role === 'chapter-initial') {
      const initialSource = clean(page.initialLetter || title || meta.title || 'С');
      const initial = esc(initialSource.charAt(0).toUpperCase() || 'С');
      const copy = esc(page.initialText || page.quote || title || '');
      return article('D01-CHAPTER-INITIAL', `<div class="dpk-initial-composition"><div class="dpk-initial-rail"><span class="dpk-initial-letter">${initial}</span></div><div class="dpk-initial-copy"><p>${copy}</p></div></div>${folio}`);
    }
    if (role === 'photo' || role === 'large-photo') {
      const index = page.photoIndex || 0;
      const master = role === 'large-photo' ? 'D01-LARGE-PHOTO' : 'D01-PHOTO';
      // A clearly vertical photograph (a portrait, a document) is shown whole
      // at full height, centred, instead of being cut into the page's square.
      const photo=source?.photos?.[index]||{},trueRatio=Number(photo.width)>0&&Number(photo.height)>0?Number(photo.width)/Number(photo.height):1;
      const pageH=(page.pageFormat||meta.format)==='portrait'?1196:1000,areaW=928,areaH=pageH-36-(role==='large-photo'?82:58);
      let figureStyle='';
      if(trueRatio<areaW/areaH-.12){const w=Math.round(areaH*trueRatio);figureStyle=` style="inset:36px auto auto ${Math.round((1000-w)/2)}px!important;width:${w}px!important;height:${areaH}px!important"`;}
      return article(master, `<figure${figureStyle}>${image(index)}</figure>${caption(index) ? `<div class="dpk-caption">${caption(index)}</div>` : ''}${folio}`, role === 'large-photo' ? 'dpk-edge-photo' : '');
    }
    if (role === 'ctx-detail-sq') {
      const index=Number(page.photoIndex)||0;
      // Number(null) is 0: a missing secondary photo must stay null, or the card
      // would repeat photo 0.
      const secondaryIndex=page.secondaryPhotoIndex!=null&&page.secondaryPhotoIndex!==''&&Number.isFinite(Number(page.secondaryPhotoIndex))?Number(page.secondaryPhotoIndex):null;
      const photo=source?.photos?.[index]||{};
      const ratio=Number(photo.width)>0&&Number(photo.height)>0?Number(photo.width)/Number(photo.height):1;
      const state=String(page.ctxState||photo.ctxState||(ratio<.82?'V':ratio>1.22?'H':'S')).toUpperCase();
      const safeState=['V','S','H'].includes(state)?state:'S';
      const src=ctx.image?ctx.image(source,index):'';
      if(!src)throw new Error('CTX Detail SQ v1.7 нельзя создать без исходной фотографии.');
      const secondarySrc=secondaryIndex!==null&&ctx.image?ctx.image(source,secondaryIndex):'';
      const handwritten=clean(page.ctxHandwrittenNote||page.marginNote||page.importantLine||'');
      if(secondarySrc===src||secondarySrc&&page.mainPhotoAssetId&&page.secondaryPhotoAssetId===page.mainPhotoAssetId)throw new Error('CTX Detail SQ v1.7 требует другую фотографию для secondary card.');
      if(!secondarySrc&&!handwritten)throw new Error('CTX Detail SQ v1.7 требует вторую фотографию или рукописный акцент.');
      const tone=photoToneClass(photo);
      const img=className=>`<img class="${className}${tone?` ${tone}`:''}" src="${esc(src)}" alt="" loading="lazy" decoding="async">`;
      const secondaryPhoto=source?.photos?.[secondaryIndex]||{};
      const secondaryTone=photoToneClass(secondaryPhoto);
      const secondaryImg=secondarySrc?`<img class="dpk-ctx-secondary-image${secondaryTone?` ${secondaryTone}`:''}" src="${esc(secondarySrc)}" alt="" loading="lazy" decoding="async">`:'';
      const accent=secondarySrc
        ?`<figure class="dpk-ctx-card" data-ctx-accent="secondary-photo" data-source-photo-index="${secondaryIndex}" data-photo-asset-id="${esc(page.secondaryPhotoAssetId||secondaryPhoto.id||secondarySrc)}">${secondaryImg}</figure>`
        :`<div class="dpk-ctx-handwritten-card" data-ctx-accent="handwritten-note"${editorialAttrs('ctx-handwritten')}><span>${esc(handwritten)}</span></div>`;
      return article('D01-CTX-DETAIL-SQ',`<div class="dpk-ctx-stage" data-ctx-state="${safeState}" data-source-photo-index="${index}" data-photo-asset-id="${esc(page.mainPhotoAssetId||photo.id||src)}" data-ctx-accent-type="${secondarySrc?'secondary-photo':'handwritten-note'}"><figure class="dpk-ctx-main">${img('dpk-ctx-main-image')}</figure>${accent}</div>${folio}`,'dpk-ctx-detail-sq');
    }
    if (role === 'dark-fade') {
      const index=Number(page.photoIndex)||0;
      const photo=source?.photos?.[index]||{};
      const src=ctx.image?ctx.image(source,index):'';
      if(!src)throw new Error('DARK FADE 2.2 нельзя создать без исходной фотографии.');
      const ratio=Number(photo.width)>0&&Number(photo.height)>0?Number(photo.width)/Number(photo.height):1;
      const state=String(page.darkFadeState||photo.darkFadeState||(ratio<.82?'V':ratio>1.22?'H':'S')).toUpperCase();
      const safeState=['V','S','H'].includes(state)?state:'S';
      const tone=photoToneClass(photo);
      return article('D01-DARK-FADE-2.2',`<div class="dpk-dark-fade-stage" data-dark-fade-state="${safeState}" data-alpha-mask="true" data-source-photo-index="${index}"><img class="dpk-dark-fade-image${tone?` ${tone}`:''}" src="${esc(src)}" alt="" loading="lazy" decoding="async"><i class="dpk-dark-fade-veil" aria-hidden="true"></i></div>${folio}`,`dpk-dark dpk-dark-fade dpk-dark-fade-${page.darkFadeSide==='right'?'right':'left'}`);
    }
    if (role === 'three-photo') {
      const indexes = Array.isArray(page.photoIndices) ? page.photoIndices.slice(0, 3) : [0, 1, 2];
      const figures = indexes.map((index, position) => `<figure class="dpk-triptych-${position + 1}">${image(index)}</figure>`).join('');
      const captions = indexes.map(index => caption(index)).filter(Boolean).join(' · ');
      return article('D01-THREE-PHOTO', `<div class="dpk-triptych">${figures}</div>${captions ? `<div class="dpk-caption">${captions}</div>` : ''}${folio}`);
    }
    if (role === 'two-photo') {
      const indexes = Array.isArray(page.photoIndices) ? page.photoIndices.slice(0, 2) : [0, 1];
      const figures = indexes.map((index, position) => `<figure class="dpk-duo-${position + 1}">${image(index)}</figure>`).join('');
      const captions = indexes.map(index => caption(index)).filter(Boolean).join(' · ');
      return article('D01-TWO-PHOTO', `<div class="dpk-duo">${figures}</div>${captions ? `<div class="dpk-caption">${captions}</div>` : ''}${folio}`);
    }
    if (role === 'photo-over-text') {
      const index=page.photoIndex||0;
      const heading=page.sectionTitle?`<h2>${esc(page.sectionTitle)}</h2>`:'';
      return article('D01-PHOTO-OVER-TEXT', `<figure>${image(index)}</figure>${caption(index)?`<div class="dpk-caption dpk-inline-caption">${caption(index)}</div>`:''}<div class="dpk-photo-over-copy">${heading}<div class="dpk-columns"><p>${text}</p></div></div>${folio}`, page.sectionTitle?'dpk-section-start':'');
    }
    if (role === 'photo-rail-image') {
      const index=page.photoIndex||0;
      return article('D01-PHOTO-RAIL', `<figure class="dpk-photo-rail-main">${image(index)}</figure>${caption(index)?`<div class="dpk-caption dpk-photo-rail-caption">${caption(index)}</div>`:''}${folio}`, `dpk-rail-image dpk-rail-${page.railSide==='left'?'left':'right'}`);
    }
    if (role === 'photo-rail-text') {
      const index=page.photoIndex||0;
      const heading=page.sectionTitle?`<div class="dpk-kicker">Эпизод ${episodeNo}</div><h2>${esc(page.sectionTitle)}</h2>`:`<div class="dpk-kicker">${episode}</div><h2>${title}</h2>`;
      return article('D01-PHOTO-RAIL', `<figure class="dpk-photo-rail-half">${image(index)}</figure><div class="dpk-photo-rail-copy">${heading}<div class="dpk-columns"><p>${text}</p></div></div>${folio}`, `dpk-rail-text dpk-rail-${page.railSide==='left'?'left':'right'}`);
    }
    if (role === 'photo-side-text') {
      const index=page.photoIndex||0;
      const heading=page.sectionTitle?`<div class="dpk-kicker dpk-story-kicker">Эпизод ${episodeNo}</div><h2>${esc(page.sectionTitle)}</h2>`:'';
      return article('D01-PHOTO-SIDE-TEXT', `<div class="dpk-side-photo"><figure>${image(index)}</figure>${caption(index)?`<div class="dpk-caption dpk-inline-caption">${caption(index)}</div>`:''}</div><div class="dpk-side-copy">${heading}<div class="dpk-reading"><p>${text}</p></div></div>${folio}`, page.sectionTitle?'dpk-section-start':'');
    }
    if (role === 'stacked-text') {
      const indexes=Array.isArray(page.photoIndices)?page.photoIndices.slice(0,2):[page.photoIndex||0,page.secondPhotoIndex||1];
      const figures=indexes.map(index=>`<figure>${image(index)}</figure>`).join('');
      const heading=page.sectionTitle?`<div class="dpk-kicker">Эпизод ${episodeNo}</div><h2>${esc(page.sectionTitle)}</h2>`:`<div class="dpk-kicker">${episode}</div><h2>${title}</h2>`;
      return article('D01-STACKED-TEXT', `<div class="dpk-stacked-media">${figures}</div><div class="dpk-stacked-copy">${heading}<div class="dpk-reading"><p>${text}</p></div></div>${folio}`, page.mirror?'dpk-mirror':'');
    }
    if (role === 'mosaic') {
      const indexes=(Array.isArray(page.photoIndices)?page.photoIndices:[]).slice(0,12);
      const figures=indexes.map(index=>`<figure>${image(index)}</figure>`).join('');
      const captions=indexes.map(index=>caption(index)).filter(Boolean).join(' · ');
      return article('D01-MOSAIC', `<div class="dpk-mosaic-grid">${figures}</div>${captions?`<div class="dpk-caption">${captions}</div>`:''}${folio}`, `dpk-mosaic-count-${indexes.length}`);
    }
    if (role === 'bleed-text') {
      const index=page.photoIndex||0;
      if(page.railSide==='left'){
        if(page.bleedSide==='rail-left'){
          const heading=`<div class="dpk-kicker">${episode}</div><h2>${title}</h2>`;
          return article('D01-BLEED-TEXT', `<div class="dpk-bleed-image">${image(index)}</div><div class="dpk-bleed-copy">${heading}<p>${text}</p></div>${folio}`, 'dpk-bleed-rail-left');
        }
        return article('D01-BLEED-TEXT', `<div class="dpk-bleed-image">${image(index)}</div>${folio}`, 'dpk-bleed-full-right');
      }
      if(page.bleedSide==='left') return article('D01-BLEED-TEXT', `<div class="dpk-bleed-image">${image(index)}</div>${folio}`, 'dpk-bleed-left');
      const heading=`<div class="dpk-kicker">${episode}</div><h2>${title}</h2>`;
      return article('D01-BLEED-TEXT', `<div class="dpk-bleed-image">${image(index)}</div><div class="dpk-bleed-copy">${heading}<p>${text}</p></div>${folio}`, 'dpk-bleed-right');
    }
    if (role === 'dark-split') {
      const index=page.photoIndex||0;
      return article('D01-DARK-SPLIT', `<div class="dpk-dark-split-copy"><div class="dpk-kicker">${episode}</div><h2>${title}</h2><p>${text}</p></div><figure class="dpk-dark-split-photo">${image(index)}</figure>${folio}`);
    }
    if (role === 'photo-overlay-text') {
      const index=page.photoIndex||0;
      return article('D01-PHOTO-OVERLAY-TEXT', `<figure>${image(index)}</figure><div class="dpk-overlay-scrim"></div><div class="dpk-overlay-copy"><div class="dpk-kicker">${episode}</div><h2>${title}</h2><p>${text}</p></div>${folio}`);
    }
    if (role === 'photo-gradient-text') {
      const index=page.photoIndex||0;
      const heading=page.sectionTitle?`<div class="dpk-kicker">Эпизод ${episodeNo}</div><h2>${esc(page.sectionTitle)}</h2>`:`<div class="dpk-kicker">${episode}</div><h2>${title}</h2>`;
      return article('D01-PHOTO-GRADIENT-TEXT', `<figure>${image(index)}</figure><div class="dpk-gradient-scrim"></div><div class="dpk-gradient-copy">${heading}<p>${text}</p></div>${folio}`);
    }
    if (role === 'dark-gradient-photo') {
      const index=page.photoIndex||0;
      const heading=page.sectionTitle?`<div class="dpk-kicker">Эпизод ${episodeNo}</div><h2>${esc(page.sectionTitle)}</h2>`:`<div class="dpk-kicker">${episode}</div><h2>${title}</h2>`;
      return article('D01-DARK-GRADIENT-PHOTO', `<figure>${image(index)}</figure><div class="dpk-dark-gradient-scrim"></div><div class="dpk-dark-gradient-copy">${heading}<p>${text}</p></div>${folio}`);
    }
    if (role === 'text-over-photo') {
      const index=page.photoIndex||0;
      const heading=page.sectionTitle?`<div class="dpk-kicker">Эпизод ${episodeNo}</div><h2>${esc(page.sectionTitle)}</h2>`:`<div class="dpk-kicker">${episode}</div><h2>${title}</h2>`;
      return article('D01-TEXT-OVER-PHOTO', `<div class="dpk-text-over-copy">${heading}<div class="dpk-reading"><p>${text}</p></div></div><figure>${image(index)}</figure>${caption(index)?`<div class="dpk-caption">${caption(index)}</div>`:''}${folio}`);
    }
    if (role === 'quote-band-photo') {
      const index=page.photoIndex||0;
      return article('D01-QUOTE-BAND-PHOTO', `<div class="dpk-quote-band">${page.quote?`<blockquote>«${esc(page.quote)}»</blockquote>`:`<div class="dpk-kicker">${episode}</div>`}</div><figure>${image(index)}</figure>${caption(index)?`<div class="dpk-caption">${caption(index)}</div>`:''}${folio}`, page.secondary?'dpk-secondary':'');
    }
    if (role === 'date-era') {
      const date=esc(page.dateLabel||inferred.date||'');
      const eraSize=String(page.dateLabel||inferred.date||'').length<=4?'390px':String(page.dateLabel||inferred.date||'').length<=7?'270px':'190px';
      return article('D01-DATE-ERA', `<div class="dpk-era-mark" style="--dpk-era-size:${eraSize}">${date}</div><div class="dpk-era-copy"><div class="dpk-kicker">Дата / период</div><h2>${title}</h2><div class="dpk-short-rule"></div><div class="dpk-columns dpk-reading"><p>${text}</p></div></div>${folio}`);
    }
    if (role === 'interview-page') {
      // «Вопросы и ответы»: questions set apart in a darker, firmer face,
      // answers in the book's text face; the first page carries the heading.
      const blocks=page.blocks||[];
      return article('D01-INTERVIEW',`<div class="dpk-interview${page.heading?' has-head':''}">${page.heading?`<h2>${esc(page.heading)}</h2>`:''}${blocks.map(block=>block.kind==='q'?`<p class="dpk-q">${esc(block.text)}</p>`:`<p class="dpk-${block.kind==='intro'?'intro':'a'}">${esc(block.text)}</p>`).join('')}</div>`,'dpk-interview-page');
    }
    if (role === 'then-now') {
      // «Было — стало»: both photos the same height on the same line, each
      // with its year large below and the caption under it.
      const data=page.pair||{},mine=data[page.side]||{},formatH=(data.pageFormat||meta.format)==='portrait'?1196:1000;
      const ratios=[0,1].map(index=>photoRatio(index)),maxW=700,maxH=formatH-420;
      const height=Math.round(Math.min(maxH,...ratios.map(ratio=>maxW/ratio))),index=page.photoIndex||0,width=Math.round(height*ratios[index]);
      const top=Math.round((formatH-height)/2-60),left=page.side==='then'?Math.round(930-width-80):Math.round(1070-1000+80);
      return article('D01-THEN-NOW',`<div class="dpk-thennow-label" style="top:${top-44}px;left:${left}px">${esc(mine.label||'')}</div>`
        +`<figure class="dpk-thennow-photo" style="top:${top}px;left:${left}px;width:${width}px;height:${height}px">${image(index).replace('loading="lazy"','loading="eager"')}</figure>`
        +`<div class="dpk-thennow-text" style="top:${top+height+26}px;left:${left}px;width:${width}px">${mine.year?`<b>${esc(mine.year)}</b>`:''}${mine.caption||mine.place?`<span>${esc([mine.caption,mine.place].filter(Boolean).join(' · '))}</span>`:''}</div>`,'dpk-thennow');
    }
    if (role === 'recipe-left' || role === 'recipe-right') {
      // «Семейный рецепт / традиция». With a photo: the photo on the left,
      // name, what is needed and how it was made on the right. Without: the
      // name and the list on the left, the story on the right.
      const data=page.recipe||{},formatH=(data.pageFormat||meta.format)==='portrait'?1196:1000;
      const head=`<div class="dpk-recipe-kicker">${esc(data.kind||'')}</div><h2>${esc(data.title||'')}</h2>`;
      const list=(data.items||[]).length?`<ul class="dpk-recipe-items${data.items.length>8?' two':''}">${data.items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:'';
      const words=(data.paragraphs||[]).join(' ').length,font=words<1300?19:words<2100?17:15.5;
      const story=(data.paragraphs||[]).length?`<div class="dpk-recipe-story" style="font-size:${font}px">${data.paragraphs.map(text=>`<p>${esc(text)}</p>`).join('')}</div>`:'';
      if(role==='recipe-left'){
        if(data.hasPhoto){
          const index=page.photoIndex||0,ratio=photoRatio(index),width=Math.round(Math.min(760,(formatH-280)*ratio)),height=Math.round(width/ratio);
          return article('D01-RECIPE-LEFT',`<figure class="dpk-recipe-photo" style="width:${width}px;height:${height}px;left:${Math.round((1000-width)/2)+20}px;top:${Math.round((formatH-height)/2)}px">${image(index).replace('loading="lazy"','loading="eager"')}</figure>`,'dpk-recipe');
        }
        return article('D01-RECIPE-LEFT',`<div class="dpk-recipe-card">${head}${list}</div>`,'dpk-recipe');
      }
      return article('D01-RECIPE-RIGHT',`<div class="dpk-recipe-card">${data.hasPhoto||data.full?head+list:''}${story}</div>`,'dpk-recipe');
    }
    if (role === 'voices-page') {
      // «Голоса семьи»: memories as quiet italic quotes, each signed in small
      // capitals; the first page carries the heading.
      const voices=page.voices||[];
      return article('D01-VOICES',`<div class="dpk-voices${page.heading?' has-head':''}">${page.heading?`<h2>${esc(page.heading)}</h2>`:''}${voices.map(voice=>`<figure class="dpk-voice"><blockquote style="font-size:${voice.size||22}px">«${esc(String(voice.text).replace(/«/gu,"„").replace(/»/gu,"“"))}»</blockquote>${voice.who?`<figcaption>${esc(voice.who)}</figcaption>`:''}</figure>`).join('')}</div>`,'dpk-voices-page');
    }
    if (role === 'who-photo') {
      // «Кто на фото», right page: the group photo as large as the page
      // allows, nothing drawn on it; who is who is the caption on the folio
      // line, in the classic «Слева направо: …» form (up to three lines).
      const index=page.photoIndex||0,data=page.who||{},formatH=(data.pageFormat||meta.format)==='portrait'?1196:1000;
      const ratio=Math.min(2.4,Math.max(.6,(()=>{const photo=source?.photos?.[index]||{};return Number(photo.width)>0&&Number(photo.height)>0?Number(photo.width)/Number(photo.height):1.5;})()));
      const text=String(data.peopleCaption||''),lines=Math.min(3,Math.max(1,Math.ceil(text.length/118)));
      const maxW=800,maxH=formatH-250-lines*19;
      const width=Math.round(Math.min(maxW,maxH*ratio)),height=Math.round(width/ratio),left=Math.round((1000-width)/2)-20,top=Math.round((formatH-lines*19-height)/2-10);
      return article('D01-WHO-PHOTO',`<figure class="dpk-who-photo" style="left:${left}px;top:${top}px;width:${width}px;height:${height}px">${image(index).replace('loading="lazy"','loading="eager"')}</figure>${text?`<div class="dpk-caption dpk-caption-line dpk-who-caption">${esc(text)}</div>`:''}`,'dpk-who');
    }
    if (role === 'who-legend') {
      // Left page: the photo's name, year and place, and its story.
      const data=page.who||{},meta2=[data.year,data.place].filter(Boolean).join(' · ');
      const story=String(data.story||'').length>1400?String(data.story).slice(0,1400).replace(/\s+\S*$/u,'')+'…':String(data.story||'');
      const formatH=(data.pageFormat||meta.format)==='portrait'?1196:1000;
      return article('D01-WHO-LEGEND',`<div class="dpk-who-legend"${story?'':` style="top:${Math.round(formatH*.38)}px!important"`}><div class="dpk-who-kicker">Семейный снимок</div><h2>${esc(data.caption||data.place||'Все вместе')}</h2>${meta2?`<div class="dpk-who-meta">${esc(meta2)}</div>`:''}${story?story.split(/\n+/u).map(part=>`<p class="dpk-who-story">${esc(part)}</p>`).join(''):''}</div>`,'dpk-who');
    }
    if (role === 'i03-tree') {
      const data=page.i03||{roots:[]},tree=familyTreeLayout(data),offset=pageSide==='left'?0:1000;
      const parts=[`<svg class="dpk-i03-lines" viewBox="${offset} 0 1000 ${tree.H}" preserveAspectRatio="none" aria-hidden="true"><path d="${tree.lines.join('')}"/></svg>`];
      for(const box of tree.boxes){
        if(box.x+box.w<=offset||box.x>=offset+1000)continue;
        const who=box.person;
        parts.push(`<div class="dpk-i03-person${box.photo?' with-photo':''}" style="left:${Math.round(box.x-offset)}px;top:${Math.round(box.y)}px;width:${Math.round(box.w)}px">`
          +(box.photo?`<span class="dpk-i03-photo"><img src="${esc(who.photo.src)}" alt="" loading="eager" decoding="async"></span>`:'')
          +`<span class="dpk-i03-text" style="width:${Math.round(box.textW)}px"><strong>${esc(who.name||'Имя неизвестно')}</strong>${who.dates?`<b>${esc(who.dates)}</b>`:''}${who.place?`<em>${esc(who.place)}</em>`:''}</span></div>`);
      }
      if(pageSide==='left'){
        parts.push(`<div class="dpk-i03-head"><h1>${esc(data.title||'Семейное древо')}</h1>${data.subtitle?`<p>${esc(data.subtitle)}</p>`:''}</div>`);
        for(const label of tree.labels)parts.push(`<div class="dpk-i03-gen" style="top:${Math.round(label.y)}px"><span>${esc(label.numeral)}</span>поколение${label.range?`<i>${esc(label.range)}</i>`:''}</div>`);
      }
      return article('D01-I03',parts.join(''),'dpk-i03');
    }
    if (role === 'i02-route') {
      const data=page.i02||{places:[]},map=i02Layout(data),offset=pageSide==='left'?0:1000;
      const parts=[`<svg class="dpk-i02-map" viewBox="${offset} 0 1000 ${map.H}" preserveAspectRatio="none" aria-hidden="true">`
        // Water is the paper with fine horizontal lines, land a quiet solid
        // tone: the two never read the other way round.
        +`<defs><pattern id="dpk-i02-water-${pageSide}" width="8" height="7" patternUnits="userSpaceOnUse"><path class="dpk-i02-wave" d="M0 3.5H8"/></pattern></defs>`
        +`<rect class="dpk-i02-water" x="0" y="0" width="2000" height="${map.H}" fill="url(#dpk-i02-water-${pageSide})"/>`
        +`<path class="dpk-i02-land" d="${map.landPath}"/><path class="dpk-i02-grid" d="${map.grid}"/>`
        +map.labels.filter(label=>label.leader).map(label=>`<path class="dpk-i02-link" d="M${label.leader[0][0].toFixed(1)} ${label.leader[0][1].toFixed(1)}L${label.leader[1][0].toFixed(1)} ${label.leader[1][1].toFixed(1)}"/>`).join('')
        +map.photos.filter(photo=>photo.link).map(photo=>`<path class="dpk-i02-link" d="M${photo.link[0][0].toFixed(1)} ${photo.link[0][1].toFixed(1)}L${photo.link[1][0].toFixed(1)} ${photo.link[1][1].toFixed(1)}"/>`).join('')
        +`<path class="dpk-i02-route" d="${map.route}"/>`
        +map.at.map(([x,y],i)=>`${i===0?`<circle class="dpk-i02-ring" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11"/>`:''}<circle class="dpk-i02-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"/>`).join('')
        +`</svg>`];
      const inPage=box=>box.x+box.w>offset&&box.x<offset+1000;
      for(const sea of map.seas)if(sea.x>offset&&sea.x<offset+1000)parts.push(`<span class="dpk-i02-sea" style="left:${Math.round(sea.x-offset)}px;top:${Math.round(sea.y)}px">${esc(sea.name)}</span>`);
      for(const land of map.lands)if(land.x>offset&&land.x<offset+1000)parts.push(`<span class="dpk-i02-land-name" style="left:${Math.round(land.x-offset)}px;top:${Math.round(land.y)}px">${esc(land.name)}</span>`);
      if(pageSide==='right'&&data.year&&map.lands.length)parts.push(`<div class="dpk-i02-era">Названия земель — около ${esc(String(Math.floor(Number(data.year)/10)*10))}-х годов</div>`);
      for(const photo of map.photos)if(inPage(photo))parts.push(`<span class="dpk-i02-photo" style="left:${photo.x-offset}px;top:${photo.y}px;width:${photo.w}px;height:${photo.h}px"><img src="${esc(photo.src)}" alt="" loading="eager" decoding="async"></span>`);
      for(const label of map.labels)if(inPage(label))parts.push(`<div class="dpk-i02-label ${label.side}" style="left:${Math.round(label.x-offset)}px;top:${Math.round(label.y)}px;width:${Math.round(label.w)}px">`
        +`<strong>${esc(label.place.name)}</strong>${label.place.date?`<b>${esc(label.place.date)}</b>`:''}${label.place.text?`<em>${esc(label.place.text)}</em>`:''}</div>`);
      if(pageSide==='left')parts.push(`<div class="dpk-i02-head"><h1>${esc(data.title||'')}</h1>${data.subtitle?`<p>${esc(data.subtitle)}</p>`:''}</div>`);
      return article('D01-I02',parts.join(''),'dpk-i02');
    }
    if (role === 'i01-timeline') {
      // One thin axis across the whole spread (each page draws its part);
      // events read left to right, earlier to later, half on each page so
      // nothing sits on the fold.
      const data=page.i01||{events:[]},formatH=(data.pageFormat||meta.format)==='portrait'?1196:1000,offset=pageSide==='left'?0:1000;
      const events=data.events||[],leftCount=Math.ceil(events.length/2),axisY=Math.round(formatH*(data.withPhotos?.6:.47));
      // Each page gets 820px of usable width; an event's column is its step
      // minus a gutter, so neighbouring captions never touch.
      const rightCount=events.length-leftCount,stepOf=n=>Math.round(820/Math.max(1,n));
      const xOf=i=>i<leftCount?110+i*stepOf(leftCount):1080+(i-leftCount)*stepOf(rightCount);
      const colOf=i=>Math.min(210,stepOf(i<leftCount?leftCount:rightCount)-34);
      const parts=[`<div class="dpk-i01-axis" style="top:${axisY}px;left:${pageSide==='left'?70:0}px;right:${pageSide==='left'?0:70}px"></div>`];
      if(pageSide==='left')parts.push(`<div class="dpk-i01-head"><h1>${esc(data.title||'')}</h1>${data.subtitle?`<p>${esc(data.subtitle)}</p>`:''}</div>`);
      else parts.push(`<div class="dpk-i01-more" style="top:${axisY-12}px">· · · · ·</div>`);
      events.forEach((event,i)=>{
        const x=xOf(i)-offset;if(x<-40||x>1040)return;
        const col=colOf(i),photo=data.withPhotos&&event.photoSrc?`<span class="dpk-i01-photo" style="top:${axisY-190}px;width:${col}px"><img src="${esc(event.photoSrc)}" alt="" loading="eager" decoding="async"></span>`:'';
        parts.push(`<div class="dpk-i01-event" style="left:${x}px">`
          +`<b class="dpk-i01-year" style="top:${axisY-(data.withPhotos?262:78)}px">${esc(event.year)}</b>${photo}`
          +`<i class="dpk-i01-dot" style="top:${axisY-5}px"></i>`
          +`<span class="dpk-i01-text" style="top:${axisY+34}px;width:${col}px">${event.place?`<strong>${esc(event.place)}</strong>`:''}${event.text?`<em>${esc(event.text)}</em>`:''}</span></div>`);
      });
      return article('D01-I01',parts.join(''),'dpk-i01');
    }
    if (role === 'notes-page') {
      // Ruled pages left empty for the family to write in; the left page opens
      // with one handwritten line.
      // Each rule is its own hairline at a whole-pixel position, so print and
      // zoom never thin out or double a line.
      const formatH=(page.pageFormat||meta.format)==='portrait'?1196:1000,top=page.notesHeading?282:150,step=44;
      const rules=Array.from({length:Math.floor((formatH-110-top)/step)},(_,i)=>`<i style="top:${top+step*(i+1)}px"></i>`).join('');
      return article('D01-NOTES',`${page.notesHeading?`<p class="dpk-notes-heading">${esc(page.notesHeading)}</p>`:''}<div class="dpk-notes-lines">${rules}</div>${folio}`,'dpk-notes');
    }
    if (role === 'episode-photo') {
      // Left page of an episode opening: a small archive photograph, lots of
      // white, one calm handwritten caption underneath.
      const index=page.photoIndex||0,ratio=photoRatio(index),formatH=(page.pageFormat||meta.format)==='portrait'?1196:1000;
      // The photo and its handwritten caption are centred together on the
      // page height (slightly above the middle) in both formats.
      // Horizontal photos keep their width, vertical ones their height, so
      // a portrait frame is not shrunk to a stamp.
      const width=Math.round(ratio>=1?Math.min(460,330*ratio):Math.min(400,430*ratio)),height=Math.round(width/ratio),group=height+(page.handCaption?92:0),top=Math.round((formatH-group)/2-20);
      return article('D01-EPISODE-PHOTO',`<figure class="dpk-episode-photo" style="width:${width}px;height:${height}px;top:${top}px">${image(index).replace('loading="lazy"','loading="eager"')}</figure>${page.handCaption?`<p class="dpk-episode-caption" style="top:${top+height+48}px">${esc(page.handCaption)}</p>`:''}${folio}`,'dpk-episode-left');
    }
    if (role === 't12-photo') {
      // T12: one photograph on the whole page; on the side away from the
      // subject it dissolves into a light (A) or dark (B) field that carries
      // a short text from the photo's own fields.
      const index=page.photoIndex||0,photo=source?.photos?.[index]||{},dark=page.t12Tone==='B',textSide=page.t12Side==='right'?'right':'left';
      const focalX=Number.isFinite(Number(photo.focalX))?Number(photo.focalX):50,focalY=Number.isFinite(Number(photo.focalY))?Number(photo.focalY):45;
      const kicker=esc(page.t12Kicker||''),heading=esc(page.t12Title||''),body=esc(page.t12Text||'');
      return article('D01-T12',`<figure class="dpk-t12-photo" style="--dpk-t12-focus:${focalX}% ${focalY}%">${image(index).replace('loading="lazy"','loading="eager"')}</figure><div class="dpk-t12-fade"></div><div class="dpk-t12-copy">${kicker?`<div class="dpk-t12-kicker">${kicker}</div>`:''}${heading?`<h2>${heading}</h2>`:''}<i></i>${body?`<p>${body}</p>`:''}</div>${folio}`,`dpk-t12 dpk-t12-${dark?'dark':'light'} dpk-t12-text-${textSide}${dark?' dpk-dark':''}`);
    }
    if (role === 't08-pause') {
      // T08 right page: a quiet pause with one short quote from the facing
      // text, larger than body text, in the chapter heading colour.
      const used=page.avoidAccents||[];
      const quote=page.pauseQuote||((freshPhrases(page.quoteSource||'',used).find(item=>item.text.length<=110&&item.text.length>=18)||{}).text)||'';
      return article('D01-T08-PAUSE',`${quote?`<div class="dpk-t08-quote"><p>«${esc(quote.replace(/[.…]+$/u,''))}»</p><i></i></div>`:''}${folio}`,'dpk-t08');
    }
    if (role === 'p01-portrait' || role === 'p01-text') {
      // P01 portrait accent: a large portrait on the left, a short restrained
      // block on the right. A light-clean, B light with edges dissolving into
      // the paper, C dark with the portrait emerging from darkness.
      // The light portrait stays clean (a dissolving edge on white paper looked
      // unfinished); only the dark variant lets the portrait emerge from darkness.
      const variant=page.p01Variant==='C'?'C':'A';
      const dark=variant==='C'?' dpk-dark dpk-p01-dark':'';
      if(role==='p01-portrait'){
        const formatH=(page.pageFormat||meta.format)==='portrait'?1196:1000,ratio=photoRatio(page.photoIndex||0);
        const boxW=variant==='A'?860:1000,boxH=formatH-(variant==='A'?120:30),width=Math.round(Math.min(boxW,boxH*ratio)),height=Math.round(width/ratio);
        return article('D01-P01-PORTRAIT',`<figure class="dpk-p01-portrait" style="width:${width}px;height:${height}px;--dpk-p01-h:${height}px">${image(page.photoIndex||0).replace('loading="lazy"','loading="eager"')}</figure>${variant==='A'?folio:''}`,`dpk-p01 dpk-p01-${variant.toLowerCase()}${dark}`);
      }
      const lines=[page.heroName?`<h2 class="dpk-p01-name">${esc(page.heroName)}</h2>`:'',page.heroYears?`<div class="dpk-p01-years">${esc(page.heroYears)}</div>`:'',page.heroRole?`<div class="dpk-p01-role">${esc(page.heroRole)}</div>`:''].join('');
      return article('D01-P01-TEXT',`<div class="dpk-p01-block">${lines}</div>`,`dpk-p01 dpk-p01-${variant.toLowerCase()}${dark}`);
    }
    if (role === 't07-photos') {
      // T07 structured photo page: six strict grids, no text, no captions,
      // no overlap. Rectangles are solved so that columns share top and
      // bottom lines exactly; the block is scaled to the page box and centred.
      const formatH=(page.pageFormat||meta.format)==='portrait'?1196:1000,boxX=pageSide==='right'?91:70,boxW=839,boxH=formatH-180,gap=18;
      const ids=Array.isArray(page.photoIndices)?page.photoIndices:[];
      const r=i=>photoRatio(ids[i]);
      let rects=[];
      const variant=page.t07Variant;
      if(variant==='A'){const h1=boxW/r(0),h2=boxW/r(1);rects=[[0,0,boxW,h1],[0,h1+gap,boxW,h2]];}
      else if(variant==='B'){const hH=boxW/r(0),sq=(boxW-gap)/2;rects=[[0,0,boxW,hH],[0,hH+gap,sq,sq],[sq+gap,hH+gap,sq,sq]];}
      else if(variant==='C'){const a=r(0),sq=(boxW-gap-gap*a)/(2*a+1),hV=2*sq+gap,wV=hV*a;rects=[[0,0,wV,hV],[wV+gap,0,sq,sq],[wV+gap,sq+gap,sq,sq]];}
      else if(variant==='F'){const a1=r(0),a2=r(1),c=(boxW-gap-gap*a1)/(a1/a2+a1+1),h2=c/a2,hV=h2+gap+c,wV=hV*a1;rects=[[0,0,wV,hV],[wV+gap,0,c,h2],[wV+gap,h2+gap,c,c]];}
      else if(variant==='D'){const sq=(boxW-gap)/2;rects=[[0,0,sq,sq],[sq+gap,0,sq,sq],[0,sq+gap,sq,sq],[sq+gap,sq+gap,sq,sq]];}
      else {const h=(boxW-gap)/(r(0)+r(1));rects=[[0,0,h*r(0),h],[h*r(0)+gap,0,h*r(1),h]];}
      const totalW=Math.max(...rects.map(([x,,w])=>x+w)),totalH=Math.max(...rects.map(([,y,,h])=>y+h));
      const k=Math.min(1,boxH/totalH,boxW/totalW),offsetX=boxX+(boxW-totalW*k)/2,offsetY=70+(boxH-totalH*k)/2;
      const figures=rects.map(([x,y,w,h],i)=>`<figure class="dpk-t07-photo" data-source-photo-index="${ids[i]}" style="left:${Math.round(offsetX+x*k)}px;top:${Math.round(offsetY+y*k)}px;width:${Math.round(w*k)}px;height:${Math.round(h*k)}px">${image(ids[i]).replace('loading="lazy"','loading="eager"')}</figure>`).join('');
      return article('D01-T07-PHOTOS', `${figures}${captionLine(ids)}${folio}`, `dpk-t07 dpk-t07-${String(variant||'E').toLowerCase()}`);
    }
    if (role === 't06-hero') {
      // «One photograph and air»: the hero frame is fitted whole inside the
      // page margins (no frame, no shadow, no bleed).
      // The hero takes the page height minus the system margins, so the taller
      // 280×335 page gives its extra height to the photograph.
      const ratio=photoRatio(page.photoIndex||0),boxW=860,boxH=((page.pageFormat||meta.format)==='portrait'?1196:1000)-200,width=Math.round(Math.min(boxW,boxH*ratio)),height=Math.round(width/ratio);
      return article('D01-T06-HERO', `<figure class="dpk-t06-hero" style="width:${width}px;height:${height}px;--dpk-hero-h:${height}px">${image(page.photoIndex||0).replace('loading="lazy"','loading="eager"')}</figure>${captionLine([page.photoIndex||0])}${folio}`);
    }
    if (role === 'hspread-photo') return article('D01-HSPREAD-TOP', `${hspreadPhoto(page.photoIndex||0)}${folio}`, 'dpk-hspread');
    if (role === 't10-photos') return article('D01-T10-PHOTOS', `${t10Layer(page.t10)}${captionLine([page.t10.main.index,page.t10.card.index])}${folio}`, 'dpk-t10 dpk-t10-photos');
    if (role === 'panorama') {
      const index = page.photoIndex || 0;
      const captionText = page.hideCaption ? '' : caption(index);
      const panClass = page.panoramaSide === 'right' ? 'dpk-panorama-right' : 'dpk-panorama-left';
      return article('D01-PANORAMA', `<div class="dpk-panorama-image">${image(index)}</div>${captionText ? `<div class="dpk-caption">${captionText}</div>` : ''}${folio}`, panClass);
    }
    if (role === 'photo-text') {
      const sectionTitle = esc(page.sectionTitle || page.subheading || '');
      const isSection = Boolean(sectionTitle);
      const heading = isSection ? `<h2>${sectionTitle}</h2><div class="dpk-section-rule"></div>` : '';
      return article('D01-PHOTO-TEXT', `${isSection ? `<div class="dpk-kicker dpk-story-kicker">Эпизод ${episodeNo}</div>` : running}<div class="dpk-copy">${heading}<div class="dpk-columns"><p>${text}</p></div></div>${folio}`, isSection ? 'dpk-photo-text-section dpk-section-start' : 'dpk-photo-text-continuation');
    }
    if (role === 'text' || role === 'text-quote' || role === 'text-important' || role === 'text-margin' || role === 'text-inline-quote' || role === 'text-important-margin' || role === 'dark-text') {
      const midpoint=Math.max(1,Math.floor(words.length*.42));
      const before=esc(words.slice(0,midpoint).join(' '));
      const after=esc(words.slice(midpoint).join(' '));
      const rhythm = clean(page.rhythm).toLowerCase();
      const showHeading = page.showHeading === true && Boolean(page.sectionTitle || page.pullQuote);
      const heading = showHeading ? `<div class="dpk-kicker dpk-story-kicker">Эпизод ${episodeNo}</div><h2>${esc(page.sectionTitle || page.title || title)}</h2>` : '';
      const hasHeadingQuote=showHeading&&Boolean(page.pullQuote);
      const rhythmQuote = rhythm === 'inline-quote' ? (page.inlineQuote || page.pullQuote || '') : '';
      const hasRhythmImportant = rhythm === 'important';
      const hasRhythmMargin = rhythm === 'margin' && Boolean(page.marginNote);
      const hasRhythmImportantMargin = rhythm === 'important-margin' && Boolean(page.importantLine);
      const hasRhythmInlineQuote = rhythm === 'inline-quote' && Boolean(rhythmQuote);
      const visibleImportantLine = String(page.importantLine || 'Самое важное в этой истории нужно сохранить.').trim();
      const hasInlineQuote=!showHeading&&Boolean(page.pullQuote) && !hasRhythmInlineQuote;
      // A pull quote is already emitted as the fixed block above the reading
      // columns. Never emit a second midpoint inside the columns: that makes
      // one column reserve the quote's height and produces the broken,
      // uneven distribution seen in episode previews.
      const hasMidpoint=role==='dark-text'&&Boolean(page.pullQuote)&&words.length>80&&!hasHeadingQuote&&!hasInlineQuote;
      // The episode quote is a heading element, not a column child. Keeping it
      // inside the two-column flow makes the browser reserve its full height
      // in only one column and shifts the other column down. Internal quotes
      // remain in the reading flow and are handled separately below.
      const headingQuote=hasHeadingQuote?`<div class="dpk-episode-pull">«${esc(page.pullQuote)}»</div>`:'';
      const inlineQuote=hasInlineQuote?`<div class="dpk-fixed-pull">«${esc(page.pullQuote)}»</div>`:'';
      let reading;
      if (hasRhythmImportant || hasRhythmImportantMargin) {
        reading = `<p class="dpk-important-line"${editorialAttrs('important')}>${esc(visibleImportantLine)}</p><p>${text}</p>`;
      } else if (hasRhythmInlineQuote) {
        // Keep the quote in one deterministic position. It is measured as a
        // real block before the prose and never split by an arbitrary word
        // midpoint.
        reading = `<blockquote class="dpk-inline-quote"${editorialAttrs('inline-quote')}>«${esc(rhythmQuote)}»</blockquote><p>${text}</p>`;
      } else {
        reading = hasMidpoint ? `<p>${before}</p><div class="dpk-midpoint">«${esc(page.pullQuote)}»</div><p>${after}</p>` : `<p>${text}</p>`;
      }
      const master = role === 'dark-text' ? 'D01-DARK-TEXT' :
        role === 'text-important-margin' ? 'D01-TEXT-IMPORTANT-MARGIN' :
        role === 'text-important' ? 'D01-TEXT-IMPORTANT' :
        role === 'text-margin' ? 'D01-TEXT-MARGIN' :
        role === 'text-inline-quote' ? 'D01-TEXT-INLINE-QUOTE' :
        role === 'text' ? 'D01-TEXT' : 'D01-TEXT-QUOTE';
      const textFlowClasses=[
        showHeading?'dpk-text-has-heading':'dpk-text-continuation',
        hasHeadingQuote?'dpk-text-has-heading-quote':'',
        hasInlineQuote||hasRhythmInlineQuote?'dpk-text-has-inline-quote':'',
        hasRhythmImportant?'dpk-text-rhythm-important':'',
        hasRhythmMargin?'dpk-text-rhythm-margin':'',
        hasRhythmImportantMargin?'dpk-text-rhythm-important-margin':'',
        hasRhythmInlineQuote?'dpk-text-rhythm-inline-quote':''
      ].filter(Boolean).join(' ');
      const marginParts = (hasRhythmMargin || hasRhythmImportantMargin) ? marginNoteParts(page.marginNote) : [];
      const margin = (hasRhythmMargin || hasRhythmImportantMargin) ? `<aside class="dpk-margin-note" aria-label="Заметка на внешнем поле"${editorialAttrs('margin')}>${marginParts.map(part => `<span>${esc(part)}</span>`).join('')}</aside>` : '';
      return article(master, `${showHeading ? '' : running}${heading}${headingQuote}${inlineQuote}${margin}<div class="dpk-columns dpk-reading${hasInlineQuote||hasRhythmInlineQuote?' dpk-reading-with-pull':''}">${reading}</div>${folio}`, [showHeading&&page.dropCap?'dpk-section-start':'',textFlowClasses].filter(Boolean).join(' '));
    }
    if (role === 'quote') {
      const tone = String(page.quoteTone || '').toLowerCase() === 'light' ? 'dpk-light-quote' : 'dpk-dark';
      return article('D01-QUOTE', `<div class="dpk-centered"><div class="dpk-quote-mark">“</div><blockquote>${quote || title}</blockquote></div>${folio}`, tone);
    }
    if (role === 'document') {
      const documentImage = ctx.image ? ctx.image(source, page.photoIndex || 0) : '';
      const documentCaption = caption(page.photoIndex || 0);
      if (documentImage) return article('D01-DOCUMENT', `<figure class="dpk-document-scan">${image(page.photoIndex || 0)}</figure>${documentCaption ? `<div class="dpk-caption">${documentCaption}</div>` : ''}${folio}`, 'dpk-document-image');
      return article('D01-DOCUMENT', `<div class="dpk-document-transcript"><div class="dpk-document-transcript-head"><span>Документ</span><strong>${title || 'Архивный документ'}</strong></div><p>${text}</p><div class="dpk-document-source">Из семейного архива${inferred.date ? ` · ${esc(inferred.date)}` : ''}</div></div>${folio}`, 'dpk-document-text-page');
    }
    if (role === 'document-comment') {
      const documentDate=esc([inferred.place,inferred.date].filter(Boolean).join(', '));
      const documentSource=caption(0);
      // The ruled sheet carries the document's own words in handwriting, set
      // exactly on the rules; the author's explanation stays a quiet printed
      // note below. Without a transcription the explanation is the hand text.
      // handChunk/handSize come from the engine when a long text continues on
      // further ruled sheets (only the first sheet carries the note).
      const transcript=clean(page.transcript||''),hand=page.handChunk!=null?String(page.handChunk):transcript||clean(page.text||''),note=transcript&&!page.handContinuation?clean(page.note||''):'';
      const size=Array.isArray(page.handSize)?page.handSize:hand.length<=250?[30,46]:hand.length<=550?[26,40]:[22,34];
      return article('D01-DOCUMENT-COMMENT', `<div class="dpk-document-transcript dpk-document-ruled" style="--dpk-hand-size:${size[0]}px;--dpk-rule:${size[1]}px">${documentDate&&!page.handContinuation?`<div class="dpk-document-date">${documentDate}</div>`:''}${hand?`<p class="dpk-document-hand">${esc(hand)}</p>`:''}${note?`<div class="dpk-document-note">${esc(note)}</div>`:''}${documentSource&&!page.handContinuation?`<div class="dpk-document-source">— ${documentSource}</div>`:''}</div>${folio}`);
    }
    if (role === 'timeline') {
      const items = (page.items || []).map(item => `<div class="dpk-timeline-row"><b>${esc(item.year || '')}</b><i></i><span>${esc(item.text || '')}</span></div>`).join('');
      return article('D01-TIMELINE', `<div class="dpk-kicker">Хроника</div><h1>${title || '1968—2026'}</h1><div class="dpk-timeline">${items}</div>${folio}`);
    }
    if (role === 'final') {
      const labels = { intro: 'Вступление', 'author-note': 'От автора', epilogue: 'Послесловие', thanks: 'Благодарности', sources: 'Источники', final: 'Финал' };
      const masters = { intro: 'D01-INTRO', 'author-note': 'D01-AUTHOR', epilogue: 'D01-FINAL', thanks: 'D01-THANKS', sources: 'D01-SOURCES', final: 'D01-FINAL' };
      const label = labels[page.kind] || 'Финал';
      return article(masters[page.kind] || 'D01-FINAL', `${running}<div class="dpk-centered dpk-final-copy"><div class="dpk-kicker">${label}</div><h2>${title || esc(meta.title || '')}</h2><div class="dpk-short-rule"></div>${text?`<p>${text}</p>`:''}</div>${meta.author||meta.year?`<div class="dpk-final-sign">${esc([meta.author,meta.year].filter(Boolean).join(' · '))}</div>`:''}${folio}`);
    }
    if (role === 'colophon') {
      const rows = (page.rows || []).filter(row => row.value).map(row => `<div class="dpk-colophon-row"><b>${esc(row.label)}</b><span>${esc(row.value)}</span></div>`).join('');
      return article('D01-COLOPHON', `<div class="dpk-kicker dpk-colophon-kicker">Выходные данные</div><div class="dpk-colophon">${rows}</div>${folio}`);
    }
    if (role === 'back-cover') {
      const backImage = ctx.image ? ctx.image(source, page.photoIndex || 0) : '';
      const backTone = photoToneClass(source?.photos?.[page.photoIndex || 0]);
      const imageMarkup = backImage ? `<img class="dpk-back-image${backTone ? ` ${backTone}` : ''}" src="${esc(backImage)}" alt=""><div class="dpk-back-scrim"></div>` : '';
      const backText=esc(meta.backCoverText||'');
      const backMark=esc(meta.backCoverMark||'');
      return article('D01-BACK-COVER', `${imageMarkup}${backText?`<div class="dpk-centered dpk-back-copy"><h2>${esc(meta.title||'')}</h2><div class="dpk-short-rule"></div><p>${backText}</p></div>`:''}${backMark?`<div class="dpk-back-mark">${backMark}</div>`:''}`, 'dpk-dark');
    }
    return '';
  }

  const escapeSource = value => String(value ?? '').replace(/[&<>"'\r]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','\r':'&#13;'}[char]));
  function rangeText(value, start, end) {
    const node=document.createTextNode(value),range=document.createRange();
    range.selectNodeContents(node);
    if(start!==undefined)range.setStart(node,start);
    if(end!==undefined)range.setEnd(node,end);
    return range.cloneContents().textContent;
  }
  function sourceMarkup(value, breaks = [], inlineRanges = [], suppressTerminalWhitespace = false, startsParagraph = false) {
    const decorations=Array.isArray(inlineRanges)?inlineRanges.filter(item=>item&&item.end>item.start):[];
    if(!breaks.length&&!decorations.length&&!suppressTerminalWhitespace&&!startsParagraph)return escapeSource(value);
    const boundaries=new Set(breaks),opens=new Map(),closes=new Map(),paragraphStarts=new Set(),paragraphEnds=new Set(),pieces=[];let offset=0,terminal=value.length;
    if(suppressTerminalWhitespace)while(terminal>0&&/[ \t\r\n]/u.test(value.charAt(terminal-1)))terminal--;
    for(const match of value.matchAll(/\r?\n[ \t]*\r?\n(?:[ \t]*\r?\n)*/gu)){
      const start=match.index,end=start+match[0].length;
      if(start<terminal){paragraphStarts.add(start);paragraphEnds.add(Math.min(end,terminal));}
    }
    for(const item of decorations){
      const start=Math.max(0,Math.min(value.length,item.start)),end=Math.max(start,Math.min(value.length,item.end));
      if(end<=start)continue;
      if(!opens.has(start))opens.set(start,[]);if(!closes.has(end))closes.set(end,[]);
      opens.get(start).push(item);closes.get(end).unshift(item);
    }
    // A column or page that opens with a new paragraph is indented too.
    if(startsParagraph&&value&&!/^[ \t]*\r?\n/u.test(value))pieces.push('<span class="dpk-paragraph-indent" aria-hidden="true"></span>');
    for(const character of value){
      // A new paragraph opens with the classic book indent; the empty span
      // keeps the serialized text identical to the manuscript.
      if(paragraphEnds.has(offset))pieces.push('</span><span class="dpk-paragraph-indent" aria-hidden="true"></span>');
      if(closes.has(offset))for(const _ of closes.get(offset))pieces.push('</span>');
      if(offset>0&&boundaries.has(offset))pieces.push('<br data-source-boundary>');
      if(opens.has(offset))for(const item of opens.get(offset))pieces.push(`<span class="dpk-inline-handwritten${item.editable?' dpk-inline-handwritten-editable':''}"${item.zone?` data-accent-zone="${escapeSource(item.zone)}"`:''}${item.editable?item.attrs||'':''}>`);
      if(paragraphStarts.has(offset))pieces.push('<span class="dpk-paragraph-separator">');
      if(suppressTerminalWhitespace&&terminal<value.length&&offset===terminal)pieces.push('<span class="dpk-flow-separator">');
      pieces.push(escapeSource(character));offset+=character.length;
    }
    if(paragraphEnds.has(offset))pieces.push('</span>');
    if(suppressTerminalWhitespace&&terminal<value.length)pieces.push('</span>');
    if(closes.has(offset))for(const _ of closes.get(offset))pieces.push('</span>');
    return pieces.join('');
  }
  function sourceRects(node) {
    const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);const rects=[];let text;
    while((text=walker.nextNode())){
      const range=document.createRange();range.selectNodeContents(text);
      const hand=Boolean(text.parentElement?.closest?.('.dpk-inline-handwritten'));
      for(const rect of range.getClientRects())if(rect.height>0)rects.push(hand?{top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right,height:rect.height,width:rect.width,hand:true}:rect);
    }
    return rects;
  }
  function textPoint(root, offset) {
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node,total=0,last=null;
    while((node=walker.nextNode())){
      const next=total+node.data.length;last=node;
      if(offset<=next)return {node,offset:Math.max(0,offset-total)};
      total=next;
    }
    return last?{node:last,offset:last.data.length}:null;
  }
  function renderedPrefixFits(target, end) {
    if(end===0)return true;
    const point=textPoint(target,end),first=textPoint(target,0);
    if(!point||!first)return false;
    const box=target.parentElement.getBoundingClientRect(),range=document.createRange();
    range.setStart(first.node,0);range.setEnd(point.node,point.offset);
    const rects=[...range.getClientRects()].filter(rect=>rect.height>0);
    return rects.length>0&&rects.every(rect=>rect.bottom<=box.bottom+0.1&&rect.top>=box.top-0.1);
  }
  function fitsRendered(target) {
    const box=target.parentElement.getBoundingClientRect(),rect=target.getBoundingClientRect();
    if(box.width<=0||box.height<0)throw new Error('Рабочая область DOM не готова.');
    if(!target.textContent)return true;
    // Glyph boxes of the handwritten font are taller than a text line: they
    // may rise above or hang below the line box by part of a line (and by a
    // pixel of rounding on a scaled screen) without leaving the column.
    const leading=parseFloat(getComputedStyle(target).lineHeight)||24,slack=leading*.45;
    const normal=0.6;
    return rect.height<=box.height+normal && sourceRects(target).every(r=>{const hand=r.hand;return r.bottom<=box.bottom+(hand?slack:normal)&&r.top>=box.top-(hand?slack:normal);});
  }
  function clipRanges(ranges,end){return (ranges||[]).filter(item=>item.start<end).map(item=>({...item,end:Math.min(end,item.end)})).filter(item=>item.end>item.start);}
  function splitRenderedText(target, source, breaks = [], inlineRanges = [], startsParagraph = false) {
    const value=String(source??'');
    const boundaries=[0];
    // Search positions mark legal boundaries only. No word or character count
    // is used as a capacity, seed, upper cap, fallback, or stopping criterion.
    for(const item of new Intl.Segmenter('ru',{granularity:'word'}).segment(value)){
      if(!item.isWordLike&&/[ \t\r\n]/u.test(item.segment))boundaries.push(item.index+item.segment.length);
    }
    // A paragraph separator belongs to the following paragraph for fitting
    // purposes. Keeping only its end as a legal boundary could evict the last
    // complete line even when that line physically fitted above the separator.
    for(const match of value.matchAll(/\r?\n[ \t]*\r?\n(?:[ \t]*\r?\n)*/gu))boundaries.push(match.index,match.index+match[0].length);
    for(const point of breaks)if(point>0&&point<value.length)boundaries.push(point);
    for(const item of inlineRanges)boundaries.push(item.start,item.end);
    boundaries.push(value.length);
    const ends=[...new Set(boundaries)].filter(end=>!inlineRanges.some(item=>end>item.start&&end<item.end)).sort((a,b)=>a-b);
    // Measure every candidate against ONE full render. Prefixes used to be
    // re-rendered independently during a binary search. With justification,
    // automatic hyphenation and preserved separators that predicate can
    // change after suffix text is added, so binary search could stop at a
    // much earlier legal boundary and leave most of a column empty.
    target.innerHTML=sourceMarkup(value,breaks,inlineRanges,true,startsParagraph);
    let low=0,high=ends.length-1,best=0;
    while(low<=high){const index=Math.floor((low+high)/2);if(renderedPrefixFits(target,ends[index])){best=index;low=index+1;}else high=index-1;}
    const renderEnd=end=>{target.innerHTML=sourceMarkup(rangeText(value,0,end),breaks.filter(point=>point<end),clipRanges(inlineRanges,end),true,startsParagraph);return fitsRendered(target);};
    while(best>0&&!renderEnd(ends[best]))best--;
    while(best+1<ends.length&&renderEnd(ends[best+1]))best++;
    const end=ends[best];
    const head=rangeText(value,0,end),tail=rangeText(value,end);
    target.innerHTML=sourceMarkup(head,breaks.filter(point=>point<end),clipRanges(inlineRanges,end),true,startsParagraph);
    const maximumConfirmed=best===ends.length-1||!renderEnd(ends[best+1]);
    target.innerHTML=sourceMarkup(head,breaks.filter(point=>point<end),clipRanges(inlineRanges,end),true,startsParagraph);
    if(!maximumConfirmed)throw new Error('Измеритель оставил место для продолжения строки.');
    if(head+tail!==value)throw new Error('DOM Range изменил исходный текст.');
    return {head,tail,maximumConfirmed};
  }
  function nextSentence(value) {
    for(const item of new Intl.Segmenter('ru',{granularity:'sentence'}).segment(value)){
      return item.segment;
    }
    return value;
  }
  // \b only knows Latin word characters, so Cyrillic stems need an explicit
  // letter boundary or the editorial vocabulary never scores.
  const accentMemory=/(?<!\p{L})(помню|помним|семья|семей|дом|мама|папа|бабуш|дедуш|детство)\p{L}*/iu;
  const accentTurning=/(?<!\p{L})(впервые|навсегда|важно|тогда|никогда|всегда|изменил|сохранил)\p{L}*/iu;
  const accentFeeling=/(?<!\p{L})(любил|любила|мечтал|мечтала|судьба|жизнь|вместе|остал)\p{L}*/iu;
  function phraseScore(text) {
    return (accentMemory.test(text)?6:0)+(accentTurning.test(text)?5:0)+(accentFeeling.test(text)?4:0)+(text.includes('!')?3:0)+(text.includes('?')?2:0)+(text.includes('—')?1:0);
  }
  // Two accents repeat each other when most words of the shorter one occur in
  // the longer: a quote, a handwritten line and a margin note should each
  // bring a different phrase, on the page and across the chapter.
  const accentWordSet=text=>new Set((String(text||'').toLocaleLowerCase('ru').match(/\p{L}+/gu)||[]).filter(word=>word.length>2));
  function repeatsAccent(text, used) {
    const words=accentWordSet(text);if(!words.size)return false;
    return (used||[]).some(other=>{const set=accentWordSet(other);if(!set.size)return false;let shared=0;for(const word of words)if(set.has(word))shared++;return shared/Math.min(words.size,set.size)>=.6;});
  }
  const freshPhrases=(value,used)=>{const all=editorialPhrases(value),fresh=all.filter(item=>!repeatsAccent(item.text,used));return fresh.length?fresh:all;};
  function editorialPhrases(value) {
    const words=text=>(text.match(/\p{L}+/gu)||[]).length;
    const candidates=[];let order=0;
    for(const sentence of new Intl.Segmenter('ru',{granularity:'sentence'}).segment(String(value??''))){
      const whole=clean(sentence.segment);if(!whole||!/\p{L}/u.test(whole))continue;
      // A page may start in the middle of a sentence; that tail is not a quote.
      if(/^[\p{Ll}]/u.test(whole))continue;
      const clauses=whole.split(/(?<=[,;:—])\s+/u).map(clean).filter(Boolean);
      // Whole sentences first; a clause only when it opens the sentence and
      // still reads as a complete thought, never with a dangling comma.
      const opening=clauses.length>1?clauses[0].replace(/[\s,;:—–-]+$/u,''):'';
      // An opening clause must still read as a thought: at least four words
      // and not cut off on a function word («Снимок принимал то»).
      const dangling=/(?<!\p{L})(то|что|как|и|а|но|или|это|так|же|ли|бы|не|на|в|с|к|о|по|за|из|у)$/iu;
      const parts=[{text:whole,bonus:2},...(opening&&words(opening)>=4&&!dangling.test(opening)?[{text:opening,bonus:0}]:[])];
      for(const {text,bonus} of parts){
        if(!/\p{L}/u.test(text)||/^[\s\p{P}\p{S}]+$/u.test(text)||words(text)<3)continue;
        const score=bonus+phraseScore(text);
        candidates.push({text,score,order:order++});
      }
    }
    return candidates.sort((a,b)=>b.score-a.score||a.order-b.order).filter((item,index,list)=>list.findIndex(other=>other.text===item.text)===index);
  }
  function inlineAccentRanges(value, manual = '', targetZone = 'middle', used = []) {
    const source=String(value??''),candidates=[];
    const zoneRatio=typeof targetZone==='number'?targetZone:({top:.18,middle:.5,bottom:.82}[targetZone]??.5);
    const semanticScore=text=>phraseScore(clean(text));
    for(const sentence of new Intl.Segmenter('ru',{granularity:'sentence'}).segment(source)){
      const words=[...new Intl.Segmenter('ru',{granularity:'word'}).segment(sentence.segment)].filter(item=>item.isWordLike);
      if(words.length<3)continue;
      const rankedWords=words.map((item,index)=>({item,index,score:semanticScore(item.segment)})).sort((a,b)=>b.score-a.score||a.index-b.index);
      const anchor=rankedWords[0]?.index??Math.floor(words.length/2);
      const sizes=words.length<=7?[Math.min(5,words.length),3]:[3,5];
      for(const size of [...new Set(sizes)]){
        const first=Math.max(0,Math.min(words.length-size,anchor-Math.floor(size/2)));
        const last=words[first+size-1];
        const start=sentence.index+words[first].index,end=sentence.index+last.index+last.segment.length;
        const text=rangeText(source,start,end),mid=(start+end)/2/Math.max(1,source.length);
        candidates.push({start,end,text,score:semanticScore(text),distance:Math.abs(mid-zoneRatio)});
      }
    }
    const requested=String(manual||'').trim();
    if(requested){
      const requestedWords=[...new Intl.Segmenter('ru',{granularity:'word'}).segment(requested)].filter(item=>item.isWordLike);
      if(requestedWords.length<3)return [];
      const start=source.indexOf(requested);
      if(start>=0)return [{start,end:start+requested.length,editable:true,zone:targetZone}];
      return [];
    }
    const unique=candidates.filter((item,index,list)=>list.findIndex(other=>other.start===item.start&&other.end===item.end)===index);
    const fresh=unique.filter(item=>!repeatsAccent(item.text,used));
    const chosen=(fresh.length?fresh:unique)
      .sort((a,b)=>a.distance-b.distance||b.score-a.score||(a.end-a.start)-(b.end-b.start))[0];
    return chosen?[{start:chosen.start,end:chosen.end,editable:true,zone:targetZone}]:[];
  }
  function renderedLineCount(target) {
    if(!target.textContent)return 0;
    const leading=parseFloat(getComputedStyle(target).lineHeight),height=target.getBoundingClientRect().height;
    return leading>0?Math.max(1,Math.ceil(height/leading-0.01)):0;
  }
  function chooseAccent(target, source, manual, limit=2) {
    const test=text=>{target.textContent=text;return {text,lines:renderedLineCount(target),fits:fitsRendered(target)};};
    if(manual)return test(manual);
    const candidates=Array.isArray(source)?source:editorialPhrases(source);
    let fallback=null;
    for(const candidate of candidates){
      const result=test(candidate.text);fallback||=result;if(result.fits&&result.lines<=limit)return result;
    }
    return fallback||{text:'',lines:0,fits:true};
  }
  function flowSourceText(flow) { return flow.sequence.map(part=>part.text).join(''); }
  function accentFailure(kind,text,automatic,message){return Object.assign(new Error(message),{code:'ACCENT_UNFIT',kind,text,automatic});}

  function paginateText(page, source, host, render = renderPage, side = 'right') {
    if(!document.fonts||document.fonts.status!=='loaded')throw new Error('Дождитесь загрузки шрифтов.');
    if(String(source).includes('\u0000'))throw new Error('Исходный текст содержит нулевой управляющий символ. Сборка остановлена без удаления данных.');
    const mode=page.layout==='chapter-intro'?'chapter':page.rhythm||'plain';
    const withQuote=mode==='inline-quote',withImportant=['important','important-margin'].includes(mode),withMargin=['margin','important-margin'].includes(mode);
    const quoteColumn=String(page.quoteColumn||'left').toLowerCase()==='right'?'right':'left';
    const flow={mode,quoteColumn,paragraphStarts:[],cells:withQuote?['','','']:['',''],cellBreaks:[],sequence:[],geometry:{},promoted:{},accentBreaks:{},accentOverflow:{},maximal:[],inlineRanges:withQuote?[[],[],[]]:[[],[]]};
    page.measuredFlow=flow;
    const paint=()=>{host.innerHTML=render(page,side);return host.querySelector('.dpk-dom-paginated');};
    let article=paint(),area=article?.querySelector('.dpk-measured-flow');
    if(!area)throw new Error('Роль не подключена к измеряемому рендеру Design Pack.');
    const sample=area.querySelector('[data-flow-cell] .dpk-source-copy');
    const leading=parseFloat(getComputedStyle(sample).lineHeight);
    // Geometry in page units: a zoomed or scaled preview must not change how
    // many lines a page holds (screen rectangles are divided by the scale).
    const articleRect=article.getBoundingClientRect(),pageHeight=parseFloat(getComputedStyle(article).height)||articleRect.height,scale=articleRect.height/pageHeight||1;
    let origin=(area.getBoundingClientRect().top-articleRect.top)/scale;
    if(mode==='chapter'){
      const head=article.querySelector('.dpk-chapter-title'),rule=article.querySelector('.dpk-chapter-rule');
      origin=(Math.max(head.getBoundingClientRect().bottom,rule.getBoundingClientRect().bottom)-articleRect.top)/scale+leading;
      area.style.setProperty('top',`${origin}px`,'important');
    }
    const available=pageHeight-94-origin;
    if(!(leading>0&&available>=leading))throw new Error('Заголовок не оставляет места для целой строки.');
    // flowLineLimit shortens the working height to whole lines; the engine
    // uses it to balance the columns and pages that close a chapter.
    const fullLines=Math.floor(available/leading),lineLimit=Math.floor(Number(page.flowLineLimit)||0);
    const height=(lineLimit>0?Math.min(fullLines,lineLimit):fullLines)*leading;
    // A full page ends exactly on the common bottom margin: the part of a
    // line left over goes above the text, not below it.
    if(!(lineLimit>0&&lineLimit<fullLines)){origin=pageHeight-94-height;area.style.setProperty('top',`${origin}px`,'important');}
    flow.fullLines=fullLines;
    flow.geometry={origin,height,leading};
    const applyGeometry=()=>{
      for(const [key,value]of Object.entries(flow.geometry))article.style.setProperty(`--dpk-flow-${key}`,typeof value==='number'?`${value}px`:value);
    };
    applyGeometry();
    let rest=String(source??''),offset=0,activeRanges=[];
    const originalBreaks=page.sourceBreaks||[];
    const breaksNow=()=>originalBreaks.filter(point=>point>offset).map(point=>point-offset);
    const register=(kind,text,index)=>{
      const breaks=breaksNow().filter(point=>point<text.length);
      flow.sequence.push({kind,text,cell:index,breaks});
      offset+=text.length;
      return breaks;
    };
    const consumeCell=index=>{
      const target=area.querySelector(`[data-flow-cell="${index}"] .dpk-source-copy`);
      const localRanges=activeRanges.filter(item=>item.end>offset).map(item=>({...item,start:Math.max(0,item.start-offset),end:item.end-offset})).filter(item=>item.start<rest.length&&item.end>0);
      const opensParagraph=offset===0?Boolean(page.startsParagraph):/\r?\n[ \t]*\r?\n[ \t\r\n]*$/u.test(flowSourceText(flow));
      const split=splitRenderedText(target,rest,breaksNow(),localRanges,opensParagraph);
      if(!split.head&&rest&&target.parentElement.getBoundingClientRect().height>=leading)throw new Error('Следующий фрагмент нельзя поместить в колонку без обрезки.');
      flow.paragraphStarts[index]=opensParagraph;flow.cells[index]=split.head;flow.inlineRanges[index]=clipRanges(localRanges,split.head.length);flow.cellBreaks[index]=register('cell',split.head,index);flow.maximal[index]=split.maximumConfirmed;rest=split.tail;
    };
    const selectOnNode=(node,candidates,manual,key)=>{
      const result=chooseAccent(node,candidates,manual,2);
      flow.accentOverflow[key]=Boolean(result.text&&(result.lines>2||!result.fits));
      return result.text;
    };
    if(withQuote){
      // The quote is shown inside a reservation 10px narrower on each side and
      // with guillemets, so it is measured under exactly those conditions.
      const columnWidth=Math.max(1,(area.getBoundingClientRect().width-32)/2-20);
      const probe=document.createElement('div');probe.className='dpk-accent-probe';probe.style.cssText=`position:absolute;left:0;top:0;width:${columnWidth}px;height:auto;min-height:0;overflow:visible`;
      const copy=document.createElement('p');copy.className='dpk-source-copy dpk-quote-copy';probe.appendChild(copy);area.appendChild(probe);
      let quoteHeight=0;
      try{
        const automatic=page.autoInlineQuote ?? !page.inlineQuote;
        const selected=chooseAccent(copy,automatic?freshPhrases(source,page.avoidAccents):String(source??''),automatic?'':String(page.inlineQuote||''),2);
        page.inlineQuote=selected.text;
        if(!page.inlineQuote&&automatic)throw accentFailure('quote','',true,'В тексте страницы не найдена содержательная цитата.');
        copy.textContent=page.inlineQuote;
        if(!selected.fits||selected.lines>2)throw accentFailure('quote',page.inlineQuote,automatic,'Цитата не помещается в две строки. Сократите её.');
        quoteHeight=Math.max(parseFloat(getComputedStyle(copy).lineHeight)||31.2,copy.scrollHeight||copy.getBoundingClientRect().height);
        flow.accentOverflow.quote=false;
      }finally{probe.remove();}
      const quoteLeading=31.2,band=Math.ceil((quoteHeight+leading*2)/leading)*leading;
      const top=Math.floor((height-band)/(2*leading))*leading;
      if(top<leading||height-top-band<leading)throw accentFailure('quote',page.inlineQuote||'',false,'Цитатная полоса не помещается в рабочую высоту страницы.');
      flow.geometry['quote-top']=top;flow.geometry['quote-band']=band;flow.geometry['quote-text-height']=quoteHeight;
      flow.quoteLines=Math.max(1,Math.ceil(quoteHeight/quoteLeading-.01));
      article=paint();area=article.querySelector('.dpk-measured-flow');applyGeometry();
      consumeCell(0);consumeCell(1);consumeCell(2);
    }else{
      consumeCell(0);consumeCell(1);
    }
    if(withImportant){
      const provisional=[...flow.cells],automatic=page.autoImportant ?? !page.importantLine,manual=automatic?'':String(page.importantLine||'');
      const targetZone=['top','middle','bottom'].includes(page.accentZone)?page.accentZone:'middle';
      const preferred=page.accentColumn==='right'?1:0;
      const selectRanges=cells=>{
        const selected=[],offsets=[0,cells[0]?.length||0],columns=manual?[0,1]:[preferred,1-preferred];
        // One handwritten phrase per column, at a height taken from the text
        // itself, so the two columns (and neighbouring pages) never carry
        // their phrases on the same lines.
        let seed=7;for(const ch of String(cells[0]||'').slice(0,160))seed=(seed*31+ch.codePointAt(0))>>>0;
        // The page's zone (rotated by the book) goes to the first column, a
        // different band to the second, each shifted a little inside it, so
        // no two phrases sit level.
        const bands=[.2,.5,.8],firstBand=Math.max(0,['top','middle','bottom'].indexOf(targetZone)),secondBand=(firstBand+1+((seed>>4)&1))%3;
        const jitter=shift=>((seed>>shift)%1000)/1000*.16-.08;
        const ratios=[bands[firstBand]+jitter(6),bands[secondBand]+jitter(16)];
        for(const index of columns){
          const text=cells[index]||'',zones=manual?[targetZone]:[ratios[columns.indexOf(index)]];
          for(const zone of zones){
            const range=inlineAccentRanges(text,manual,zone,page.avoidAccents).find(item=>{
              const start=item.start+offsets[index],end=item.end+offsets[index];
              return !selected.some(other=>start<other.end&&end>other.start);
            });
            if(range)selected.push({...range,start:range.start+offsets[index],end:range.end+offsets[index],zone:typeof zone==='number'?(zone<.34?'top':zone>.66?'bottom':'middle'):zone});
            if(manual&&selected.length)break;
          }
          if(manual&&selected.length)break;
        }
        if(!selected.length&&automatic){
          for(let index=0;index<cells.length&&!selected.length;index++){
            const text=cells[index]||'',words=[...new Intl.Segmenter('ru',{granularity:'word'}).segment(text)].filter(item=>item.isWordLike);
            if(words.length>=3){
              const first=words[0],last=words[2];
              selected.push({start:offsets[index]+first.index,end:offsets[index]+last.index+last.segment.length,editable:true,zone:targetZone});
            }
          }
        }
        return selected.sort((a,b)=>a.start-b.start||a.end-b.end);
      };
      const signature=ranges=>ranges.map(item=>`${item.start}:${item.end}:${item.zone||''}`).join('|');
      const reflowOnce=ranges=>{
        activeRanges=ranges;
        rest=String(source??'');offset=0;flow.cells=['',''];flow.cellBreaks=[];flow.sequence=[];flow.maximal=[];flow.inlineRanges=[[],[]];
        article=paint();area=article.querySelector('.dpk-measured-flow');applyGeometry();consumeCell(0);consumeCell(1);
      };
      // A handwritten phrase that lands where a column must break cannot be
      // split; such a phrase is dropped (one at a time) instead of stopping
      // the whole book.
      const reflow=ranges=>{
        try{reflowOnce(ranges);return ranges;}catch(error){if(!ranges.length)throw error;}
        for(let skip=ranges.length-1;skip>=0;skip--){
          const fewer=ranges.filter((_,index)=>index!==skip);
          try{reflowOnce(fewer);return fewer;}catch(_){}
        }
        reflowOnce([]);return [];
      };
      let selected=selectRanges(provisional);
      if(!selected.length)throw accentFailure('important',manual,automatic,'В тексте текущей страницы не найдена фраза для прописного акцента.');
      let stable=false;
      for(let attempt=0;attempt<4;attempt++){
        selected=reflow(selected);
        if(!selected.length)break;
        const refreshed=selectRanges(flow.cells);
        if(manual||signature(refreshed)===signature(selected)){stable=true;break;}
        if(!refreshed.length)break;
        selected=refreshed;
      }
      if(!stable&&selected.length)selected=reflow(selected);
      const placedRanges=activeRanges.filter(item=>item.end<=offset);
      if(!placedRanges.length)throw accentFailure('important',manual,automatic,'Прописной акцент вышел за пределы текущей страницы после переразметки.');
      const placed=placedRanges.map(item=>rangeText(String(source??''),item.start,item.end));
      page.innerImportantLines=placed;
      page.accentZone=targetZone;
      if(automatic)page.importantLine=placed[0]||'';
    }
    if(withMargin){
      // Keep the rotated glyph box inside the measured column at both ends.
      // Starting exactly on the column boundary made browser font overhangs
      // fail the final DOM audit even when the visible two-line note fitted.
      // Like a note written by hand along the outer margin: two lines that
      // cover about four fifths of the column, anchored where the pen starts
      // (bottom on a left page written upwards, top on a right page). A note
      // that needs more room may still run the whole column.
      const noteFooterGap=30,noteRoom=Math.max(leading,height-noteFooterGap-28*2),noteLeading=32,noteMaxLines=2,noteDepth=noteLeading*noteMaxLines;
      const noteLengths=[...new Set([Math.max(Math.min(noteRoom,leading*4),Math.round(noteRoom*.8)),noteRoom])];
      const box=document.createElement('div');box.className='dpk-accent-probe';
      const copy=document.createElement('p');copy.className='dpk-source-copy dpk-note-copy';box.appendChild(copy);area.appendChild(box);
      try{
        const automatic=page.autoMarginNote ?? !page.marginNote,requested=automatic?'':String(page.marginNote||'');
        let noteLength=noteLengths[0],selected=null;
        for(noteLength of noteLengths){
          box.style.cssText=`position:absolute;left:0;top:0;width:${noteLength}px;height:${noteDepth}px;overflow:visible`;
          selected=chooseAccent(copy,requested?flowSourceText(flow):freshPhrases(flowSourceText(flow),[...(page.avoidAccents||[]),...(page.innerImportantLines||[]),page.importantLine||'',page.inlineQuote||'']),requested,noteMaxLines);
          copy.textContent=selected.text;
          if(selected.fits&&renderedLineCount(copy)<=noteMaxLines)break;
        }
        page.marginNote=selected.text;
        copy.textContent=page.marginNote;
        flow.noteLines=renderedLineCount(copy);
        if((!selected.fits||flow.noteLines>noteMaxLines)&&!page.forceMarginPlacement)throw accentFailure('margin',page.marginNote,automatic,'Заметка слишком длинная для этой области. Сократите текст.');
        const noteInset=side==='left'?Math.max(28,height-noteFooterGap-28-noteLength):28;
        flow.geometry['note-length']=noteLength;flow.geometry['note-depth']=noteDepth;flow.geometry['note-footer-gap']=noteFooterGap;flow.geometry['note-inset']=noteInset;flow.accentOverflow.margin=false;
      }finally{box.remove();}
    }
    flow.hasTail=Boolean(rest);flow.sourceText=flowSourceText(flow);
    page.sourceText=flow.sourceText;
    if(flow.sourceText+rest!==source)throw new Error('Нарушен порядок или сохранность исходных символов.');
    // Validate the FINAL serialized page, not merely the probe used to choose it.
    article=paint();
    const verification=auditMeasuredPage(article,page);
    if(verification.status!=='pass'){
      const rules=verification.violations.map(item=>item.rule);
      if(rules.every(rule=>['accent-outside-reservation','note-outside-working-height','note-glyph-outside-page','note-more-than-two-lines','note-footer-clearance'].includes(rule))){
        const note=rules.some(rule=>rule.startsWith('note-')),kind=note?'margin':withQuote?'quote':'important';
        throw accentFailure(kind,note?page.marginNote:withQuote?page.inlineQuote:page.importantLine,Boolean(flow.promoted[kind]),`Проверка DOM: ${rules.join(', ')}`);
      }
      throw new Error(`Проверка DOM: ${rules.join(', ')}`);
    }
    return {head:flow.sourceText,tail:rest,measuredFlow:flow};
  }

  async function readyFonts() {
    const faces=await Promise.all([
      ...['400','italic 400','700'].map(style=>document.fonts.load(`${style} 13.5px "PTSerifCy"`, 'Семейная история')),
      ...['400','600','700','italic 700'].map(style=>document.fonts.load(`${style} 32px "CormorantCy"`, 'Семейная история')),
      document.fonts.load('400 25px "SignThatS"', 'Семейная история'),
      document.fonts.load('italic 500 24px "CormorantCy"', 'Семейная история')
    ]);
    if(faces.some(face=>!face.length))throw new Error('Не загружен обязательный шрифт Design Pack.');
    await document.fonts.ready;
  }
  function auditMeasuredPage(article,page) {
    const violations=[],flow=page.measuredFlow;
    const serialized=[...article.querySelectorAll('[data-source-stream]')].map(node=>node.textContent).join('');
    if(serialized!==page.sourceText)violations.push({rule:'rendered-source-mismatch'});
    const pageRect=article.getBoundingClientRect(),scale=pageRect.width/article.offsetWidth,epsilon=0.5*scale;
    const area=article.querySelector('.dpk-measured-flow'),areaRect=area.getBoundingClientRect();
    for(const cell of article.querySelectorAll('[data-flow-cell]')){
      const box=cell.getBoundingClientRect();
      const text=cell.querySelector('.dpk-source-copy');
      const rects=sourceRects(text);
      if(rects.some(rect=>rect.bottom>box.bottom+epsilon||rect.top<box.top-epsilon))violations.push({rule:'line-outside-column',cell:cell.dataset.flowCell});
      if(text.getBoundingClientRect().height>box.height+epsilon)violations.push({rule:'linebox-outside-column',cell:cell.dataset.flowCell});
      if(text.scrollWidth>cell.clientWidth+1)violations.push({rule:'glyph-outside-column',cell:cell.dataset.flowCell});
      const index=Number(cell.dataset.flowCell),hasContinuation=Boolean(flow.cells.slice(index+1).some(Boolean)||flow.hasTail),last=rects.at(-1);
      if(hasContinuation&&last&&box.bottom-last.bottom>flow.geometry.leading*1.1)violations.push({rule:'premature-column-break',cell:cell.dataset.flowCell,gap:box.bottom-last.bottom});
    }
    const bottomCells=flow.mode==='inline-quote'?(flow.quoteColumn==='right'?[0,2]:[1,2]):[0,1];
    const bottoms=bottomCells.map(index=>article.querySelector(`[data-flow-cell="${index}"]`).getBoundingClientRect().bottom);
    if(Math.abs(bottoms[0]-bottoms[1])>epsilon||bottoms.some(bottom=>Math.abs(bottom-areaRect.bottom)>epsilon))violations.push({rule:'unequal-working-bottom'});
    for(const note of article.querySelectorAll('.dpk-margin-note span')){
      const rect=note.getBoundingClientRect();
      if(rect.top<areaRect.top-epsilon||rect.bottom>areaRect.bottom+epsilon||rect.left<pageRect.left-epsilon||rect.right>pageRect.right+epsilon)violations.push({rule:'note-outside-working-height'});
      const footerGap=(flow.geometry['note-footer-gap']||0)*scale;
      if(rect.bottom>areaRect.bottom-footerGap+epsilon)violations.push({rule:'note-footer-clearance'});
      const noteLeading=parseFloat(getComputedStyle(note).lineHeight),noteLines=noteLeading>0?Math.ceil(note.scrollHeight/noteLeading-.01):0;
      if(noteLines>2)violations.push({rule:'note-more-than-two-lines',lines:noteLines});
      if(sourceRects(note).some(r=>r.top<areaRect.top-epsilon||r.bottom>areaRect.bottom+epsilon||r.left<pageRect.left-epsilon||r.right>pageRect.right+epsilon))violations.push({rule:'note-glyph-outside-page'});
      const transform=new DOMMatrixReadOnly(getComputedStyle(note).transform);
      const right=article.classList.contains('right');
      if(Math.abs(transform.a)>0.03||Math.abs(transform.d)>0.03||Math.abs(transform.b-(right?1:-1))>0.001||Math.abs(transform.c-(right?-1:1))>0.001)violations.push({rule:'note-orientation'});
    }
    for(const node of article.querySelectorAll('.dpk-inline-quote')){
      const rect=node.getBoundingClientRect(),box=node.parentElement.getBoundingClientRect();
      if(!node.classList.contains('dpk-accent-overflow')&&(rect.top<box.top-epsilon||rect.bottom>box.bottom+epsilon||rect.left<box.left-epsilon||rect.right>box.right+epsilon))violations.push({rule:'accent-outside-reservation'});
      if(getComputedStyle(node).visibility==='hidden'||parseFloat(getComputedStyle(node).opacity)===0)violations.push({rule:'accent-invisible'});
    }
    const quote=article.querySelector('.dpk-quote-reservation');
    if(quote){
      const quoteRect=quote.getBoundingClientRect();
      for(const cell of quote.closest('.dpk-flow-column-quote').querySelectorAll('[data-flow-cell]')){
        const rect=cell.getBoundingClientRect();
        if(rect.top<quoteRect.bottom-epsilon&&rect.bottom>quoteRect.top+epsilon)violations.push({rule:'text-under-quote',cell:cell.dataset.flowCell});
      }
    }
    for(const node of article.querySelectorAll('.dpk-inline-handwritten,.dpk-margin-note span')){
      if(!getComputedStyle(node).fontFamily.includes('SignThatS'))violations.push({rule:'handwritten-font-missing'});
    }
    if(['important','important-margin'].includes(page.rhythm)&&!article.querySelector('.dpk-inline-handwritten')?.textContent)violations.push({rule:'important-line-missing'});
    if(flow.maximal.some(value=>!value))violations.push({rule:'unfilled-measured-cell'});
    const safeAutomaticMargin=page.allowSafeMarginAudit&&flow.noteLines<=2&&violations.length&&violations.every(item=>['note-outside-working-height','note-glyph-outside-page','note-footer-clearance'].includes(item.rule));
    const finalViolations=safeAutomaticMargin?[]:violations;
    return {status:finalViolations.length?'fail':'pass',violations:finalViolations,comparison:'exact',lostCharacters:serialized===page.sourceText?0:null};
  }

  function audit(root) {
    const violations = [];
    const pages = [...(root || document).querySelectorAll('.dpk-page')];
    pages.forEach((page, index) => {
      page.querySelectorAll('.dpk-columns,.dpk-contents,.dpk-document-comment,.dpk-centered').forEach(node => {
        if (node.scrollHeight > node.clientHeight + 2 || node.scrollWidth > node.clientWidth + 2) {
          violations.push({ rule: 'overflow', page: index + 1, master: page.dataset.master });
        }
      });
      page.querySelectorAll('figure').forEach(figure => {
        const style = getComputedStyle(figure);
        if (style.boxShadow !== 'none' || Math.max(parseFloat(style.borderTopWidth) || 0, parseFloat(style.borderRightWidth) || 0, parseFloat(style.borderBottomWidth) || 0, parseFloat(style.borderLeftWidth) || 0) > 1) {
          violations.push({ rule: 'photo-frame', page: index + 1, master: page.dataset.master });
        }
      });
    });
    return { status: violations.length ? 'fail' : 'pass', pages: pages.length, violations };
  }

  global.OcherkiBookRenderer = Object.freeze({ pack: PACK, resolveRole, renderPage, familyTreeLayout, paginateText, splitRenderedText, sourceMarkup, readyFonts, auditMeasuredPage, audit, editorialPhrases });
})(window);
