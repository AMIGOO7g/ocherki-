(function(global){
  'use strict';
  // Physical dimensions and existing master bindings; no word capacities.
  const formats=Object.freeze({square:[1000,1000],portrait:[1000,1196]});
  const rhythm=Object.freeze(['inline-quote','important','margin','important-margin']);
  const textMasters=Object.freeze({'inline-quote':'D01-TEXT-INLINE-QUOTE',margin:'D01-TEXT-MARGIN',important:'D01-TEXT-IMPORTANT','important-margin':'D01-TEXT-IMPORTANT-MARGIN',plain:'D01-TEXT'});
  const compositions=Object.freeze([
    {id:'cycle',label:'Четыре текстовые роли',photos:0},
    ...rhythm.map(id=>({id,label:({'inline-quote':'Цитата в тексте',margin:'Заметка на поле',important:'Важная строка','important-margin':'Важная строка + заметка'})[id],photos:0})),
    {id:'ctx-detail-sq',label:'CTX Detail SQ v1.7',photos:2,master:'D01-CTX-DETAIL-SQ',kind:'ctx-detail-sq',layout:'ctx-detail-sq',pair:'ctx'},
    {id:'dark-fade-2.2',label:'DARK FADE 2.2',photos:1,master:'D01-DARK-FADE-2.2',kind:'dark-fade',layout:'dark-fade-2.2',pair:'dark-fade'},
    {id:'photo',label:'Одна фотография',photos:1,master:'D01-LARGE-PHOTO',kind:'large-photo',layout:'photo-fullspread'},
    {id:'two-photo',label:'Две фотографии',photos:2,master:'D01-TWO-PHOTO',kind:'two-photo',layout:'photo-duo'},
    {id:'three-photo',label:'Три фотографии',photos:3,master:'D01-THREE-PHOTO',kind:'three-photo',layout:'photo-triptych'},
    {id:'mosaic',label:'Фотомозаика',photos:12,master:'D01-MOSAIC',kind:'mosaic',layout:'mosaic'},
    {id:'panorama',label:'Фото через разворот',photos:1,master:'D01-PANORAMA',kind:'photo',layout:'panorama',pair:'panorama'},
    {id:'photo-rail',label:'Фото на полтора листа',photos:1,master:'D01-PHOTO-RAIL',kind:'photo-rail-image',layout:'photo-rail-image',pair:'rail'},
    {id:'photo-over-text',label:'Фото сверху, текст снизу',photos:1,master:'D01-PHOTO-OVER-TEXT',kind:'photo-over-text',layout:'photo-over-text',slot:'.dpk-photo-over-copy .dpk-columns'},
    {id:'text-over-photo',label:'Текст сверху, фото снизу',photos:1,master:'D01-TEXT-OVER-PHOTO',kind:'text-over-photo',layout:'text-over-photo',slot:'.dpk-text-over-copy .dpk-reading'},
    {id:'photo-side-text',label:'Фото и текст рядом',photos:1,master:'D01-PHOTO-SIDE-TEXT',kind:'photo-side-text',layout:'photo-side-text',slot:'.dpk-side-copy .dpk-reading'},
    {id:'stacked-text',label:'Два фото рядом с текстом',photos:2,master:'D01-STACKED-TEXT',kind:'stacked-text',layout:'stacked-text',slot:'.dpk-stacked-copy .dpk-reading'},
    {id:'photo-gradient-text',label:'Фото с градиентом',photos:1,master:'D01-PHOTO-GRADIENT-TEXT',kind:'photo-gradient-text',layout:'photo-gradient-text',slot:'.dpk-gradient-copy > p'},
    {id:'dark-gradient-photo',label:'Тёмный разворот с фото',photos:1,master:'D01-DARK-GRADIENT-PHOTO',kind:'dark-gradient-photo',layout:'dark-gradient-photo',slot:'.dpk-dark-gradient-copy > p',dark:true},
    {id:'dark-split',label:'Тёмный текст и фото',photos:1,master:'D01-DARK-SPLIT',kind:'dark-split',layout:'dark-split',slot:'.dpk-dark-split-copy > p',dark:true},
    {id:'document',label:'Документ и расшифровка',photos:1,master:'D01-DOCUMENT',kind:'document',layout:'document-letter',pair:'document'}
  ]);
  global.OcherkiDesignPackLayout=Object.freeze({formats,rhythm,textMasters,compositions});
})(window);
