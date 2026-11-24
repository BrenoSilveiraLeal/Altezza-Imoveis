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

  // Fecha os vãos entre cômodos: bordas que se encaram a até 3,2 un. se encontram no meio (uma parede só).
  function snapRooms(src, arq) {
    const R = src.map(r => Object.assign({}, r, (arq.rect || {})[r.id] || {}));
    const out = R.map(r => ({ l: r.x, t: r.y, r: r.x + r.w, b: r.y + r.h }));
    const G = 3.2;
    R.forEach((r, i) => R.forEach((s, j) => {
      if (i === j) return;
      const ovY = Math.min(r.y + r.h, s.y + s.h) - Math.max(r.y, s.y), ovX = Math.min(r.x + r.w, s.x + s.w) - Math.max(r.x, s.x);
      let g = s.x - (r.x + r.w); if (g > .01 && g <= G && ovY > 0) out[i].r = r.x + r.w + g / 2;
      g = r.x - (s.x + s.w); if (g > .01 && g <= G && ovY > 0) out[i].l = r.x - g / 2;
      g = s.y - (r.y + r.h); if (g > .01 && g <= G && ovX > 0) out[i].b = r.y + r.h + g / 2;
      g = r.y - (s.y + s.h); if (g > .01 && g <= G && ovX > 0) out[i].t = r.y - g / 2;
    }));
    return R.map((r, i) => Object.assign(r, { x: out[i].l, y: out[i].t, w: out[i].r - out[i].l, h: out[i].b - out[i].t }));
  }

  const FLOOR = {
    sala: 0xcdb28a, jantar: 0xcdb28a, suite: 0xc4a47a, biblioteca: 0xb08a62, hall: 0xd7cdb8,
    cozinha: 0xdad4c6, banho: 0xdcd8cf, servico: 0xd3cec2, escada: 0xcdb28a,
    varanda: 0xb48d62, jardim: 0x6f9158, clube: 0x6f9158
  };
  const ACCENT = 0xc3cf62;

  function init(box, P) {
    const THREE = window.THREE;
    if (!THREE || !webgl()) return null;
    const ARQ = (window.AZPlanArq || {})[P.id] || {};
    // Ambientes comuns em outros pavimentos (área 0 na planta) não pertencem à laje da residência.
    const rooms = snapRooms(P.plan.rooms.filter(r => r.area !== 0), ARQ);
    const BB = rooms.reduce((b, r) => ({ x0: Math.min(b.x0, r.x), y0: Math.min(b.y0, r.y), x1: Math.max(b.x1, r.x + r.w), y1: Math.max(b.y1, r.y + r.h) }), { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 });

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

    if (THREE.ACESFilmicToneMapping) { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .94; }

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
    scene.add(new THREE.HemisphereLight(0xa9bbdf, 0x171921, .38));
    const fill = new THREE.DirectionalLight(0x9bb2df, .32);
    fill.position.set(80, 60, -60); scene.add(fill);
    const sun = new THREE.DirectionalLight(0xffd7ae, 1.05);
    sun.position.set(-70, 130, 80);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 3;
    Object.assign(sun.shadow.camera, { left: -85, right: 85, top: 85, bottom: -85, near: 10, far: 360 });
    sun.shadow.bias = -.0006;
    scene.add(sun);

    const mats = {};
    const lin = c => new THREE.Color(c).convertSRGBToLinear();
    const mat = (c, o) => {
      const k = c + (o ? JSON.stringify(o) : '');
      return mats[k] || (mats[k] = new THREE.MeshStandardMaterial(Object.assign({ color: lin(c), roughness: .88, metalness: 0 }, o || {})));
    };
    const CX = (BB.x0 + BB.x1) / 2, CZ = (BB.y0 + BB.y1) / 2; // centro da planta
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

    /* ---------- base: acompanha a implantação real dos ambientes, sem preencher vazios ---------- */
    {
      const slabM = mat(0xe8e3d9, { roughness: .95 }), lipM = mat(0xd6d0c4, { roughness: .9 });
      rooms.forEach(r => {
        const x = r.x + r.w / 2 - CX, z = r.y + r.h / 2 - CZ;
        const slab = new THREE.Mesh(new THREE.BoxGeometry(r.w + .8, 1.6, r.h + .8), slabM);
        slab.position.set(x, -.8, z); slab.receiveShadow = true; scene.add(slab);
        const lip = new THREE.Mesh(new THREE.BoxGeometry(r.w + 1.1, .35, r.h + 1.1), lipM);
        lip.position.set(x, -1.78, z); scene.add(lip);
      });
    }

    /* ---------- decoração fiel às fotos ---------- */
    const C = {
      olive: 0x6f7243, linen: 0xe6dfd0, white: 0xf3f0ea, cream: 0xe9e1cf, caramel: 0x9a5b33, black: 0x1f1e1c,
      oak: 0xc49a6c, walnut: 0x6b4630, travertine: 0xd9cbb2, bronze: 0x8c6a3f, brass: 0xb9904f, marble: 0x3f5546,
      terracotta: 0xb4643e, jute: 0xb99c6c, grey: 0x9a9893, darkgrey: 0x55554f, concrete: 0xa7a39b, cumaru: 0x8a5a33,
      freijo: 0xa77a4f, rush: 0xb5925c, earth: 0xc2a27f, steel: 0xb8bcbf, leaf: 0x3f6a35, sage: 0x7d8a5a,
      water: 0x2f8f9a, darkwater: 0x1d4c46, mustard: 0xc9a13b, pink: 0xd8a5a8, sand: 0xe4d6b8, charcoal: 0x2a2a28, steel: 0xb8bcbf, wooden: 0x8a6a48, black: 0x1f1e1c
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
    /* ---------- materiais reais (texturas CC0 da Poly Haven) e modelos 3D ---------- */
    const TX = 'assets/3d/tex/';
    const pbrCache = {};
    function texFile(path, rx, ry, srgb) {
      const t = loader.load(path, () => setTimeout(() => { dirty = true; kick(); }));
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
      if (srgb && THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
      if (renderer.capabilities && renderer.capabilities.getMaxAnisotropy) t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return t;
    }
    function pbr(name, rx, ry, o) {
      o = o || {};
      const k = [name, rx.toFixed(2), ry.toFixed(2), o.tint || 0, o.rough || 0, o.nomap ? 1 : 0].join('|');
      if (pbrCache[k]) return pbrCache[k];
      const m = new THREE.MeshStandardMaterial({
        color: o.tint != null ? lin(o.nomap ? shade(o.tint, .92) : o.tint) : 0xffffff,
        map: o.nomap ? null : texFile(TX + name + '/diff.jpg', rx, ry, true),
        normalMap: texFile(TX + name + '/nor.jpg', rx, ry, false),
        roughnessMap: o.nomap ? null : texFile(TX + name + '/rough.jpg', rx, ry, false),
        roughness: o.rough != null ? o.rough : 1, metalness: 0
      });
      m.normalScale.set(.6, .6);
      if (o.nomap) { m.roughness = 1; m.envMapIntensity = .5; }
      return (pbrCache[k] = m);
    }
    const U = 3.45; // 1 metro em unidades da planta
    try {
      if (THREE.RGBELoader) {
        new THREE.RGBELoader().setDataType(THREE.UnsignedByteType).load('assets/3d/env/studio.hdr', hdr => {
          const pm = new THREE.PMREMGenerator(renderer);
          scene.environment = pm.fromEquirectangular(hdr).texture;
          hdr.dispose(); pm.dispose();
          dirty = true; kick();
        });
      }
    } catch (e) { /* segue com as luzes */ }
    const gltfCache = {};
    function loadModel(id) {
      if (!THREE.GLTFLoader) return Promise.reject(new Error('sem GLTFLoader'));
      if (!gltfCache[id]) gltfCache[id] = new Promise((res, rej) => new THREE.GLTFLoader().load('assets/3d/models/' + id + '/' + id + '.gltf', g => res(g.scene), undefined, rej));
      return gltfCache[id];
    }
    // coloca um modelo no grupo p: base no chão, centrado; w = maior medida horizontal, hgt = altura (unidades)
    function model(p, id, o) {
      o = o || {};
      return loadModel(id).then(src => {
        const m = src.clone(true);
        // arquivos com variantes lado a lado (planta_a, planta_b…): fica só uma, senão aparecem várias espalhadas
        const vars = new Set(); m.traverse(c => { const v = /_([a-h])$/.exec(c.name || ''); if (c.isMesh && v) vars.add(v[1]); });
        if (vars.size > 1) {
          const keep = o.variant || [...vars].sort()[0], drop = [];
          m.traverse(c => { const v = /_([a-h])$/.exec(c.name || ''); if (c.isMesh && v && v[1] !== keep) drop.push(c); });
          drop.forEach(c => c.parent.remove(c));
        }
        const box = new THREE.Box3().setFromObject(m), size = new THREE.Vector3(), ctr = new THREE.Vector3();
        box.getSize(size); box.getCenter(ctr);
        const k = o.hgt ? o.hgt / size.y : o.w ? o.w / Math.max(size.x, size.z) : U;
        m.scale.setScalar(k);
        m.position.set(-ctr.x * k + (o.x || 0), -box.min.y * k + (o.y || 0), -ctr.z * k + (o.z || 0));
        const w = new THREE.Group(); w.rotation.y = (o.r || 0) * Math.PI / 180; w.add(m); p.add(w);
        let up = p; while (up && !(up.userData && up.userData.room)) up = up.parent;
        m.traverse(c => {
          if (!c.isMesh) return;
          c.castShadow = true; c.receiveShadow = true;
          if (o.tint != null) { c.material = c.material.clone(); c.material.color.copy(lin(col(o.tint))); if (o.plain !== false) { c.material.map = null; c.material.roughnessMap = null; c.material.metalnessMap = null; c.material.roughness = .85; c.material.metalness = 0; } c.material.needsUpdate = true; }
          if (up) c.userData.room = up.userData.room;
        });
        dirty = true; kick();
        return w;
      }).catch(e => { console.warn('[planta3d] modelo', id, e); return null; });
    }

    function floorMat(f, w, h) {
      const rx = Math.max(1, w / 7), ry = Math.max(1, h / 7);
      if (f === 'stone') return pbr('marble_01', rx * .7, ry * .7, { tint: 0xf3e6cf, rough: .45 });
      if (f === 'wood') return pbr('wood_floor', rx, ry);
      if (f === 'oak') return pbr('oak_wood_planks', rx * .8, ry * .8);
      if (f === 'herring') return pbr('herringbone_parquet', rx * .28, ry * .28, { tint: 0xf3e9dc });
      if (f === 'tile') return pbr('terracotta_floor_tiles', rx * 1.6, ry * 1.6);
      if (f === 'bath') return pbr('large_floor_tiles_02', rx * 1.2, ry * 1.2, { tint: 0xf1e8d8, rough: .5 });
      if (f === 'deck') return pbr('oak_wood_planks', rx * .8, ry * .8, { tint: 0xb39882 });
      if (f === 'grass') return new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, map: canvasTex(512, (x, S) => {
        x.fillStyle = '#5f7a45'; x.fillRect(0, 0, S, S);
        for (let i = 0; i < 26000; i++) { const v = ((i * 2654435761) >>> 0) % 1000 / 1000; const g = 90 + v * 60 | 0; x.fillStyle = `rgb(${g * .62 | 0},${g},${g * .45 | 0})`; x.fillRect(((i * 7919) >>> 0) % S, ((i * 104729) >>> 0) % S, 1, 2 + (i % 3)); }
      }, w / 6, h / 6) });
      if (f === 'concrete') return pbr('smooth_concrete_floor', rx, ry);
      return new THREE.MeshStandardMaterial({ color: lin(col(f)), roughness: .8 });
    }
    function wallMat(w) {
      if (w === 'wood') return pbr('oak_veneer_01', 2.5, 1);
      if (w === 'walnut') return pbr('walnut_veneer', 2.5, 1, { tint: 0x9a7357 });
      if (w === 'earth') return new THREE.MeshStandardMaterial({ color: 0xffffff, map: canvasTex(128, (x, s) => { for (let i = 0; i < 16; i++) { x.fillStyle = hexs(shade(C.earth, .88 + (i * 7 % 11) / 50)); x.fillRect(0, i * s / 16, s, s / 16); } }, 2, 1), roughness: .95 });
      if (w === 'concrete') return pbr('smooth_concrete_floor', 2, 1, { tint: 0xd8d4cc });
      if (w === 'stone') return pbr('marble_01', 1.5, 1, { tint: 0xf3e6cf, rough: .5 });
      return new THREE.MeshStandardMaterial({ color: lin(col(w)), roughness: .9 });
    }
    const artTex = {};
    function art(name) {
      if (artTex[name]) return artTex[name];
      const t = loader.load(`assets/img/planta/arte/${name}.jpg?v=1`, () => setTimeout(() => { dirty = true; kick(); }));
      if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
      return (artTex[name] = t);
    }

    // primitivas no grupo p, com y = base
    // nomes de material viram texturas reais; o resto continua cor lisa
    const REAL = {
      walnut: ['walnut_veneer'], oak: ['oak_veneer_01'], freijo: ['oak_veneer_01', 0xe0c8a8], cumaru: ['natural_walnut_veneer'],
      travertine: ['marble_01', 0xf1e3c9, .45], marble: ['marble_01', 0x6f8a78, .3], concrete: ['smooth_concrete_floor'],
      linen: ['rough_linen', 0xf1ebe0], white: ['rough_linen', 0xfbf8f2], cream: ['rough_linen', 0xf4ecdc], sand: ['rough_linen', 0xe7d9bd],
      jute: ['rough_linen', 0xd6ad70], olive: ['rough_linen', 0x7d8250]
    };
    const realMat = (c, w, d) => {
      const r = typeof c === 'string' && REAL[c];
      if (!r) return null;
      const q2 = v => Math.max(.5, Math.round(v * 2) / 2);
      const rx = q2((w || 2) / 5), ry = q2((d || 2) / 5);
      return pbr(r[0], rx, ry, { tint: r[1], rough: r[2], nomap: r[0] === 'rough_linen' });
    };
    const B = (p, w, h, d, x, y, z, c, o) => mesh(p, w, h, d, x, y, z, c && c.isMaterial ? c : (!o && realMat(c, w, Math.max(h, d))) || col(c), o);
    const Cy = (p, rt, rb, h, x, y, z, c, seg, o) => mesh(p, 0, h, 0, x, y, z, col(c), o, new THREE.CylinderGeometry(rt, rb, h, seg || 20));
    const Ball = (p, r, x, y, z, c, sx, sy, sz) => {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), new THREE.MeshStandardMaterial({ color: lin(col(c)), roughness: .85, flatShading: true }));
      m.position.set(x, y, z); m.scale.set(sx || 1, sy || 1, sz || 1); m.castShadow = true; m.receiveShadow = true; p.add(m); return m;
    };
    const glow = (c, i) => new THREE.MeshStandardMaterial({ color: lin(col(c)), emissive: 0xffc98a, emissiveIntensity: i || .9, roughness: .6 });

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
        else if (o.shape === 'block' || /travertine|marble|stone/.test(c)) { B(p, s * 1.3, .45, s * .8, 0, .85, 0, c); B(p, s * .9, .85, s * .45, 0, 0, 0, c); }
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
          // galhos e copa de folhas miúdas (oliveira: verde-acinzentado)
          [[.7, .5], [-.6, .6], [.1, -.7]].forEach(([dx, dz]) => { const b = Cy(p, .05 * s, .08 * s, 1.4 * s, 0, y0 + th * .7, 0, 0x6b5640, 5); b.rotation.set(dz * .7, 0, -dx * .7); });
          crown(p, [[0, y0 + th + .2 * s, 0, 1.25 * s], [.8 * s, y0 + th - .2 * s, .4 * s, .95 * s], [-.7 * s, y0 + th, -.3 * s, .95 * s], [.2 * s, y0 + th + .6 * s, .7 * s, .85 * s], [-.3 * s, y0 + th + .5 * s, -.8 * s, .85 * s]],
            k === 'olive' ? [0x7d8a5a, 0x93a06c, 0x6a7a4c, 0xa3ad84] : [0x3f6a35, 0x4c7a3a, 0x2f6131, 0x5d8a3f], k === 'olive' ? .32 * s : .45 * s, 7);
        } else if (k === 'fiddle') {
          Cy(p, .08 * s, .1 * s, 4.4 * s, 0, y0, 0, 0x5b4632, 6);
          for (let i = 0; i < 16; i++) { const a = i * 2.4, h = y0 + (1.4 + (i % 8) * .42) * s, r = (.5 + (i % 3) * .25) * s; Ball(p, .55 * s, Math.cos(a) * r, h, Math.sin(a) * r, i % 2 ? 'leaf' : 0x2f5a2a, 1, 1.3, .35).rotation.y = a; }
        } else if (k === 'palm') {
          const th = 5.2 * s, lean = .35 * s;
          for (let i = 0; i < 9; i++) { const t = i / 9; Cy(p, (.3 - t * .1) * s, (.32 - t * .1) * s, th / 9 + .02, lean * t * t, y0 + t * th, 0, i % 2 ? 0x8a7458 : 0x7a654b, 10); }
          foliage(p, [{ x: lean, y: y0 + th, z: 0, s: 3.4 * s, n: 11, kind: 'frond', tilt: 1.15, tint: 0x4f7d3a }, { x: lean, y: y0 + th + .2, z: 0, s: 2.6 * s, n: 6, kind: 'frond', tilt: .55, tint: 0x5d8a3f }], 9);
          Ball(p, .35 * s, lean, y0 + th - .1, 0, 0x6b5a3a, 1, .8, 1);
        } else if (k === 'monstera' || k === 'fern') {
          foliage(p, [{ x: 0, y: y0, z: 0, s: (k === 'fern' ? 1.6 : 1.9) * s, n: k === 'fern' ? 20 : 11, kind: k === 'fern' ? 'fern' : 'leaf', tilt: k === 'fern' ? .8 : .7, tint: k === 'fern' ? 0x5d8a3f : null }], 3);
        } else if (k === 'branch') {
          for (let i = 0; i < 5; i++) { const b = Cy(p, .03, .04, 2.2 * s, 0, y0, 0, 0x5b4632, 4); b.rotation.z = (i - 2) * .22; Ball(p, .3 * s, (i - 2) * .45 * s, y0 + 2 * s, 0, 'leaf', 1, .6, 1); }
        } else if (k === 'eucalyptus') {
          const th = 7 * s; Cy(p, .5 * s, .8 * s, th, 0, y0, 0, 0xcfc4b1, 8);
          [[1, .6], [-.9, .5], [.2, -1]].forEach(([dx, dz]) => { const b = Cy(p, .18 * s, .3 * s, 3.4 * s, 0, y0 + th * .6, 0, 0xcfc4b1, 6); b.rotation.set(dz * .6, 0, -dx * .6); });
          crown(p, [[0, y0 + th, 0, 3 * s], [2 * s, y0 + th - 1 * s, 1 * s, 2.2 * s], [-2 * s, y0 + th - .5 * s, -1 * s, 2.2 * s], [.5 * s, y0 + th + 1.2 * s, 1.8 * s, 2 * s], [-.8 * s, y0 + th + .8 * s, -2 * s, 2 * s]],
            [0x55743f, 0x6b8a52, 0x4a6a3a, 0x7f9a66], .75 * s, 13);
        }
      },
      pool(p, o) {
        const w = o.w || 16, d = o.d || 6;
        const ed = o.edge || 'travertine'; // borda em moldura (o bloco maciço brigava com a água)
        [-1, 1].forEach(sd => { B(p, w + 1.4, .34, .7, 0, 0, sd * (d / 2 + .35), ed); B(p, .7, .34, d, sd * (w / 2 + .35), 0, 0, ed); });
        const dark = (o.c || 'water') === 'darkwater';
        { const bt = B(p, w, .19, d, 0, 0, 0, dark ? 0x1f3f3a : 0x6fb7c0); bt.castShadow = false; bt.receiveShadow = false; } // fundo/pastilha
        const wt = B(p, w, .1, d, 0, .19, 0, new THREE.MeshStandardMaterial({ color: lin(col(o.c || 'water')), roughness: .02, metalness: .3, transparent: true, opacity: dark ? .9 : .82, emissive: col(o.c || 'water'), emissiveIntensity: dark ? .05 : .12, envMapIntensity: 2.4 })); wt.castShadow = false; wt.receiveShadow = false;
        [-1, 1].forEach(sd => { B(p, w, .08, .18, 0, .2, sd * (d / 2 - .09), dark ? 0x2c5a50 : 0x9fd3d8).castShadow = false; B(p, .18, .08, d, sd * (w / 2 - .09), .2, 0, dark ? 0x2c5a50 : 0x9fd3d8).castShadow = false; });
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
      water(p, o) { const m = new THREE.Mesh(new THREE.PlaneGeometry(o.w || 20, o.d || 8), new THREE.MeshStandardMaterial({ color: lin(0x3d8fa8), roughness: .1, metalness: .2 })); m.rotation.x = -Math.PI / 2; m.position.y = -.3; p.add(m); }
    };

    /* ---------- peças detalhadas (substituem as versões simples) ---------- */
    // almofada/estofado macio: esfera achatada
    // caixa de cantos arredondados (estofados, colchões, almofadas)
    const rgCache = {};
    function rgeo(w, h, d, r) {
      r = Math.min(r, h / 2 - .01, w / 2 - .01, d / 2 - .01);
      const k = [w, h, d, r].map(v => v.toFixed(2)).join('|');
      if (rgCache[k]) return rgCache[k];
      const a = w / 2 - r, b = d / 2 - r, sh = new THREE.Shape();
      sh.moveTo(-a, -d / 2); sh.lineTo(a, -d / 2); sh.quadraticCurveTo(w / 2, -d / 2, w / 2, -b); sh.lineTo(w / 2, b); sh.quadraticCurveTo(w / 2, d / 2, a, d / 2);
      sh.lineTo(-a, d / 2); sh.quadraticCurveTo(-w / 2, d / 2, -w / 2, b); sh.lineTo(-w / 2, -b); sh.quadraticCurveTo(-w / 2, -d / 2, -a, -d / 2);
      const g = new THREE.ExtrudeGeometry(sh, { depth: Math.max(.01, h - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r * .9, bevelSegments: 4, curveSegments: 6 });
      g.rotateX(-Math.PI / 2); g.translate(0, r - h / 2, 0); g.computeVertexNormals();
      return (rgCache[k] = g);
    }
    const Soft = (p, w, h, d, x, y, z, c, r) => {
      const m = new THREE.Mesh(rgeo(w, h, d, r != null ? r : Math.min(h, d, w) * .38), realMat(c, w, d) || M(c));
      m.position.set(x, y + h / 2, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m;
    };
    const metal = c => new THREE.MeshStandardMaterial({ color: lin(col(c || 'brass')), metalness: .85, roughness: .28 });
    const glassM = () => new THREE.MeshStandardMaterial({ color: lin(0xcfe3e6), metalness: .1, roughness: .02, transparent: true, opacity: .25 });
    const porcelain = () => new THREE.MeshStandardMaterial({ color: lin(0xf7f6f2), roughness: .18, metalness: 0 });
    const mirrorM = () => new THREE.MeshStandardMaterial({ color: lin(0xdfe6e8), metalness: .95, roughness: .04 });
    // frente de armário com portas/gavetas separadas por frisos e puxadores
    function cabinetFront(p, L, h, x0, y0, z, c, doors, handle) {
      const n = doors || Math.max(1, Math.round(L / 1.6)), dw = L / n;
      for (let i = 0; i < n; i++) {
        const x = x0 - L / 2 + (i + .5) * dw;
        B(p, dw - .08, h - .1, .08, x, y0 + .05, z, c);
        B(p, .06, Math.min(.9, h * .45), .08, x + (i % 2 ? -1 : 1) * (dw / 2 - .25), y0 + h * .45, z + .07, metal(handle));
      }
    }
    Object.assign(D, {
      bed(p, o) {
        const w = o.w || 6.5, L = o.len || 8, lo = o.low ? .5 : 1.1;
        const frame = o.base || 'oak';
        B(p, w + .5, lo, L + .3, 0, 0, 0, frame);                                  // estrutura
        B(p, w + .2, .1, L, 0, lo - .05, 0, 'charcoal');                           // sombra entre estrutura e colchão
        Soft(p, w, 1.1, L - .2, 0, lo - .1, .1, 'white');                          // colchão
        Soft(p, w + .25, .55, L * .66, 0, lo + .55, L * .16, o.linen && o.linen !== 'white' ? o.linen : 'linen');  // edredom
        Soft(p, w + .3, .3, .9, 0, lo + .75, L * .16 - L * .33 + .3, 'white', .14);  // dobra do lençol
        if (o.throwC) { Soft(p, w + .35, .32, 1.9, 0, lo + .78, L / 2 - 1.7, o.throwC); if (o.stripe) B(p, w + .36, .06, .28, 0, lo + 1.07, L / 2 - 1.7, o.stripe); }
        const np = o.pillows || 2;
        for (let i = 0; i < np; i++) { const x = -w / 2 + (i + .5) * w / np; Soft(p, w / np - .25, .75, 1.3, x, lo + .55, -L / 2 + 1.1, o.pillowC || 'cream'); Soft(p, w / np - .55, .6, 1, x, lo + .75, -L / 2 + 1.9, 'white'); }
        const hw = o.headW || w + 1.2, hh = o.headH || 3.4;
        if (o.head) {
          // cabeceira estofada em gomos verticais
          const n = Math.max(4, Math.round(hw / .9));
          for (let i = 0; i < n; i++) Soft(p, hw / n + .05, hh, .55, -hw / 2 + (i + .5) * hw / n, 0, -L / 2 - .2, typeof o.head === 'string' ? o.head : 'sand');
        } else {
          B(p, hw, hh, .35, 0, 0, -L / 2 - .2, frame);
        }
      },
      night(p, o) {
        const w = o.w || 1.9, h = o.h || 1.7, c = o.c || 'oak';
        B(p, w, h, 1.6, 0, 0, 0, c);
        B(p, w - .16, .06, .02, 0, h * .55, .81, 'charcoal');
        B(p, .45, .06, .08, 0, h * .3, .82, metal('brass'));
        if (o.lamp) D.tlamp(p, { c: o.lamp, y: h });
        if (o.vase) { Cy(p, .22, .28, .65, .45, h, .1, o.vase, 14); }
        if (o.reading) { Cy(p, .05, .05, 2.6, -.55, h, -.45, o.reading, 8).material = metal(o.reading === 'black' ? 'black' : 'brass'); B(p, 1, .07, .07, -.1, h + 2.6, -.45, o.reading); Cy(p, .22, .28, .35, .35, h + 2.3, -.45, null, 12).material = glow('cream', 1.4); }
        B(p, .7, .14, .5, -.3, h, .2, 'cream');                                    // livro
      },
      run(p, o) { // bancada encostada na parede (costas em -z)
        const L = o.len || 10, base = o.base || 'walnut', top = o.top || 'travertine';
        B(p, L, .35, 2.2, 0, 0, .05, 'charcoal');                                  // rodapé recuado
        B(p, L, 2.2, 2.1, 0, .3, -.05, base);                                       // corpo
        cabinetFront(p, L, 2.1, 0, .35, 1.02, base, null, 'brass');
        B(p, L + .1, .22, 2.4, 0, 2.5, .05, top);                                   // tampo
        if (o.back) B(p, L, 2.6, .12, 0, 2.72, -1.05, o.back === 'tile' ? pbr('terracotta_floor_tiles', L / 2.5, 1) : o.back);
        if (o.upper === 'shelves') {
          [0, 1].forEach(i => {
            B(p, L * .72, .14, 1, -L * .1, 3.7 + i * 1.15, -.6, o.shelfC || base);
            for (let k = 0; k < 7; k++) { const x = -L * .44 + k * L * .1; if (k % 3 === 2) Cy(p, .32, .26, .5, x, 3.84 + i * 1.15, -.6, 'terracotta', 14); else { for (let s = 0; s < 4; s++) Cy(p, .3, .3, .05, x, 3.84 + i * 1.15 + s * .06, -.6, 'cream', 16); } }
          });
        }
        if (o.upper === 'cabinets') { B(p, L, 2, 1.2, 0, 3.7, -.45, base); cabinetFront(p, L, 2, 0, 3.7, .17, base, null, 'brass'); B(p, L, .08, 1, 0, 3.62, -.4, null).material = glow('cream', 1.1); }
        if (o.cooktop) { B(p, 2.2, .05, 1.6, L * .25, 2.72, .1, 'charcoal'); [[-.5, -.4], [.5, -.4], [-.5, .4], [.5, .4]].forEach(([a, b]) => Cy(p, .32, .32, .02, L * .25 + a, 2.77, .1 + b, 'darkgrey', 20)); }
        if (o.sink) { B(p, 1.8, .1, 1.3, -L * .2, 2.67, .1, metal('steel')); const f = Cy(p, .06, .06, 1, -L * .2, 2.72, -.5, 'brass', 8); f.material = metal('brass'); B(p, .08, .08, .6, -L * .2, 3.65, -.25, null).material = metal('brass'); }
        if (o.fridge) { B(p, 2.6, 5.8, 2.3, -L / 2 - 1.4, 0, 0, metal('steel')); B(p, .05, 5.5, .05, -L / 2 - 1.4, .2, 1.18, 'charcoal'); [-.2, .2].forEach(dx => B(p, .08, 2.2, .1, -L / 2 - 1.4 + dx, 2.4, 1.2, metal('steel'))); }
        if (o.plant) { Cy(p, .35, .3, .7, L * .4, 2.72, 0, 'terracotta', 12); Ball(p, .7, L * .4, 3.9, 0, 'leaf', 1, 1.1, 1); }
        Cy(p, .5, .35, .5, -L * .38, 2.72, .2, 'wooden', 14);
      },
      island(p, o) {
        const L = o.len || 8, W = o.wid || 2.8, base = o.base || 'walnut', top = o.top || 'travertine';
        B(p, L - .3, .35, W - .3, 0, 0, 0, 'charcoal');
        B(p, L, 2.2, W, 0, .3, 0, base);
        cabinetFront(p, L, 2.1, 0, .35, -W / 2 - .02, base, null, 'brass');
        B(p, L + .4, .25, W + .4, 0, 2.5, 0, top);
        if (o.grill) { B(p, 2.6, .12, 1.6, L * .2, 2.75, 0, metal('steel')); for (let i = 0; i < 7; i++) B(p, .06, .05, 1.4, L * .2 - 1.1 + i * .37, 2.88, 0, 'charcoal'); }
        if (o.sink) { B(p, 1.4, .1, 1, -L * .25, 2.72, 0, metal('steel')); Cy(p, .05, .05, .9, -L * .25, 2.75, -.6, 'brass', 8).material = metal('brass'); }
        if (o.fruit) { Cy(p, .8, .45, .3, L * .15, 2.75, 0, 'walnut', 16); [[0, 0], [.3, .15], [-.25, .1]].forEach(([a, b]) => Ball(p, .26, L * .15 + a, 3.15, b, 'mustard')); }
        Cy(p, .25, .3, .9, -L * .35, 2.75, .2, 'cream', 12); Ball(p, .45, -L * .35, 3.95, .2, 'leaf', .8, 1.4, .8);
        if (o.stools) { const q = new THREE.Group(); q.position.set(0, 0, W / 2 + 1.2); p.add(q); D.stools(q, { n: o.stools, c: o.stoolC, gap: L / (o.stools + .5) }); }
      },
      vanity(p, o) {
        const L = o.len || 5, c = o.c || 'walnut';
        B(p, L, 1.7, 1.8, 0, 1.1, 0, c); cabinetFront(p, L, 1.6, 0, 1.15, .91, c, 2, 'brass');
        B(p, L + .1, .3, 2, 0, 2.8, 0, o.top || 'travertine');
        const bx = -L * .18;
        const basin = new THREE.Mesh(new THREE.CylinderGeometry(.75, .55, .35, 28), porcelain()); basin.position.set(bx, 3.25, .1); basin.castShadow = true; p.add(basin);
        Cy(p, .05, .05, .8, bx, 3.1, -.75, null, 8).material = metal('brass'); B(p, .07, .07, .5, bx, 3.85, -.55, null).material = metal('brass');
        if (o.mirror === 'round') { const m = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, .08, 48), mirrorM()); m.rotation.x = Math.PI / 2; m.position.set(bx, 5.1, -.86); p.add(m); const fr = new THREE.Mesh(new THREE.TorusGeometry(1.8, .07, 8, 48), metal('brass')); fr.position.set(bx, 5.1, -.82); p.add(fr); }
        else if (o.mirror) { const m = new THREE.Mesh(new THREE.BoxGeometry(L - .6, 2.4, .06), mirrorM()); m.position.set(0, 4.6, -.86); p.add(m); }
        if (o.vase) { Cy(p, .3, .45, .9, L * .32, 3.1, 0, o.vase, 14); for (let i = 0; i < 5; i++) B(p, .05, 1.9, .05, L * .32 + (i - 2) * .18, 3.9, 0, 'leaf').rotation.z = (i - 2) * .22; }
        Cy(p, .18, .18, .5, L * .1, 3.1, -.4, 'cream', 12); Cy(p, .16, .16, .55, L * .16, 3.1, -.4, 'charcoal', 12);  // frascos
        B(p, .9, .9, .25, L * .45, 3.1, -.5, 'cream');                                                            // toalha dobrada
      },
      toilet(p, o) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(.62, .5, 1.3, 24), porcelain()); m.scale.set(1, 1, 1.35); m.position.set(0, .65, .15); m.castShadow = true; p.add(m);
        const seat = new THREE.Mesh(new THREE.TorusGeometry(.5, .1, 8, 24), porcelain()); seat.rotation.x = Math.PI / 2; seat.scale.set(1, 1.35, 1); seat.position.set(0, 1.32, .15); p.add(seat);
        const t = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.1, .5), porcelain()); t.position.set(0, 1.8, -.75); t.castShadow = true; p.add(t);
      },
      tub(p, o) {
        const L = o.len || 5.5, W = o.wid || 2.8, c = o.c || 'travertine';
        B(p, L, 1.9, W, 0, 0, 0, c);
        const w = new THREE.Mesh(new THREE.BoxGeometry(L - .7, .1, W - .7), new THREE.MeshStandardMaterial({ color: lin(0xbfe0e2), roughness: .02, metalness: .2, transparent: true, opacity: .85 })); w.position.set(0, 1.75, 0); p.add(w);
        Cy(p, .06, .06, 1.1, -L / 2 + .4, 1.9, 0, null, 8).material = metal('brass');
        B(p, 1.2, .5, .7, L / 2 - 1, 1.9, -W / 2 + .5, 'white');
      },
      shower(p, o) {
        const L = o.len || 4;
        const g = new THREE.Mesh(new THREE.BoxGeometry(.08, 5.4, L), glassM()); g.position.set(0, 2.7, 0); p.add(g);
        B(p, 3.4, .12, L, 1.7, 0, 0, 'travertine'); Cy(p, .18, .18, .02, 1.7, .12, 0, null, 16).material = metal('steel');
        B(p, .12, .12, L, 0, 5.4, 0, null).material = metal('brass');
        Cy(p, .5, .5, .05, 1.5, 5.3, 0, null, 24).material = metal('brass');
        Cy(p, .04, .04, 1, 3, 4.3, -L / 2 + .4, null, 8).material = metal('brass');
      },
      bench(p, o) { const L = o.len || 5, d = o.d || 1.6; Soft(p, L, .7, d, 0, 1, 0, o.c || 'caramel'); [-1, 1].forEach(s => B(p, .14, 1.05, d - .2, s * (L / 2 - .3), 0, 0, o.legs || 'black')); },
      rug(p, o) {
        const w = o.w || 10, d = o.d || 7, base = shade(col(o.c || 'cream'), .78);
        const t = canvasTex(512, (x, S) => {
          x.fillStyle = hexs(base); x.fillRect(0, 0, S, S);
          for (let i = 0; i < 9000; i++) { const v = .86 + ((i * 2654435761) % 1000) / 4000; x.fillStyle = hexs(shade(base, v)); x.fillRect((i * 97) % S, (i * 61 + (i >> 5)) % S, 2, 1); }
          const b = S * .06; x.strokeStyle = hexs(shade(base, .7)); x.lineWidth = b * .45; x.strokeRect(b, b, S - 2 * b, S - 2 * b);
          x.strokeStyle = hexs(shade(base, .85)); x.lineWidth = b * .15; x.strokeRect(b * 1.8, b * 1.8, S - 3.6 * b, S - 3.6 * b);
        }, 1, 1);
        const m = new THREE.MeshStandardMaterial({ color: 0xffffff, map: t, roughness: 1 });
        mesh(p, w, .08, d, 0, 0, 0, m).castShadow = false;
      },
      lounger(p, o) {
        const c = o.c || 'white', fr = o.frame || 'oak';
        B(p, 2.1, .25, 5.6, 0, .55, 0, fr); [[-.9, -2.5], [.9, -2.5], [-.9, 2.5], [.9, 2.5]].forEach(([x, z]) => B(p, .18, .55, .18, x, 0, z, fr));
        Soft(p, 1.95, .45, 3.7, 0, .75, .85, c); const b = Soft(p, 1.95, .45, 2.1, 0, 1.15, -1.75, c); b.rotation.x = -.6;
        Soft(p, 1.2, .35, .7, 0, 1.6, -2, 'cream');
      },
      stairs(p, o) {
        const n = o.n || 12, L = o.len || 10, rise = (H - .4) / n, wd = o.wid || 2.4, c = o.c || 'cumaru';
        const tc = c === 'cumaru' ? 0x8a5232 : c;
        for (let i = 0; i < n; i++) B(p, L / n + .08, .45, wd, -L / 2 + (i + .5) * L / n, i * rise + rise - .45, 0, tc);
        if (o.cwall) { // parede de concreto de fôrma de tábua junto à escada
          B(p, L + 2, H, .5, 0, 0, -wd / 2 - .3, 'concrete');
          for (let y = .5; y < H; y += .5) B(p, L + 2, .04, .04, 0, y, -wd / 2 - .03, 0x8e877b).castShadow = false;
        }
        if (o.rail) { const r = B(p, Math.hypot(L, H), .07, .07, 0, H * .55, wd / 2, null); r.material = metal(o.rail); r.rotation.z = Math.atan2(H - .4, L); for (let i = 0; i < n; i += 2) B(p, .05, 1.6, .05, -L / 2 + (i + .5) * L / n, i * rise + rise, wd / 2, null).material = metal(o.rail); }
      }
    });

    /* ---------- mais peças: quadros gerados, armários, escrivaninha, lavanderia ---------- */
    const paintCache = {};
    function painting(seed, pal) {
      const k = seed + '|' + pal; if (paintCache[k]) return paintCache[k];
      const P = { earth: ['#e9dfcc', '#b4643e', '#6b4630', '#d9c3a0', '#2f2d29', '#9a7b55'], olive: ['#ece6d6', '#6f7243', '#a8a477', '#3e4a2c', '#d8c9a6', '#8c6a3f'],
        sea: ['#eef0ea', '#2f6f7a', '#9cc3c4', '#d9cbb2', '#1f3f48', '#c9a77a'], mono: ['#f1eee8', '#1f1e1c', '#8d8d88', '#d4cfc5', '#55554f', '#b9904f'] }[pal] || ['#ece6d6', '#b4643e', '#6f7243', '#2f2d29', '#d9c3a0', '#8c6a3f'];
      let s = seed * 9301 + 49297; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
      const t = canvasTex(256, (x, S) => {
        x.fillStyle = P[0]; x.fillRect(0, 0, S, S);
        const style = seed % 3;
        if (style === 0) { for (let i = 0; i < 5; i++) { x.fillStyle = P[1 + (i % 5)]; x.globalAlpha = .85; x.beginPath(); x.arc(rnd() * S, rnd() * S, S * (.12 + rnd() * .25), 0, Math.PI * 2); x.fill(); } }
        else if (style === 1) { let y = 0; while (y < S) { const h = S * (.08 + rnd() * .22); x.fillStyle = P[1 + Math.floor(rnd() * 5)]; x.fillRect(S * .1, y + S * .05, S * .8, h * .85); y += h; } }
        else { x.lineWidth = S * .025; for (let i = 0; i < 7; i++) { x.strokeStyle = P[1 + (i % 5)]; x.beginPath(); x.moveTo(rnd() * S, rnd() * S); x.bezierCurveTo(rnd() * S, rnd() * S, rnd() * S, rnd() * S, rnd() * S, rnd() * S); x.stroke(); } x.fillStyle = P[1]; x.fillRect(S * .6, S * .15, S * .22, S * .22); }
        x.globalAlpha = 1;
      }, 1, 1);
      return (paintCache[k] = t);
    }
    Object.assign(D, {
      art(p, o) { // obra na parede; costas em -z
        const w = o.w || 5, h = o.h || 4, y = o.y || 1.8;
        B(p, w + .3, h + .3, .15, 0, y - .15, 0, o.frame || 'oak');
        if (o.mat !== false) B(p, w, h, .04, 0, y, .08, 'white');
        const tx = o.img ? art(o.img) : painting(o.seed || 1, o.pal || 'earth');
        const k = o.img ? 1 : .82;
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(w * k, h * k), new THREE.MeshStandardMaterial({ map: tx, roughness: .9 }));
        pl.position.set(0, y + h / 2, .11); p.add(pl);
      },
      gallery(p, o) { // conjunto de quadros
        const n = o.n || 3, gap = o.gap || .6, w = o.w || 2.4, h = o.h || 3;
        for (let i = 0; i < n; i++) { const q = new THREE.Group(); q.position.x = (i - (n - 1) / 2) * (w + gap); p.add(q); D.art(q, { w, h: i % 2 ? h * .75 : h, y: (o.y || 2.2) + (i % 2 ? h * .12 : 0), frame: o.frame || 'black', seed: (o.seed || 3) + i * 7, pal: o.pal }); }
      },
      wardrobe(p, o) { // armário/closet (costas em -z)
        const L = o.len || 8, h = o.h || 5.6, c = o.c || 'oak';
        B(p, L, h, 2, 0, 0, 0, c); cabinetFront(p, L, h - .2, 0, .1, 1.01, c, Math.max(2, Math.round(L / 2)), o.handle || 'brass');
      },
      desk(p, o) {
        const L = o.len || 4.5, c = o.c || 'oak';
        B(p, L, .15, 2, 0, 2.5, 0, c); [-1, 1].forEach(s => B(p, .15, 2.5, 1.8, s * (L / 2 - .2), 0, 0, c));
        B(p, 1.6, 1, .1, -.4, 2.65, -.6, 'charcoal'); B(p, .15, .5, .15, -.4, 2.65, -.5, 'charcoal');
        D.tlamp(p, { c: o.lamp || 'brass', y: 2.65 }); p.children[p.children.length - 1].position.x += L * .35; p.children[p.children.length - 2].position.x += L * .35;
        const q = new THREE.Group(); q.position.set(0, 0, 1.6); q.rotation.y = Math.PI; p.add(q); model(q, 'dining_chair_02', { w: 1.7 });
      },
      laundry(p, o) { // lavanderia em linha (costas em -z)
        const L = o.len || 8;
        B(p, L, 2.6, 2.1, 0, 0, 0, 'white'); B(p, L + .1, .2, 2.3, 0, 2.6, 0, o.top || 'travertine');
        [-L * .32, -L * .1].forEach(x => { const d = new THREE.Mesh(new THREE.CylinderGeometry(.62, .62, .08, 28), mirrorM()); d.rotation.x = Math.PI / 2; d.position.set(x, 1.35, 1.08); p.add(d); });
        B(p, 1.6, .1, 1.3, L * .25, 2.72, .1, metal('steel')); Cy(p, .05, .05, .9, L * .25, 2.8, -.6, null, 8).material = metal('steel');
        B(p, L, 1.8, 1.2, 0, 4, -.45, 'white'); cabinetFront(p, L, 1.8, 0, 4, .17, 'white', null, 'steel');
        Cy(p, .5, .4, .7, L * .42, 2.8, 0, 'jute', 14);
      },
      shelf(p, o) { // prateleira de parede com objetos (costas em -z)
        const L = o.len || 5, y = o.y || 3.4, c = o.c || 'oak';
        B(p, L, .14, .9, 0, y, -.2, c);
        for (let i = 0; i < 5; i++) { const x = -L / 2 + .5 + i * (L - 1) / 4; if (i % 2) B(p, .5, .7 + (i % 3) * .15, .6, x, y + .14, -.2, ['cream', 'charcoal', 'terracotta'][i % 3]); else Cy(p, .22, .28, .6 + i * .05, x, y + .14, -.2, i ? 'terracotta' : 'cream', 12); }
      },
      towel(p, o) { const y = o.y || 3; B(p, 2.2, .08, .08, 0, y + 1.8, .1, null).material = metal('brass'); Soft(p, 1.9, 1.8, .18, 0, y, .15, o.c || 'cream', .05); },
      vase(p, o) { Cy(p, (o.s || 1) * .45, (o.s || 1) * .32, (o.s || 1) * 1.3, 0, o.y || 0, 0, o.c || 'terracotta', 16); for (let i = 0; i < 4; i++) { const b = B(p, .05, 1.6 * (o.s || 1), .05, (i - 1.5) * .15, (o.y || 0) + (o.s || 1) * 1.2, 0, 'leaf'); b.rotation.z = (i - 1.5) * .3; } },
      tvwall(p, o) { // painel ripado com TV (costas em -z)
        const L = o.len || 9, c = o.c || 'walnut';
        for (let i = 0; i < Math.round(L / .45); i++) B(p, .32, H - .2, .25, -L / 2 + .2 + i * .45, 0, -.3, c);
        B(p, L * .8, 1.2, 1.5, 0, 0, .4, c); B(p, 5.2, 2.9, .12, 0, 2.6, -.05, 'black').material = new THREE.MeshStandardMaterial({ color: lin(0x0c0d0e), roughness: .15, metalness: .4 });
        Cy(p, .3, .35, .8, L * .32, 1.2, .4, 'cream', 12); B(p, 1.4, .3, 1, -L * .3, 1.2, .4, 'charcoal');
      }
    });

    Object.assign(D, {
      sofa(p, o) { // sofá contemporâneo estofado (encosto em -z)
        const L = o.len || 9, d = 3.4, c = o.c || 'linen', legs = o.legs || 'walnut';
        const mod = (q, l, arms) => {
          [-1, 1].forEach(sx => [-1, 1].forEach(sz => Cy(q, .1, .08, .35, sx * (l / 2 - .3), 0, sz * (d / 2 - .35), legs, 8)));
          Soft(q, l, .75, d, 0, .35, 0, c, .12);                                         // base
          const n = Math.max(1, Math.round(l / 3.2));
          for (let i = 0; i < n; i++) {
            const x = -l / 2 + (i + .5) * l / n;
            Soft(q, l / n - .08, .55, d - 1.05, x, 1.08, .45, c, .2);                     // assento
            Soft(q, l / n - .12, 1.55, .8, x, 1.1, -d / 2 + .55, c, .3).rotation.x = -.1; // encosto
          }
          if (arms) [-1, 1].forEach(s => Soft(q, .7, 1.85, d, s * (l / 2 + .33), .35, 0, c, .25));
        };
        if (o.curved) {
          const R = L * .9, n = 5;
          for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) * (L / R) / n; const q = new THREE.Group(); q.position.set(R * Math.sin(a), 0, -R * (1 - Math.cos(a))); q.rotation.y = -a; p.add(q); mod(q, L / n + .25, false); }
        } else mod(p, L, !o.noArms);
        if (o.l) { const q = new THREE.Group(); q.position.set(-L / 2 + d / 2, 0, d / 2 + o.l / 2 - .2); p.add(q); Soft(q, d, .75, o.l, 0, .35, 0, c, .12); Soft(q, d - .1, .55, o.l - .1, 0, 1.08, 0, c, .2); }
        if (o.throwC) { const t = Soft(p, 1.7, .14, d - .5, L / 2 - 1.3, 1.62, .25, o.throwC, .05); t.rotation.z = .05; }
        const pc = o.pillows || ['cream', o.throwC || 'sand'];
        pc.forEach((k, i) => { const s = Soft(p, 1.25, 1.15, .4, (i % 2 ? 1 : -1) * (L / 2 - .9 - Math.floor(i / 2) * 1.2), 1.6, -d / 2 + 1.25, k, .18); s.rotation.x = -.25; s.rotation.y = (i % 2 ? -1 : 1) * .15; });
      }
    });

    /* ---------- peças tiradas das fotos (terraços, jardins, varandas) ---------- */
    const rnd0 = seed => { let s = seed || 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
    const GREENS = [0x2f6131, 0x3f6a35, 0x4c7a3a, 0x5d8a3f, 0x2a4f2a, 0x6a8f4a];
    /* folhagem: lâminas de folha inclinadas em roseta, instanciadas (uma chamada de desenho por grupo) */
    const LEAF = {};
    function leafGeo(kind) {
      if (LEAF[kind]) return LEAF[kind];
      let g;
      if (kind === 'frond') { // nervura com folíolos dos dois lados
        const v = [];
        for (let i = 0; i < 16; i++) {
          const t = i / 16, l = .34 * Math.sin(Math.PI * (t * .85 + .1));
          [-1, 1].forEach(sd => v.push(0, t, 0, sd * l, t + .1, 0, 0, t + .045, 0));
        }
        v.push(-.02, 0, 0, .02, 0, 0, 0, 1, 0);
        g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
      }
      else if (kind === 'fern') { g = new THREE.PlaneGeometry(.22, 1, 1, 4); g.translate(0, .5, 0); }
      else if (kind === 'blade') { g = new THREE.PlaneGeometry(.12, 1, 1, 3); g.translate(0, .5, 0); }
      else { g = new THREE.CircleGeometry(.5, 12); g.scale(.62, 1, 1); g.translate(0, .52, 0); }
      // leve curvatura: a ponta cai
      const pos = g.attributes.position;
      const droop = kind === 'frond' ? .7 : .28;
      for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); pos.setZ(i, -y * y * droop); }
      g.computeVertexNormals();
      return (LEAF[kind] = g);
    }
    const leafMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .62, metalness: 0, side: THREE.DoubleSide });
    // clumps: [{ x, y, z, s, n, kind, tint, tilt }]
    // copa: folhas espalhadas dentro de esferas [x, y, z, raio], viradas para fora
    function crown(p, balls, tints, leaf, seed) {
      const r = rnd0(seed || 7), clumps = [];
      balls.forEach(([x, y, z, R]) => {
        const n = Math.round(26 * R * R / (leaf * leaf) * .09) + 14;
        for (let i = 0; i < n; i++) {
          const u = r() * 2 - 1, a = r() * 6.283, rr = R * Math.cbrt(.35 + r() * .65), q = Math.sqrt(1 - u * u);
          clumps.push({ x: x + Math.cos(a) * q * rr, y: y + u * rr * .8, z: z + Math.sin(a) * q * rr, s: leaf, n: 1, kind: 'leaf', tilt: .4 + r() * 1.4, tint: tints[(r() * tints.length) | 0] });
        }
      });
      foliage(p, clumps, seed);
    }
    function foliage(p, clumps, seed) {
      const r = rnd0(seed || 5), byKind = {};
      clumps.forEach(c => (byKind[c.kind || 'leaf'] = byKind[c.kind || 'leaf'] || []).push(c));
      Object.keys(byKind).forEach(kind => {
        const list = byKind[kind], total = list.reduce((t, c) => t + c.n, 0);
        const im = new THREE.InstancedMesh(leafGeo(kind), leafMat, total);
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), colr = new THREE.Color();
        let i = 0;
        list.forEach(c => {
          for (let k = 0; k < c.n; k++) {
            const a = k / c.n * Math.PI * 2 + r() * .6, tilt = (c.tilt || .9) + (r() - .5) * .5, s = c.s * (.65 + r() * .5);
            e.set(-tilt, a, 0, 'YXZ'); q.setFromEuler(e);
            v.set(c.x, c.y + (k % 3) * .12 * c.s, c.z); sc.set(s, s, s);
            m4.compose(v, q, sc); im.setMatrixAt(i, m4);
            colr.set(c.tint != null ? c.tint : GREENS[(r() * GREENS.length) | 0]).convertSRGBToLinear().multiplyScalar(.82 + r() * .3);
            im.setColorAt(i, colr); i++;
          }
        });
        im.castShadow = true; im.receiveShadow = true; p.add(im);
      });
    }
    Object.assign(D, {
      umbrella(p, o) { // guarda-sol de lona com base
        const r = o.r || 3.2;
        Cy(p, .7, .8, .3, 0, 0, 0, 'charcoal', 18);
        Cy(p, .07, .07, 6.4, 0, .3, 0, o.pole || 'oak', 8);
        const m = M(o.c || 'cream').clone(); m.side = THREE.DoubleSide;
        const top = new THREE.Mesh(new THREE.ConeGeometry(r, 1.1, 16, 1, true), m);
        top.position.y = 6.5; top.castShadow = true; p.add(top);
        for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, rib = B(p, .06, .06, r, Math.cos(a) * r / 2, 6.2, Math.sin(a) * r / 2, o.pole || 'oak'); rib.rotation.y = -a + Math.PI / 2; rib.rotation.x = -.33; }
      },
      pouf(p, o) { Cy(p, o.r || .95, o.r || .95, o.h || 1.1, 0, 0, 0, o.c || 'jute', 22); Cy(p, (o.r || .95) * .9, (o.r || .95), .12, 0, o.h || 1.1, 0, shade(col(o.c || 'jute'), .9), 22); },
      bar(p, o) { // balcão de bar com banquetas e garrafas (costas em -z)
        const L = o.len || 8;
        B(p, L, 3.1, 1.8, 0, 0, 0, o.base || 'walnut'); B(p, L + .2, .18, 2.3, 0, 3.1, .2, o.top || 'travertine');
        B(p, L, 4, .3, 0, 0, -1.1, o.back || o.base || 'walnut');
        [0, 1].forEach(k => B(p, L - .6, .1, .7, 0, 4.4 + k * 1.3, -1, o.base || 'walnut'));
        const bc = [0x3d5c3a, 0x6b3a22, 0xd9c79a, 0x2b2b2b, 0x8a4a2a, 0xe9e2d0];
        for (let i = 0; i < 14; i++) { const x = -L / 2 + .6 + i * (L - 1.2) / 13, sh = i % 2; Cy(p, .14, .16, .7 + (i % 3) * .15, x, 4.5 + sh * 1.3, -1, bc[i % bc.length], 8).material = new THREE.MeshStandardMaterial({ color: lin(bc[i % bc.length]), roughness: .15, metalness: .1 }); }
        const n = o.stools || 3;
        for (let i = 0; i < n; i++) { const g = new THREE.Group(); g.position.set((i - (n - 1) / 2) * (L / n), 0, 2.1); p.add(g); if (THREE.GLTFLoader) model(g, 'bar_chair_round_01', { hgt: 2.9 }); else D.stools(g, { n: 1 }); }
      },
      bbench(p, o) { // banco de alvenaria contínuo com almofadas e encosto de madeira (costas em -z)
        const L = o.len || 10, n = Math.max(2, Math.round(L / 2.4));
        B(p, L, 1.2, 2.6, 0, 0, 0, o.base || 'travertine');
        B(p, L, 2.4, .5, 0, 0, -1.3, o.back || 'freijo');
        Soft(p, L - .1, .45, 2.2, 0, 1.2, .1, o.c || 'linen', .18);
        for (let i = 0; i < n; i++) { const x = -L / 2 + (i + .5) * L / n; const c = Soft(p, L / n - .35, 1.4, .55, x, 1.6, -.75, i % 3 === 1 ? (o.accent || 'sand') : (o.c || 'linen'), .25); c.rotation.x = -.18; }
      },
      stones(p, o) { // pisantes de travertino no gramado
        const n = o.n || 5, len = o.len || 12;
        for (let i = 0; i < n; i++) B(p, o.w || 3.4, .12, o.d || 1.3, (i % 2 ? .25 : -.25), 0, -len / 2 + (i + .5) * len / n, o.c || 'travertine').castShadow = false;
      },
      shrubs(p, o) { // maciço tropical (costela-de-adão, filodendros, capim, helicônias) ao longo de len × d
        const L = o.len || 10, Dd = o.d || 2.6, r = rnd0(o.seed || 11), n = Math.max(2, Math.round(L * Dd * (o.dense || .3)));
        const clumps = [];
        for (let i = 0; i < n; i++) {
          const x = (r() - .5) * L, z = (r() - .5) * Dd, t = r();
          if (t < .5) clumps.push({ x, y: 0, z, s: 1.3 + r() * 1.1, n: 9 + (r() * 5 | 0), kind: 'leaf', tilt: .95 });
          else if (t < .75) clumps.push({ x, y: 0, z, s: 1.4 + r() * .8, n: 16, kind: 'fern', tilt: .75 });
          else clumps.push({ x, y: 0, z, s: 1.6 + r() * 1.2, n: 22, kind: 'blade', tilt: .35 });
          if (r() > .85) Ball(p, .2, x + .2, 1.2 + r() * .6, z, r() > .5 ? 0xc5532e : 0xe0b23a, 1, 1.4, 1);
        }
        foliage(p, clumps, o.seed || 11);
        const tall = Math.round(L / (o.palmEvery || 7));
        for (let i = 0; i < tall; i++) { const g = new THREE.Group(); g.position.set(-L / 2 + (i + .5) * L / tall + (r() - .5), 0, (r() - .5) * Dd * .5); p.add(g); D.plant(g, { kind: r() > .5 ? 'palm' : 'monstera', s: .7 + r() * .5, pot: 'none' }); }
      },
      planter(p, o) { // floreira de concreto/travertino com folhagem
        const L = o.len || 6, W = o.wid || 1.8, h = o.h || 1.5;
        B(p, L, h, W, 0, 0, 0, o.c || 'concrete'); B(p, L - .3, .08, W - .3, 0, h - .05, 0, 0x4a3a2a);
        const g = new THREE.Group(); g.position.y = h - .1; p.add(g);
        D.shrubs(g, { len: L - .6, d: W - .5, seed: o.seed || 3, dense: .9, palmEvery: o.tree ? 99 : 99 });
        if (o.tree) { const t = new THREE.Group(); t.position.y = h; p.add(t); D.plant(t, { kind: o.tree, s: o.s || 1.1, pot: 'none' }); }
      },
      grill(p, o) { // churrasqueira em inox sobre bancada
        const L = o.len || 4;
        B(p, L, 2.6, 2.2, 0, 0, 0, o.base || 'concrete'); B(p, L + .1, .15, 2.3, 0, 2.6, 0, o.top || 'travertine');
        B(p, 2.4, .9, 1.6, -L * .18, 2.75, 0, null).material = metal('steel');
        B(p, 2.3, .06, 1.5, -L * .18, 3.66, 0, 'charcoal');
      },
      deckchair(p, o) { // espreguiçadeira de madeira com colchonete (pés para +z)
        const w = o.wood || 'oak';
        B(p, 2.2, .5, 6, 0, .3, 0, w); [-1, 1].forEach(sx => [-1, 1].forEach(sz => B(p, .2, .3, .2, sx * .9, 0, sz * 2.7, w)));
        Soft(p, 2, .35, 3.9, 0, .8, .9, o.c || 'cream', .15);
        const b = Soft(p, 2, .35, 2.2, 0, 1.4, -1.9, o.c || 'cream', .15); b.rotation.x = -.62;
        if (o.towel) B(p, 1.6, .08, 1, 0, 1.17, 1.9, o.towel);
      }
    });

    // posição na parede: lado n/s/e/w e fração a ao longo dela; o item fica de frente para o centro
    function wallPlace(side, a, w, h, inset) {
      const i = (inset == null ? T + .15 : inset) - .3;
      if (side === 'n') return [a * w, -h / 2 + i, 0];
      if (side === 's') return [a * w, h / 2 - i, Math.PI];
      if (side === 'w') return [-w / 2 + i, a * h, Math.PI / 2];
      return [w / 2 - i, a * h, -Math.PI / 2];
    }

    // Troca os blocos por modelos 3D reais quando existe um equivalente.
    const chairTint = c => !c || /walnut|black|charcoal|darkgrey/.test(c) ? null : c === 'rush' ? 0xa88655 : c;
    function realItem(q, it) {
      if (!THREE.GLTFLoader) return false;
      const T0 = it.t;
      if (T0 === 'sofa') return false; // tecido (linho, oliva): o estofado moderno das fotos, não o capitonê escaneado
      if (T0 === 'sofa') {
        // Estofados escaneados substituem os blocos esquemáticos; mantêm a escala e o tecido de cada projeto.
        const id = it.curved ? 'sofa_03' : (P.id === 'mare' || P.id === 'brise' ? 'sofa_02' : 'Sofa_01');
        const fabric = { olive: 0xd4d1a6, linen: 0xf4eee2, white: 0xfaf8f2, caramel: 0xd9ad88 }[it.c] || 0xf4eee2;
        model(q, id, { w: it.len || 9, tint: fabric, plain: false });
        return true;
      }
      if (T0 === 'armchair') { model(q, 'modern_arm_chair_01', { w: 3, tint: it.c || 'white' }); return true; }
      if (T0 === 'lounge') { model(q, 'mid_century_lounge_chair', { w: 3, tint: it.c && it.c !== 'caramel' ? it.c : null }); return true; }
      if (T0 === 'coffee' && it.shape !== 'round' && /travertine|marble|stone/.test(it.c || '')) return false;
      if (T0 === 'coffee') {
        if (it.shape === 'round' && it.c && it.c !== 'white') {
          const r = (it.s || 4.5) / 2, tc = it.c, top = new THREE.Mesh(new THREE.CylinderGeometry(r, r, .22, 48), realMat(tc, r * 2, r * 2) || M(tc));
          top.position.y = 1.3; top.castShadow = top.receiveShadow = true; q.add(top);
          Cy(q, r * .55, r * .6, 1.2, 0, 0, 0, it.base || tc, 32);
          D.books && B(q, 1.6, .3, 1.1, r * .3, 1.41, -.2, 'cream'); B(q, 1.3, .25, .9, r * .3, 1.71, -.2, 'charcoal');
        } else model(q, it.shape === 'round' ? 'coffee_table_round_01' : 'modern_coffee_table_01', { w: it.s ? it.s * 1.1 : 4.5 });
        if (it.bowl) model(q, 'wooden_bowl_01', { w: 1.2, y: 1.4 });
        if (it.vases) model(q, 'ceramic_vase_03', { hgt: 1.3, y: 1.4, x: -.8 });
        return true;
      }
      if (T0 === 'side') { model(q, 'side_table_01', { w: 1.8 }); if (it.lamp) D.tlamp(q, { c: it.lamp, y: 1.75 }); return true; }
      if (T0 === 'chair') { model(q, 'dining_chair_02', { w: 1.7, tint: chairTint(it.c) }); return true; }
      if (T0 === 'stools') { const n = it.n || 3; for (let i = 0; i < n; i++) model(q, 'bar_chair_round_01', { hgt: 2.9, x: (i - (n - 1) / 2) * (it.gap || 2) }); return true; }
      if (T0 === 'table' && it.kind !== 'round') {
        const L = it.len || 10, W = it.wid || 3.6, n = it.chairs || 0;
        const wood = /charcoal|black/.test(it.c || '') ? mat(0x1c1c1b, { roughness: .45 }) : pbr(/walnut/.test(it.c || '') ? 'walnut_veneer' : 'oak_veneer_01', L / 6, W / 6, /walnut/.test(it.c || '') ? { tint: 0x9a7357 } : undefined);
        B(q, L, .25, W, 0, 2.3, 0, wood);
        if (it.base === 'trestle') [-1, 1].forEach(sd => B(q, .45, 2.3, W - .8, sd * (L / 2 - 1.2), 0, 0, wood));
        else [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => B(q, .28, 2.3, .28, sx * (L / 2 - .4), 0, sz * (W / 2 - .4), wood));
        if (it.settings) { const per0 = Math.max(1, Math.floor(n / 2)); for (let i = 0; i < per0; i++) [-1, 1].forEach(sd => Cy(q, .45, .45, .05, -L / 2 + (i + .5) * L / per0, 2.55, sd * (W / 2 - .7), 'cream', 16)); }
        const per = Math.max(1, Math.floor(n / 2));
        for (let i = 0; i < per; i++) { const x = -L / 2 + (i + .5) * L / per; [-1, 1].forEach(sd => { const g = new THREE.Group(); g.position.set(x, 0, sd * (W / 2 + .9)); g.rotation.y = sd > 0 ? Math.PI : 0; q.add(g); model(g, 'dining_chair_02', { w: 1.7, tint: chairTint(it.chairC) }); }); }
        if (it.vase) model(q, 'ceramic_vase_01', { hgt: 1.4, y: 2.55 });
        if (it.bowl) model(q, 'wooden_bowl_01', { w: 1.6, y: 2.55 });
        return true;
      }
      if (T0 === 'table' && it.kind === 'round') {
        const r = it.r || 2.6, n = it.chairs || 0;
        { const tc = it.c || 'oak', top = new THREE.Mesh(new THREE.CylinderGeometry(r, r, .2, 48), realMat(tc, r * 2, r * 2) || M(tc)); top.position.y = 2.55; top.castShadow = top.receiveShadow = true; q.add(top);
          Cy(q, .35, .35, 2.4, 0, .15, 0, it.base || tc, 20); Cy(q, r * .45, r * .5, .15, 0, 0, 0, it.legs || it.base || tc, 32);
          if (it.vase !== false) { Cy(q, .3, .4, .9, 0, 2.65, 0, 'cream', 14); Ball(q, .5, 0, 3.8, 0, 'leaf', .8, 1.2, .8); } }
        for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const g = new THREE.Group(); g.position.set(Math.sin(a) * (r + 1), 0, Math.cos(a) * (r + 1)); g.rotation.y = a + Math.PI; q.add(g); model(g, 'dining_chair_02', { w: 1.7, tint: chairTint(it.chairC) }); }
        return true;
      }
      if (T0 === 'plant') {
        const s0 = it.s || 1, k = it.kind || 'olive';
        const id = (k === 'fiddle' || k === 'tree' || k === 'olive') ? 'pachira_aquatica_01' : k === 'monstera' ? 'calathea_orbifolia_01' : k === 'fern' ? 'potted_plant_04' : null;
        if (!id || it.pot === 'none') return false;
        model(q, id, { hgt: (k === 'fern' || k === 'monstera' ? 3.2 : 6) * s0 });
        return true;
      }
      if (T0 === 'pendant') {
        const n = it.n || 1, gap = it.gap || 2.6;
        for (let i = 0; i < n; i++) model(q, 'modern_ceiling_lamp_01', { hgt: 2.4, x: (i - (n - 1) / 2) * gap, y: H - 2.6 });
        return true;
      }
      if (T0 === 'books') return false;
      if (T0 === 'console' && /white|cream/.test(it.c || '')) return false;
      if (T0 === 'console') {
        model(q, 'modern_wooden_cabinet', { w: it.len || 6 });
        if (it.vase) model(q, 'ceramic_vase_03', { hgt: 1.6, y: 2.2, x: (it.len || 6) * .3 });
        if (it.bowl) model(q, 'wooden_bowl_01', { w: 1.2, y: 2.2, x: -(it.len || 6) * .25 });
        return true;
      }
      return false;
    }

    const INSET = { gallery: .75, wardrobe: 1.4, laundry: 1.4, shelf: .75, towel: .6, tvwall: 1, desk: 1.4, art: .75, curtain: .9, books: 1.4, run: 1.9, console: 1.4, tv: 1.4, vanity: 1.6, bed: 5, night: 1.6, niche: 1.5, bench: 1.2, toilet: 1.6, fireplace: 1.4, sculpture: .9 };
    const FLOOR_BLOCKERS = new Set(['bench', 'bed', 'books', 'console', 'desk', 'fireplace', 'laundry', 'night', 'niche', 'run', 'shelf', 'toilet', 'tvwall', 'vanity', 'wardrobe']);
    const DOOR_CLEARANCE = .8, WALL_ITEM_CLEARANCE = .35;
    const WALKWAY_ITEMS = new Set(['armchair', 'bar', 'bed', 'bench', 'books', 'console', 'deckchair', 'desk', 'fireplace', 'grill', 'island', 'laundry', 'lounge', 'night', 'planter', 'pouf', 'run', 'shelf', 'side', 'sofa', 'table', 'toilet', 'tub', 'tvwall', 'vanity', 'wardrobe']);
    function itemSpan(it) {
      if (it.t === 'bed' || it.t === 'fireplace') return it.w || it.len || 5;
      if (it.len || it.w) return it.len || it.w;
      return ({ night: 2.2, niche: 4, toilet: 3, fireplace: 5, books: 5, shelf: 5 }[it.t] || 4);
    }
    function blocksPassage(r, it, x, z, ry) {
      if (!WALKWAY_ITEMS.has(it.t)) return false;
      const width = it.t === 'table' || it.t === 'sofa' ? it.len || 8 : it.w || it.len || it.wid || (it.t === 'bed' ? 6 : 2.6);
      const depth = it.t === 'bed' ? it.len || 8 : it.t === 'sofa' ? 3.2 : it.t === 'table' ? (it.wid || 3.6) + 2.8 : it.t === 'island' ? it.wid || 3 : it.d || 2.8;
      const cs = Math.abs(Math.cos(ry)), sn = Math.abs(Math.sin(ry));
      const ex = (width * cs + depth * sn) / 2, ez = (width * sn + depth * cs) / 2;
      return ARCH.gaps.some(d => {
        if (d.owner && d.owner !== r.id) return false;
        const edge = d.horiz ? Math.abs(d.c - r.y) < .05 || Math.abs(d.c - r.y - r.h) < .05
          : Math.abs(d.c - r.x) < .05 || Math.abs(d.c - r.x - r.w) < .05;
        if (!d.owner && !edge) return false;
        const along = (d.a + d.b) / 2 - (d.horiz ? r.x + r.w / 2 : r.y + r.h / 2);
        const across = d.c - (d.horiz ? r.y + r.h / 2 : r.x + r.w / 2);
        const halfDoor = (d.b - d.a) / 2 + 1;
        const clearance = d.passage === 'open' ? .8 : 3.2;
        return d.horiz ? Math.abs(x - along) < halfDoor + ex && Math.abs(z - across) < clearance + ez
          : Math.abs(z - along) < halfDoor + ez && Math.abs(x - across) < clearance + ex;
      });
    }
    function decorate(g, spec, r) {
      const occupied = { n: [], s: [], w: [], e: [] };
      spec.items.forEach(it => {
        if (it.t === 'pendant') return; // maquete em corte: luminárias suspensas flutuariam sobre a planta
        const q = new THREE.Group();
        let x, z, ry;
        if (it.wall) {
          let a = it.a || 0;
          if (FLOOR_BLOCKERS.has(it.t)) {
            const length = it.wall === 'n' || it.wall === 's' ? r.w : r.h;
            const span = Math.min(length, itemSpan(it));
            const doors = sharedDoors(r, it.wall);
            const wallItems = occupied[it.wall];
            const wanted = a * length;
            const min = -length / 2 + span / 2, max = length / 2 - span / 2;
            const candidates = [wanted, ...doors.flatMap(d => [d.center - d.width / 2 - span / 2 - DOOR_CLEARANCE, d.center + d.width / 2 + span / 2 + DOOR_CLEARANCE])]
              .map(v => Math.max(min, Math.min(max, v)))
              .filter((v, i, all) => all.findIndex(n => Math.abs(n - v) < .01) === i)
              .filter(v => doors.every(d => Math.abs(v - d.center) >= (d.width + span) / 2 + DOOR_CLEARANCE))
              .filter(v => wallItems.every(item => Math.abs(v - item.center) >= (span + item.span) / 2 + WALL_ITEM_CLEARANCE))
              .sort((u, v) => Math.abs(u - wanted) - Math.abs(v - wanted));
            if ((doors.length || wallItems.length) && !candidates.length) return;
            if (candidates.length) {
              a = candidates[0] / length;
              wallItems.push({ center: candidates[0], span });
            }
          }
          [x, z, ry] = wallPlace(it.wall, a, r.w, r.h, it.inset != null ? it.inset : (INSET[it.t] || T + .15));
          // não pendura nada onde a parede não existe (vão aberto ou porta)
          if (!FLOOR_BLOCKERS.has(it.t)) {
            const length = it.wall === 'n' || it.wall === 's' ? r.w : r.h, u = a * length, half = itemSpan(it) / 2;
            if (sharedDoors(r, it.wall).some(d => Math.abs(u - d.center) < d.width / 2 + half - .2)) return;
          }
          ry += (it.r || 0) * Math.PI / 180;
        }
        else {
          x = (it.x || 0) * r.w; z = (it.z || 0) * r.h; ry = (it.r || 0) * Math.PI / 180;
          if (blocksPassage(r, it, x, z, ry)) return;
        }
        if (it.t === 'pergola') { it.w = it.w || r.w; it.d = it.d || r.h; }
        q.position.set(x, FH, z); q.rotation.y = ry; g.add(q);
        try { if (!realItem(q, it) && D[it.t]) D[it.t](q, it); } catch (e) { console.warn('[planta3d]', it.t, e); }
      });
    }

    /* ---------- cômodos ---------- */
    const H = 6, T = .5, FH = .5;
    // portas e vãos (de P.plan pelo arquivo planta3d-arq.js) que caem no lado `side` do cômodo r, em coordenadas locais
    const sharedDoors = (r, side) => {
      const horizontal = side === 'n' || side === 's';
      const line = side === 'n' ? r.y : side === 's' ? r.y + r.h : side === 'w' ? r.x : r.x + r.w;
      const start = horizontal ? r.x : r.y, end = start + (horizontal ? r.w : r.h);
      return ARCH.gaps.filter(d => d.horiz === horizontal && Math.abs(d.c - line) < .05 && d.b > start && d.a < end)
        .map(d => ({ center: (d.a + d.b) / 2 - (start + end) / 2, width: d.b - d.a }))
        .concat((ARCH.partGaps[r.id] || []).filter(d => d.side === side))
        .sort((a, b) => a.center - b.center);
    };

    /* ---------- arquitetura: uma parede por divisa, portas só onde existem (planta3d-arq.js) ---------- */
    const DECOR = (window.AZPlanDecor || {})[P.id] || {};
    const ARCH = (function () {
      const EPS = .05, byId = {};
      rooms.forEach(r => { byId[r.id] = r; });
      const outdoor = id => !!OUTDOOR[kindOf(byId[id])] || (ARQ.outdoor || []).includes(id);
      const key = (a, b) => [a, b].sort().join('|');
      const openSet = new Set((ARQ.open || []).map(p => key(p[0], p[1])));
      const glassSet = new Set((ARQ.glass || []).map(p => key(p[0], p[1])));
      const spec = id => DECOR[id] || {};
      const sidesOf = r => [
        { s: 'n', horiz: true, c: r.y, a: r.x, b: r.x + r.w }, { s: 's', horiz: true, c: r.y + r.h, a: r.x, b: r.x + r.w },
        { s: 'w', horiz: false, c: r.x, a: r.y, b: r.y + r.h }, { s: 'e', horiz: false, c: r.x + r.w, a: r.y, b: r.y + r.h }
      ];
      const opp = { n: 's', s: 'n', w: 'e', e: 'w' };
      const edges = [];
      rooms.forEach((r, i) => sidesOf(r).forEach(S => {
        const cuts = [];
        rooms.forEach((o, j) => {
          if (o === r) return;
          const O = sidesOf(o).find(q => q.s === opp[S.s]);
          if (Math.abs(O.c - S.c) > EPS) return;
          const lo = Math.max(S.a, O.a), hi = Math.min(S.b, O.b);
          if (hi - lo < .3) return;
          cuts.push([lo, hi]);
          if (i < j) edges.push({ horiz: S.horiz, c: S.c, a: lo, b: hi, A: r, B: o, sA: S.s, sB: O.s });
        });
        cuts.sort((u, v) => u[0] - v[0]);
        let cur = S.a;
        const ext = (a, b) => edges.push({ horiz: S.horiz, c: S.c, a, b, A: r, B: null, sA: S.s });
        cuts.forEach(([lo, hi]) => { if (lo - cur > .3) ext(cur, lo); cur = Math.max(cur, hi); });
        if (S.b - cur > .3) ext(cur, S.b);
      }));
      edges.forEach(e => {
        const A = e.A, B = e.B, oa = outdoor(A.id), ob = B && outdoor(B.id), sa = spec(A.id);
        const force = (ARQ.ext || {})[A.id + ':' + e.sA];
        if (!B) {
          if (oa) e.type = force || (ARQ.rail ? 'rail' : 'none');
          else if (force) e.type = force;
          else if ((sa.glass || []).includes(e.sA)) e.type = 'glass';
          else if ((sa.solid || []).includes(e.sA) || /^(banho|servico)$/.test(kindOf(A))) e.type = 'wall';
          else e.type = 'glass';
        } else if (oa && ob) e.type = 'none';
        else if (oa || ob || glassSet.has(key(A.id, B.id))) e.type = 'glass';
        else if (openSet.has(key(A.id, B.id)) || sa.open || spec(B.id).open) e.type = 'none';
        else e.type = 'wall';
        e.gaps = [];
      });
      // divisórias internas (banheiros, closets, quartos): p = [x1, z1, x2, z2] em fração do cômodo
      Object.keys(ARQ.parts || {}).forEach(id => {
        const r = byId[id]; if (!r) return;
        ARQ.parts[id].forEach(pt => {
          const X = f => r.x + (f + .5) * r.w, Y = f => r.y + (f + .5) * r.h;
          const [x1, z1, x2, z2] = pt.p, horiz = Math.abs(z1 - z2) < 1e-6;
          const e = horiz ? { horiz, c: Y(z1), a: Math.min(X(x1), X(x2)), b: Math.max(X(x1), X(x2)) }
            : { horiz, c: X(x1), a: Math.min(Y(z1), Y(z2)), b: Math.max(Y(z1), Y(z2)) };
          Object.assign(e, { A: r, B: null, part: true, type: pt.glass ? 'glassin' : 'wall', gaps: [], clad: pt.clad });
          if (pt.door != null) {
            const w = pt.dw || 3, c = e.a + pt.door * (e.b - e.a);
            e.gaps.push({ a: c - w / 2, b: c + w / 2, leaf: !pt.open, sign: pt.into || 1, hinge: pt.hinge });
          }
          edges.push(e);
        });
      });
      // portas entre cômodos: [a, b, posição 0–1 ao longo da divisa, largura, { open, hinge }]
      const gaps = [];
      (ARQ.doors || []).forEach(([a, b, at, w, o]) => {
        o = o || {};
        const list = edges.filter(e => e.B && key(e.A.id, e.B.id) === key(a, b) && e.type === 'wall').sort((u, v) => (v.b - v.a) - (u.b - u.a));
        const e = list[0];
        if (!e) { console.warn('[planta3d] sem divisa para porta', a, b); return; }
        w = Math.min(w || 3.2, e.b - e.a - 1);
        const c = Math.max(e.a + w / 2 + .5, Math.min(e.b - w / 2 - .5, e.a + (at == null ? .5 : at) * (e.b - e.a)));
        const to = byId[b], mid = e.horiz ? to.y + to.h / 2 : to.x + to.w / 2;
        const g = { a: c - w / 2, b: c + w / 2, leaf: !o.open, sign: mid > e.c ? 1 : -1, hinge: o.hinge };
        e.gaps.push(g);
        gaps.push({ horiz: e.horiz, c: e.c, a: g.a, b: g.b });
      });
      edges.forEach(e => {
        if (e.part) e.gaps.forEach(g => gaps.push({ horiz: e.horiz, c: e.c, a: g.a, b: g.b, owner: e.A.id }));
      });
      // lados abertos (ambientes integrados) também não recebem móveis encostados
      edges.forEach(e => { if (e.B && e.type === 'none' && !outdoor(e.A.id) && !outdoor(e.B.id)) gaps.push({ horiz: e.horiz, c: e.c, a: e.a, b: e.b, passage: 'open' }); });
      return { edges, gaps, partGaps: {} };
    })();

    rooms.forEach(r => {
      const kind = kindOf(r);
      const g = new THREE.Group();
      g.userData.room = r.id;
      const cx = r.x + r.w / 2 - CX, cz = r.y + r.h / 2 - CZ;
      g.position.set(cx, 0, cz);
      scene.add(g);
      roomGroups[r.id] = g;

      // decoração tirada das fotos do ambiente (assets/js/planta3d-decor.js), quando existe
      let spec = ((window.AZPlanDecor || {})[P.id] || {})[r.id] || null;
      const addI = (ARQ.items || {})[r.id], dropI = (ARQ.drop || {})[r.id];
      const hit = (it, k) => dropI.some(d => typeof d === 'number' ? d === k : Object.keys(d).every(q => it[q] === d[q]));
      if (spec && dropI) spec = Object.assign({}, spec, { items: dropI === true ? [] : spec.items.filter((it, k) => !hit(it, k)) });
      if (addI) spec = Object.assign({}, spec || {}, { items: ((spec && spec.items) || []).concat(addI) });

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
        fm = new THREE.MeshStandardMaterial({ color: baseC, roughness: stoneKind ? .38 : .52, map: t || null, envMapIntensity: .9 });
      }
      const fl = mesh(g, r.w, FH, r.h, 0, 0, 0, fm);
      fl.castShadow = false;
      fl.userData.room = r.id; fl.userData.base = baseC;
      floors[r.id] = fl;
      // pisos de outro material dentro do cômodo (banheiro, closet): z = [x1, z1, x2, z2] em fração
      ((ARQ.zones || {})[r.id] || []).forEach(zn => {
        const [x1, z1, x2, z2] = zn.r, zw = (x2 - x1) * r.w, zd = (z2 - z1) * r.h;
        const zm = mesh(g, zw, .04, zd, (x1 + x2) / 2 * r.w, FH, (z1 + z2) / 2 * r.h, floorMat(zn.floor, zw, zd));
        zm.castShadow = false; zm.userData.room = r.id;
      });

      if (!OUTDOOR[kind]) {
        const pl = new THREE.PointLight(0xffbe7a, 1.5, Math.max(r.w, r.h) * 1.9, 1.6);
        pl.position.set(0, FH + H - .8, 0); g.add(pl);
      } else if (kind === 'clube' || kind === 'jardim') {
        const pl = new THREE.PointLight(0x7fd6e6, .9, 34, 1.6); pl.position.set(0, 4, 0); g.add(pl);
      }
      if (spec && spec.items) decorate(g, spec, r);
      else furnish(g, kind, r.w, r.h, FH);
      g.traverse(o => { if (o.isMesh) o.userData.room = r.id; });
    });

    /* ---------- paredes, portas, caixilhos e guarda-corpos ---------- */
    (function buildArch() {
      const G = new THREE.Group(); scene.add(G);
      const plaster = mat(0xf7f4ee, { roughness: .92 });
      const frameM = mat(0x3b3d40, { metalness: .45, roughness: .4 });
      const glassM = new THREE.MeshStandardMaterial({ color: lin(0xcfe2ea), roughness: .05, metalness: .1, transparent: true, opacity: .16, depthWrite: false });
      const doorM = ARQ.door === 'white' ? mat(0xf1ede5, { roughness: .6 }) : pbr(ARQ.door === 'walnut' ? 'walnut_veneer' : 'oak_veneer_01', 1, 2);
      const trimM = ARQ.door === 'white' ? mat(0xf6f3ee) : doorM;
      const knobM = mat(0x8a8780, { metalness: .8, roughness: .3 });
      // caixa ao longo da divisa e: u0..u1 no eixo da divisa, n = afastamento normal, th = espessura normal
      const along = (e, u0, u1, y, h, n, th, m, shadow) => {
        const L = u1 - u0, mid = (u0 + u1) / 2;
        const o = e.horiz ? mesh(G, L, h, th, mid - CX, y, e.c + n - CZ, m) : mesh(G, th, h, L, e.c + n - CX, y, mid - CZ, m);
        if (shadow === false) o.castShadow = false;
        return o;
      };
      const spans = (e, a, b) => { // [a,b] menos os vãos
        const out = []; let cur = a;
        e.gaps.slice().sort((u, v) => u.a - v.a).forEach(g => { if (g.a > cur) out.push([cur, g.a]); cur = Math.max(cur, g.b); });
        if (b > cur) out.push([cur, b]);
        return out;
      };
      const roomSign = (e, r) => ((e.horiz ? r.y + r.h / 2 : r.x + r.w / 2) > e.c ? 1 : -1);
      // juntas de painel, ripado e rodapés: muitas peças iguais → InstancedMesh
      const inst = {};
      const put = (key, mk, e, u, y, n) => { (inst[key] || (inst[key] = Object.assign(mk(), { list: [] }))).list.push(e.horiz ? [u - CX, y, e.c + n - CZ] : [e.c + n - CX, y, u - CZ]); };
      const baseM = mat(0xd9d1c3, { roughness: .8 });
      ARCH.edges.forEach(e => {
        if (e.type === 'none') return;
        const a = e.a - T / 2, b = e.b + T / 2;
        if (e.type === 'wall') {
          spans(e, a, b).forEach(([u0, u1]) => along(e, u0, u1, FH, H, 0, T, plaster));
          // revestimento (madeira, concreto, pedra) só na face do cômodo que o tem
          [e.A, e.B].forEach(r => {
            if (!r) return;
            const w = e.part ? e.clad : (DECOR[r.id] || {}).wall;
            if (!w) return;
            const wm = wallMat(w === 'slats' ? 'wood' : w), faces = e.part ? [1, -1] : [roomSign(e, r)];
            faces.forEach(sg => spans(e, e.a + T / 2, e.b - T / 2).forEach(([u0, u1]) => {
              along(e, u0, u1, FH, H - .04, sg * (T / 2 + .03), .06, w === 'slats' ? mat(0x4a3526) : wm, false);
              if (w === 'slats') { // ripado: réguas de madeira afastadas da parede
                for (let u = u0 + .3; u < u1 - .15; u += .55) put('slat' + e.horiz, () => ({ geo: e.horiz ? new THREE.BoxGeometry(.3, H - .3, .22) : new THREE.BoxGeometry(.22, H - .3, .3), mat: wm }), e, u, FH + (H - .3) / 2, sg * (T / 2 + .17));
              } else if (/wood|walnut|concrete|earth|stone/.test(w)) { // juntas entre painéis/placas
                const step = /concrete|stone/.test(w) ? 3.2 : 1.45;
                for (let u = u0 + step; u < u1 - .3; u += step) put('jt' + e.horiz, () => ({ geo: e.horiz ? new THREE.BoxGeometry(.05, H - .1, .04) : new THREE.BoxGeometry(.04, H - .1, .05), mat: mat(0x2c2219, { roughness: .9 }) }), e, u, FH + (H - .1) / 2, sg * (T / 2 + .065));
                if (/concrete|stone/.test(w)) for (let y = 2; y < H; y += 2) along(e, u0, u1, FH + y, .04, sg * (T / 2 + .065), .04, mat(0x8e877b), false);
              }
            }));
          });
          // rodapé nas faces sem revestimento
          const faceRooms = e.part ? [[e.A, 1], [e.A, -1]] : [[e.A, roomSign(e, e.A)]].concat(e.B ? [[e.B, roomSign(e, e.B)]] : []);
          faceRooms.forEach(([r, sg]) => { if (!e.part && (DECOR[r.id] || {}).wall) return; if (e.part && e.clad) return; spans(e, e.a + T / 2, e.b - T / 2).forEach(([u0, u1]) => along(e, u0, u1, FH, .3, sg * (T / 2 + .03), .06, baseM, false)); });
          e.gaps.forEach(g => {
            // batentes e soleira
            along(e, g.a, g.a + .14, FH, H, 0, T + .08, trimM, false);
            along(e, g.b - .14, g.b, FH, H, 0, T + .08, trimM, false);
            along(e, g.a, g.b, FH, .04, 0, T, mat(0xd9d2c4), false);
            if (!g.leaf) return;
            // folha da porta aberta a 90°, encostada no batente
            const len = g.b - g.a - .28, hu = g.hinge === 'b' ? g.b - .2 : g.a + .2, n0 = g.sign * (T / 2 + len / 2);
            if (e.horiz) mesh(G, .12, H - .15, len, hu - CX, FH, e.c + n0 - CZ, doorM);
            else mesh(G, len, H - .15, .12, e.c + n0 - CX, FH, hu - CZ, doorM);
            const hx = g.sign * (T / 2 + len - .3), hs = g.hinge === 'b' ? -.12 : .12;
            if (e.horiz) mesh(G, .14, .08, .3, hu + hs - CX, FH + H * .52, e.c + hx - CZ, knobM).castShadow = false;
            else mesh(G, .3, .08, .14, e.c + hx - CX, FH + H * .52, hu + hs - CZ, knobM).castShadow = false;
          });
          return;
        }
        if (e.type === 'glass' || e.type === 'glassin') {
          // caixilho piso-teto: perfis finos escuros e vidro
          along(e, a, b, FH, .16, 0, T * .45, frameM, false);
          along(e, a, b, FH + H - .14, .14, 0, T * .45, frameM, false);
          along(e, a, b, FH + .22, H - .42, 0, .08, glassM, false);
          const n = Math.max(1, Math.round((b - a) / 4.2));
          for (let i = 0; i <= n; i++) { const u = Math.min(b - .07, Math.max(a + .07, a + (b - a) * i / n)); along(e, u - .05, u + .05, FH, H, 0, T * .45, frameM, false); }
          return;
        }
        if (e.type === 'rail') {
          // guarda-corpo de vidro com corrimão
          const inS = roomSign(e, e.A) * .2;
          along(e, a + .2, b - .2, FH, 3.5, inS, .1, glassM, false);
          along(e, a + .2, b - .2, FH + 3.5, .12, inS, .16, frameM, false);
        }
      });
      Object.keys(inst).forEach(k => {
        const it = inst[k], im = new THREE.InstancedMesh(it.geo, it.mat, it.list.length), m4 = new THREE.Matrix4();
        it.list.forEach((v, i) => im.setMatrixAt(i, m4.makeTranslation(v[0], v[1], v[2])));
        im.castShadow = k.startsWith('slat'); im.receiveShadow = true; G.add(im);
      });
    })();

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
      if (composer) composer.setSize(w, h);
      dirty = true;
    }

    function place() {
      const s = Math.sin(view.ph), c = Math.cos(view.ph);
      const T0 = view.tgt || [0, 0];
      cam.position.set(T0[0] + view.r * s * Math.sin(view.th), view.r * c + 3, T0[1] + view.r * s * Math.cos(view.th));
      cam.lookAt(T0[0], 0, T0[1]);
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


    /* ---------- oclusão de ambiente (SSAO): sombra de contato em cantos, rodapés e sob os móveis ----------
       Só quando a maquete está parada; girando, desenha direto (rápido). */
    let composer = null, aoPass = null, lastFast = false;
    function setupAO() {
      if (!THREE.EffectComposer || !THREE.SSAOPass || !THREE.ShaderPass) return;
      try {
        const w = box.clientWidth || 600, h = box.clientHeight || 420, pr = renderer.getPixelRatio();
        composer = new THREE.EffectComposer(renderer);
        composer.setPixelRatio(pr);
        aoPass = new THREE.SSAOPass(scene, cam, w, h);
        aoPass.kernelRadius = 1.6; aoPass.minDistance = .0006; aoPass.maxDistance = .006;
        // cena com antisserrilhado (WebGL2)
        if (THREE.WebGLMultisampleRenderTarget && renderer.capabilities.isWebGL2) {
          aoPass.beautyRenderTarget.dispose();
          aoPass.beautyRenderTarget = new THREE.WebGLMultisampleRenderTarget(w * pr, h * pr, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
          aoPass.beautyRenderTarget.samples = 4;
        }
        // vidro e cortinas não entram no cálculo do AO
        const over = aoPass.renderOverride.bind(aoPass);
        aoPass.renderOverride = function () {
          const hid = [];
          scene.traverse(o => { if (o.isMesh && o.visible && o.material && o.material.transparent) { hid.push(o); o.visible = false; } });
          over.apply(null, arguments);
          hid.forEach(o => { o.visible = true; });
        };
        composer.addPass(aoPass);
        // no r128 o tone mapping já sai no render target; falta só converter para sRGB
        const out = new THREE.ShaderPass({
          uniforms: { tDiffuse: { value: null }, exposure: { value: renderer.toneMappingExposure } },
          vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: [
            'uniform sampler2D tDiffuse; uniform float exposure; varying vec2 vUv;',
            'vec3 fit(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }',
            'vec3 aces(vec3 c){ const mat3 I = mat3(vec3(0.59719,0.07600,0.02840), vec3(0.35458,0.90834,0.13383), vec3(0.04823,0.01566,0.83777));',
            '  const mat3 O = mat3(vec3(1.60475,-0.10208,-0.00327), vec3(-0.53108,1.10813,-0.07276), vec3(-0.07367,-0.00605,1.07602));',
            '  c *= exposure / 0.6; c = I * c; c = fit(c); c = O * c; return clamp(c, 0.0, 1.0); }',
            'vec3 srgb(vec3 c){ return mix(pow(c, vec3(0.41666)) * 1.055 - vec3(0.055), c * 12.92, vec3(lessThanEqual(c, vec3(0.0031308)))); }',
            'void main(){ vec4 t = texture2D(tDiffuse, vUv); float a = max(t.a, 1e-4); vec3 c = srgb(clamp(t.rgb / a, 0.0, 1.0)); gl_FragColor = vec4(c * t.a, t.a); }'
          ].join('\n')
        });
        out.material.transparent = true; out.material.blending = THREE.NoBlending;
        composer.addPass(out);
        composer.setSize(w, h);
      } catch (e) { console.warn('[planta3d] AO indisponível', e); composer = null; }
    }
    function draw(fast) {
      if (!composer || fast) { renderer.render(scene, cam); lastFast = !!composer; return; }
      renderer.setClearColor(0x000000, 0);
      composer.render();
      lastFast = false;
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
      if (moving || dirty) { place(); draw(moving || !!drag); paintLabels(); dirty = false; }
      else if (lastFast) draw(false);
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
      auto = false; view.tgt = null;
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
    setupAO(); fit(); place();

    return {
      setView: (th, ph, r) => { auto = false; view.tgt = null; goal.th = view.th = th; goal.ph = view.ph = ph; if (r) goal.r = view.r = r; kick(); },
      snap: (th, ph, r, room) => { const g = room && roomGroups[room]; view.tgt = g ? [g.position.x, g.position.z] : null; goal.th = view.th = th; goal.ph = view.ph = ph; goal.r = view.r = r; place(); draw(false); return canvas; },
      focus: (room, th, ph, k) => { const g = roomGroups[room]; view.tgt = g ? [g.position.x, g.position.z] : null; auto = false; goal.th = view.th = th; goal.ph = view.ph = ph; goal.r = view.r = r0 * (k || .45); place(); kick(); },
      r0: () => r0,
      tweak: fn => { fn(scene, renderer, THREE); dirty = true; kick(); },
      info: () => { let l = 0, m = 0; scene.traverse(o => { if (o.isLight) l++; if (o.isMesh) m++; }); const t = performance.now(); renderer.render(scene, cam); return { ms: performance.now() - t, lights: l, meshes: m, calls: renderer.info.render.calls, tris: renderer.info.render.triangles, geo: renderer.info.memory.geometries, tex: renderer.info.memory.textures, prog: renderer.info.programs.length }; },
      highlight: setActive,
      onPick: fn => { onPick = fn; }
    };
  }

  /* Giro com renders realistas (P.plan.giro = { dir, n }): arrastar gira continuamente, em volta, entre n quadros. */
  function giro(box, P) {
    const G = P.plan.giro;
    if (!G) return null;
    const n = G.n;
    box.classList.add('plan3d--img');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', `Planta realista de ${P.nome}. Arraste para girar.`);
    box.tabIndex = 0;
    const url = i => `${G.dir}f${String(((i % n) + n) % n).padStart(2, '0')}.jpg?v=${G.v || 1}`;
    box.innerHTML = `
      <div class="plan3d__stack"><img class="gA" alt="Planta de ${P.nome}" draggable="false" decoding="async"><img class="gB" alt="" aria-hidden="true" draggable="false" decoding="async"></div>
      <div class="plan3d__ui"><span class="plan3d__hint">Arraste para girar</span>
        <div class="plan3d__btns"><button type="button" data-act="prev" aria-label="Girar para a esquerda">‹</button><button type="button" data-act="next" aria-label="Girar para a direita">›</button></div></div>`;
    const A = box.querySelector('.gA'), B = box.querySelector('.gB');
    // pré-carrega todos os quadros
    for (let i = 0; i < n; i++) { const im = new Image(); im.decoding = 'async'; im.src = url(i); }
    let pos = 0, goal = 0, raf = 0, drag = null, shown = -1;
    const draw = () => {
      const f = Math.round(pos);
      if (f !== shown) { A.src = url(f); shown = f; }
    };
    const tick = () => {
      raf = 0;
      const d = goal - pos;
      if (Math.abs(d) > .002) { pos += d * .22; draw(); raf = requestAnimationFrame(tick); } else { pos = goal; draw(); }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const PX = 28; // pixels por quadro
    box.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; drag = { x: e.clientX, g: goal }; box.setPointerCapture(e.pointerId); box.classList.add('is-drag'); });
    box.addEventListener('pointermove', e => { if (!drag) return; goal = drag.g - (e.clientX - drag.x) / PX; kick(); });
    const end = () => { drag = null; box.classList.remove('is-drag'); };
    box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
    box.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { goal += 1; kick(); e.preventDefault(); } if (e.key === 'ArrowRight') { goal -= 1; kick(); e.preventDefault(); } });
    box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; goal += b.dataset.act === 'prev' ? 2 : -2; kick(); });
    draw();
    return { highlight() {}, onPick() {}, setView() {} };
  }

  window.AZPlan3D = { init, giro };
})();
