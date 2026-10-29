/* Family tree form for the «Семейное древо» page. Instead of typing dashes
 * and pluses, the user fills cards: name, years, town, «important person»,
 * a photo from the book, and buttons to add parents, a spouse, a child or a
 * brother/sister. The model is stored on the page (page.treeData); the
 * book engine reads it directly, and page.text gets the same tree in the
 * text format as a readable copy.
 *
 * Model: {version, rootId, people: {id: {id, name, dates, place, major,
 * photoId}}, unions: [{id, a, b, children: [ids]}]}. */
(function (root) {
  'use strict';

  const uid = prefix => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const esc = value => String(value ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const person = () => ({ id: uid('p'), name: '', dates: '', place: '', major: false, photoId: '' });

  function emptyModel() { const hero = person(); return { version: 1, rootId: hero.id, people: { [hero.id]: hero }, unions: [] }; }

  const parentsOf = (model, id) => model.unions.find(union => union.children.includes(id)) || null;
  const unionsOf = (model, id) => model.unions.filter(union => union.a === id || union.b === id);
  const partnerIn = (union, id) => (union.a === id ? union.b : union.a);
  const nameOf = (model, id) => String(model.people[id]?.name || '').trim();
  const shortName = (model, id) => nameOf(model, id).split(/\s+/u)[0] || 'без имени';

  // Who starts a branch of the written tree: people without parents whose
  // partners have no parents either (one of each such couple).
  function rootsOf(model) {
    const out = [], used = new Set();
    for (const id of Object.keys(model.people)) {
      if (used.has(id) || parentsOf(model, id)) continue;
      const partners = unionsOf(model, id).map(union => partnerIn(union, id)).filter(Boolean);
      if (partners.some(other => parentsOf(model, other))) continue;
      out.push(id); used.add(id); partners.forEach(other => used.add(other));
    }
    return out;
  }

  // The same tree in the text format («Имя (годы), город + Супруг»,
  // children with one more dash), as a readable copy on the page.
  function toText(model) {
    const lines = [], label = id => {
      const p = model.people[id] || {};
      return `${String(p.name || '').trim() || 'Имя неизвестно'}${p.major ? ' *' : ''}${p.dates ? ` (${p.dates})` : ''}${p.place ? `, ${p.place}` : ''}`;
    };
    const emit = (id, level, seen) => {
      if (seen.has(id)) return; seen.add(id);
      const dash = '— '.repeat(level), unions = unionsOf(model, id);
      if (unions.length <= 1) {
        const spouse = unions[0] ? partnerIn(unions[0], id) : null;
        lines.push(`${dash}${label(id)}${spouse ? ` + ${label(spouse)}` : ''}`);
        if (spouse) seen.add(spouse);
        (unions[0]?.children || []).forEach(child => emit(child, level + 1, seen));
      } else {
        lines.push(`${dash}${label(id)}`);
        for (const union of unions) {
          const spouse = partnerIn(union, id);
          lines.push(`${dash}+ ${spouse ? label(spouse) : 'Имя неизвестно'}`);
          if (spouse) seen.add(spouse);
          union.children.forEach(child => emit(child, level + 1, seen));
        }
      }
    };
    const seen = new Set();
    rootsOf(model).forEach(id => emit(id, 0, seen));
    return lines.join('\n');
  }

  // Older pages typed in the text format become a model on first opening.
  function fromText(text) {
    const model = { version: 1, rootId: '', people: {}, unions: [] }, last = [];
    const add = raw => {
      let value = String(raw || '').trim(); if (!value) return null;
      const major = /\*/u.test(value); value = value.replace(/\*/gu, '').trim();
      const dates = (value.match(/\(([^)]*)\)/u)?.[1] || '').trim(); value = value.replace(/\([^)]*\)/gu, '').trim();
      const [name, ...rest] = value.split(',').map(part => part.trim());
      const p = { ...person(), name: name === 'Имя неизвестно' ? '' : name, dates, place: rest.filter(Boolean).join(', '), major };
      model.people[p.id] = p; return p.id;
    };
    for (const line of String(text || '').split(/\r?\n/u)) {
      const lead = line.match(/^\s*((?:[—–-]\s*)*)/u), level = (lead[1].match(/[—–-]/gu) || []).length, body = line.slice(lead[0].length).trim();
      if (!body) continue;
      if (body.startsWith('+')) { const owner = last[level], spouse = add(body.slice(1)); if (owner && spouse) model.unions.push({ id: uid('u'), a: owner, b: spouse, children: [] }); continue; }
      const [first, ...spouses] = body.split(/\s\+\s/u), id = add(first); if (!id) continue;
      spouses.forEach(raw => { const spouse = add(raw); if (spouse) model.unions.push({ id: uid('u'), a: id, b: spouse, children: [] }); });
      if (level > 0 && last[level - 1]) {
        const parent = last[level - 1];
        let union = unionsOf(model, parent).at(-1);
        if (!union) { union = { id: uid('u'), a: parent, b: null, children: [] }; model.unions.push(union); }
        union.children.push(id);
      }
      if (!model.rootId) model.rootId = id;
      last[level] = id; last.length = level + 1;
    }
    return Object.keys(model.people).length ? model : emptyModel();
  }

  // Generations relative to the main person: parents above, children below.
  function generations(model) {
    const gen = new Map([[model.rootId, 0]]), order = [model.rootId];
    for (let i = 0; i < order.length; i++) {
      const id = order[i], g = gen.get(id), visit = (other, value) => { if (other && !gen.has(other) && model.people[other]) { gen.set(other, value); order.push(other); } };
      const parents = parentsOf(model, id);
      if (parents) { visit(parents.a, g - 1); visit(parents.b, g - 1); parents.children.forEach(child => visit(child, g)); }
      for (const union of unionsOf(model, id)) { visit(partnerIn(union, id), g); union.children.forEach(child => visit(child, g + 1)); }
    }
    for (const id of Object.keys(model.people)) if (!gen.has(id)) { gen.set(id, 0); order.push(id); }
    return { gen, order };
  }

  function relation(model, id) {
    if (id === model.rootId) return 'Главный человек книги';
    const parents = parentsOf(model, id);
    if (parents) {
      const names = [parents.a, parents.b].filter(Boolean).map(other => shortName(model, other)).filter(name => name !== 'без имени');
      return names.length ? `Ребёнок: ${names.join(' и ')}` : 'Ребёнок';
    }
    const union = unionsOf(model, id)[0];
    if (union) {
      const other = partnerIn(union, id);
      if (other && parentsOf(model, other) || other === model.rootId) return `Супруг(а): ${shortName(model, other)}`;
      const child = model.unions.find(item => (item.a === id || item.b === id) && item.children.length)?.children[0];
      if (child) return `Родитель: ${shortName(model, child)}`;
      if (other) return `Супруг(а): ${shortName(model, other)}`;
    }
    return '';
  }

  const STYLE = `
  .te-overlay{position:fixed;inset:0;z-index:5000;background:rgba(40,28,18,.42);display:flex;align-items:stretch;justify-content:center;font-family:Georgia,"Times New Roman",serif;color:#3b2a20}
  .te-panel{margin:24px;flex:1;max-width:1180px;background:#f8f0e3;border-radius:14px;box-shadow:0 30px 70px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden}
  .te-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;padding:26px 34px 16px;border-bottom:1px solid rgba(112,77,48,.16)}
  .te-head h2{margin:0;font-weight:400;font-size:30px}
  .te-head p{margin:6px 0 0;font-size:16px;color:#7d6857;max-width:640px}
  .te-done{border:0;border-radius:24px;background:#a8692f;color:#fff8ee;font:600 16px Georgia,serif;padding:12px 26px;cursor:pointer}
  .te-body{flex:1;overflow:auto;padding:18px 34px 40px}
  .te-gen{margin:18px 0 6px;font:600 12px/1 Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#a07a58}
  .te-row{display:flex;flex-wrap:wrap;gap:16px}
  .te-card{width:300px;background:#fffaf2;border:1px solid rgba(112,77,48,.18);border-radius:12px;padding:14px 16px 12px;box-shadow:0 4px 12px rgba(80,55,30,.08)}
  .te-card.root{border-color:#c48a4f;box-shadow:0 0 0 2px rgba(196,138,79,.22)}
  .te-rel{font:italic 14px/1.3 Georgia,serif;color:#9a7d63;margin-bottom:8px;min-height:18px}
  .te-card input[type=text]{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid rgba(112,77,48,.22);background:transparent;padding:6px 0 7px;font:17px Georgia,serif;color:#3b2a20;outline:none;margin-bottom:6px}
  .te-card input.te-name{font-size:20px}
  .te-card input[type=text]:focus{border-bottom-color:#c48a4f}
  .te-two{display:flex;gap:12px}.te-two input{flex:1}
  .te-major{display:flex;gap:8px;align-items:center;font-size:15px;margin:6px 0 4px;cursor:pointer}
  .te-major input{width:18px;height:18px;accent-color:#a8692f}
  .te-photo{display:flex;align-items:center;gap:10px;margin:6px 0 8px;font-size:15px}
  .te-photo img{width:46px;height:58px;object-fit:cover;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.2)}
  .te-photo button,.te-link{border:0;background:none;padding:0;color:#8f5a2e;font:15px Georgia,serif;text-decoration:underline;cursor:pointer}
  .te-actions{display:flex;flex-wrap:wrap;gap:6px;border-top:1px solid rgba(112,77,48,.12);padding-top:10px;margin-top:4px}
  .te-actions button{border:1px solid rgba(143,90,46,.35);background:#fff;border-radius:18px;padding:6px 11px;font:15px Georgia,serif;color:#6e4524;cursor:pointer}
  .te-actions button:hover{background:#f5e6d2}
  .te-actions button.te-remove{border-color:transparent;color:#a0897a;margin-left:auto}
  .te-ask{font-size:15px;margin-bottom:6px;width:100%}
  .te-picker{position:fixed;inset:0;z-index:5100;background:rgba(40,28,18,.4);display:flex;align-items:center;justify-content:center}
  .te-picker-box{background:#f8f0e3;border-radius:12px;padding:22px 24px;max-width:760px;max-height:80vh;overflow:auto}
  .te-picker-box h3{margin:0 0 14px;font-weight:400;font-size:22px}
  .te-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:12px}
  .te-grid button{border:2px solid transparent;background:none;padding:0;cursor:pointer;border-radius:6px;overflow:hidden}
  .te-grid button:hover{border-color:#c48a4f}
  .te-grid img{width:100%;height:120px;object-fit:cover;display:block}
  .te-empty{color:#8e7a69;font-size:16px}
  .te-note{color:#8e7a69;font-size:14px;margin-top:4px}`;

  function open({ page, photos = [], onChange }) {
    if (!document.getElementById('te-style')) { const style = document.createElement('style'); style.id = 'te-style'; style.textContent = STYLE; document.head.appendChild(style); }
    let model = page.treeData && page.treeData.people ? JSON.parse(JSON.stringify(page.treeData)) : (String(page.text || '').trim() ? fromText(page.text) : emptyModel());
    const photoById = new Map(photos.map(photo => [String(photo.id), photo]));
    const overlay = document.createElement('div');
    overlay.className = 'te-overlay';
    overlay.innerHTML = `<div class="te-panel" role="dialog" aria-label="Семейное древо">
      <div class="te-head"><div><h2>Семейное древо</h2><p>Начните с главного человека книги. Кнопки под карточкой добавляют родителей, супругов, детей, братьев и сестёр. Неизвестное можно оставить пустым.</p></div><button class="te-done" type="button">Готово</button></div>
      <div class="te-body"></div></div>`;
    document.body.appendChild(overlay);
    const body = overlay.querySelector('.te-body');

    const commit = () => onChange && onChange(JSON.parse(JSON.stringify(model)), toText(model));
    const genTitle = g => g === 0 ? 'Поколение главного человека' : g < 0 ? (g === -1 ? 'Родители' : g === -2 ? 'Бабушки и дедушки' : 'Прадеды') : (g === 1 ? 'Дети' : g === 2 ? 'Внуки' : 'Правнуки');

    function card(id) {
      const p = model.people[id], photo = p.photoId ? photoById.get(String(p.photoId)) : null;
      const unions = unionsOf(model, id), parents = parentsOf(model, id);
      const canRemove = id !== model.rootId && !unions.some(union => union.children.length);
      return `<div class="te-card${id === model.rootId ? ' root' : ''}" data-id="${id}">
        <div class="te-rel">${esc(relation(model, id))}</div>
        <input type="text" class="te-name" data-field="name" placeholder="Имя и фамилия" value="${esc(p.name)}">
        <div class="te-two"><input type="text" data-field="dates" placeholder="Годы: 1920–1995" value="${esc(p.dates)}"><input type="text" data-field="place" placeholder="Город" value="${esc(p.place)}"></div>
        <label class="te-major"><input type="checkbox" data-field="major"${p.major ? ' checked' : ''}> Важный человек — с портретом</label>
        <div class="te-photo">${photo ? `<img src="${esc(photo.src)}" alt=""><button type="button" data-act="photo">Другое фото</button><button type="button" data-act="nophoto">Убрать</button>` : `<button type="button" data-act="photo">Выбрать фото из книги</button>`}</div>
        <div class="te-actions">
          ${parents ? '' : '<button type="button" data-act="parents">＋ Родители</button>'}
          <button type="button" data-act="spouse">＋ Супруг(а)</button>
          <button type="button" data-act="child">＋ Ребёнок</button>
          <button type="button" data-act="sibling">＋ Брат или сестра</button>
          ${canRemove ? '<button type="button" class="te-remove" data-act="remove">Удалить</button>' : ''}
        </div></div>`;
    }

    function draw(focusId) {
      const { gen, order } = generations(model), rows = new Map();
      for (const id of order) { const g = gen.get(id); if (!rows.has(g)) rows.set(g, []); rows.get(g).push(id); }
      body.innerHTML = [...rows.keys()].sort((a, b) => a - b).map(g => `<div class="te-gen">${genTitle(g)}</div><div class="te-row">${rows.get(g).map(card).join('')}</div>`).join('');
      if (focusId) body.querySelector(`[data-id="${focusId}"] .te-name`)?.focus();
    }

    function addChild(parentId, union) {
      const child = person(); model.people[child.id] = child;
      if (!union) { union = { id: uid('u'), a: parentId, b: null, children: [] }; model.unions.push(union); }
      union.children.push(child.id);
      return child.id;
    }

    function act(id, action, cardNode) {
      const p = model.people[id];
      if (action === 'parents') {
        const father = person(), mother = person();
        model.people[father.id] = father; model.people[mother.id] = mother;
        model.unions.push({ id: uid('u'), a: father.id, b: mother.id, children: [id] });
        commit(); draw(father.id); return;
      }
      if (action === 'spouse') {
        const spouse = person(); model.people[spouse.id] = spouse;
        // A child added before the spouse sits in a union without a partner:
        // the spouse joins that union instead of starting a new one.
        const single = unionsOf(model, id).find(union => !partnerIn(union, id));
        if (single) { if (single.a === id) single.b = spouse.id; else single.a = spouse.id; }
        else model.unions.push({ id: uid('u'), a: id, b: spouse.id, children: [] });
        commit(); draw(spouse.id); return;
      }
      if (action === 'child') {
        const unions = unionsOf(model, id);
        if (unions.length <= 1) { const child = addChild(id, unions[0]); commit(); draw(child); return; }
        // Several marriages: ask which one the child is from.
        const actions = cardNode.querySelector('.te-actions');
        actions.innerHTML = `<div class="te-ask">От какого брака ребёнок?</div>${unions.map(union => `<button type="button" data-union="${union.id}">с ${esc(partnerIn(union, id) ? shortName(model, partnerIn(union, id)) : 'неизвестным')}</button>`).join('')}<button type="button" class="te-remove" data-union="">Отмена</button>`;
        actions.querySelectorAll('[data-union]').forEach(button => button.addEventListener('click', event => {
          event.stopPropagation();
          const union = model.unions.find(item => item.id === button.dataset.union);
          if (!union) { draw(); return; }
          const child = addChild(id, union); commit(); draw(child);
        }));
        return;
      }
      if (action === 'sibling') {
        let parents = parentsOf(model, id);
        if (!parents) { const father = person(), mother = person(); model.people[father.id] = father; model.people[mother.id] = mother; parents = { id: uid('u'), a: father.id, b: mother.id, children: [id] }; model.unions.push(parents); }
        const sibling = person(); model.people[sibling.id] = sibling; parents.children.push(sibling.id);
        commit(); draw(sibling.id); return;
      }
      if (action === 'remove') {
        if (!window.confirm(`Удалить «${p.name || 'без имени'}» из древа?`)) return;
        const drop = new Set([id]);
        for (const union of unionsOf(model, id)) { const other = partnerIn(union, id); if (other && !parentsOf(model, other) && unionsOf(model, other).length === 1 && other !== model.rootId) drop.add(other); }
        model.unions = model.unions.filter(union => !(union.a === id || union.b === id) || union.children.length).map(union => ({ ...union, children: union.children.filter(child => !drop.has(child)) }));
        model.unions = model.unions.map(union => ({ ...union, a: drop.has(union.a) ? null : union.a, b: drop.has(union.b) ? null : union.b })).filter(union => union.a || union.b || union.children.length);
        drop.forEach(other => delete model.people[other]);
        commit(); draw(); return;
      }
      if (action === 'photo') {
        const picker = document.createElement('div');
        picker.className = 'te-picker';
        picker.innerHTML = `<div class="te-picker-box"><h3>Фото для «${esc(p.name || 'без имени')}»</h3>${photos.length ? `<div class="te-grid">${photos.map(photo => `<button type="button" data-photo="${esc(photo.id)}"><img src="${esc(photo.src)}" alt=""></button>`).join('')}</div>` : '<p class="te-empty">В книге пока нет фотографий. Добавьте их в главы — и они появятся здесь.</p>'}<p class="te-note">Портрет показывается в древе, если отмечено «Важный человек».</p><button type="button" class="te-link" data-photo="">Закрыть</button></div>`;
        document.body.appendChild(picker);
        picker.addEventListener('click', event => {
          const button = event.target.closest('[data-photo]');
          if (!button && event.target !== picker) return;
          if (button && button.dataset.photo) { p.photoId = button.dataset.photo; p.major = true; commit(); draw(); }
          picker.remove();
        });
        return;
      }
      if (action === 'nophoto') { p.photoId = ''; commit(); draw(); }
    }

    body.addEventListener('input', event => {
      const field = event.target.dataset.field, id = event.target.closest('[data-id]')?.dataset.id;
      if (!field || !id || !model.people[id]) return;
      model.people[id][field] = field === 'major' ? event.target.checked : event.target.value;
      commit();
    });
    body.addEventListener('change', event => { if (event.target.dataset.field === 'major') { const id = event.target.closest('[data-id]').dataset.id; model.people[id].major = event.target.checked; commit(); } });
    body.addEventListener('click', event => {
      const button = event.target.closest('[data-act]'); if (!button) return;
      const cardNode = button.closest('[data-id]');
      act(cardNode.dataset.id, button.dataset.act, cardNode);
    });
    // Names typed in a card change the captions of the others on leaving it.
    body.addEventListener('focusout', event => { if (event.target.dataset.field === 'name') body.querySelectorAll('[data-id]').forEach(node => { node.querySelector('.te-rel').textContent = relation(model, node.dataset.id); }); });
    const close = () => { commit(); overlay.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = event => { if (event.key === 'Escape' && !document.querySelector('.te-picker')) close(); };
    document.addEventListener('keydown', onKey);
    overlay.querySelector('.te-done').addEventListener('click', close);
    draw(model.people[model.rootId] && !model.people[model.rootId].name ? model.rootId : '');
  }

  root.OcherkiTreeEditor = Object.freeze({ open, toText, fromText, rootsOf, parentsOf, unionsOf, partnerIn });
})(typeof window !== 'undefined' ? window : globalThis);
