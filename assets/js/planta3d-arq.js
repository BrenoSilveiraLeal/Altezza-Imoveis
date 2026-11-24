/* Altezza — arquitetura da planta 3D de cada imóvel.
   As paredes saem das divisas entre os cômodos de P.plan.rooms (uma parede só por divisa).
   Aqui se diz o que cada divisa é:
     open   — ambientes integrados, sem parede;
     doors  — [de, para, posição 0–1 ao longo da divisa, largura, { open: vão sem folha, hinge: 'b' }];
              a folha abre para dentro do cômodo "para"; sem porta listada, a divisa é parede cheia;
     glass  — caixilho de vidro entre dois cômodos internos;
     ext    — fachada forçada: 'cômodo:lado' → 'wall' | 'glass' | 'rail' | 'none';
     parts  — divisórias internas (banheiro, closet, quarto) em fração do cômodo: p = [x1, z1, x2, z2];
     zones  — piso diferente dentro do cômodo (banheiro); r = [x1, z1, x2, z2];
     items / drop — móveis acrescentados ou retirados da decoração (planta3d-decor.js) por causa das divisórias;
     rail   — apartamento: varandas recebem guarda-corpo de vidro;
     door   — acabamento das portas: 'oak' | 'walnut' | 'white'. */
window.AZPlanArq = {
  dossel: {
    rail: true, door: 'oak',
    open: [['hall', 'living'], ['hall', 'jantar'], ['living', 'jantar'], ['jantar', 'cozinha']],
    doors: [
      ['cozinha', 'servico', .3, 3],
      ['jantar', 'suite', .3, 3.2],
      ['living', 'suites', .25, 3.2],
      ['living', 'suites', .75, 3.2, { hinge: 'b' }]
    ],
    ext: { 'suite:e': 'wall' },
    parts: {
      // duas suítes com acessos independentes; os banhos não são inventados nesta planta
      suites: [
        { p: [0, -.5, 0, .5] }
      ],
      // área de serviço sem repartições não documentadas
    },
    drop: {
      terraco: [{ t: 'lounge' }, { t: 'side' }, { t: 'table' }],
      clube: [{ t: 'lounger' }],
      suite: [{ t: 'bed' }, { t: 'night' }, { t: 'art' }, { t: 'curtain' }, { t: 'wardrobe' }, { t: 'bench' }, { t: 'armchair' }, { t: 'flamp' }, { t: 'rug' }],
      suites: true,
      servico: [{ t: 'bed' }, { t: 'night' }, { t: 'wardrobe' }, { t: 'shelf' }]
    },
    items: {
      hall: [
        { t: 'niche', wall: 'e', a: -.31, len: 3.6, c: 'olive' },
        { t: 'niche', wall: 'e', a: .31, len: 3.6, c: 'olive' },
        { t: 'side', x: .3, z: -.12, c: 'travertine' }
      ],
      living: [
        { t: 'curtain', wall: 'e', a: -.42, len: 3, inset: .9 },
        { t: 'armchair', x: .27, z: -.26, r: -55, c: 'linen', legs: 'bronze' },
        { t: 'side', x: .35, z: -.17, c: 'travertine' }
      ],
      terraco: [
        { t: 'table', x: 0, z: .12, len: 12, wid: 3.6, c: 'oak', chairs: 8, chairC: 'rush', settings: true },
        { t: 'sofa', x: .43, z: .3, r: -90, len: 7, c: 'linen', l: 4 },
        { t: 'coffee', x: .25, z: .34, shape: 'round', s: 3.2, c: 'travertine', base: 'travertine', bowl: true },
        { t: 'pouf', x: .27, z: .47, c: 'jute' },
        { t: 'bar', x: -.42, z: -.08, r: 90, len: 7, base: 'walnut', top: 'marble', stools: 3 },
        { t: 'shrubs', x: -.05, z: .47, len: 20, d: 1.6, seed: 5, palmEvery: 9 },
        { t: 'planter', x: .4, z: -.42, len: 4, wid: 2.4, c: 'travertine', tree: 'olive', s: 1 }
      ],
      clube: [
        { t: 'deckchair', x: -.32, z: .34, r: 180, c: 'cream', wood: 'oak', towel: 'olive' },
        { t: 'deckchair', x: -.14, z: .34, r: 180, c: 'cream', wood: 'oak' },
        { t: 'deckchair', x: .04, z: .34, r: 180, c: 'cream', wood: 'oak', towel: 'olive' },
        { t: 'umbrella', x: .25, z: .28, c: 'cream', r: 2.8 },
        { t: 'planter', x: -.05, z: -.45, len: 10, wid: 1.6, c: 'travertine', seed: 9 }
      ],
      suite: [
        { t: 'rug', x: .12, z: .2, w: 13, d: 12, c: 'sand' },
        { t: 'bed', wall: 'e', a: .2, w: 6.5, len: 8, base: 'oak', linen: 'white', throwC: 'cream', stripe: 'olive', head: 0x9c7b58, headW: 12, headH: 3.4, inset: 4.9 },
        { t: 'night', wall: 'e', a: -.02, c: 'travertine', inset: 1.6, reading: 'brass', vase: 'travertine' },
        { t: 'night', wall: 'e', a: .42, c: 'travertine', inset: 1.6, reading: 'brass' },
        { t: 'art', wall: 'w', a: .02, w: 3.4, h: 5.4, y: 1.4, img: 'dossel-suite', frame: 'cream' },
        { t: 'wardrobe', wall: 'w', a: .32, len: 9, c: 'oak' },
        { t: 'bench', x: -.05, z: .2, r: 90, len: 5, d: 1.6, c: 'olive', legs: 'bronze' },
        { t: 'armchair', x: -.3, z: .38, r: 140, c: 'linen' },
        { t: 'flamp', x: -.42, z: .44, c: 'bronze' },
        { t: 'plant', x: .44, z: .44, kind: 'olive', s: .9, pot: 'stone' },
        { t: 'shelf', wall: 'w', a: .02, len: 5, y: 2.2, c: 'oak' },
        { t: 'vase', x: -.44, z: .02, s: .9, c: 'cream' },
        { t: 'curtain', wall: 's', a: -.38, len: 4, inset: .9 },
        { t: 'curtain', wall: 's', a: .38, len: 4, inset: .9 }
      ],
      suites: [
        // quarto 1 (oeste)
        { t: 'bed', x: -.32, z: -.29, w: 6, len: 8, base: 'oak', throwC: 'olive' },
        { t: 'night', wall: 'n', a: -.46, c: 'oak', lamp: 'travertine', inset: 1.6 },
        { t: 'art', wall: 'n', a: -.32, w: 4, h: 2.6, y: 3.6, frame: 'oak', seed: 5, pal: 'olive' },
        { t: 'wardrobe', x: -.465, z: .28, r: 90, len: 8, c: 'oak' },
        { t: 'rug', x: -.3, z: -.05, w: 9, d: 7, c: 'sand' },
        { t: 'desk', x: -.25, z: .42, r: 180, len: 4.5, c: 'oak' },
        // quarto 2 (leste)
        { t: 'bed', x: .32, z: -.29, w: 6, len: 8, base: 'oak', throwC: 'olive' },
        { t: 'night', wall: 'n', a: .46, c: 'oak', lamp: 'travertine', inset: 1.6 },
        { t: 'art', wall: 'n', a: .32, w: 4, h: 2.6, y: 3.6, frame: 'oak', seed: 8, pal: 'earth' },
        { t: 'wardrobe', x: .465, z: .28, r: -90, len: 8, c: 'oak' },
        { t: 'rug', x: .3, z: -.05, w: 9, d: 7, c: 'sand' },
        { t: 'plant', x: .26, z: .42, kind: 'fern', s: .9, pot: 'white' },
        // banheiros
        { t: 'vanity', x: -.085, z: .15, r: 0, len: 4.4, c: 'oak', top: 'travertine', mirror: true },
        { t: 'toilet', x: -.135, z: .42, r: 90 },
        { t: 'shower', x: -.03, z: .38, r: 90, len: 3.4 },
        { t: 'vanity', x: .085, z: .15, r: 0, len: 4.4, c: 'oak', top: 'travertine', mirror: true },
        { t: 'toilet', x: .135, z: .42, r: -90 },
        { t: 'shower', x: .03, z: .38, r: 90, len: 3.4 }
      ],
      servico: [
        { t: 'bed', wall: 's', a: .25, w: 4.5, len: 7, base: 'oak', throwC: 'olive', pillows: 1, inset: 4.3 },
        { t: 'night', wall: 's', a: -.05, c: 'oak', lamp: 'cream', inset: 1.6 },
        { t: 'wardrobe', wall: 'w', a: .25, len: 5, c: 'white' }
      ]
    }
  },

  aurora: {
    rail: true, door: 'white',
    open: [['estar', 'jantar']],
    doors: [
      ['estar', 'suite', .74, 3.2],
      ['jantar', 'suites', .5, 3.2]
    ],
    parts: {
      // suítes: só a separação dos quartos, sem banheiros supostos
      suites: [
        { p: [-.5, 0, .5, 0], door: .5, dw: 3, into: 1 }
      ]
    },
    drop: {
      suite: [{ t: 'wardrobe' }, { t: 'plant' }, { t: 'curtain', a: .4 }, { t: 'flamp' }, { t: 'armchair' }],
      suites: true
    },
    items: {
      jantar: [
        { t: 'console', wall: 's', a: -.28, len: 8, c: 'oak', inset: 1.4, vase: 'cream', bowl: 'oak' },
        { t: 'art', wall: 's', a: -.28, w: 4, h: 6, y: 2.4, img: 'aurora-jantar', frame: 'oak' },
        { t: 'plant', x: .4, z: -.4, kind: 'fiddle', s: 1.3, pot: 'basket' }
      ],
      varanda: [
        { t: 'planter', wall: 'e', a: -.1, len: 10, wid: 1.6, c: 'white', seed: 4, inset: 1.2 },
        { t: 'deckchair', x: -.2, z: .3, r: 0, c: 'white', wood: 'oak' }
      ],
      estar: [
        { t: 'plant', x: .44, z: .05, kind: 'monstera', s: 1, pot: 'basket' },
        { t: 'rug', x: -.32, z: -.25, w: 9, d: 7, c: 'sand' },
        { t: 'armchair', x: -.36, z: -.3, r: 120, c: 'white', frame: 'black' },
        { t: 'side', x: -.42, z: -.16, c: 'black', lamp: 'white' },
        { t: 'books', wall: 'n', a: .36, len: 6, h: 5.4, c: 'white' },
        { t: 'pouf', x: .12, z: .38, c: 'cream', r: .8 },
        { t: 'plant', x: -.08, z: -.42, kind: 'fiddle', s: 1.3, pot: 'basket' },
        { t: 'vase', x: .1, z: .02, s: .7, c: 'charcoal' },
        { t: 'armchair', x: .27, z: .17, r: -75, c: 'white', frame: 'black' },
        { t: 'side', x: .35, z: .28, c: 'oak' }
      ],
      suite: [
        { t: 'armchair', x: -.36, z: .3, r: 60, c: 'white' },
        { t: 'flamp', x: -.44, z: .42, c: 'black' },
        { t: 'wardrobe', wall: 'n', a: .4, len: 8, c: 'white' },
        { t: 'wardrobe', wall: 'e', a: -.2, len: 8, c: 'white' },
        { t: 'plant', x: .22, z: .4, kind: 'olive', s: 1.2, pot: 'stone' },
        { t: 'curtain', wall: 'w', a: -.3, len: 4, inset: .9 },
        { t: 'console', wall: 'w', a: .15, len: 6, c: 'oak', inset: 1.4, vase: 'cream' },
        { t: 'side', x: -.3, z: .38, c: 'black' }
      ],
      suites: [
        // quarto 1
        { t: 'bed', x: -.25, z: -.27, w: 6, len: 8, base: 'oak', throwC: 'cream' },
        { t: 'night', x: -.36, z: -.35, c: 'oak', lamp: 'white' },
        { t: 'wardrobe', x: .35, z: -.38, r: 90, len: 7, c: 'white' },
        { t: 'rug', x: -.25, z: -.27, w: 9, d: 7, c: 'sand' },
        // quarto 2
        { t: 'bed', x: .25, z: .27, r: 180, w: 6, len: 8, base: 'white', throwC: 'sand' },
        { t: 'night', x: .36, z: .35, c: 'white', lamp: 'cream' },
        { t: 'wardrobe', x: -.35, z: .38, r: 90, len: 7, c: 'oak' },
        { t: 'rug', x: .25, z: .27, w: 9, d: 7, c: 'cream' }
      ]
    }
  },

  copa: {
    rail: true, door: 'walnut',
    open: [['jantar', 'biblioteca'], ['biblioteca', 'cozinha']],
    doors: [
      ['jantar', 'suite', .9, 3.2],
      ['suite', 'banho', .25, 3],
      ['cozinha', 'servico', .85, 3]
    ],
    parts: {
      // o banho é um cômodo próprio na planta
    },
    drop: {
      servico: [{ t: 'desk' }, { t: 'laundry' }, { t: 'plant' }, { t: 'rug' }],
      banho: true
    },
    items: {
      suite: [
        { t: 'console', wall: 'n', a: -.38, len: 6, c: 'walnut', vase: 'terracotta', inset: 1.4 },
        { t: 'armchair', x: -.3, z: .05, r: 70, c: 'linen' },
        { t: 'side', x: -.36, z: .16, c: 'walnut', lamp: 'terracotta' },
        { t: 'rug', x: -.33, z: .1, w: 8, d: 7, c: 'sand' },
        { t: 'curtain', wall: 's', a: -.38, len: 5, inset: .9 },
        { t: 'curtain', wall: 'w', a: -.3, len: 4, inset: .9 }
      ],
      biblioteca: [
        { t: 'desk', wall: 'w', a: .3, len: 5, c: 'walnut', lamp: 'brass' },
        { t: 'armchair', x: .15, z: -.3, r: -140, c: 'caramel' },
        { t: 'rug', x: .08, z: .05, w: 10, d: 8, c: 'jute' },
        { t: 'side', x: .25, z: -.16, c: 'walnut' }
      ],
      cozinha: [
        { t: 'table', x: .3, z: .36, kind: 'round', r: 2.4, c: 'walnut', base: 'walnut', chairs: 4, chairC: 'walnut' },
        { t: 'rug', x: .3, z: .36, w: 9, d: 9, c: 'jute' },
        { t: 'wardrobe', wall: 's', a: -.25, len: 8, c: 'walnut' }
      ],
      jantar: [
        { t: 'plant', x: -.45, z: -.38, kind: 'olive', s: 1.1, pot: 'stone' },
        { t: 'curtain', wall: 'w', a: -.35, len: 4, inset: .9 },
        { t: 'rug', x: .1, z: .12, w: 15, d: 10, c: 'jute' },
        { t: 'console', wall: 's', a: .05, len: 9, c: 'walnut', vase: 'terracotta', bowl: 'walnut', inset: 1.4 },
        { t: 'art', wall: 's', a: .05, w: 5, h: 3.4, y: 2.6, frame: 'walnut', seed: 19, pal: 'earth' },
        { t: 'armchair', x: -.2, z: .1, r: 40, c: 'caramel' },
        { t: 'flamp', x: -.45, z: .25, c: 'brass' },
        { t: 'plant', x: .44, z: -.4, kind: 'fiddle', s: 1.2, pot: 'terracotta' },
        { t: 'plant', x: .44, z: .42, kind: 'olive', s: 1, pot: 'stone' },
        { t: 'side', x: .3, z: -.25, c: 'walnut' }
      ],
      banho: [
        { t: 'wardrobe', wall: 'n', a: 0, len: 14, c: 'walnut' },
        { t: 'wardrobe', wall: 'e', a: -.28, len: 7, c: 'walnut' },
        { t: 'bench', x: .05, z: -.22, len: 4, d: 1.6, c: 'caramel', legs: 'walnut' },
        { t: 'vanity', wall: 'w', a: .2, len: 7, c: 'walnut', top: 'travertine', mirror: 'round', vase: 'terracotta' },
        { t: 'shower', x: .3, z: .26, len: 6 },
        { t: 'toilet', wall: 'e', a: .38, inset: 1.6 },
        { t: 'towel', wall: 'e', a: .12, y: 2.6 },
        { t: 'rug', x: -.15, z: .25, w: 4, d: 2.4, c: 'jute' },
        { t: 'plant', x: .38, z: .42, kind: 'fern', s: .8, pot: 'terracotta' }
      ],
      servico: [
        { t: 'laundry', wall: 's', a: -.1, len: 10 },
        { t: 'rug', x: -.1, z: -.1, w: 11, d: 8, c: 'jute' },
        { t: 'plant', x: .4, z: .05, kind: 'monstera', s: .9, pot: 'terracotta' }
      ]
    }
  },

  mare: {
    door: 'oak',
    ext: { 'estar:n': 'wall', 'cozinha:n': 'wall' },
    open: [['estar', 'cozinha']],
    doors: [['cozinha', 'suite', .78, 3.2]],
    drop: { suite: [{ t: 'curtain' }, { t: 'bench' }], varanda: [{ t: 'plant' }], deck: [{ t: 'lounger' }] },
    items: {
      estar: [
        { t: 'lounge', x: .28, z: -.24, r: -45, c: 'linen', wood: 'freijo' },
        { t: 'side', x: .36, z: -.14, c: 'freijo' }
      ],
      cozinha: [
        { t: 'plant', x: .42, z: -.38, kind: 'olive', s: .8, pot: 'travertine' }
      ],
      varanda: [
        { t: 'bbench', wall: 's', a: -.08, len: 26, base: 'travertine', back: 'freijo', c: 'linen', accent: 'sand', inset: 1.6 },
        { t: 'bbench', wall: 'w', a: .12, len: 16, base: 'travertine', back: 'freijo', c: 'linen', accent: 'sand', inset: 1.6 }
      ],
      deck: [
        { t: 'deckchair', x: -.3, z: .22, c: 'cream', wood: 'freijo', towel: 'sand' },
        { t: 'deckchair', x: -.2, z: .22, c: 'cream', wood: 'freijo' },
        { t: 'umbrella', x: .2, z: -.05, c: 'linen', pole: 'freijo' },
        { t: 'shrubs', x: 0, z: .47, len: 46, d: 2, seed: 21, palmEvery: 8 },
        { t: 'shrubs', x: .48, z: 0, r: 90, len: 22, d: 1.6, seed: 23 },
        { t: 'sofa', x: .02, z: -.2, len: 8, c: 'linen', l: 4 },
        { t: 'coffee', x: .02, z: .02, shape: 'round', s: 3.2, c: 'freijo', base: 'freijo', bowl: 'freijo' },
        { t: 'lounge', x: -.1, z: .12, r: 150, c: 'linen', wood: 'freijo' },
        { t: 'pouf', x: .12, z: .1, c: 'jute' },
        { t: 'deckchair', x: -.4, z: .22, c: 'cream', wood: 'freijo' },
        { t: 'planter', x: -.32, z: -.42, len: 6, wid: 1.6, c: 'travertine', tree: 'palm', s: .8, seed: 27 },
        { t: 'planter', x: .36, z: -.42, len: 6, wid: 1.6, c: 'travertine', seed: 29 }
      ],
      suite: [
        { t: 'bench', x: -.05, z: -.1, r: 0, len: 6, d: 1.6, c: 'freijo', legs: 'freijo' },
        { t: 'curtain', wall: 'e', a: -.3, len: 4, inset: .9 }
      ]
    }
  },

  brise: {
    door: 'oak',
    open: [['estar', 'jantar'], ['estar', 'escada'], ['jantar', 'escada'], ['jantar', 'cozinha']],
    doors: [
      ['escada', 'banho', .5, 3]
    ],
    items: {
      jantar: [
        { t: 'rug', x: 0, z: 0, w: 12, d: 9, c: 'jute' },
        { t: 'side', x: -.37, z: .34, c: 'travertine' }
      ],
      cozinha: [
        { t: 'plant', x: .42, z: -.34, kind: 'monstera', s: .85, pot: 'terracotta' }
      ],
      jardim: [
        { t: 'stones', x: -.2, z: .02, len: 15, n: 6 },
        { t: 'shrubs', x: -.2, z: .45, len: 50, d: 2.4, seed: 31, palmEvery: 9 },
        { t: 'shrubs', x: .42, z: .45, len: 14, d: 2.4, seed: 33 },
        { t: 'shrubs', x: -.48, z: 0, r: 90, len: 18, d: 2, seed: 35 },
        { t: 'shrubs', x: .48, z: 0, r: 90, len: 18, d: 2, seed: 37 }
      ],
      escada: [
        { t: 'bench', x: .12, z: .32, len: 5, d: 1.6, c: 'travertine', legs: 'travertine' }
      ],
      estar: [
        { t: 'console', wall: 'w', a: .32, len: 7, c: 'oak', vase: 'terracotta', bowl: 'charcoal' },
        { t: 'plant', x: .42, z: -.4, kind: 'fiddle', s: 1.1, pot: 'terracotta' },
        { t: 'lounge', x: .2, z: .3, r: -60, c: 'caramel' },
        { t: 'rug', x: .22, z: .25, w: 10, d: 8, c: 'jute' },
        { t: 'lounge', x: .3, z: .18, r: -100, c: 'caramel' },
        { t: 'side', x: .3, z: .32, c: 'oak', lamp: 'cream' },
        { t: 'bench', wall: 'n', a: -.2, len: 8, d: 1.6, c: 'travertine', legs: 'travertine' },
        { t: 'vase', x: -.45, z: -.4, s: 1.4, c: 'terracotta' },
        { t: 'plant', x: .05, z: -.42, kind: 'monstera', s: 1.2, pot: 'terracotta' }
      ]
    }
  },

  horizonte: {
    door: 'white',
    open: [['jantar', 'estar'], ['estar', 'cozinha'], ['estar', 'escada'], ['cozinha', 'escada']],
    doors: [
    ],
    items: {
      estar: [
        { t: 'lounge', x: .22, z: -.27, r: -70, c: 'grey', wood: 'black' },
        { t: 'side', x: .3, z: -.16, c: 'black' }
      ],
      jantar: [
        { t: 'armchair', x: -.3, z: -.3, r: 135, c: 'grey' },
        { t: 'armchair', x: -.12, z: -.36, r: 180, c: 'grey' },
        { t: 'side', x: -.22, z: -.24, c: 'black', lamp: 'white' },
        { t: 'rug', x: -.22, z: -.3, w: 9, d: 7, c: 'grey' },
        { t: 'flamp', x: -.42, z: -.42, c: 'black' },
        { t: 'plant', x: -.44, z: .42, kind: 'monstera', s: 1.1, pot: 'white' }
      ],
      jardim: [
        { t: 'shrubs', x: 0, z: .47, len: 48, d: 2, seed: 41, palmEvery: 99 },
        { t: 'shrubs', x: -.47, z: 0, r: 90, len: 22, d: 2, seed: 43, palmEvery: 99 },
        { t: 'stones', x: .15, z: -.32, r: 90, len: 10, n: 4 }
      ],
      varanda: [
        { t: 'grill', wall: 'e', a: -.25, len: 6, base: 'charcoal', top: 'concrete', inset: 1.4 },
        { t: 'planter', wall: 's', a: .3, len: 8, wid: 1.6, c: 'charcoal', seed: 45, inset: 1.2 }
      ]
    }
  }
};
