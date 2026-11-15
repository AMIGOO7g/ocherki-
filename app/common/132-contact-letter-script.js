/*@block [" id=\"contact-letter-script\"", ""]*/
(()=>{const btn=document.getElementById('contactBtn');if(!btn)return;
  const ADDRESS='I@evstafiadin.ru';
  const veil=document.createElement('div');veil.className='ct-veil';
  const card=document.createElement('div');card.className='ct-card';card.setAttribute('role','dialog');card.setAttribute('aria-label','Написать нам');
  const today=new Date().toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'2-digit'});
  card.innerHTML=`<button type="button" class="ct-x" aria-label="Закрыть">×</button>
    <img class="ct-stamp" src="assets/postcard/stamp-evstafiadi.webp" alt="Мастерская дизайна Евстафиади">
    <div class="ct-head">ПОЧТОВАЯ КАРТОЧКА</div>
    <div class="ct-sub">Напишите нам — мы читаем каждое письмо и отвечаем лично</div>
    <div class="ct-body"><div class="ct-col"><h4>Письмо</h4><textarea class="ct-letter-text" placeholder="Здравствуйте! Хочу спросить…"></textarea></div><i class="ct-rule"></i>
      <div class="ct-col ct-addr"><h4>Адрес для ответа</h4>
        <label><span>От кого</span><input class="ct-name" autocomplete="name" placeholder="Имя"></label>
        <label><span>Почта</span><input class="ct-mail" type="email" autocomplete="email" placeholder="name@mail.ru"></label>
        <label><span>Телефон</span><input class="ct-phone" type="tel" autocomplete="tel" placeholder="+7 900 000-00-00"></label></div></div>
    <div class="ct-foot"><small>или напрямую: <a href="mailto:${ADDRESS}">${ADDRESS}</a></small><button type="button" class="ct-send">Отправить письмо</button><span class="ct-sent-note">Письмо в пути. Ответим в течение дня — письмом.</span></div>
    <div class="ct-postmark"><span>МАСТЕРСКАЯ ДИЗАЙНА<b>${today}</b>ЕВСТАФИАДИ</span></div>`;
  document.body.append(veil,card);
  const show=on=>{veil.classList.toggle('on',on);card.classList.toggle('on',on);if(on){card.classList.remove('is-sent');setTimeout(()=>card.querySelector('.ct-letter-text')?.focus(),400);}};
  btn.addEventListener('click',e=>{e.stopPropagation();show(true);});
  veil.addEventListener('click',()=>show(false));
  card.querySelector('.ct-x').onclick=()=>show(false);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&card.classList.contains('on'))show(false);});
  card.querySelector('.ct-send').onclick=()=>{const text=card.querySelector('.ct-letter-text').value.trim();if(!text){card.querySelector('.ct-letter-text').focus();return;}
    const name=card.querySelector('.ct-name').value.trim(),mail=card.querySelector('.ct-mail').value.trim(),phone=card.querySelector('.ct-phone').value.trim();
    const body=`${text}\n\n— ${name||'Автор книги'}${mail?`\n${mail}`:''}${phone?`\n${phone}`:''}`;
    card.classList.add('is-sent');
    setTimeout(()=>{location.href=`mailto:${ADDRESS}?subject=${encodeURIComponent('Очерки жизни — письмо')}&body=${encodeURIComponent(body)}`;},700);};
})();
