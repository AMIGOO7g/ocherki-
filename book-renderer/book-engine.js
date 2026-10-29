(function (global) {
  'use strict';

  const wordList = text => String(text || '').trim().split(/\s+/).filter(Boolean);
  const wordCount = text => wordList(text).length;
  const normalizeProse = value => String(value || '').replace(/\s+/g, ' ').replace(/([.!?…»”])(?=[А-ЯЁа-яё])/g, '$1 ').trim();
  const imageSource = photo => String(photo?.src || photo?.dataUrl || photo?.dataURL || photo?.url || photo?.preview || photo?.objectUrl || '').trim();
  const cleanTitle = (value, fallback = '') => String(value || '').replace(/^Глава\s+\d+[.:]?\s*/i, '').trim() || fallback;
  const norm = value => String(value || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('ru');
  // A sheet the editor created because the text ran past the bottom of the
  // previous one continues the same paragraph. Older projects can lose the
  // flag, so a sheet that ends mid-sentence and resumes in lower case is
  // treated the same way.
  const isContinuation = (previous, current, page) => page?.continuation === true || Boolean(page?.continuationOf)
    || (Boolean(previous && current) && !/[.!?…»”"]\s*$/u.test(previous) && /^\s*[\p{Ll},;:)—–-]/u.test(current));
  const continuationJoin = (previous, current, page) => {
    if (!previous || !current || /\s$/u.test(previous) || /^\s/u.test(current) || /^[,.;:!?…»”)]/u.test(current)) return '';
    return isContinuation(previous, current, page) ? String(page?.continuationJoin ?? ' ') : '\n\n';
  };
  function ctxHandwrittenFallback(photo, page, title) {
    const explicit=String(photo?.ctxHandwrittenNote||page?.ctxHandwrittenNote||page?.importantLine||page?.marginNote||'').trim();
    const source=explicit||String(photo?.caption||photo?.story||page?.episode||title||'Семейная память').trim();
    const sentence=source.match(/^[^.!?…]+[.!?…]?/u)?.[0]||source;
    const words=[...new Intl.Segmenter('ru',{granularity:'word'}).segment(sentence)].filter(item=>item.isWordLike).map(item=>item.segment);
    return (words.slice(0,Math.min(8,Math.max(1,words.length))).join(' ')||'Семейная память').trim();
  }
  const PAGE_WORDS = Object.freeze({
    chapter: 250,
    text: 760,
    textHeading: 610,
    textQuote: 590,
    textInlineQuote: 650,
    textInlineRhythm: 610,
    textImportant: 680,
    textImportantMargin: 650,
    textMargin: 760,
    photoText: 720,
    photoTextHeading: 570,
    quoteCompanion: 720,
    document: 400,
    documentComment: 320,
    photoOverText: 250,
    photoSideText: 300,
    stackedText: 230,
    bleedText: 230,
    darkSplit: 170,
    overlayText: 100,
    textOverPhoto: 210,
    darkText: 340,
    dateEra: 220
  });

  function pageWords(meta, key) {
    const measured = Number(meta?.pageWords?.[key]);
    return Number.isFinite(measured) && measured > 40 ? measured : PAGE_WORDS[key];
  }

  function photoAspect(photo) {
    const width = Number(photo?.width || photo?.naturalWidth || 0);
    const height = Number(photo?.height || photo?.naturalHeight || 0);
    if (width > 0 && height > 0) return width / height;
    const orientation = String(photo?.orientation || '').toLowerCase();
    if (orientation === 'landscape' || orientation === 'horizontal') return 1.6;
    if (orientation === 'portrait' || orientation === 'vertical') return 0.68;
    return 1;
  }

  // The editor stores the author's choice on layoutPreference. Automatic
  // choices are kept separately so the director can plan a readable rhythm
  // without overwriting the user's setting or making the UI appear changed.
  const preference = photo => String(
    photo?.layoutPreference && String(photo.layoutPreference).toLowerCase() !== 'auto'
      ? photo.layoutPreference
      : photo?._directorPreference || 'auto'
  ).toLowerCase();
  const isAuto = photo => String(photo?.layoutPreference || 'auto').toLowerCase() === 'auto' && !Boolean(photo?._directorPreference);
  const sameSourcePage = photos => photos.length > 0 && photos.every(photo =>
    (photo?._sourcePageUid || `page-${photo?._pageIndex}`) === (photos[0]?._sourcePageUid || `page-${photos[0]?._pageIndex}`));
  const isHeavySpread = master => ['D01-SPREAD-PANORAMA','D01-SPREAD-BLEED-TEXT','D01-SPREAD-PHOTO-RAIL','D01-SPREAD-THREE-PHOTO','D01-SPREAD-TWO-PHOTO','D01-SPREAD-DUO','D01-SPREAD-MOSAIC','D01-SPREAD-QUOTE-BAND','D01-SPREAD-PHOTO-OVER-TEXT-LARGE','D01-SPREAD-TEXT-OVER-PHOTO-LARGE','D01-SPREAD-PHOTO-GRADIENT-TEXT','D01-SPREAD-PHOTO-OVERLAY-TEXT','D01-SPREAD-TEXT-OVER-PHOTO','D01-SPREAD-DARK-TEXT-PAIR','D01-SPREAD-DARK-PHOTO-PAIR','D01-SPREAD-DARK-GRADIENT-PHOTO'].includes(master);
  const isDarkSpread = master => String(master || '').includes('DARK');
  const isDarkPauseBlocked = master => isDarkSpread(master) || isHeavySpread(master) || /(?:PHOTO|PANORAMA|BLEED|MOSAIC|STACKED|QUOTE)/.test(String(master || ''));
  const highResolution = photo => Number(photo?.width || 0) >= 1800 && Number(photo?.height || 0) >= 1400;
  const autoPanoramaCandidate = photo => isAuto(photo) && photoAspect(photo)>=1.35 && Number(photo?.width||0)>=1400 && Number(photo?.height||0)>=800;
  const heroEligible = photo => Boolean(photo) && !photo._triptychReserved && !photo._directorReserved && !autoPanoramaCandidate(photo) && !['spread','bleed-text','spread-pair','triptych','duo','stacked-text','mosaic','quote-band-pair','photo-top-text','text-top-photo','photo-side-text','photo-rail','photo-rail-right','photo-rail-left','photo-1p5-text','photo-gradient-text','dark-gradient-photo','dark-photo-pair','dark-split','photo-overlay-text','large-photo','photo-text','text-quote'].includes(preference(photo));

  // Automatic direction is deliberately planned once, before pagination.
  // The plan is a light rhythm, not a random palette: one suitable landscape
  // gets the missing 1.5-sheet rail, a portrait can carry a side text rail,
  // and only a later suitable image gets the dark-gradient pause. Explicit
  // card choices remain untouched.
  function planAutomaticPhotoCompositions(photos) {
    const candidates = (photos || []).filter(photo =>
      isAuto(photo) &&
      !photo._triptychReserved &&
      !photo._directorReserved &&
      Number(photo._sourceGroupSize || 1) === 1
    );
    const planned = [];
    if (!candidates.length) return planned;

    const aspect = photo => photoAspect(photo);
    const suitableRail = candidates.find(photo => aspect(photo) >= 1.35 && aspect(photo) < 1.60);
    const rail = suitableRail;
    const railIndex = rail ? candidates.indexOf(rail) : -1;
    const suitableDark = candidates.find((photo, index) =>
      index > railIndex && aspect(photo) >= 1.08 && aspect(photo) < 1.60 && Boolean(imageSource(photo))
    );
    const darkIndex = suitableDark ? candidates.indexOf(suitableDark) : -1;
    const assign = (photo, requested) => {
      if (!photo || photo._directorPreference) return;
      photo._directorPreference = requested;
      planned.push({ photo, preference: requested });
    };

    // This is the only automatic 1.5-sheet reservation. It is deliberately
    // based on the image ratio, so it cannot turn a portrait into a cropped
    // horizontal rail. The manual card option uses the same branch.
    if (rail && candidates.length >= 2) assign(rail, 'photo-1p5-text');

    // A dark spread needs a companion reading page and therefore appears only
    // when another image and enough material can follow it. The engine also
    // inserts a light text pause when the previous spread is heavy.
    if (candidates.length >= 2 && suitableDark && darkIndex > railIndex) {
      assign(suitableDark, 'dark-gradient-photo');
    }

    // Give the remaining images a restrained alternation. Do not assign every
    // image: unassigned photos still pass through the aspect-aware automatic
    // rules for panorama, paired, stacked and ordinary photo/text layouts.
    // Portraits and medium landscapes remain unassigned here on purpose: the
    // existing aspect-aware rules can still select dark-split, side-text,
    // photo-over-text or overlay at the correct text rhythm. Planning them
    // prematurely would suppress those choices by making isAuto() false.
    return planned;
  }

  function movePhotoToCursor(photos, cursor, predicate) {
    const found = photos.findIndex((photo, index) => index >= cursor && predicate(photo));
    if (found < 0 || found === cursor) return cursor;
    const [photo] = photos.splice(found, 1);
    photos.splice(cursor, 0, photo);
    return cursor;
  }

  function sentences(text) {
    const source = String(text || '').replace(/\s+/g, ' ').trim();
    if (!source) return [];
    return (source.match(/[^.!?…]+(?:[.!?…]+[»”"]?|$)/g) || [source]).map(item => item.trim()).filter(Boolean);
  }

  function takeSentences(text, maxWords) {
    const list = sentences(text);
    if (!list.length) return { head: '', tail: '' };
    const selected = [];
    let count = 0;
    while (list.length) {
      const next = list[0];
      const nextCount = wordCount(next);
      if (selected.length && count + nextCount > maxWords) break;
      selected.push(list.shift());
      count += nextCount;
      if (count >= maxWords) break;
    }
    return { head: selected.join(' '), tail: list.join(' ') };
  }

  // Editorial prose must flow like a word processor: if the next sentence
  // does not fit, keep the words that fit and continue the remainder on the
  // next page. Never discard or duplicate the unfinished tail.
  function takeWords(text, maxWords) {
    const list = wordList(text);
    const capacity = Math.max(1, Math.floor(Number(maxWords) || 1));
    if (list.length <= capacity) return { head: list.join(' '), tail: '' };
    return { head: list.slice(0, capacity).join(' '), tail: list.slice(capacity).join(' ') };
  }

  function splitIntoPages(text, maxWords) {
    const pages = [];
    let remaining = String(text || '').trim();
    const capacity = Math.max(40, Number(maxWords) || 40);
    while (remaining && pages.length < 80) {
      const count = wordCount(remaining);
      // Measured capacities already include a safety margin. Keep a small
      // remainder on the current page instead of creating a nearly empty page.
      const limit = count <= capacity * 1.18 ? Math.ceil(count) : capacity;
      const split = takeSentences(remaining, limit);
      if (!split.head) break;
      pages.push(split.head);
      remaining = split.tail;
    }
    return pages;
  }

  function explicitQuote(page) {
    const direct = String(page?.quote || page?.quoteText || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/[«»]/g, '').replace(/\s+/g, ' ').trim();
    if (direct) return direct;
    const html = String(page?.semanticHtml || '');
    const match = html.match(/(?:semantic-quote|data-semantic-type=["']quote["'])[^>]*>(.*?)<\/span>/i);
    return String(match?.[1] || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
  }

  function stripQuote(text, quote) {
    const source = String(text || '').trim();
    const q = String(quote || '').replace(/[«»]/g, '').replace(/\s+/g, ' ').trim();
    if (!source || !q) return source;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');
    // Remove only the selected occurrence. A repeated sentence is valid prose;
    // using a global expression here silently deleted every repeated copy and
    // made the following pages look empty.
    const withoutMarks = source.replace(new RegExp(`(?:«\\s*)?${escaped}(?:\\s*»)?`, 'iu'), ' ');
    return withoutMarks.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  }

  function stripSemanticDate(text,dateLabel){
    const source=String(text||'').trim();
    const date=String(dateLabel||'').trim();
    if(!source||!date)return source;
    const escaped=date.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return source.replace(new RegExp(`(^|\\s)${escaped}(?=\\s|$)`,'u'),' ').replace(/\s{2,}/g,' ').trim();
  }

  function quoteCandidate(text, used, seed = 0) {
    const candidates = sentences(text).filter(item => item.length >= 45 && item.length <= 190);
    if (!candidates.length) return '';
    const start = Math.abs(Number(seed) || 0) % candidates.length;
    for (let offset = 0; offset < candidates.length; offset += 1) {
      const candidate = candidates[(start + offset) % candidates.length];
      if (!used.has(norm(candidate))) return candidate;
    }
    return '';
  }

  function sentenceQuote(text, used, seed = 0) {
    const next = quoteCandidate(text, used, seed);
    if (next) used.add(norm(next));
    return next;
  }

  // T12 carries the photo's own short text: a caption (≤ 60 characters) and a
  // story of 3–60 words. This is an editorial eligibility test, not a page
  // capacity — pagination itself is always measured in the DOM.
  function t12Eligible(photo) {
    const caption=String(photo?.caption||'').trim(),storyLength=(String(photo?.story||'').match(/\p{L}+/gu)||[]).length;
    return caption.length>0&&caption.length<=60&&storyLength>=3&&storyLength<=60;
  }

  function pageFactory() {
    let serial = 0;
    return (kind, data = {}) => Object.assign({ id: `d01_page_${++serial}`, kind, pageNo: 0 }, data);
  }

  function pageLabel(page, chapterTitle, pageIndex, previousLabel) {
    if (page?.continuation === true || page?.continuationOf) return '';
    if (pageIndex > 0 && page?.isEpisodeStart !== true) return '';
    const editedPageTitle = pageIndex > 0 && norm(cleanTitle(page?.title)) !== norm(chapterTitle) ? page?.title : '';
    const raw = String(page?.sectionTitle || page?.subheading || editedPageTitle || page?.episode || '').trim();
    if (!raw || norm(raw) === norm(chapterTitle) || norm(raw) === norm(previousLabel)) return '';
    return raw.replace(/^Эпизод\s+\d+[.:]?\s*/i, '').trim();
  }

  function episodeNumber(page, fallback) {
    const raw = [page?.episode, page?.sectionTitle, page?.subheading, page?.title].filter(Boolean).join(' ');
    return Number(raw.match(/Эпизод\s+(\d+)/i)?.[1]) || fallback;
  }

  function normalizeChapter(section, chapterIndex) {
    const pages = (section.pages || []).filter(page => page && page.included !== false);
    const contentPages = pages.filter(page => page.type !== 'document' && page.bookRole !== 'document');
    const first = contentPages[0] || pages[0] || {};
    const chapterTitle = cleanTitle(section.title || first.title, `Глава ${chapterIndex + 1}`);
    let previousLabel = '';
    const segments = contentPages.map((page, pageIndex) => {
      const sectionTitle = pageLabel(page, chapterTitle, pageIndex, previousLabel);
      const editedPageTitle = pageIndex > 0 && norm(cleanTitle(page?.title)) !== norm(chapterTitle) ? page?.title : '';
      const rawLabel = String(page.sectionTitle || page.subheading || editedPageTitle || page.episode || '').trim();
      const dateBlock=(page.blocks || []).find(block => block?.type === 'date');
      const rawDate=String(page.eraDate || page.dateLabel || dateBlock?.content || '').trim();
      // A date entered from the editor is a decoration, not an editorial
      // segment. Legacy pages without dateMode keep their deliberate
      // date-era composition; newly entered dates are explicitly isolated.
      const dateMode=dateBlock ? 'watermark' : String(page.dateMode || '').trim().toLowerCase();
      const dateLabel=dateMode === 'watermark' ? '' : rawDate;
      const dateWatermark=dateMode === 'watermark' ? rawDate : String(page.dateWatermark || '').trim();
      const quoteValue=explicitQuote(page);
      const prose=normalizeProse(stripSemanticDate(stripQuote(String(page.text || '').trim(),quoteValue),rawDate));
      if (rawLabel) previousLabel = rawLabel;
      return {
        pageIndex,
        sourcePageUid: page.uid,
        title: page.title || '',
        episode: sectionTitle || cleanTitle(page.episode || first.episode, `Глава ${chapterIndex + 1}`),
        episodeNo: episodeNumber(page, pageIndex + 1),
        sectionTitle,
        quote: quoteValue,
        text: prose,
        remaining: prose,
        dropCapPreference: page.dropCapPreference,
        openingLeftVariant: String(page.openingLeftVariant || page.chapterOpeningVariant || '').trim().toLowerCase(),
        openingInitialText: String(page.openingInitialText || page.initialText || '').trim(),
        importantLine: String(page.importantLine || page.emphasis || page.important || '').trim(),
        marginNote: String(page.marginNote || page.outerNote || page.margin || '').trim(),
        inlineQuote: String(page.inlineQuote || page.narrativeQuote || '').trim(),
        editorialOverrides: page.editorialOverrides && typeof page.editorialOverrides === 'object'
          ? Object.fromEntries(Object.entries(page.editorialOverrides).map(([key, value]) => [String(key), String(value || '').trim()]).filter(([, value]) => value))
          : {},
        dateLabel,
        dateWatermark,
        dateMode,
        dateRendered: false,
        isEpisodeStart: page.isEpisodeStart === true,
        userEdited: page.userEdited === true,
        explanation: String(page.explanation || page.comment || '').trim(),
        started: false,
        photos: (page.photos || []).filter(photo => imageSource(photo))
      };
    }).filter(segment => segment.text || segment.photos.length || segment.dateLabel || segment.dateWatermark);
    const photos = segments.flatMap((segment, segmentIndex) => segment.photos.map(photo => Object.assign({}, photo, {
      _pageIndex: segment.pageIndex,
      _segmentIndex: segmentIndex,
      _sectionTitle: segment.sectionTitle,
      _sourcePageUid: segment.sourcePageUid
    })));
    const groupedByPage = new Map();
    photos.forEach(photo => {
      const key=photo._sourcePageUid||`page-${photo._pageIndex}`;
      if(!groupedByPage.has(key)) groupedByPage.set(key,[]);
      groupedByPage.get(key).push(photo);
    });
    groupedByPage.forEach((items,key)=>{
      items.forEach(photo=>{photo._sourceGroupSize=items.length;});
      if(items.length>=2 && items.some(photo=>['spread-pair','duo','stacked-text','quote-band-pair'].includes(preference(photo)))){
        items.slice(0,2).forEach(photo=>{photo._directorReserved=true;});
      }
      if(items.length>=5 && items.some(photo=>preference(photo)==='mosaic')){
        items.slice(0,12).forEach(photo=>{photo._directorReserved=true;});
      }
      if(items.length>=5 && items.every(isAuto)){
        items.slice(0,12).forEach(photo=>{photo._directorReserved=true;});
      }
      if(items.length===2 && items.every(isAuto)){
        items.forEach(photo=>{photo._directorReserved=true;photo._duoGroup=key;});
      }
      const explicit=items.some(photo=>photo.layoutPreference==='triptych');
      // Three photos on one source sheet form a triptych when the group has a
      // landscape anchor; an all-portrait group remains the approved stacked
      // composition. Both outcomes are deterministic from the source group,
      // never from the current pagination position.
      const automatic=(items.length===4 || (items.length===3 && items.some(photo=>photoAspect(photo)>=1.05))) && items.every(photo=>(photo.layoutPreference||'auto')==='auto');
      if(items.length>=3 && (explicit||automatic)){
        // Three automatic images are already a complete triptych. With four,
        // preserve the first image for the chapter opener and use the next
        // three as the collage.
        const start=explicit || items.length===3 ? 0 : 1;
        items.slice(start,start+3).forEach(photo=>{photo._triptychGroup=key;photo._triptychReserved=true;});
      }
    });
    // Automatic direction is finalized once for the whole book, after all
    // chapters have been normalized. Keeping this local plan empty prevents
    // chapter-by-chapter scheduling from repeating the same rare composition
    // at every chapter boundary.
    const compositionPlan = [];
    const documents = pages.filter(page => page.type === 'document' || page.bookRole === 'document').map(page => Object.assign({}, page, {
      explanation: String(page.explanation || page.comment || page.story || page.photos?.[0]?.story || '').trim(),
      photos: (page.photos || []).filter(photo => imageSource(photo))
    })).filter(document=>document.photos.length || wordCount(document.text) || wordCount(document.explanation));
    return {
      sectionId: section.id,
      sourcePageUid: first.uid,
      title: chapterTitle,
      episode: first.episode || `Глава ${chapterIndex + 1}`,
      type: 'chapter',
      text: segments.map(segment => segment.text).filter(Boolean).join('\n\n'),
      semanticHtml: pages.map(page => page.semanticHtml || '').join(' '),
      segments, photos, documents, compositionPlan, chapterIndex,
      openingLeftVariant: String(section.openingLeftVariant || first.openingLeftVariant || first.chapterOpeningVariant || segments[0]?.openingLeftVariant || '').trim().toLowerCase(),
      openingInitialText: String(section.openingInitialText || first.openingInitialText || segments[0]?.openingInitialText || '').trim()
    };
  }

  function fieldValues(section, count) {
    const raw = String(section?.pages?.[0]?.text || '');
    const values = raw.split(/\n{2,}/).map(value => value.trim());
    return Array.from({ length: count }, (_, index) => values[index] || '');
  }

  function sectionPage(section, fallbackTitle) {
    const page = section?.pages?.find(item => item && item.included !== false) || {};
    return {
      title: String(page.title || section?.title || fallbackTitle || '').trim(),
      text: String(page.text || '').trim(),
      source: page
    };
  }

  function currentSegment(chapter) {
    return chapter.segments.find(segment => wordCount(segment.remaining)) || null;
  }

  function remainingWords(chapter) {
    return chapter.segments.reduce((total, segment) => total + wordCount(segment.remaining), 0);
  }

  function consumeSegment(chapter, maxWords) {
    const segment = currentSegment(chapter);
    if (!segment) return { text: '', sectionTitle: '', quote: '', isStart: false, segment: null };
    const isStart = !segment.started;
    const remainingCount = wordCount(segment.remaining);
    const split = takeSentences(segment.remaining, maxWords);
    segment.remaining = split.tail;
    segment.started = true;
    return {
      text: split.head,
      sectionTitle: isStart ? segment.sectionTitle : '',
      quote: isStart ? segment.quote : '',
      dateWatermark: isStart ? segment.dateWatermark : '',
      isStart,
      segment
    };
  }

  function attachStandaloneDocuments(sections, chapters) {
    let current = null;
    sections.forEach(section => {
      if (section.type === 'chapter') {
        current = chapters.find(chapter => chapter.sectionId === section.id) || current;
        return;
      }
      const docs = (section.pages || []).filter(page => page && page.included !== false && (page.type === 'document' || page.bookRole === 'document'));
      if (current && docs.length) current.documents.push(...docs);
    });
  }

  // The Director works on a book-wide photo queue. Text is the spine of the
  // book; photos are optional beats placed into that spine. The old director
  // let many independent `%` rules compete while the loop was paginating,
  // which made the same material change composition when a photo was added.
  // This planner assigns every ungrouped automatic photo one stable role once
  // and leaves the pagination loop to consume that role. Manual card choices
  // remain authoritative and are never rewritten here.
  function planAutomaticBookCompositions(chapters) {
    const queue = [];
    (chapters || []).forEach((chapter, chapterIndex) => {
      (chapter.photos || []).forEach((photo, photoIndex) => {
        if (photo?._directorPreference) delete photo._directorPreference;
        const previousPhoto = photoIndex > 0 ? chapter.photos[photoIndex - 1] : null;
        const followsManualPair = Boolean(previousPhoto &&
          String(previousPhoto.layoutPreference || '').toLowerCase() !== 'auto' &&
          ['photo-top-text','text-top-photo','quote-band-pair','stacked-text','duo','spread-pair','dark-photo-pair'].includes(String(previousPhoto.layoutPreference || '').toLowerCase()));
        if (followsManualPair && isAuto(photo)) {
          // Leave the companion untouched so the explicit/manual lead can
          // consume the pair in the normal composition branch.
          photo._directorPairCompanion = true;
          return;
        }
        if (previousPhoto?._directorPairCompanion && isAuto(photo)) {
          // A following automatic image is a new visual beat, not a second
          // copy of the manual pair. Keep that distinction for the fixed
          // overlay fallback below.
          photo._directorAfterManualPair = true;
        }
        // Normally the first photo is the chapter opener. A wide automatic
        // image is not opener-eligible and must stay in the queue even when it
        // happens to be the first uploaded image.
        const openerEligible = photoIndex === 0 && heroEligible(photo);
        if (!isAuto(photo) || openerEligible || photo._triptychReserved || photo._directorReserved) return;
        if (Number(photo._sourceGroupSize || 1) !== 1) return;
        queue.push({ photo, chapter, chapterIndex, photoIndex });
      });
      chapter.compositionPlan = [{ slot: 'chapter-opener', preference: 'chapter-opener' }];
    });
    if (!queue.length) return [];

    const assigned = [];
    const assign = (item, requested, reason, slot) => {
      if (!item || item.photo._directorPreference) return;
      item.photo._directorPreference = requested;
      const entry = {
        photo: item.photo,
        preference: requested,
        reason,
        slot: slot || requested,
        chapterIndex: item.chapterIndex,
        photoIndex: item.photoIndex
      };
      assigned.push(entry);
      item.chapter.compositionPlan.push(entry);
    };

    const suitable = item => {
      const ratio = photoAspect(item.photo);
      // Automatic art direction must not silently disappear because a phone
      // image has no trusted pixel metadata.  The renderer still crops by
      // aspect ratio; resolution is a quality hint, never a layout gate.
      return ratio >= 1.08 && ratio < 1.60 && Boolean(imageSource(item.photo));
    };
    const panoramaIndex = queue.findIndex(item => {
      const ratio = photoAspect(item.photo);
      const nextInSource = item.chapter?.photos?.[item.photoIndex + 1];
      // A panorama is one source image across the spine.  If another
      // uploaded image follows it, preserve that image for the two-photo
      // rhythm instead of duplicating the first photograph on both pages.
      return ratio >= 1.60 && Boolean(imageSource(item.photo)) &&
        (!nextInSource || photoAspect(nextInSource) >= 1.55);
    });
    if (panoramaIndex >= 0) {
      // A very wide image is a deliberate cross-spine panorama, not a normal
      // photo+text card. The private `spread` mark is still automatic in the
      // editor and is resolved by the same renderer as the manual choice.
      assign(queue[panoramaIndex], 'spread', 'fixed-rhythm-panorama', 'photo-beat-panorama');
    }
    const free = item => item && !item.photo._directorPreference && !item.photo._directorPairCompanion;
    const railIndex = queue.findIndex(item => free(item) && (() => {
      const ratio = photoAspect(item.photo);
      return ratio >= 1.35 && ratio < 1.60;
    })());
    if (railIndex >= 0) {
      assign(queue[railIndex], 'photo-1p5-text', 'fixed-rhythm-rail', 'photo-beat-rail');
    }

    // One dark photo/gradient is a deliberate book-level pause. It is not
    // tied to the amount of text or to a modulo counter. If there is no second
    // suitable image, the dark beat simply does not exist; the remaining text
    // continues on ordinary light spreads.
    const darkStart = railIndex >= 0 ? railIndex + 1 : 1;
    const darkIndex = queue.findIndex((item, index) => index >= darkStart && free(item) && suitable(item));
    if (darkIndex >= 0) {
      assign(queue[darkIndex], 'dark-gradient-photo', 'fixed-rhythm-dark-pause', 'photo-beat-dark');
    }

    // A light gradient is the optional visual echo of the dark beat. Keep it
    // later in the queue and use it at most once; all other automatic photos
    // use the stable baseline photo+text spread. Thus more photos enrich the
    // rhythm, while fewer photos never create placeholder pages.
    const lightIndex = darkIndex >= 0
      ? queue.findIndex((item, index) => index > darkIndex && free(item) && suitable(item))
      : -1;
    if (lightIndex >= 0) {
      assign(queue[lightIndex], 'photo-gradient-text', 'fixed-rhythm-light-gradient', 'photo-beat-light');
    }

    // The remaining automatic beats are resolved from the local photo
    // sequence, never from the current page number. This keeps the useful
    // reference compositions (pair, dark split, overlay) available while
    // making the choice repeatable when the text grows or shrinks.
    const sourceTextWords = item => wordCount(item.chapter.segments[item.photo._segmentIndex]?.text || '');
    const adjacent = (first, second) => Boolean(first && second &&
      first.chapter === second.chapter && second.photo._pageIndex === first.photo._pageIndex + 1);
    const pairedIndex = queue.findIndex((item, index) => {
      const next = queue[index + 1];
      if (!free(item) || !free(next) || !adjacent(item, next)) return false;
      const a = photoAspect(item.photo);
      const b = photoAspect(next.photo);
      // Balanced portrait pairs are quote-band photos. A medium landscape
      // followed by a portrait is the fixed photo-over-text pair. Two medium
      // landscapes become the fixed overlay beat instead.
      return (a <= 1.08 && b <= 1.08 && sourceTextWords(item) >= 45 && sourceTextWords(next) >= 45) ||
        (a >= 1.08 && a < 1.35 && b < 1.08) ||
        (a >= 1.08 && a < 1.35 && b >= 1.08 && b < 1.35);
    });
    if (pairedIndex >= 0) {
      const first = queue[pairedIndex];
      const second = queue[pairedIndex + 1];
      const firstAspect = photoAspect(first.photo);
      const secondAspect = photoAspect(second.photo);
      if (firstAspect <= 1.08 && secondAspect <= 1.08) {
        assign(first, 'quote-band-pair', 'fixed-rhythm-quote-band', 'photo-beat-pair');
      } else if (secondAspect < 1.08) {
        assign(first, 'photo-top-text', 'fixed-rhythm-photo-text-pair', 'photo-beat-pair');
      } else {
        assign(first, 'photo-overlay-text', 'fixed-rhythm-overlay-pair', 'photo-beat-pair');
      }
      second.photo._directorPairCompanion = true;
    }

    const freeItems = queue.filter(free);
    if (freeItems.length === 1) {
      const only = freeItems[0];
      const ratio = photoAspect(only.photo);
      if (only.photo._directorAfterManualPair && ratio >= 1.08 && ratio < 1.35) {
        assign(only, 'photo-overlay-text', 'fixed-rhythm-overlay-followup', 'photo-beat-overlay');
      } else if (ratio <= .92) {
        assign(only, 'dark-split', 'fixed-rhythm-portrait-beat', 'photo-beat-dark-split');
      } else if (ratio >= 1.08 && ratio < 1.35) {
        assign(only, 'text-top-photo', 'fixed-rhythm-medium-landscape', 'photo-beat-text-over-photo');
      }
    }

    // A second very wide image continues the panorama as a deliberate
    // neighbouring-sheet rail. It is resolved before the baseline assignment
    // so the cross-spine composition cannot be mistaken for an ordinary photo.
    if (panoramaIndex >= 0) {
      const bleedIndex = queue.findIndex((item, index) => index > panoramaIndex && free(item) && photoAspect(item.photo) >= 1.55);
      if (bleedIndex >= 0) assign(queue[bleedIndex], 'bleed-text', 'fixed-rhythm-panorama-rail', 'photo-beat-bleed');
    }

    // Mark the rest explicitly as the baseline. This is important: without a
    // private baseline marker, the old aspect/modulo branches could still
    // reinterpret the same image later in the pagination loop.
    queue.forEach(item => {
      if (free(item)) {
        assign(item, 'photo-text', 'fixed-rhythm-baseline', 'photo-beat-standard');
      }
    });

    return assigned;
  }

  // The active text constructor enters here BEFORE legacy normalization or
  // photo pagination. Source offsets are identities, never layout capacities.
  function assembleExactText(structure, meta) {
    if (typeof meta.paginateText !== 'function') throw new Error('Для сборки необходим измеритель DOM.');
    const P = pageFactory();
    const sections = (structure?.sections || []).filter(section => section && section.included !== false);
    const byId = id => sections.find(section => section.id === id);
    const rawChapters = sections.filter(section => section.type === 'chapter');
    const chapters = rawChapters.map((section, chapterIndex) => {
      const pages = (section.pages || []).filter(page => page && page.included !== false);
      const first = pages[0] || {};
      let end = 0, previousText='';
      const runs = pages.filter(page => page.type !== 'document' && page.bookRole !== 'document').map(page => {
        const rawText = String(page.text ?? '');
        const prefix=continuationJoin(previousText,rawText,page);
        const text=prefix+rawText;
        const run = { sourcePageUid: page.uid || page.id || section.id, text, start: end, end: end + text.length, page, continuation: isContinuation(previousText, rawText, page) };
        end = run.end;
        previousText=rawText;
        return run;
      });
      return {
        sectionId: section.id, sourcePageUid: first.uid, runs,
        title: cleanTitle(section.title || first.title, `Глава ${chapterIndex + 1}`),
        episode: first.episode || section.title || '',
        pages,
        photos: pages.flatMap((page,pageIndex) => (page.photos || []).map(photo => ({ ...photo, _sourcePageUid:page.uid||page.id||section.id, _sourcePageIndex:pageIndex }))),
        documents: pages.filter(page => page.type === 'document' || page.bookRole === 'document'),
        text: runs.map(run => run.text).join(''),
        openingLeftVariant: section.openingLeftVariant || first.openingLeftVariant || first.chapterOpeningVariant || '',
        openingInitialText: section.openingInitialText || first.openingInitialText || first.initialText || '',
        first
      };
    }).filter(chapter => Boolean(chapter.text) || chapter.photos.length || chapter.documents.length);
    if (!chapters.length) return { ready: false, message: 'Добавьте текст хотя бы в одну главу.' };
    const spreads = [];
    const [coverTitle, coverSubtitle, coverAuthor, coverFooter] = fieldValues(byId('cover'), 4);
    const [titleTitle, titleSubtitle, titleAuthor] = fieldValues(byId('title'), 3);
    const [epigraphText, epigraphSource] = fieldValues(byId('epigraph'), 2);
    const [dedicationText, dedicationSign] = fieldValues(byId('dedication'), 2);
    const coverSource = byId('cover')?.pages?.[0] || {};
    const backCoverSource = byId('back-cover')?.pages?.[0] || {};
    const bookMeta = { ...meta, title: coverTitle || meta.title || 'Семейная хроника', subtitle: coverSubtitle || meta.subtitle || '', author: coverAuthor || meta.author || '', coverFooter };
    const titleMeta = { ...bookMeta, title: titleTitle || bookMeta.title, subtitle: titleSubtitle || bookMeta.subtitle, author: titleAuthor || bookMeta.author };
    if (byId('cover')) spreads.push({ id:'d01_cover', master:'D01-SPREAD-COVER', left:null, right:P('cover',{meta:bookMeta,source:coverSource}), single:'right' });
    if (byId('endpaper')) spreads.push({id:'d01_endpaper_front',master:'D01-SPREAD-ENDPAPER',left:P('endpaper',{meta:bookMeta}),right:P('endpaper',{meta:bookMeta})});
    if (byId('title')) spreads.push({id:'d01_titles',master:'D01-SPREAD-TITLES',left:P('half-title',{layout:'half-title',meta:bookMeta}),right:P('title',{layout:'title-page',meta:titleMeta})});
    const contentsPage = P('contents-right',{meta:bookMeta,items:chapters.map(chapter=>({sectionId:chapter.sectionId,title:chapter.title,page:''}))});
    const epigraphPage = P('epigraph',{epigraphText:epigraphText || 'Память соединяет поколения.',epigraphSource,meta:bookMeta});
    if (byId('dedication')) {
      spreads.push({id:'d01_dedication_epigraph',master:'D01-SPREAD-DEDICATION-EPIGRAPH',left:P('dedication',{dedicationText:dedicationText || 'Тем, кто хранит семейную память.',dedicationSign,meta:bookMeta}),right:byId('epigraph')?epigraphPage:P('blank',{meta:bookMeta})});
      if (byId('contents')) spreads.push({id:'d01_contents',master:'D01-SPREAD-CONTENTS',left:P('blank',{meta:bookMeta}),right:contentsPage});
    } else if (byId('epigraph') || byId('contents')) spreads.push({id:'d01_epigraph_contents',master:'D01-SPREAD-EPIGRAPH-CONTENTS',left:byId('epigraph')?epigraphPage:P('blank',{meta:bookMeta}),right:byId('contents')?contentsPage:P('blank',{meta:bookMeta})});
    // Optional front/back matter is printed only when the author wrote it;
    // a heading over an empty page reads as a mistake in a finished book.
    const hasMatter = id => Boolean(String(byId(id)?.pages?.find(page=>page.included!==false)?.text??'').trim());
    const matter = (id,kind,master,title) => {
      const section=byId(id), source=section?.pages?.find(page=>page.included!==false) || {};
      return hasMatter(id)?P(kind,{master,title:source.title||section.title||title,text:String(source.text??''),source,meta:bookMeta}):P('blank',{meta:bookMeta});
    };
    if(hasMatter('intro')||hasMatter('author'))spreads.push({id:'d01_intro_author',master:'D01-SPREAD-INTRO-AUTHOR',left:matter('intro','intro','D01-INTRO','Вступление'),right:matter('author','author-note','D01-AUTHOR','От автора')});
    const expectedManuscripts = [];
    const masters = meta.layoutDefinition?.textMasters || { 'inline-quote':'D01-TEXT-INLINE-QUOTE', margin:'D01-TEXT-MARGIN', important:'D01-TEXT-IMPORTANT', 'important-margin':'D01-TEXT-IMPORTANT-MARGIN', plain:'D01-TEXT' };
    // The author's editorial cycle: quote page, handwritten-lines page, margin
    // note page, handwritten lines + margin note, then again from the quote.
    // After every full cycle a quiet page without accents lets the eye rest
    // (meta.quietPageAfterCycle === false switches it off). Photo beats pause
    // the cycle; they never restart it.
    const accentCycle = meta.layoutDefinition?.rhythm || ['inline-quote','important','margin','important-margin'];
    const quietPageAfterCycle = meta.quietPageAfterCycle !== false;
    const textSeed = value => { let hash=2166136261; for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619);} return hash>>>0; };
    // Photo beats are chosen like an art director would: by how many unused
    // photographs the chapter still holds and their shape, never the same
    // beat twice in a row across the book, in a repeatable seeded order.
    const photoBeatWeights = { t12:40, t10:25, t08:25, t07:30, t06:30, hspread:30, panorama:20, two:20, three:10, single:15 };
    let photoBeatSeed = textSeed(chapters.map(chapter=>chapter.text).join('|'))||1, lastPhotoBeat = '', recentPhotoBeats = [], portraitCount = 0, t10Count = 0, t12Count = 0;
    const photoBeatRandom = () => { photoBeatSeed=(photoBeatSeed+0x6D2B79F5)>>>0; let t=photoBeatSeed; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; };
    const accentZones=['middle','bottom','top','middle','top','bottom'];
    let accentBeat=0;
    chapters.forEach((chapter,index) => {
      const chapterSpreadStart = spreads.length;
      let rest = chapter.text, sourceOffset = 0;
      const occurrences = {};
      expectedManuscripts.push({sectionId:chapter.sectionId,text:chapter.text});
      // Accent phrases already used in this chapter, so later pages pick
      // other words for their quote, handwritten line and margin note.
      const usedAccents = [];
      // Episodes that start inside the chapter with their own photograph get
      // an opening spread. Their text always begins on a fresh page: no page
      // is filled across an episode boundary.
      const episodes=chapter.runs.filter(run=>run.page?.isEpisodeStart===true&&run.start>0&&String(run.page.text||'').trim()).map(run=>{
        const photoPosition=chapter.photos.findIndex(photo=>photo._sourcePageUid===run.sourcePageUid&&imageSource(photo));
        if(photoPosition<0)return null;
        const photo=chapter.photos[photoPosition],story=String(photo.story||'').trim().match(/^[^.!?…]+[.!?…]?/u)?.[0]||'';
        photo._episodeOpening=true;
        return {offset:run.start+(run.text.length-String(run.page.text).length),photoPosition,opened:false,
          title:String(run.page.episode||run.page.title||'').replace(/^\u042d\u043f\u0438\u0437\u043e\u0434\s+\d+[.:]?\s*/iu,'').trim()||String(run.page.title||'').trim(),
          line:String(run.page.episodeLine||'').trim()||(story.length<=90?story:''),caption:String(photo.caption||'').trim()};
      }).filter(Boolean);
      const pendingEpisode=()=>episodes.find(item=>!item.opened&&item.offset===sourceOffset);
      const consume = (page,side) => {
        const boundary=episodes.find(item=>!item.opened&&item.offset>sourceOffset)?.offset;
        const whole=rest,limit=boundary!=null?rest.slice(0,boundary-sourceOffset):rest;rest=limit;
        if(!page.avoidAccents)page.avoidAccents=usedAccents.slice();
        page.startsParagraph=sourceOffset>0&&/\r?\n[ \t]*\r?\n[ \t\r\n]*$/u.test(chapter.text.slice(0,sourceOffset));
        // Only a real new sheet starts a new line; where the editor merely
        // carried the text over, the book keeps one continuous line flow.
        page.sourceBreaks = chapter.runs.filter(run=>run.start>sourceOffset&&!run.continuation).map(run=>run.start-sourceOffset);
        const split = meta.paginateText(page,rest,side);
        if (split.head + split.tail !== rest || (!split.head && rest)) throw new Error('Нарушена точная сохранность исходного текста.');
        page.text = split.head; page.sourceText = split.head; page.measuredFlow = split.measuredFlow;
        page.sourceRange = { start: sourceOffset, end: sourceOffset + split.head.length };
        sourceOffset = page.sourceRange.end; rest = split.tail+whole.slice(limit.length);
        for(const text of [page.inlineQuote,page.importantLine,...(page.innerImportantLines||[]),page.marginNote])if(text&&!usedAccents.includes(text))usedAccents.push(text);
        return page;
      };
      // A photograph the author marked as the hero's portrait is reserved for P01.
      // Photographs that open an episode are reserved for that opening as well.
      const isPortraitHero = photo => photo?.portraitHero === true || Boolean(String(photo?.heroName||'').trim()) || photo?._episodeOpening === true;
      const heroIndex = chapter.photos.findIndex(photo=>heroEligible(photo)&&!isPortraitHero(photo)&&photoAspect(photo)<=1.05);
      const photoIndex = heroIndex >= 0 ? heroIndex : chapter.photos.findIndex(photo=>heroEligible(photo)&&!isPortraitHero(photo));
      const openingQuote = String(chapter.first.quote || chapter.first.pullQuote || chapter.title);
      const left = photoIndex >= 0
        ? P('chapter',{layout:'chapter-photo',master:'D01-CHAPTER-PHOTO',sectionId:chapter.sectionId,source:chapter,photoIndex,chapterNo:index+1,title:chapter.title})
        : chapter.openingLeftVariant==='initial'
          ? P('chapter-initial',{layout:'chapter-initial',master:'D01-CHAPTER-INITIAL',sectionId:chapter.sectionId,source:chapter,initialLetter:chapter.title,initialText:chapter.openingInitialText||openingQuote,quote:openingQuote})
          : P('quote',{layout:'quote',master:'D01-QUOTE',sectionId:chapter.sectionId,source:chapter,quote:openingQuote,quoteTone:'light'});
      const usedPhotoIndices=new Set(),usedPhotoSources=new Set();
      if(photoIndex>=0){usedPhotoIndices.add(photoIndex);usedPhotoSources.add(imageSource(chapter.photos[photoIndex]));}
      const opening=P('chapter',{layout:'chapter-intro',master:'D01-CHAPTER-TEXT',sectionId:chapter.sectionId,sourcePageUid:chapter.sourcePageUid,source:chapter,title:chapter.title,episode:chapter.episode,chapterNo:index+1});
      consume(opening,'right');
      spreads.push({id:`d01_chapter_${index+1}_open`,master:'D01-SPREAD-CHAPTER',sectionId:chapter.sectionId,left,right:opening});
      // The fixed post-opening beat keeps the approved CTX v1.7 geometry, but
      // its secondary card is now a different real photograph (or handwriting).
      // The opening photograph is never reused as the CTX main image.
      const assetId=(photo,position)=>String(photo?.id||imageSource(photo)||`photo-${position}`);
      const detailIndex=chapter.photos.findIndex((photo,photoPosition)=>{
        if(isPortraitHero(photo))return false;
        if(photoPosition===photoIndex||!imageSource(photo)||photoIndex>=0&&imageSource(photo)===imageSource(chapter.photos[photoIndex]))return false;
        return true;
      });
      const ctxPhotoIndex=detailIndex;
      const ctxPhoto=ctxPhotoIndex>=0?chapter.photos[ctxPhotoIndex]:null;
      const ctxRatio=Number(ctxPhoto?.width)>0&&Number(ctxPhoto?.height)>0?Number(ctxPhoto.width)/Number(ctxPhoto.height):1;
      const ctxState=ctxPhoto?String(ctxPhoto.ctxState||(ctxRatio<.82?'V':ctxRatio>1.22?'H':'S')).toUpperCase():'';
      const secondaryPhotoIndex=ctxPhoto?chapter.photos.findIndex((photo,photoPosition)=>{
        if(isPortraitHero(photo))return false;
        if(photoPosition===photoIndex||photoPosition===ctxPhotoIndex||!imageSource(photo))return false;
        if(imageSource(photo)===imageSource(ctxPhoto))return false;
        return assetId(photo,photoPosition)!==assetId(ctxPhoto,ctxPhotoIndex);
      }):-1;
      const secondaryPhoto=secondaryPhotoIndex>=0?chapter.photos[secondaryPhotoIndex]:null;
      const ctxOwner=ctxPhoto?chapter.pages.find(page=>String(page.uid||page.id||'')===String(ctxPhoto._sourcePageUid||''))||chapter.first:chapter.first;
      const ctxKey=ctxPhoto?`ctx-handwritten:${ctxPhoto.id||ctxPhotoIndex}`:'';
      const ctxOverrides=ctxOwner?.editorialOverrides&&typeof ctxOwner.editorialOverrides==='object'?ctxOwner.editorialOverrides:{};
      const ctxNote=ctxPhoto&&!secondaryPhoto?String(ctxOverrides[ctxKey]??ctxHandwrittenFallback(ctxPhoto,ctxOwner,chapter.title)).trim():'';
      const fixedOwner=chapter.runs.find(run=>run.end>sourceOffset)||chapter.runs[chapter.runs.length-1];
      const fixedInput=fixedOwner?.page||chapter.first;
      const fixedKey='inline-quote:0',fixedOverrides=fixedInput.editorialOverrides||{};
      const fixedRest=rest,fixedOffset=sourceOffset;
      let fixedText=P('text',{
        layout:'prose-dense',master:masters['inline-quote'],rhythm:'inline-quote',quoteColumn:'left',
        sectionId:chapter.sectionId,source:chapter,sourcePageUid:fixedOwner?.sourcePageUid,
        title:chapter.title,episode:fixedInput.episode||chapter.episode,
        inlineQuote:String(fixedOverrides[fixedKey]??fixedInput.inlineQuote??fixedInput.quote??''),
        editorialAccentEditable:true,editorialAccentKind:'inline-quote',editorialAccentOccurrence:0,
        editorialOverrideKey:fixedKey,editorialSourcePageUid:fixedOwner?.sourcePageUid,
        dateWatermark:fixedInput.dateWatermark||fixedInput.eraDate||''
      });
      fixedText.autoInlineQuote=!fixedText.inlineQuote;
      consume(fixedText,'left');
      // If the manuscript ends before any line can continue below the quote,
      // remove the optional quote and remeasure the same untouched source as
      // a quiet ending. The decision comes from the rendered cells, not from
      // a word or character estimate.
      if(fixedText.measuredFlow?.mode==='inline-quote'&&!fixedText.measuredFlow.cells?.[1]?.trim()&&!rest){
        rest=fixedRest;sourceOffset=fixedOffset;
        fixedText=P('text',{layout:'prose-dense',master:masters.plain||'D01-TEXT',rhythm:'plain',sectionId:chapter.sectionId,source:chapter,sourcePageUid:fixedOwner?.sourcePageUid,title:chapter.title,episode:fixedInput.episode||chapter.episode,dateWatermark:fixedInput.dateWatermark||fixedInput.eraDate||''});
        consume(fixedText,'left');
      }
      occurrences['inline-quote']=1;
      let cycleStep=fixedText.rhythm==='inline-quote'?1:0,quietGiven=false;
      const nextRhythm=()=>{
        if(quietPageAfterCycle&&cycleStep>0&&cycleStep%accentCycle.length===0&&!quietGiven){quietGiven=true;return 'plain';}
        quietGiven=false;
        return accentCycle[cycleStep++%accentCycle.length];
      };
      const nextTextPage=(side,extra={})=>{
        if(!rest||pendingEpisode())return null;
        const owner=chapter.runs.find(run=>run.end>sourceOffset)||chapter.runs[chapter.runs.length-1];
        const input=owner?.page||chapter.first;
        // A page inside a photo composition may ask for a quiet page; the
        // editorial cycle then waits for the next ordinary text page.
        const rhythm=extra.forceRhythm||nextRhythm(), occurrence=occurrences[rhythm]||0, key=`${rhythm}:${occurrence}`;
        const overrides=input.editorialOverrides||{};
        const noteKey=rhythm==='important-margin'?`${key}:margin`:key;
        const page=P('text',{
          layout:'prose-dense',master:masters[rhythm],rhythm,sectionId:chapter.sectionId,source:chapter,
          sourcePageUid:owner?.sourcePageUid,title:chapter.title,episode:input.episode||chapter.episode,
          importantLine:['important','important-margin'].includes(rhythm)?String(overrides[key]??input.importantLine??''):'',
          inlineQuote:rhythm==='inline-quote'?String(overrides[key]??input.inlineQuote??input.quote??''):'',
          quoteColumn:rhythm==='inline-quote'?(occurrence%2===0?'left':'right'):'',
          marginNote:['margin','important-margin'].includes(rhythm)?String(overrides[noteKey]??input.marginNote??input.explanation??''):'',
          editorialAccentEditable:true,editorialAccentKind:rhythm,editorialAccentOccurrence:occurrence,
          editorialOverrideKey:key,editorialSourcePageUid:owner?.sourcePageUid,
          dateWatermark:input.dateWatermark||input.eraDate||''
        });
        if(['important','important-margin'].includes(rhythm)){
          page.accentZone=accentZones[accentBeat%accentZones.length];
          page.accentColumn=accentBeat%2===0?'right':'left';
          accentBeat++;
        }
        page.autoImportant=!page.importantLine;page.autoInlineQuote=!page.inlineQuote;page.autoMarginNote=!page.marginNote;
        Object.assign(page,extra);delete page.forceRhythm;
        occurrences[rhythm]=occurrence+1;
        return consume(page,side);
      };
      const detail=ctxPhoto&&(secondaryPhoto||ctxNote)?P('ctx-detail-sq',{
        layout:'ctx-detail-sq',master:'D01-CTX-DETAIL-SQ',sectionId:chapter.sectionId,source:chapter,
        photoIndex:ctxPhotoIndex,secondaryPhotoIndex:secondaryPhotoIndex>=0?secondaryPhotoIndex:null,
        mainPhotoAssetId:assetId(ctxPhoto,ctxPhotoIndex),secondaryPhotoAssetId:secondaryPhoto?assetId(secondaryPhoto,secondaryPhotoIndex):null,
        ctxState,ctxAccentType:secondaryPhoto?'secondary-photo':'handwritten-note',ctxHandwrittenNote:ctxNote,title:chapter.title,
        editorialAccentEditable:true,editorialOverrideKey:ctxKey,editorialSourcePageUid:ctxOwner?.uid||ctxOwner?.id||chapter.sourcePageUid,
        reusedOpeningPhoto:false
      }):null;
      if(detail){usedPhotoIndices.add(ctxPhotoIndex);usedPhotoSources.add(imageSource(ctxPhoto));if(secondaryPhoto){usedPhotoIndices.add(secondaryPhotoIndex);usedPhotoSources.add(imageSource(secondaryPhoto));}}
      const textFallback=detail?null:nextTextPage('right');
      if(fixedText.text||detail||textFallback)spreads.push({id:`d01_chapter_${index+1}_${detail?'ctx_detail':'text_fallback'}`,master:detail?'D01-SPREAD-POST-OPENING-CTX':'D01-SPREAD-POST-OPENING-TEXT',sectionId:chapter.sectionId,left:fixedText,right:detail||textFallback,fixedRhythm:true,ctxSkipped:!detail});
      const usablePhotoIndices=chapter.photos.map((photo,photoPosition)=>imageSource(photo)?photoPosition:-1).filter(photoPosition=>photoPosition>=0);
      let portraitGiven=false;
      let textSpreadStreak=detail?0:(fixedText.text?1:0);
      let darkFadeInserted=false;
      const nextVisualPhoto=()=>{
        const unused=usablePhotoIndices.find(photoPosition=>!usedPhotoIndices.has(photoPosition)&&!usedPhotoSources.has(imageSource(chapter.photos[photoPosition]))&&!isPortraitHero(chapter.photos[photoPosition]));
        if(unused!=null){usedPhotoIndices.add(unused);usedPhotoSources.add(imageSource(chapter.photos[unused]));return unused;}
        return -1;
      };
      // Chapter ending, as a typesetter would close it: the last page has
      // balanced columns, and when it would be a stub of a few lines the
      // preceding pages give up a few lines each, keeping facing pages level.
      // Every trial re-measures the untouched source; on any doubt the
      // original pagination is restored.
      function balanceChapterEnding(){
        const minimumLines=6,maximumBorrow=4;
        const textSpreads=spreads.slice(chapterSpreadStart).filter(spread=>['D01-SPREAD-POST-OPENING-TEXT','D01-SPREAD-POST-OPENING-CTX','D01-SPREAD-TEXT-RHYTHM','D01-SPREAD-TEXT-PHOTO-RHYTHM','D01-SPREAD-HSPREAD-TOP','D01-SPREAD-T06','D01-SPREAD-T07','D01-SPREAD-T12'].includes(spread.master));
        const last=textSpreads.at(-1);
        if(!last)return;
        const isText=page=>Boolean(page?.measuredFlow&&page.sourceRange&&page.sectionId===chapter.sectionId);
        const finalSide=isText(last.right)?'right':isText(last.left)?'left':'';
        if(!finalSide||last[finalSide].sourceRange.end!==chapter.text.length)return;
        const final={page:last[finalSide],side:finalSide};
        // Donors are the text pages just before the final page: its facing
        // page, or the whole previous spread (including the chapter opening),
        // each giving up the same number of lines so facing pages stay level.
        const chapterSpreads=spreads.slice(chapterSpreadStart),previous=chapterSpreads[chapterSpreads.indexOf(last)-1];
        const donors=finalSide==='right'
          ?(isText(last.left)?[{page:last.left,side:'left'}]:[])
          :['left','right'].filter(side=>isText(previous?.[side])).map(side=>({page:previous[side],side}));
        const chain=[...donors,final];
        if(chain.some((item,i)=>i&&chain[i-1].page.sourceRange.end!==item.page.sourceRange.start))return;
        const reflow=(items,limits)=>{
          rest=chapter.text.slice(items[0].page.sourceRange.start);sourceOffset=items[0].page.sourceRange.start;
          items.forEach((item,i)=>{
            item.page.balanceTrial=true;
            if(limits[i]>0)item.page.flowLineLimit=limits[i];else delete item.page.flowLineLimit;
            consume(item.page,item.side);
          });
          return !rest&&items.every(item=>item.page.text);
        };
        const attempt=(items,limits)=>{try{return reflow(items,limits);}catch(error){return false;}};
        const fullLines=item=>item.page.measuredFlow?.fullLines||0;
        // Smallest per-column height that still holds the whole final page.
        const balanceFinal=()=>{
          let low=1,high=fullLines(final);
          if(!high||!attempt([final],[0]))return 0;
          while(low<high){const middle=Math.floor((low+high)/2);if(attempt([final],[middle]))high=middle;else low=middle+1;}
          return attempt([final],[low])?low:0;
        };
        const fulls=donors.map(fullLines);
        let settled=false;
        for(let borrow=0;borrow<=(donors.length?maximumBorrow:0)&&!settled;borrow++){
          const limits=donors.map((donor,i)=>borrow?fulls[i]-borrow:0);
          if(limits.some(limit=>limit<0)||donors.length&&!attempt(chain,[...limits,0]))continue;
          const lines=balanceFinal();
          if(lines&&(lines>=minimumLines||borrow===maximumBorrow||!donors.length))settled=true;
        }
        if(!settled){
          reflow(chain,chain.map(()=>0));
          if(!balanceFinal())reflow(chain,chain.map(()=>0));
        }
        for(const item of chain)delete item.page.balanceTrial;
      }
      while(rest){
        const episode=pendingEpisode();
        if(episode){
          // Episode opening: a small archive photo with a handwritten caption,
          // facing the episode title, a long handwritten line and the text.
          episode.opened=true;
          const photoIndex=episode.photoPosition;usedPhotoIndices.add(photoIndex);usedPhotoSources.add(imageSource(chapter.photos[photoIndex]));
          const photoPage=P('episode-photo',{layout:'episode-photo',master:'D01-EPISODE-PHOTO',sectionId:chapter.sectionId,source:chapter,photoIndex,handCaption:episode.caption,title:chapter.title});
          const opening=nextTextPage('right',{episodeOpening:{title:episode.title,line:episode.line},forceRhythm:'plain'});
          spreads.push({master:'D01-SPREAD-EPISODE-OPENING',sectionId:chapter.sectionId,left:photoPage,right:opening,fixedRhythm:true});
          textSpreadStreak=0;
          continue;
        }
        const unusedNow=usablePhotoIndices.filter(photoPosition=>!usedPhotoIndices.has(photoPosition)&&!usedPhotoSources.has(imageSource(chapter.photos[photoPosition])));
        const photoBeatAvailable=unusedNow.some(photoPosition=>!isPortraitHero(chapter.photos[photoPosition]))||(!portraitGiven&&unusedNow.some(photoPosition=>isPortraitHero(chapter.photos[photoPosition])&&!chapter.photos[photoPosition]._episodeOpening));
        if(photoBeatAvailable&&textSpreadStreak>=2){
          const free=usablePhotoIndices.filter(photoPosition=>!usedPhotoIndices.has(photoPosition)&&!usedPhotoSources.has(imageSource(chapter.photos[photoPosition])));
          const portraitHeroes=free.filter(photoPosition=>isPortraitHero(chapter.photos[photoPosition])&&!chapter.photos[photoPosition]._episodeOpening);
          const unused=free.filter(photoPosition=>!portraitHeroes.includes(photoPosition));
          const take=photoPosition=>{usedPhotoIndices.add(photoPosition);usedPhotoSources.add(imageSource(chapter.photos[photoPosition]));return photoPosition;};
          const wide=unused.filter(photoPosition=>photoAspect(chapter.photos[photoPosition])>=1.45);
          // Wide frames are kept for a panorama; other beats use them last.
          const ordinary=[...unused.filter(photoPosition=>!wide.includes(photoPosition)),...wide];
          // H-SPREAD needs a horizontal frame and enough text for both pages
          // under it (roughly 1200 characters a page at this geometry).
          // The spread window is very wide, so only clearly horizontal frames
          // (≥ 1.7 : 1) avoid an aggressive crop.
          const horizontal=unused.filter(photoPosition=>photoAspect(chapter.photos[photoPosition])>=1.7);
          // T06: a vertical or square hero plus two related frames that are not
          // both vertical, and a real block of text for the facing page.
          const heroes=unused.filter(photoPosition=>photoAspect(chapter.photos[photoPosition])<=1.05);
          const t06Hero=heroes[0];
          const t06Pair=ordinary.filter(photoPosition=>photoPosition!==t06Hero).slice(0,2);
          const t06Fits=t06Hero!=null&&t06Pair.length===2&&!t06Pair.every(photoPosition=>photoAspect(chapter.photos[photoPosition])<.85)&&rest.length>1500;
          // T07: the first approved grid the unused frames really fit
          // (H ≥ 1.2, V ≤ 0.85, otherwise S); 2×2 squares only as a last option.
          const shape=photoPosition=>{const ratio=photoAspect(chapter.photos[photoPosition]);return ratio>=1.2?'H':ratio<=.85?'V':'S';};
          const pickShapes=list=>{const pool=[...ordinary],chosen=[];for(const want of list){const at=pool.findIndex(photoPosition=>shape(photoPosition)===want);if(at<0)return null;chosen.push(pool.splice(at,1)[0]);}return chosen;};
          const t07=[['B',['H','S','S']],['C',['V','S','S']],['F',['V','V','S']],['A',['H','H']],['E',['V','V']],['D',['S','S','S','S']]].map(([variant,list])=>({variant,indices:pickShapes(list)})).find(option=>option.indices);
          const t07Fits=Boolean(t07)&&rest.length>1200;
          // T08: one truly vertical frame and at least a column of text.
          const t08Photo=ordinary.find(photoPosition=>photoAspect(chapter.photos[photoPosition])<=.85);
          const t08Fits=t08Photo!=null&&rest.length>900;
          // T10: a main frame (the widest available) plus a different card frame.
          const t10Main=[...ordinary].sort((a,b)=>photoAspect(chapter.photos[b])-photoAspect(chapter.photos[a]))[0];
          const t10Card=ordinary.find(photoPosition=>photoPosition!==t10Main);
          const t10Fits=t10Main!=null&&t10Card!=null&&rest.length>900;
          // T12: a photograph the author gave a caption and a short story
          // (up to 60 words) — that text is what the page carries.
          const t12Photo=ordinary.find(photoPosition=>t12Eligible(chapter.photos[photoPosition]));
          const t12Fits=t12Photo!=null&&rest.length>900;
          const eligible=Object.entries(photoBeatWeights).filter(([beat])=>beat!==lastPhotoBeat&&!(['t06','t07','t08','t10','t12'].includes(beat)&&recentPhotoBeats.includes(beat))&&(beat==='t12'?t12Fits:beat==='t10'?t10Fits:beat==='t08'?t08Fits:beat==='t07'?t07Fits:beat==='t06'?t06Fits:beat==='hspread'?horizontal.length>0&&rest.length>2600:beat==='panorama'?wide.length>0:beat==='three'?unused.length>=3:beat==='two'?unused.length>=2:unused.length>0));
          let pick=photoBeatRandom()*eligible.reduce((sum,[,weight])=>sum+weight,0);
          // meta.forcePhotoBeat lets acceptance checks request one beat when it is eligible.
          const forced=eligible.find(([candidate])=>candidate===meta.forcePhotoBeat)||(portraitHeroes.length&&!portraitGiven?['p01',0]:null);
          const beat=(forced||eligible.find(([,weight])=>(pick-=weight)<0)||eligible.at(-1)||['single'])[0];
          lastPhotoBeat=beat;recentPhotoBeats=[...recentPhotoBeats,beat].slice(-3);
          if(beat==='p01'){
            // P01 is the author's explicit choice: portrait on the left, a short
            // name/years/role block on the right; variants rotate B → A → C.
            const photoIndex=take(portraitHeroes[0]),photo=chapter.photos[photoIndex];
            const variant=String(photo.heroVariant||['A','C'][portraitCount++%2]).toUpperCase()==='C'?'C':'A';
            const shared={sectionId:chapter.sectionId,source:chapter,photoIndex,p01Variant:variant,pageFormat:meta.format||'square',title:chapter.title};
            spreads.push({master:'D01-SPREAD-P01',sectionId:chapter.sectionId,
              left:P('p01-portrait',{...shared,layout:'p01-portrait',master:'D01-P01-PORTRAIT'}),
              right:P('p01-text',{...shared,layout:'p01-text',master:'D01-P01-TEXT',heroName:String(photo.heroName||photo.people||photo.caption||'').trim(),heroYears:String(photo.heroYears||photo.year||'').trim(),heroRole:String(photo.heroRole||'').trim()}),fixedRhythm:true});
            portraitGiven=true;textSpreadStreak=0;
            continue;
          }
          if(beat==='t12'){
            const photoIndex=take(t12Photo),photo=chapter.photos[photoIndex];
            // Text goes to the side away from the subject; light and dark alternate.
            const focalX=Number.isFinite(Number(photo.focalX))?Number(photo.focalX):50;
            const side=focalX<45?'right':focalX>55?'left':'right';
            const tone=String(photo.t12Tone||['A','B'][t12Count++%2]).toUpperCase()==='B'?'B':'A';
            const textPage=nextTextPage('left');
            const photoPage=P('t12-photo',{layout:'t12-photo',master:'D01-T12',sectionId:chapter.sectionId,source:chapter,photoIndex,title:chapter.title,t12Tone:tone,t12Side:side,
              t12Kicker:String(photo.place||photo.year||'').trim(),t12Title:String(photo.caption||'').trim(),t12Text:String(photo.story||'').trim()});
            spreads.push({master:'D01-SPREAD-T12',sectionId:chapter.sectionId,left:textPage,right:photoPage,fixedRhythm:true});
            textSpreadStreak=0;
            continue;
          }
          if(beat==='t10'){
            // Geometry in spread coordinates (left page 0–1000, right 1000–2000).
            const pageH=meta.format==='portrait'?1196:1000,pad=70,mainRatio=photoAspect(chapter.photos[t10Main]),cardRatio=photoAspect(chapter.photos[t10Card]);
            const main=mainRatio>=1.2
              ?(()=>{const w=1250,h=Math.min(pageH-2*pad-60,Math.round(w/mainRatio));return {x:1930-w,y:pad,w,h};})()
              :(()=>{const h=pageH-2*pad,w=Math.min(870,Math.round(h*mainRatio));return {x:960,y:pad,w,h};})();
            // The card reads as a second meaningful frame (about a third of the
            // main photograph's area), not as a sticker.
            const long=Math.round(.8*Math.min(main.w,main.h)),cw=Math.round(cardRatio>=1?long:long*cardRatio),ch=Math.round(cardRatio>=1?long/cardRatio:long);
            // Approved angles in a fixed order across the book (no randomness).
            const angle=[-4,6,-2,4,-6,2][t10Count++%6];
            // Main photo and card are centred together on the page height; the
            // card hangs a little below the main photograph.
            const groupH=main.h+Math.round(ch*.18);
            if(mainRatio>=1.2)main.y=Math.max(pad,Math.round((pageH-groupH)/2));
            const card={x:Math.round(1000-.75*cw),y:Math.min(pageH-60-ch,Math.round(main.y+main.h-ch*.82)),w:cw,h:ch,angle};
            const layout={main:{index:take(t10Main),...main},card:{index:take(t10Card),...card}};
            const textPage=nextTextPage('left',{t10:layout,forceRhythm:'plain'});
            const photoPage=P('t10-photos',{layout:'t10-photos',master:'D01-T10-PHOTOS',sectionId:chapter.sectionId,source:chapter,t10:layout,title:chapter.title});
            spreads.push({master:'D01-SPREAD-T10',sectionId:chapter.sectionId,left:textPage,right:photoPage,fixedRhythm:true});
            textSpreadStreak=0;
            continue;
          }
          if(beat==='t08'){
            const photoIndex=take(t08Photo);
            const textPage=nextTextPage('left',{spinePhoto:{photoIndex},forceRhythm:'plain'});
            const pause=P('t08-pause',{layout:'t08-pause',master:'D01-T08-PAUSE',sectionId:chapter.sectionId,source:chapter,title:chapter.title,quoteSource:textPage?.text||'',avoidAccents:usedAccents.slice()});
            spreads.push({master:'D01-SPREAD-T08',sectionId:chapter.sectionId,left:textPage,right:pause,fixedRhythm:true});
            textSpreadStreak=0;
            continue;
          }
          if(beat==='t07'){
            const before=spreads[spreads.length-1],photosLeft=Boolean(before?.right&&!before.right.measuredFlow);
            const indices=t07.indices.map(take);
            const textPage=nextTextPage(photosLeft?'right':'left',{forceRhythm:'plain'});
            const photoPage=P('t07-photos',{layout:'t07-photos',master:'D01-T07-PHOTOS',sectionId:chapter.sectionId,source:chapter,photoIndices:indices,t07Variant:t07.variant,title:chapter.title,pageFormat:meta.format||'square'});
            spreads.push({master:'D01-SPREAD-T07',sectionId:chapter.sectionId,left:photosLeft?photoPage:textPage,right:photosLeft?textPage:photoPage,t07Variant:t07.variant,fixedRhythm:true});
            textSpreadStreak=0;
            continue;
          }
          if(beat==='t06'){
            // The hero goes to the side opposite the previous spread's visual
            // weight: after a photograph on the right it opens on the left.
            const before=spreads[spreads.length-1],heavyRight=Boolean(before?.right&&!before.right.measuredFlow),heroLeft=heavyRight;
            const hero=take(t06Hero),pair=t06Pair.map(take);
            const textPage=nextTextPage(heroLeft?'right':'left',{topPair:{photoIndices:pair},forceRhythm:'plain'});
            const heroPage=P('t06-hero',{layout:'t06-hero',master:'D01-T06-HERO',sectionId:chapter.sectionId,source:chapter,photoIndex:hero,title:chapter.title,pageFormat:meta.format||'square'});
            spreads.push({master:'D01-SPREAD-T06',sectionId:chapter.sectionId,left:heroLeft?heroPage:textPage,right:heroLeft?textPage:heroPage,sideVariant:heroLeft?'heroLeft':'heroRight',fixedRhythm:true});
            textSpreadStreak=0;
            continue;
          }
          if(beat==='hspread'){
            const photoIndex=take(horizontal.sort((a,b)=>photoAspect(chapter.photos[b])-photoAspect(chapter.photos[a]))[0]);
            const left=nextTextPage('left',{topPhoto:{photoIndex}});
            const right=nextTextPage('right',{topPhoto:{photoIndex}})||P('hspread-photo',{layout:'hspread-photo',master:'D01-HSPREAD-TOP',sectionId:chapter.sectionId,source:chapter,photoIndex,title:chapter.title});
            spreads.push({master:'D01-SPREAD-HSPREAD-TOP',sectionId:chapter.sectionId,left,right,fixedRhythm:true});
            textSpreadStreak=0;
            continue;
          }
          if(beat==='panorama'){
            const photoIndex=take(wide.sort((a,b)=>photoAspect(chapter.photos[b])-photoAspect(chapter.photos[a]))[0]);
            const base={layout:'panorama',master:'D01-PANORAMA',sectionId:chapter.sectionId,source:chapter,photoIndex,panorama:true,title:chapter.title};
            spreads.push({master:'D01-SPREAD-PANORAMA',sectionId:chapter.sectionId,left:P('photo',{...base,panoramaSide:'left'}),right:P('photo',{...base,panoramaSide:'right',hideCaption:true}),fixedRhythm:true});
            textSpreadStreak=0;
            continue;
          }
          const textPage=nextTextPage('left');
          const photoPage=beat==='three'
            ?P('three-photo',{layout:'photo-triptych',master:'D01-THREE-PHOTO',sectionId:chapter.sectionId,source:chapter,photoIndices:ordinary.slice(0,3).map(take),title:chapter.title})
            :beat==='two'
              ?P('two-photo',{layout:'photo-duo',master:'D01-TWO-PHOTO',sectionId:chapter.sectionId,source:chapter,photoIndices:ordinary.slice(0,2).map(take),title:chapter.title})
              :P('large-photo',{layout:'photo-fullspread',master:'D01-LARGE-PHOTO',sectionId:chapter.sectionId,source:chapter,photoIndex:take(ordinary[0]),title:chapter.title});
          spreads.push({master:'D01-SPREAD-TEXT-PHOTO-RHYTHM',sectionId:chapter.sectionId,left:textPage,right:photoPage,fixedRhythm:true});
          textSpreadStreak=0;
          if(meta.forceDarkFadeSequence===true&&!darkFadeInserted){
            const darkIndex=nextVisualPhoto();
            if(darkIndex>=0){
              const darkPhoto=chapter.photos[darkIndex],ratio=photoAspect(darkPhoto);
              const darkState=String(darkPhoto.darkFadeState||(ratio<.82?'V':ratio>1.22?'H':'S')).toUpperCase();
              const darkBase=P('dark-fade',{layout:'dark-fade-2.2',master:'D01-DARK-FADE-2.2',sectionId:chapter.sectionId,source:chapter,photoIndex:darkIndex,darkFadeState:darkState,darkFadeSide:'left',title:chapter.title});
              spreads.push({id:`d01_chapter_${index+1}_dark_fade`,master:'D01-SPREAD-DARK-FADE-2.2',sectionId:chapter.sectionId,left:darkBase,right:{...darkBase,id:`${darkBase.id}_right`,darkFadeSide:'right'},fixedRhythm:true,acceptanceOnly:true});
              darkFadeInserted=true;
            }
          }
          continue;
        }
        const spread={master:'D01-SPREAD-TEXT-RHYTHM',sectionId:chapter.sectionId,left:null,right:null};
        for(const side of ['left','right']){
          if(!rest)break;spread[side]=nextTextPage(side);
        }
        // The previous episode ended on a left page: a quiet quote pause closes
        // the spread so the next episode can open on a full spread.
        if(spread.left&&!spread.right&&pendingEpisode())spread.right=P('t08-pause',{layout:'t08-pause',master:'D01-T08-PAUSE',sectionId:chapter.sectionId,source:chapter,title:chapter.title,quoteSource:spread.left.text||'',avoidAccents:usedAccents.slice()});
        spreads.push(spread);
        textSpreadStreak++;
      }
      balanceChapterEnding();
      // Document/photos retain their existing masters; manuscript text is never routed through them.
      for(const document of chapter.documents){
        const source={...document,photos:document.photos||[]};
        spreads.push({master:'D01-SPREAD-DOCUMENT',sectionId:chapter.sectionId,left:P('document',{layout:'document-letter',master:'D01-DOCUMENT',source,title:document.title,text:document.text||''}),right:P('document-comment',{master:'D01-DOCUMENT-COMMENT',source,title:document.title,text:document.explanation||document.comment||'',transcript:(source.photos.length?String(document.text||''):''),note:String(document.explanation||document.comment||'')})});
      }
      // A printed book never leaves half a spread: an unpaired left page would
      // shift every following page to the wrong side. Close it with an unused
      // photograph of the chapter, otherwise with a quiet blank page.
      for(const spread of spreads.slice(chapterSpreadStart)){
        if(spread.single||!spread.left||spread.right)continue;
        const closingPhoto=nextVisualPhoto();
        spread.right=closingPhoto>=0
          ?P('large-photo',{layout:'photo-fullspread',master:'D01-LARGE-PHOTO',sectionId:chapter.sectionId,source:chapter,photoIndex:closingPhoto,title:chapter.title})
          :P('blank',{meta:bookMeta,sectionId:chapter.sectionId});
        spread.chapterClosing=true;
      }
    });
    if(hasMatter('afterword')||hasMatter('thanks'))spreads.push({master:'D01-SPREAD-AFTERWORD-THANKS',left:matter('afterword','epilogue','D01-FINAL','Послесловие'),right:matter('thanks','thanks','D01-THANKS','Благодарности')});
    if(hasMatter('sources')||byId('colophon')){
      const fields=fieldValues(byId('colophon'),4);
      spreads.push({master:'D01-SPREAD-SOURCES-COLOPHON',left:matter('sources','sources','D01-SOURCES','Источники'),right:byId('colophon')?P('colophon',{meta:bookMeta,rows:[{label:'Составитель',value:fields[0]||bookMeta.author},{label:'Дизайн и вёрстка',value:fields[1]},{label:'Год издания',value:fields[2]||bookMeta.year},{label:'Место издания',value:fields[3]}]}):P('blank',{meta:bookMeta})});
    }
    if(byId('back-endpaper'))spreads.push({master:'D01-SPREAD-ENDPAPER',left:P('endpaper',{meta:bookMeta}),right:P('endpaper',{meta:bookMeta})});
    if(byId('inside-back-cover'))spreads.push({master:'D01-SPREAD-INSIDE-BACK-COVER',left:P('blank',{meta:bookMeta}),right:P('inside-back-cover',{layout:'endpaper',meta:bookMeta})});
    const [backCoverText,backCoverMark]=fieldValues(byId('back-cover'),2);
    if(byId('back-cover'))spreads.push({master:'D01-SPREAD-BACK-COVER',left:P('back-cover',{layout:'back-cover',source:backCoverSource,meta:{...bookMeta,backCoverText,backCoverMark},photoIndex:0}),right:null,single:'left'});
    spreads.forEach((spread,index)=>{if(!spread.id)spread.id=`d01_spread_${index+1}`;});
    const pages=spreads.flatMap(spread=>[spread.left,spread.right].filter(Boolean));
    pages.forEach((page,index)=>{page.pageNo=index+1;});
    for(const item of contentsPage.items)item.page=pages.find(page=>page.sectionId===item.sectionId&&page.layout==='chapter-intro')?.pageNo||'';
    const result={ready:true,pagination:'dom-exact-v2',designPack:'design-01-editorial',spreads,pages,meta:bookMeta,expectedManuscripts,directorPlan:[]};
    const integrity=auditExactText(result);
    if(integrity.status!=='pass')throw new Error(`Проверка текста не пройдена: ${integrity.violations.map(item=>item.rule).join(', ')}`);
    return result;
  }

  function auditExactText(result) {
    const violations=[];
    for(const source of result.expectedManuscripts||[]){
      const pages=result.pages.filter(page=>page.sectionId===source.sectionId&&page.measuredFlow);
      if(pages.map(page=>page.text).join('')!==source.text)violations.push({rule:'chapter-source-mismatch',sectionId:source.sectionId});
      let end=0;
      for(const page of pages){
        if(page.sourceRange.start!==end)violations.push({rule:'source-gap-or-overlap',page:page.pageNo});
        end=page.sourceRange.end;
        const flow=page.measuredFlow;
        if(flow.sequence.map(part=>part.text).join('')!==page.text)violations.push({rule:'manuscript-loss-or-duplicate',page:page.pageNo});
        if(['important','important-margin'].includes(page.rhythm)&&!page.importantLine)violations.push({rule:'important-line-missing',page:page.pageNo});
      }
    }
    return {status:violations.length?'fail':'pass',violations,pages:result.pages.length,comparison:'exact',lostCharacters:violations.length?null:0};
  }

  function assemble(structure, meta = {}) {
    if (meta.textRhythmOnly === true) return assembleExactText(structure, meta);
    const P = pageFactory();
    const sections = (structure?.sections || []).filter(section => section && section.included !== false);
    const byId = id => sections.find(section => section.id === id);
    const chapters = sections.filter(section => section.type === 'chapter').map(normalizeChapter)
      .filter(chapter => chapter.segments.some(segment=>segment.userEdited && (meta.textRhythmOnly === true ? Boolean(segment.text.trim()) : wordCount(segment.text)>=45)) || chapter.photos.length || chapter.documents.length);
    attachStandaloneDocuments(sections, chapters);
    if (!chapters.length) return { ready: false, message: meta.textRhythmOnly === true ? 'Добавьте текст хотя бы в одну главу.' : 'Добавьте в главу минимум 45 слов, одну фотографию или документ.' };
    const textOnlyBook = chapters.every(chapter => chapter.photos.length === 0);
    // Current constructor pass: after the fixed chapter opening, prose is the
    // only active content rhythm. Photo masters remain in the pack for the
    // next implementation phase, but cannot unexpectedly re-enter this build.
    const textRhythmOnly = meta?.textRhythmOnly === true;
    const expectedManuscripts = textRhythmOnly ? chapters.map(chapter => ({
      sectionId: chapter.sectionId, text: chapter.segments.map(segment => segment.remaining).join(' ')
    })) : [];

    const usedChapterTitles = new Set();
    chapters.forEach((chapter, index) => {
      const key = norm(chapter.title);
      if (!key || key === 'новая глава' || usedChapterTitles.has(key)) chapter.title = `Глава ${index + 1}`;
      usedChapterTitles.add(norm(chapter.title));
    });

    // Resolve the chapter opener before planning the book-wide photo queue.
    // The opener is an editorial anchor: if a chapter has a suitable photo it
    // is the first visual beat; otherwise the left page becomes the quote.
    // Planning before this move used to attach the rail/dark/light roles to
    // the old indexes, so the next build could consume the wrong photo.
    chapters.forEach(chapter => {
      movePhotoToCursor(chapter.photos, 0, photo => heroEligible(photo) && photoAspect(photo) <= 1.05);
      if (!heroEligible(chapter.photos[0])) movePhotoToCursor(chapter.photos, 0, heroEligible);
    });

    // Apply the automatic rhythm only after every chapter is known. The
    // resulting private director hints do not enter saved photo metadata, so
    // the editor continues to show “Автоматически” until the author chooses a
    // manual override in the card.
    planAutomaticBookCompositions(chapters);

    const spreads = [];
    const [coverTitle, coverSubtitle, coverAuthor, coverFooter] = fieldValues(byId('cover'), 4);
    const [titleTitle, titleSubtitle, titleAuthor] = fieldValues(byId('title'), 3);
    const [epigraphText, epigraphSource] = fieldValues(byId('epigraph'), 2);
    const [dedicationText, dedicationSign] = fieldValues(byId('dedication'), 2);
    const coverSource = byId('cover')?.pages?.[0] || {};
    const backCoverSource = byId('back-cover')?.pages?.[0] || {};
    const bookMeta = Object.assign({}, meta, {
      title: coverTitle || meta.title || 'Семейная хроника',
      subtitle: coverSubtitle || meta.subtitle || '',
      author: coverAuthor || meta.author || '',
      coverFooter: coverFooter || ''
    });
    const titleMeta = Object.assign({}, bookMeta, {
      title: titleTitle || bookMeta.title,
      subtitle: titleSubtitle || bookMeta.subtitle,
      author: titleAuthor || bookMeta.author
    });

    if(byId('cover')) spreads.push({ id: 'd01_cover', master: 'D01-SPREAD-COVER', left: null, right: P('cover', { meta: bookMeta, source: coverSource }), single: 'right' });
    if(byId('endpaper')) spreads.push({ id: 'd01_endpaper_front', master: 'D01-SPREAD-ENDPAPER', left: P('endpaper', { meta: bookMeta }), right: P('endpaper', { meta: bookMeta }) });
    if(byId('title')) spreads.push({ id: 'd01_titles', master: 'D01-SPREAD-TITLES', left: P('half-title', { layout: 'half-title', meta: bookMeta }), right: P('title', { layout: 'title-page', meta: titleMeta }) });

    const contentsPage = P('contents-right', {
      meta: bookMeta,
      items: chapters.map((chapter, index) => ({ sectionId: chapter.sectionId, title: chapter.title, page: '', index }))
    });
    const epigraphPage = epigraphText ? P('epigraph', { epigraphText, epigraphSource, meta: bookMeta }) : P('epigraph', { epigraphText:'Память соединяет поколения.', epigraphSource:'', meta:bookMeta });
    const dedicationPage = P('dedication',{dedicationText:dedicationText||'Тем, кто хранит семейную память.',dedicationSign,meta:bookMeta});
    if(byId('dedication')){
      spreads.push({id:'d01_dedication_epigraph',master:'D01-SPREAD-DEDICATION-EPIGRAPH',left:dedicationPage,right:byId('epigraph')?epigraphPage:P('blank',{meta:bookMeta})});
      if(byId('contents')) spreads.push({id:'d01_contents',master:'D01-SPREAD-CONTENTS',left:P('blank',{meta:bookMeta}),right:contentsPage});
    }else if(byId('epigraph')||byId('contents')){
      spreads.push({ id: 'd01_epigraph_contents', master: 'D01-SPREAD-EPIGRAPH-CONTENTS', left: byId('epigraph')?epigraphPage:P('blank',{meta:bookMeta}), right: byId('contents')?contentsPage:P('blank',{meta:bookMeta}) });
    }

    const introMatter = sectionPage(byId('intro'), 'Вступление');
    const authorMatter = sectionPage(byId('author'), 'От автора');
    if(byId('intro')||byId('author')) spreads.push({
      id: 'd01_intro_author',
      master: 'D01-SPREAD-INTRO-AUTHOR',
      left: byId('intro')?P('intro', { master: 'D01-INTRO', title: introMatter.title || 'Вступление', text: introMatter.text, source: introMatter.source, meta: bookMeta }):P('blank',{meta:bookMeta}),
      right: byId('author')?P('author-note', { master: 'D01-AUTHOR', title: authorMatter.title || 'От автора', text: authorMatter.text, source: authorMatter.source, meta: bookMeta }):P('blank',{meta:bookMeta})
    });

    const usedQuotes = new Set();
    // A manually entered quote always wins. If an episode has no manual quote,
    // create one deterministic pull quote from its first suitable sentence.
    chapters.forEach(chapter => {
      chapter.segments.forEach((segment,index) => {
        const episodeStart=segment.isEpisodeStart || Boolean(segment.sectionTitle) || index===0;
        if (textRhythmOnly || segment.quote || !segment.text || !episodeStart) return;
        const candidate = sentenceQuote(segment.text, usedQuotes);
        if (!candidate) return;
        segment.quote = candidate;
        segment.text = stripQuote(segment.text, candidate);
        segment.remaining = segment.text;
        segment.autoQuote = true;
      });
    });
    const chapterFirstPages = new Map();
    let globalPhotoSide = 'left';
    const totalBookPhotos=chapters.reduce((sum,chapter)=>sum+chapter.photos.length,0);
    const maxAutomaticPanoramas=Math.max(1,Math.ceil(totalBookPhotos/12));
    let automaticPanoramaCount=0;
    let mosaicUsed=false;
    let bleedUsed=false;
    let darkTextBookUsed=false;
    // A dark text-only pause is not an automatic photo beat. It is opt-in
    // metadata for a future art-directed edition; the normal director uses
    // dark only when a planned dark-gradient photo is actually present.
    const automaticDarkTextEnabled = meta?.automaticDarkText === true;

    const textPage = (chapter, chunk, options = {}) => {
      const withHeading = Boolean(chunk.sectionTitle || (chunk.isStart && chunk.quote));
      const resolvedQuote = chunk.quote || (chunk.isStart ? chunk.segment?.quote || '' : '');
      const inlineQuote = chunk.internalQuote || options.inlineQuote || '';
      const withQuote = Boolean(resolvedQuote || inlineQuote) && options.allowQuote !== false;
      if(withQuote && chunk.segment) chunk.segment.quoteRendered=true;
      return P('text', {
        layout: 'prose-dense',
        master: withQuote ? 'D01-TEXT-QUOTE' : 'D01-TEXT',
        sectionId: chapter.sectionId,
        sourcePageUid: chunk.segment?.sourcePageUid,
        source: chapter,
        text: chunk.text,
        title: chunk.sectionTitle || chapter.title,
        sectionTitle: chunk.sectionTitle,
        episode: chunk.segment?.episode || chapter.episode,
        episodeNo: chunk.segment?.episodeNo || 1,
        showHeading: withHeading,
        dropCap: withHeading && chunk.segment?.dropCapPreference !== 'off',
        pullQuote: withQuote ? (resolvedQuote || inlineQuote) : '',
        dateWatermark: chunk.dateWatermark || '',
        fillRatio: Math.min(1, wordCount(chunk.text) / pageWords(meta, withHeading ? 'textQuote' : inlineQuote ? 'textInlineQuote' : 'text'))
      });
    };
    // A dark photo-gradient is a spread treatment: its companion page must
    // use the dark reading master as well, otherwise the preview produces a
    // black photo page next to an unrelated white text page.
    const darkTextPage = (chapter, chunk = {}) => {
      const page = textPage(chapter, chunk, { allowQuote: false });
      page.kind = 'dark-text';
      page.layout = 'dark-text';
      page.master = 'D01-DARK-TEXT';
      page.pullQuote = '';
      return page;
    };
    // The old engine used a static word count for every page. That count is
    // only an estimate: headings, pull quotes, drop caps and photo rails all
    // change the real CSS box. When the browser supplies textFit(), paginate
    // against the actual rendered composition and keep whole words intact.
    const measuredSplit = (chapter, segment, maxWords, fitKey = 'text', options = {}) => {
      const fallback = takeWords(segment.remaining, maxWords);
      const fit = typeof meta.textFit === 'function' ? meta.textFit : null;
      if (!fit) { if (textRhythmOnly) throw new Error('Для пагинации требуется DOM.'); return fallback; }
      const words = wordList(segment.remaining);
      // maxWords is only a fallback for environments without a DOM probe. Once
      // real metrics are available, the manuscript itself is the upper bound.
      // This prevents the old artificial cap from moving a perfectly fitting
      // line to the next page.
      const limit = words.length;
      const isStart = !segment.started;
      const base = {
        key: fitKey,
        sectionTitle: isStart ? segment.sectionTitle : '',
        // Inline pull quotes are an independent row even on a continuation
        // segment. The old isStart-only condition measured the prose as if
        // the quote were absent, then the renderer added it afterwards.
        // That made the last line disappear from the right column.
        quote: fitKey === 'textInlineQuote'
          ? (segment.pendingInlineQuote || options.quote || '')
          : (isStart ? segment.quote : ''),
        dateWatermark: isStart ? segment.dateWatermark : '',
        isStart,
        episode: segment.episode,
        episodeNo: segment.episodeNo,
        ...options
      };
      let low = 1;
      let high = limit;
      let best = 0;
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        const candidate = words.slice(0, middle).join(' ');
        let fits = false;
        try { fits = fit(Object.assign({}, base, { text: candidate })); } catch (error) { fits = false; }
        if (fits) {
          best = middle;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }
      // A renderer that is still loading must not deadlock pagination. Keep a
      // whole-word fallback for that transient case; never slice characters.
      if (!best && textRhythmOnly) throw new Error('Текст не помещается в измеряемую область.');
      return takeWords(segment.remaining, best > 0 ? best : Math.min(words.length, Math.max(1, Math.floor(Number(maxWords) || 1))));
    };
    const consumeMeasuredSegment = (chapter, maxWords, fitKey = 'text', options = {}) => {
      const segment = currentSegment(chapter);
      if (!segment) return { text: '', sectionTitle: '', quote: '', isStart: false, segment: null };
      const isStart = !segment.started;
      const split = measuredSplit(chapter, segment, maxWords, fitKey, options);
      segment.remaining = split.tail;
      segment.started = true;
      return {
        text: split.head,
        sectionTitle: isStart ? segment.sectionTitle : '',
        quote: isStart ? segment.quote : '',
        dateWatermark: isStart ? segment.dateWatermark : '',
        isStart,
        segment
      };
    };
    const splitMeasuredPages = (text, maxWords, fitKey) => {
      const source = normalizeProse(text);
      if (!source) return [];
      if (typeof meta.textFit !== 'function') return splitIntoPages(source, maxWords);
      const pages = [];
      let remaining = source;
      while (remaining && pages.length < 80) {
        const segment = { remaining, started: false, sectionTitle: '', quote: '', dateWatermark: '', episode: '', episodeNo: 1 };
        const split = measuredSplit(null, segment, maxWords, fitKey);
        if (!split.head) break;
        pages.push(split.head);
        remaining = split.tail;
      }
      return pages;
    };
    // Keep ordinary prose flowing across the whole spread.  A source page is
    // not a reason to leave the second side empty: when the first source page
    // ends, the next editorial segment continues on the companion page.
    const continuationWords = (chapter, limit) => {
      let total = 0;
      let first = true;
      for (const segment of chapter.segments) {
        const count = wordCount(segment.remaining);
        if (!count) continue;
        if (!first && (segment.dateLabel || segment.sectionTitle || segment.quote)) break;
        total += count;
        first = false;
        if (total > limit) return total;
      }
      return total;
    };
    const consumeMeasuredFlow = (chapter, maxWords, fitKey = 'text', options = {}) => {
      const first = currentSegment(chapter);
      if (!first) return { text:'', sectionTitle:'', quote:'', isStart:false, segment:null };
      const isStart = !first.started;
      const parts = [];
      const segments = [];
      let cursor = chapter.segments.indexOf(first);
      while (cursor >= 0 && cursor < chapter.segments.length) {
        const segment = chapter.segments[cursor];
        if (!wordCount(segment.remaining)) { cursor += 1; continue; }
        if (segments.length && (segment.dateLabel || segment.sectionTitle || segment.quote)) break;
        segments.push(segment);
        parts.push(...wordList(segment.remaining));
        cursor += 1;
      }
      if (!parts.length) return { text:'', sectionTitle:'', quote:'', isStart:false, segment:null };

      const fit = typeof meta.textFit === 'function' ? meta.textFit : null;
      let best = Math.min(parts.length, Math.max(1, Math.floor(Number(maxWords) || 1)));
      if (textRhythmOnly && !fit) throw new Error('Для пагинации требуется DOM.');
      if (fit) {
        const base = {
          key: fitKey,
          sectionTitle: isStart ? first.sectionTitle : '',
          quote: fitKey === 'textInlineQuote'
            ? (first.pendingInlineQuote || options.quote || '')
            : (isStart ? first.quote : ''),
          dateWatermark: isStart ? first.dateWatermark : '',
          isStart,
          episode: first.episode,
          episodeNo: first.episodeNo,
          ...options
        };
        let low = 1;
        const requestedLimit = Number(options.wordLimit);
        let high = Number.isFinite(requestedLimit) && requestedLimit > 0
          ? Math.min(parts.length, Math.floor(requestedLimit))
          : parts.length;
        let measured = 0;
        while (low <= high) {
          const middle = Math.floor((low + high) / 2);
          let fits = false;
          try { fits = fit(Object.assign({}, base, { text: parts.slice(0, middle).join(' ') })); } catch (error) { fits = false; }
          if (fits) { measured = middle; low = middle + 1; }
          else high = middle - 1;
        }
        if (textRhythmOnly && !measured) throw new Error('Текст не помещается в измеряемую область.');
        if (measured > 0) best = measured;
      }

      let toConsume = Math.min(best, parts.length);
      const consumed = [];
      segments.forEach(segment => {
        if (!toConsume) return;
        const words = wordList(segment.remaining);
        const count = Math.min(toConsume, words.length);
        if (!count) return;
        consumed.push(...words.slice(0, count));
        segment.remaining = words.slice(count).join(' ');
        segment.started = true;
        toConsume -= count;
      });
      return {
        text: consumed.join(' '),
        sectionTitle: isStart ? first.sectionTitle : '',
        quote: isStart ? first.quote : '',
        dateWatermark: isStart ? first.dateWatermark : '',
        isStart,
        editorialAccentKind: options.editorialAccentKind || '',
        editorialAccentOccurrence: Number.isInteger(options.editorialAccentOccurrence) ? options.editorialAccentOccurrence : 0,
        editorialSequenceIndex: Number.isInteger(options.editorialSequenceIndex) ? options.editorialSequenceIndex : 0,
        editorialOverrideKey: options.editorialOverrideKey || '',
        segment: first
      };
    };
    const consumeEditorialPage = (chapter, maxWords, fitKey = 'text', options = {}) =>
      consumeMeasuredFlow(chapter, maxWords, fitKey, options);
    const consumeEditorialPair = (chapter, maxWords, firstMaxWords = maxWords, firstReserveWords = 0, firstFitKey = 'text', secondFitKey = 'text') => {
      const sourceSegment = currentSegment(chapter);
      if (!sourceSegment) return [{ text:'', segment:null }, { text:'', segment:null }];
      const total = continuationWords(chapter, firstMaxWords + maxWords);
      const hasOpeningMarker = !sourceSegment.started && Boolean(sourceSegment.sectionTitle || sourceSegment.quote);

      // Rebalance only the final/short spread of one uninterrupted text flow.
      // This is the key difference from the previous word-cap approach: the
      // source-page boundary is ignored, while a new heading/quote/date stays
      // an intentional boundary.
      if (!hasOpeningMarker && total > firstMaxWords && total <= firstMaxWords + maxWords) {
        // A first-page internal pull quote is rendered after pagination. Its
        // visual height must therefore be reserved before balancing the prose;
        // otherwise the quote lands at the bottom of the first column and
        // either splits or leaves the companion column visibly short.
        const firstTarget = Math.min(firstMaxWords, Math.max(40, Math.ceil((total - Math.max(0, firstReserveWords)) / 2)));
        const first = consumeEditorialPage(chapter, firstTarget, firstFitKey, { wordLimit: firstTarget });
        const second = consumeEditorialPage(chapter, Math.max(1, total - wordCount(first.text)), secondFitKey);
        return [first, second];
      }

      const first = consumeEditorialPage(chapter, firstMaxWords, firstFitKey);
      const following = currentSegment(chapter);
      if (!following || following.dateLabel) return [first, { text:'', segment:null }];
      const followingCapacity = !following.started && following.sectionTitle
        ? (following.quote ? pageWords(meta,'textQuote') : pageWords(meta,'textHeading'))
        : maxWords;
      const second = consumeEditorialPage(chapter, followingCapacity, secondFitKey);
      return [first, second];
    };
    const consumeEditorialChunk = (chapter, maxWords, firstMaxWords = maxWords, shortTailWords = Math.max(48, Math.floor(maxWords * .18)), fitKey = 'text') =>
      // The measured flow already spans consecutive source pages. Keeping the
      // old second pass here made a continuation look like a fresh full page,
      // then concatenated it back and clipped the last lines.
      consumeMeasuredFlow(chapter, firstMaxWords, fitKey);
    const quietCompanion = chapter => P('quote',{
      layout:'quote',master:'D01-QUOTE',sectionId:chapter.sectionId,source:chapter,
      quote:chapter.segments.find(segment=>segment.quote)?.quote || sentenceQuote(chapter.text,usedQuotes) || chapter.title,
      episode:chapter.episode
    });
    const photoOnlyCompanion = chapter => P('blank',{layout:'blank',master:'D01-ENDPAPER',sectionId:chapter.sectionId,source:chapter});

    chapters.forEach((chapter, chapterIndex) => {
      // The chapter opening is the same editorial stream as every later text
      // page.  A short source-page record must never strand its tail and make
      // the next rendered page appear to start with unrelated prose.
      const intro = consumeEditorialPage(chapter, pageWords(meta,'chapter'), 'chapter');
      let photoCursor = 0;
      const hasHero = heroEligible(chapter.photos[0]);
      const openingQuote = intro.quote || intro.segment?.quote || sentenceQuote(intro.text, usedQuotes) || chapter.title;
      const openingLeftVariant = String(chapter.openingLeftVariant || '').toLowerCase();
      const hero = hasHero
        ? P('chapter', { layout: 'chapter-photo', master: 'D01-CHAPTER-PHOTO', sectionId: chapter.sectionId, sourcePageUid: chapter.sourcePageUid, source: chapter, photoIndex: 0, chapterNo: chapterIndex + 1, title: chapter.title, episode: chapter.episode })
        : openingLeftVariant === 'initial'
          ? P('chapter-initial', { layout:'chapter-initial', master:'D01-CHAPTER-INITIAL', sectionId:chapter.sectionId, source:chapter, initialLetter:chapter.title, initialText:chapter.openingInitialText || openingQuote, quote:openingQuote, episode:chapter.episode })
          : P('quote', { layout:'quote', master:'D01-QUOTE', sectionId:chapter.sectionId, source:chapter, quote:openingQuote, quoteTone:'light', episode:chapter.episode });
      const opening = P('chapter', { layout: 'chapter-intro', master: 'D01-CHAPTER-TEXT', sectionId: chapter.sectionId, sourcePageUid: chapter.sourcePageUid, source: chapter, text: intro.text, dateWatermark: intro.dateWatermark || '', chapterNo: chapterIndex + 1, title: chapter.title, episode: chapter.episode });
      if (hasHero) photoCursor = 1;
      // A chapter opener has one fixed reading direction across the entire
      // book: the visual/quote anchor is on the left and the title plus lead
      // text are on the right. Alternating the opener by chapter made the
      // book feel like a random gallery rather than a designed sequence.
      const chapterPhotoSide = 'left';
      spreads.push({ id: `d01_chapter_${chapterIndex + 1}_open`, master: 'D01-SPREAD-CHAPTER', sectionId: chapter.sectionId, left: chapterPhotoSide === 'left' ? hero : opening, right: chapterPhotoSide === 'left' ? opening : hero });
      globalPhotoSide = chapterPhotoSide === 'left' ? 'right' : 'left';
      if (textRhythmOnly) photoCursor = chapter.photos.length;

      let previousMaster = 'D01-SPREAD-CHAPTER';
      let documentCursor = 0;
      let contentSpreadCount = 0;
      let panoramaUsed = false;
      let darkTextUsed = false;
      let quotePauseCount = 0;
      let textRhythmCursor = 0;
      const rhythmOccurrences = { important: 0, margin: 0, 'inline-quote': 0, 'important-margin': 0 };
      const quoteTone = requested => {
        const explicit = String(requested || '').toLowerCase();
        if (explicit === 'light' || explicit === 'dark') return explicit;
        if (isDarkSpread(previousMaster)) return 'light';
        const tone = quotePauseCount % 2 === 0 ? 'light' : 'dark';
        quotePauseCount++;
        return tone;
      };
      const triptychGroupsUsed = new Set();
      let guard = 0;
      while (textRhythmOnly || guard++ < 80) {
        const wordsLeft = remainingWords(chapter);
        const photosLeft = chapter.photos.length - photoCursor;
        const documentsLeft = chapter.documents.length - documentCursor;
        const datesLeft = chapter.segments.some(segment=>segment.dateLabel&&!segment.dateRendered);
        if (!wordsLeft && !photosLeft && !documentsLeft && !datesLeft) break;

        // Active text-first pass: after the fixed chapter opening, each page
        // receives the next treatment in the same three-block cycle. This
        // branch intentionally runs before the photo/document fallbacks so the
        // manuscript cannot be displaced by a visual card.
        if (documentsLeft && (contentSpreadCount > 0 || (!wordsLeft && !photosLeft))) {
          const document = chapter.documents[documentCursor++];
          const documentSource = Object.assign({}, document, { photos: document.photos || [], inferred: document.inferred || {} });
          const explanation = String(document.comment || document.explanation || document.story || document.photos?.[0]?.story || '').trim();
          const documentPages=[];
          if(documentSource.photos.length){
            documentPages.push(P('document',{layout:'document-letter',master:'D01-DOCUMENT',sectionId:chapter.sectionId,sourcePageUid:document.uid,source:documentSource,text:'',title:document.title||'Архивный документ',episode:'Документ'}));
          }
          splitMeasuredPages(document.text || '',pageWords(meta,'document'),'document').forEach((copy,index)=>{
            documentPages.push(P('document',{layout:'document-letter',master:'D01-DOCUMENT',sectionId:chapter.sectionId,sourcePageUid:document.uid,source:Object.assign({},documentSource,{photos:[]}),text:copy,title:index?`${document.title||'Документ'} · продолжение`:document.title||'Расшифровка документа',episode:'Документ',continuation:index>0}));
          });
          splitMeasuredPages(explanation,pageWords(meta,'documentComment'),'documentComment').forEach((copy,index)=>{
            documentPages.push(P('document-comment',{master:'D01-DOCUMENT-COMMENT',sectionId:chapter.sectionId,sourcePageUid:document.uid,source:documentSource,text:copy,title:index?'Пояснение · продолжение':'Пояснение к документу',episode:chapter.episode,continuation:index>0}));
          });
          if(!documentPages.length) continue;
          for(let pageIndex=0;pageIndex<documentPages.length;pageIndex+=2){
            const left=documentPages[pageIndex];
            const right=documentPages[pageIndex+1]||P('blank',{master:'D01-ENDPAPER',meta:bookMeta});
            const documentMaster=pageIndex?'D01-SPREAD-DOCUMENT-CONTINUATION':'D01-SPREAD-DOCUMENT';
            spreads.push({id:`d01_document_${chapterIndex+1}_${documentCursor}_${pageIndex/2+1}`,master:documentMaster,sectionId:chapter.sectionId,left,right});
            previousMaster=documentMaster;
          }
          continue;
        }

        const next = currentSegment(chapter);
        const pendingDate=chapter.segments.find((segment,index)=>segment.dateLabel&&!segment.dateRendered&&chapter.segments.slice(0,index).every(previous=>!wordCount(previous.remaining)));
        if(pendingDate){
          pendingDate.dateRendered=true;
          const dateChunk=wordCount(pendingDate.remaining)?consumeMeasuredSegment(chapter,pageWords(meta,'dateEra'), 'dateEra'):{text:'',segment:pendingDate};
          const era=P('date-era',{layout:'date-era',master:'D01-DATE-ERA',sectionId:chapter.sectionId,sourcePageUid:pendingDate.sourcePageUid,source:chapter,dateLabel:pendingDate.dateLabel,text:dateChunk.text,title:pendingDate.sectionTitle||pendingDate.episode||chapter.title,episode:pendingDate.episode||chapter.episode,episodeNo:pendingDate.episodeNo||1});
          const hasAssociatedComposite=chapter.photos.slice(photoCursor).some(photo=>photo._sourcePageUid===pendingDate.sourcePageUid&&['photo-side-text','photo-top-text','text-top-photo','dark-split','photo-overlay-text'].includes(preference(photo)));
          const companionCapacity=hasAssociatedComposite?Math.max(120,pageWords(meta,'text')-pageWords(meta,'photoSideText')):pageWords(meta,'text');
          const companionChunk=remainingWords(chapter)?consumeEditorialPage(chapter,companionCapacity,'text'):{text:'',segment:null};
          if(companionChunk.text&&pendingDate.quote){companionChunk.quote=pendingDate.quote;pendingDate.quoteRendered=true;}
          const companion=companionChunk.text?textPage(chapter,companionChunk):quietCompanion(chapter);
          spreads.push({master:'D01-SPREAD-DATE-ERA',sectionId:chapter.sectionId,left:era,right:companion});
          previousMaster='D01-SPREAD-DATE-ERA';contentSpreadCount++;
          continue;
        }
        const newEpisode = Boolean(next && !next.started && next.sectionTitle);
        if (newEpisode && wordsLeft) {
          const forcedQuote = next.quote || sentenceQuote(next.remaining, usedQuotes);
          // An episode opening consumes a full editorial page, not only the
          // current source-page segment. Once the opening segment ends, an
          // unmarked continuation is allowed to flow into the same page,
          // exactly as in a word processor. This prevents a short source-page
          // tail from making the companion page look truncated.
          const firstChunk = consumeEditorialPage(chapter, forcedQuote ? pageWords(meta,'textQuote') : pageWords(meta,'textHeading'), forcedQuote ? 'textQuote' : 'textHeading');
          if (forcedQuote) { firstChunk.quote = forcedQuote; firstChunk.text = stripQuote(firstChunk.text, forcedQuote); }
          const first = textPage(chapter, firstChunk);
          if (forcedQuote) { first.master = 'D01-TEXT-QUOTE'; first.pullQuote = forcedQuote; }
          const following = currentSegment(chapter);
          const followingText = following && !following.dateLabel ? following : null;
          const secondCapacity = followingText && !followingText.started && followingText.sectionTitle
            ? (followingText.quote ? pageWords(meta,'textQuote') : pageWords(meta,'textHeading'))
            : pageWords(meta,'text');
          const secondChunk = followingText
            ? consumeEditorialPage(chapter, secondCapacity, followingText && !followingText.started && followingText.sectionTitle ? (followingText.quote ? 'textQuote' : 'textHeading') : 'text')
            : { text: '', sectionTitle: '', quote: '', isStart: false, segment: null };
          // Dark text is reserved for the deliberate dark-pause rhythm below;
          // a short companion stays light so dark quote pages do not repeat.
          const useDarkCompanion=false;
          let second;
          if(useDarkCompanion){
            const darkPull=sentenceQuote(secondChunk.text,usedQuotes);
            second=P('dark-text',{layout:'dark-text',master:'D01-DARK-TEXT',sectionId:chapter.sectionId,sourcePageUid:secondChunk.segment?.sourcePageUid,source:chapter,text:stripQuote(secondChunk.text,darkPull),title:secondChunk.sectionTitle||chapter.title,sectionTitle:secondChunk.sectionTitle,episode:secondChunk.segment?.episode||chapter.episode,pullQuote:darkPull});
            darkTextUsed=true;darkTextBookUsed=true;
          }else second=secondChunk.text?textPage(chapter,secondChunk,{allowQuote:Boolean(secondChunk.sectionTitle)}):null;
          const textSpreadMaster=useDarkCompanion?'D01-SPREAD-DARK-TEXT':firstChunk.quote?'D01-SPREAD-TEXT-QUOTE':'D01-SPREAD-TEXT';
          spreads.push({ master:textSpreadMaster, sectionId: chapter.sectionId, left: first, right: second });
          previousMaster=textSpreadMaster;
          contentSpreadCount++;
          continue;
        }

        // A restrained two-page dark pause: ordinary prose on both pages,
        // without turning the spread into a pair of decorative quotations.
        // It is intentionally rare and only appears after the opening rhythm
        // has established the chapter.
        const autoDarkTextPair=Boolean(automaticDarkTextEnabled&&!textOnlyBook&&!darkTextUsed&&!darkTextBookUsed&&!photosLeft&&wordCount(currentSegment(chapter)?.remaining)>=pageWords(meta,'darkText')*2&&(contentSpreadCount===1||contentSpreadCount%5===3)&&!isDarkPauseBlocked(previousMaster));
        if(autoDarkTextPair){
          const firstChunk=consumeEditorialPage(chapter,pageWords(meta,'darkText'), 'darkText');
          const secondChunk=remainingWords(chapter)
            ? consumeEditorialPage(chapter,pageWords(meta,'darkText'), 'darkText')
            : {text:'',segment:null};
          const first=P('dark-text',{layout:'dark-text',master:'D01-DARK-TEXT',sectionId:chapter.sectionId,sourcePageUid:firstChunk.segment?.sourcePageUid,source:chapter,text:firstChunk.text,title:firstChunk.sectionTitle||chapter.title,sectionTitle:firstChunk.sectionTitle,episode:firstChunk.segment?.episode||chapter.episode});
          const second=secondChunk.text?P('dark-text',{layout:'dark-text',master:'D01-DARK-TEXT',sectionId:chapter.sectionId,sourcePageUid:secondChunk.segment?.sourcePageUid,source:chapter,text:secondChunk.text,title:secondChunk.sectionTitle||chapter.title,sectionTitle:secondChunk.sectionTitle,episode:secondChunk.segment?.episode||chapter.episode}):quietCompanion(chapter);
          const darkOnLeft=chapterIndex%2===0;
          spreads.push({master:'D01-SPREAD-DARK-TEXT-PAIR',sectionId:chapter.sectionId,left:darkOnLeft?first:second,right:darkOnLeft?second:first});
          previousMaster='D01-SPREAD-DARK-TEXT-PAIR';contentSpreadCount++;darkTextUsed=true;darkTextBookUsed=true;
          continue;
        }

        // A user can explicitly request one photograph across both pages.
        // Keep the same source on the two page objects; the renderer crops the
        // left and right halves of that source, so this is a true panorama,
        // not two unrelated square photos.
        const panoramaPhoto = chapter.photos[photoCursor];

        // If another visually heavy composition is waiting immediately after
        // a heavy spread, place a full text spread between them. This keeps the
        // photographic rhythm without letting the ordinary photo/text fallback
        // consume a panorama, cross-spine image, mosaic or grouped composition.
        const waitingPreference=panoramaPhoto?preference(panoramaPhoto):'';
        const waitingHeavyPhoto=Boolean(panoramaPhoto&&(
          ['spread','bleed-text','spread-pair','triptych','duo','stacked-text','mosaic','quote-band-pair','photo-1p5-text','photo-gradient-text','dark-gradient-photo'].includes(waitingPreference) ||
          (isAuto(panoramaPhoto)&&photoAspect(panoramaPhoto)>=1.55&&highResolution(panoramaPhoto))
        ));
        const waitingReferencePhoto=Boolean(panoramaPhoto&&(
          ['photo-top-text','text-top-photo','photo-side-text','dark-split','dark-photo-pair','photo-overlay-text'].includes(waitingPreference) ||
          (isAuto(panoramaPhoto)&&photoAspect(panoramaPhoto)>=1.08&&photoAspect(panoramaPhoto)<1.35)
        ));
        if((waitingHeavyPhoto||waitingReferencePhoto)&&isHeavySpread(previousMaster)&&wordsLeft){
          const firstSegment=currentSegment(chapter);
          const firstHasHeading=!firstSegment?.started&&Boolean(firstSegment?.sectionTitle);
          const firstHasQuote=!firstSegment?.started&&Boolean(firstSegment?.quote);
          // Every third ordinary text spread gets one deterministic pull quote
          // in the reserved row above the columns. It is never a child of the
          // multicolumn flow, so it cannot create a third column or split.
          const inlineQuoteCandidate=(!firstHasHeading&&!firstHasQuote&&contentSpreadCount>0&&contentSpreadCount%3===2)
            ? quoteCandidate(takeWords(firstSegment?.remaining||'',Math.max(80,Math.floor(pageWords(meta,'text')*.82))).head,usedQuotes,contentSpreadCount) : '';
          const firstNeedsInlineQuote=Boolean(inlineQuoteCandidate);
          const firstCapacity=firstNeedsInlineQuote?pageWords(meta,'textInlineQuote'):firstHasQuote?pageWords(meta,'textQuote'):firstHasHeading?pageWords(meta,'textHeading'):pageWords(meta,'text');
          if(firstNeedsInlineQuote&&firstSegment) firstSegment.pendingInlineQuote=inlineQuoteCandidate;
          const firstFitKey=firstNeedsInlineQuote?'textInlineQuote':firstHasQuote?'textQuote':firstHasHeading?'textHeading':'text';
          const [firstChunk,secondChunk]=consumeEditorialPair(chapter,pageWords(meta,'text'),firstCapacity,firstNeedsInlineQuote?90:0,firstFitKey,'text');
          if(firstSegment) delete firstSegment.pendingInlineQuote;
          if(firstNeedsInlineQuote&&firstChunk.text.includes(inlineQuoteCandidate)){
            usedQuotes.add(norm(inlineQuoteCandidate));
            firstChunk.text=stripQuote(firstChunk.text,inlineQuoteCandidate);
            firstChunk.internalQuote=inlineQuoteCandidate;
          }
          const first=textPage(chapter,firstChunk);
          const second=secondChunk.text?textPage(chapter,secondChunk,{allowQuote:false}):quietCompanion(chapter);
          spreads.push({master:'D01-SPREAD-TEXT',sectionId:chapter.sectionId,left:first,right:second});
          previousMaster='D01-SPREAD-TEXT';contentSpreadCount++;
          continue;
        }
        if(next?.quote && next.started && !next.quoteRendered && !next.autoQuote && wordsLeft && contentSpreadCount%4===0){
          next.quoteRendered=true;
          const chunk=consumeEditorialPage(chapter,pageWords(meta,'quoteCompanion'), 'quoteCompanion');
          const quotePage=P('quote',{layout:'quote',master:'D01-QUOTE',sectionId:chapter.sectionId,source:chapter,quote:next.quote,quoteTone:quoteTone(next.quoteTone),episode:next.episode||chapter.episode});
          const copy=textPage(chapter,Object.assign({},chunk,{sectionTitle:'',quote:''}),{allowQuote:false});
          const quoteOnLeft=chapterIndex%2===0;
          spreads.push({master:'D01-SPREAD-QUOTE',sectionId:chapter.sectionId,left:quoteOnLeft?quotePage:copy,right:quoteOnLeft?copy:quotePage});
          previousMaster='D01-SPREAD-QUOTE'; contentSpreadCount++;
          continue;
        }
        if (panoramaPhoto && preference(panoramaPhoto)==='text-quote' && !panoramaPhoto._textQuoteHandled && wordsLeft) {
          panoramaPhoto._textQuoteHandled=true;
          const segment=currentSegment(chapter);
          const pull=segment?.quote || sentenceQuote(segment?.remaining || chapter.text,usedQuotes);
          const chunk=consumeEditorialPage(chapter,pull?pageWords(meta,'textQuote'):pageWords(meta,'text'), pull?'textQuote':'text');
          const first=textPage(chapter,Object.assign({},chunk,{quote:pull||chunk.quote}));
          const nextChunk=remainingWords(chapter)?consumeEditorialPage(chapter,pageWords(meta,'text'), 'text'):{text:'',segment:null};
          const second=nextChunk.text?textPage(chapter,nextChunk,{allowQuote:false}):P('quote',{layout:'quote',master:'D01-QUOTE',sectionId:chapter.sectionId,source:chapter,quote:pull||'Семейная память продолжает жить.',episode:chapter.episode});
          spreads.push({master:'D01-SPREAD-TEXT-QUOTE',sectionId:chapter.sectionId,left:first,right:second});
          previousMaster='D01-SPREAD-TEXT-QUOTE'; contentSpreadCount++;
          continue;
        }
        const panoramaIsHorizontal=Boolean(panoramaPhoto&&photoAspect(panoramaPhoto)>=1.35);
        const explicitPanorama = Boolean(panoramaPhoto && panoramaIsHorizontal && !panoramaPhoto._triptychReserved && (preference(panoramaPhoto) === 'spread' || panoramaPhoto.layoutPreference === 'spread' || panoramaPhoto.fullSpread === true || panoramaPhoto.spread === true));
        const automaticPanorama = Boolean(panoramaPhoto && panoramaIsHorizontal && !panoramaPhoto._triptychReserved && !panoramaPhoto._directorReserved && autoPanoramaCandidate(panoramaPhoto) && !panoramaUsed && automaticPanoramaCount<maxAutomaticPanoramas && !isHeavySpread(previousMaster));
        if (panoramaPhoto && (explicitPanorama || automaticPanorama)) {
          const idx = photoCursor++;
          const left = P('photo', { layout: 'panorama', master: 'D01-PANORAMA', panorama: true, panoramaSide: 'left', sectionId: chapter.sectionId, source: chapter, photoIndex: idx, episode: chapter.episode });
          const right = P('photo', { layout: 'panorama', master: 'D01-PANORAMA', panorama: true, panoramaSide: 'right', hideCaption: true, sectionId: chapter.sectionId, source: chapter, photoIndex: idx, episode: chapter.episode });
          spreads.push({ master: 'D01-SPREAD-PANORAMA', sectionId: chapter.sectionId, left, right, panorama: true });
          previousMaster = 'D01-SPREAD-PANORAMA';
          panoramaUsed = true;
          if(automaticPanorama) automaticPanoramaCount++;
          contentSpreadCount++;
          continue;
        }

        // A horizontal image may cross the spine and continue into part of
        // the neighbouring page, leaving a narrow editorial text rail.
        const bleedPhoto=chapter.photos[photoCursor];
        const explicitBleed=bleedPhoto&&preference(bleedPhoto)==='bleed-text'&&photoAspect(bleedPhoto)>=1.35;
        const automaticBleed=Boolean(bleedPhoto&&isAuto(bleedPhoto)&&photoAspect(bleedPhoto)>=1.55&&highResolution(bleedPhoto)&&wordsLeft>=140&&!bleedUsed&&contentSpreadCount>=2&&!isHeavySpread(previousMaster));
        if(bleedPhoto&&wordsLeft&&(explicitBleed||automaticBleed)){
          const chunk=consumeEditorialChunk(chapter,pageWords(meta,'bleedText'),pageWords(meta,'bleedText'),Math.max(48,Math.floor(pageWords(meta,'bleedText')*.18)),'bleedText');
          const index=photoCursor++;
          const railSide=bleedPhoto.textRailSide==='left'?'left':bleedPhoto.textRailSide==='right'?'right':contentSpreadCount%2===0?'right':'left';
          const left=P('bleed-text',{layout:'bleed-text',master:'D01-BLEED-TEXT',bleedSide:railSide==='right'?'left':'rail-left',railSide,sectionId:chapter.sectionId,source:chapter,photoIndex:index,episode:chapter.episode});
          const right=P('bleed-text',{layout:'bleed-text',master:'D01-BLEED-TEXT',bleedSide:railSide==='right'?'right':'full-right',railSide,sectionId:chapter.sectionId,sourcePageUid:chunk.segment?.sourcePageUid,source:chapter,photoIndex:index,text:chunk.text,title:chunk.sectionTitle||chapter.title,sectionTitle:chunk.sectionTitle,episode:chunk.segment?.episode||chapter.episode});
          spreads.push({master:'D01-SPREAD-BLEED-TEXT',sectionId:chapter.sectionId,left,right,continuousImage:true});
          previousMaster='D01-SPREAD-BLEED-TEXT';contentSpreadCount++;bleedUsed=true;globalPhotoSide='left';
          continue;
        }

        // One source photo occupies a full page and continues onto roughly
        // half of the next page; the remaining half is a text rail. The rail
        // mirrors left/right while the source index stays identical on both
        // pages, so it is a real 1.5-page image composition.
        const railPhoto=chapter.photos[photoCursor];
        const railPreference=railPhoto?preference(railPhoto):'';
        const explicitPhotoRail=Boolean(railPhoto&&['photo-rail','photo-rail-right','photo-rail-left','photo-1p5-text'].includes(railPreference));
        const automaticPhotoRail=Boolean(railPhoto&&isAuto(railPhoto)&&photoAspect(railPhoto)>=1.35&&photoAspect(railPhoto)<1.48&&wordsLeft>=120&&contentSpreadCount%4===1&&!isHeavySpread(previousMaster));
        if(railPhoto&&wordsLeft&&(explicitPhotoRail||automaticPhotoRail)){
          const chunk=consumeEditorialChunk(chapter,pageWords(meta,'photoSideText'),pageWords(meta,'photoSideText'),Math.max(48,Math.floor(pageWords(meta,'photoSideText')*.18)),'photoRailText');
          const index=photoCursor++;
          const railSide=railPreference==='photo-rail-left'?'left':railPreference==='photo-rail-right'?'right':contentSpreadCount%2===0?'right':'left';
          const imagePage=P('photo-rail-image',{layout:'photo-rail-image',master:'D01-PHOTO-RAIL',sectionId:chapter.sectionId,source:chapter,photoIndex:index,railSide,episode:chapter.episode});
          const textPage=P('photo-rail-text',{layout:'photo-rail-text',master:'D01-PHOTO-RAIL',sectionId:chapter.sectionId,sourcePageUid:chunk.segment?.sourcePageUid,source:chapter,photoIndex:index,railSide,text:chunk.text,title:chunk.sectionTitle||chapter.title,sectionTitle:chunk.sectionTitle,episode:chunk.segment?.episode||chapter.episode,episodeNo:chunk.segment?.episodeNo||1});
          // The requested rail side is the text side of the spread. Keep the
          // full-page image opposite it so an explicit left/right choice is
          // visible in the assembled book instead of being overridden by the
          // previous photo rhythm.
          const imageOnLeft=railSide==='right';
          spreads.push({master:'D01-SPREAD-PHOTO-RAIL',sectionId:chapter.sectionId,left:imageOnLeft?imagePage:textPage,right:imageOnLeft?textPage:imagePage,continuousImage:true,photoRail:true});
          globalPhotoSide=imageOnLeft?'right':'left';previousMaster='D01-SPREAD-PHOTO-RAIL';contentSpreadCount++;
          continue;
        }

        // Reference-derived paired compositions: a designed photo/text page
        // faces a second large photograph. The pair is selected automatically
        // for a quiet two-image sequence and can also be forced per photo.
        const pairedFirst=chapter.photos[photoCursor];
        const pairedSecond=chapter.photos[photoCursor+1];
        const pairedFirstPreference=pairedFirst?preference(pairedFirst):'';
        const pairedSecondAvailable=Boolean(pairedSecond&&!pairedSecond?._directorPreference&&!['spread','bleed-text','spread-pair','triptych','duo','stacked-text','mosaic','quote-band-pair'].includes(preference(pairedSecond)));
        const explicitPhotoOverPair=pairedFirst&&pairedSecondAvailable&&pairedFirstPreference==='photo-top-text';
        const explicitTextOverPair=pairedFirst&&pairedSecondAvailable&&pairedFirstPreference==='text-top-photo';
        const automaticPhotoOverPair=pairedFirst&&pairedSecondAvailable&&isAuto(pairedFirst)&&photoAspect(pairedFirst)>=1.18&&photoAspect(pairedFirst)<1.35&&wordsLeft>=120&&contentSpreadCount%4===0&&!isHeavySpread(previousMaster);
        const automaticTextOverPair=pairedFirst&&pairedSecondAvailable&&isAuto(pairedFirst)&&photoAspect(pairedFirst)>=1.08&&photoAspect(pairedFirst)<1.35&&wordsLeft>=120&&contentSpreadCount%4===2&&!isHeavySpread(previousMaster);
        if(photosLeft>=2&&wordsLeft&&(explicitPhotoOverPair||automaticPhotoOverPair||explicitTextOverPair||automaticTextOverPair)){
          const photoOver=explicitPhotoOverPair||automaticPhotoOverPair;
          const compositeFitKey=photoOver?'photoOverText':'textOverPhoto';
          const chunk=consumeEditorialChunk(chapter,pageWords(meta,compositeFitKey),pageWords(meta,compositeFitKey),Math.max(48,Math.floor(pageWords(meta,compositeFitKey)*.18)),compositeFitKey);
          const firstIndex=photoCursor++,secondIndex=photoCursor++;
          const composite=P(photoOver?'photo-over-text':'text-over-photo',{layout:photoOver?'photo-over-text':'text-over-photo',master:photoOver?'D01-PHOTO-OVER-TEXT':'D01-TEXT-OVER-PHOTO',sectionId:chapter.sectionId,sourcePageUid:chunk.segment?.sourcePageUid,source:chapter,photoIndex:firstIndex,text:chunk.text,title:chunk.sectionTitle||chapter.title,sectionTitle:chunk.sectionTitle,episode:chunk.segment?.episode||chapter.episode,episodeNo:chunk.segment?.episodeNo||1,dropCap:Boolean(chunk.sectionTitle)});
          const large=P('photo',{layout:'photo-fullspread',master:'D01-LARGE-PHOTO',sectionId:chapter.sectionId,source:chapter,photoIndex:secondIndex,episode:chapter.episode});
          const onLeft=globalPhotoSide==='left';
          spreads.push({master:photoOver?'D01-SPREAD-PHOTO-OVER-TEXT-LARGE':'D01-SPREAD-TEXT-OVER-PHOTO-LARGE',sectionId:chapter.sectionId,left:onLeft?composite:large,right:onLeft?large:composite});
          globalPhotoSide=onLeft?'right':'left';previousMaster=photoOver?'D01-SPREAD-PHOTO-OVER-TEXT-LARGE':'D01-SPREAD-TEXT-OVER-PHOTO-LARGE';contentSpreadCount++;
          continue;
        }

        // Two-photo spread with a shared quote/caption band, derived from the
        // supplied reference with unequal image widths below a quiet header.
        const bandPair=chapter.photos.slice(photoCursor,photoCursor+2);
        const bandQuote=bandPair.length===2?(next?.quote||sentenceQuote(next?.remaining||chapter.text,usedQuotes)||chapter.title):'';
        // A planned pair belongs to its lead photo. Looking at both items
        // here allowed a later planned dark/light beat to be swallowed as the
        // companion of a pair that started one photo earlier.
        const explicitBand=bandPair.length===2&&(
          bandPair.some(photo=>String(photo?.layoutPreference||'').toLowerCase()==='quote-band-pair') ||
          preference(bandPair[0])==='quote-band-pair'
        );
        const automaticBand=bandPair.length===2&&bandPair.every(isAuto)&&!sameSourcePage(bandPair)&&Boolean(bandQuote)&&(contentSpreadCount===0||contentSpreadCount%3===1)&&!isHeavySpread(previousMaster);
        if(photosLeft>=2&&(explicitBand||automaticBand)){
          const firstIndex=photoCursor++,secondIndex=photoCursor++;
          const left=P('quote-band-photo',{layout:'quote-band-photo',master:'D01-QUOTE-BAND-PHOTO',sectionId:chapter.sectionId,source:chapter,photoIndex:firstIndex,quote:bandQuote,episode:chapter.episode});
          const right=P('quote-band-photo',{layout:'quote-band-photo',master:'D01-QUOTE-BAND-PHOTO',sectionId:chapter.sectionId,source:chapter,photoIndex:secondIndex,secondary:true,episode:chapter.episode});
          if(next&&bandQuote)next.quoteRendered=true;
          spreads.push({master:'D01-SPREAD-QUOTE-BAND',sectionId:chapter.sectionId,left,right});
          previousMaster='D01-SPREAD-QUOTE-BAND';contentSpreadCount++;globalPhotoSide='left';
          continue;
        }

        // Dense editorial mosaic: at least five unused photos, maximum twelve,
        // used at most once in the book and never next to another heavy spread.
        const mosaicPool=chapter.photos.slice(photoCursor,photoCursor+12);
        const explicitMosaic=mosaicPool.length>=5&&mosaicPool.some(photo=>preference(photo)==='mosaic');
        const automaticMosaic=mosaicPool.length>=5&&mosaicPool.slice(0,5).every(isAuto)&&sameSourcePage(mosaicPool.slice(0,5))&&!mosaicUsed&&!isHeavySpread(previousMaster);
        if(photosLeft>=5&&(explicitMosaic||automaticMosaic)){
          const sourceKey=mosaicPool[0]?._sourcePageUid;
          const takeCount=Math.min(12,mosaicPool.findIndex((photo,index)=>index>0&&photo._sourcePageUid!==sourceKey)===-1?mosaicPool.length:mosaicPool.findIndex((photo,index)=>index>0&&photo._sourcePageUid!==sourceKey));
          const indices=[];
          for(let i=0;i<Math.max(5,takeCount);i++)indices.push(photoCursor++);
          const mosaic=P('mosaic',{layout:'mosaic',master:'D01-MOSAIC',sectionId:chapter.sectionId,source:chapter,photoIndices:indices,episode:chapter.episode});
          const copyChunk=consumeEditorialChunk(chapter,pageWords(meta,'photoText'),pageWords(meta,'photoText'),Math.max(48,Math.floor(pageWords(meta,'photoText')*.18)),'photoText');
          const companion=copyChunk.text?textPage(chapter,copyChunk,{allowQuote:false}):photoOnlyCompanion(chapter);
          const photoOnLeft=globalPhotoSide==='left';
          spreads.push({master:'D01-SPREAD-MOSAIC',sectionId:chapter.sectionId,left:photoOnLeft?mosaic:companion,right:photoOnLeft?companion:mosaic});
          globalPhotoSide=photoOnLeft?'right':'left';previousMaster='D01-SPREAD-MOSAIC';contentSpreadCount++;mosaicUsed=true;
          continue;
        }

        // Two stacked photographs plus a narrow text column. With prose this
        // takes priority over the plain two-photo sheet.
        const stackedPair=chapter.photos.slice(photoCursor,photoCursor+2);
        const explicitStacked=stackedPair.length===2&&stackedPair.some(photo=>preference(photo)==='stacked-text');
        const automaticStacked=stackedPair.length===2&&stackedPair.every(isAuto)&&stackedPair.every(photo=>photo._sourceGroupSize===3)&&!stackedPair.some(photo=>photo._triptychReserved)&&sameSourcePage(stackedPair)&&wordsLeft>=120&&!isHeavySpread(previousMaster);
        if(photosLeft>=2&&wordsLeft&&(explicitStacked||automaticStacked)){
          const chunk=consumeEditorialChunk(chapter,pageWords(meta,'stackedText'),pageWords(meta,'stackedText'),Math.max(48,Math.floor(pageWords(meta,'stackedText')*.18)),'stackedText');
          const indices=[photoCursor++,photoCursor++];
          const composite=P('stacked-text',{layout:'stacked-text',master:'D01-STACKED-TEXT',sectionId:chapter.sectionId,sourcePageUid:chunk.segment?.sourcePageUid,source:chapter,photoIndices:indices,text:chunk.text,title:chunk.sectionTitle||chapter.title,sectionTitle:chunk.sectionTitle,episode:chunk.segment?.episode||chapter.episode,episodeNo:chunk.segment?.episodeNo||1,mirror:globalPhotoSide==='right'});
          const nextChunk=remainingWords(chapter)?consumeEditorialPage(chapter,pageWords(meta,'text'),'text'):{text:'',segment:null};
          const companion=nextChunk.text?textPage(chapter,nextChunk,{allowQuote:false}):photoOnlyCompanion(chapter);
          const compositeOnLeft=globalPhotoSide==='left';
          spreads.push({master:'D01-SPREAD-STACKED-TEXT',sectionId:chapter.sectionId,left:compositeOnLeft?composite:companion,right:compositeOnLeft?companion:composite});
          globalPhotoSide=compositeOnLeft?'right':'left';previousMaster='D01-SPREAD-STACKED-TEXT';contentSpreadCount++;
          continue;
        }

        // Two different photographs, one per page. The Director selects this
        // as a quiet photographic spread when a pair has little/no prose; a
        // manual `spread-pair` request always has priority.
        const photoPair = chapter.photos.slice(photoCursor, photoCursor + 2);
        const explicitPhotoPair = photoPair.length === 2 && photoPair.some(photo => preference(photo) === 'spread-pair');
        const directorBaseline = photo => isAuto(photo) || preference(photo) === 'photo-text';
        const automaticPhotoPair = photoPair.length === 2 && photoPair.every(directorBaseline) && !sameSourcePage(photoPair) && wordsLeft < 90 && !isHeavySpread(previousMaster);
        if (photosLeft >= 2 && (explicitPhotoPair || automaticPhotoPair)) {
          const firstIndex=photoCursor++, secondIndex=photoCursor++;
          const left=P('photo',{layout:'photo-fullspread',master:'D01-LARGE-PHOTO',sectionId:chapter.sectionId,source:chapter,photoIndex:firstIndex,episode:chapter.episode});
          const right=P('photo',{layout:'photo-fullspread',master:'D01-LARGE-PHOTO',sectionId:chapter.sectionId,source:chapter,photoIndex:secondIndex,episode:chapter.episode});
          spreads.push({master:'D01-SPREAD-TWO-PHOTO',sectionId:chapter.sectionId,left,right});
          previousMaster='D01-SPREAD-TWO-PHOTO'; contentSpreadCount++; globalPhotoSide='left';
          continue;
        }

        const triptychCandidate = chapter.photos.slice(photoCursor, photoCursor + 3);
        const requestedTriptych = triptychCandidate.some(photo=>preference(photo)==='triptych');
        const triptychKey = triptychCandidate[0]?._triptychGroup || (requestedTriptych ? `manual-triptych-${chapter.sectionId}-${photoCursor}` : '');
        // A manual picker action is enough to request the triptych. Automatic
        // triptychs retain their source-group requirement, but manual use must
        // also work for three ordinary photos selected in sequence.
        const explicitTriptych = requestedTriptych
          ? triptychCandidate.length===3
          : Boolean(triptychKey) && triptychCandidate.length===3 && triptychCandidate.every(photo=>photo?._triptychGroup===triptychKey);
        if (photosLeft >= 3 && explicitTriptych && !triptychGroupsUsed.has(triptychKey) && !isHeavySpread(previousMaster)) {
          const indices = [photoCursor++, photoCursor++, photoCursor++];
          const collage = P('three-photo', { layout: 'photo-triptych', master: 'D01-THREE-PHOTO', sectionId: chapter.sectionId, source: chapter, photoIndices: indices, episode: chapter.episode });
          const copyChunk = consumeEditorialChunk(chapter, pageWords(meta,'photoText'),pageWords(meta,'photoText'),Math.max(48,Math.floor(pageWords(meta,'photoText')*.18)),'photoText');
          const copy = copyChunk.text ? textPage(chapter, copyChunk, { allowQuote: false }) : photoOnlyCompanion(chapter);
          const photoOnLeft = globalPhotoSide === 'left';
          spreads.push({ master: 'D01-SPREAD-THREE-PHOTO', sectionId: chapter.sectionId, left: photoOnLeft ? collage : copy, right: photoOnLeft ? copy : collage });
          globalPhotoSide = photoOnLeft ? 'right' : 'left';
          triptychGroupsUsed.add(triptychKey);
          previousMaster = 'D01-SPREAD-THREE-PHOTO';
          contentSpreadCount++;
          continue;
        }

        // Two photographs on one sheet. Automatic use is limited to two
        // images uploaded to the same source sheet and never follows another
        // visually heavy spread.
        const duoCandidate=chapter.photos.slice(photoCursor,photoCursor+2);
        const explicitDuo=duoCandidate.length===2 && duoCandidate.some(photo=>preference(photo)==='duo');
        const automaticDuo=duoCandidate.length===2 && sameSourcePage(duoCandidate) && duoCandidate.every(directorBaseline) && !isHeavySpread(previousMaster);
        if(photosLeft>=2 && (explicitDuo||automaticDuo)){
          const indices=[photoCursor++,photoCursor++];
          const duo=P('two-photo',{layout:'photo-duo',master:'D01-TWO-PHOTO',sectionId:chapter.sectionId,source:chapter,photoIndices:indices,episode:chapter.episode});
          const copyChunk=consumeEditorialChunk(chapter,pageWords(meta,'photoText'),pageWords(meta,'photoText'),Math.max(48,Math.floor(pageWords(meta,'photoText')*.18)),'photoText');
          const companion=copyChunk.text?textPage(chapter,copyChunk,{allowQuote:false}):photoOnlyCompanion(chapter);
          const photoOnLeft=globalPhotoSide==='left';
          spreads.push({master:'D01-SPREAD-DUO',sectionId:chapter.sectionId,left:photoOnLeft?duo:companion,right:photoOnLeft?companion:duo});
          globalPhotoSide=photoOnLeft?'right':'left'; previousMaster='D01-SPREAD-DUO'; contentSpreadCount++;
          continue;
        }

        const mixedPhoto=chapter.photos[photoCursor];
        const mixedPreference=mixedPhoto?preference(mixedPhoto):'';
        const darkPairFirst=mixedPhoto;
        const darkPairSecond=chapter.photos[photoCursor+1];
        const explicitDarkPhotoPair=Boolean(darkPairFirst&&darkPairSecond&&(
          mixedPreference==='dark-photo-pair' || preference(darkPairSecond)==='dark-photo-pair'));
        const automaticDarkPhotoPair=Boolean(darkPairFirst&&darkPairSecond&&isAuto(darkPairFirst)&&isAuto(darkPairSecond)&&
          sameSourcePage([darkPairFirst,darkPairSecond])&&wordsLeft>=pageWords(meta,'darkSplit')*1.7&&
          photoAspect(darkPairFirst)>=.72&&photoAspect(darkPairSecond)>=.72&&contentSpreadCount%7===4&&!isDarkPauseBlocked(previousMaster));
        if(wordsLeft&&photosLeft>=2&&(explicitDarkPhotoPair||automaticDarkPhotoPair)){
          const firstChunk=consumeEditorialChunk(chapter,pageWords(meta,'darkSplit'),pageWords(meta,'darkSplit'),Math.max(48,Math.floor(pageWords(meta,'darkSplit')*.18)),'darkSplit');
          const secondChunk=remainingWords(chapter)?consumeEditorialChunk(chapter,pageWords(meta,'darkSplit'),pageWords(meta,'darkSplit'),Math.max(48,Math.floor(pageWords(meta,'darkSplit')*.18)),'darkSplit'):{text:'',segment:null};
          const first=P('dark-split',{layout:'dark-split',master:'D01-DARK-SPLIT',sectionId:chapter.sectionId,sourcePageUid:firstChunk.segment?.sourcePageUid,source:chapter,photoIndex:photoCursor++,text:firstChunk.text,title:firstChunk.sectionTitle||chapter.title,sectionTitle:firstChunk.sectionTitle,episode:firstChunk.segment?.episode||chapter.episode});
          const second=P('dark-split',{layout:'dark-split',master:'D01-DARK-SPLIT',sectionId:chapter.sectionId,sourcePageUid:secondChunk.segment?.sourcePageUid,source:chapter,photoIndex:photoCursor++,text:secondChunk.text,title:secondChunk.sectionTitle||chapter.title,sectionTitle:secondChunk.sectionTitle,episode:secondChunk.segment?.episode||chapter.episode});
          spreads.push({master:'D01-SPREAD-DARK-PHOTO-PAIR',sectionId:chapter.sectionId,left:first,right:second,darkPhotoPair:true});
          globalPhotoSide='right';previousMaster='D01-SPREAD-DARK-PHOTO-PAIR';contentSpreadCount++;
          continue;
        }
        const autoDarkSplit=mixedPhoto&&isAuto(mixedPhoto)&&photoAspect(mixedPhoto)<=.92&&wordsLeft>=pageWords(meta,'darkSplit')&&contentSpreadCount<=1&&!isDarkPauseBlocked(previousMaster);
        if(mixedPhoto&&wordsLeft&&(mixedPreference==='dark-split'||autoDarkSplit)){
          const chunk=consumeEditorialChunk(chapter,pageWords(meta,'darkSplit'),pageWords(meta,'darkSplit'),Math.max(48,Math.floor(pageWords(meta,'darkSplit')*.18)),'darkSplit');
          const index=photoCursor++;
          const composite=P('dark-split',{layout:'dark-split',master:'D01-DARK-SPLIT',sectionId:chapter.sectionId,sourcePageUid:chunk.segment?.sourcePageUid,source:chapter,photoIndex:index,text:chunk.text,title:chunk.sectionTitle||chapter.title,sectionTitle:chunk.sectionTitle,episode:chunk.segment?.episode||chapter.episode});
          const companionChunk=remainingWords(chapter)?consumeEditorialPage(chapter,pageWords(meta,'text'),'text'):{text:'',segment:null};
          const companion=companionChunk.text?textPage(chapter,companionChunk,{allowQuote:false}):quietCompanion(chapter);
          const onLeft=globalPhotoSide==='left';
          spreads.push({master:'D01-SPREAD-DARK-SPLIT',sectionId:chapter.sectionId,left:onLeft?composite:companion,right:onLeft?companion:composite});
          globalPhotoSide=onLeft?'right':'left';previousMaster='D01-SPREAD-DARK-SPLIT';contentSpreadCount++;
          continue;
        }
        const gradientPreference=mixedPhoto?mixedPreference:'';
        const autoGradient=Boolean(mixedPhoto&&isAuto(mixedPhoto)&&photoAspect(mixedPhoto)>=1.08&&!autoPanoramaCandidate(mixedPhoto)&&wordsLeft>=pageWords(meta,'overlayText')&&contentSpreadCount%6===4&&!isHeavySpread(previousMaster));
        const autoDarkGradient=Boolean(mixedPhoto&&isAuto(mixedPhoto)&&photoAspect(mixedPhoto)>=1.08&&!autoPanoramaCandidate(mixedPhoto)&&wordsLeft>=pageWords(meta,'overlayText')&&contentSpreadCount%8===6&&!isDarkPauseBlocked(previousMaster));
        const plannedDarkGradient=Boolean(mixedPhoto?._directorPreference==='dark-gradient-photo'&&!isDarkPauseBlocked(previousMaster));
        // A manual dark-gradient selection must win even if the director had
        // already annotated this photo with an automatic preference during an
        // earlier build.
        const explicitDarkGradient=Boolean(gradientPreference==='dark-gradient-photo');
        // A planned dark/photo spread must have a quiet reading spread before
        // it when the preceding composition is heavy. This preserves the
        // requested rhythm while keeping dark spreads from touching one
        // another or appearing as an unexplained run of black pages.
        if (mixedPhoto?._directorPreference==='dark-gradient-photo' && isDarkPauseBlocked(previousMaster) && wordsLeft) {
          const pauseChunks=consumeEditorialPair(chapter,pageWords(meta,'text'),pageWords(meta,'text'),0,'text','text');
          const pauseLeft=textPage(chapter,pauseChunks[0],{allowQuote:false});
          const pauseRight=pauseChunks[1].text?textPage(chapter,pauseChunks[1],{allowQuote:false}):null;
          spreads.push({master:'D01-SPREAD-TEXT',sectionId:chapter.sectionId,left:pauseLeft,right:pauseRight});
          previousMaster='D01-SPREAD-TEXT';contentSpreadCount++;
          continue;
        }
        if(mixedPhoto&&(wordsLeft||explicitDarkGradient||plannedDarkGradient)&&(explicitDarkGradient||plannedDarkGradient||autoDarkGradient)){
          const chunk=wordsLeft
            ? consumeEditorialChunk(chapter,pageWords(meta,'overlayText'),pageWords(meta,'overlayText'),Math.max(48,Math.floor(pageWords(meta,'overlayText')*.18)),'darkGradientPhoto')
            : {text:'',segment:null};
          const index=photoCursor++;
          const composite=P('dark-gradient-photo',{layout:'dark-gradient-photo',master:'D01-DARK-GRADIENT-PHOTO',sectionId:chapter.sectionId,sourcePageUid:chunk.segment?.sourcePageUid,source:chapter,photoIndex:index,text:chunk.text,title:chunk.sectionTitle||chapter.title,sectionTitle:chunk.sectionTitle,episode:chunk.segment?.episode||chapter.episode});
          const companionChunk=remainingWords(chapter)?consumeEditorialPage(chapter,pageWords(meta,'text'),'text'):{text:'',segment:null};
          const companion=darkTextPage(chapter,companionChunk);
          const onLeft=globalPhotoSide==='left';
          spreads.push({master:'D01-SPREAD-DARK-GRADIENT-PHOTO',sectionId:chapter.sectionId,left:onLeft?composite:companion,right:onLeft?companion:composite});
          globalPhotoSide=onLeft?'right':'left';previousMaster='D01-SPREAD-DARK-GRADIENT-PHOTO';contentSpreadCount++;
          continue;
        }
        if(mixedPhoto&&(wordsLeft||gradientPreference==='photo-gradient-text')&&(gradientPreference==='photo-gradient-text'||autoGradient)){
          const chunk=wordsLeft
            ? consumeEditorialChunk(chapter,pageWords(meta,'overlayText'),pageWords(meta,'overlayText'),Math.max(48,Math.floor(pageWords(meta,'overlayText')*.18)),'photoGradientText')
            : {text:'',segment:null};
          const index=photoCursor++;
          const composite=P('photo-gradient-text',{layout:'photo-gradient-text',master:'D01-PHOTO-GRADIENT-TEXT',sectionId:chapter.sectionId,sourcePageUid:chunk.segment?.sourcePageUid,source:chapter,photoIndex:index,text:chunk.text,title:chunk.sectionTitle||chapter.title,sectionTitle:chunk.sectionTitle,episode:chunk.segment?.episode||chapter.episode});
          const companionChunk=remainingWords(chapter)?consumeEditorialPage(chapter,pageWords(meta,'text'),'text'):{text:'',segment:null};
          const companion=companionChunk.text?textPage(chapter,companionChunk,{allowQuote:false}):quietCompanion(chapter);
          const onLeft=globalPhotoSide==='left';
          spreads.push({master:'D01-SPREAD-PHOTO-GRADIENT-TEXT',sectionId:chapter.sectionId,left:onLeft?composite:companion,right:onLeft?companion:composite});
          globalPhotoSide=onLeft?'right':'left';previousMaster='D01-SPREAD-PHOTO-GRADIENT-TEXT';contentSpreadCount++;
          continue;
        }
        const autoOverlay=mixedPhoto&&isAuto(mixedPhoto)&&photoAspect(mixedPhoto)>=1.08&&!autoPanoramaCandidate(mixedPhoto)&&wordsLeft>=pageWords(meta,'overlayText')&&(contentSpreadCount%4===2||contentSpreadCount%4===3)&&!isHeavySpread(previousMaster);
        if(mixedPhoto&&wordsLeft&&(mixedPreference==='photo-overlay-text'||autoOverlay)){
          const chunk=consumeEditorialChunk(chapter,pageWords(meta,'overlayText'),pageWords(meta,'overlayText'),Math.max(48,Math.floor(pageWords(meta,'overlayText')*.18)),'overlayText');
          const index=photoCursor++;
          const composite=P('photo-overlay-text',{layout:'photo-overlay-text',master:'D01-PHOTO-OVERLAY-TEXT',sectionId:chapter.sectionId,sourcePageUid:chunk.segment?.sourcePageUid,source:chapter,photoIndex:index,text:chunk.text,title:chunk.sectionTitle||chapter.title,sectionTitle:chunk.sectionTitle,episode:chunk.segment?.episode||chapter.episode});
          const companionChunk=remainingWords(chapter)?consumeEditorialPage(chapter,pageWords(meta,'text'),'text'):{text:'',segment:null};
          const companion=companionChunk.text?textPage(chapter,companionChunk,{allowQuote:false}):quietCompanion(chapter);
          const onLeft=globalPhotoSide==='left';
          spreads.push({master:'D01-SPREAD-PHOTO-OVERLAY-TEXT',sectionId:chapter.sectionId,left:onLeft?composite:companion,right:onLeft?companion:composite});
          globalPhotoSide=onLeft?'right':'left';previousMaster='D01-SPREAD-PHOTO-OVERLAY-TEXT';contentSpreadCount++;
          continue;
        }
        const autoTextOverPhoto=mixedPhoto&&isAuto(mixedPhoto)&&photoAspect(mixedPhoto)>=1.08&&!autoPanoramaCandidate(mixedPhoto)&&wordsLeft>=pageWords(meta,'textOverPhoto')&&contentSpreadCount<=1&&!isHeavySpread(previousMaster);
        if(mixedPhoto&&wordsLeft&&(mixedPreference==='text-top-photo'||autoTextOverPhoto)){
          const chunk=consumeEditorialChunk(chapter,pageWords(meta,'textOverPhoto'),pageWords(meta,'textOverPhoto'),Math.max(48,Math.floor(pageWords(meta,'textOverPhoto')*.18)),'textOverPhoto');
          const index=photoCursor++;
          const composite=P('text-over-photo',{layout:'text-over-photo',master:'D01-TEXT-OVER-PHOTO',sectionId:chapter.sectionId,sourcePageUid:chunk.segment?.sourcePageUid,source:chapter,photoIndex:index,text:chunk.text,title:chunk.sectionTitle||chapter.title,sectionTitle:chunk.sectionTitle,episode:chunk.segment?.episode||chapter.episode,episodeNo:chunk.segment?.episodeNo||1});
          const companionChunk=remainingWords(chapter)?consumeEditorialPage(chapter,pageWords(meta,'text'),'text'):{text:'',segment:null};
          const companion=companionChunk.text?textPage(chapter,companionChunk,{allowQuote:false}):quietCompanion(chapter);
          const onLeft=globalPhotoSide==='left';
          spreads.push({master:'D01-SPREAD-TEXT-OVER-PHOTO',sectionId:chapter.sectionId,left:onLeft?composite:companion,right:onLeft?companion:composite});
          globalPhotoSide=onLeft?'right':'left';previousMaster='D01-SPREAD-TEXT-OVER-PHOTO';contentSpreadCount++;
          continue;
        }

        // One-sheet editorial split: portrait/square photo on the left,
        // readable prose on the right. The Director uses it between heavier
        // photographic compositions; the author can always force or forbid it.
        const sidePhoto=chapter.photos[photoCursor];
        const forceSide=sidePhoto && preference(sidePhoto)==='photo-side-text';
        const autoSide=sidePhoto && isAuto(sidePhoto) && photoAspect(sidePhoto)<=1.08 && wordsLeft>=150 &&
          contentSpreadCount%3===1 && !isHeavySpread(previousMaster);
        if(sidePhoto && wordsLeft && (forceSide||autoSide)){
          const chunk=consumeEditorialChunk(chapter,pageWords(meta,'photoSideText'),pageWords(meta,'photoSideText'),Math.max(48,Math.floor(pageWords(meta,'photoSideText')*.18)),'photoSideText');
          const index=photoCursor++;
          const composite=P('photo-side-text',{layout:'photo-side-text',master:'D01-PHOTO-SIDE-TEXT',sectionId:chapter.sectionId,sourcePageUid:chunk.segment?.sourcePageUid,source:chapter,photoIndex:index,text:chunk.text,title:chunk.sectionTitle||chapter.title,sectionTitle:chunk.sectionTitle,episode:chunk.segment?.episode||chapter.episode,episodeNo:chunk.segment?.episodeNo||1,dropCap:Boolean(chunk.sectionTitle)});
          const nextChunk=remainingWords(chapter)?consumeEditorialPage(chapter,pageWords(meta,'text'),'text'):{text:'',segment:null};
          const companion=nextChunk.text?textPage(chapter,nextChunk,{allowQuote:false}):quietCompanion(chapter);
          const compositeOnLeft=globalPhotoSide==='left';
          spreads.push({master:'D01-SPREAD-PHOTO-SIDE-TEXT',sectionId:chapter.sectionId,left:compositeOnLeft?composite:companion,right:compositeOnLeft?companion:composite});
          globalPhotoSide=compositeOnLeft?'right':'left';previousMaster='D01-SPREAD-PHOTO-SIDE-TEXT';contentSpreadCount++;
          continue;
        }

        // Photo above, text below on a single page. Landscape images with
        // enough associated prose are preferred automatically; the author
        // can force the same result from the photo card.
        const topPhoto=chapter.photos[photoCursor];
        const forceTop=topPhoto && preference(topPhoto)==='photo-top-text';
        const autoTop=topPhoto && isAuto(topPhoto) && photoAspect(topPhoto)>=1.18 && wordsLeft>=120 &&
          previousMaster!=='D01-SPREAD-PHOTO-OVER-TEXT' && !isHeavySpread(previousMaster);
        if(topPhoto && wordsLeft && (forceTop||autoTop)){
          const chunk=consumeEditorialChunk(chapter,pageWords(meta,'photoOverText'),pageWords(meta,'photoOverText'),Math.max(48,Math.floor(pageWords(meta,'photoOverText')*.18)),'photoOverText');
          const index=photoCursor++;
          const composite=P('photo-over-text',{layout:'photo-over-text',master:'D01-PHOTO-OVER-TEXT',sectionId:chapter.sectionId,sourcePageUid:chunk.segment?.sourcePageUid,source:chapter,photoIndex:index,text:chunk.text,title:chunk.sectionTitle||chapter.title,sectionTitle:chunk.sectionTitle,episode:chunk.segment?.episode||chapter.episode,episodeNo:chunk.segment?.episodeNo||1,dropCap:Boolean(chunk.sectionTitle)});
          const nextChunk=remainingWords(chapter)?consumeEditorialPage(chapter,pageWords(meta,'text'),'text'):{text:'',segment:null};
          const companion=nextChunk.text?textPage(chapter,nextChunk,{allowQuote:false}):quietCompanion(chapter);
          const photoOnLeft=globalPhotoSide==='left';
          spreads.push({master:'D01-SPREAD-PHOTO-OVER-TEXT',sectionId:chapter.sectionId,left:photoOnLeft?composite:companion,right:photoOnLeft?companion:composite});
          globalPhotoSide=photoOnLeft?'right':'left'; previousMaster='D01-SPREAD-PHOTO-OVER-TEXT'; contentSpreadCount++;
          continue;
        }

        if (!textOnlyBook && previousMaster === 'D01-SPREAD-PHOTO-TEXT' && wordsLeft && !next?.autoQuote && !next?.quoteRendered && contentSpreadCount%4===0) {
          const quote = next?.quote || sentenceQuote(next?.remaining || chapter.text, usedQuotes);
          if (quote) {
            next.quoteRendered=true;
            const chunk = consumeEditorialPage(chapter, pageWords(meta,'quoteCompanion'), 'quoteCompanion');
            chunk.text = stripQuote(chunk.text, quote);
            const quotePage = P('quote', { layout: 'quote', master: 'D01-QUOTE', sectionId: chapter.sectionId, source: chapter, quote, quoteTone: quoteTone(), episode: chapter.episode });
            const copy = textPage(chapter, Object.assign({}, chunk, { sectionTitle: '', quote: '' }), { allowQuote: false });
            const quoteOnLeft = chapterIndex % 2 === 0;
            spreads.push({ master: 'D01-SPREAD-QUOTE', sectionId: chapter.sectionId, left: quoteOnLeft ? quotePage : copy, right: quoteOnLeft ? copy : quotePage });
            previousMaster = 'D01-SPREAD-QUOTE';
            contentSpreadCount++;
            continue;
          }
        }

        if (photosLeft > 0 && wordsLeft && previousMaster !== 'D01-SPREAD-PHOTO-TEXT' && preference(chapter.photos[photoCursor])!=='large-photo') {
          const sectionStartsHere = Boolean(next && !next.started && next.sectionTitle);
          const photoTextCapacity=pageWords(meta,'photoText');
          const photoTextFitKey=sectionStartsHere?'photoTextHeading':'photoText';
          const chunk = consumeEditorialChunk(chapter, photoTextCapacity, sectionStartsHere ? pageWords(meta,'photoTextHeading') : photoTextCapacity, Math.max(48,Math.floor(photoTextCapacity*.18)), photoTextFitKey);
          const currentPhotoIndex = photoCursor++;
          const photo = P('photo', { layout: 'photo-left-page', master: 'D01-PHOTO', sectionId: chapter.sectionId, source: chapter, photoIndex: currentPhotoIndex, episode: chapter.episode });
          const sectionTitle = chunk.sectionTitle;
          const copy = P('text', { layout: 'editorial-prose', master: 'D01-PHOTO-TEXT', sectionId: chapter.sectionId, sourcePageUid: chunk.segment?.sourcePageUid, source: chapter, text: chunk.text, title: sectionTitle || chapter.title, sectionTitle, episode: chunk.segment?.episode || chapter.episode, episodeNo: chunk.segment?.episodeNo || 1, dropCap: Boolean(sectionTitle) });
          const photoOnLeft = globalPhotoSide === 'left';
          spreads.push({ master: 'D01-SPREAD-PHOTO-TEXT', sectionId: chapter.sectionId, left: photoOnLeft ? photo : copy, right: photoOnLeft ? copy : photo });
          globalPhotoSide = photoOnLeft ? 'right' : 'left';
          previousMaster = 'D01-SPREAD-PHOTO-TEXT';
          contentSpreadCount++;
          continue;
        }

        if (!textOnlyBook && wordsLeft && previousMaster === 'D01-SPREAD-TEXT' && !next?.autoQuote && !next?.quoteRendered && contentSpreadCount%4===0) {
          const quote = next?.quote || sentenceQuote(next?.remaining || '', usedQuotes);
          if (quote) {
            next.quoteRendered=true;
            const chunk = consumeEditorialPage(chapter, pageWords(meta,'quoteCompanion'), 'quoteCompanion');
            chunk.text = stripQuote(chunk.text, quote);
            const quotePage = P('quote', { layout: 'quote', master: 'D01-QUOTE', sectionId: chapter.sectionId, source: chapter, quote, quoteTone: quoteTone(), episode: chapter.episode });
            const copy = textPage(chapter, Object.assign({}, chunk, { sectionTitle: '', quote: '' }), { allowQuote: false });
            spreads.push({ master: 'D01-SPREAD-QUOTE', sectionId: chapter.sectionId, left: quotePage, right: copy });
            previousMaster = 'D01-SPREAD-QUOTE';
            contentSpreadCount++;
            continue;
          }
        }

        if(automaticDarkTextEnabled&&!textOnlyBook&&wordCount(currentSegment(chapter)?.remaining)>=pageWords(meta,'darkText')*2&&!darkTextUsed&&!darkTextBookUsed&&contentSpreadCount>=1&&previousMaster!=='D01-SPREAD-DARK-TEXT'&&!isDarkPauseBlocked(previousMaster)){
          const automaticDarkPair=Boolean(!photosLeft&&contentSpreadCount>=1);
          if(automaticDarkPair){
            const firstChunk=consumeEditorialPage(chapter,pageWords(meta,'darkText'), 'darkText');
            const secondChunk=remainingWords(chapter)
              ? consumeEditorialPage(chapter,pageWords(meta,'darkText'), 'darkText')
              : {text:'',segment:null};
            const first=P('dark-text',{layout:'dark-text',master:'D01-DARK-TEXT',sectionId:chapter.sectionId,sourcePageUid:firstChunk.segment?.sourcePageUid,source:chapter,text:firstChunk.text,title:firstChunk.sectionTitle||chapter.title,sectionTitle:firstChunk.sectionTitle,episode:firstChunk.segment?.episode||chapter.episode});
            const second=secondChunk.text?P('dark-text',{layout:'dark-text',master:'D01-DARK-TEXT',sectionId:chapter.sectionId,sourcePageUid:secondChunk.segment?.sourcePageUid,source:chapter,text:secondChunk.text,title:secondChunk.sectionTitle||chapter.title,sectionTitle:secondChunk.sectionTitle,episode:secondChunk.segment?.episode||chapter.episode}):quietCompanion(chapter);
            const darkOnLeft=chapterIndex%2===0;
            spreads.push({master:'D01-SPREAD-DARK-TEXT-PAIR',sectionId:chapter.sectionId,left:darkOnLeft?first:second,right:darkOnLeft?second:first});
            previousMaster='D01-SPREAD-DARK-TEXT-PAIR';contentSpreadCount++;darkTextUsed=true;darkTextBookUsed=true;
            continue;
          }
          const darkChunk=consumeEditorialPage(chapter,pageWords(meta,'darkText'), 'darkText');
          const dark=P('dark-text',{layout:'dark-text',master:'D01-DARK-TEXT',sectionId:chapter.sectionId,sourcePageUid:darkChunk.segment?.sourcePageUid,source:chapter,text:darkChunk.text,title:darkChunk.sectionTitle||chapter.title,sectionTitle:darkChunk.sectionTitle,episode:darkChunk.segment?.episode||chapter.episode,pullQuote:darkChunk.quote||sentenceQuote(darkChunk.text,usedQuotes)});
          const lightChunk=remainingWords(chapter)?consumeEditorialPage(chapter,pageWords(meta,'text'), 'text'):{text:'',segment:null};
          const light=lightChunk.text?textPage(chapter,lightChunk,{allowQuote:false}):quietCompanion(chapter);
          const darkOnLeft=chapterIndex%2===0;
          spreads.push({master:'D01-SPREAD-DARK-TEXT',sectionId:chapter.sectionId,left:darkOnLeft?dark:light,right:darkOnLeft?light:dark});
          previousMaster='D01-SPREAD-DARK-TEXT';contentSpreadCount++;darkTextUsed=true;darkTextBookUsed=true;
          continue;
        }

        if (wordsLeft) {
          // Ordinary text pages use the measured capacity of the actual
          // renderer.  A heading or pull quote consumes part of that box, so
          // reserve the corresponding capacity before taking sentences;
          // otherwise the renderer receives a full prose chunk plus the
          // editorial element and the tail is clipped at the page boundary.
          const firstSegment=currentSegment(chapter);
          const firstHasHeading=!firstSegment?.started&&Boolean(firstSegment?.sectionTitle);
          const firstHasQuote=!firstSegment?.started&&Boolean(firstSegment?.quote);
          // Keep a restrained quote cadence in a fixed row above the columns;
          // the quote is selected from the current text but rendered outside
          // the flow, so pagination remains a single uninterrupted stream.
          const inlineQuoteCandidate=(!firstHasHeading&&!firstHasQuote&&contentSpreadCount>0&&contentSpreadCount%3===2)
            ? quoteCandidate(takeWords(firstSegment?.remaining||'',Math.max(80,Math.floor(pageWords(meta,'text')*.82))).head,usedQuotes,contentSpreadCount) : '';
          const firstNeedsInlineQuote=Boolean(inlineQuoteCandidate);
          const firstCapacity=firstNeedsInlineQuote?pageWords(meta,'textInlineQuote'):firstHasQuote?pageWords(meta,'textQuote'):firstHasHeading?pageWords(meta,'textHeading'):pageWords(meta,'text');
          if(firstNeedsInlineQuote&&firstSegment) firstSegment.pendingInlineQuote=inlineQuoteCandidate;
          const firstFitKey=firstNeedsInlineQuote?'textInlineQuote':firstHasQuote?'textQuote':firstHasHeading?'textHeading':'text';
          const [firstChunk,secondChunk] = consumeEditorialPair(chapter,pageWords(meta,'text'),firstCapacity,firstNeedsInlineQuote?90:0,firstFitKey,'text');
          if(firstSegment) delete firstSegment.pendingInlineQuote;
          if(firstNeedsInlineQuote&&firstChunk.text&&!firstChunk.sectionTitle&&!firstChunk.quote&&firstChunk.text.includes(inlineQuoteCandidate)){
            usedQuotes.add(norm(inlineQuoteCandidate));
            firstChunk.text=stripQuote(firstChunk.text,inlineQuoteCandidate);
            firstChunk.internalQuote=inlineQuoteCandidate;
          }
          const first = textPage(chapter, firstChunk);
          const useDarkCompanion=false;
          let second;
          if(useDarkCompanion){
            const darkPull=sentenceQuote(secondChunk.text,usedQuotes);
            second=P('dark-text',{layout:'dark-text',master:'D01-DARK-TEXT',sectionId:chapter.sectionId,sourcePageUid:secondChunk.segment?.sourcePageUid,source:chapter,text:stripQuote(secondChunk.text,darkPull),title:secondChunk.sectionTitle||chapter.title,sectionTitle:secondChunk.sectionTitle,episode:secondChunk.segment?.episode||chapter.episode,pullQuote:darkPull});
            darkTextUsed=true;darkTextBookUsed=true;
          }else second=secondChunk.text?textPage(chapter,secondChunk,{allowQuote:false}):null;
          const textSpreadMaster=useDarkCompanion?'D01-SPREAD-DARK-TEXT':first.pullQuote?'D01-SPREAD-TEXT-QUOTE':'D01-SPREAD-TEXT';
          spreads.push({ master:textSpreadMaster, sectionId: chapter.sectionId, left: first, right: second });
          previousMaster=textSpreadMaster;
          contentSpreadCount++;
          continue;
        }

        const fallbackPair=chapter.photos.slice(photoCursor,photoCursor+2);
        const secondNeedsOwnMaster=fallbackPair.length===2 && ['spread','bleed-text','spread-pair','triptych','duo','stacked-text','mosaic','quote-band-pair','photo-top-text','text-top-photo','photo-side-text','dark-split','photo-overlay-text','text-quote'].includes(preference(fallbackPair[1]));
        if(photosLeft>=2 && secondNeedsOwnMaster){
          const photo=P('photo',{layout:'photo-fullspread',master:'D01-LARGE-PHOTO',sectionId:chapter.sectionId,source:chapter,photoIndex:photoCursor++,episode:chapter.episode});
          const blank=quietCompanion(chapter);
          const photoOnLeft=globalPhotoSide==='left';
          spreads.push({master:'D01-SPREAD-LARGE-PHOTO',sectionId:chapter.sectionId,left:photoOnLeft?photo:blank,right:photoOnLeft?blank:photo});
          globalPhotoSide=photoOnLeft?'right':'left';previousMaster='D01-SPREAD-LARGE-PHOTO';contentSpreadCount++;
          continue;
        }

        if (photosLeft >= 2) {
          const first = P('photo', { layout: 'photo-fullspread', master: 'D01-LARGE-PHOTO', sectionId: chapter.sectionId, source: chapter, photoIndex: photoCursor++, episode: chapter.episode });
          const second = P('photo', { layout: 'photo-fullspread', master: 'D01-LARGE-PHOTO', sectionId: chapter.sectionId, source: chapter, photoIndex: photoCursor++, episode: chapter.episode });
          spreads.push({ master: 'D01-SPREAD-LARGE-PHOTO', sectionId: chapter.sectionId, left: first, right: second });
          previousMaster = 'D01-SPREAD-LARGE-PHOTO';
          contentSpreadCount++;
          continue;
        }

        if (photosLeft === 1) {
          const photo = P('photo', { layout: 'photo-fullspread', master: 'D01-LARGE-PHOTO', sectionId: chapter.sectionId, source: chapter, photoIndex: photoCursor++, episode: chapter.episode });
          const blank = quietCompanion(chapter);
          const photoOnLeft = globalPhotoSide === 'left';
          spreads.push({ master: 'D01-SPREAD-LARGE-PHOTO', sectionId: chapter.sectionId, left: photoOnLeft ? photo : blank, right: photoOnLeft ? blank : photo });
          globalPhotoSide = photoOnLeft ? 'right' : 'left';
          previousMaster = 'D01-SPREAD-LARGE-PHOTO';
          contentSpreadCount++;
        }

      }
    });

    const timelineItems = chapters.map(chapter => {
      const year = [chapter.title, chapter.text].join(' ').match(/\b(1[5-9]\d{2}|20\d{2})\b/)?.[1];
      return year ? { year, text: chapter.title } : null;
    }).filter(Boolean);
    const timeline = P('timeline', { title: timelineItems.length ? `${timelineItems[0].year}—${timelineItems.at(-1).year}` : 'Хронология', items: timelineItems, meta: bookMeta });
    const finalMatter = sectionPage(byId('final'), 'Финальная страница');
    const final = P('final', { title: bookMeta.title, text: finalMatter.text, meta: bookMeta });
    if(byId('timeline')||byId('final')) spreads.push({ master: 'D01-SPREAD-TIMELINE-FINAL', left: byId('timeline')?timeline:P('blank',{meta:bookMeta}), right: byId('final')?final:P('blank',{meta:bookMeta}) });

    const afterwordMatter = sectionPage(byId('afterword'), 'Послесловие');
    const thanksMatter = sectionPage(byId('thanks'), 'Благодарности');
    const sourcesMatter = sectionPage(byId('sources'), 'Источники');
    const afterword = afterwordMatter.source || {};
    const colophonFields = fieldValues(byId('colophon'), 4);
    const [backCoverText,backCoverMark]=fieldValues(byId('back-cover'),2);
    const epilogue = P('epilogue', { master: 'D01-FINAL', title: afterwordMatter.title || 'Послесловие', text: afterwordMatter.text, meta: bookMeta });
    const thanks = P('thanks', { master: 'D01-THANKS', title: thanksMatter.title || 'Благодарности', text: thanksMatter.text, meta: bookMeta });
    const sources = P('sources', { master: 'D01-SOURCES', title: sourcesMatter.title || 'Источники', text: sourcesMatter.text, meta: bookMeta });
    const colophon = P('colophon', { meta: bookMeta, rows: [
      { label: 'Составитель', value: colophonFields[0] || bookMeta.author },
      { label: 'Дизайн и вёрстка', value: colophonFields[1] || '' },
      { label: 'Год издания', value: colophonFields[2] || bookMeta.year },
      { label: 'Место издания', value: colophonFields[3] || '' }
    ] });
    if(byId('afterword')||byId('thanks')) spreads.push({ master: 'D01-SPREAD-AFTERWORD-THANKS', left: byId('afterword')?epilogue:P('blank',{meta:bookMeta}), right: byId('thanks')?thanks:P('blank',{meta:bookMeta}) });
    if(byId('sources')||byId('colophon')) spreads.push({ master: 'D01-SPREAD-SOURCES-COLOPHON', left: byId('sources')?sources:P('blank',{meta:bookMeta}), right: byId('colophon')?colophon:P('blank',{meta:bookMeta}) });
    if(byId('back-endpaper')) spreads.push({ master: 'D01-SPREAD-ENDPAPER', left: P('endpaper', { meta: bookMeta }), right: P('endpaper', { meta: bookMeta }) });
    if(byId('inside-back-cover')) spreads.push({master:'D01-SPREAD-INSIDE-BACK-COVER',left:P('blank',{meta:bookMeta}),right:P('inside-back-cover',{layout:'endpaper',meta:bookMeta})});
    if(byId('back-cover')) spreads.push({ master: 'D01-SPREAD-BACK-COVER', left: P('back-cover', { layout: 'back-cover', meta:Object.assign({},bookMeta,{backCoverText,backCoverMark}), source: backCoverSource, photoIndex: 0 }), right: null, single: 'left' });

    const pages = spreads.flatMap(spread => [spread.left, spread.right].filter(Boolean));
    // Preserve the episode's explicit/automatic quote even when the page was
    // reached through a photo-to-text transition. The semantic source page is
    // authoritative for a new episode and must produce D01-TEXT-QUOTE.
    pages.forEach(page => {
      if (page.rhythm || !page.sectionTitle || page.pullQuote || page.showHeading !== true) return;
      const chapter = chapters.find(item => item.sectionId === page.sectionId);
      const segment = chapter?.segments.find(item => item.sourcePageUid === page.sourcePageUid);
      if (segment?.quote) {
        page.master = 'D01-TEXT-QUOTE';
        page.pullQuote = segment.quote;
        page.text = stripQuote(page.text, segment.quote);
      }
    });
    pages.forEach((page, index) => { page.pageNo = index + 1; });
    chapters.forEach(chapter => {
      const opening = pages.find(page => page.sectionId === chapter.sectionId && page.layout === 'chapter-intro');
      chapterFirstPages.set(chapter.sectionId, opening?.pageNo || '');
    });
    contentsPage.items.forEach(item => { item.page = chapterFirstPages.get(item.sectionId) || ''; });
    return {
      ready: true,
      designPack: 'design-01-editorial',
      spreads,
      pages,
      meta: bookMeta,
      expectedManuscripts,
      directorPlan: chapters.map(chapter => ({
        sectionId: chapter.sectionId,
        rhythm: chapter.compositionPlan.map(entry => ({
          slot: entry.slot,
          preference: entry.preference,
          reason: entry.reason,
          photoIndex: entry.photoIndex
        }))
      }))
    };
  }

  function audit(result) {
    if (result?.pagination === 'dom-exact-v2') return auditExactText(result);
    const violations = [];
    const spreads = result?.spreads || [];
    const seenPhotos = new Set();
    spreads.forEach((spread, index) => {
      // A long manuscript legitimately needs consecutive ordinary reading
      // spreads. Repetition is a rhythm violation only for decorative/photo
      // masters; treating two text spreads as an error made the QA reject the
      // very low-photo/high-text fallback the director is designed to support.
      const repeatedText = ['D01-SPREAD-TEXT','D01-SPREAD-TEXT-QUOTE','D01-SPREAD-TEXT-RHYTHM'].includes(spread.master);
      if (index && spread.master === spreads[index - 1].master && !repeatedText && spread.master !== 'D01-SPREAD-ENDPAPER' && !String(spread.master).startsWith('D01-SPREAD-DOCUMENT')) violations.push({ rule: 'spread-repeat', spread: index + 1, master: spread.master });
      if (index && spread.master === 'D01-SPREAD-PHOTO-TEXT' && spreads[index - 1].master === 'D01-SPREAD-PHOTO-TEXT') violations.push({ rule: 'photo-text-rhythm', spread: index + 1 });
      if(index&&isHeavySpread(spread.master)&&isHeavySpread(spreads[index-1].master))violations.push({rule:'heavy-spread-rhythm',spread:index+1,master:spread.master});
      [spread.left, spread.right].filter(Boolean).forEach(page => {
        const indexes = Array.isArray(page.photoIndices) ? page.photoIndices : Number.isInteger(page.photoIndex) ? [page.photoIndex] : [];
        indexes.forEach(photoIndex => {
          const key = imageSource(page.source?.photos?.[photoIndex]);
          if (!key) return;
          const intentionalContinuousImage = (spread.panorama === true && page.panorama === true) || spread.continuousImage === true;
          if (seenPhotos.has(key) && !intentionalContinuousImage) violations.push({ rule: 'photo-repeat', page: page.pageNo });
          seenPhotos.add(key);
        });
      });
    });
    const pages = result?.pages || [];
    const normalized = value => String(value || '').replace(/\s+/gu, ' ').trim();
    for (const source of result?.expectedManuscripts || []) {
      const actual = pages.filter(page => page.sectionId === source.sectionId && (page.layout === 'chapter-intro' || page.measuredFlow)).map(page => page.text).join(' ');
      if (normalized(source.text) !== normalized(actual)) violations.push({ rule: 'chapter-source-mismatch', sectionId: source.sectionId });
    }
    pages.forEach((page, index) => {
      if (page.measuredFlow && (page.measuredFlow.sourceText !== page.text || page.sourceText !== page.text))
        violations.push({ rule: 'manuscript-loss-or-duplicate', page: page.pageNo });
      if (page.measuredFlow && ['important','important-margin'].includes(page.rhythm) && !page.importantLine)
        violations.push({ rule: 'important-line-missing', page: page.pageNo });
      if (page.pageNo !== index + 1) violations.push({ rule: 'folio', page: index + 1 });
      // Editorial prose intentionally follows word-level pagination. A page
      // may therefore end in the middle of a sentence, just as in Word; the
      // next page must continue with the next word. Keep sentence-boundary
      // validation for non-editorial text such as document transcriptions.
      const wordFlow = ['chapter-intro','prose-dense','editorial-prose','photo-over-text','photo-side-text','photo-rail-text','stacked-text','bleed-text','dark-split','photo-overlay-text','photo-gradient-text','dark-gradient-photo','text-over-photo','dark-text','date-era'].includes(page.layout);
      if (page.text && !wordFlow && !/[.!?…»”"]$/.test(String(page.text).trim())) violations.push({ rule: 'sentence-cut', page: page.pageNo });
    });
    return { status: violations.length ? 'fail' : 'pass', spreads: spreads.length, pages: pages.length, violations };
  }

  global.OcherkiBookEngine = Object.freeze({ assemble, audit });
})(window);
