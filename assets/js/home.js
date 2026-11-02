/* Altezza — página inicial. */
(function () {
  'use strict';
  const { PROPERTIES, find, featured } = window.ALTEZZA;
  const { ICON, cardHTML, num, brl, brlShort, reduce, syncFavs } = window.AZ;
  const mobileMQ = window.matchMedia('(max-width: 809.98px)');
  const pad = n => String(n).padStart(2, '0');
  const unique = key => [...new Set(PROPERTIES.map(p => p[key]))];

  document.querySelectorAll('[data-fill="imovel"]').forEach(sel => {
    sel.insertAdjacentHTML('beforeend', PROPERTIES.map(p => `<option value="${p.id}">${p.nome}</option>`).join(''));
  });
  document.querySelectorAll('[data-region-count]').forEach(el => {
    const n = PROPERTIES.filter(p => p.cidade === el.dataset.regionCount).length;
    el.textContent = `${n} ${n === 1 ? 'imóvel' : 'imóveis'} na coleção`;
  });

  /* ======================================================================
     Vitrine: o topo apresenta os imóveis, um de cada vez
     ====================================================================== */
  const show = document.querySelector('.show');
  if (show) {
    const DUR = 7000;
    const bg = show.querySelector('[data-show-bg]');
    const copies = show.querySelector('[data-show-copies]');
    const thumbs = show.querySelector('[data-show-thumbs]');
    const nEl = show.querySelector('[data-show-n]');
    const pauseBtn = show.querySelector('[data-show-pause]');
    show.querySelector('[data-show-total]').textContent = pad(PROPERTIES.length);
    show.style.setProperty('--dur', DUR + 'ms');

    bg.innerHTML = PROPERTIES.map((p, i) => `
      <div class="show__slide" data-i="${i}">
        <img src="${p.card.src}" alt="" width="${p.card.w}" height="${p.card.h}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">
      </div>`).join('');

    copies.innerHTML = PROPERTIES.map((p, i) => `
      <article class="show__copy" data-i="${i}" ${i ? 'hidden' : ''}>
        <p class="show__chips"><span class="chip chip--accent">${p.status}</span><span class="chip chip--glass">${p.tipo}</span></p>
        <h2 class="show__name">${p.nome.split(' ').map((w, k) => `<span class="w" style="--k:${k}"><span>${w}</span></span>`).join(' ')}</h2>
        <p class="show__tag">${p.tagline}</p>
        <dl class="show__specs">
          <div><dt>Local</dt><dd>${p.bairro}, ${p.cidade}</dd></div>
          <div><dt>Área</dt><dd>${num(p.area)} m²</dd></div>
          <div><dt>Suítes</dt><dd>${p.suites}</dd></div>
          <div><dt>Valor</dt><dd>${brlShort(p.preco)}</dd></div>
        </dl>
        <div class="show__ctas">
          <a class="btn btn--light" href="imovel.html?id=${p.id}" data-transition="${p.nome}">Iniciar apresentação<span class="btn__arrow">${ICON.arrow}</span></a>
          <button class="fav-btn fav-btn--lg" type="button" data-fav="${p.id}" data-fav-name="${p.nome}" aria-pressed="false">${ICON.heart}</button>
          <span class="show__rooms">${p.scenes.length} ambientes no tour</span>
        </div>
      </article>`).join('');

    thumbs.innerHTML = PROPERTIES.map((p, i) => `
      <button class="show__thumb" type="button" role="tab" data-i="${i}" aria-selected="${i ? 'false' : 'true'}" aria-label="${p.nome}, ${p.bairro}">
        <span class="show__thumb-img"><img src="${p.card.srcM}" alt="" loading="lazy" decoding="async"></span>
        <span class="show__thumb-txt"><strong>${p.nome}</strong><small>${p.cidade} · ${brlShort(p.preco)}</small></span>
        <span class="show__bar"><i></i></span>
      </button>`).join('');

    const slides = [...bg.children];
    const copyEls = [...copies.children];
    const thumbEls = [...thumbs.children];
    let cur = -1;
    let userPaused = false;

    // Carrossel em loop: o imóvel ativo vai para a primeira posição, quem estava antes
    // sai pela esquerda e o próximo entra pelo fim. Só cartões inteiros ficam visíveis.
    function rotateThumbs(i, animate) {
      const n = thumbEls.length;
      const before = thumbEls.map(t => t.getBoundingClientRect().left);
      const stripW = thumbs.clientWidth;
      thumbEls.forEach((t, j) => { t.style.order = (j - i + n) % n; });
      if (!animate || reduce.matches) return;
      thumbEls.forEach((t, j) => {
        const dx = before[j] - t.getBoundingClientRect().left;
        if (Math.abs(dx) < 1) return;
        t.getAnimations().forEach(a => a.cancel());
        if (dx < 0 || dx > stripW * .6) {
          // Cartão que deu a volta: some de um lado e reaparece do outro.
          t.animate([
            { opacity: 0, transform: `translateX(${dx < 0 ? 40 : -40}px)` },
            { opacity: 1, transform: 'none' }
          ], { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)', delay: 120, fill: 'backwards' });
        } else {
          t.animate([{ transform: `translateX(${dx}px)` }, { transform: 'none' }],
            { duration: 750, easing: 'cubic-bezier(.16,1,.3,1)' });
        }
      });
    }

    function go(i, dir) {
      i = (i + PROPERTIES.length) % PROPERTIES.length;
      if (i === cur) return;
      const prev = cur;
      dir = dir || (i > prev ? 1 : -1);
      slides.forEach((s, j) => {
        s.classList.toggle('is-active', j === i);
        s.classList.toggle('is-prev', j === prev);
        s.classList.toggle('from-left', j === i && dir < 0);
      });
      copyEls.forEach((c, j) => {
        c.hidden = j !== i;
        c.classList.toggle('is-in', j === i);
      });
      thumbEls.forEach((t, j) => {
        t.setAttribute('aria-selected', String(j === i));
        // Reinicia a barra de progresso da miniatura ativa.
        const bar = t.querySelector('.show__bar i');
        bar.style.animation = 'none';
        void bar.offsetWidth;
        bar.style.animation = '';
      });
      rotateThumbs(i, prev !== -1);
      nEl.textContent = pad(i + 1);
      cur = i;
      // Pré-carrega a próxima foto grande.
      const next = slides[(i + 1) % slides.length].querySelector('img');
      next.loading = 'eager';
    }

    // A troca automática pausa com o cursor sobre as miniaturas, com a aba oculta ou a pedido.
    const setPaused = () => {
      const hovering = window.AZ.fine.matches && thumbs.matches(':hover');
      show.classList.toggle('is-paused', userPaused || reduce.matches || document.hidden || hovering);
    };
    thumbs.addEventListener('animationend', e => {
      if (e.target.matches('.show__thumb[aria-selected="true"] .show__bar i')) go(cur + 1, 1);
    });
    thumbs.addEventListener('click', e => {
      const t = e.target.closest('.show__thumb');
      if (t) go(+t.dataset.i);
    });
    show.querySelectorAll('[data-show-step]').forEach(b => {
      b.addEventListener('click', () => go(cur + +b.dataset.showStep, +b.dataset.showStep));
    });
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.textContent = userPaused ? 'Continuar' : 'Pausar';
      setPaused();
    });
    thumbs.addEventListener('pointerenter', setPaused);
    thumbs.addEventListener('pointerleave', setPaused);
    document.addEventListener('visibilitychange', setPaused);
    show.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { go(cur + 1, 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(cur - 1, -1); e.preventDefault(); }
    });

    // Arrastar para os lados no toque.
    let sx = null, sy = 0;
    show.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { sx = e.clientX; sy = e.clientY; } });
    show.addEventListener('pointerup', e => {
      if (sx === null) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    });

    go(0, 1);
    setPaused();
  }

  /* ======================================================================
     Explorador da coleção: filtros que respondem na hora
     ====================================================================== */
  const ex = document.querySelector('.explore');
  if (ex) {
    const grid = ex.querySelector('[data-ex-grid]');
    const list = ex.querySelector('[data-ex-list]');
    const empty = ex.querySelector('[data-ex-empty]');
    const count = ex.querySelector('[data-ex-count]');
    const label = ex.querySelector('[data-ex-label]');
    const resetBtns = ex.querySelectorAll('[data-ex-reset]');
    const range = ex.querySelector('[data-ex-preco]');
    const out = ex.querySelector('[data-ex-preco-out]');
    const ordem = ex.querySelector('[data-ex-ordem]');
    const state = { tipo: '', cidade: '', max: 25, ordem: '', view: 'grid' };

    const countBy = (key, v) => PROPERTIES.filter(p => !v || p[key] === v).length;
    ex.querySelector('[data-ex-tipo]').innerHTML = ['', ...unique('tipo')].map(v =>
      `<label class="ex-tab"><input type="radio" name="ex-tipo" value="${v}" ${v ? '' : 'checked'}><span>${v || 'Todos'}</span><sup>${countBy('tipo', v)}</sup></label>`).join('');
    ex.querySelector('[data-ex-cidade]').innerHTML = ['', ...unique('cidade')].map(v =>
      `<label class="ex-seg__item"><input type="radio" name="ex-cidade" value="${v}" ${v ? '' : 'checked'}><span>${v || 'Todas'}</span></label>`).join('');

    // Sublinhado que desliza até a aba de tipo escolhida.
    const tabs = ex.querySelector('.ex-tabs');
    const ink = ex.querySelector('.ex-tabs__ink');
    const moveInk = () => {
      const on = tabs.querySelector('input:checked').parentElement;
      const r = on.getBoundingClientRect(), t = tabs.getBoundingClientRect();
      ink.style.width = r.width + 'px';
      ink.style.transform = `translate(${r.left - t.left}px, ${r.bottom - t.top}px)`;
    };
    addEventListener('resize', moveInk);
    document.fonts && document.fonts.ready.then(moveInk);

    const fmtMax = v => v >= 25 ? 'Qualquer valor' : `Até R$ ${String(v).replace('.', ',')} mi`;
    const paintRange = () => {
      const pct = (range.value - range.min) / (range.max - range.min) * 100;
      range.style.setProperty('--fill', pct + '%');
      out.textContent = fmtMax(+range.value);
    };

    function render() {
      let items = PROPERTIES.filter(p =>
        (!state.tipo || p.tipo === state.tipo) &&
        (!state.cidade || p.cidade === state.cidade) &&
        p.preco <= state.max * 1e6
      );
      if (state.ordem === 'preco-asc') items.sort((a, b) => a.preco - b.preco);
      if (state.ordem === 'preco-desc') items.sort((a, b) => b.preco - a.preco);
      if (state.ordem === 'area-desc') items.sort((a, b) => b.area - a.area);

      grid.innerHTML = items.map(p => cardHTML(p)).join('');
      [...grid.children].forEach((c, i) => { c.classList.add('ex-in'); c.style.setProperty('--i', i); });
      list.innerHTML = items.map((p, i) => `
        <a class="ex-row ex-in" style="--i:${i}" href="imovel.html?id=${p.id}" data-transition="${p.nome}" data-preview="${p.card.srcM}">
          <span class="ex-row__n">${pad(PROPERTIES.indexOf(p) + 1)}</span>
          <span class="ex-row__name"><strong>${p.nome}</strong><small>${p.tipo} · ${p.status}</small></span>
          <span class="ex-row__loc">${p.bairro}, ${p.cidade}</span>
          <span class="ex-row__spec">${num(p.area)} m² · ${p.suites} suítes</span>
          <span class="ex-row__price">${brl(p.preco)}</span>
          <span class="ex-row__go">${ICON.arrowUp}</span>
        </a>`).join('');

      const filtered = state.tipo || state.cidade || state.max < 25;
      count.textContent = items.length;
      label.textContent = filtered
        ? (items.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados')
        : 'imóveis na coleção';
      resetBtns[0].hidden = !filtered;
      empty.hidden = items.length > 0;
      grid.hidden = state.view !== 'grid' || !items.length;
      list.hidden = state.view !== 'list' || !items.length;
      syncFavs();
    }

    ex.addEventListener('change', e => {
      const t = e.target;
      if (t.name === 'ex-tipo') state.tipo = t.value;
      if (t.name === 'ex-cidade') state.cidade = t.value;
      if (t === ordem) state.ordem = t.value;
      moveInk();
      render();
    });
    range.addEventListener('input', () => {
      paintRange();
      state.max = +range.value;
      render();
    });
    ex.querySelectorAll('[data-ex-view]').forEach(b => b.addEventListener('click', () => {
      state.view = b.dataset.exView;
      ex.querySelectorAll('[data-ex-view]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      render();
    }));
    resetBtns.forEach(b => b.addEventListener('click', () => {
      Object.assign(state, { tipo: '', cidade: '', max: 25, ordem: '' });
      ex.querySelectorAll('input[type="radio"][value=""]').forEach(r => { r.checked = true; });
      range.value = 25; ordem.value = '';
      paintRange();
      moveInk();
      render();
    }));
    paintRange();
    render();
    moveInk();

    // Prévia da foto acompanhando o cursor na visualização em lista.
    const prev = document.createElement('div');
    prev.className = 'float-preview';
    prev.setAttribute('aria-hidden', 'true');
    prev.innerHTML = '<img alt="">';
    document.body.append(prev);
    if (window.AZ.fine.matches) {
      const img = prev.querySelector('img');
      let x = 0, y = 0, fx = 0, fy = 0, raf = 0;
      const loop = () => {
        fx += (x - fx) * .16; fy += (y - fy) * .16;
        prev.style.transform = `translate3d(${fx}px, ${fy}px, 0)`;
        raf = requestAnimationFrame(loop);
      };
      list.addEventListener('pointermove', e => {
        x = e.clientX + 30; y = e.clientY - 140;
        const row = e.target.closest('.ex-row');
        if (row && img.getAttribute('src') !== row.dataset.preview) img.src = row.dataset.preview;
        prev.classList.toggle('on', Boolean(row));
        if (!raf) { fx = x; fy = y; raf = requestAnimationFrame(loop); }
      });
      list.addEventListener('pointerleave', () => {
        prev.classList.remove('on');
        cancelAnimationFrame(raf); raf = 0;
      });
    }
  }

  /* ======================================================================
     Manifesto: palavras acendem com a rolagem
     ====================================================================== */
  const mani = document.querySelector('[data-words]');
  let words = [];
  if (mani) {
    mani.innerHTML = mani.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
    words = [...mani.querySelectorAll('.w')];
  }
  function maniScroll() {
    if (!mani || reduce.matches) return;
    const r = mani.getBoundingClientRect();
    const vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
    const lit = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < lit));
  }

  /* ======================================================================
     Destaques: cards com inclinação 3D
     ====================================================================== */
  const cardsList = document.querySelector('[data-featured]');
  if (cardsList) {
    cardsList.innerHTML = featured.map(find).map((p, i) => `
      <div class="card-wrapper" data-card-index="${i + 1}">
        <a class="case-card" href="imovel.html?id=${p.id}" data-transition="${p.nome}" aria-label="Iniciar apresentação: ${p.nome}" data-cursor="Iniciar<br>tour">
          <div class="card-media"><img class="card-img" src="${p.card.src}" alt="${p.card.alt}" width="${p.card.w}" height="${p.card.h}" loading="lazy" decoding="async"></div>
          <div class="card-overlay" aria-hidden="true"></div>
          <div class="card-go" aria-hidden="true"><span>Iniciar apresentação</span><span>${ICON.arrowUp}</span></div>
          <div class="card-content">
            <span class="category-pill">${p.tipo} · ${p.status}</span>
            <h3 class="card-title">${p.nome}</h3>
            <p class="card-description">${p.tagline}</p>
            <p class="card-meta"><span>${p.bairro}, ${p.cidade}</span><span>${num(p.area)} m²</span><span>${p.suites} suítes</span><span>${p.scenes.length} ambientes no tour</span></p>
          </div>
        </a>
      </div>`).join('');
    tiltCards();
  }

  function tiltCards() {
    const wrappers = [...document.querySelectorAll('.card-wrapper')];
    if (!wrappers.length) return;
    let frame = 0;
    const clamp = v => Math.max(0, Math.min(1, v));
    function update() {
      frame = 0;
      const viewport = window.innerHeight;
      const maxTilt = mobileMQ.matches ? 30 : 50;
      const scaleRange = mobileMQ.matches ? .1 : .2;
      // Lê todos os retângulos estáveis antes de escrever as transformações.
      const bounds = wrappers.map(w => w.getBoundingClientRect());
      const transforms = bounds.map((rect, i) => {
        const entering = 1 - clamp((viewport - rect.top) / rect.height);
        const next = bounds[i + 1];
        const nextTop = next ? next.top : rect.bottom + 20;
        const nextHeight = next ? next.height : rect.height;
        const leaving = clamp((viewport - nextTop) / nextHeight);
        const tilt = (leaving - entering) * maxTilt;
        const scale = 1 - (entering + leaving) * scaleRange;
        return reduce.matches ? 'none'
          : `perspective(2000px) scale(${scale.toFixed(6)}) rotateX(${tilt.toFixed(6)}deg)`;
      });
      wrappers.forEach((w, i) => { w.firstElementChild.style.transform = transforms[i]; });
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    addEventListener('pageshow', schedule);
    reduce.addEventListener('change', schedule);
    const ro = new ResizeObserver(schedule);
    wrappers.forEach(w => ro.observe(w));
    update();

    if (!reduce.matches && !mobileMQ.matches) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.animate([
            { opacity: 0, transform: 'translateY(150px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], { duration: 1000, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
          observer.unobserve(entry.target);
        });
      });
      document.querySelectorAll('.section-header > *').forEach(part => observer.observe(part));
    }
  }

  /* ======================================================================
     Serviços: a foto de cada linha aparece num espaço reservado entre
     o título e a descrição, sem cobrir o texto
     ====================================================================== */
  document.querySelectorAll('[data-services] li').forEach(li => {
    li.insertAdjacentHTML('beforeend', `<span class="services__img" aria-hidden="true"><img src="${li.dataset.img}" alt="" loading="lazy" decoding="async"></span>`);
  });

  // Serviços que levam ao contato já chegam com o interesse marcado e uma mensagem inicial.
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-interest]');
    if (!a) return;
    const form = document.querySelector('#contato form');
    if (!form) return;
    const radio = form.querySelector(`input[name="interesse"][value="${a.dataset.interest}"]`);
    if (radio) radio.checked = true;
    const msg = form.querySelector('[name="mensagem"]');
    if (msg && a.dataset.msg) msg.value = a.dataset.msg;
    // Depois da rolagem, o cursor já fica no primeiro campo.
    setTimeout(() => form.querySelector('[name="nome"]').focus({ preventScroll: true }), 700);
  });

  /* ---------- Depoimentos ---------- */
  const track = document.querySelector('[data-quotes]');
  document.querySelectorAll('[data-q]').forEach(btn => btn.addEventListener('click', () => {
    const card = track.querySelector('.quote');
    track.scrollBy({ left: +btn.dataset.q * (card.offsetWidth + 20), behavior: reduce.matches ? 'auto' : 'smooth' });
  }));

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { maniScroll(); ticking = false; });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();
