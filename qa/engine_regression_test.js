const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'book-renderer', 'book-engine.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(root, 'book-renderer', 'design-pack-01.js'), 'utf8'), context);
const engine = context.window.OcherkiBookEngine;
const renderer = context.window.OcherkiBookRenderer;

const sentence = 'Семейная история сохраняется в фотографиях, письмах и спокойных рассказах, которые переходят от одного поколения к другому.';
const prose = count => Array.from({ length: count }, (_, index) => `${sentence.slice(0, -1)} ${index + 1}.`).join(' ');
const photos = count => Array.from({ length: count }, (_, index) => ({
  src: `data:image/jpeg;base64,PHOTO_${index + 1}`,
  caption: `Фотография ${index + 1}`,
  year: String(1960 + index),
  place: 'Семейный архив',
  width: index === 0 || index === 5 ? 1800 : 900,
  height: index === 0 || index === 5 ? 900 : 1400,
  orientation: index === 0 || index === 5 ? 'landscape' : 'portrait',
  layoutPreference: index === 5 ? 'spread' : 'auto'
}));

const structure = { sections: [
  { id: 'cover', type: 'cover', included: true, pages: [{ uid: 'cover-1', type: 'cover', text: '', photos: [{ src: 'data:image/jpeg;base64,COVER' }] }] },
  { id: 'back-cover', type: 'back-cover', included: true, pages: [{ uid: 'back-cover-1', type: 'back-cover', text: '', photos: [{ src: 'data:image/jpeg;base64,BACK', caption: 'На обороте книги' }] }] },
  { id: 'title', type: 'title', included: true, pages: [{ uid: 'title-1', type: 'title', text: '', photos: [] }] },
  { id: 'contents', type: 'contents', included: true, pages: [{ uid: 'contents-1', type: 'contents', text: '', photos: [] }] },
  { id: 'intro', type: 'intro', title: 'Вступление', included: true, pages: [{ uid: 'intro-1', type: 'intro', title: 'Вступление', text: 'Эта книга сохраняет семейную память.', photos: [] }] },
  { id: 'author', type: 'author', title: 'От автора', included: true, pages: [{ uid: 'author-1', type: 'author', title: 'От автора', text: 'Я собрал эти истории для нашей семьи.', photos: [] }] },
  { id: 'chapter-1', type: 'chapter', title: 'Глава 1. Начало', included: true, pages: [
    { uid: 'chapter-1-a', type: 'chapter', title: 'Глава 1. Начало', episode: 'Эпизод 1. Первые воспоминания', text: prose(95), photos: photos(6).map((photo,index)=>Object.assign(photo,{layoutPreference:index===1?'triptych':photo.layoutPreference})), semanticHtml: '', userEdited:true, isEpisodeStart:true },
    { uid: 'chapter-1-b', type: 'chapter', title: 'Глава 1. Начало', episode: 'Эпизод 2. Дом и память', text: prose(80), quote: 'Память возвращает дому человеческий голос.', photos: [], semanticHtml: '<span class="semantic-inline semantic-quote">Память возвращает дому человеческий голос.</span>', userEdited:true, isEpisodeStart:true },
    { uid: 'chapter-1-doc', type: 'document', bookRole: 'document', title: 'Письмо из архива', text: '', explanation: 'Это письмо сохранилось в семейном архиве и объясняет маршрут семьи.', photos: [{src:'data:image/jpeg;base64,DOC',caption:'Письмо, 1968'}] },
    { uid: 'chapter-1-doc-text', type: 'document', bookRole: 'document', title: 'Запись из дневника', text: prose(32), explanation: 'Расшифровка рукописной записи.', photos: [] }
  ] },
  { id: 'afterword', type: 'afterword', title: 'Послесловие', included: true, pages: [{ uid: 'afterword-1', type: 'afterword', text: 'Память продолжается.', photos: [] }] },
  { id: 'thanks', type: 'thanks', title: 'Благодарности', included: true, pages: [{ uid: 'thanks-1', type: 'thanks', text: 'Спасибо всем участникам семейной хроники.', photos: [] }] },
  { id: 'sources', type: 'sources', title: 'Источники', included: true, pages: [{ uid: 'sources-1', type: 'sources', text: 'Семейный архив и устные воспоминания.', photos: [] }] },
  { id: 'colophon', type: 'colophon', included: true, pages: [{ uid: 'colophon-1', type: 'colophon', text: '', photos: [] }] }
] };

