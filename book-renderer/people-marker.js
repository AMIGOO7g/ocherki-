/* «Кто на фото»: marking people on a group photograph. A click on a face
 * puts the next number there, the name is typed on the right; numbers can
 * be dragged or removed. Marks are kept on the photo as
 * [{x, y, name}] with x/y in percent of the image, in reading order. */
(function (root) {
  'use strict';

  const esc = value => String(value ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const STYLE = `
  .pm-overlay{position:fixed;inset:0;z-index:5200;background:rgba(30,22,16,.6);display:flex;align-items:center;justify-content:center;font-family:Georgia,"Times New Roman",serif;color:#3b2a20}
  .pm-panel{display:flex;gap:26px;max-width:96vw;max-height:92vh;background:#f8f0e3;border-radius:14px;padding:24px;box-shadow:0 30px 70px rgba(0,0,0,.4)}
  .pm-stage{position:relative;align-self:center;cursor:crosshair;user-select:none;line-height:0}
  .pm-stage img{max-width:62vw;max-height:84vh;display:block;border-radius:4px}
  .pm-mark{position:absolute;transform:translate(-50%,-50%);width:30px;height:30px;border-radius:50%;background:#fffaf2;color:#2b2622;font:700 15px/30px Georgia,serif;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.45);cursor:grab}
  .pm-mark.is-active{background:#a8692f;color:#fff}
  .pm-side{width:320px;display:flex;flex-direction:column}
  .pm-side h2{margin:0 0 6px;font-weight:400;font-size:26px}
  .pm-side p{margin:0 0 14px;font-size:15px;color:#7d6857;line-height:1.4}
  .pm-list{flex:1;overflow:auto;margin:0;padding:0;list-style:none}
  .pm-list li{display:flex;align-items:center;gap:10px;margin-bottom:8px}
  .pm-list li b{flex:0 0 28px;height:28px;border-radius:50%;border:1px solid #9a7d63;text-align:center;font:600 14px/26px Georgia,serif;box-sizing:border-box}
  .pm-list input{flex:1;border:0;border-bottom:1px solid rgba(112,77,48,.25);background:transparent;padding:6px 0;font:17px Georgia,serif;color:#3b2a20;outline:none}
  .pm-list input:focus{border-bottom-color:#c48a4f}
  .pm-list button{border:0;background:none;color:#a0897a;font-size:18px;cursor:pointer}
  .pm-empty{color:#9a8878;font-style:italic;font-size:15px}
  .pm-actions{display:flex;justify-content:space-between;align-items:center;margin-top:14px;gap:12px}
  .pm-actions .pm-done{border:0;border-radius:22px;background:#a8692f;color:#fff8ee;font:600 16px Georgia,serif;padding:11px 24px;cursor:pointer}
  .pm-actions .pm-clear{border:0;background:none;color:#8f5a2e;text-decoration:underline;font:15px Georgia,serif;cursor:pointer}
  .pm-note{font-size:13px;color:#9a8878;margin-top:10px}`;

  function open({ src, marks = [], onDone }) {
    if (!document.getElementById('pm-style')) { const style = document.createElement('style'); style.id = 'pm-style'; style.textContent = STYLE; document.head.appendChild(style); }
    let list = marks.map(mark => ({ x: Number(mark.x) || 0, y: Number(mark.y) || 0, name: String(mark.name || '') }));
    const overlay = document.createElement('div');
    overlay.className = 'pm-overlay';
    overlay.innerHTML = `<div class="pm-panel" role="dialog" aria-label="Кто на фото">
      <div class="pm-stage"><img src="${esc(src)}" alt=""></div>
      <div class="pm-side"><h2>Кто на фото</h2><p>Нажмите на лицо — появится номер. Справа впишите имя. Номер можно перетащить.</p>
        <ol class="pm-list"></ol>
        <div class="pm-note">В книге фото получит свой разворот, если отмечено хотя бы двое.</div>
        <div class="pm-actions"><button type="button" class="pm-clear">Убрать все отметки</button><button type="button" class="pm-done">Готово</button></div></div></div>`;
    document.body.appendChild(overlay);
    // Clicks here must not reach the page under it (it may close a card).
    ['pointerdown', 'mousedown', 'mouseup', 'click'].forEach(type => overlay.addEventListener(type, event => event.stopPropagation()));
    const stage = overlay.querySelector('.pm-stage'), listNode = overlay.querySelector('.pm-list');

    const drawMarks = active => {
      stage.querySelectorAll('.pm-mark').forEach(node => node.remove());
      list.forEach((mark, index) => {
        const node = document.createElement('span');
        node.className = 'pm-mark' + (index === active ? ' is-active' : '');
        node.dataset.index = index; node.textContent = index + 1;
        node.style.left = mark.x + '%'; node.style.top = mark.y + '%';
        stage.appendChild(node);
      });
    };
    const drawList = focus => {
      listNode.innerHTML = list.length ? list.map((mark, index) => `<li data-index="${index}"><b>${index + 1}</b><input type="text" placeholder="Имя" value="${esc(mark.name)}"><button type="button" title="Убрать">✕</button></li>`).join('') : '<li class="pm-empty">Пока никто не отмечен.</li>';
      if (focus != null) listNode.querySelector(`li[data-index="${focus}"] input`)?.focus();
    };
    const position = event => { const rect = stage.querySelector('img').getBoundingClientRect(); return { x: Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100)), y: Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100)) }; };

    let drag = null, moved = false;
    stage.addEventListener('pointerdown', event => {
      const mark = event.target.closest('.pm-mark');
      if (mark) { drag = Number(mark.dataset.index); moved = false; stage.setPointerCapture(event.pointerId); event.preventDefault(); }
    });
    stage.addEventListener('pointermove', event => {
      if (drag == null) return;
      moved = true; Object.assign(list[drag], position(event));
      const node = stage.querySelector(`.pm-mark[data-index="${drag}"]`); if (node) { node.style.left = list[drag].x + '%'; node.style.top = list[drag].y + '%'; }
    });
    stage.addEventListener('pointerup', event => {
      if (drag != null) { const index = drag; drag = null; if (!moved) { drawMarks(index); listNode.querySelector(`li[data-index="${index}"] input`)?.focus(); } return; }
      if (event.target.tagName !== 'IMG') return;
      list.push({ ...position(event), name: '' });
      drawMarks(list.length - 1); drawList(list.length - 1);
    });
    listNode.addEventListener('input', event => { const li = event.target.closest('li[data-index]'); if (li) list[Number(li.dataset.index)].name = event.target.value; });
    listNode.addEventListener('focusin', event => { const li = event.target.closest('li[data-index]'); if (li) drawMarks(Number(li.dataset.index)); });
    listNode.addEventListener('click', event => {
      if (event.target.tagName !== 'BUTTON') return;
      list.splice(Number(event.target.closest('li').dataset.index), 1); drawMarks(); drawList();
    });
    listNode.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); event.target.blur(); } });
    overlay.querySelector('.pm-clear').addEventListener('click', () => { if (!list.length || window.confirm('Убрать все отметки с этого фото?')) { list = []; drawMarks(); drawList(); } });
    const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); onDone && onDone(list.filter(mark => mark.name.trim() || true).map(mark => ({ x: Math.round(mark.x * 10) / 10, y: Math.round(mark.y * 10) / 10, name: mark.name.trim() }))); };
    const onKey = event => { if (event.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    overlay.querySelector('.pm-done').addEventListener('click', close);
    drawMarks(); drawList();
  }

  root.OcherkiPeopleMarker = Object.freeze({ open });
})(typeof window !== 'undefined' ? window : globalThis);
