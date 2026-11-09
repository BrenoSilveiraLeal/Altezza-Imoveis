/* Altezza — apresentação imersiva de um imóvel. */
(function () {
  'use strict';
  const { PROPERTIES, find } = window.ALTEZZA;
  const { ICON, brl, num, reduce } = window.AZ;
  const mobileMQ = window.matchMedia('(max-width: 809.98px)');

  const params = new URLSearchParams(location.search);
  const P = find(params.get('id')) || PROPERTIES[0];
  const N = P.scenes.length;
  const pad = n => String(n).padStart(2, '0');
  const roomById = id => P.plan.rooms.find(r => r.id === id);
  const main = document.getElementById('conteudo');

  document.title = `${P.nome} · ${P.bairro} — Altezza`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = `${P.nome}: ${P.resumo}`;

  /* ======================================================================
     Marcação
     ====================================================================== */
  const tour = window.AZTour.markup(P, planSVG);

  const overview = `
    <section class="p-sec p-over" id="visao" aria-labelledby="visao-title">
      <div class="wrap">
        <div class="p-over__head">
          <p class="eyebrow" data-reveal>Visão geral</p>
          <h2 class="h2 p-over__title" id="visao-title" data-reveal>${P.tagline}</h2>
          <div class="p-over__text" data-reveal>
            ${P.descricao.map(t => `<p>${t}</p>`).join('')}
          </div>
          <ul class="p-checks" data-reveal>${P.destaques.map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
        <dl class="p-sheet" id="ficha">
          ${[
            ['Área privativa', `${num(P.area)} m²`],
            P.terreno ? ['Terreno', `${num(P.terreno)} m²`] : ['Pavimento', P.andar],
            ['Suítes', P.suites],
            ['Vagas', P.vagas],
            ['Banheiros', P.banheiros],
            ['Entrega', P.entrega],
            ['Arquitetura', P.arquitetura],
            ['Coordenadas', P.coords]
          ].map(([k, v], i) => `<div data-reveal style="--d:${(i % 4) * .06}s"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
        </dl>
      </div>
    </section>`;

  const A = P.arquiteturaTexto;
  const sketchScene = P.scenes.find(scene => scene.sketch);
  const archPhoto = A.foto || sketchScene?.img || A.imagem;
  const archSketch = A.croqui || sketchScene?.sketch;
  const hasOriginalSketch = Boolean(archSketch);
  const arch = `
    <section class="p-sec p-arch on-night" id="arquitetura" aria-labelledby="arq-title" data-nav-dark>
      <div class="wrap p-arch__grid">
        <div class="p-arch__copy">
          <p class="eyebrow" data-reveal>Arquitetura · ${P.arquitetura}</p>
          <h2 class="h2" id="arq-title" data-split style="margin:22px 0 26px">${A.titulo.replace(/\s(\S+\.)$/, '<br>$1')}</h2>
          <p class="lead" data-reveal>${A.texto}</p>
        </div>
        ${hasOriginalSketch ? `
          <figure class="compare" data-reveal="scale" style="--pos:50%;--compare-ratio:${archPhoto.w} / ${archPhoto.h}">
            <img src="${archPhoto.srcM}" srcset="${archPhoto.srcM} 800w, ${archPhoto.src} ${archPhoto.w}w" sizes="(min-width:1024px) 60vw, 100vw" alt="${archPhoto.alt}" width="${archPhoto.w}" height="${archPhoto.h}" loading="lazy" decoding="async">
            <img class="compare__top" src="${archSketch.srcM}" srcset="${archSketch.srcM} 800w, ${archSketch.src} ${archSketch.w}w" sizes="(min-width:1024px) 60vw, 100vw" alt="${archSketch.alt}" width="${archSketch.w}" height="${archSketch.h}" loading="lazy" decoding="async">
            <span class="compare__tag compare__tag--l">Croqui · 2022</span><span class="compare__tag compare__tag--r">Entrega · 2024</span>
            <span class="compare__line" aria-hidden="true"><i>${ICON.arrow}${ICON.arrow}</i></span>
            <input class="compare__range" type="range" min="0" max="100" value="50" aria-label="Comparar croqui e foto do ambiente">
            <figcaption class="sr-only">Compare o croqui com a foto de ${sketchScene?.nome || 'um ambiente do imóvel'}.</figcaption>
          </figure>` : `
          <figure class="p-arch__fig" data-mask>
            <img src="${A.imagem.srcM}" srcset="${A.imagem.srcM} 800w, ${A.imagem.src} ${A.imagem.w}w" sizes="(min-width:1024px) 45vw, 100vw" alt="${A.imagem.alt}" width="${A.imagem.w}" height="${A.imagem.h}" loading="lazy" decoding="async">
            <figcaption>${A.legenda}</figcaption>
          </figure>`}
      </div>
    </section>`;

  const plan = `
    <section class="p-sec p-plan" id="planta" aria-labelledby="planta-title">
      <div class="wrap">
        <header class="sec-head sec-head--split">
          <div>
            <p class="eyebrow" data-reveal>Planta</p>
            <h2 class="h2" id="planta-title" data-split style="margin-top:22px">Cada ambiente<br>no seu <em>lugar</em>.</h2>
          </div>
          <p class="lead" data-reveal>Planta esquemática, sem escala. Passe o cursor pelos ambientes e volte ao tour pelo ambiente que quiser rever.</p>
        </header>
        <div class="p-plan__grid">
          <div class="p-plan__svg" data-reveal="scale">${planSVG('big')}</div>
          <ul class="p-plan__list">
            ${P.plan.rooms.map(r => {
              const si = P.scenes.findIndex(s => s.room === r.id);
              return `<li data-room="${r.id}" data-reveal>
                <span class="p-plan__name">${r.nome}</span>
                <span class="p-plan__area">${r.area ? `${num(r.area)} m²` : '—'}</span>
                ${si > -1 ? `<button type="button" data-go="${si}" class="p-plan__go">Ver no tour ${ICON.arrowUp}</button>` : '<span></span>'}
              </li>`;
            }).join('')}
          </ul>
        </div>
      </div>
    </section>`;

  const mats = `
    <section class="p-sec p-mats" id="materiais" aria-labelledby="mat-title">
      <div class="wrap">
        <header class="sec-head">
          <p class="eyebrow" data-reveal>Materiais</p>
          <h2 class="h2" id="mat-title" data-split>Poucos materiais,<br>escolhidos para <em>durar</em>.</h2>
        </header>
        <ul class="p-mats__grid" style="--n:${P.materiais.length}">
          ${P.materiais.map((m, i) => `
            <li class="mat" data-reveal style="--d:${i * .07}s">
              <span class="mat__sw" style="--c:${m.cor}">${m.img ? `<img src="${m.img}" alt="" width="480" height="480" loading="lazy" decoding="async">` : ''}</span>
              <strong>${m.nome}</strong><span>${m.uso}</span>
            </li>`).join('')}
        </ul>
      </div>
    </section>`;

  const L = P.localizacao;
  const loc = `
    <section class="p-sec p-loc on-night" id="localizacao" aria-labelledby="loc-title" data-nav-dark>
      <div class="wrap p-loc__grid">
        <div>
          <p class="eyebrow" data-reveal>Localização · ${P.bairro}</p>
          <h2 class="h2" id="loc-title" data-split style="margin:22px 0 24px">Tudo perto,<br>nada <em>em cima</em>.</h2>
          <p class="lead" data-reveal>${L.texto}</p>
          <ul class="p-loc__list">
            ${L.pontos.map((pt, i) => `<li data-reveal data-pt="${i}" style="--d:${i * .06}s"><span>${pt.nome}</span><strong>${pt.tempo}</strong></li>`).join('')}
          </ul>
        </div>
        <div class="radar" data-reveal="scale" aria-hidden="true">
          ${L.imagem ? `<img class="radar__img" src="${L.imagem.srcM}" srcset="${L.imagem.srcM} 900w, ${L.imagem.src} ${L.imagem.w}w" sizes="(min-width:1024px) 560px, 92vw" alt="" loading="eager" decoding="async">` : ''}
          <svg viewBox="-100 -100 200 200">
            <circle r="96"/><circle r="72"/><circle r="48"/><circle r="24"/>
            <path d="M-96 0H96M0-96V96"/>
            <g class="radar__sweep"><path d="M0 0L0 -96A96 96 0 0 1 67.9 -67.9Z"/></g>
            ${L.pontos.map((pt, i) => {
              const a = (pt.ang - 90) * Math.PI / 180;
              const x = Math.cos(a) * pt.dist * 92, y = Math.sin(a) * pt.dist * 92;
              return `<g class="radar__pt" data-pt="${i}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="2.6"/><circle class="halo" r="6"/></g>`;
            }).join('')}
            <circle class="radar__home" r="4.5"/>
          </svg>
          <span class="radar__label">${P.nome}</span>
          <span class="radar__n">N</span>
        </div>
      </div>
    </section>`;

  // Só fotos diferentes do próprio imóvel: croquis, maquetes e mesas de projeto ficam na
  // seção de arquitetura. Com uma foto só, a galeria não aparece.
  const galleryImgs = [];
  [P.cover, ...P.scenes.map(s => s.img), L.imagem].forEach(img => {
    if (img && !galleryImgs.some(g => g.img === img)) galleryImgs.push({ img, alt: img.alt });
  });
  const hasGallery = galleryImgs.length > 1;
  const COLS = 3;
  const lastRow = galleryImgs.length % COLS;
  const spanOf = i => {
    if (!lastRow || i < galleryImgs.length - lastRow) return 2;
    return lastRow === 1 ? 6 : 3;   // última linha incompleta estica para ocupar a largura
  };
  const gallery = !hasGallery ? '' : `
    <section class="p-sec p-gal" id="galeria" aria-labelledby="gal-title">
      <div class="wrap">
        <header class="sec-head sec-head--split">
          <div>
            <p class="eyebrow" data-reveal>Galeria</p>
            <h2 class="h2" id="gal-title" data-split style="margin-top:22px">Cada canto,<br>sem <em>pressa</em>.</h2>
          </div>
          <p class="lead" data-reveal>Toque em uma foto para ampliar e use as setas do teclado para navegar.</p>
        </header>
        <div class="p-gal__grid">
          ${galleryImgs.map((g, i) => `
            <button type="button" class="p-gal__item" data-gal="${i}" data-reveal style="--d:${(i % 3) * .06}s;--span:${spanOf(i)}" data-cursor="Ampliar" aria-label="Ampliar: ${g.alt}">
              <img src="${g.img.srcM}" ${g.img.src !== g.img.srcM ? `srcset="${g.img.srcM} 800w, ${g.img.src} ${g.img.w}w" sizes="(min-width: 900px) 34vw, 50vw"` : ''} alt="" width="${g.img.w}" height="${g.img.h}" loading="lazy" decoding="async">
            </button>`).join('')}
        </div>
      </div>
      <dialog class="lightbox" aria-label="Galeria ampliada">
        <img alt="">
        <p class="lightbox__cap"></p>
        <button type="button" class="lightbox__btn lightbox__close" aria-label="Fechar">${ICON.close}</button>
        <button type="button" class="lightbox__btn lightbox__prev" aria-label="Imagem anterior">${ICON.arrow}</button>
        <button type="button" class="lightbox__btn lightbox__next" aria-label="Próxima imagem">${ICON.arrow}</button>
      </dialog>
    </section>`;

  const days = nextDays(6);
  const SLOT = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    sunset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M17 18a5 5 0 0 0-10 0M12 9V3M4.2 10.2l1.4 1.4M1 18h2M21 18h2M18.4 11.6l1.4-1.4M23 22H1M16 6l-4 3-4-3"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3"/></svg>'
  };
  const visit = `
    <section class="p-sec p-visit on-night" id="visita" aria-labelledby="visita-title" data-nav-dark>
      <div class="wrap p-visit__grid">
        <div>
          <p class="eyebrow" data-reveal>Investimento</p>
          <h2 class="h2" id="visita-title" data-split style="margin:22px 0 32px">Agende uma<br><em>visita</em>.</h2>
          <dl class="price" data-reveal>
            <div class="price__main"><dt>Valor de venda</dt><dd>${brl(P.preco)}</dd></div>
            <div><dt>Condomínio</dt><dd>${P.condominio ? brl(P.condominio) + '/mês' : 'Não há'}</dd></div>
            <div><dt>IPTU</dt><dd>${brl(P.iptu)}/mês</dd></div>
            <div><dt>Valor por m²</dt><dd>${brl(Math.round(P.preco / P.area))}</dd></div>
          </dl>
          <p class="price__note" data-reveal>Valores ilustrativos, criados para esta demonstração.</p>
        </div>
        <form class="vform" data-demo-form data-vform novalidate data-reveal>
          <header class="vform__head">
            <img src="${P.card.srcM}" alt="" width="120" height="120" loading="lazy" decoding="async">
            <div><small>Visita guiada com consultor</small><strong>${P.nome}</strong><span>${P.bairro}, ${P.cidade}</span></div>
            <span class="vform__badge">Sem custo · 45 min</span>
          </header>

          <fieldset class="vstep">
            <legend><b>1</b>Escolha o dia</legend>
            <div class="vdays">
              ${days.map((d, i) => `<label class="vday"><input type="radio" name="dia" value="${d.iso}" data-label="${d.wd}, ${d.d}" ${i ? '' : 'checked'}><span><small>${d.wd}</small><strong>${d.day}</strong><em>${d.mon}</em></span></label>`).join('')}
            </div>
          </fieldset>

          <fieldset class="vstep">
            <legend><b>2</b>Período</legend>
            <div class="vslots">
              <label class="vslot"><input type="radio" name="periodo" value="manha" data-label="Manhã" checked><span><i>${SLOT.sun}</i><strong>Manhã</strong><small>9h – 12h</small></span></label>
              <label class="vslot"><input type="radio" name="periodo" value="tarde" data-label="Tarde"><span><i>${SLOT.sunset}</i><strong>Tarde</strong><small>14h – 18h</small></span></label>
              <label class="vslot"><input type="radio" name="periodo" value="video" data-label="Por vídeo"><span><i>${SLOT.video}</i><strong>Por vídeo</strong><small>Tour ao vivo</small></span></label>
            </div>
          </fieldset>

          <fieldset class="vstep">
            <legend><b>3</b>Seus dados</legend>
            <div class="vfields">
              <label class="vfield"><input name="nome" autocomplete="name" placeholder=" " required><span>Nome</span></label>
              <label class="vfield"><input name="telefone" type="tel" autocomplete="tel" inputmode="tel" placeholder=" " required><span>Telefone</span></label>
              <label class="vfield vfield--full"><input name="email" type="email" autocomplete="email" placeholder=" " required><span>E-mail</span></label>
            </div>
          </fieldset>

          <footer class="vform__foot">
            <p class="vform__sum"><small>Sua visita</small><strong data-vsum></strong></p>
            <button class="vform__submit" type="submit">Solicitar visita<i>${ICON.arrow}</i></button>
          </footer>
          <p class="vform__note">Demonstração: nenhum dado é enviado ou armazenado.</p>
          <div class="form-ok" role="status">
            <p class="eyebrow">Visita solicitada</p>
            <h3><span data-ok-name></span>, sua visita à ${P.nome} está pré-agendada.</h3>
            <p class="lead">Em um site real, um consultor confirmaria o horário por telefone. Enquanto isso, conheça outro imóvel da coleção.</p>
          </div>
        </form>
      </div>
    </section>`;

  const nextP = PROPERTIES[(PROPERTIES.indexOf(P) + 1) % PROPERTIES.length];
  const next = `
    <section class="p-next" aria-label="Próximo imóvel">
      <a href="imovel.html?id=${nextP.id}" data-transition="${nextP.nome}" class="p-next__link" data-cursor="Próximo<br>tour">
        <img src="${nextP.card.src}" alt="${nextP.card.alt}" width="${nextP.card.w}" height="${nextP.card.h}" loading="lazy" decoding="async">
        <span class="p-next__txt wrap">
          <span class="label">Próximo imóvel · ${nextP.bairro}, ${nextP.cidade}</span>
          <strong>${nextP.nome}</strong>
          <span class="p-next__go">Iniciar apresentação <span class="btn__arrow"></span></span>
        </span>
      </a>
    </section>`;

  const dock = `
    <nav class="dock" aria-label="Seções do imóvel">
      <a href="#tour">Tour</a><a href="#visao">Visão</a><a href="#planta">Planta</a><a href="#localizacao">Local</a>${hasGallery ? '<a href="#galeria">Galeria</a>' : ''}
      <button type="button" class="dock__btn" data-drawer-open>Coleção</button>
      <a class="dock__cta" href="#visita">Agendar</a>
    </nav>`;

  main.innerHTML = tour + overview + arch + plan + mats + loc + gallery + visit + next;
  document.body.insertAdjacentHTML('beforeend', dock);

  function planSVG(kind) {
    const rooms = P.plan.rooms;
    const big = kind === 'big';
    return `<svg class="plan plan--${kind}" viewBox="0 0 100 64" role="img" aria-label="Planta esquemática de ${P.nome}">
      <rect class="plan__frame" x="1.5" y="1.5" width="97" height="61" rx="1"/>
      ${rooms.map(r => `<g class="plan__room" data-room="${r.id}">
          <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx=".6"/>
          ${big ? roomLabel(r) : ''}
        </g>`).join('')}
      ${big ? '' : '<circle class="plan__me" r="2.4"/><circle class="plan__me-halo" r="5"/>'}
    </svg>`;
  }

  // Nome do cômodo dentro do retângulo: quebra em duas linhas e reduz a letra se preciso.
  function roomLabel(r) {
    const CH = .58;              // largura média de um caractere, em fração do tamanho da letra
    const room = r.w - 3.2;      // espaço útil, descontando as margens
    const words = r.nome.split(' ');
    let lines = [r.nome];
    if (r.nome.length * CH * 2.3 > room && words.length > 1) {
      // Divide no espaço que deixa as duas linhas mais equilibradas.
      let best = null;
      for (let i = 1; i < words.length; i++) {
        const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
        const longest = Math.max(a.length, b.length);
        if (!best || longest < best.longest) best = { lines: [a, b], longest };
      }
      lines = best.lines;
    }
    const longest = Math.max(...lines.map(l => l.length));
    const fs = Math.max(1.3, Math.min(2.3, room / (longest * CH)));
    const x = r.x + 1.6, y0 = r.y + 1.6 + fs;
    const label = lines.map((l, i) => `<tspan x="${x}" y="${(y0 + i * fs * 1.15).toFixed(2)}">${l}</tspan>`).join('');
    const yArea = y0 + (lines.length - 1) * fs * 1.15 + 3.2;
    return `<text style="font-size:${fs.toFixed(2)}px">${label}</text>`
      + (r.area && yArea < r.y + r.h - .6 ? `<text class="plan__m2" x="${x}" y="${yArea.toFixed(2)}">${r.area} m²</text>` : '');
  }

  function nextDays(n) {
    const out = [];
    const d = new Date();
    const wd = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    const mon = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    while (out.length < n) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0) continue;
      out.push({
        iso: d.toISOString().slice(0, 10), wd: wd[d.getDay()], d: d.getDate() + '/' + pad(d.getMonth() + 1),
        day: d.getDate(), mon: mon[d.getMonth()]
      });
    }
    return out;
  }

  /* ======================================================================
     Tour guiado pela rolagem (assets/js/tour.js)
     ====================================================================== */
  const T = window.AZTour.init(P, main.querySelector('.tour'));
  const goTo = T.goTo;

  /* ======================================================================
     Planta, comparação, radar, galeria, dock
     ====================================================================== */
  main.addEventListener('click', e => {
    const go = e.target.closest('.p-plan [data-go]');
    if (go) goTo(+go.dataset.go, true);
  });
  const planBig = main.querySelector('.plan--big');
  const planItems = [...main.querySelectorAll('.p-plan__list li')];
  const hiRoom = id => {
    planBig.querySelectorAll('.plan__room').forEach(g => g.classList.toggle('is-on', g.dataset.room === id));
    planItems.forEach(li => li.classList.toggle('is-on', li.dataset.room === id));
  };
  planItems.forEach(li => {
    li.addEventListener('pointerenter', () => hiRoom(li.dataset.room));
    li.addEventListener('focusin', () => hiRoom(li.dataset.room));
  });
  planBig.querySelectorAll('.plan__room').forEach(g => g.addEventListener('pointerenter', () => hiRoom(g.dataset.room)));
  main.querySelector('.p-plan__grid').addEventListener('pointerleave', () => hiRoom(null));

  // Resumo da visita escolhida, ao lado do botão de envio.
  const vform = main.querySelector('[data-vform]');
  const vsum = vform.querySelector('[data-vsum]');
  const paintSum = () => {
    const day = vform.querySelector('[name="dia"]:checked').dataset.label;
    const per = vform.querySelector('[name="periodo"]:checked').dataset.label;
    vsum.textContent = `${day} · ${per}`;
  };
  vform.addEventListener('change', paintSum);
  paintSum();

  const compare = main.querySelector('.compare');
  if (compare) {
    const range = compare.querySelector('.compare__range');
    range.addEventListener('input', () => compare.style.setProperty('--pos', range.value + '%'));
  }

  main.querySelectorAll('.p-loc__list li').forEach(li => {
    const pt = main.querySelector(`.radar__pt[data-pt="${li.dataset.pt}"]`);
    li.addEventListener('pointerenter', () => pt.classList.add('is-on'));
    li.addEventListener('pointerleave', () => pt.classList.remove('is-on'));
  });

  const dialog = main.querySelector('.lightbox');
  if (dialog) {
    const lbImg = dialog.querySelector('img');
    const lbCap = dialog.querySelector('.lightbox__cap');
    let gi = 0;
    const showGal = i => {
      gi = (i + galleryImgs.length) % galleryImgs.length;
      const g = galleryImgs[gi];
      lbImg.src = g.img.src; lbImg.alt = g.alt;
      lbCap.textContent = `${pad(gi + 1)} / ${pad(galleryImgs.length)} — ${g.alt}`;
    };
    main.querySelectorAll('[data-gal]').forEach(b => b.addEventListener('click', () => {
      showGal(+b.dataset.gal);
      dialog.showModal();
    }));
    dialog.querySelector('.lightbox__close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.lightbox__prev').addEventListener('click', () => showGal(gi - 1));
    dialog.querySelector('.lightbox__next').addEventListener('click', () => showGal(gi + 1));
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') showGal(gi + 1);
      if (e.key === 'ArrowLeft') showGal(gi - 1);
    });
  }

  const dockEl = document.querySelector('.dock');
  const nextEl = main.querySelector('.p-next');
  const dockLinks = [...dockEl.querySelectorAll('a[href^="#"]')];
  const dockTargets = dockLinks.map(a => document.querySelector(a.getAttribute('href')));
  function dockUpdate() {
    const tr = T.el.getBoundingClientRect();
    const pastTour = T.isStatic ? scrollY > innerHeight * .8 : tr.bottom < innerHeight * .5;
    const atEnd = nextEl.getBoundingClientRect().top < innerHeight * .7;
    dockEl.classList.toggle('is-on', pastTour && !atEnd);
    // O tour tem cabeçalho próprio: a barra do site só volta depois dele.
    document.body.toggleAttribute('data-nav-hide', !T.isStatic && tr.top <= 1 && tr.bottom >= innerHeight * .98);
    let cur = -1;
    dockTargets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < innerHeight * .4) cur = i; });
    dockLinks.forEach((a, i) => a.toggleAttribute('aria-current', i === cur));
  }
  addEventListener('scroll', dockUpdate, { passive: true });
  dockUpdate();
})();
