const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const constructorDir = path.resolve(__dirname, '..');
const outDir = path.resolve(process.argv[2] || path.join(__dirname, 'screenshots'));
fs.mkdirSync(outDir, { recursive: true });

function dataUri(name) {
  const p = path.join(__dirname, 'assets', name);
  return `data:image/jpeg;base64,${fs.readFileSync(p).toString('base64')}`;
}

const proseA = `В памяти семьи начало редко совпадает с календарной датой. Оно живёт в интонациях, в привычке оставлять свет в прихожей, в именах, произнесённых вполголоса. Старшие рассказывали о доме у воды, о долгих дорогах и о письмах, которые приходили не вовремя, но всегда сохранялись. Так частная история постепенно становилась общей. Фотографии не доказывали прошлое, а возвращали ему воздух: складку платья, движение руки, тень на стене, случайный взгляд человека, который ещё не знает, что этот миг переживёт его. Мы собираем эти подробности не ради точности архива. Нам важно услышать связь между поколениями и оставить следующему читателю пространство для собственного узнавания.`;
const proseB = `Свобода пришла не как событие, а как новый способ смотреть. В дороге менялись города, комнаты и лица, однако семейный ритм оставался узнаваемым. На столе появлялись те же чашки, в письмах повторялись те же обращения, а разговоры снова возвращались к дому. В тысяча девятьсот семьдесят первом году семья оказалась далеко от привычного берега. Каждый учился заново различать важное и случайное. Камера стала способом удержать время без лишних объяснений. Снимок принимал то, что текст иногда не мог назвать: усталость, надежду, достоинство, молчание. Из таких немых свидетельств и складывается хроника, в которой нет главных и второстепенных судеб.`;
const proseC = `Возвращение не отменяет расстояния. Оно соединяет места, годы и голоса, которые прежде существовали отдельно. В две тысячи первом году семейный архив снова открыли и начали разбирать по датам. Рядом легли письма, фотографии и короткие заметки на обороте. Оказалось, что память точнее всего работает не в больших выводах, а в повторяющихся деталях. Один и тот же жест переходил от матери к дочери, одно выражение звучало в разных поколениях, один маршрут становился дорогой домой. Последняя страница не ставит точку. Она только передаёт историю дальше.`;
const long = value => Array.from({ length: 5 }, () => value).join('\n\n');

const photos = {
  laundry: dataUri('photo_laundry.jpg'),
  man: dataUri('photo_man.jpg'),
  walk: dataUri('photo_walk.jpg'),
  window: dataUri('photo_window.jpg'),
  camera: dataUri('photo_camera.jpg'),
  portrait: dataUri('photo_portrait.jpg'),
  city: dataUri('photo_city.jpg'),
  double: dataUri('photo_double.jpg')
};

const photo = (src, caption, year, place, layoutPreference = 'auto', width = 900, height = 1300) => ({
  src, caption, year, place, layoutPreference, width, height,
  orientation: width > height ? 'landscape' : height > width ? 'portrait' : 'square',
  focalX: 50, focalY: 50
});
const front = (id, text = '', photos = []) => ({
  id, title: id, type: id, auto: true, included: true,
  pages: [{ uid: `${id}-1`, type: id, title: id, text, semanticHtml: '', userEdited: !!text, photos }]
});

