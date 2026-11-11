/* Altezza — "do desenho à chave": vídeo da obra controlado pela rolagem. */
(function () {
  'use strict';
  const { reduce } = window.AZ;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function markup(P) {
    const O = P.obra;
    if (!O) return '';
    const n = O.etapas.length;
    const caps = O.etapas.map((e, i) => `
      <div class="obra__cap" data-i="${i}">
        <h3 class="obra__title">${e.titulo}</h3>
        <p class="obra__text">${e.texto}</p>
      </div>`).join('');
    const ticks = O.etapas.map((e, i) => `<i style="left:${(i / (n - 1) * 100).toFixed(2)}%"></i>`).join('');
    return `
    <section class="obra on-night" id="obra" aria-labelledby="obra-title" data-nav-dark>
      <div class="obra__sticky">
        <video class="obra__video" muted playsinline preload="auto" poster="${O.poster}" aria-hidden="true"></video>
        <div class="obra__shade" aria-hidden="true"></div>
        <header class="obra__head">
          <p class="obra__kicker">Do desenho à chave</p>
          <h2 class="obra__h2" id="obra-title">Como a ${P.nome} foi construída</h2>
        </header>
        <div class="obra__caps" aria-live="polite">${caps}</div>
        <div class="obra__pill" aria-hidden="true">
          <span class="obra__step"><b>01</b> ${O.etapas[0].rotulo}</span>
          <span class="obra__bar"><span class="obra__fill"></span>${ticks}</span>
        </div>
        <p class="obra__hint" aria-hidden="true">Role para construir</p>
      </div>
    </section>`;
  }

  function init(main, P) {
    const sec = main.querySelector('#obra');
    if (!sec) return;
    const O = P.obra;
    const vid = sec.querySelector('.obra__video');
    const caps = [...sec.querySelectorAll('.obra__cap')];
    const step = sec.querySelector('.obra__step');
    const fill = sec.querySelector('.obra__fill');
    const hint = sec.querySelector('.obra__hint');
    let dur = 0, target = 0, raf = 0, shown = -1;

    // Navegadores de celular só deixam avançar o vídeo depois de um play; libera uma vez, sem som.
    let unlocked = false;
    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      const p = vid.play();
      if (p && p.then) p.then(() => vid.pause()).catch(() => {});
    };

    function progress() {
      const r = sec.getBoundingClientRect();
      return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
    }

    function paintCaps(t, p) {
      let on = -1;
      O.etapas.forEach((e, i) => { if (t >= e.de && t < e.ate) on = i; });
      caps.forEach((c, i) => c.classList.toggle('is-on', i === on));
      let idx = 0;
      O.etapas.forEach((e, i) => { if (t >= e.de) idx = i; });
      if (idx !== shown) {
        shown = idx;
        step.innerHTML = `<b>${String(idx + 1).padStart(2, '0')}</b> ${O.etapas[idx].rotulo}`;
      }
      fill.style.transform = `scaleX(${p.toFixed(4)})`;
      hint.classList.toggle('is-gone', p > .02);
    }

    // Para a frente o vídeo é tocado (mais rápido quanto mais longe estiver da rolagem):
    // decodificar em sequência é leve. Para trás, ou em saltos longos, ele salta para o
    // quadro-chave mais próximo, que abre na hora. KF = intervalo entre quadros-chave.
    const KF = O.quadroChave || 1 / 3;
    let lastSeek = -1;
    function tick() {
      raf = 0;
      if (!dur) return;
      paintCaps(target, target / dur);
      const t = vid.currentTime;
      const diff = target - t;
      if (Math.abs(diff) < .05) {
        if (!vid.paused) vid.pause();
        return;
      }
      if (diff > 0 && diff < 4) {
        vid.playbackRate = clamp(diff * 2.2, .5, 8);
        if (vid.paused) vid.play().catch(() => {});
      } else if (!vid.seeking) {
        if (!vid.paused) vid.pause();
        const k = Math.round(target / KF) * KF;
        if (k !== lastSeek) { lastSeek = k; vid.currentTime = clamp(k, 0, dur - .05); }
        else if (Math.abs(k - target) <= KF / 2 && Math.abs(diff) < KF) { return; }
      }
      raf = requestAnimationFrame(tick);
    }
    function onScroll() {
      if (reduce.matches || !dur) return;
      target = progress() * (dur - .05);
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function setup() {
      sec.classList.toggle('is-static', reduce.matches);
      if (reduce.matches) {
        vid.controls = true;
        caps.forEach(c => c.classList.add('is-on'));
      } else {
        vid.controls = false;
        onScroll();
      }
    }

    vid.addEventListener('loadedmetadata', () => { dur = vid.duration || 0; setup(); });

    // O vídeo inteiro vai para a memória antes de ser usado: assim cada salto da rolagem
    // é instantâneo, sem novo pedido ao servidor. Começa a baixar quando a seção se aproxima.
    let loading = false;
    const load = () => {
      if (loading) return;
      loading = true;
      fetch(O.video).then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
        .then(b => { vid.src = URL.createObjectURL(b); })
        .catch(() => { vid.src = O.video; });
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { load(); io.disconnect(); } }, { rootMargin: '150% 0px' });
      io.observe(sec);
    } else load();
    addEventListener('scroll', () => { unlock(); onScroll(); }, { passive: true });
    addEventListener('touchstart', unlock, { passive: true, once: true });
    addEventListener('resize', onScroll);
    reduce.addEventListener?.('change', setup);
    setup();
    paintCaps(0, 0);
  }

  window.AZObra = { markup, init };
})();
