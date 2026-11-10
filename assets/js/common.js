/* Altezza — comportamentos compartilhados entre as páginas. */
(function () {
  'use strict';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!reduce.matches) root.classList.add('motion');

  const ICON = {
    arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>',
    arrowUp: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 12L12 4M5.5 4H12v6.5"/></svg>',
    heart: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M10 17s-6.5-3.9-6.5-8.6A3.6 3.6 0 0 1 10 6.2a3.6 3.6 0 0 1 6.5 2.2C16.5 13.1 10 17 10 17z"/></svg>',
    area: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"/></svg>',
    bed: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1.5 13V4M1.5 9.5h13V13M14.5 9.5V8a2 2 0 0 0-2-2H7v3.5M3.5 7.5h2"/></svg>',
    car: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 11V8l1.6-3.6A1 1 0 0 1 4.5 4h7a1 1 0 0 1 .9.4L14 8v3M2 11h12M3 11v2M13 11v2"/><circle cx="4.8" cy="8.8" r=".6"/><circle cx="11.2" cy="8.8" r=".6"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>',
    plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>'
  };

  // A marca é só o nome: tipografia espaçada, sem símbolo.
  const LOGO = '';

  /* ---------- Formatação ---------- */
  const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const brlShort = n => n >= 1e6
    ? 'R$ ' + (n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi'
    : brl(n);
  const num = n => n.toLocaleString('pt-BR');

  /* ---------- Favoritos (somente neste navegador) ---------- */
  const FAV_KEY = 'altezza:favs';
  function favs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch (e) { return []; }
  }
  function setFavs(list) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) { /* armazenamento indisponível */ }
    syncFavs();
    document.dispatchEvent(new CustomEvent('altezza:favs', { detail: list }));
  }
  function toggleFav(id) {
    const list = favs();
    const i = list.indexOf(id);
    if (i > -1) list.splice(i, 1); else list.push(id);
    setFavs(list);
  }
  function syncFavs() {
    const list = favs();
    document.querySelectorAll('[data-fav]').forEach(btn => {
      const on = list.includes(btn.dataset.fav);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', (on ? 'Remover dos favoritos: ' : 'Salvar nos favoritos: ') + (btn.dataset.favName || ''));
    });
    document.querySelectorAll('.nav__fav-count').forEach(el => {
      el.textContent = list.length;
      el.classList.toggle('has', list.length > 0);
    });
  }
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-fav]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    toggleFav(btn.dataset.fav);
  });

  /* ---------- Card de imóvel ---------- */
  function cardHTML(p, opts = {}) {
    const img = p.card;
    return `<article class="pcard" data-id="${p.id}" ${opts.reveal ? `data-reveal style="--d:${opts.delay || 0}s"` : ''}>
      <div class="pcard__media" data-cursor="Iniciar<br>tour">
        <img src="${img.srcM}" ${img.src !== img.srcM ? `srcset="${img.srcM} 800w, ${img.src} ${img.w}w" sizes="(min-width: 1100px) 32vw, (min-width: 700px) 48vw, 100vw"` : ''} alt="${img.alt}" width="${img.w}" height="${img.h}" loading="lazy" decoding="async">
        <div class="pcard__top">
          <span class="chip chip--glass">${p.status}</span>
          <button class="fav-btn" type="button" data-fav="${p.id}" data-fav-name="${p.nome}" aria-pressed="false">${ICON.heart}</button>
        </div>
        <div class="pcard__play"><span class="pcard__play-txt">Apresentação imersiva · ${p.scenes.length} ambientes</span><span class="pcard__play-btn">${ICON.arrowUp}</span></div>
      </div>
      <div class="pcard__body">
        <div class="pcard__row">
          <h3 class="pcard__name"><a href="imovel.html?id=${p.id}" data-transition="${p.nome}">${p.nome}</a></h3>
          <span class="pcard__price">${brlShort(p.preco)}</span>
        </div>
        <p class="pcard__loc">${p.tipo} · ${p.bairro}, ${p.cidade}</p>
        <div class="pcard__specs">
          <span>${ICON.area}${num(p.area)} m²</span>
          <span>${ICON.bed}${p.suites} suítes</span>
          <span>${ICON.car}${p.vagas} vagas</span>
        </div>
      </div>
    </article>`;
  }

  /* ---------- Navegação, menu, rodapé ---------- */
  const LINKS = [
    ['index.html', 'Início'],
    ['imoveis.html', 'Imóveis'],
    ['index.html#experiencia', 'Experiência'],
    ['index.html#sobre', 'Sobre'],
    ['index.html#contato', 'Contato']
  ];
  function chrome() {
    const page = document.body.dataset.page;
    const current = href => (page === 'home' && href === 'index.html') || (page === 'catalog' && href === 'imoveis.html');
    const nav = document.createElement('header');
    nav.className = 'nav';
    nav.innerHTML = `<div class="wrap nav__inner">
        <a class="logo" href="index.html#topo" data-home-logo aria-label="Altezza, página inicial">${LOGO}<span>Altezza</span></a>
        <nav class="nav__links" aria-label="Principal">
          ${LINKS.slice(1).map(([h, t]) => `<a href="${h}"${current(h) ? ' aria-current="page"' : ''}>${t}</a>`).join('')}
        </nav>
        <div class="nav__actions">
          <a class="nav__fav" href="imoveis.html?favoritos=1" aria-label="Ver favoritos">${ICON.heart}<span class="nav__fav-count">0</span></a>
          <a class="btn btn--light" href="index.html#contato">Agendar visita<span class="btn__arrow">${ICON.arrow}</span></a>
          <button class="nav__burger" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
        </div>
      </div>`;
    document.body.prepend(nav);

    const menu = document.createElement('div');
    menu.className = 'menu';
    menu.id = 'menu';
    menu.innerHTML = `<nav class="menu__links" aria-label="Menu">
        ${LINKS.map(([h, t], i) => `<a href="${h}"><span>0${i + 1}</span>${t}</a>`).join('')}
      </nav>
      <div class="menu__foot"><span>contato@altezza.com.br</span><span>São Paulo · Nova Lima · Litoral</span></div>`;
    nav.after(menu);

    const burger = nav.querySelector('.nav__burger');
    const setMenu = open => {
      root.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('menu-open')) setMenu(false); });

    // Barra ganha fundo depois do primeiro bloco e se esconde ao descer.
    const solidAfter = document.querySelector('[data-nav-solid-after]');
    let lastY = scrollY;
    const onScroll = () => {
      const y = scrollY;
      const limit = solidAfter ? solidAfter.offsetTop + solidAfter.offsetHeight - 80 : 40;
      const darkZone = [...document.querySelectorAll('[data-nav-dark]')].some(el => {
        const r = el.getBoundingClientRect();
        return r.top <= 40 && r.bottom > 40;
      });
      nav.classList.toggle('is-solid', y > limit && !darkZone);
      nav.classList.toggle('is-dark-solid', y > limit && darkZone);
      const forceHide = document.body.hasAttribute('data-nav-hide');
      if (!root.classList.contains('menu-open')) nav.classList.toggle('is-hidden', forceHide || (y > lastY && y > 400));
      lastY = y;
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!document.body.hasAttribute('data-no-footer')) {
      const footer = document.createElement('footer');
      footer.className = 'footer';
      footer.innerHTML = `<div class="wrap">
          <div class="footer__top">
            <div class="footer__cta">
              <p class="eyebrow">Atendimento com hora marcada</p>
              <h2 style="margin-top:20px">O próximo endereço<br>começa numa <em>conversa</em>.</h2>
              <a class="btn btn--light" href="index.html#contato">Falar com um consultor<span class="btn__arrow">${ICON.arrow}</span></a>
            </div>
            <div class="footer__cols">
              <div><h3>Navegue</h3><ul>${LINKS.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul></div>
              <div><h3>Coleção</h3><ul>${window.ALTEZZA.PROPERTIES.slice(0, 5).map(p => `<li><a href="imovel.html?id=${p.id}" data-transition="${p.nome}">${p.nome}</a></li>`).join('')}</ul></div>
              <div class="footer__contact"><h3>Contato</h3><ul><li><address class="footer__address">Rua Exemplo, 000<br>Jardim Europa · São Paulo</address></li><li><a class="footer__email" href="mailto:contato@altezza.com.br">contato@altezza.com.br</a></li><li class="footer__hours">Seg a sex · 9h–19h</li></ul></div>
            </div>
          </div>
          <svg class="footer__word" viewBox="0 0 1200 210" role="presentation" aria-hidden="true" focusable="false">
            <g transform="translate(68 0)">
              <path d="M14 200 61 8h54l47 192h-41l-10-44H65l-10 44H14Zm61-82h27L89 63l-14 55Z"/>
              <path transform="translate(-8 0)" d="M180 8h42v152h102v40H180V8Z"/>
              <path transform="translate(-68 0)" d="M338 8h150v40h-54v152h-42V48h-54V8Z"/>
              <path transform="translate(-76 0)" d="M504 8h150v40h-108v38h91v40h-91v34h108v40H504V8Z"/>
              <path transform="translate(-84 0)" d="M670 8h150v34L722 160h98v40H670v-34L768 48h-98V8Z"/>
              <path transform="translate(-92 0)" d="M836 8h150v34L888 160h98v40H836v-34L934 48h-98V8Z"/>
              <path transform="translate(-100 0)" d="m1002 200 47-192h54l47 192h-41l-10-44h-46l-10 44h-41Zm61-82h27l-13-55-14 55Z"/>
            </g>
          </svg>
        </div>
        <div class="footer__legal"><div class="wrap" style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px 32px">
          <span>© ${new Date().getFullYear()} Altezza Imóveis · CRECI 12345-J</span>
          <span>Projeto de demonstração. Imóveis, valores, pessoas e depoimentos são fictícios; imagens ilustrativas.</span>
        </div></div>`;
      document.body.append(footer);
    }

    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<div class="cursor__ring"></div>';
    document.body.append(cursor);
  }

  /* ---------- Transição entre páginas ---------- */
  function transitions() {
    const curtain = document.querySelector('.curtain');
    const curtainTitle = curtain.querySelector('.curtain__title');
    const destinationTitle = (url, fallback = 'Altezza') => {
      if (url.pathname.endsWith('/imovel.html')) {
        const property = window.ALTEZZA.PROPERTIES.find(p => p.id === url.searchParams.get('id'));
        if (property) return property.nome;
      }
      return fallback;
    };
    const setTitle = title => {
      curtainTitle.textContent = title;
      curtainTitle.classList.toggle('logo', title === 'Altezza');
    };
    clearTimeout(window.azLoadingFallback);
    let previousTitle = '';
    try {
      previousTitle = sessionStorage.getItem('altezza:nav') || '';
      sessionStorage.removeItem('altezza:nav');
    } catch (e) { /* ok */ }
    setTitle(destinationTitle(new URL(location.href), previousTitle && previousTitle !== '1' ? previousTitle : 'Altezza'));
    const finish = () => {
      root.classList.add('is-entered');
      root.classList.remove('is-entering', 'is-leaving');
      curtain.setAttribute('aria-hidden', 'true');
    };
    if (root.classList.contains('is-entering')) {
      curtain.setAttribute('aria-hidden', 'false');
      setTimeout(finish, reduce.matches ? 0 : previousTitle ? 100 : 600);
    } else curtain.setAttribute('aria-hidden', 'true');
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.protocol !== location.protocol) return;
      const page = document.body.dataset.page;
      const sameHome = page === 'home'
        && /(?:^|\/)index\.html$/.test(url.pathname)
        && /(?:^|\/)index\.html$/.test(location.pathname.replace(/\/$/, '/index.html'));
      const sameCatalog = page === 'catalog'
        && /(?:^|\/)imoveis\.html$/.test(url.pathname)
        && /(?:^|\/)imoveis\.html$/.test(location.pathname);
      const sameRoute = (url.pathname === location.pathname || sameHome || sameCatalog)
        && url.search === location.search;
      if (sameRoute) {
        e.preventDefault();
        if (page === 'home' && a.hasAttribute('data-home-logo')) {
          if (location.hash !== '#topo') history.replaceState(null, '', `${location.pathname}${location.search}#topo`);
          if (scrollY <= 1 || reduce.matches) {
            window.scrollTo(0, 0);
            return;
          }
          if (root.classList.contains('is-leaving')) return;
          setTitle('Altezza');
          curtain.setAttribute('aria-hidden', 'false');
          root.classList.remove('is-entered');
          root.classList.add('is-leaving');
          setTimeout(() => {
            window.scrollTo(0, 0);
            finish();
          }, 650);
          return;
        }
        if (url.hash) {
          const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
          if (target) {
            if (url.hash !== location.hash) history.pushState(null, '', url.hash);
            target.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
          }
        }
        return;
      }
      if (reduce.matches) return;
      e.preventDefault();
      if (root.classList.contains('is-leaving')) return;
      setTitle(destinationTitle(url, a.dataset.transition || 'Altezza'));
      curtain.setAttribute('aria-hidden', 'false');
      root.classList.remove('is-entered');
      root.classList.add('is-leaving');
      try { sessionStorage.setItem('altezza:nav', curtainTitle.textContent); } catch (err) { /* ok */ }
      setTimeout(() => { location.href = url.href; }, 650);
    });
    addEventListener('pageshow', e => {
      if (e.persisted) finish();
    });
  }

  /* ---------- Cursor contextual ---------- */
  function cursor() {
    const el = document.querySelector('.cursor');
    const ring = el.querySelector('.cursor__ring');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, raf = 0;
    const loop = () => {
      cx += (x - cx) * .2; cy += (y - cy) * .2;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > .1 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
      const t = e.target.closest && e.target.closest('[data-cursor]');
      if (t && !e.target.closest('button, .fav-btn')) {
        ring.innerHTML = t.dataset.cursor;
        el.classList.add('is-active');
      } else el.classList.remove('is-active');
    }, { passive: true });
    document.addEventListener('pointerleave', () => el.classList.remove('is-active'));
  }

  /* ---------- Rolagem suave da roda do mouse ---------- */
  // Cada giro da roda avança menos e a página desliza até o destino, com inércia.
  function smoothWheel() {
    const SPEED = .55;   // fração do deslocamento original de cada giro
    const EASE = 140;    // ms; maior = desliza por mais tempo
    let target = scrollY, cur = scrollY, raf = 0, last = 0, ours = false;
    const max = () => document.documentElement.scrollHeight - innerHeight;
    const frame = now => {
      const dt = Math.min(64, now - (last || now));
      last = now;
      cur += (target - cur) * (1 - Math.exp(-dt / EASE));
      if (Math.abs(target - cur) < .5) cur = target;
      ours = true;
      window.scrollTo(0, cur);
      raf = cur !== target ? requestAnimationFrame(frame) : 0;
      if (!raf) last = 0;
    };
    addEventListener('wheel', e => {
      if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      // Painéis com rolagem própria e páginas travadas (menu, gaveta) mantêm o comportamento nativo.
      if (document.documentElement.style.overflow === 'hidden' || document.body.style.overflow === 'hidden') return;
      if (e.target.closest && e.target.closest('.drawer, dialog, .tpop, .tinfo, [data-native-scroll]')) return;
      e.preventDefault();
      if (!raf) { cur = target = scrollY; }
      const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1;
      target = Math.max(0, Math.min(max(), target + e.deltaY * unit * SPEED));
      if (!raf) raf = requestAnimationFrame(frame);
    }, { passive: false });
    // Teclado, âncoras e a barra do navegador continuam funcionando: o alvo se alinha a eles.
    addEventListener('scroll', () => {
      if (ours) { ours = false; return; }
      if (!raf) cur = target = scrollY;
    }, { passive: true });
  }

  /* ---------- Revelações ---------- */
  function splitLines(el) {
    if (el.dataset.splitDone) return;
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((h, i) => `<span class="split-line"><span style="--i:${i}">${h.trim()}</span></span>`).join('');
    el.dataset.splitDone = '1';
  }
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
      if (entry.target.dataset.count) countUp(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' }) : null;

  function icons(scope = document) {
    scope.querySelectorAll('.btn__arrow:empty, .la:empty, .services__arrow:empty').forEach(el => { el.innerHTML = ICON.arrow; });
    scope.querySelectorAll('.round-btn:empty').forEach(el => { el.innerHTML = ICON.arrow; });
  }

  function reveal(scope = document) {
    icons(scope);
    scope.querySelectorAll('[data-split]').forEach(splitLines);
    scope.querySelectorAll('[data-reveal], [data-mask], [data-split], [data-count]').forEach(el => {
      // O que já está na primeira dobra entra junto, sem esperar a margem do observador.
      if (io && !reduce.matches && el.getBoundingClientRect().top < innerHeight && scrollY < 10 && !el.dataset.count) {
        requestAnimationFrame(() => el.classList.add('is-in'));
      } else if (io && !reduce.matches) io.observe(el);
      else { el.classList.add('is-in'); if (el.dataset.count) el.textContent = num(+el.dataset.count); }
    });
  }
  function countUp(el) {
    const end = +el.dataset.count;
    const t0 = performance.now();
    const dur = 1600;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 4);
      el.textContent = num(Math.round(end * e));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Formulários sem backend: encaminham o contato ao WhatsApp ---------- */
  function forms() {
    document.querySelectorAll('form[data-demo-form]').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const value = name => (form.querySelector(`[name="${name}"]`) || {}).value?.trim() || '';
        const lines = ['Olá! Vim pelo catálogo da Altezza.'];
        if (form.matches('[data-vform]')) {
          const property = form.querySelector('.vform__head strong')?.textContent.trim();
          const day = form.querySelector('[name="dia"]:checked')?.dataset.label;
          const period = form.querySelector('[name="periodo"]:checked')?.dataset.label;
          lines.push('', 'Gostaria de solicitar uma visita:', `Imóvel: ${property}`, `Dia: ${day}`, `Período: ${period}`);
        } else {
          const interest = form.querySelector('[name="interesse"]:checked')?.value;
          const property = form.querySelector('[name="imovel"]')?.selectedOptions[0]?.textContent.trim();
          lines.push('', `Interesse: ${interest || 'não informado'}`);
          if (property && property !== 'Ainda não sei') lines.push(`Imóvel: ${property}`);
          if (value('mensagem')) lines.push(`Mensagem: ${value('mensagem')}`);
        }
        lines.push('', `Nome: ${value('nome')}`);
        if (value('telefone')) lines.push(`Telefone: ${value('telefone')}`);
        if (value('email')) lines.push(`E-mail: ${value('email')}`);
        const number = String(window.ALTEZZA.WHATSAPP_NUMBER || '').replace(/\D/g, '');
        window.location.assign(`https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`);
      });
    });
  }

  window.AZ = { ICON, LOGO, brl, brlShort, num, favs, toggleFav, syncFavs, cardHTML, reveal, reduce, fine };

  function init() {
    chrome();
    transitions();
    if (fine.matches) cursor();
    if (fine.matches && !reduce.matches) smoothWheel();
    forms();
    syncFavs();
    document.dispatchEvent(new Event('altezza:ready'));
    reveal();
  }
  // Scripts "defer" rodam com readyState "interactive": esperar o DOMContentLoaded
  // garante que os scripts de cada página já montaram o conteúdo dinâmico.
  if (document.readyState === 'complete') init();
  else document.addEventListener('DOMContentLoaded', init, { once: true });
})();
