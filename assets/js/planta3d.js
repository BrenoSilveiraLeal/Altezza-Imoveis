/* Altezza — planta em 3D: maquete isométrica que gira, montada a partir de P.plan.rooms.
   Cada cômodo mantém posição e proporção da planta; mobiliário é esquemático. */
(function () {
  'use strict';
  const reduce = window.AZ && window.AZ.reduce;

  function webgl() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  // Tipo do cômodo, a partir do nome: define piso, paredes e mobiliário.
  function kindOf(r) {
    const s = (r.id + ' ' + r.nome).toLowerCase();
    if (/jardim|piscina/.test(s)) return 'jardim';
    if (/clube/.test(s)) return 'clube';
    if (/banho/.test(s)) return 'banho';
    if (/cozinha/.test(s)) return 'cozinha';
    if (/su[ií]te/.test(s)) return 'suite';
    if (/bibliot/.test(s)) return 'biblioteca';
    if (/escada/.test(s)) return 'escada';
    if (/hall/.test(s)) return 'hall';
    if (/servi/.test(s)) return 'servico';
    if (/estar|living/.test(s)) return 'sala';
    if (/jantar/.test(s)) return 'jantar';
    if (/terra|varanda|deck/.test(s)) return 'varanda';
    return 'sala';
  }
  const OUTDOOR = { jardim: 1, clube: 1, varanda: 1 };

  const FLOOR = {
    sala: 0xcdb28a, jantar: 0xcdb28a, suite: 0xc4a47a, biblioteca: 0xb08a62, hall: 0xd7cdb8,
    cozinha: 0xdad4c6, banho: 0xdcd8cf, servico: 0xd3cec2, escada: 0xcdb28a,
    varanda: 0xb48d62, jardim: 0x6f9158, clube: 0x6f9158
  };
  const ACCENT = 0xc3cf62;

  function init(box, P) {
    const THREE = window.THREE;
    if (!THREE || !webgl()) return null;
    const rooms = P.plan.rooms;

    /* ---------- cena ---------- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    const canvas = renderer.domElement;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Maquete 3D da planta de ${P.nome}. Arraste para girar.`);
    canvas.tabIndex = 0;
    box.appendChild(canvas);

    if (THREE.ACESFilmicToneMapping) { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .82; }

    /* Paleta do imóvel: cores e texturas vêm dos materiais cadastrados (P.materiais). */
    const hex = s => parseInt(String(s).replace('#', ''), 16);
    const mats0 = P.materiais || [];
    const find = re => mats0.find(m => re.test(m.nome.toLowerCase()));
    const mWood = find(/freij|cumaru|carvalho|nogueira|madeira/), mStone = find(/travertino|concreto|terracota|taipa/),
      mFab = find(/linho/), mLeather = find(/couro/), mSteel = find(/a[cç]o|lat[aã]o/);
    const PAL = {
      wood: mWood ? hex(mWood.cor) : 0xb98a5c,
      stone: mStone ? hex(mStone.cor) : 0xd7cdb8,
      fabric: mFab ? hex(mFab.cor) : 0xe9e2d2,
      leather: mLeather ? hex(mLeather.cor) : 0x9a5b33,
      dark: mSteel && /a[cç]o/.test(mSteel.nome.toLowerCase()) ? 0x24241f : 0x2f2d29
    };
    const loader = new THREE.TextureLoader();
    const texCache = {};
    function tex(m, rx, ry) {
      if (!m || !m.img) return null;
      const src = typeof m.img === 'string' ? m.img : (m.img.src || m.img.l || '');
      if (!src) return null;
      const t = loader.load(src, () => setTimeout(() => { dirty = true; kick(); }));
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
      if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
      if (renderer.capabilities && renderer.capabilities.getMaxAnisotropy) t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return t;
    }

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(32, 1, 1, 600);
    scene.add(new THREE.HemisphereLight(0xfff4e2, 0x2f3229, .62));
    const fill = new THREE.DirectionalLight(0xbfd2ff, .22);
    fill.position.set(80, 60, -60); scene.add(fill);
    const sun = new THREE.DirectionalLight(0xffe2b8, 1.35);
    sun.position.set(-70, 130, 80);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -85, right: 85, top: 85, bottom: -85, near: 10, far: 360 });
    sun.shadow.bias = -.0006;
    scene.add(sun);

    const mats = {};
    const mat = (c, o) => {
      const k = c + (o ? JSON.stringify(o) : '');
      return mats[k] || (mats[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .88, metalness: 0 }, o || {})));
    };
    const CX = 50, CZ = 32; // centro da planta (100 x 64)
    const roomGroups = {};
    const floors = {};
    const labels = {};

    function mesh(g, w, h, d, x, y, z, color, opt, geo) {
      const m = new THREE.Mesh(geo || new THREE.BoxGeometry(w, h, d), typeof color === 'object' && color.isMaterial ? color : mat(color, opt));
      m.position.set(x, y + h / 2, z);
      m.castShadow = true; m.receiveShadow = true;
      g.add(m);
      return m;
    }

    /* ---------- base ---------- */
    const slab = new THREE.Mesh(new THREE.BoxGeometry(110, 2.2, 74), mat(0x0d0e0b));
    slab.position.set(0, -1.1, 0); slab.receiveShadow = true; scene.add(slab);
    const rim = new THREE.Mesh(new THREE.BoxGeometry(110.6, .5, 74.6), mat(0x2a2d24));
    rim.position.set(0, .05, 0); rim.receiveShadow = true; scene.add(rim);

    /* ---------- decoração fiel às fotos ---------- */
    const C = {
      olive: 0x6f7243, linen: 0xe6dfd0, white: 0xf3f0ea, cream: 0xe9e1cf, caramel: 0x9a5b33, black: 0x1f1e1c,
      oak: 0xc49a6c, walnut: 0x6b4630, travertine: 0xd9cbb2, bronze: 0x8c6a3f, brass: 0xb9904f, marble: 0x3f5546,
      terracotta: 0xb4643e, jute: 0xb99c6c, grey: 0x9a9893, darkgrey: 0x55554f, concrete: 0xa7a39b, cumaru: 0x8a5a33,
      freijo: 0xa77a4f, rush: 0xb5925c, earth: 0xc2a27f, steel: 0xb8bcbf, leaf: 0x3f6a35, sage: 0x7d8a5a,
      water: 0x2f8f9a, darkwater: 0x1f5f5a, mustard: 0xc9a13b, pink: 0xd8a5a8, sand: 0xe4d6b8, charcoal: 0x2a2a28
    };
    const col = c => typeof c === 'number' ? c : (C[c] != null ? C[c] : 0xcccccc);
    const M = (c, o) => mat(col(c), o);
    function canvasTex(size, draw, rx, ry) {
      const cv = document.createElement('canvas'); cv.width = cv.height = size;
      draw(cv.getContext('2d'), size);
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx || 1, ry || 1);
      if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
      return t;
    }
    const hexs = n => '#' + n.toString(16).padStart(6, '0');
    const shade = (n, k) => { const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; const f = v => Math.max(0, Math.min(255, Math.round(v * k))); return (f(r) << 16) | (f(g) << 8) | f(b); };
    function herring(c, rx, ry) {
      return canvasTex(256, (x, s) => {
        x.fillStyle = hexs(shade(c, .8)); x.fillRect(0, 0, s, s);
        const L = 64, W = 16;
        for (let i = -s; i < 2 * s; i += W * 2) for (let j = -s; j < 2 * s; j += L) {
          [[0, 1], [1, -1]].forEach(([o, d], k) => {
            x.save(); x.translate(i + o * W, j + o * W); x.rotate(d * Math.PI / 4);
            x.fillStyle = hexs(shade(c, .86 + ((i * 7 + j * 3 + k * 5) % 23) / 100)); x.fillRect(0, 0, L - 2, W - 2); x.restore();
          });
        }
      }, rx, ry);
    }
    function planks(c, rx, ry, vertical) {
      return canvasTex(256, (x, s) => {
        const n = 8;
        for (let i = 0; i < n; i++) {
          x.fillStyle = hexs(shade(c, .92 + (i * 37 % 17) / 160));
          if (vertical) x.fillRect(i * s / n, 0, s / n - 2, s); else x.fillRect(0, i * s / n, s, s / n - 2);
          x.fillStyle = 'rgba(0,0,0,.06)';
          for (let k = 0; k < 6; k++) { const p = (i * 53 + k * 41) % s; if (vertical) x.fillRect(i * s / n + 4, p, s / n - 10, 1); else x.fillRect(p, i * s / n + 4, 1, s / n - 10); }
        }
      }, rx, ry);
    }
    function tiles(c, rx, ry, grout) {
      return canvasTex(256, (x, s) => {
        x.fillStyle = grout || hexs(shade(c, .7)); x.fillRect(0, 0, s, s);
        const n = 4, g = 3;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { x.fillStyle = hexs(shade(c, .9 + ((i * 3 + j * 5) % 7) / 40)); x.fillRect(i * s / n + g, j * s / n + g, s / n - 2 * g, s / n - 2 * g); }
      }, rx, ry);
    }
    function speckle(c, rx, ry, k) {
      return canvasTex(256, (x, s) => {
        x.fillStyle = hexs(c); x.fillRect(0, 0, s, s);
        for (let i = 0; i < 2200; i++) { const v = (i * 9301 + 49297) % 233280 / 233280; x.fillStyle = `rgba(${v > .5 ? '255,255,255' : '0,0,0'},${(k || .05) * v})`; x.fillRect((i * 73) % s, (i * 151) % s, 2 + (i % 3), 1 + (i % 2)); }
        for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(0,0,0,.035)'; x.fillRect(0, (i * 29) % s, s, 2); }
      }, rx, ry);
    }
    function floorMat(f, w, h) {
      const rx = Math.max(1, w / 12), ry = Math.max(1, h / 12);
      const o = { roughness: .75 };
      if (f === 'stone') { const t = tex(mStone && /travert/i.test(mStone.nome) ? mStone : null, rx, ry); return new THREE.MeshStandardMaterial(Object.assign(o, { color: t ? 0xffffff : C.travertine, map: t || speckle(C.travertine, rx, ry), roughness: .5 })); }
      if (f === 'wood') { const t = tex(mWood, rx, ry); return new THREE.MeshStandardMaterial(Object.assign(o, { color: t ? 0xffffff : PAL.wood, map: t || planks(PAL.wood, rx, ry) })); }
      if (f === 'oak') return new THREE.MeshStandardMaterial(Object.assign(o, { color: 0xffffff, map: planks(C.oak, rx, ry) }));
      if (f === 'herring') return new THREE.MeshStandardMaterial(Object.assign(o, { color: 0xffffff, map: herring(0x9a6e48, rx * 2.4, ry * 2.4) }));
      if (f === 'tile') return new THREE.MeshStandardMaterial(Object.assign(o, { color: 0xffffff, map: tiles(C.terracotta, rx * 2, ry * 2) }));
      if (f === 'bath') return new THREE.MeshStandardMaterial(Object.assign(o, { color: 0xffffff, map: tiles(0xded3bf, rx * 1.5, ry * 1.5, '#cfc3ad'), roughness: .4 }));
      if (f === 'deck') return new THREE.MeshStandardMaterial(Object.assign(o, { color: 0xffffff, map: planks(0xb98c5a, rx * 1.4, ry * 1.4, true) }));
      if (f === 'grass') return new THREE.MeshStandardMaterial({ color: 0xffffff, map: speckle(0x6a8250, rx, ry, .22), roughness: 1 });
      if (f === 'concrete') return new THREE.MeshStandardMaterial(Object.assign(o, { color: 0xffffff, map: speckle(C.concrete, rx, ry, .08) }));
      return new THREE.MeshStandardMaterial({ color: col(f), roughness: .8 });
    }
    function wallMat(w) {
      if (w === 'wood') return new THREE.MeshStandardMaterial({ color: 0xffffff, map: planks(0xb48654, 3, 1, true), roughness: .7 });
      if (w === 'walnut') return new THREE.MeshStandardMaterial({ color: 0xffffff, map: planks(C.walnut, 3, 1, true), roughness: .7 });
      if (w === 'earth') return new THREE.MeshStandardMaterial({ color: 0xffffff, map: canvasTex(128, (x, s) => { for (let i = 0; i < 16; i++) { x.fillStyle = hexs(shade(C.earth, .88 + (i * 7 % 11) / 50)); x.fillRect(0, i * s / 16, s, s / 16); } }, 2, 1), roughness: .95 });
      if (w === 'concrete') return new THREE.MeshStandardMaterial({ color: 0xffffff, map: speckle(C.concrete, 2, 1, .1), roughness: .95 });
      if (w === 'stone') return new THREE.MeshStandardMaterial({ color: 0xffffff, map: speckle(C.travertine, 2, 1, .06), roughness: .6 });
      return new THREE.MeshStandardMaterial({ color: col(w), roughness: .9 });
    }
    const artTex = {};
    function art(name) {
      if (artTex[name]) return artTex[name];
      const t = loader.load(`assets/img/planta/arte/${name}.jpg?v=1`, () => setTimeout(() => { dirty = true; kick(); }));
      if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
      return (artTex[name] = t);
    }

    // primitivas no grupo p, com y = base
    const B = (p, w, h, d, x, y, z, c, o) => mesh(p, w, h, d, x, y, z, c && c.isMaterial ? c : col(c), o);
    const Cy = (p, rt, rb, h, x, y, z, c, seg, o) => mesh(p, 0, h, 0, x, y, z, col(c), o, new THREE.CylinderGeometry(rt, rb, h, seg || 20));
    const Ball = (p, r, x, y, z, c, sx, sy, sz) => {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), new THREE.MeshStandardMaterial({ color: col(c), roughness: .85, flatShading: true }));
      m.position.set(x, y, z); m.scale.set(sx || 1, sy || 1, sz || 1); m.castShadow = true; m.receiveShadow = true; p.add(m); return m;
    };
    const glow = (c, i) => new THREE.MeshStandardMaterial({ color: col(c), emissive: 0xffc98a, emissiveIntensity: i || .9, roughness: .6 });

    const D = {
      sofa(p, o) {
        const L = o.len || 9, d = 3.4, c = o.c || 'linen', cush = shade(col(c), 1.04);
        const mod = (q, l) => {
          B(q, l, .4, d, 0, .15, 0, shade(col(c), .8));
          B(q, l, 1.0, d, 0, .4, 0, c);
          B(q, l, 1.6, 1, 0, .6, -d / 2 + .5, c);
          const n = Math.max(1, Math.round(l / 3));
          for (let i = 0; i < n; i++) { B(q, l / n - .2, .45, d - 1.2, -l / 2 + (i + .5) * l / n, 1.4, .45, cush); B(q, l / n - .4, 1.3, .55, -l / 2 + (i + .5) * l / n, 1.4, -d / 2 + 1.2, cush); }
        };
        if (o.curved) {
          const R = L * .9, n = 5;
          for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) * (L / R) / n; const q = new THREE.Group(); q.position.set(R * Math.sin(a), 0, -R * (1 - Math.cos(a))); q.rotation.y = -a; p.add(q); mod(q, L / n + .25); }
          return;
        }
        mod(p, L);
        if (!o.noArms) { B(p, .8, 1.9, d, -L / 2 - .4, .15, 0, c); B(p, .8, 1.9, d, L / 2 + .4, .15, 0, c); }
        if (o.l) { const q = new THREE.Group(); q.position.set(-L / 2 + d / 2, 0, d / 2 + o.l / 2); q.rotation.y = -Math.PI / 2; p.add(q); mod(q, o.l); }
        if (o.throwC) B(p, 1.6, .12, d - .6, L / 2 - 1.3, 1.85, .2, o.throwC);
        (o.pillows || []).forEach((pc, i) => B(p, 1.1, 1, .35, -L / 2 + 1 + i * 1.4, 1.85, -d / 2 + 1.1, pc));
      },
      armchair(p, o) {
        const c = o.c || 'white', f = o.frame;
        if (f) { [-1, 1].forEach(s => { B(p, .15, 2.2, 3, s * 1.45, 0, 0, f); B(p, .15, .15, 3, s * 1.45, 1.6, 0, f); }); }
        B(p, 3, .9, 2.8, 0, .55, .1, c); B(p, 3, 1.7, .55, 0, 1.2, -1.2, c);
        if (!f) { B(p, .5, 1.5, 2.8, -1.5, .35, .1, c); B(p, .5, 1.5, 2.8, 1.5, .35, .1, c); }
        if (o.legs) [[-1.2, -1], [1.2, -1], [-1.2, 1.1], [1.2, 1.1]].forEach(([x, z]) => Cy(p, .08, .06, .55, x, 0, z, o.legs, 6));
      },
      lounge(p, o) { // poltrona de couro reclinada
        const c = o.c || 'caramel';
        B(p, 2.6, .5, 2.6, 0, .6, 0, c).rotation.x = .12; const b = B(p, 2.6, 2, .45, 0, .9, -1.2, c); b.rotation.x = -.35;
        [-1.2, 1.2].forEach(x => B(p, .25, 1.2, 2.8, x, .2, 0, o.wood || 'walnut'));
      },
      coffee(p, o) {
        const s = o.s || 4.5, c = o.c || 'travertine';
        if (o.shape === 'round') { Cy(p, s / 2, s / 2, .25, 0, 1.15, 0, c, 32); Cy(p, s / 2.6, s / 2.4, 1.15, 0, 0, 0, o.base || c, 24); }
        else if (o.shape === 'block') B(p, s * 1.3, 1.3, s * .8, 0, 0, 0, c);
        else { B(p, s, .35, s, 0, 1, 0, c); B(p, s * .6, 1, s * .6, 0, 0, 0, o.base || c); }
        const top = o.shape === 'block' ? 1.3 : (o.shape === 'round' ? 1.4 : 1.35);
        if (o.bowl) Cy(p, .7, .4, .35, 0, top, 0, o.bowl, 16);
        if (o.vases) { Cy(p, .3, .35, .9, -.6, top, -.3, 'walnut', 12); Cy(p, .25, .3, .6, -.1, top, .2, 'walnut', 12); Cy(p, .22, .28, .7, .35, top, -.4, 'terracotta', 12); }
        if (o.books) { B(p, 1.6, .2, 1.1, s * .3, top, .3, 'cream'); B(p, 1.4, .2, 1, s * .3, top + .2, .3, 'charcoal'); }
      },
      side(p, o) { Cy(p, .9, .9, .12, 0, 1.6, 0, o.c || 'black', 24); Cy(p, .08, .08, 1.6, 0, 0, 0, o.c || 'black', 8); Cy(p, .5, .5, .1, 0, 0, 0, o.c || 'black', 16); if (o.lamp) D.tlamp(p, { c: o.lamp, y: 1.72 }); },
      rug(p, o) { B(p, o.w || 10, .06, o.d || 7, 0, 0, 0, o.c || 'cream').castShadow = false; },
      tlamp(p, o) { const y = o.y || 0; Cy(p, .45, .55, 1, 0, y, 0, o.c || 'terracotta', 14); Cy(p, .75, .9, .8, 0, y + 1.2, 0, null, 16).material = glow('cream', .7); },
      flamp(p, o) { // luminária de piso
        Cy(p, .6, .6, .1, 0, 0, 0, o.c || 'bronze', 16); Cy(p, .06, .06, 4.6, 0, 0, 0, o.c || 'bronze', 8);
        if (o.paper) { Cy(p, .7, .7, 3.2, 0, .3, 0, null, 16).material = glow('white', .6); return; }
        B(p, .8, .12, .12, .4, 4.6, 0, o.c || 'bronze'); Cy(p, .4, .5, .5, .8, 4.2, 0, o.c || 'bronze', 12);
      },
      pendant(p, o) {
        const y = H - .2, k = o.kind || 'drum', n = o.n || 1, gap = o.gap || 2.6;
        for (let i = 0; i < n; i++) {
          const x = (i - (n - 1) / 2) * gap; const drop = o.drop || 2.4;
          Cy(p, .03, .03, drop, x, y - drop, 0, 'black', 4);
          const g = k === 'paper' ? Ball(p, 1.4, x, y - drop - .9, 0, 'white', 1.2, .8, 1.2) : k === 'rattan' ? Cy(p, .3, 1.1, 1.5, x, y - drop - 1.5, 0, 'rush', 16) : Cy(p, .9, .9, .5, x, y - drop - .5, 0, o.c || 'bronze', 20);
          if (k === 'paper') g.material = glow('white', .5);
          Cy(p, .5, .5, .05, x, y - drop - (k === 'rattan' ? 1.55 : .55), 0, null, 16).material = glow('cream', 1.2);
        }
      },
      bed(p, o) {
        const w = o.w || 6.5, L = o.len || 8, lo = o.low ? .45 : 1;
        B(p, w + (o.low ? 1.2 : .3), lo, L + (o.low ? 1 : .2), 0, 0, 0, o.base || 'oak');
        B(p, w, .9, L - .3, 0, lo, .1, 'white');
        B(p, w + .1, .45, L * .62, 0, lo + .75, L * .17, o.linen || 'white');
        for (let i = 0; i < (o.pillows || 2); i++) B(p, w / (o.pillows || 2) - .3, .6, 1.2, -w / 2 + (i + .5) * w / (o.pillows || 2), lo + .9, -L / 2 + 1, o.pillowC || 'cream');
        if (o.throwC) { B(p, w + .2, .14, 1.8, 0, lo + 1.2, L / 2 - 1.6, o.throwC); if (o.stripe) B(p, w + .22, .15, .3, 0, lo + 1.21, L / 2 - 1.6, o.stripe); }
        if (o.head) B(p, o.headW || w + 1, o.headH || 3.2, .5, 0, 0, -L / 2 - .25, o.head);
      },
      night(p, o) { B(p, o.w || 1.8, o.h || 1.6, 1.6, 0, 0, 0, o.c || 'oak'); if (o.lamp) D.tlamp(p, { c: o.lamp, y: o.h || 1.6 }); if (o.vase) Cy(p, .25, .3, .6, .4, o.h || 1.6, 0, o.vase, 10); if (o.reading) { Cy(p, .05, .05, 2.4, -.5, o.h || 1.6, -.4, o.reading, 6); B(p, .9, .08, .08, -.1, (o.h || 1.6) + 2.4, -.4, o.reading); } },
      bench(p, o) { B(p, o.len || 5, .55, o.d || 1.6, 0, 1, 0, o.c || 'caramel'); [-1, 1].forEach(s => B(p, .15, 1, (o.d || 1.6) - .2, s * ((o.len || 5) / 2 - .3), 0, 0, o.legs || 'black')); },
      table(p, o) {
        const c = o.c || 'oak', n = o.chairs || 0, cc = o.chairC || 'rush';
        if (o.kind === 'round') {
          const r = o.r || 2.6; Cy(p, r, r, .25, 0, 2.3, 0, c, 36); Cy(p, r * .45, r * .55, 2.3, 0, 0, 0, o.base || c, 24);
          for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const q = new THREE.Group(); q.position.set(Math.sin(a) * (r + 1), 0, Math.cos(a) * (r + 1)); q.rotation.y = a + Math.PI; p.add(q); D.chair(q, { c: cc, legs: o.legs }); }
        } else {
          const L = o.len || 10, W = o.wid || 3.6; B(p, L, .3, W, 0, 2.3, 0, c);
          if (o.base === 'trestle') [-1, 1].forEach(s => B(p, .5, 2.3, W - .8, s * (L / 2 - 1.2), 0, 0, c)); else [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => B(p, .3, 2.3, .3, sx * (L / 2 - .4), 0, sz * (W / 2 - .4), o.legsC || c));
          const per = Math.max(1, Math.floor(n / 2));
          for (let i = 0; i < per; i++) { const x = -L / 2 + (i + .5) * L / per; [-1, 1].forEach(s => { const q = new THREE.Group(); q.position.set(x, 0, s * (W / 2 + .9)); q.rotation.y = s > 0 ? Math.PI : 0; p.add(q); D.chair(q, { c: cc, legs: o.legs }); }); }
          if (o.settings) for (let i = 0; i < per; i++) [-1, 1].forEach(s => Cy(p, .45, .45, .05, -L / 2 + (i + .5) * L / per, 2.6, s * (W / 2 - .7), 'cream', 16));
          if (o.vase) { Cy(p, .3, .45, .9, 0, 2.6, 0, o.vase, 12); Ball(p, .6, 0, 3.9, 0, 'leaf', 1, 1.2, 1); }
          if (o.bowl) Cy(p, .9, .5, .35, 0, 2.6, 0, o.bowl, 16);
        }
      },
      chair(p, o) {
        const c = o.c || 'rush';
        B(p, 1.5, .25, 1.5, 0, 1.5, 0, c); B(p, 1.5, 1.6, .22, 0, 1.6, -.65, c);
        const lg = o.legs || (c === 'white' || c === 'grey' ? 'black' : shade(col(c), .7));
        [[-.6, -.6], [.6, -.6], [-.6, .6], [.6, .6]].forEach(([x, z]) => B(p, .12, 1.5, .12, x, 0, z, lg));
      },
      stools(p, o) { const n = o.n || 3; for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * (o.gap || 2); Cy(p, .55, .55, .22, x, 2.4, 0, o.c || 'walnut', 16); [-1, 1].forEach(s => B(p, .1, 2.4, .1, x + s * .35, 0, 0, o.c || 'walnut')); } },
      island(p, o) {
        const L = o.len || 8, W = o.wid || 2.8;
        B(p, L, 2.5, W, 0, 0, 0, o.base || 'walnut'); B(p, L + .3, .3, W + .3, 0, 2.5, 0, o.top || 'travertine');
        if (o.grill) { B(p, 2.6, .12, 1.6, L * .2, 2.8, 0, 'steel'); for (let i = 0; i < 6; i++) B(p, .08, .05, 1.4, L * .2 - 1.1 + i * .44, 2.93, 0, 'charcoal'); }
        if (o.sink) B(p, 1.4, .1, 1, -L * .25, 2.81, 0, 'charcoal');
        if (o.fruit) { Cy(p, .8, .5, .3, L * .15, 2.8, 0, 'walnut', 14); Ball(p, .3, L * .15, 3.2, 0, 'mustard'); }
        if (o.stools) { const q = new THREE.Group(); q.position.set(0, 0, W / 2 + 1.2); p.add(q); D.stools(q, { n: o.stools, c: o.stoolC, gap: L / (o.stools + .5) }); }
      },
      run(p, o) { // bancada encostada na parede (local: costas em -z)
        const L = o.len || 10;
        B(p, L, 2.5, 2.2, 0, 0, 0, o.base || 'walnut'); B(p, L, .25, 2.4, 0, 2.5, .1, o.top || 'travertine');
        if (o.back) B(p, L, 2.6, .12, 0, 2.75, -1.05, o.back === 'tile' ? new THREE.MeshStandardMaterial({ color: 0xffffff, map: tiles(C.terracotta, L / 3, 1) }) : o.back);
        if (o.upper === 'shelves') [0, 1].forEach(i => { B(p, L * .7, .15, 1, -L * .1, 3.6 + i * 1.1, -.6, o.shelfC || o.base || 'walnut'); for (let k = 0; k < 5; k++) Cy(p, .3, .25, .45, -L * .4 + k * L * .14, 3.75 + i * 1.1, -.6, k % 2 ? 'cream' : 'sand', 10); });
        if (o.upper === 'cabinets') B(p, L, 2, 1.2, 0, 3.6, -.5, o.base || 'walnut');
        if (o.cooktop) B(p, 2, .06, 1.4, L * .25, 2.76, .1, 'charcoal');
        if (o.sink) B(p, 1.6, .06, 1.2, -L * .2, 2.76, .1, 'steel');
        if (o.fridge) B(p, 2.6, 5.6, 2.3, -L / 2 - 1.4, 0, 0, 'steel');
        if (o.plant) { Cy(p, .35, .3, .7, L * .4, 2.75, 0, 'terracotta', 10); Ball(p, .7, L * .4, 3.9, 0, 'leaf', 1, 1.1, 1); }
      },
      books(p, o) { // estante (costas em -z)
        const L = o.len || 8, h = o.h || 5.6, c = o.c || 'walnut', rows = Math.round(h / 1.1);
        B(p, L, h, .2, 0, 0, -.6, c); [-1, 1].forEach(s => B(p, .2, h, 1.3, s * L / 2, 0, 0, c));
        const cols = [0xd8cdb5, 0x6b4630, 0x2f2d29, 0xb4643e, 0x8d8d88, 0xe9e1cf, 0x55554f];
        for (let r = 0; r < rows; r++) { B(p, L, .15, 1.3, 0, r * h / rows, 0, c); let x = -L / 2 + .3; let k = r * 3; while (x < L / 2 - .6) { const w = .18 + (k % 4) * .06, bh = .6 + (k % 3) * .12; if ((k % 9) === 4) { Cy(p, .25, .3, .5, x + .3, r * h / rows + .15, 0, cols[k % 7], 10); x += .8; } else { B(p, w, bh, .9, x, r * h / rows + .15, 0, cols[k % 7]); x += w + .03; } k++; } }
      },
      tv(p, o) { B(p, o.len || 7, 1.4, 1.5, 0, 0, 0, o.c || 'black'); if (!o.noTv) B(p, 4.5, 2.5, .15, 0, 2.8, -.4, 'charcoal'); if (o.deco) { Cy(p, .3, .4, .8, -2.4, 1.4, 0, 'cream', 12); B(p, 1.2, .2, .9, 2, 1.4, 0, 'charcoal'); } },
      console(p, o) { B(p, o.len || 6, 2.2, 1.4, 0, 0, 0, o.c || 'oak'); if (o.lamp) D.tlamp(p, { c: o.lamp, y: 2.2 }); if (o.vase) { Cy(p, .3, .4, 1, 1.8, 2.2, 0, o.vase, 12); Ball(p, .6, 1.8, 3.6, 0, 'leaf', .8, 1.4, .8); } if (o.bowl) Cy(p, .7, .4, .3, -1.6, 2.2, 0, o.bowl, 14); },
      tub(p, o) { const L = o.len || 5, W = o.wid || 2.6, c = o.c || 'travertine'; B(p, L, 1.9, W, 0, 0, 0, c); B(p, L - .7, .1, W - .7, 0, 1.75, 0, 0xcfe6e6, { roughness: .1 }); },
      vanity(p, o) {
        const L = o.len || 5; B(p, L, 1.6, 1.8, 0, 1.2, 0, o.c || 'walnut'); B(p, L + .1, .35, 2, 0, 2.8, 0, o.top || 'travertine'); B(p, 1.4, .1, 1, -L * .2, 3.15, 0, 'white');
        Cy(p, .05, .05, .7, -L * .2, 3.15, -.7, 'brass', 6);
        if (o.mirror === 'round') { const m = Cy(p, 1.7, 1.7, .08, -L * .1, 4.4, -.85, 0xcfd8da, 40, { roughness: .05, metalness: .6 }); m.rotation.x = Math.PI / 2; } else if (o.mirror) B(p, L - .6, 2.2, .1, 0, 3.6, -.85, 0xcfd8da, { roughness: .05, metalness: .6 });
        if (o.vase) { Cy(p, .3, .45, .9, L * .3, 3.15, 0, o.vase, 12); for (let i = 0; i < 4; i++) B(p, .05, 1.8, .05, L * .3 + (i - 1.5) * .2, 4, 0, 'leaf').rotation.z = (i - 1.5) * .25; }
      },
      shower(p, o) { B(p, .1, 5, o.len || 4, 0, 0, 0, 0xcfe6e6, { transparent: true, opacity: .3, roughness: .05 }).castShadow = false; Cy(p, .5, .5, .06, -1, 5.2, 0, 'brass', 16); },
      toilet(p, o) { B(p, 1.3, 1.4, 1.9, 0, 0, 0, 'white'); B(p, 1.3, .8, .5, 0, 1.4, -.7, 'white'); },
      curtain(p, o) { const L = o.len || 6, n = Math.round(L / .5); for (let i = 0; i < n; i++) B(p, .45, H - .6, .18, -L / 2 + i * L / n, 0, (i % 2) * .15, 0xf4efe6, { transparent: true, opacity: .7, roughness: 1 }).castShadow = false; },
      plant(p, o) {
        const s = o.s || 1, pot = o.pot || 'stone', k = o.kind || 'olive';
        const potC = { stone: 0xb9b0a0, terracotta: C.terracotta, basket: 0xb08b5a, travertine: C.travertine, concrete: C.concrete, black: C.charcoal, white: 0xece7de }[pot] || col(pot);
        const ph = (o.potH || 1.4) * s;
        if (pot !== 'none') Cy(p, .75 * s * (o.potW || 1), .6 * s * (o.potW || 1), ph, 0, 0, 0, potC, 18);
        const y0 = pot === 'none' ? 0 : ph;
        if (k === 'olive' || k === 'tree') {
          const th = (k === 'tree' ? 3.6 : 2.6) * s; Cy(p, .12 * s, .2 * s, th, 0, y0, 0, 0x6b5640, 6);
          const fc = k === 'olive' ? 'sage' : 'leaf';
          [[0, 0, 0, 1.3], [.8, -.3, .4, 1], [-.7, .2, -.3, 1], [.2, .6, .8, .9], [-.3, .5, -.8, .9]].forEach(([dx, dy, dz, r]) => Ball(p, r * s, dx * s, y0 + th + dy * s, dz * s, fc, 1.1, .85, 1.1));
        } else if (k === 'fiddle') {
          Cy(p, .08 * s, .1 * s, 4.4 * s, 0, y0, 0, 0x5b4632, 6);
          for (let i = 0; i < 16; i++) { const a = i * 2.4, h = y0 + (1.4 + (i % 8) * .42) * s, r = (.5 + (i % 3) * .25) * s; Ball(p, .55 * s, Math.cos(a) * r, h, Math.sin(a) * r, i % 2 ? 'leaf' : 0x2f5a2a, 1, 1.3, .35).rotation.y = a; }
        } else if (k === 'palm') {
          const th = 5 * s; Cy(p, .25 * s, .35 * s, th, 0, y0, 0, 0x8a7458, 8);
          for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; const f = B(p, .35 * s, .08, 3.2 * s, Math.cos(a) * 1.4 * s, y0 + th - .2, Math.sin(a) * 1.4 * s, 0x4c7a3a); f.rotation.y = -a + Math.PI / 2; f.rotation.x = .45; }
        } else if (k === 'monstera' || k === 'fern') {
          const n = k === 'fern' ? 14 : 9;
          for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = (k === 'fern' ? .8 : .9) * s; Ball(p, (k === 'fern' ? .45 : .7) * s, Math.cos(a) * r, y0 + (.4 + (i % 3) * .35) * s, Math.sin(a) * r, k === 'fern' ? 0x5d8a3f : 0x2f6131, 1.3, .35, 1).rotation.y = -a; }
        } else if (k === 'branch') {
          for (let i = 0; i < 5; i++) { const b = Cy(p, .03, .04, 2.2 * s, 0, y0, 0, 0x5b4632, 4); b.rotation.z = (i - 2) * .22; Ball(p, .3 * s, (i - 2) * .45 * s, y0 + 2 * s, 0, 'leaf', 1, .6, 1); }
        } else if (k === 'eucalyptus') {
          const th = 7 * s; Cy(p, .5 * s, .8 * s, th, 0, y0, 0, 0xcfc4b1, 8);
          [[0, 0, 0, 3], [2, -1, 1, 2.2], [-2, -.5, -1, 2.2], [.5, 1.2, 1.8, 2], [-.8, .8, -2, 2]].forEach(([dx, dy, dz, r]) => Ball(p, r * s, dx * s, y0 + th + dy * s, dz * s, 0x55743f, 1.1, .8, 1.1));
        }
      },
      pool(p, o) {
        const w = o.w || 16, d = o.d || 6;
        B(p, w + 1.4, .3, d + 1.4, 0, 0, 0, o.edge || 'travertine');
        B(p, w, .32, d, 0, .02, 0, new THREE.MeshStandardMaterial({ color: col(o.c || 'water'), roughness: .08, metalness: .1, transparent: true, opacity: .92, emissive: col(o.c || 'water'), emissiveIntensity: .12 })).castShadow = false;
      },
      lounger(p, o) { const c = o.c || 'white'; B(p, 2, .7, 5.4, 0, .15, 0, o.frame || 'oak'); B(p, 1.9, .35, 3.6, 0, .85, .8, c); const b = B(p, 1.9, .35, 2, 0, 1.1, -1.8, c); b.rotation.x = -.6; },
      pergola(p, o) { const w = o.w, d = o.d, c = o.c || 'oak', n = o.n || 9; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => B(p, .5, H, .5, sx * (w / 2 - .5), 0, sz * (d / 2 - .5), c)); for (let i = 0; i < n; i++) B(p, w - .4, .35, .45, 0, H - .1, -d / 2 + .6 + i * (d - 1.2) / (n - 1), c); [-1, 1].forEach(s => B(p, .5, .45, d, s * (w / 2 - .5), H - .4, 0, c)); },
      stairs(p, o) { const n = o.n || 12, L = o.len || 10, rise = (H - .4) / n; for (let i = 0; i < n; i++) B(p, L / n + .05, .35, o.wid || 2.4, -L / 2 + (i + .5) * L / n, i * rise, 0, o.c || 'cumaru'); if (o.rail) B(p, L, .08, .08, 0, H * .75, (o.wid || 2.4) / 2, o.rail).rotation.z = Math.atan2(H - .4, L); },
      fireplace(p, o) { B(p, o.w || 4.5, H - .2, 1.6, 0, 0, 0, new THREE.MeshStandardMaterial({ color: 0xffffff, map: speckle(0x8b8a86, 1, 2, .25), roughness: .95 })); B(p, 2.4, 1.4, .2, 0, 1, .75, 'charcoal'); B(p, 2, .6, .22, 0, 1.1, .78, null).material = glow('terracotta', 2); },
      sculpture(p, o) { const m = new THREE.Mesh(new THREE.TorusKnotGeometry(.8, .25, 60, 8, 2, 3), M(o.c || 'bronze', { metalness: .6, roughness: .35 })); m.position.y = o.y || 4; m.scale.set(1, 1.3, .6); m.castShadow = true; p.add(m); },
      niche(p, o) { B(p, o.len || 3, 1.4, 1.6, 0, 0, 0, o.base || 'oak'); B(p, o.len || 3, .5, 1.5, 0, 1.4, 0, o.c || 'olive'); B(p, o.len || 3, 2, .4, 0, 1.4, -.6, o.c || 'olive'); },
      art(p, o) { // obra na parede; costas em -z (ver wallPlace)
        const w = o.w || 5, h = o.h || 4, y = o.y || 1.8;
        B(p, w + .3, h + .3, .15, 0, y - .15, 0, o.frame || 'oak');
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: art(o.img), roughness: .9 }));
        pl.position.set(0, y + h / 2, .09); p.add(pl);
      },
      water(p, o) { const m = new THREE.Mesh(new THREE.PlaneGeometry(o.w || 20, o.d || 8), new THREE.MeshStandardMaterial({ color: 0x3d8fa8, roughness: .1, metalness: .2 })); m.rotation.x = -Math.PI / 2; m.position.y = -.3; p.add(m); }
    };

    // posição na parede: lado n/s/e/w e fração a ao longo dela; o item fica de frente para o centro
    function wallPlace(side, a, w, h, inset) {
      const i = inset == null ? T + .15 : inset;
      if (side === 'n') return [a * w, -h / 2 + i, 0];
      if (side === 's') return [a * w, h / 2 - i, Math.PI];
      if (side === 'w') return [-w / 2 + i, a * h, Math.PI / 2];
      return [w / 2 - i, a * h, -Math.PI / 2];
    }

    const INSET = { art: .75, curtain: .9, books: 1.4, run: 1.9, console: 1.4, tv: 1.4, vanity: 1.6, bed: 5, night: 1.6, niche: 1.5, bench: 1.2, toilet: 1.6, fireplace: 1.4, sculpture: .9 };
    function decorate(g, spec, r) {
      spec.items.forEach(it => {
        const q = new THREE.Group();
        let x, z, ry;
        if (it.wall) { [x, z, ry] = wallPlace(it.wall, it.a || 0, r.w, r.h, it.inset != null ? it.inset : (INSET[it.t] || T + .15)); ry += (it.r || 0) * Math.PI / 180; }
        else { x = (it.x || 0) * r.w; z = (it.z || 0) * r.h; ry = (it.r || 0) * Math.PI / 180; }
        if (it.t === 'pergola') { it.w = it.w || r.w; it.d = it.d || r.h; }
        q.position.set(x, FH, z); q.rotation.y = ry; g.add(q);
        try { if (D[it.t]) D[it.t](q, it); } catch (e) { console.warn('[planta3d]', it.t, e); }
      });
    }

    /* ---------- cômodos ---------- */
    const H = 6, T = .6, FH = .5;
    const inRect = (px, pz, r) => px > r.x - .2 && px < r.x + r.w + .2 && pz > r.y - .2 && pz < r.y + r.h + .2;
    const hasNeighbor = (r, side) => {
      const off = 3;
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      const p = side === 'n' ? [cx, r.y - off] : side === 's' ? [cx, r.y + r.h + off] : side === 'w' ? [r.x - off, cy] : [r.x + r.w + off, cy];
      return rooms.some(o => o !== r && inRect(p[0], p[1], o));
    };

    rooms.forEach(r => {
      const kind = kindOf(r);
      const g = new THREE.Group();
      g.userData.room = r.id;
      const cx = r.x + r.w / 2 - CX, cz = r.y + r.h / 2 - CZ;
      g.position.set(cx, 0, cz);
      scene.add(g);
      roomGroups[r.id] = g;

      // decoração tirada das fotos do ambiente (assets/js/planta3d-decor.js), quando existe
      const spec = ((window.AZPlanDecor || {})[P.id] || {})[r.id] || null;

      // piso (material próprio, para poder destacar)
      let fm, baseC;
      if (spec && spec.floor) {
        fm = floorMat(spec.floor, r.w, r.h);
        baseC = fm.color.getHex();
      } else {
        const woodKind = /^(sala|jantar|suite|biblioteca|escada|varanda)$/.test(kind);
        const stoneKind = /^(hall|cozinha|banho|servico)$/.test(kind);
        const texM = woodKind ? mWood : stoneKind ? mStone : null;
        const t = tex(texM, Math.max(1, r.w / 14), Math.max(1, r.h / 14));
        baseC = t ? 0xffffff : (woodKind ? PAL.wood : stoneKind ? PAL.stone : FLOOR[kind]);
        fm = new THREE.MeshStandardMaterial({ color: baseC, roughness: stoneKind ? .55 : .8, map: t || null });
      }
      const fl = mesh(g, r.w, FH, r.h, 0, 0, 0, fm);
      fl.castShadow = false;
      fl.userData.room = r.id; fl.userData.base = baseC;
      floors[r.id] = fl;

      // paredes (cômodos internos), com vão de porta onde há vizinho
      if (!OUTDOOR[kind] && !(spec && spec.open)) {
        const wallC = spec && spec.wall ? wallMat(spec.wall) : 0xf0ebe0, cap = 0xd9d3c4;
        const solid = (spec && spec.solid) || [], glass = (spec && spec.glass) || [];
        const wall = (len, x, z, horiz, gapAt) => {
          const seg = (a, b) => {
            const l = b - a; if (l <= .05) return;
            const mid = (a + b) / 2;
            const w = horiz ? l : T, d = horiz ? T : l;
            mesh(g, w, H, d, horiz ? mid : x, FH, horiz ? z : mid, wallC);
            mesh(g, w + .05, .18, d + .05, horiz ? mid : x, FH + H, horiz ? z : mid, cap);
          };
          if (gapAt == null) { seg(-len / 2, len / 2); return; }
          const gw = Math.min(5, len * .5);
          seg(-len / 2, gapAt - gw / 2); seg(gapAt + gw / 2, len / 2);
        };
        const hw = r.w / 2 - T / 2, hh = r.h / 2 - T / 2;
        const sides = [
          ['n', r.w, 0, -hh, true], ['s', r.w, 0, hh, true],
          ['w', r.h, -hw, 0, false], ['e', r.h, hw, 0, false]
        ];
        sides.forEach(([s, len, x, z, horiz]) => {
          if (glass.includes(s)) { /* cai na fachada de vidro abaixo */ }
          else if (solid.includes(s)) { wall(len, x, z, horiz, hasNeighbor(r, s) ? 0 : null); return; }
          else if (hasNeighbor(r, s)) { wall(len, x, z, horiz, 0); return; }
          else if (kind === 'banho' || kind === 'servico') { wall(len, x, z, horiz, null); return; }
          {
            // fachada envidraçada: peitoril baixo + vidro
            const w = horiz ? len : T, d = horiz ? T : len;
            mesh(g, w, 1.1, d, horiz ? 0 : x, FH, horiz ? z : 0, wallC);
            mesh(g, w, H - 1.1, d, horiz ? 0 : x, FH + 1.1, horiz ? z : 0, 0xa9d4e2, { transparent: true, opacity: .22, roughness: .1, metalness: .1 }).castShadow = false;
            mesh(g, w + .05, .18, d + .05, horiz ? 0 : x, FH + H, horiz ? z : 0, cap);
          }
        });
      } else {
        // borda baixa de vidro nas áreas externas voltadas para fora
        const e = .25;
        [['n', r.w, 0, -r.h / 2 + e, true], ['s', r.w, 0, r.h / 2 - e, true], ['w', r.h, -r.w / 2 + e, 0, false], ['e', r.h, r.w / 2 - e, 0, false]].forEach(([s, len, x, z, horiz]) => {
          if (kind === 'jardim' || hasNeighbor(r, s)) return;
          mesh(g, horiz ? len : .3, 1.4, horiz ? .3 : len, x, FH, z, 0xa9d4e2, { transparent: true, opacity: .25, roughness: .1 }).castShadow = false;
        });
      }

      if (spec && spec.items) decorate(g, spec, r);
      else furnish(g, kind, r.w, r.h, FH);
      g.traverse(o => { if (o.isMesh) o.userData.room = r.id; });
    });

    /* ---------- mobiliário esquemático ---------- */
    function furnish(g, kind, w, h, y0) {
      const m = (W, Hh, D, x, z, c, yy, o) => mesh(g, W, Hh, D, x, y0 + (yy || 0), z, c, o);
      const wood = PAL.wood, dark = PAL.dark, linen = PAL.fabric, olive = (mFab && /oliva/i.test(mFab.nome)) ? PAL.fabric : 0x7b7d52, leather = PAL.leather;
      const cyl = (rt, rb, hh, x, z, c, yy, seg) => {
        const o = mesh(g, 0, hh, 0, x, y0 + (yy || 0), z, c, null, new THREE.CylinderGeometry(rt, rb, hh, seg || 14));
        return o;
      };
      const tree = (x, z, s) => {
        cyl(.35 * s, .5 * s, 2.4 * s, x, z, 0x6b4a2f, 0, 8);
        const f = mesh(g, 0, 3.4 * s, 0, x, y0 + 2 * s, z, 0x4f7a45, null, new THREE.SphereGeometry(2.1 * s, 14, 12));
        f.position.y = y0 + 3.6 * s;
        const f2 = mesh(g, 0, 2.4 * s, 0, x + .8 * s, y0 + 2.8 * s, z - .4 * s, 0x5f8c50, null, new THREE.SphereGeometry(1.5 * s, 12, 10));
        f2.position.y = y0 + 4.3 * s;
      };
      const pool = (pw, ph, x, z) => {
        m(pw + 1, .35, ph + 1, x, z, 0xe6e0d2, .02);
        const wtr = m(pw, .3, ph, x, z, 0x4fb4c9, .1, { roughness: .12, metalness: .05, transparent: true, opacity: .85 });
        wtr.castShadow = false;
      };
      const lounger = (x, z, rot) => {
        const grp = new THREE.Group();
        const a = mesh(grp, 2, .5, 5.2, 0, 0, 0, 0xf0eadc); a.position.y = .55;
        const b = mesh(grp, 2, .5, 2, 0, 0, -2.4, 0xf0eadc); b.position.set(0, 1.1, -2.2); b.rotation.x = -.55;
        grp.position.set(x, y0, z); grp.rotation.y = rot || 0; g.add(grp);
      };
      const sofa = (x, z, len, rot) => {
        const grp = new THREE.Group();
        mesh(grp, len, 1.1, 3.4, 0, 0, 0, linen).position.y = .55;
        mesh(grp, len, 1.6, .9, 0, 0, -1.4, linen).position.y = 1.2;
        mesh(grp, .9, 1.4, 3.4, -len / 2 + .45, 0, 0, linen).position.y = 1;
        mesh(grp, .9, 1.4, 3.4, len / 2 - .45, 0, 0, linen).position.y = 1;
        grp.position.set(x, y0, z); grp.rotation.y = rot || 0; g.add(grp);
      };
      const chair = (x, z, c) => { m(1.3, .7, 1.3, x, z, c || dark, .45); m(1.3, 1.2, .3, x, z - .55, c || dark, .9); };
      const bed = (x, z, bw) => {
        m(bw, .9, 7.4, x, z, wood, 0);
        m(bw - .4, .7, 6.4, x, z + .5, 0xf4efe4, .9);
        m(bw - .4, .5, 2.4, x, z + 2.4, 0xd9d0bb, 1.5);
        m(bw, 3, .6, x, z - 3.6, wood, 0);
        m(1.4, 1.2, 1.4, x - bw / 2 - 1.3, z - 2.8, wood, 0); m(1.4, 1.2, 1.4, x + bw / 2 + 1.3, z - 2.8, wood, 0);
      };

      if (kind === 'sala') {
        m(w * .58, .12, h * .5, 0, h * .06, olive, 0);
        sofa(0, h * .22, Math.min(11, w * .36), 0);
        m(Math.min(6, w * .2), .9, 2.8, 0, -h * .02, wood, 0);
        m(Math.min(10, w * .26), 1.6, 1.1, 0, -h / 2 + 2, dark, 0);
        chair(-w * .27, -h * .08, leather); chair(w * .27, -h * .08, leather);
        cyl(.9, 1, 1.7, w / 2 - 3, -h / 2 + 3, 0x6a5a45, 0, 10); tree(w / 2 - 3, -h / 2 + 3, .45);
        if (w > 30) { m(Math.min(9, w * .22), .9, 4, -w * .3, h * .22, 0xe6e0d2, 0); }
      } else if (kind === 'jantar') {
        const tw = Math.min(13, w * .62), td = Math.min(5, h * .36);
        m(tw, .2, td, 0, 0, wood, 1.7); m(.6, 1.7, td - 1, -tw / 2 + 1, 0, dark, 0); m(.6, 1.7, td - 1, tw / 2 - 1, 0, dark, 0);
        const n = Math.max(2, Math.floor(tw / 3.4));
        for (let i = 0; i < n; i++) { const x = -tw / 2 + (i + .5) * (tw / n); chair(x, -td / 2 - 1.3); chair(x, td / 2 + 1.3); }
        m(w * .5, 1.5, 1, 0, h / 2 - 1.8, wood, 0);
      } else if (kind === 'cozinha') {
        m(w - 3, 2, 2.4, 0, -h / 2 + 2, 0xe9e5dc, 0); m(w - 3, .25, 2.6, 0, -h / 2 + 2, dark, 2);
        m(w - 3, 3.2, 1.2, 0, -h / 2 + 1.5, wood, 3.2);
        const iw = Math.min(10, w * .55);
        m(iw, 2, 2.8, 0, h * .12, 0xe9e5dc, 0); m(iw + .4, .25, 3.2, 0, h * .12, 0x8a8478, 2);
        for (let i = -1; i <= 1; i++) { cyl(.55, .55, 1.6, i * iw * .3, h * .12 + 2.8, dark, 0, 10); }
        if (h > 20) m(7, 1.4, 3, -w * .2, h * .32, wood, 0);
      } else if (kind === 'suite') {
        const two = w > 30;
        const xs = two ? [-w * .24, w * .2] : [0];
        xs.forEach(x => bed(x, -h / 2 + 5.2, Math.min(7, w * .2)));
        m(.8, 3.4, Math.min(12, h * .55), w / 2 - 1.3, 0, wood, 0);
        m(Math.min(10, w * .3), .1, Math.min(9, h * .5), xs[0], -h * .02, 0xd9d0bb, 0);
        chair(-w / 2 + 3, h / 2 - 3, olive);
      } else if (kind === 'banho') {
        m(3.2, 1.3, Math.min(8, h * .6), -w / 2 + 3, -h * .1, 0xf6f4ee, 0);
        m(w - 5, 1.8, 2, 0, -h / 2 + 2, wood, 0); m(w - 5, .25, 2.2, 0, -h / 2 + 2, 0xe6e0d2, 1.8);
        m(.2, 3.6, 5, w / 2 - 3, h * .15, 0xa9d4e2, 0, { transparent: true, opacity: .3 });
      } else if (kind === 'hall') {
        m(w * .6, .12, h * .5, 0, 0, olive, 0);
        m(w * .55, 1.8, 1.2, 0, -h / 2 + 1.6, wood, 0);
        cyl(.5, .7, 1.8, w * .22, -h / 2 + 1.6, 0xe9e2d2, 1.8, 10);
      } else if (kind === 'escada') {
        const n = 9, sw = Math.min(w - 4, 8), run = h - 3;
        for (let i = 0; i < n; i++) m(sw, .6 + i * .5, run / n, 0, -h / 2 + 1.5 + i * run / n + run / n / 2, i % 2 ? 0xb89066 : 0xc9a478, 0);
        m(.25, 3.2, run, sw / 2 + .2, 0, 0x2f2d29, 0).castShadow = false;
      } else if (kind === 'biblioteca') {
        m(w - 3, 3.8, 1, 0, -h / 2 + 1.6, wood, 0);
        for (let i = 0; i < 6; i++) m(w - 3.4, .15, .9, 0, -h / 2 + 1.6, 0xe9e2d2, .8 + i * .6);
        chair(0, h * .1, leather); m(4, .9, 2.6, 0, h * .32, wood, 0.8); m(4.2, .15, 2.8, 0, h * .32, dark, 1.7);
      } else if (kind === 'servico') {
        m(w - 3, 1.8, 2.2, 0, -h / 2 + 2, 0xe9e5dc, 0); m(3, 2, 2.6, -w * .25, h * .15, 0xf6f4ee, 0); m(3, 2, 2.6, w * .1, h * .15, 0xf6f4ee, 0);
      } else if (kind === 'varanda') {
        const n = w > 20 ? 2 : 1;
        for (let i = 0; i < n; i++) lounger(-w * .28 + i * w * .28, h * .2, 0);
        const tx = w * .22, tz = -h * .08;
        cyl(2.2, 2.2, .25, tx, tz, wood, 1.6, 20); cyl(.3, .3, 1.6, tx, tz, dark, 0, 8);
        [[-3, 0], [3, 0], [0, -3], [0, 3]].forEach(([dx, dz]) => chair(tx + dx, tz + dz));
        if (/pergol/i.test(g.userData.nome || '') || w > 30) {
          [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => m(.5, 5.6, .5, sx * (w / 2 - .8), sz * (h / 2 - .8), wood, 0));
          for (let i = 0; i < 7; i++) m(w - 1, .35, .6, 0, -h / 2 + .8 + i * ((h - 1.6) / 6), 0xb98c5a, 5.6);
        }
        tree(-w / 2 + 2.2, -h / 2 + 2.2, .7);
      } else if (kind === 'clube') {
        pool(w * .55, h * .5, -w * .12, 0);
        lounger(w * .3, -h * .12, 1.57); lounger(w * .3, h * .18, 1.57);
        tree(w / 2 - 2.5, h / 2 - 2.5, .8); tree(-w / 2 + 2.5, -h / 2 + 2.5, .8);
      } else if (kind === 'jardim') {
        const poolW = Math.min(w * .42, 36), poolH = Math.min(h * .6, 12);
        pool(poolW, poolH, w * .2, -h * .05);
        lounger(w * .2 - poolW / 2 + 3, h / 2 - 2.6, 1.57); lounger(w * .2 - poolW / 2 + 9, h / 2 - 2.6, 1.57);
        let seed = 7;
        const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        const pts = Math.max(5, Math.round(w / 9));
        for (let i = 0; i < pts; i++) {
          const x = -w / 2 + 3 + (w - 6) * (i + rnd() * .5) / pts;
          if (Math.abs(x - w * .2) < poolW / 2 + 2) continue;
          tree(x, i % 2 ? -h / 2 + 2.6 : h / 2 - 2.6, .7 + rnd() * .4);
        }
      }
    }

    /* ---------- rótulos HTML sobre a maquete ---------- */
    const lbl = document.createElement('div');
    lbl.className = 'plan3d__labels';
    lbl.setAttribute('aria-hidden', 'true');
    rooms.forEach(r => {
      const s = document.createElement('span');
      s.className = 'plan3d__lbl';
      s.dataset.room = r.id;
      s.innerHTML = `<b>${r.nome}</b>${r.area ? `<i>${r.area} m²</i>` : ''}`;
      lbl.appendChild(s);
      labels[r.id] = s;
    });
    box.appendChild(lbl);

    /* ---------- controles ---------- */
    const ui = document.createElement('div');
    ui.className = 'plan3d__ui';
    ui.innerHTML = `
      <span class="plan3d__hint">Arraste para girar</span>
      <div class="plan3d__btns">
        <button type="button" data-act="in" aria-label="Aproximar">+</button>
        <button type="button" data-act="out" aria-label="Afastar">−</button>
        <button type="button" data-act="top" aria-label="Ver de cima">Topo</button>
        <button type="button" data-act="reset" aria-label="Restaurar vista">Restaurar</button>
      </div>`;
    box.appendChild(ui);

    /* ---------- câmera orbital ---------- */
    const view = { th: .55, ph: .92, r: 150 };
    const goal = { th: .55, ph: .92, r: 150 };
    const PH_MIN = .08, PH_MAX = 1.12;     // nunca passa do plano do piso: não dá para ver por baixo
    let r0 = 150, dirty = true, auto = false, visible = false, raf = 0, active = null;
    const proj = new THREE.Vector3();

    function fit() {
      const w = box.clientWidth || 600, h = box.clientHeight || 420;
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
      const k = 2 * Math.tan(cam.fov * Math.PI / 360);
      r0 = Math.max(112 / (k * cam.aspect), 84 / k) * 1.02;
      goal.r = Math.min(Math.max(goal.r, r0 * .35), r0 * 1.3);
      if (!fit.done) { view.r = goal.r = r0; fit.done = true; }
      dirty = true;
    }

    function place() {
      const s = Math.sin(view.ph), c = Math.cos(view.ph);
      cam.position.set(view.r * s * Math.sin(view.th), view.r * c + 3, view.r * s * Math.cos(view.th));
      cam.lookAt(0, 0, 0);
    }

    function paintLabels() {
      const w = box.clientWidth, h = box.clientHeight;
      rooms.forEach(r => {
        proj.set(r.x + r.w / 2 - CX, FH + 1, r.y + r.h / 2 - CZ).project(cam);
        const el = labels[r.id];
        el.style.transform = `translate(-50%, -50%) translate(${((proj.x + 1) / 2 * w).toFixed(1)}px, ${((1 - proj.y) / 2 * h).toFixed(1)}px)`;
        el.style.opacity = proj.z < 1 ? '' : '0';
      });
    }

    function frame() {
      raf = 0;
      if (!visible) return;
      let moving = false;
      if (auto && !drag) { goal.th += .0032; moving = true; }
      ['th', 'ph', 'r'].forEach(k => {
        const d = goal[k] - view[k];
        if (Math.abs(d) > 1e-4) { view[k] += d * (k === 'r' ? .14 : .16); moving = true; }
      });
      if (moving || dirty) { place(); renderer.render(scene, cam); paintLabels(); dirty = false; }
      if (moving || drag) raf = requestAnimationFrame(frame);
    }
    const kick = () => { dirty = true; if (!raf && visible) raf = requestAnimationFrame(frame); };

    /* ---------- interação ---------- */
    let drag = null;
    const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
    let onPick = null;

    function pick(ev) {
      const b = canvas.getBoundingClientRect();
      mouse.set(((ev.clientX - b.left) / b.width) * 2 - 1, -((ev.clientY - b.top) / b.height) * 2 + 1);
      ray.setFromCamera(mouse, cam);
      const hit = ray.intersectObjects(Object.values(roomGroups), true).find(h => h.object.userData.room && h.object.material && !(h.object.material.transparent));
      return hit ? hit.object.userData.room : null;
    }

    function setActive(id) {
      if (id === active) return;
      active = id;
      Object.keys(floors).forEach(k => {
        const f = floors[k];
        f.material.color.setHex(k === id ? ACCENT : f.userData.base);
        f.material.emissive.setHex(k === id ? 0x39400f : 0x000000);
        labels[k].classList.toggle('is-on', k === id);
      });
      kick();
    }

    canvas.addEventListener('pointerdown', e => {
      drag = { x: e.clientX, y: e.clientY, th: goal.th, ph: goal.ph, moved: false, touch: e.pointerType === 'touch' };
      auto = false;
      canvas.setPointerCapture(e.pointerId);
      box.classList.add('is-drag');
      kick();
    });
    canvas.addEventListener('pointermove', e => {
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
        goal.th = drag.th - dx * .0075;
        if (!drag.touch) goal.ph = Math.min(PH_MAX, Math.max(PH_MIN, drag.ph - dy * .006));
        kick();
      } else if (e.pointerType !== 'touch') {
        const id = pick(e);
        setActive(id);
        if (onPick) onPick(id);
      }
    });
    const end = e => {
      if (!drag) return;
      const tap = !drag.moved;
      drag = null; box.classList.remove('is-drag');
      if (tap) { const id = pick(e); setActive(id); if (onPick) onPick(id); }
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', () => { if (!drag) { setActive(null); if (onPick) onPick(null); } });
    canvas.addEventListener('keydown', e => {
      const k = e.key;
      if (k === 'ArrowLeft') goal.th -= .18; else if (k === 'ArrowRight') goal.th += .18;
      else if (k === 'ArrowUp') goal.ph = Math.max(PH_MIN, goal.ph - .1); else if (k === 'ArrowDown') goal.ph = Math.min(PH_MAX, goal.ph + .1);
      else if (k === '+' || k === '=') goal.r = Math.max(r0 * .5, goal.r * .88); else if (k === '-') goal.r = Math.min(r0 * 1.2, goal.r * 1.12);
      else return;
      auto = false; e.preventDefault(); kick();
    });
    ui.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      auto = false;
      const a = b.dataset.act;
      if (a === 'in') goal.r = Math.max(r0 * .35, goal.r * .8);
      if (a === 'out') goal.r = Math.min(r0 * 1.3, goal.r * 1.25);
      if (a === 'top') { goal.ph = PH_MIN; goal.r = r0; }
      if (a === 'reset') { goal.th = .55; goal.ph = .92; goal.r = r0; }
      kick();
    });
    // quando o cursor entra, a rotação automática para
    box.addEventListener('pointerenter', () => { auto = false; });

    new ResizeObserver(fit).observe(box);
    new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); if (visible) { dirty = true; kick(); } }, { rootMargin: '80px' }).observe(box);
    fit(); place();

    return {
      setView: (th, ph, r) => { auto = false; goal.th = view.th = th; goal.ph = view.ph = ph; if (r) goal.r = view.r = r; kick(); },
      highlight: setActive,
      onPick: fn => { onPick = fn; }
    };
  }

  /* Renders realistas (P.plan.renders): 4 ângulos; arrastar troca de ângulo. */
  function renders(box, P) {
    const list = P.plan.renders;
    if (!list || !list.length) return null;
    const n = list.length;
    box.classList.add('plan3d--img');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', `Planta realista de ${P.nome}. Arraste para girar.`);
    box.tabIndex = 0;
    box.innerHTML = `
      <div class="plan3d__stack">${list.map((s, i) => `<img src="${s}" alt="Planta de ${P.nome}, ângulo ${i + 1} de ${n}" draggable="false" decoding="async"${i ? '' : ' class="is-on"'}>`).join('')}</div>
      <div class="plan3d__ui">
        <span class="plan3d__hint">Arraste para girar</span>
        <div class="plan3d__btns">
          <button type="button" data-act="prev" aria-label="Girar para a esquerda">‹</button>
          <span class="plan3d__dots" aria-hidden="true">${list.map((_, i) => `<i${i ? '' : ' class="is-on"'}></i>`).join('')}</span>
          <button type="button" data-act="next" aria-label="Girar para a direita">›</button>
        </div>
      </div>`;
    const imgs = [...box.querySelectorAll('.plan3d__stack img')];
    const dots = [...box.querySelectorAll('.plan3d__dots i')];
    let cur = 0, drag = null;
    const go = k => {
      cur = (k % n + n) % n;
      imgs.forEach((im, i) => im.classList.toggle('is-on', i === cur));
      dots.forEach((d, i) => d.classList.toggle('is-on', i === cur));
    };
    const STEP = 90; // pixels de arrasto por ângulo
    box.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      drag = { x: e.clientX, cur, t: e.pointerType === 'touch' };
      box.setPointerCapture(e.pointerId);
      box.classList.add('is-drag');
    });
    box.addEventListener('pointermove', e => {
      if (!drag) return;
      const k = Math.round((e.clientX - drag.x) / STEP);
      go(drag.cur - k);
    });
    const end = () => { drag = null; box.classList.remove('is-drag'); };
    box.addEventListener('pointerup', end);
    box.addEventListener('pointercancel', end);
    box.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { go(cur + 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { go(cur - 1); e.preventDefault(); }
    });
    box.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      go(cur + (b.dataset.act === 'prev' ? 1 : -1));
    });
    return { highlight() {}, onPick() {}, setView() {} };
  }

  window.AZPlan3D = { init, renders };
})();
