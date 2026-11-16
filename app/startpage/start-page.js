/*@block ["", ""]*/
    (() => {
      "use strict";

      const root = document.getElementById("lbStart");
      const prologue = document.getElementById("lbPrologue");
      const prologueText = document.getElementById("lbPrologueText");
      const step1 = document.getElementById("step1Content");
      const step2 = document.getElementById("step2Content");
      const step3 = document.getElementById("step3Content");
      const step4 = document.getElementById("step4Content");
      const step5 = document.getElementById("step5Content");
      const step6 = document.getElementById("step6Content");
      const step7 = document.getElementById("step7Content");
      const createButton = document.getElementById("lbCreateBook");
      const pageBody = document.getElementById("pageBody");
      const startAuthGate = document.getElementById("startAuthGate");
      const startAuthKey = document.getElementById("startAuthKey");
      const startAuthModal = document.getElementById("startAuthModal");
      const startAuthForm = document.getElementById("startAuthForm");
      const startAuthClose = document.getElementById("startAuthClose");
      const startAuthGuest = document.getElementById("startAuthGuest");
      const startAuthEmail = document.getElementById("startAuthEmail");
      const startAuthPassword = document.getElementById("startAuthPassword");
      const startAuthStatus = document.getElementById("startAuthStatus");

      let isSkipped = false;
      let welcomeTimer = null;

      const hasStoredAccess = () => {
        try {
          return Boolean(localStorage.getItem("ocherki_auth_email") || sessionStorage.getItem("ocherki_auth_guest"));
        } catch (_) { return false; }
      };

      const finishWelcome = () => {
        window.clearTimeout(welcomeTimer);
        prologueText?.classList.remove("is-active");
        prologue?.classList.add("is-hidden");
        /* Let the prologue's fade finish before the first step is revealed. */
        window.setTimeout(() => {
          root.classList.remove("is-welcome-visible");
          root.classList.add("is-content-visible");
          window.goToStep?.(1);
        }, 1300);
      };

      const revealWelcome = () => {
        startAuthGate?.classList.remove("is-ready");
        startAuthGate?.setAttribute("aria-hidden", "true");
        root.classList.remove("is-auth-waiting", "is-auth-released");
        root.classList.remove("is-preauth");
        root.classList.add("is-welcome-visible");
        prologue?.classList.remove("is-hidden");
        prologueText?.classList.remove("is-active");
        requestAnimationFrame(() => prologueText?.classList.add("is-active"));
        window.clearTimeout(welcomeTimer);
        welcomeTimer = window.setTimeout(finishWelcome, 3400);
        musicAllowed = true;
        if (musicPreference) startAmbientMusic("auth-released");
      };

      const showStartAuth = () => {
        /* The entry scene is intentionally shown on every launch. A stored
           email only pre-fills the modal; it must not bypass the hanging key,
           otherwise the startup order changes from session to session. */
        root.classList.add("is-auth-waiting");
        startAuthGate?.classList.add("is-ready");
        startAuthGate?.setAttribute("aria-hidden", "false");
      };

      const releaseStartAuth = () => {
        try { sessionStorage.setItem("ocherki_auth_guest", "1"); } catch (_) {}
        startAuthModal?.classList.remove("is-open");
        startAuthModal?.setAttribute("aria-hidden", "true");
        root.classList.add("is-auth-released");
        window.setTimeout(revealWelcome, 680);
      };

      startAuthKey?.addEventListener("click", () => {
        startAuthModal?.classList.add("is-open");
        startAuthModal?.setAttribute("aria-hidden", "false");
        window.setTimeout(() => startAuthEmail?.focus(), 40);
      });
      startAuthClose?.addEventListener("click", () => {
        startAuthModal?.classList.remove("is-open");
        startAuthModal?.setAttribute("aria-hidden", "true");
      });
      startAuthModal?.addEventListener("click", event => {
        if (event.target === startAuthModal) {
          startAuthModal.classList.remove("is-open");
          startAuthModal.setAttribute("aria-hidden", "true");
        }
      });
      startAuthGuest?.addEventListener("click", releaseStartAuth);
      // Sign-in by a code sent to the e-mail (server/server.js). Step one
      // asks for the code, step two checks it; the server sets the session.
      const startAuthCode = document.getElementById("startAuthCode");
      const startAuthCodeField = document.getElementById("startAuthCodeField");
      const startAuthConsent = document.getElementById("startAuthConsent");
      const startAuthConsentField = document.getElementById("startAuthConsentField");
      const startAuthSubmit = document.getElementById("startAuthSubmit");
      const startAuthLead = document.getElementById("startAuthLead");
      const say = text => { if (startAuthStatus) startAuthStatus.textContent = text; };
      const authCall = async (path, body) => {
        const response = await fetch(path, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-Ocherki": "1" }, body: JSON.stringify(body) });
        let data = {}; try { data = await response.json(); } catch (_) {}
        return { ok: response.ok, status: response.status, data };
      };
      let codeSentTo = "", resendTimer = 0;
      const startAuthResend = document.getElementById("startAuthResend");
      const startAuthResendBtn = document.getElementById("startAuthResendBtn");
      // The code lives 10 minutes; a new one can be asked for after a
      // minute, with the countdown on the button.
      const startResendCountdown = seconds => {
        window.clearInterval(resendTimer);
        let left = Math.max(1, Number(seconds) || 60);
        const tick = () => {
          if (!startAuthResendBtn) return;
          if (left <= 0) { window.clearInterval(resendTimer); startAuthResendBtn.disabled = false; startAuthResendBtn.textContent = "Отправить код ещё раз"; return; }
          startAuthResendBtn.disabled = true;
          startAuthResendBtn.textContent = `Отправить ещё раз через 0:${String(left).padStart(2, "0")}`;
          left -= 1;
        };
        tick(); resendTimer = window.setInterval(tick, 1000);
      };
      const requestCode = async email => {
        say("Отправляем код…");
        let result;
        try { result = await authCall("/api/auth/request", { email }); } catch (_) { result = { ok: false, status: 0, data: {} }; }
        if (result.status === 404 || result.status === 0 || result.status === 405 || result.status === 501) { say("Вход сейчас недоступен. Можно продолжить без входа — книга сохранится на этом компьютере."); return false; }
        if (result.data.retryIn) startResendCountdown(result.data.retryIn);
        if (!result.ok) { say(result.data.error || "Не удалось отправить код."); return false; }
        say("");
        return true;
      };
      const showEmailStep = () => {
        codeSentTo = "";
        window.clearInterval(resendTimer);
        if (startAuthCodeField) startAuthCodeField.hidden = true;
        if (startAuthResend) startAuthResend.hidden = true;
        if (startAuthConsentField) startAuthConsentField.hidden = false;
        if (startAuthEmail) { startAuthEmail.readOnly = false; startAuthEmail.focus(); }
        if (startAuthCode) startAuthCode.value = "";
        if (startAuthSubmit) startAuthSubmit.textContent = "Получить код";
        if (startAuthLead) startAuthLead.textContent = "Введите почту — мы пришлём код. Пароль не нужен. Книга будет доступна с любого компьютера.";
        say("");
      };
      startAuthResendBtn?.addEventListener("click", async () => {
        if (!codeSentTo) return;
        if (await requestCode(codeSentTo)) { say("Новый код отправлен. Прежний больше не действует."); startAuthCode?.focus(); }
      });
      document.getElementById("startAuthChange")?.addEventListener("click", showEmailStep);
      startAuthForm?.addEventListener("submit", async event => {
        event.preventDefault();
        const email = startAuthEmail?.value.trim() || "";
        if (!codeSentTo) {
          if (!email) { say("Введите адрес почты."); return; }
          if (!startAuthConsent?.checked) { say("Отметьте согласие на обработку данных."); return; }
          if (!await requestCode(email)) return;
          codeSentTo = email;
          if (startAuthCodeField) startAuthCodeField.hidden = false;
          if (startAuthResend) startAuthResend.hidden = false;
          if (startAuthConsentField) startAuthConsentField.hidden = true;
          if (startAuthEmail) startAuthEmail.readOnly = true;
          if (startAuthSubmit) startAuthSubmit.textContent = "Войти";
          if (startAuthLead) startAuthLead.textContent = `Мы отправили код на ${email}. Письмо приходит за минуту, код действует 10 минут. Если письма нет — загляните в «Спам».`;
          window.setTimeout(() => startAuthCode?.focus(), 40);
          return;
        }
        const code = (startAuthCode?.value || "").replace(/\D/g, "");
        if (code.length !== 6) { say("В коде шесть цифр."); return; }
        say("Проверяем…");
        let result;
        try { result = await authCall("/api/auth/verify", { email: codeSentTo, code }); } catch (_) { result = { ok: false, data: {} }; }
        if (!result.ok) { say(result.data.error || "Не удалось войти."); return; }
        try { localStorage.setItem("ocherki_auth_email", codeSentTo); } catch (_) {}
        say("Готово. Книга сохраняется в вашем аккаунте.");
        window.setTimeout(releaseStartAuth, 420);
      });

      const onboardingState = {
        2: "",
        3: "",
        4: "",
        5: "",
        6: ""
      };

      const bookMeta = {
        title: "",
        subtitle: "",
        author: "",
        year: new Date().getFullYear()
      };

      // Three answers: who the book is about (2), how it will be told (3)
      // and the text/photo balance (4). The book data sits on the steps.
      const field = id => document.getElementById(id);
      const value = id => field(id)?.value.trim() || "";
      const surnameOf = name => { const parts = String(name).trim().split(/\s+/u); return parts.length > 1 ? parts[parts.length - 1] : ""; };
      const familyTitle = name => { const surname = surnameOf(name) || String(name).trim(); return surname ? `Семья ${surname}` : "История нашей семьи"; };

      const syncFinalSummary = () => {
        const type = onboardingState[2], hero = value("heroNameInput");
        const title = field("bookTitleInput"), subtitle = field("bookSubtitleInput"), year = field("bookYearInput");
        if (title && !title.value) title.value = bookMeta.title || (type === "История семьи" ? familyTitle(hero) : hero);
        if (subtitle && !subtitle.value) subtitle.value = bookMeta.subtitle || ({ "Моя жизнь": "Воспоминания", "История человека": "История жизни", "История семьи": "История нашей семьи" }[type] || "");
        if (year && !year.value) year.value = bookMeta.year || new Date().getFullYear();
        validateFinalStep();
      };

      const getProjectConfig = () => {
        const hero = value("heroNameInput");
        return {
          storyType: onboardingState[2],
          workMode: onboardingState[3],
          contentBalance: onboardingState[4],
          design: "editorial",
          heroName: hero,
          heroYears: value("heroYearsInput"),
          title: value("bookTitleInput"),
          subtitle: value("bookSubtitleInput"),
          author: value("bookAuthorInput") || (onboardingState[2] === "Моя жизнь" ? hero : ""),
          year: value("bookYearInput") || String(new Date().getFullYear()),
          setupId: window.OCHERKI_SETUP_ID || ""
        };
      };

      const persistDraft = () => {
        try {
          localStorage.setItem("ocherkiLifeProjectDraft", JSON.stringify(getProjectConfig()));
        } catch (e) {
          console.warn("Не удалось сохранить черновик", e);
        }
      };

      const validateFinalStep = () => {
        const next2 = field("nextBtn2"), label2 = field("selectionLabel2");
        if (next2) next2.disabled = !(onboardingState[2] && value("heroNameInput"));
        if (label2 && onboardingState[2]) label2.textContent = value("heroNameInput") ? `${onboardingState[2]} · ${value("heroNameInput")}` : `${onboardingState[2]} — впишите имя`;
        const heroLabel = field("heroNameLabel");
        if (heroLabel) heroLabel.textContent = onboardingState[2] === "История семьи" ? "Фамилия семьи или главный человек рода" : onboardingState[2] === "Моя жизнь" ? "Ваше имя и фамилия" : "Имя и фамилия героя";
        const btn = field("startConstructorBtn");
        if (btn) btn.disabled = !(onboardingState[2] && onboardingState[3] && onboardingState[4] && value("heroNameInput") && value("bookTitleInput"));
      };

      const restoreDraft = () => {
        try {
          const raw = localStorage.getItem("ocherkiLifeProjectDraft");
          if (!raw) return;
          const saved = JSON.parse(raw);
          onboardingState[2] = saved.storyType || "";
          onboardingState[3] = saved.workMode || "";
          onboardingState[4] = saved.contentBalance || "";
          if (field("heroNameInput")) field("heroNameInput").value = saved.heroName || "";
          if (field("heroYearsInput")) field("heroYearsInput").value = saved.heroYears || "";
          if (field("bookAuthorInput")) field("bookAuthorInput").value = saved.author || "";
          bookMeta.title = saved.title || "";
          bookMeta.subtitle = saved.subtitle || "";
          bookMeta.author = saved.author || "";
          bookMeta.year = saved.year || new Date().getFullYear();
        } catch (e) {
          console.warn("Не удалось восстановить черновик", e);
        }
      };

      restoreDraft();


            // Audio Engine: vinyl + music + effects. One engine survives onboarding -> constructor.
      const musicPlaylistSources = [
        "assets/audio/music.mp3",
        "assets/audio/playlist/blues-2.mp3",
        "assets/audio/playlist/blues-3.mp3",
        "assets/audio/playlist/blues-4.mp3",
        "assets/audio/playlist/jazz-1.mp3",
        "assets/audio/playlist/jazz-2.mp3",
        "assets/audio/playlist/jazz-3.mp3",
        "assets/audio/playlist/ambient-1.mp3",
        "assets/audio/playlist/ambient-2.mp3",
        "assets/audio/playlist/ambient-3.mp3",
        "assets/audio/playlist/ambient-4.mp3"
      ];
      const musicPlaylist = musicPlaylistSources.map(src => new Audio(src));
      let musicTrackIndex = 0;
      const audioTracks = {
        vinyl: new Audio("assets/audio/vinyl.mp3"),
        music: musicPlaylist[0],
        light: new Audio("assets/audio/light.mp3"),
        page: new Audio("assets/audio/page.mp3")
      };
      audioTracks.vinyl.loop = true;

      const AUDIO_TARGET = { music:.72, vinyl:.24 };
      const AUDIO_PREF_KEY = 'ocherki_audio_preferences_v1';
      let savedAudioPrefs={};
      try{ savedAudioPrefs=JSON.parse(localStorage.getItem(AUDIO_PREF_KEY)||'{}')||{}; }catch(_){ savedAudioPrefs={}; }
      const audioLayers = { music:true, vinyl:true, page:savedAudioPrefs.page!==false, light:savedAudioPrefs.light!==false };
      let musicPreference = savedAudioPrefs.music!==false;
      let audioState = 'stopped'; // stopped | playing | paused
      let musicIntroTimer = null;
      let musicTransitionTimer = null;
      let musicIntroStarted = false;
      const fadeTokens = new WeakMap();
      let playPulseTimer = null;
      let allMuted = savedAudioPrefs.muted===true;
      let pendingAutoplay = musicPreference;
      let musicAllowed = false;
      let pendingHiddenTrackAdvance = false;
      let preMuteState = 'stopped';


      const playBtnEl = () => document.getElementById('audioPlayBtn');
      const stopBtnEl = () => document.getElementById('audioStopBtn');
      const constructorFrame = () => document.getElementById('constructorShellFrame');

      const kickPlayPulse = () => {
        const btn = playBtnEl();
        if(!btn) return;
        if(typeof btn._ocherkiSwingKick === 'function') btn._ocherkiSwingKick(1);
      };

      const postAudioStateToShell = () => {
        try {
          constructorFrame()?.contentWindow?.postMessage({
            type:'OCHERKI_AUDIO_STATE',
            state: audioState,
            muted: allMuted,
            layers:{...audioLayers}
          }, '*');
        } catch(_) {}
      };

      const saveAudioPrefs = () => {
        try{ localStorage.setItem(AUDIO_PREF_KEY, JSON.stringify({
          music:!!musicPreference,
          page:audioLayers.page!==false,
          light:audioLayers.light!==false,
          muted:!!allMuted
        })); }catch(_){}
      };

      const updateAudioUi = () => {
        const btn = playBtnEl();
        const stop = stopBtnEl();
        const active = audioState === 'playing';
        btn?.classList.toggle('is-active-audio', active && !allMuted);
        if (btn) {
          btn.title = active ? 'Пауза' : 'Продолжить музыку';
          btn.setAttribute('aria-label', active ? 'Пауза' : 'Продолжить музыку');
          const svg=btn.querySelector('svg');
          if(svg) svg.innerHTML=active
            ? '<path d="M17 13v22M31 13v22"></path>'
            : '<path d="M18 13l18 11-18 11z"></path>';
        }
        stop?.classList.toggle('is-active-audio', audioState === 'stopped' || allMuted);
        postAudioStateToShell();
      };

      const currentMusic = () => musicPlaylist[musicTrackIndex];
      const setMusicTrack = index => {
        musicTrackIndex = (index + musicPlaylist.length) % musicPlaylist.length;
        audioTracks.music = currentMusic();
        return audioTracks.music;
      };
      const pauseAllMusic = () => musicPlaylist.forEach(track => track.pause());
      const resetAllMusic = () => musicPlaylist.forEach(track => { track.pause(); track.currentTime = 0; track.volume = 0; });
      const stopVinyl = (rewind=true) => {
        fadeTokens.set(audioTracks.vinyl,(fadeTokens.get(audioTracks.vinyl)||0)+1);
        audioTracks.vinyl.pause();
        audioTracks.vinyl.volume=0;
        if(rewind)audioTracks.vinyl.currentTime=0;
      };
      const playVinylGap = async () => {
        if(document.hidden||allMuted||!audioLayers.vinyl)return false;
        const vinyl=audioTracks.vinyl;
        vinyl.currentTime=0;
        vinyl.volume=AUDIO_TARGET.vinyl;
        await vinyl.play();
        return true;
      };

      const fadeAudio = (audio, to, ms=900) => new Promise(resolve => {
        const token = (fadeTokens.get(audio) || 0) + 1;
        fadeTokens.set(audio, token);
        const from = Number.isFinite(audio.volume) ? audio.volume : 0;
        const t0 = performance.now();
        const step = now => {
          if (token !== fadeTokens.get(audio)) return resolve();
          const k = Math.min(1, (now - t0) / ms);
          audio.volume = Math.max(0, Math.min(1, from + (to - from) * k));
          if (k < 1) requestAnimationFrame(step); else resolve();
        };
        requestAnimationFrame(step);
      });

      const VINYL_INTRO_MS = 3200;
      const VINYL_BETWEEN_TRACKS_MS = 3000;
      const scheduleNextTrack = event => {
        if (event?.target && event.target !== currentMusic()) return;
        clearTimeout(musicTransitionTimer);musicTransitionTimer=null;
        if (audioState !== 'playing' || allMuted || !audioLayers.music) return;
        if(document.hidden){
          pendingHiddenTrackAdvance=true;
          stopVinyl();
          return;
        }
        playVinylGap().catch(()=>{});
        musicTransitionTimer = setTimeout(async () => {
          musicTransitionTimer=null;
          if(document.hidden){
            pendingHiddenTrackAdvance=true;
            stopVinyl();
            return;
          }
          if (audioState !== 'playing' || allMuted || !audioLayers.music){stopVinyl();return;}
          const next = setMusicTrack(musicTrackIndex + 1);
          next.currentTime = 0;
          next.volume = 0;
          try {
            stopVinyl();
            await next.play();
            await fadeAudio(next, AUDIO_TARGET.music, 1800);
          } catch(e) { console.log('Next music track waiting for interaction', e); }
        }, VINYL_BETWEEN_TRACKS_MS);
      };
      musicPlaylist.forEach(track => track.addEventListener('ended', scheduleNextTrack));

      let switchPending=false;
      const switchMusicTrack = async delta => {
        clearTimeout(musicIntroTimer);musicIntroTimer=null;
        // v125: a second press while the vinyl plays only changes the track; the wait does not start again.
        const keepWaiting=switchPending&&audioState==='playing'&&!allMuted;
        if(!keepWaiting){clearTimeout(musicTransitionTimer);musicTransitionTimer=null;}
        pauseAllMusic();
        const next=setMusicTrack(musicTrackIndex+delta);
        musicPlaylist.forEach(track=>{ if(track!==next){track.currentTime=0;track.volume=0;} });
        next.currentTime=0;
        next.volume=0;
        musicIntroStarted=true;
        // v124: from silence (paused, stopped or a finished song) the chosen track simply starts.
        if(audioState!=='playing'&&!allMuted){ musicPreference=true; saveAudioPrefs(); if(audioState==='stopped') musicIntroStarted=false; updateAudioUi(); startAmbientMusic('manual'); return musicTrackIndex; }
        if(keepWaiting){ updateAudioUi(); return musicTrackIndex; }
        if(audioState==='playing'&&!allMuted){
          try{
            switchPending=true;
            await playVinylGap();
            musicTransitionTimer=setTimeout(async()=>{
              musicTransitionTimer=null;switchPending=false;
              const next=currentMusic();
              if(document.hidden){pendingHiddenTrackAdvance=true;stopVinyl();return;}
              if(audioState!=='playing'||allMuted||!audioLayers.music){stopVinyl();return;}
              try{
                stopVinyl();
                next.currentTime=0;
                await next.play();
                await fadeAudio(next,AUDIO_TARGET.music,900);
              }catch(e){console.log('Track switch waiting for interaction',e);}
            },VINYL_BETWEEN_TRACKS_MS);
          }catch(e){switchPending=false;console.log('Track switch waiting for interaction',e);}
        }
        updateAudioUi();
        return musicTrackIndex;
      };

      const beginMusicAfterVinyl = () => {
        clearTimeout(musicIntroTimer);musicIntroTimer=null;
        musicIntroTimer = setTimeout(async () => {
          musicIntroTimer=null;
          if(document.hidden){stopVinyl();return;}
          if (audioState !== 'playing' || musicIntroStarted || allMuted || !audioLayers.music) return;
          musicIntroStarted = true;
          try {
            const m = currentMusic();
            // The melody must begin only AFTER the crackle intro, from the true
            // beginning of the track. Silent priming is never allowed to advance it.
            m.pause();
            m.currentTime = 0;
            m.volume = 0;
            stopVinyl();
            await m.play();
            await fadeAudio(m, AUDIO_TARGET.music, 2600);
          } catch(e) { console.log('Music waiting for interaction', e); }
        }, VINYL_INTRO_MS);
      };

      const startAmbientMusic = async (source='manual') => {
        if (allMuted || audioState === 'playing') return;
        if (!musicPreference && source!=='manual' && source!=='unmute') return;
        if (source==='manual' || source==='unmute') { musicPreference=true; saveAudioPrefs(); }
        try {
          if (audioState === 'paused') {
            audioState = 'playing';
            if (musicIntroStarted) {
              stopVinyl();
              // paused right after a song ended: go on with the next one, not the same song again
              if(currentMusic().ended){const n=setMusicTrack(musicTrackIndex+1);n.currentTime=0;}
              const m=currentMusic();
              m.volume = 0;
              if(audioLayers.music){ await m.play(); fadeAudio(m, AUDIO_TARGET.music, 1400); }
            } else {
              await playVinylGap();
              beginMusicAfterVinyl();
            }
            pendingAutoplay = false;
            updateAudioUi();
            kickPlayPulse();
            return;
          }

          audioState = 'playing';
          musicIntroStarted = false;
          clearTimeout(musicIntroTimer);musicIntroTimer=null;
          const v = audioTracks.vinyl;
          const m = currentMusic();
          v.currentTime = 0;
          m.currentTime = 0;
          v.volume = 0;
          m.volume = 0;
          if(audioLayers.vinyl)await playVinylGap();
          if(audioLayers.music) beginMusicAfterVinyl();
          pendingAutoplay = false;
          updateAudioUi();
          kickPlayPulse();
        } catch(e){
          audioState = 'paused';
          pendingAutoplay = musicPreference;
          updateAudioUi();
          console.log('Audio waiting for user interaction',e);
        }
      };

      const pauseAmbientMusic = async () => {
        if (audioState !== 'playing') return;
        audioState = 'paused';
        clearTimeout(musicIntroTimer);musicIntroTimer=null;
        clearTimeout(musicTransitionTimer);musicTransitionTimer=null;
        await Promise.all([
          fadeAudio(audioTracks.vinyl,0,950),
          fadeAudio(currentMusic(),0,950)
        ]);
        audioTracks.vinyl.pause();
        pauseAllMusic();
        updateAudioUi();
      };

      const toggleAmbientMusic = () => {
        musicPreference=true;
        saveAudioPrefs();
        if (allMuted) {
          allMuted = false;
          updateAudioUi();
          return startAmbientMusic('unmute');
        }
        // v142: «playing» but silent — the song ended and nothing is on its way (no crackle, no timer):
        // the next song starts right now, on this very press
        if (audioState === 'playing' && currentMusic().paused && !musicTransitionTimer && !musicIntroTimer) {
          stopVinyl();const n=currentMusic().ended||!currentMusic().currentTime?setMusicTrack(musicTrackIndex+(currentMusic().ended?1:0)):currentMusic();
          if(n.ended)n.currentTime=0;n.volume=0;musicIntroStarted=true;
          n.play().then(()=>fadeAudio(n,AUDIO_TARGET.music,900)).catch(e=>console.log('Music waiting for interaction',e));updateAudioUi();return;}
        if (audioState === 'playing') pauseAmbientMusic();
        else startAmbientMusic();
      };

      const stopAmbientMusic = async () => {
        musicPreference=false;
        pendingAutoplay=false;
        saveAudioPrefs();
        if (audioState === 'stopped' && !allMuted) { updateAudioUi(); return; }
        clearTimeout(musicIntroTimer);musicIntroTimer=null;
        clearTimeout(musicTransitionTimer);musicTransitionTimer=null;
        audioState = 'stopped';
        const m=currentMusic(), v=audioTracks.vinyl;
        const m0=m.volume, v0=v.volume;
        const t0=performance.now(), duration=1350;
        await new Promise(resolve=>{
          const step=now=>{
            const k=Math.min(1,(now-t0)/duration);
            const ease=1-Math.pow(1-k,3);
            m.volume=Math.max(0,m0*(1-ease));
            v.volume=Math.max(0,v0*(1-ease));
            if(k<1) requestAnimationFrame(step); else resolve();
          };
          requestAnimationFrame(step);
        });
        resetAllMusic();
        v.pause();v.currentTime=0;
        m.volume=AUDIO_TARGET.music;
        v.volume=AUDIO_TARGET.vinyl;
        musicIntroStarted=false;
        updateAudioUi();
      };

      const playFx = (name, volume=0.6)=>{
        if(allMuted || audioLayers[name]===false) return;
        const src=audioTracks[name];
        if(!src)return;
        try {
          const a=src.cloneNode(true);
          a.volume=Math.max(0,Math.min(1,volume));
          a.play().catch(()=>{});
        } catch(_) {}
      };

      // Clock audio removed in v166. The clock remains a visual object only.

      const setAllMuted = async (nextMuted) => {
        nextMuted = !!nextMuted;
        if (nextMuted === allMuted) return allMuted;
        if (nextMuted) {
          preMuteState = audioState;
          allMuted = true;
          clearTimeout(musicIntroTimer);musicIntroTimer=null;
          clearTimeout(musicTransitionTimer);musicTransitionTimer=null;
          await Promise.all([
            fadeAudio(audioTracks.vinyl,0,550),
            fadeAudio(currentMusic(),0,550),
            Promise.resolve()
          ]);
          audioTracks.vinyl.pause();
          pauseAllMusic();
        } else {
          allMuted = false;
          if (preMuteState === 'playing') {
            audioState = 'paused';
            await startAmbientMusic('unmute');
          }
        }
        saveAudioPrefs();
        updateAudioUi();
        return allMuted;
      };
      const toggleAllSounds = () => setAllMuted(!allMuted);

      document.addEventListener('visibilitychange',()=>{
        if(document.hidden){
          if(musicTransitionTimer){
            clearTimeout(musicTransitionTimer);musicTransitionTimer=null;
            musicTransitionTimer=null;
            pendingHiddenTrackAdvance=true;
          }
          if(musicIntroTimer){
            clearTimeout(musicIntroTimer);musicIntroTimer=null;
            musicIntroTimer=null;
          }
          stopVinyl();
          return;
        }
        if(audioState!=='playing'||allMuted||!audioLayers.music)return;
        if(pendingHiddenTrackAdvance||currentMusic().ended){
          pendingHiddenTrackAdvance=false;
          switchMusicTrack(1);
        }else if(!musicIntroStarted&&!currentMusic().currentTime){
          playVinylGap().then(beginMusicAfterVinyl).catch(()=>{});
        }
      });

      const toggleLayer = async name => {
        if(!['page','light'].includes(name)) return;
        audioLayers[name]=!audioLayers[name];
        saveAudioPrefs();
        updateAudioUi();
      };

      window.OcherkiFX = {
        play(name, volume=0.65){ playFx(name, volume); }
      };
      window.OcherkiAudio = {
        start:startAmbientMusic,
        pause:pauseAmbientMusic,
        toggle:toggleAmbientMusic,
        stop:stopAmbientMusic,
        fx:playFx,
        muteAll: toggleAllSounds,
        state:()=>audioState,
        muted:()=>allMuted,
        layers:()=>({...audioLayers}),
        toggleLayer,
        next:()=>switchMusicTrack(1),
        previous:()=>switchMusicTrack(-1),
        track:()=>musicTrackIndex
      };

      document.getElementById('audioPlayBtn')?.addEventListener('click', toggleAmbientMusic);
      document.getElementById('audioStopBtn')?.addEventListener('click', stopAmbientMusic);

      window.addEventListener('message', e=>{
        const d=e.data||{};
        if(d.type!=='OCHERKI_AUDIO_COMMAND') return;
        if(d.action==='toggle') toggleAmbientMusic();
        else if(d.action==='play') startAmbientMusic();
        else if(d.action==='pause') pauseAmbientMusic();
        else if(d.action==='stop') stopAmbientMusic();
        else if(d.action==='muteAll') toggleAllSounds();
        else if(d.action==='toggleLayer' && d.name) toggleLayer(d.name);
        else if(d.action==='nextTrack') switchMusicTrack(1);
        else if(d.action==='prevTrack') switchMusicTrack(-1);
        else if(d.action==='fx' && d.name) playFx(d.name, d.volume ?? .65);
      });

      const retryAutoplay = () => {
        if (!musicPreference || !musicAllowed || !pendingAutoplay || allMuted || audioState === 'playing') return;
        startAmbientMusic('unlock');
      };

      // Browser autoplay with sound requires a real user gesture. During the
      // greeting we only unlock/prime the media element at zero volume. The
      // audible ambience starts strictly after the greeting finishes or when
      // the user presses «Пропустить».
      let firstAudioGestureDone = false;
      let ambientPrimed = false;
      const primeAmbientSilently = async () => {
        if (ambientPrimed || allMuted || !musicPreference) return;
        ambientPrimed = true;
        try {
          // Unlock the media elements inside the user gesture, but immediately
          // pause and rewind them. Previously they kept running at volume 0, so
          // when the melody became audible it was already several seconds in.
          const v = audioTracks.vinyl;
          const m = currentMusic();
          v.volume = 0;
          m.volume = 0;
          if (audioLayers.vinyl) {
            await v.play();
            v.pause();
            v.currentTime = 0;
          }
          if (audioLayers.music) {
            await m.play();
            m.pause();
            m.currentTime = 0;
          }
        } catch(_) {
          try { audioTracks.vinyl.pause(); audioTracks.vinyl.currentTime=0; } catch(__) {}
          try { resetAllMusic(); } catch(__) {}
          ambientPrimed = false;
        }
      };
      const unlockAudioOnFirstGesture = () => {
        if (firstAudioGestureDone) return;
        firstAudioGestureDone = true;
        musicAllowed = true;
        pendingAutoplay = musicPreference;
        primeAmbientSilently();
        document.removeEventListener('pointerdown', unlockAudioOnFirstGesture, true);
        document.removeEventListener('keydown', unlockAudioOnFirstGesture, true);
      };
      document.addEventListener('pointerdown', unlockAudioOnFirstGesture, {capture:true});
      document.addEventListener('keydown', unlockAudioOnFirstGesture, {capture:true});

      // Свечение и авторизация. Пролог intentionally starts only after the
      // start-screen auth flow has completed; it must never precede it.
      window.setTimeout(() => root.classList.add("is-light-on"), 150);
      window.setTimeout(() => {
        if (!isSkipped) showStartAuth();
      }, 1050);

      window.skipPrologue = () => {
        if (root.classList.contains("is-preauth") || root.classList.contains("is-auth-waiting")) {
          isSkipped = true;
          showStartAuth();
          return;
        }
        isSkipped = true;
        finishWelcome();
      };

      // Плавное переключение между шагами интерфейса
      let currentOnboardingStep = 1;

      let stepTransitionTimer = null;
      window.goToStep = (stepNumber) => {
        if (stepTransitionTimer) window.clearTimeout(stepTransitionTimer);
        currentOnboardingStep = stepNumber;

        const allSteps = [step1, step2, step3, step4, step5, step6, step7];
        const currentVisible = allSteps.find(el => el && el.classList.contains("is-visible"));

        // First only fade the current content. Do not change the page/state behind it yet.
        if (currentVisible) currentVisible.classList.remove("is-visible");

        const revealNext = () => {
          pageBody.classList.add("has-active-steps");
          pageBody.classList.remove("step-at-2", "step-at-3", "step-at-4", "step-at-5", "step-at-6", "step-at-7");
          step1.classList.add("is-hidden");

          if (stepNumber === 1) {
            pageBody.classList.remove("has-active-steps");
            step1.classList.remove("is-hidden");
          } else if (stepNumber === 2) {
            pageBody.classList.add("step-at-2");
            step2.classList.add("is-visible");
            updateProgress(1, "Шаг 1 из 3");
          } else if (stepNumber === 3) {
            pageBody.classList.add("step-at-3");
            step3.classList.add("is-visible");
            updateProgress(2, "Шаг 2 из 3");
          } else if (stepNumber === 4) {
            pageBody.classList.add("step-at-4");
            step4.classList.add("is-visible");
            updateProgress(3, "Шаг 3 из 3");
            syncFinalSummary();
          } else if (stepNumber === 5) {
            pageBody.classList.add("step-at-5");
            step5.classList.add("is-visible");
            updateProgress(4, "Шаг 4 из 6");
          } else if (stepNumber === 6) {
            pageBody.classList.add("step-at-6");
            step6.classList.add("is-visible");
            updateProgress(5, "Шаг 5 из 6");
          } else if (stepNumber === 7) {
            pageBody.classList.add("step-at-7");
            step7.classList.add("is-visible");
            updateProgress(6, "Шаг 6 из 6");
            syncFinalSummary();
          }
        };

        // First transition from the home card may reveal immediately.
        const delay = currentVisible ? 740 : 120;
        stepTransitionTimer = window.setTimeout(revealNext, delay);
      };

      const topNextBtn = document.getElementById('topNextBtn');
      const topBackBtn = document.getElementById('topBackBtn');

      topNextBtn?.addEventListener('click', () => {
        switchMusicTrack(1);
      });

      topBackBtn?.addEventListener('click', () => {
        switchMusicTrack(-1);
      });

      createButton.addEventListener("click", () => { window.__ocherkiCreatingBook = true; goToStep(2); });

      // «Мои книги»: the same shelf as in the constructor (app/shelf). Opening a book goes straight to the power screen,
      // without the first steps; «+ новая книга» starts a new book from the first steps.
      window.OCHERKI_SHELF_HOOKS = {
        onOpen: id => {
          try { localStorage.setItem("ocherkiActiveBook", id); } catch (_) {}
          const entry = document.getElementById("constructorEntry");
          window.OCHERKI_PRELOAD_SHELL?.();
          root.classList.add("is-leaving-for-entry");
          window.setTimeout(() => { entry?.classList.add("is-visible"); entry?.setAttribute("aria-hidden", "false"); }, 360);
          window.setTimeout(() => { root.style.visibility = "hidden"; }, 1650);
        },
        onNew: () => {
          try { localStorage.removeItem("ocherkiLifeProjectDraft"); } catch (_) {}
          window.__ocherkiCreatingBook = true;
          goToStep(2);
        } };
      document.getElementById("lbOpenProjects")?.addEventListener("click", () => window.OcherkiBookcase?.open());

      // Выбор карточек
      window.selectCard = (stepNum, title, cardElement) => {
        const grid = document.getElementById(`cardsGrid${stepNum}`);
        const label = document.getElementById(`selectionLabel${stepNum}`);
        const nextBtn = document.getElementById(`nextBtn${stepNum}`);

        grid.querySelectorAll(".format-card").forEach(c => c.classList.remove("is-selected"));
        cardElement.classList.add("is-selected");
        grid.classList.add("has-selection");

        const stepContainer = document.getElementById(`step${stepNum}Content`);
        if (stepContainer) stepContainer.classList.add("has-choice");

        label.textContent = title;
        if (nextBtn) nextBtn.disabled = false;
        onboardingState[stepNum] = title;
        persistDraft();
        validateFinalStep();
      };

      // Обновление сайдбара прогресса
      function updateProgress(activeIndex, counterText) {
        document.getElementById("progCounter").textContent = counterText;
        for (let i = 1; i <= 6; i++) {
          const el = document.getElementById(`progStep${i}`);
          if (el) {
            el.className = "lb-progress__step";
            if (i < activeIndex) el.classList.add("is-complete");
            else if (i === activeIndex) el.classList.add("is-active");
          }
        }
      }


      ["heroNameInput", "heroYearsInput", "bookTitleInput", "bookSubtitleInput", "bookAuthorInput", "bookYearInput"].forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        input.addEventListener("input", () => {
          validateFinalStep();
          const note = document.getElementById("finalSaveNote");
          if (note) note.textContent = "";
        });
        input.addEventListener("change", persistDraft);
        input.addEventListener("blur", persistDraft);
      });

      const startConstructorBtn = document.getElementById("startConstructorBtn");
      if (startConstructorBtn) {
        startConstructorBtn.addEventListener("click", () => {
          // A new setup id lets the constructor apply these answers once
          // (chapters, title page, the tree's main person) to a fresh book.
          window.OCHERKI_SETUP_ID = String(Date.now());
          // «Создать книгу» makes a new, empty book; the previous one stays on
          // the shelf in «Мои проекты».
          if (window.__ocherkiCreatingBook) {
            try { localStorage.setItem("ocherkiActiveBook", "book-" + Date.now().toString(36)); } catch (_) {}
            window.__ocherkiCreatingBook = false;
          }
          const config = getProjectConfig();
          persistDraft();
          window.OCHERKI_PROJECT_CONFIG = config;
          window.dispatchEvent(new CustomEvent("ocherki:project-ready", { detail: config }));

          const entry = document.getElementById("constructorEntry");
          window.OCHERKI_PRELOAD_SHELL?.();
          root.classList.add("is-leaving-for-entry");
          window.setTimeout(() => {
            entry?.classList.add("is-visible");
            entry?.setAttribute("aria-hidden", "false");
          }, 360);
          window.setTimeout(() => { root.style.visibility = "hidden"; }, 1650);
        });
      }

      // При новом открытии шага карточки визуально начинаются равноправно.
      // Сохранённые значения остаются в данных проекта, но не подсвечивают карточки автоматически.
      for (let i = 2; i <= 6; i++) {
        const grid = document.getElementById(`cardsGrid${i}`);
        const label = document.getElementById(`selectionLabel${i}`);
        const nextBtn = document.getElementById(`nextBtn${i}`);
        const stepContainer = document.getElementById(`step${i}Content`);

        if (grid) {
          grid.classList.remove("has-selection");
          grid.querySelectorAll(".format-card").forEach(card => card.classList.remove("is-selected"));
        }
        if (stepContainer) stepContainer.classList.remove("has-choice");
        if (label) label.textContent = "Не выбрано";
        if (nextBtn) nextBtn.disabled = true;
      }

      syncFinalSummary();

      // Экран включения перед входом в конструктор.
      const constructorEntry = document.getElementById("constructorEntry");
      const constructorPower = document.getElementById("constructorPower");
      let constructorStarted = false;
      // v120: no power screen — once the book is ready the constructor opens by itself.
      const autoEnter = true;
      if (autoEnter && constructorEntry && constructorPower) {
        new MutationObserver(() => {
          if (!constructorStarted && constructorEntry.classList.contains("is-visible")) { constructorEntry.classList.add("is-auto"); constructorPower.click(); }
        }).observe(constructorEntry, { attributes:true, attributeFilter:["class"] });
      }
      // The constructor loads in the background while the power screen is
      // shown, so pressing the key lights it up at once instead of waiting
      // for the page to load.
      let shellLoaded = false;
      window.OCHERKI_PRELOAD_SHELL = () => {
        const frame = document.getElementById("constructorShellFrame");
        if (!frame || frame.dataset.preloaded) return;
        frame.dataset.preloaded = "1";
        frame.addEventListener("load", () => { shellLoaded = true; }, { once:true });
        frame.src = "shell.html?embedded=1&v=demo-book-20261107-v185";
      };
      if (constructorEntry?.classList.contains("is-visible")) window.OCHERKI_PRELOAD_SHELL();

      // The key itself flies to its working place in the top-left corner of
      // the constructor (a copy above the black stage), then hands over.
      const flyPowerKey = () => {
        if (constructorEntry?.classList.contains("is-auto")) return;
        const rect = constructorPower.getBoundingClientRect();
        const ghost = constructorPower.cloneNode(true);
        ghost.removeAttribute("id");
        ghost.setAttribute("aria-hidden", "true");
        Object.assign(ghost.style, { position:"fixed", left:rect.left + "px", top:rect.top + "px", width:rect.width + "px", height:rect.height + "px", margin:"0", zIndex:"9600", pointerEvents:"none",
          transformOrigin:"0 0", transition:"transform .9s cubic-bezier(.22,.8,.26,1), opacity .45s ease .75s" });
        document.body.appendChild(ghost);
        constructorPower.style.visibility = "hidden";
        const size = 46, scale = size / rect.width;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          ghost.style.transform = `translate(${20 - rect.left}px, ${44 - rect.top}px) scale(${scale})`;
          ghost.style.opacity = "0";
        }));
        window.setTimeout(() => ghost.remove(), 1400);
      };

      if (constructorPower) {
        const pressPower = () => constructorPower.classList.add("is-pressed");
        const releasePower = () => constructorPower.classList.remove("is-pressed");
        constructorPower.addEventListener("pointerdown", pressPower);
        constructorPower.addEventListener("pointerup", releasePower);
        constructorPower.addEventListener("pointercancel", releasePower);
        constructorPower.addEventListener("pointerleave", releasePower);

        constructorPower.addEventListener("click", () => {
          if (constructorStarted) return;
          constructorStarted = true;
          constructorPower.disabled = true;
          constructorPower.style.pointerEvents = "none";

          const stage = document.getElementById("constructorShellStage");
          const frame = document.getElementById("constructorShellFrame");
          const config = window.OCHERKI_PROJECT_CONFIG || getProjectConfig();

          if (!constructorEntry?.classList.contains("is-auto")) playFx('light', .58);
          constructorEntry?.classList.add("is-on");
          flyPowerKey();
          // The start steps never show through while the constructor lights up.
          root.style.visibility = "hidden";
          const stageNow = document.getElementById("constructorShellStage");
          if (stageNow) { stageNow.style.transition = "none"; }

          // Black stage first. The real constructor is loaded only now, so its
          // native light → icons → menus → paper → keyboard boot is visible.
          stage?.classList.add("is-visible");
          stage?.setAttribute("aria-hidden", "false");
          stage?.classList.remove("is-shell-ready");

          const revealShell = () => {
            try {
              frame?.contentWindow?.postMessage({
                type:"OCHERKI_PROJECT_CONFIG",
                title:(config.title || config.bookTitle || "Очерки жизни"),
                subtitle:(config.subtitle || "История нашей семьи"),
                author:(config.author || ""),
                year:(config.year || new Date().getFullYear()),
                design:(config.design || config.style || "archive"),
                contentBalance:(config.contentBalance || ""),
                storyType:(config.storyType || ""),
                workMode:(config.workMode || ""),
                heroName:(config.heroName || ""),
                heroYears:(config.heroYears || ""),
                pageCount:config.pageCount || 24
              }, "*");
              frame?.contentWindow?.postMessage({
                type:'OCHERKI_AUDIO_STATE', state:audioState,
                muted:allMuted,
                layers:{...audioLayers}
              }, '*');
            } catch(_) {}
            stage?.classList.add("is-shell-ready");
            // Clock exists only inside the constructor. Start the proven v153
            // one-second tick engine here, after shell.html has loaded, never on
            // the onboarding/start screens.
            window.setTimeout(()=>{
              try{ frame?.contentWindow?.postMessage({type:'OCHERKI_BOOT_START',handoff:true}, '*'); }catch(_){}
            }, 20);
            window.setTimeout(() => constructorEntry?.classList.add("is-handoff"), 180);
            window.setTimeout(() => {
              if (constructorEntry) {
                constructorEntry.style.visibility = "hidden";
                constructorEntry.setAttribute("aria-hidden", "true");
              }
            }, 1250);
          };

          if (frame) {
            if (shellLoaded) revealShell();
            else {
              frame.addEventListener("load", revealShell, { once:true });
              window.OCHERKI_PRELOAD_SHELL();
            }
          }
        });
      }

      // Родная физика маятника из исходных шагов.
      // Качается сама карточка; wrapper отвечает только за появление.
      const enableOriginalSwing = (element) => {
        let isHovered = false;
        let currentRotation = 0;
        let swingVelocity = 0;
        let rafSwingId = null;
        let lastMouseX = 0;
        let lastPushTime = 0;
        let isMouseOverElement = false;

        const isHangingIcon = element.classList.contains('lb-hanging-item');

        const GRAVITY = 0.03;
        const DAMPING = 0.995;
        const MAX_ANGLE = isHangingIcon ? 2.15 : 1.5;
        const PUSH_FORCE = isHangingIcon ? 0.50 : 0.40;
        const VELOCITY_CAP = isHangingIcon ? 1.35 : 1.20;
        const PUSH_COOLDOWN = 120;

        const updateSwing = () => {
          const acceleration = -GRAVITY * currentRotation;
          swingVelocity += acceleration;
          swingVelocity *= DAMPING;
          currentRotation += swingVelocity;

          if (currentRotation > MAX_ANGLE) {
            currentRotation = MAX_ANGLE;
            swingVelocity *= -0.1;
          }
          if (currentRotation < -MAX_ANGLE) {
            currentRotation = -MAX_ANGLE;
            swingVelocity *= -0.1;
          }

          element.style.transform =
            'rotate(' + currentRotation.toFixed(2) + 'deg)';

          const stopped =
            !isHovered &&
            Math.abs(currentRotation) < 0.01 &&
            Math.abs(swingVelocity) < 0.002;

          if (stopped) {
            currentRotation = 0;
            swingVelocity = 0;
            element.style.transform = 'rotate(0deg)';
            rafSwingId = null;
            return;
          }

          rafSwingId = window.requestAnimationFrame(updateSwing);
        };

        const pushSwing = (mouseX) => {
          const now = Date.now();
          if (now - lastPushTime < PUSH_COOLDOWN) return;
          lastPushTime = now;

          let direction = 1;
          if (lastMouseX !== 0) {
            direction = mouseX > lastMouseX ? 1 : -1;
          }
          lastMouseX = mouseX;

          swingVelocity =
            swingVelocity * 0.3 +
            PUSH_FORCE * direction * 0.7;

          swingVelocity = Math.max(
            -VELOCITY_CAP,
            Math.min(VELOCITY_CAP, swingVelocity)
          );

          if (!rafSwingId) {
            rafSwingId = window.requestAnimationFrame(updateSwing);
          }
        };

        element._ocherkiSwingKick = (direction=1) => {
          swingVelocity = swingVelocity * 0.25 + Math.max(-VELOCITY_CAP, Math.min(VELOCITY_CAP, PUSH_FORCE * direction * .72));
          if (!rafSwingId) rafSwingId = window.requestAnimationFrame(updateSwing);
        };

        document.addEventListener('mousemove', (event) => {
          const rect = element.getBoundingClientRect();
          const overElement =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;

          if (overElement && !isMouseOverElement) {
            isMouseOverElement = true;
            isHovered = true;
            lastMouseX = 0;
            pushSwing(event.clientX);
            return;
          }

          if (overElement && isMouseOverElement) {
            if (Math.abs(event.clientX - lastMouseX) > 20) {
              pushSwing(event.clientX);
            }
            lastMouseX = event.clientX;
            return;
          }

          if (!overElement && isMouseOverElement) {
            isMouseOverElement = false;
            isHovered = false;
            lastMouseX = 0;
            if (!rafSwingId) {
              rafSwingId = window.requestAnimationFrame(updateSwing);
            }
          }
        });

        element.addEventListener('pointerenter', (event) => {
          isHovered = true;
          pushSwing(event.clientX);
        });

        element.addEventListener('pointerleave', () => {
          isHovered = false;
        });
      };

      // Верхние Play / Stop / Далее / Назад:
      // та же физика, что у верхних иконок Shell 9.7.
      function enableShellTopSwing(el){
        if(!el)return;
        let angle = 0;
        let velocity = 0;
        let raf = null;
        let lastX = null;
        let lastPush = 0;
        let hovering = false;

        const gravity = .010;
        const damping = .991;
        const maxAngle = 1.20;
        const pushForce = .14;
        const clickImpulse = .028;
        const cooldown = 90;

        const apply = () => {
          el.style.transform = `rotate(${angle.toFixed(2)}deg)`;
        };

        const animate = () => {
          velocity += -gravity * angle;
          velocity *= damping;
          angle += velocity;

          if(angle > maxAngle){
            angle = maxAngle;
            velocity *= -.12;
          }else if(angle < -maxAngle){
            angle = -maxAngle;
            velocity *= -.12;
          }

          apply();

          if(!hovering && Math.abs(angle) < .006 && Math.abs(velocity) < .0012){
            angle = 0;
            velocity = 0;
            apply();
            raf = null;
            return;
          }
          raf = requestAnimationFrame(animate);
        };

        const kick = (direction, strength = pushForce) => {
          velocity += direction * strength;
          velocity = Math.max(-.38, Math.min(.38, velocity));
          if(!raf) raf = requestAnimationFrame(animate);
        };

        el.addEventListener('pointerenter', (e) => {
          hovering = true;
          lastX = e.clientX;
          /* A pointer entering the player should wake it gently. The old
             .55 impulse drove the small key straight to its angle limit. */
          kick(.08);
        });

        el.addEventListener('pointermove', (e) => {
          const now = performance.now();
          if(lastX == null){
            lastX = e.clientX;
            return;
          }
          const dx = e.clientX - lastX;
          if(Math.abs(dx) > 5 && now - lastPush > cooldown){
            lastPush = now;
            kick(dx > 0 ? 1 : -1);
            lastX = e.clientX;
          }
        });

        el.addEventListener('pointerleave', () => {
          hovering = false;
          lastX = null;
          if(!raf) raf = requestAnimationFrame(animate);
        });

        el.addEventListener('pointerdown', (e) => {
          const rect = el.getBoundingClientRect();
          kick(e.clientX >= rect.left + rect.width/2 ? 1 : -1, clickImpulse);
        });
      }

      // The entry key is a round hanging control too, but its translation is
      // needed to keep the icon centred under the wire. Keep the same spring
      // constants as the other hanging controls and only add the rotation.
      function enableStartAuthSwing(el){
        if(!el)return;
        let angle=0,velocity=0,raf=null,lastX=null,lastPush=0,hovering=false;
        const gravity=.010,damping=.991,maxAngle=.22,pushForce=.025,cooldown=90;
        const apply=()=>{el.style.transform=`translate(-50%,-50%) rotate(${angle.toFixed(2)}deg)`};
        const animate=()=>{
          velocity+=-gravity*angle;
          velocity*=damping;
          angle+=velocity;
          if(angle>maxAngle){angle=maxAngle;velocity*=-.12}
          else if(angle< -maxAngle){angle=-maxAngle;velocity*=-.12}
          apply();
          if(!hovering&&Math.abs(angle)<.006&&Math.abs(velocity)<.0012){angle=0;velocity=0;apply();raf=null;return}
          raf=requestAnimationFrame(animate);
        };
        const kick=(direction,strength=pushForce)=>{
          velocity=Math.max(-.38,Math.min(.38,velocity+direction*strength));
          if(!raf)raf=requestAnimationFrame(animate);
        };
        el.addEventListener('pointerenter',e=>{hovering=true;lastX=e.clientX;kick(.014)});
        el.addEventListener('pointermove',e=>{
          const now=performance.now();
          if(lastX==null){lastX=e.clientX;return}
          const dx=e.clientX-lastX;
          if(Math.abs(dx)>24&&now-lastPush>cooldown){lastPush=now;lastX=e.clientX;kick(dx>0?1:-1)}
        });
        el.addEventListener('pointerleave',()=>{hovering=false;lastX=null;if(!raf)raf=requestAnimationFrame(animate)});
        el.addEventListener('pointerdown',e=>{const r=el.getBoundingClientRect();kick(e.clientX>=r.left+r.width/2?1:-1,.006)});
      }

      document.querySelectorAll('.lb-hanging-item').forEach(enableShellTopSwing);
      document.querySelectorAll('#step2Content .format-card, #step3Content .format-card, #step4Content .format-card, #step5Content .format-card, #step6Content .format-card').forEach(enableShellTopSwing);
      enableStartAuthSwing(startAuthKey?.querySelector('.start-auth-key__pendulum'));

      // Стартовые карточки «Создать книгу» / «Мои проекты» —
      // тот же физический маятник, что и у карточек следующих шагов.
      enableOriginalSwing(createButton);
      const openProjectsButton = document.getElementById('lbOpenProjects');
      if (openProjectsButton) enableOriginalSwing(openProjectsButton);
    })();
  