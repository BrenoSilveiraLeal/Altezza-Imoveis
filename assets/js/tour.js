/* Altezza — tour imersivo no estilo galeria: rolar caminha, arrastar olha em volta,
   pontos de olho aproximam a câmera e abrem o detalhe. */
(function () {
  'use strict';
  const { ICON, brl, brlShort, num, reduce, LOGO } = window.AZ;
  const { PROPERTIES } = window.ALTEZZA;
  const mobileMQ = window.matchMedia('(max-width: 809.98px)');
  const pad = n => String(n).padStart(2, '0');

  const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const MOUSE = '<span class="t-mouse" aria-hidden="true"><i></i></span>';

  /* ======================================================================
     Marcação
     ====================================================================== */
  function markup(P, planSVG) {
    const N = P.scenes.length;
    const roomName = id => (P.plan.rooms.find(r => r.id === id) || {}).nome || '';
    return `
    <section class="tour" id="tour" aria-labelledby="p-title" data-nav-dark data-nav-solid-after>
      <div class="tour__sticky">
        <div class="tour__stage" data-stage>
          ${P.scenes.map((s, i) => `
            <div class="scene" data-i="${i}" aria-hidden="${i ? 'true' : 'false'}">
              <div class="scene__cam">
                ${s.sketch ? `<img class="scene__sketch" src="${s.sketch.srcM}" data-full="${s.sketch.src}" alt="" decoding="async" draggable="false">` : ''}
                <img class="scene__img" src="${i < 2 ? s.img.src : s.img.srcM}" data-full="${s.img.src}" alt="${s.img.alt}" decoding="async" draggable="false">
                ${s.sketch ? '<span class="scene__seam" aria-hidden="true"></span>' : ''}
                ${s.hotspots.map((h, k) => `
                  <div class="hotspot${h.x > .66 ? ' hotspot--left' : ''}" style="left:${h.x * 100}%;top:${h.y * 100}%;--k:${k}">
                    <button class="hotspot__dot" type="button" data-hot="${i}:${k}" aria-label="Explorar: ${h.t}">${EYE}</button>
                    <span class="hotspot__tag" aria-hidden="true">${h.t}</span>
                  </div>`).join('')}
              </div>
              <div class="scene__mag">
                <div class="mag">
                  <p class="mag__kicker"><span>${pad(i + 1)}<small>/${pad(N)}</small></span>${s.kicker}</p>
                  <h2 class="mag__title">${s.nome}</h2>
                  <p class="mag__text">${s.texto}</p>
                  <ul class="mag__tags">${s.itens.map(t => `<li>${t}</li>`).join('')}</ul>
                  <p class="mag__fact"><span>Curiosidade</span>${s.curiosidade}</p>
                  <div class="mag__points">
                    <p>Pontos de interesse</p>
                    <ol>${s.hotspots.map((h, k) => `<li><button type="button" data-hot="${i}:${k}"><i>${EYE}</i>${h.t}</button></li>`).join('')}</ol>
                  </div>
                </div>
              </div>
              <div class="scene__dim"></div>
            </div>`).join('')}
          <div class="tour__wipe" aria-hidden="true"></div>
          <div class="tour__vignette" aria-hidden="true"></div>
        </div>
        <div class="tour__frame" aria-hidden="true"></div>

        <header class="tbar">
          <a class="tbar__logo" href="index.html" aria-label="Altezza, página inicial">${LOGO}<span>Altezza</span></a>
          <p class="tbar__name"><span>${P.nome}</span><small>${P.bairro}, ${P.cidade}</small></p>
          <nav class="tbar__links" aria-label="Tour">
            <a href="#visao">Pular tour</a>
            <a href="#visita">Agendar visita</a>
            <a class="tbar__close" href="imoveis.html" data-transition="Coleção Altezza" aria-label="Fechar e voltar à coleção">${ICON.close}</a>
          </nav>
          <span class="tbar__line"><i data-progress></i></span>
        </header>

        <p class="troom" aria-hidden="true">
          ${P.scenes.map((s, i) => `<span class="troom__item${i ? '' : ' is-on'}" data-i="${i}"><small>${pad(i + 1)} — ${s.kicker}</small><strong>${s.nome}</strong></span>`).join('')}
        </p>

        <div class="tcards" aria-live="polite">
          ${P.scenes.map((s, i) => `
            <article class="tcard${i ? '' : ' is-active'}" data-i="${i}">
              <header class="tcard__head">
                <span class="tcard__n">${pad(i + 1)}<small>/${pad(N)}</small></span>
                <span class="tcard__kicker">${s.kicker}</span>
              </header>
              <h2 class="tcard__title">${s.nome}</h2>
              <p class="tcard__text">${s.texto}</p>
              <div class="tcard__more">
                <ul class="tcard__tags">${s.itens.map(t => `<li>${t}</li>`).join('')}</ul>
                <p class="tcard__fact"><span>Curiosidade</span>${s.curiosidade}</p>
              </div>
              <footer class="tcard__foot">
                <button type="button" class="tcard__toggle" aria-expanded="false">Detalhes <i aria-hidden="true">+</i></button>
                <span class="tcard__bar" aria-hidden="true"><i style="width:${((i + 1) / N) * 100}%"></i></span>
              </footer>
            </article>`).join('')}
        </div>

        <aside class="tinfo" data-info hidden aria-labelledby="tinfo-title">
          <div class="tinfo__media">
            <div class="tinfo__img" data-info-img role="img"></div>
            <span class="tinfo__count" data-info-count></span>
            <button type="button" class="tinfo__x" data-info-close aria-label="Fechar detalhe">${ICON.close}</button>
          </div>
          <div class="tinfo__body">
            <p class="tinfo__room" data-info-room></p>
            <h2 id="tinfo-title" data-info-title></h2>
            <p class="tinfo__text" data-info-text></p>
            <div class="tinfo__nav">
              <button type="button" data-info-step="-1" aria-label="Ponto anterior">${ICON.arrow}</button>
              <button type="button" data-info-step="1" class="is-main">Próximo ponto ${ICON.arrow}</button>
            </div>
          </div>
        </aside>

        <footer class="tfoot">
          <div class="tfoot__left">
            <div class="tpop-wrap">
              <button type="button" class="tfoot__btn" data-pop="rooms" aria-expanded="false">Ambientes <span data-cur-n>01</span></button>
              <div class="tpop" data-pop-panel="rooms" hidden>
                <header class="tpop__head"><strong>Mudar de ambiente</strong><button type="button" data-pop-close aria-label="Fechar">${ICON.close}</button></header>
                <ol class="tpop__list">
                  ${P.scenes.map((s, i) => `<li><button type="button" data-go="${i}"><span>${pad(i + 1)}</span>${s.nome}</button></li>`).join('')}
                </ol>
              </div>
            </div>
            <div class="tpop-wrap">
              <button type="button" class="tfoot__btn" data-pop="plan" aria-expanded="false">Planta</button>
              <div class="tpop tpop--plan" data-pop-panel="plan" hidden>
                <header class="tpop__head"><strong>Você está em <span data-map-room>${roomName(P.scenes[0].room)}</span></strong><button type="button" data-pop-close aria-label="Fechar">${ICON.close}</button></header>
                ${planSVG('mini')}
              </div>
            </div>
            <button type="button" class="tfoot__btn" data-drawer-open>Coleção</button>
          </div>
          <div class="tfoot__right">
            <span class="tfoot__hint">${MOUSE}<span>Role para caminhar · arraste para olhar</span></span>
            <button type="button" class="tfoot__arrow" data-step="-1" aria-label="Ambiente anterior">${ICON.arrow}</button>
            <button type="button" class="tfoot__arrow" data-step="1" aria-label="Próximo ambiente">${ICON.arrow}</button>
          </div>
        </footer>

        <div class="tstart" data-start>
          <div class="tstart__card">
            <header class="tstart__top">
              <p class="tstart__chips"><span class="is-accent">${P.status}</span><span>${P.tipo}</span><span>${P.bairro}, ${P.cidade}</span></p>
              <button type="button" class="tstart__x" data-go="0" aria-label="Fechar e começar o tour">${ICON.close}</button>
            </header>
            <p class="tstart__kicker">Altezza apresenta</p>
            <h1 class="tstart__name" id="p-title">${P.nome}</h1>
            <p class="tstart__tag">${P.tagline}</p>
            <dl class="tstart__facts">
              <div><dt>Área</dt><dd>${num(P.area)}<small> m²</small></dd></div>
              <div><dt>Suítes</dt><dd>${P.suites}</dd></div>
              <div><dt>Vagas</dt><dd>${P.vagas}</dd></div>
              <div><dt>Valor</dt><dd>${brlShort(P.preco).replace('R$ ', '<small>R$ </small>')}</dd></div>
            </dl>
            <div class="tstart__rooms">
              <p><span>Ambientes do tour</span><span>${N}</span></p>
              <ol>
                ${P.scenes.map((s, i) => `<li><button type="button" data-go="${i}" aria-label="Começar por ${s.nome}" title="${s.nome}" style="--bg:url('${new URL(s.img.srcM, location.href).href}');--px:${s.cam.from[0] * 100}%;--py:${s.cam.from[1] * 100}%"><span>${pad(i + 1)}</span></button></li>`).join('')}
              </ol>
            </div>
            <div class="tstart__ctas">
              <button type="button" class="tstart__go" data-go="0"><span>Começar o tour</span><i>${ICON.arrow}</i></button>
              <button class="fav-btn tstart__fav" type="button" data-fav="${P.id}" data-fav-name="${P.nome}" aria-pressed="false">${ICON.heart}</button>
            </div>
            <p class="tstart__hint">${MOUSE}Role ou arraste para começar</p>
          </div>
        </div>

        <div class="ttip" data-tip hidden>
          <span class="ttip__icon">${EYE}</span>
          <p><strong>Toque nos pontos para explorar</strong><span>Arraste a imagem para olhar em volta.</span></p>
          <button type="button" data-tip-close aria-label="Fechar dica">${ICON.close}</button>
        </div>
      </div>
    </section>`;
  }

  /* ======================================================================
     Gaveta com os outros imóveis da coleção
     ====================================================================== */
  function drawer(P) {
    const others = PROPERTIES.filter(p => p.id !== P.id);
    document.body.insertAdjacentHTML('beforeend', `
      <div class="drawer" data-drawer hidden>
        <div class="drawer__backdrop" data-drawer-close></div>
        <aside class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
          <header class="drawer__head"><h2 id="drawer-title">Outros imóveis da coleção</h2><button type="button" data-drawer-close aria-label="Fechar">${ICON.close}</button></header>
          <ul class="drawer__list">
            ${others.map(p => `
              <li><a class="drawer__item" href="imovel.html?id=${p.id}" data-transition="${p.nome}">
                <span class="drawer__img"><img src="${p.card.srcM}" alt="" loading="lazy" decoding="async"></span>
                <span class="drawer__txt"><small>${p.tipo} · ${p.status}</small><strong>${p.nome}</strong><span>${p.bairro}, ${p.cidade}</span><span>${num(p.area)} m² · ${p.suites} suítes · ${brlShort(p.preco)}</span></span>
                <span class="drawer__go">${ICON.arrowUp}</span>
              </a></li>`).join('')}
          </ul>
          <a class="btn drawer__all" href="imoveis.html" data-transition="Coleção Altezza">Ver toda a coleção<span class="btn__arrow">${ICON.arrow}</span></a>
        </aside>
      </div>`);
    const el = document.querySelector('[data-drawer]');
    let lastFocus = null;
    const open = () => {
      lastFocus = document.activeElement;
      el.hidden = false;
      requestAnimationFrame(() => el.classList.add('is-open'));
      el.querySelector('.drawer__panel button').focus();
      document.documentElement.style.overflow = 'hidden';
    };
    const close = () => {
      el.classList.remove('is-open');
      document.documentElement.style.overflow = '';
      setTimeout(() => { el.hidden = true; }, 500);
      if (lastFocus) lastFocus.focus();
    };
    document.addEventListener('click', e => {
      if (e.target.closest('[data-drawer-open]')) open();
      else if (e.target.closest('[data-drawer-close]')) close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !el.hidden) close(); });
  }

  /* ======================================================================
     Comportamento
     ====================================================================== */
  function init(P, tourEl) {
    drawer(P);
    const N = P.scenes.length;
    const roomById = id => P.plan.rooms.find(r => r.id === id);
    const sticky = tourEl.querySelector('.tour__sticky');
    const stage = tourEl.querySelector('[data-stage]');
    const scenes = [...tourEl.querySelectorAll('.scene')].map((el, i) => ({
      el, i, data: P.scenes[i],
      cam: el.querySelector('.scene__cam'),
      img: el.querySelector('.scene__img'),
      sketch: el.querySelector('.scene__sketch'),
      seam: el.querySelector('.scene__seam'),
      dim: el.querySelector('.scene__dim'),
      mag: el.querySelector('.scene__mag'),
      box: { w: 0, h: 0 }, lim: [0, 0, 0, 0]
    }));
    const cards = [...tourEl.querySelectorAll('.tcard')];
    const rooms = [...tourEl.querySelectorAll('.troom__item')];
    const popGo = [...tourEl.querySelectorAll('.tpop__list button')];
    const progress = tourEl.querySelector('[data-progress]');
    const wipe = tourEl.querySelector('.tour__wipe');
    const startEl = tourEl.querySelector('[data-start]');
    const tip = tourEl.querySelector('[data-tip]');
    const info = tourEl.querySelector('[data-info]');
    const curN = tourEl.querySelector('[data-cur-n]');
    const mapRoom = tourEl.querySelector('[data-map-room]');
    const mapRooms = [...tourEl.querySelectorAll('.plan--mini .plan__room')];
    const mapMe = tourEl.querySelectorAll('.plan--mini .plan__me, .plan--mini .plan__me-halo');

    const T = .26;   // fração final de cada cena usada na transição
    const I = .3;    // trecho inicial em que o cartão de abertura sai
    const ZB = 1.04; // zoom de base, que deixa uma pequena margem para olhar em volta
    const ZK = 0;    // rolar não aproxima a câmera, só a desloca pela foto (1 = zoom integral de cada cena)
    let W = 0, H = 0, sceneLen = 0, tourTop = 0;
    let target = 0, cur = 0, raf = 0, last = 0, active = -1;
    let pan = { x: 0, y: 0 }, panT = { x: 0, y: 0 };
    let focus = null, fk = 0, fkT = 0;   // aproximação do ponto de interesse
    let tipDone = false, infoY = 0, infoAt = [0, 0];
    const isStatic = reduce.matches;

    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const sameView = (a, b) => a && b && a.data.img === b.data.img;

    function measure() {
      W = sticky.clientWidth;
      H = sticky.clientHeight;
      scenes.forEach(s => {
        const { w: iw, h: ih } = s.data.img;
        // Foto vertical em tela horizontal: página de revista. O cômodo inteiro fica à direita,
        // na altura total, e o lado esquerdo traz o texto do ambiente num painel liso.
        // Só fotos realmente verticais se dividem; horizontais sempre cobrem a tela.
        s.split = iw < ih && iw / ih < (W / H) * .75;
        s.el.classList.toggle('is-split', s.split);
        const sc = s.split ? H / ih : Math.max(W / iw, H / ih);
        s.box = { w: iw * sc, h: ih * sc };
        s.cam.style.width = s.box.w + 'px';
        s.cam.style.height = s.box.h + 'px';
        if (s.split) s.mag.style.width = (W - s.box.w) + 'px';
      });
      // Quanto se rola para atravessar um ambiente: maior = caminhada mais lenta.
      sceneLen = H * (mobileMQ.matches ? 1.8 : 2.2);
      tourEl.style.height = (sceneLen * (N + I) + H) + 'px';
      tourTop = tourEl.getBoundingClientRect().top + scrollY;
    }

    function camAt(s, t) {
      const [x0, y0, z0] = s.data.cam.from;
      const [x1, y1, z1] = s.data.cam.to;
      const e = easeIO(clamp(t));
      return { x: lerp(x0, x1, e), y: lerp(y0, y1, e), z: 1 + (lerp(z0, z1, e) - 1) * ZK };
    }

    // Posiciona a imagem; numa dimensão em que ela é menor que a tela, fica centralizada.
    const fit = (start, size, view) => size <= view ? [(view - size) / 2, (view - size) / 2] : [view - size, 0];
    function place(s, c, extra = 1, usePan = false) {
      if (s.split) {
        // O cômodo fica inteiro e parado; o movimento acontece no painel de detalhe.
        const left = W - s.box.w;
        s.lim = [0, 0, 0, 0];
        s.cam.style.transform = `translate3d(${left.toFixed(2)}px, 0, 0)`;
        s.cam.style.setProperty('--z', 1);
        return { z: 1, vx0: 0, vx1: 1 };
      }
      const z = c.z * extra * ZB;
      const bw = s.box.w * z, bh = s.box.h * z;
      const l0 = W / 2 - c.x * bw, t0 = H / 2 - c.y * bh;
      const [lx0, lx1] = fit(l0, bw, W), [ty0, ty1] = fit(t0, bh, H);
      // Limites do arraste para a imagem nunca descobrir as bordas.
      s.lim = [lx0 - l0, lx1 - l0, ty0 - t0, ty1 - t0];
      const left = clamp(l0 + (usePan ? pan.x : 0), lx0, lx1);
      const top = clamp(t0 + (usePan ? pan.y : 0), ty0, ty1);
      s.cam.style.transform = `translate3d(${left.toFixed(2)}px, ${top.toFixed(2)}px, 0) scale(${z.toFixed(4)})`;
      s.cam.style.setProperty('--z', z.toFixed(4));
      return { z, vx0: -left / bw, vx1: (W - left) / bw };
    }

    function render(u) {
      const introP = clamp(u / I);
      startEl.style.opacity = (1 - clamp(introP * 1.6)).toFixed(3);
      startEl.style.transform = `translate3d(0, ${(-easeIO(introP) * 40).toFixed(1)}px, 0)`;
      startEl.classList.toggle('is-gone', introP > .55);
      sticky.style.setProperty('--ui', clamp((introP - .4) / .6).toFixed(3));
      sticky.classList.toggle('ui-on', introP > .7);

      const v = Math.max(0, u - I);
      const i = Math.min(N - 1, Math.floor(v));
      const p = v - i;
      const tStart = 1 - T;
      const inTrans = i < N - 1 && p > tStart;
      const q = inTrans ? easeOut((p - tStart) / T) : 0;
      const nextIsSame = sameView(scenes[i], scenes[i + 1]);

      scenes.forEach((s, j) => {
        let show = false;
        if (j === i) {
          show = true;
          let c = camAt(s, p);
          if (focus && focus.scene === j) {
            // Voa até o ponto escolhido, como numa galeria.
            const e = easeIO(fk);
            c = { x: lerp(c.x, focus.x, e), y: lerp(c.y, focus.y, e), z: lerp(c.z, c.z * 1.28, e) };
          }
          const view = place(s, c, 1, true);
          s.el.style.clipPath = 'none';
          s.dim.style.opacity = nextIsSame ? 0 : (q * .55).toFixed(3);
          if (s.sketch) {
            const r = easeIO(clamp((p - .12) / .5));
            const edge = r >= 1 ? 1 : lerp(view.vx0, view.vx1, r);
            const pct = (edge * 100).toFixed(2);
            s.img.style.clipPath = `inset(0 ${(100 - pct).toFixed(2)}% 0 0)`;
            s.seam.style.left = pct + '%';
            s.seam.style.opacity = r > 0 && r < 1 ? 1 : 0;
          }
        } else if (j === i + 1 && inTrans && !nextIsSame) {
          show = true;
          place(s, camAt(s, 0));
          s.el.style.clipPath = `inset(${((1 - q) * 100).toFixed(2)}% 0 0 0)`;
          s.dim.style.opacity = 0;
          if (s.sketch) s.img.style.clipPath = 'inset(0 100% 0 0)';
        }
        s.el.style.visibility = show ? 'visible' : 'hidden';
        s.el.style.zIndex = j;
      });

      wipe.style.opacity = inTrans && !nextIsSame && q < 1 ? 1 : 0;
      wipe.style.transform = `translateY(${(1 - q) * H}px)`;

      const act = inTrans && q > .5 ? i + 1 : i;
      const hotOn = introP > .8 && act === i && (i === N - 1 || p < tStart + .02);
      scenes.forEach((s, j) => s.el.classList.toggle('is-hot', j === act && hotOn));
      if (act !== active) setActive(act);

      progress.style.transform = `scaleX(${clamp(v / N).toFixed(4)})`;
      const ra = roomById(scenes[i].data.room);
      const rb = roomById((scenes[i + 1] || scenes[i]).data.room);
      const mx = lerp(ra.x + ra.w / 2, rb.x + rb.w / 2, q);
      const my = lerp(ra.y + ra.h / 2, rb.y + rb.h / 2, q);
      mapMe.forEach(c => { c.setAttribute('cx', mx.toFixed(2)); c.setAttribute('cy', my.toFixed(2)); });

      // Dica de exploração: aparece uma vez, na primeira parada.
      const showTip = !tipDone && introP >= 1 && act === 0 && p > .08 && p < .6;
      if (tip.hidden === showTip) tip.hidden = !showTip;
    }

    function setActive(a) {
      const prev = active;
      active = a;
      sticky.classList.toggle('split-on', Boolean(scenes[a].split));
      scenes.forEach((s, j) => s.el.classList.toggle('is-cur', j === a));
      cards.forEach((el, j) => { el.classList.toggle('is-active', j === a); el.classList.toggle('is-past', j < a); });
      rooms.forEach((el, j) => el.classList.toggle('is-on', j === a));
      popGo.forEach((b, j) => b.toggleAttribute('aria-current', j === a));
      scenes.forEach((s, j) => s.el.setAttribute('aria-hidden', String(j !== a)));
      curN.textContent = pad(a + 1);
      const room = scenes[a].data.room;
      mapRooms.forEach(g => g.classList.toggle('is-on', g.dataset.room === room));
      mapRoom.textContent = roomById(room).nome;
      if (prev !== -1) { closeInfo(); panT = { x: 0, y: 0 }; if (a > 0) tipDone = true; }
      [a, a + 1, a + 2].forEach(k => {
        const s = scenes[k];
        if (!s) return;
        [s.img, s.sketch].forEach(img => { if (img && img.dataset.full && img.src.indexOf(img.dataset.full) === -1) img.src = img.dataset.full; });
      });
    }

    function readTarget() { target = clamp((scrollY - tourTop) / sceneLen, 0, I + N - .0001); }

    function frame(now) {
      const dt = Math.min(64, now - (last || now));
      last = now;
      const k = 1 - Math.exp(-dt / 150);
      cur += (target - cur) * k;
      if (Math.abs(target - cur) < .0004) cur = target;
      const kp = 1 - Math.exp(-dt / (dragging ? 30 : 160));
      pan.x += (panT.x - pan.x) * kp; pan.y += (panT.y - pan.y) * kp;
      if (Math.abs(panT.x - pan.x) + Math.abs(panT.y - pan.y) < .3) pan = { ...panT };
      const kf = 1 - Math.exp(-dt / 220);
      fk += (fkT - fk) * kf;
      if (Math.abs(fkT - fk) < .002) { fk = fkT; if (!fk) focus = null; }
      render(cur);
      const moving = cur !== target || pan.x !== panT.x || pan.y !== panT.y || fk !== fkT || dragging;
      raf = moving ? requestAnimationFrame(frame) : 0;
      if (!raf) last = 0;
    }
    function kick() {
      readTarget();
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function goTo(i, instant) {
      if (isStatic) { (scenes[i] || scenes[0]).el.scrollIntoView({ block: 'start' }); return; }
      window.scrollTo({ top: tourTop + (I + i + .22) * sceneLen, behavior: instant ? 'auto' : 'smooth' });
    }

    /* ---------- Detalhe do ponto de interesse ---------- */
    function openInfo(si, hi) {
      const s = scenes[si];
      const h = s.data.hotspots[hi];
      focus = { scene: si, x: h.x, y: h.y, k: hi };
      fkT = 1;
      infoY = scrollY;
      tipDone = true;
      info.querySelector('[data-info-title]').textContent = h.t;
      info.querySelector('[data-info-text]').textContent = h.d;
      info.querySelector('[data-info-room]').textContent = s.data.nome;
      info.querySelector('[data-info-count]').textContent = `Ponto ${hi + 1} de ${s.data.hotspots.length}`;
      infoAt = [si, hi];
      const img = info.querySelector('[data-info-img]');
      img.style.backgroundImage = `url("${s.data.img.src}")`;
      img.classList.remove('is-anim'); void img.offsetWidth; img.classList.add('is-anim');
      img.style.backgroundPosition = `${h.x * 100}% ${h.y * 100}%`;
      img.setAttribute('aria-label', `Detalhe: ${h.t}`);
      info.hidden = false;
      requestAnimationFrame(() => info.classList.add('is-open'));
      tourEl.querySelectorAll('.hotspot').forEach(el => el.classList.remove('is-open'));
      s.el.querySelectorAll('.hotspot')[hi].classList.add('is-open');
      sticky.classList.add('has-info');
      kickAnim();
    }
    function closeInfo() {
      if (info.hidden) return;
      fkT = 0;
      info.classList.remove('is-open');
      sticky.classList.remove('has-info');
      tourEl.querySelectorAll('.hotspot.is-open').forEach(el => el.classList.remove('is-open'));
      setTimeout(() => { if (!info.classList.contains('is-open')) info.hidden = true; }, 450);
      kickAnim();
    }
    const kickAnim = () => { if (!raf) raf = requestAnimationFrame(frame); };

    /* ---------- Arrastar para olhar em volta ---------- */
    let dragging = false, dragStart = null, axis = null;
    stage.addEventListener('pointerdown', e => {
      if (isStatic || e.button !== 0 || e.target.closest('button')) return;
      dragStart = { x: e.clientX, y: e.clientY, px: panT.x, py: panT.y, t: e.pointerType };
      axis = null;
    });
    addEventListener('pointermove', e => {
      if (!dragStart) return;
      const dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
      if (!axis) {
        if (Math.abs(dx) + Math.abs(dy) < 6) return;
        // No toque, o gesto vertical continua rolando a página.
        axis = dragStart.t !== 'mouse' && Math.abs(dy) > Math.abs(dx) ? 'scroll' : 'pan';
        if (axis === 'pan') {
          dragging = true; sticky.classList.add('is-dragging');
          if (cur < I * .5) goTo(0);   // "arraste para começar"
        }
      }
      if (axis !== 'pan') return;
      const s = scenes[active];
      panT.x = clamp(dragStart.px + dx * 1.1, s.lim[0], s.lim[1]);
      panT.y = clamp(dragStart.py + dy * 1.1, s.lim[2], s.lim[3]);
      kickAnim();
    });
    const endDrag = () => {
      if (!dragStart) return;
      dragStart = null;
      if (dragging) { dragging = false; sticky.classList.remove('is-dragging'); tipDone = true; kickAnim(); }
    };
    addEventListener('pointerup', endDrag);
    addEventListener('pointercancel', endDrag);

    /* ---------- Cliques ---------- */
    tourEl.addEventListener('click', e => {
      const hot = e.target.closest('[data-hot]');
      if (hot) {
        const [si, hi] = hot.dataset.hot.split(':').map(Number);
        const isOpen = hot.parentElement.classList.contains('is-open');
        if (isOpen) closeInfo(); else openInfo(si, hi);
        return;
      }
      if (e.target.closest('[data-info-close]')) { closeInfo(); return; }
      const istep = e.target.closest('[data-info-step]');
      if (istep) {
        const [si, hi] = infoAt;
        const len = scenes[si].data.hotspots.length;
        openInfo(si, (hi + +istep.dataset.infoStep + len) % len);
        return;
      }
      if (e.target.closest('[data-tip-close]')) { tipDone = true; tip.hidden = true; return; }
      const go = e.target.closest('[data-go]');
      if (go) { closePops(); goTo(+go.dataset.go); return; }
      const step = e.target.closest('[data-step]');
      if (step) {
        const to = active + +step.dataset.step;
        if (to >= N) document.getElementById('visao').scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' });
        else goTo(Math.max(0, to));
        return;
      }
      const tog = e.target.closest('.tcard__toggle');
      if (tog) {
        const open = tog.getAttribute('aria-expanded') !== 'true';
        cards.forEach(c => { c.classList.toggle('is-open', open); c.querySelector('.tcard__toggle').setAttribute('aria-expanded', String(open)); c.querySelector('.tcard__toggle i').textContent = open ? '−' : '+'; });
        return;
      }
      const pop = e.target.closest('[data-pop]');
      if (pop) {
        const panel = tourEl.querySelector(`[data-pop-panel="${pop.dataset.pop}"]`);
        const open = panel.hidden;
        closePops();
        if (open) { panel.hidden = false; pop.setAttribute('aria-expanded', 'true'); }
        return;
      }
      if (e.target.closest('[data-pop-close]') || !e.target.closest('.tpop')) closePops();
    });
    function closePops() {
      tourEl.querySelectorAll('[data-pop-panel]').forEach(p => { p.hidden = true; });
      tourEl.querySelectorAll('[data-pop]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    }

    addEventListener('keydown', e => {
      if (isStatic || e.target.closest('input, textarea, select, dialog, .drawer')) return;
      if (e.key === 'Escape') { closeInfo(); closePops(); }
      const r = tourEl.getBoundingClientRect();
      if (r.top > 1 || r.bottom < innerHeight - 1) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); if (active < N - 1) goTo(active + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); if (active > 0) goTo(active - 1); }
    });

    if (!isStatic) {
      measure();
      readTarget();
      cur = target;
      render(cur);
      // Rolar fecha o detalhe aberto, como se afastar de uma peça.
      addEventListener('scroll', () => {
        if (fkT && Math.abs(scrollY - infoY) > 60) closeInfo();
        kick();
      }, { passive: true });
      let lastW = innerWidth, lastH = innerHeight;
      addEventListener('resize', () => {
        if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 120) return;
        lastW = innerWidth; lastH = innerHeight;
        measure(); kick(); render(cur);
      });
      addEventListener('load', () => { measure(); kick(); });
    } else {
      tourEl.classList.add('tour--static');
      cards.forEach((card, i) => card.prepend(scenes[i].el));
      sticky.classList.add('ui-on');
      setActive(0);
      cards.forEach(c => c.classList.add('is-active'));
    }

    return {
      el: tourEl,
      isStatic,
      goTo
    };
  }

  window.AZTour = { markup, init };
})();
