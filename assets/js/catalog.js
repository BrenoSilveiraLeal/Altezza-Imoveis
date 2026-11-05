/* Altezza — catálogo com filtros. */
(function () {
  'use strict';
  const { PROPERTIES } = window.ALTEZZA;
  const { cardHTML, favs, syncFavs, reveal } = window.AZ;

  const form = document.querySelector('[data-filters]');
  const grid = document.querySelector('[data-results]');
  const empty = document.querySelector('[data-empty]');
  const label = document.querySelector('[data-results-label]');
  const clearBtns = document.querySelectorAll('[data-clear]');
  const typesBox = document.querySelector('[data-types]');

  document.querySelector('[data-count-total]').textContent = PROPERTIES.length;

  const unique = key => [...new Set(PROPERTIES.map(p => p[key]))];
  form.querySelector('[data-fill="cidade"]').insertAdjacentHTML('beforeend',
    unique('cidade').map(c => `<option value="${c}">${c}</option>`).join(''));
  typesBox.innerHTML = ['Todos', ...unique('tipo')].map((t, i) =>
    `<label class="pill"><input type="radio" name="tipo" value="${i ? t : ''}" ${i ? '' : 'checked'}><span>${t}</span></label>`).join('');

  // Preenche os filtros a partir da URL (vindo da busca da página inicial).
  const params = new URLSearchParams(location.search);
  params.forEach((v, k) => {
    const el = form.elements[k];
    if (!el) return;
    if (el instanceof RadioNodeList) {
      [...el].forEach(r => { r.checked = r.value === v; });
    } else if (el.type === 'checkbox') el.checked = v === '1';
    else el.value = v;
  });

  const orderMenu = document.querySelector('[data-order-menu]');
  if (orderMenu) {
    const orderInput = orderMenu.querySelector('input[name="ordem"]');
    const trigger = orderMenu.querySelector('.fsel__trigger');
    const menu = orderMenu.querySelector('.fsel__menu');
    const choices = [
      ['', 'Destaques'],
      ['preco-asc', 'Menor valor'],
      ['preco-desc', 'Maior valor'],
      ['area-desc', 'Maior área']
    ];
    const close = () => { menu.hidden = true; trigger.setAttribute('aria-expanded', 'false'); };
    menu.innerHTML = choices.map(([value, title]) =>
      `<button type="button" role="option" class="fsel__option" data-value="${value}" aria-selected="${value === orderInput.value}" tabindex="-1">${title}<span aria-hidden="true">${value === orderInput.value ? '✓' : ''}</span></button>`
    ).join('');
    const sync = () => {
      const active = choices.find(([value]) => value === orderInput.value) || choices[0];
      trigger.querySelector('span').textContent = active[1];
      menu.querySelectorAll('[role="option"]').forEach(item => {
        const selected = item.dataset.value === orderInput.value;
        item.setAttribute('aria-selected', String(selected));
        item.lastElementChild.textContent = selected ? '✓' : '';
      });
    };
    trigger.addEventListener('click', () => {
      const open = menu.hidden;
      menu.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      if (open) menu.querySelector(`[data-value="${CSS.escape(orderInput.value)}"]`)?.focus();
    });
    menu.addEventListener('click', event => {
      const option = event.target.closest('[role="option"]');
      if (!option) return;
      orderInput.value = option.dataset.value;
      orderInput.dispatchEvent(new Event('input', { bubbles: true }));
      sync();
      close();
      trigger.focus();
    });
    menu.addEventListener('keydown', event => {
      const options = [...menu.querySelectorAll('[role="option"]')];
      const index = options.indexOf(document.activeElement);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        options[(index + (event.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length].focus();
      } else if (event.key === 'Escape') { close(); trigger.focus(); }
    });
    document.addEventListener('click', event => { if (!orderMenu.contains(event.target)) close(); });
    form.addEventListener('reset', () => requestAnimationFrame(sync));
    sync();
  }

  function state() {
    const fd = new FormData(form);
    return {
      q: (fd.get('q') || '').trim().toLowerCase(),
      tipo: fd.get('tipo') || '',
      cidade: fd.get('cidade') || '',
      preco: fd.get('preco') || '',
      suites: +fd.get('suites') || 0,
      ordem: fd.get('ordem') || '',
      favoritos: fd.get('favoritos') === '1'
    };
  }

  const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function apply(first) {
    const s = state();
    const [min, max] = s.preco ? s.preco.split('-').map(v => (v ? +v : null)) : [null, null];
    const favList = favs();
    let list = PROPERTIES.filter(p =>
      (!s.q || strip(`${p.nome} ${p.bairro} ${p.cidade} ${p.tipo}`).includes(strip(s.q))) &&
      (!s.tipo || p.tipo === s.tipo) &&
      (!s.cidade || p.cidade === s.cidade) &&
      (min == null || p.preco >= min) &&
      (max == null || p.preco <= max) &&
      (!s.suites || p.suites >= s.suites) &&
      (!s.favoritos || favList.includes(p.id))
    );
    if (s.ordem === 'preco-asc') list.sort((a, b) => a.preco - b.preco);
    if (s.ordem === 'preco-desc') list.sort((a, b) => b.preco - a.preco);
    if (s.ordem === 'area-desc') list.sort((a, b) => b.area - a.area);

    grid.innerHTML = list.map((p, i) => cardHTML(p, { reveal: true, delay: first ? .3 + (i % 3) * .08 : (i % 3) * .06 })).join('');
    empty.hidden = list.length > 0;
    const filtered = Boolean(s.q || s.tipo || s.cidade || s.preco || s.suites || s.favoritos);
    clearBtns.forEach(b => { b.hidden = !filtered && b.closest('.results__bar'); });
    label.textContent = filtered
      ? `${list.length} ${list.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`
      : `Mostrando todos os ${list.length} imóveis`;
    syncFavs();
    if (!first) reveal(grid);

    // Mantém a URL compartilhável, sem recarregar a página.
    const qs = new URLSearchParams();
    Object.entries(s).forEach(([k, v]) => { if (v && v !== 0) qs.set(k, v === true ? '1' : v); });
    history.replaceState(null, '', qs.toString() ? `?${qs}` : location.pathname);
  }

  let t = 0;
  form.addEventListener('input', e => {
    clearTimeout(t);
    t = setTimeout(() => apply(false), e.target.name === 'q' ? 180 : 0);
  });
  form.addEventListener('submit', e => e.preventDefault());
  clearBtns.forEach(b => b.addEventListener('click', () => {
    form.reset();
    apply(false);
  }));
  // Ao desmarcar um favorito com o filtro ligado, a lista se atualiza.
  document.addEventListener('altezza:favs', () => { if (state().favoritos) apply(false); });

  apply(true);
})();