const result = engine.assemble(structure, { title: 'Очерки жизни', subtitle: 'История семьи', author: 'Автор', year: '2026' });
if (!result.ready) throw new Error(result.message || 'Book was not assembled');
const fail = (message) => { throw new Error(message); };
const cover = result.spreads[0];
if (!cover.single || cover.left || !cover.right?.source?.photos?.[0]?.src) fail('Cover is not a true single page with an independent photo');
if (!result.spreads.some(spread => spread.master === 'D01-SPREAD-DOCUMENT')) fail('Document spread is missing');
if (!result.spreads.some(spread => spread.master === 'D01-SPREAD-TEXT-QUOTE')) fail('Text-with-heading-and-quote spread is missing');
['intro','author-note','epilogue','thanks','sources'].forEach(kind => {
  if (!result.pages.some(page => page.kind === kind)) fail(`Mandatory section is missing: ${kind}`);
});
if (!result.spreads.some(spread => spread.master === 'D01-SPREAD-BACK-COVER' && spread.left?.source?.photos?.[0]?.src?.includes('BACK'))) fail('Back cover photo is missing');
const triptych = result.pages.find(page => page.master === 'D01-THREE-PHOTO');
if (!triptych || triptych.photoIndices?.length !== 3) fail('Three-photo master is missing');
const chapterHero = result.pages.find(page => page.master === 'D01-CHAPTER-PHOTO');
if (!chapterHero || chapterHero.source?.photos?.[chapterHero.photoIndex]?.orientation !== 'portrait') fail('Portrait-aware chapter hero selection is missing');
for (let index = 1; index < result.spreads.length; index += 1) {
  if (result.spreads[index].master === 'D01-SPREAD-PHOTO-TEXT' && result.spreads[index - 1].master === 'D01-SPREAD-PHOTO-TEXT') fail('Repeated photo-text rhythm');
}
const sectionStart = result.pages.find(page => page.sectionTitle === 'Дом и память');
if (!sectionStart || !sectionStart.showHeading || !sectionStart.dropCap || !sectionStart.pullQuote) fail('New episode semantics were lost');
if (result.pages.some(page => page.text && page.pullQuote && String(page.text).includes(String(page.pullQuote)))) fail('Manual quote was duplicated in body text');
const continuationWithDecoration = result.pages.find(page => !page.sectionTitle && (page.showHeading === true || page.dropCap || page.pullQuote));
if (continuationWithDecoration) fail('Continuation incorrectly has heading, drop cap or quote');
result.pages.forEach((page, index) => {
  if (page.pageNo !== index + 1) fail(`Broken folio sequence on page ${index + 1}`);
  if (page.text && !String(page.text).trim().split(/\s+/).length) fail(`Empty text chunk on page ${page.pageNo}`);
});
const narrativeOutput = result.pages.filter(page => page.sectionId === 'chapter-1')
  .flatMap(page => [page.text, page.pullQuote, page.quote]).filter(Boolean).join(' ');
