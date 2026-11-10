/* Altezza — prédio interativo (escolha do andar) e linha do tempo "do croqui à chave". */
(function () {
  'use strict';
  const { ICON, brl, num, reduce } = window.AZ;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ======================================================================
     Planta isométrica: cada ambiente vira um bloco baixo, como numa maquete cortada.
     ====================================================================== */
  const TONES = ['#d9cbb2', '#c9b896', '#bfae8f', '#d3c3a4', '#cdbb98', '#c4b08a'];
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v * f));
    return `rgb(${c.join(',')})`;
  }

  function isoPlan(rooms, label) {
    const H = 2.6, G = .5;
    const pt = (x, y, z) => [(x - y) * .866, (x + y) * .5 - z];
    const fmt = a => a.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    rooms.forEach(r => {
      [[r.x, r.y, H], [r.x + r.w, r.y, H], [r.x, r.y + r.h, 0], [r.x + r.w, r.y + r.h, 0], [r.x, r.y + r.h, H], [r.x + r.w, r.y, 0]].forEach(([x, y, z]) => {
        const [px, py] = pt(x, y, z);
        minX = Math.min(minX, px); maxX = Math.max(maxX, px);
        minY = Math.min(minY, py); maxY = Math.max(maxY, py);
      });
    });
    const m = 4;
    const vb = `${(minX - m).toFixed(1)} ${(minY - m).toFixed(1)} ${(maxX - minX + m * 2).toFixed(1)} ${(maxY - minY + m * 2).toFixed(1)}`;
    const order = rooms.map((r, i) => ({ r, i })).sort((a, b) => (a.r.x + a.r.w / 2 + a.r.y + a.r.h / 2) - (b.r.x + b.r.w / 2 + b.r.y + b.r.h / 2));
    const body = order.map(({ r, i }) => {
      const x = r.x + G, y = r.y + G, w = r.w - G * 2, h = r.h - G * 2;
      const base = TONES[i % TONES.length];
      const top = fmt([pt(x, y, H), pt(x + w, y, H), pt(x + w, y + h, H), pt(x, y + h, H)]);
      const front = fmt([pt(x, y + h, H), pt(x + w, y + h, H), pt(x + w, y + h, 0), pt(x, y + h, 0)]);
      const side = fmt([pt(x + w, y, H), pt(x + w, y + h, H), pt(x + w, y + h, 0), pt(x + w, y, 0)]);
      const [cx, cy] = pt(x + w / 2, y + h / 2, H);
      const words = r.nome.split(' ');
      const lines = r.nome.length > 11 && words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [r.nome];
      const text = lines.map((l, k) => `<tspan x="${cx.toFixed(2)}" y="${(cy + (k - (lines.length - 1) / 2) * 2.5 + .8).toFixed(2)}">${l}</tspan>`).join('');
      return `<g class="iso__room" data-room="${r.id}" style="--tone:${base}">
        <polygon class="iso__side" points="${front}" fill="${shade(base, .72)}"/>
        <polygon class="iso__side" points="${side}" fill="${shade(base, .56)}"/>
        <polygon class="iso__top" points="${top}" fill="${base}"/>
        <text>${text}</text>
      </g>`;
    }).join('');
    return `<svg class="iso" viewBox="${vb}" role="img" aria-label="${label}">${body}</svg>`;
  }

  /* ======================================================================
     Dados de cada unidade do prédio (valores fictícios, como no resto do site)
     ====================================================================== */
  function unit(P, n) {
    const B = P.predio;
    if (n === B.andares) {
      return { n, cob: true, status: 'Disponível', tipo: `Cobertura · ${P.suites} suítes`, area: P.area, suites: P.suites, vagas: P.vagas, preco: P.preco, rooms: P.plan.rooms };
    }
    const r = (n * 37 + 11) % 10;
    const status = r < 4 ? 'Vendida' : r < 7 ? 'Disponível' : 'Sob consulta';
    const preco = Math.round(B.tipo.area * (41000 + n * 700) / 50000) * 50000;
    return { n, cob: false, status, tipo: `Tipo · ${B.tipo.suites} suítes`, area: B.tipo.area, suites: B.tipo.suites, vagas: B.tipo.vagas, preco, rooms: B.tipo.rooms };
  }
  const statusKey = s => (s === 'Disponível' ? 'ok' : s === 'Vendida' ? 'sold' : 'ask');
  const ordinal = n => `${n}º`;

  /* ======================================================================
     Marcação: prédio
     ====================================================================== */
  function prediosMarkup(P) {
    const B = P.predio, g = B.geo, img = B.imagem;
    const floors = B.andares - 1;                       // andares-tipo abaixo da cobertura
    const fh = (g.y1 - g.y0) / floors;
    const pc = v => (v * 100).toFixed(3) + '%';
    const bands = [`<button type="button" class="pd__band" data-n="${B.andares}" style="top:${pc(g.topo)};height:${pc(g.y0 - g.topo)}" aria-label="Andar ${B.andares}, cobertura"></button>`];
    for (let n = floors; n >= 1; n--) {
      const top = g.y0 + (floors - n) * fh;
      bands.push(`<button type="button" class="pd__band" data-n="${n}" style="top:${pc(top)};height:${pc(fh)}" aria-label="Andar ${n}"></button>`);
    }
    return `
    <section class="p-sec pd on-night" id="predio" aria-labelledby="pd-title" data-nav-dark>
      <div class="wrap">
        <header class="sec-head sec-head--split">
          <div>
            <p class="eyebrow" data-reveal>Escolha o andar</p>
            <h2 class="h2" id="pd-title" data-split style="margin-top:22px">Escolha o andar.<br><em>Entre</em> nele.</h2>
          </div>
          <p class="lead" data-reveal><span class="pd__hint-hover">Passe o mouse sobre a torre para ver cada pavimento.</span><span class="pd__hint-touch">Toque na torre para escolher um pavimento.</span> Ao selecionar, a planta abre ao lado e você pode entrar no apartamento.</p>
        </header>
        <div class="pd__grid">
          <div class="pd__stage">
            <div class="pd__scene" style="--ratio:${img.w} / ${img.h};--x0:${pc(g.x0)};--x1:${pc(g.x1)}">
              <img src="${img.src}" srcset="${img.srcM} 800w, ${img.src} ${img.w}w" sizes="(min-width:900px) 60vw, 100vw" alt="${img.alt}" width="${img.w}" height="${img.h}" loading="lazy" decoding="async">
              <div class="pd__tower" role="group" aria-label="Andares da torre">${bands.join('')}</div>
              <div class="pd__tip" role="status" aria-live="polite" hidden></div>
            </div>
          </div>
          <aside class="pd__panel" aria-live="polite"></aside>
        </div>
      </div>
    </section>`;
  }

  function panelHTML(P, u) {
    const key = statusKey(u.status);
    const sold = key === 'sold';
    return `
      <header class="pd__head">
        <div><small>${u.cob ? 'Cobertura' : 'Pavimento'}</small><strong>${ordinal(u.n)} andar</strong></div>
        <span class="pd__status pd__status--${key}">${u.status}</span>
      </header>
      <div class="pd__iso" data-iso>${isoPlan(u.rooms, `Planta isométrica do ${ordinal(u.n)} andar`)}</div>
      <dl class="pd__facts">
        <div><dt>Tipo</dt><dd>${u.tipo}</dd></div>
        <div><dt>Área</dt><dd>${num(u.area)} m²</dd></div>
        <div><dt>Vagas</dt><dd>${u.vagas}</dd></div>
        <div><dt>${sold ? 'Situação' : 'Valor'}</dt><dd>${sold ? 'Unidade vendida' : brl(u.preco)}</dd></div>
      </dl>
      <ul class="pd__rooms">
        ${u.rooms.filter(r => r.area).map(r => `<li data-room="${r.id}"><span>${r.nome}</span><em>${num(r.area)} m²</em></li>`).join('')}
      </ul>
      <div class="pd__cta">
        <button type="button" class="pd__btn pd__btn--main" data-act="enter">${u.cob ? 'Entrar na cobertura' : 'Entrar no decorado'}<i>${ICON.arrow}</i></button>
        ${sold ? '' : `<a class="pd__btn" href="#visita">Agendar visita</a>`}
      </div>`;
  }

  /* ======================================================================
     Marcação: do croqui à chave
     ====================================================================== */
  function stagesOf(P) {
    const A = P.arquiteturaTexto;
    const sketchScene = P.scenes.find(s => s.sketch);
    const sketch = A.croqui || sketchScene?.sketch;
    const arq = A.foto || A.imagem;
    const stages = [];
    if (sketch) stages.push({ key: 'croqui', rail: 'Croqui', kicker: 'Etapa 01 · Croqui', img: sketch, text: `O ${P.arquitetura} começa à mão: traços de grafite que definem onde entra a luz, onde fica a vista e como o espaço respira.` });
    stages.push({ key: 'planta', rail: 'Planta', kicker: 'Etapa 02 · Planta', rooms: P.plan.rooms, text: `O desenho vira distribuição: ${P.plan.rooms.length} ambientes e ${num(P.area)} m² pensados para circular com folga.` });
    if (arq) stages.push({ key: 'projeto', rail: 'Projeto', kicker: `Etapa 0${stages.length + 1} · ${A.legenda ? A.legenda.split(' · ')[0] : 'Arquitetura'}`, img: arq, text: A.titulo });
    stages.push({ key: 'chave', rail: 'Chave', kicker: `Etapa 0${stages.length + 1} · Entrega ${P.entrega}`, img: P.cover, text: P.tagline });
    const titles = ['…à planta…', '…ao projeto…'];
    stages.forEach((s, i) => {
      if (i === stages.length - 1) s.title = '…à chave.';
      else if (i === 0) s.title = s.key === 'croqui' ? 'Do croqui…' : 'Da planta…';
      else s.title = s.key === 'planta' ? titles[0] : titles[1];
    });
    return stages;
  }

  function obraMarkup(P) {
    const stages = stagesOf(P);
    const layers = stages.map((s, i) => s.img
      ? `<figure class="ob__layer" data-i="${i}"><img src="${s.img.src}" srcset="${s.img.srcM} 800w, ${s.img.src} ${s.img.w}w" sizes="100vw" alt="${s.img.alt}" width="${s.img.w}" height="${s.img.h}" loading="lazy" decoding="async"></figure>`
      : `<figure class="ob__layer ob__layer--plan" data-i="${i}">${isoPlan(s.rooms, `Planta isométrica de ${P.nome}`)}</figure>`).join('');
    const texts = stages.map((s, i) => `
      <div class="ob__copy" data-i="${i}">
        <p class="ob__kicker">${s.kicker}</p>
        <h3 class="ob__title">${s.title}</h3>
        <p class="ob__text">${s.text}</p>
      </div>`).join('');
    const rail = stages.map((s, i) => `<li data-i="${i}"><span>${String(i + 1).padStart(2, '0')}</span>${s.rail}</li>`).join('');
    return `
    <section class="ob on-night" id="obra" aria-labelledby="ob-title" data-nav-dark data-stages="${stages.length}">
      <h2 class="sr-only" id="ob-title">Do croqui à chave: etapas de ${P.nome}</h2>
      <div class="ob__sticky">
        <div class="ob__layers">${layers}</div>
        <div class="ob__shade" aria-hidden="true"></div>
        <div class="ob__copies">${texts}</div>
        <ol class="ob__rail" aria-label="Etapas"><b class="ob__fill" aria-hidden="true"></b>${rail}</ol>
      </div>
    </section>`;
  }

  /* ======================================================================
     Interações
     ====================================================================== */
  function initPredio(main, P, goTo) {
    const sec = main.querySelector('#predio');
    if (!sec) return;
    const B = P.predio;
    const panel = sec.querySelector('.pd__panel');
    const tip = sec.querySelector('.pd__tip');
    const scene = sec.querySelector('.pd__scene');
    const bands = [...sec.querySelectorAll('.pd__band')];
    let cur = 0;

    const hiRoom = id => {
      sec.querySelectorAll('.iso__room').forEach(g => g.classList.toggle('is-on', g.dataset.room === id));
      sec.querySelectorAll('.pd__rooms li').forEach(li => li.classList.toggle('is-on', li.dataset.room === id));
    };
    function select(n) {
      cur = n;
      bands.forEach(b => { const on = +b.dataset.n === n; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
      panel.innerHTML = panelHTML(P, unit(P, n));
      panel.classList.remove('is-in'); void panel.offsetWidth; panel.classList.add('is-in');
    }
    function showTip(b) {
      const u = unit(P, +b.dataset.n);
      const top = parseFloat(b.style.top) + parseFloat(b.style.height) / 2;
      tip.innerHTML = `<small>Andar</small><strong>${u.n}º</strong><span>${u.tipo} · ${num(u.area)} m²</span><em class="pd__status pd__status--${statusKey(u.status)}">${u.status}</em>`;
      tip.style.top = top + '%';
      tip.hidden = false;
    }
    bands.forEach(b => {
      b.addEventListener('pointerenter', () => showTip(b));
      b.addEventListener('focus', () => showTip(b));
      b.addEventListener('click', () => select(+b.dataset.n));
    });
    scene.addEventListener('pointerleave', () => { tip.hidden = true; });
    sec.addEventListener('focusout', e => { if (!scene.contains(e.relatedTarget)) tip.hidden = true; });

    panel.addEventListener('pointerover', e => { const li = e.target.closest('[data-room]'); if (li) hiRoom(li.dataset.room); });
    panel.addEventListener('pointerleave', () => hiRoom(null));
    panel.addEventListener('click', e => {
      if (e.target.closest('[data-act="enter"]')) goTo(unit(P, cur).cob ? B.cenaCobertura : B.cenaTipo);
    });
    select(B.andares);
  }

  function initObra(main) {
    const sec = main.querySelector('#obra');
    if (!sec) return;
    const N = +sec.dataset.stages;
    const layers = [...sec.querySelectorAll('.ob__layer')];
    const copies = [...sec.querySelectorAll('.ob__copy')];
    const dots = [...sec.querySelectorAll('.ob__rail li')];
    const fill = sec.querySelector('.ob__fill');
    let raf = 0;

    function paint() {
      raf = 0;
      const r = sec.getBoundingClientRect();
      const travel = Math.max(1, r.height - innerHeight);
      const p = clamp(-r.top / travel, 0, 1);
      const s = p * (N - 1);
      layers.forEach((el, i) => {
        const d = Math.abs(s - i);
        const o = clamp((.65 - d) / .3, 0, 1);
        el.style.opacity = o.toFixed(3);
        el.style.transform = `scale(${(1 + clamp(i - s, -1, 1) * .04).toFixed(4)})`;
      });
      copies.forEach((el, i) => {
        const d = s - i;
        const o = clamp((.55 - Math.abs(d)) / .25, 0, 1);
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translateY(${(d * -36).toFixed(1)}px)`;
        el.style.visibility = o > 0 ? 'visible' : 'hidden';
      });
      const cur = Math.round(s);
      dots.forEach((d, i) => { d.classList.toggle('is-on', i === cur); d.classList.toggle('is-done', i < cur); });
      fill.style.transform = `scaleX(${p.toFixed(4)})`;
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(paint); };

    function setup() {
      sec.classList.toggle('is-static', reduce.matches);
      if (reduce.matches) {
        layers.forEach(el => { el.style.opacity = ''; el.style.transform = ''; });
        copies.forEach(el => { el.style.opacity = ''; el.style.transform = ''; el.style.visibility = ''; });
      } else paint();
    }
    addEventListener('scroll', () => { if (!reduce.matches) queue(); }, { passive: true });
    addEventListener('resize', queue);
    reduce.addEventListener?.('change', setup);
    dots.forEach((d, i) => d.addEventListener('click', () => {
      if (reduce.matches) return;
      const top = sec.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + (sec.offsetHeight - innerHeight) * (i / (N - 1)), behavior: 'smooth' });
    }));
    setup();
  }

  /* ======================================================================
     Tour em vídeo: um vídeo de passeio com capítulos por ambiente
     ====================================================================== */
  const mmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  function videoMarkup(P) {
    const V = P.passeio;
    if (!V) return '';
    const chapters = V.capitulos.map((c, i) => `
      <li><button type="button" class="vd__chap" data-t="${c.t}" data-i="${i}">
        <span class="vd__chap-n">${String(i + 1).padStart(2, '0')}</span>
        <span class="vd__chap-t"><strong>${c.nome}</strong><small>${c.texto || ''}</small></span>
        <span class="vd__chap-time">${mmss(c.t)}</span>
      </button></li>`).join('');
    return `
    <section class="p-sec vd on-night" id="video" aria-labelledby="vd-title" data-nav-dark>
      <div class="wrap">
        <header class="sec-head sec-head--split">
          <div>
            <p class="eyebrow" data-reveal>Tour em vídeo</p>
            <h2 class="h2" id="vd-title" data-split style="margin-top:22px">Entre e <em>caminhe</em><br>pelo imóvel.</h2>
          </div>
          <p class="lead" data-reveal>Um passeio filmado pelos ambientes. Escolha um capítulo para ir direto ao cômodo que mais interessa.</p>
        </header>
        <div class="vd__grid">
          <figure class="vd__player" data-state="paused">
            <video muted loop playsinline preload="metadata" poster="${V.poster}" aria-label="Tour em vídeo de ${P.nome}"></video>
            <button type="button" class="vd__big" aria-label="Reproduzir o tour em vídeo"><i>${ICON.arrow}</i></button>
            <div class="vd__bar">
              <button type="button" class="vd__btn vd__play" aria-label="Pausar ou reproduzir"></button>
              <div class="vd__track"><input class="vd__range" type="range" min="0" max="1000" value="0" aria-label="Posição do vídeo">
                <i class="vd__fill"></i>${V.capitulos.map(c => `<b class="vd__tick" data-t="${c.t}"></b>`).join('')}</div>
              <span class="vd__time">0:00</span>
              <button type="button" class="vd__btn vd__mute" aria-label="Ativar ou desativar o som"></button>
            </div>
          </figure>
          <ol class="vd__chaps">${chapters}</ol>
        </div>
      </div>
    </section>`;
  }

  function initVideo(main, P) {
    const sec = main.querySelector('#video');
    if (!sec) return;
    const V = P.passeio;
    const fig = sec.querySelector('.vd__player');
    const vid = fig.querySelector('video');
    const range = sec.querySelector('.vd__range');
    const fill = sec.querySelector('.vd__fill');
    const time = sec.querySelector('.vd__time');
    const chaps = [...sec.querySelectorAll('.vd__chap')];
    const ticks = [...sec.querySelectorAll('.vd__tick')];
    const mq = window.matchMedia('(max-width: 809.98px)');
    let userPaused = false, dur = 0;

    const pick = () => {
      const portrait = mq.matches && V.portrait;
      const src = portrait ? V.portrait : V.src;
      if (!vid.src.endsWith(src)) {
        const t = vid.currentTime || 0, wasPlaying = !vid.paused;
        vid.src = src;
        vid.poster = portrait && V.posterPortrait ? V.posterPortrait : V.poster;
        vid.addEventListener('loadedmetadata', () => { vid.currentTime = Math.min(t, vid.duration || 0); if (wasPlaying) vid.play().catch(() => {}); }, { once: true });
      }
    };
    pick();
    mq.addEventListener?.('change', pick);

    const paint = () => {
      const d = vid.duration || dur;
      if (!d) return;
      dur = d;
      const f = vid.currentTime / d;
      fill.style.transform = `scaleX(${f.toFixed(4)})`;
      range.value = Math.round(f * 1000);
      time.textContent = `${mmss(vid.currentTime)} / ${mmss(d)}`;
      let cur = 0;
      V.capitulos.forEach((c, i) => { if (vid.currentTime >= c.t - .05) cur = i; });
      chaps.forEach((b, i) => { b.classList.toggle('is-on', i === cur); b.toggleAttribute('aria-current', i === cur); });
      ticks.forEach(t => { t.style.left = (+t.dataset.t / d * 100) + '%'; });
    };
    const setState = () => { fig.dataset.state = vid.paused ? 'paused' : 'playing'; };
    const toggle = () => {
      if (vid.paused) { userPaused = false; vid.play().catch(() => {}); } else { userPaused = true; vid.pause(); }
    };
    vid.addEventListener('timeupdate', paint);
    vid.addEventListener('loadedmetadata', paint);
    vid.addEventListener('play', setState);
    vid.addEventListener('pause', setState);
    fig.querySelector('.vd__big').addEventListener('click', toggle);
    fig.querySelector('.vd__play').addEventListener('click', toggle);
    vid.addEventListener('click', toggle);
    fig.querySelector('.vd__mute').addEventListener('click', e => {
      vid.muted = !vid.muted;
      e.currentTarget.classList.toggle('is-on', !vid.muted);
    });
    range.addEventListener('input', () => { if (vid.duration) vid.currentTime = (range.value / 1000) * vid.duration; });
    chaps.forEach(b => b.addEventListener('click', () => {
      vid.currentTime = +b.dataset.t;
      userPaused = false;
      vid.play().catch(() => {});
      fig.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'center' });
    }));

    // Toca sozinho (sem som) quando está à vista; pausa ao sair. Respeita "reduzir movimento".
    if (!reduce.matches && 'IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        if (en.isIntersecting && en.intersectionRatio > .5) { if (!userPaused) vid.play().catch(() => {}); }
        else vid.pause();
      }, { threshold: [0, .5, 1] }).observe(fig);
    }
    setState();
  }

  window.AZPredio = {
    predio: prediosMarkup,
    obra: obraMarkup,
    video: videoMarkup,
    init(main, P, goTo) { initVideo(main, P); initPredio(main, P, goTo); initObra(main); }
  };
})();