const structure = {
  activeSection: 0,
  activePage: 0,
  sections: [
    front('cover', '', [photo(photos.laundry, '', '', '')]),
    front('endpaper'),
    front('title', 'Семейная хроника\n\nТри главы о памяти, свободе и возвращении\n\nАлександр Евстафиди'),
    front('dedication', 'Посвящается тем, кто научил нас помнить.\n\nС благодарностью семье'),
    front('epigraph', 'Память — это дом, в который можно вернуться из любого времени.\n\nИз семейной тетради'),
    front('contents'),
    front('intro', 'Эта книга собирает голоса, фотографии и документы семьи в одну спокойную хронику.'),
    front('author', 'Я оставляю здесь не окончательный ответ, а возможность продолжать семейный рассказ.'),
    {
      id: 'chapter-1', title: 'Глава 1. Начало', type: 'chapter', included: true,
      pages: [{ uid: 'ch1-p1', type: 'chapter', title: 'Глава 1. Начало', episode: 'Эпизод 1. Первые воспоминания', text: long(proseA), userEdited: true,
        semanticHtml: '<span class="semantic-inline semantic-quote">Дом запоминает нас раньше, чем мы успеваем запомнить его.</span>',
        photos: [photo(photos.city, 'Дорога к дому', '1971', '', 'spread', 1800, 900), photo(photos.man, 'На берегу, начало семейной истории', '1967', 'Побережье'), photo(photos.walk, 'Из семейного архива', '1969', ''), photo(photos.window, 'У окна старого дома', '1970', ''), photo(photos.portrait, 'Семейный портрет', '1970', '', 'triptych')] },
        { uid: 'ch1-p2', type: 'chapter', title: 'Глава 1. Начало', episode: 'Эпизод 2. Дом и память', text: long(proseC), userEdited: true,
          semanticHtml: '<span class="semantic-inline semantic-quote">Память точнее всего работает в повторяющихся деталях.</span>', photos: [] }]
    },
    {
      id: 'chapter-2', title: 'Глава 2. Свобода', type: 'chapter', included: true,
      pages: [
        { uid: 'ch2-p1', type: 'chapter', title: 'Глава 2. Свобода', episode: 'Часть вторая', text: long(proseB), userEdited: true,
          semanticHtml: '<span class="semantic-inline semantic-quote">Свобода начинается там, где память перестаёт быть молчанием.</span>',
          photos: [photo(photos.double, 'Новый город, новая оптика', '1971', 'Нью-Йорк'), photo(photos.laundry, 'Из семейного архива', '1971', '')] },
        { uid: 'ch2-doc', type: 'document', title: 'Письмо с реки', episode: 'Документ', text: '', explanation: 'Письмо сохранилось в семейном архиве и помогло восстановить маршрут семьи.', userEdited: true, bookRole: 'document', photos: [photo(photos.window, 'Письмо из семейного архива', '1971', '')] }
      ]
    },
    {
      id: 'chapter-3', title: 'Глава 3. Возвращение', type: 'chapter', included: true,
      pages: [{ uid: 'ch3-p1', type: 'chapter', title: 'Глава 3. Возвращение', episode: 'Часть третья', text: long(proseC), userEdited: true,
        semanticHtml: '<span class="semantic-inline semantic-quote">Возвращение — это не точка на карте, а способ снова услышать друг друга.</span>',
        photos: [photo(photos.camera, 'Камера семейного архива', '2001', 'Москва')] }]
    },
    front('afterword', 'Эта хроника остаётся открытой. Каждый новый рассказ уточняет её не датами, а живым присутствием.'),
    front('thanks', ''),
    front('sources', ''),
    front('colophon', 'Александр Евстафиди\n\nМастерская «Очерки жизни»\n\n2026\n\nМосква'),
    front('back-endpaper'),
    front('inside-back-cover'),
    front('back-cover', '', [photo(photos.portrait, 'Семейный архив', '', '')]),
    front('final')
  ]
};

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || chromium.executablePath() });
  const page = await browser.newPage({ viewport: { width: 2400, height: 1400 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(`file://${path.join(constructorDir, 'shell.html')}`, { waitUntil: 'load' });
  await page.waitForTimeout(700);
  await page.evaluate(({ structure }) => {
    window.postMessage({ type: 'OCHERKI_PROJECT_CONFIG', title: 'Семейная хроника', subtitle: 'Три главы о памяти, свободе и возвращении', author: 'Александр Евстафиди', year: '2026', design: 'editorial' }, '*');
    window.postMessage({ type: 'OCHERKI_STRUCTURE_STATE', payload: structure }, '*');
  }, { structure });
  await page.locator('[data-design="editorial"]').click();
  await page.locator('#buildBookBtn').click();
  await page.waitForFunction(() => document.querySelectorAll('.bd-spread-card').length > 0, null, { timeout: 10000 });
  await page.waitForTimeout(800);
  await page.locator('#previewBtn').click();
  await page.waitForSelector('#bookPreviewModal.open');
  await page.addStyleTag({ content: `
    #bookPreviewModal{background:#d9d6cf!important;align-items:flex-start!important;justify-content:flex-start!important;padding:0!important}
    #bookPreviewModal .book-preview-stage{position:static!important;width:2000px!important;height:1000px!important;min-width:2000px!important;min-height:1000px!important;max-width:none!important;max-height:none!important;padding:0!important;margin:0!important;transform:none!important;opacity:1!important;filter:none!important;background:transparent!important}
    #bookPreviewSpread{position:static!important;width:2000px!important;height:1000px!important;min-width:2000px!important;min-height:1000px!important;max-width:none!important;max-height:none!important;aspect-ratio:2/1!important;transform:none!important;margin:0!important}
    #bookPreviewSpread .book-preview-half{width:1000px!important;height:1000px!important;min-width:1000px!important;min-height:1000px!important}
    #bookPreviewClose,#bookPreviewPrev,#bookPreviewNext,#bookPreviewInfo{display:none!important}
  ` });
  await page.waitForTimeout(1300);

  const count = await page.locator('.bd-spread-card').count();
  const manifest = [];
  for (let i = 0; i < count; i++) {
    if (i > 0) {
      await page.evaluate(() => document.querySelector('#bookPreviewNext').click());
      await page.waitForTimeout(750);
    }
    const info = await page.locator('#bookPreviewInfo').textContent();
    const single = await page.locator('#bookPreviewSpread').evaluate(el => el.classList.contains('is-single'));
    await page.locator('#bookPreviewSpread').evaluate((el, isSingle) => {
      const width = isSingle ? '1000px' : '2000px';
      el.style.setProperty('width', width, 'important');
      el.style.setProperty('min-width', width, 'important');
      el.style.setProperty('max-width', width, 'important');
      el.style.setProperty('aspect-ratio', isSingle ? '1 / 1' : '2 / 1', 'important');
    }, single);
    const file = `spread-${String(i + 1).padStart(2, '0')}.png`;
    await page.locator('#bookPreviewSpread').screenshot({ path: path.join(outDir, file) });
    manifest.push({ index: i + 1, info, file });
  }
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify({ count, errors, manifest }, null, 2));
  await browser.close();
  console.log(JSON.stringify({ count, errors: errors.length, outDir }));
})();