const expectedNarrativeWords = [prose(95), prose(80)].join(' ').split(/\s+/).filter(Boolean).length;
if (narrativeOutput.split(/\s+/).filter(Boolean).length < expectedNarrativeWords) fail('Narrative words were lost during pagination');
for (let index = 1; index <= 95; index += 1) {
  const occurrences = narrativeOutput.match(new RegExp(`\\b${index}\\.`, 'g')) || [];
  const required = index <= 80 ? 2 : 1;
  if (occurrences.length < required) fail(`Narrative token ${index} was lost during word-level pagination`);
}
const audit = engine.audit(result);
if (audit.status !== 'pass') fail(`Engine audit failed: ${JSON.stringify(audit.violations)}`);
const renderContext = {
  meta: result.meta,
  image: (source, index) => source?.photos?.[index]?.src || '',
  caption: (source, index) => [source?.photos?.[index]?.caption, source?.photos?.[index]?.year, source?.photos?.[index]?.place].filter(Boolean).join(' · '),
  quoteFrom: () => '',
  inferMeta: () => ({})
};
const coverHtml = renderer.renderPage(cover.right, 'right', renderContext);
if (!/dpk-cover-image/.test(coverHtml)) fail('Cover renderer lost the independent photo');
const documentPage = result.pages.find(page => page.master === 'D01-DOCUMENT');
const commentPage = result.pages.find(page => page.master === 'D01-DOCUMENT-COMMENT');
if (!/data-master="D01-DOCUMENT"/.test(renderer.renderPage(documentPage, 'left', renderContext))) fail('Document master did not render');
if (!/data-master="D01-DOCUMENT-COMMENT"/.test(renderer.renderPage(commentPage, 'right', renderContext))) fail('Document comment master did not render');
const backCoverHtml = renderer.renderPage(result.pages.find(page => page.kind === 'back-cover'), 'left', renderContext);
if (!/dpk-back-image/.test(backCoverHtml)) fail('Back cover renderer lost the uploaded photo');
const triptychHtml = renderer.renderPage(triptych, 'left', renderContext);
if ((triptychHtml.match(/<figure/g) || []).length !== 3 || !/dpk-triptych/.test(triptychHtml)) fail('Three-photo layout did not render three photographs');
const textDocumentPage = result.pages.find(page => page.master === 'D01-DOCUMENT' && !(page.source?.photos || []).length);
const textDocumentHtml = renderer.renderPage(textDocumentPage, 'left', renderContext);
if (!/dpk-document-text-page/.test(textDocumentHtml) || !/dpk-document-transcript/.test(textDocumentHtml) || /dpk-document-body/.test(textDocumentHtml)) fail('Text-only document did not use the approved ruled transcription master');
const panoramaSpread = result.spreads.find(spread => spread.master === 'D01-SPREAD-PANORAMA');
if (!panoramaSpread || !/dpk-panorama-left/.test(renderer.renderPage(panoramaSpread.left, 'left', renderContext)) || !/dpk-panorama-right/.test(renderer.renderPage(panoramaSpread.right, 'right', renderContext))) fail('Panorama did not render as a two-page crop of one source');
const sectionHtml = renderer.renderPage(sectionStart, 'left', renderContext);
if (!/Эпизод 02/.test(sectionHtml) || !/Дом и память/.test(sectionHtml) || !/dpk-section-start/.test(sectionHtml)) fail('Section heading/drop cap renderer state is missing');
const continuation = result.pages.find(page => page.kind === 'text' && !page.sectionTitle && page.text);
const continuationHtml = renderer.renderPage(continuation, 'right', renderContext);
if (/dpk-story-kicker/.test(continuationHtml) || /dpk-pull/.test(continuationHtml)) fail('Continuation rendered a heading or quote');
const threePhotoStructure = JSON.parse(JSON.stringify(structure));
const threePhotoChapter = threePhotoStructure.sections.find(section => section.id === 'chapter-1');
threePhotoChapter.pages[0].photos = photos(3).map((item, index) => Object.assign(item, { layoutPreference: index === 0 ? 'triptych' : 'auto' }));
threePhotoChapter.pages[1].photos = [];
const threePhotoResult = engine.assemble(threePhotoStructure, { title: 'Три фотографии' });
if (!threePhotoResult.pages.some(page => page.master === 'D01-THREE-PHOTO')) fail('Exactly three uploaded photos did not produce D01-THREE-PHOTO');
console.log(JSON.stringify({ status: 'pass', pages: result.pages.length, spreads: result.spreads.length, masters: [...new Set(result.spreads.map(spread => spread.master))] }, null, 2));
