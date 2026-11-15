/*@block [" id=\"book-screen-panel-close\"", ""]*/
// In «Книга» a chosen design, format or photo mode closes its panel, so the
// blur lifts and the book shows the choice.
document.addEventListener('click',e=>{
  if(!document.querySelector('.shell.is-book-preview'))return;
  const card=e.target.closest?.('.bd-section.is-carousel :is(.bd-design-card,.bd-format-card,.bd-photo-mode-option)');
  if(!card||card.matches('[disabled],.is-disabled,.is-soon'))return;
  setTimeout(()=>document.querySelector('.bd-rail-key.is-active')?.click(),420);
},true);
