/* Altezza — decoração da planta 3D, tirada das fotos de cada ambiente.
   Coordenadas: x/z em fração do cômodo (-.5 a .5); r em graus; wall: n/s/e/w com 'a' = fração ao longo da parede.
   Os quadros usam recortes das próprias fotos (assets/img/planta/arte). */
window.AZPlanDecor = {
  dossel: {
    living: {
      floor: 'stone', wall: 'wood', solid: ['w'],
      items: [
        { t: 'sofa', x: -.2, z: .08, r: 90, len: 9, c: 'olive', curved: true },
        { t: 'coffee', x: .02, z: .08, s: 4.6, c: 'travertine', bowl: 'charcoal' },
        { t: 'flamp', x: -.36, z: -.18, c: 'bronze' },
        { t: 'art', wall: 'w', a: -.05, w: 6, h: 7, y: 1.4, img: 'dossel-living', frame: 'oak' },
        { t: 'plant', x: .4, z: -.36, kind: 'olive', s: 1.2, pot: 'stone' },
        { t: 'curtain', wall: 'n', a: -.42, len: 4, inset: .9 },
        { t: 'curtain', wall: 'n', a: .3, len: 4, inset: .9 },
        { t: 'console', wall: 'e', a: .2, len: 7, c: 'oak', bowl: 'charcoal', vase: 'travertine' },
        { t: 'armchair', x: .22, z: .2, r: -90, c: 'linen', legs: 'bronze' },
        { t: 'rug', x: -.02, z: .08, w: 17, d: 12, c: 'sand' },
        { t: 'tlamp', x: -.1, z: -.4, c: 'bronze' },
        { t: 'plant', x: -.42, z: .38, kind: 'olive', s: .9, pot: 'stone' },
        { t: 'pendant', x: 0, z: .05, kind: 'paper', drop: 1.2 }
      ]
    },
    hall: {
      floor: 'stone', wall: 'wood',
      items: [
        { t: 'plant', x: 0, z: .05, kind: 'tree', s: 1.1, pot: 'travertine', potW: 1.6, potH: .9 },
        { t: 'bench', wall: 's', a: 0, len: 5, d: 1.6, c: 'travertine', legs: 'travertine' },
        { t: 'niche', wall: 'e', a: 0, len: 4, c: 'olive' },
        { t: 'sculpture', wall: 'w', a: -.1, y: 3.6, c: 'bronze' }
      ]
    },
    jantar: {
      floor: 'stone', wall: 'wood',
      items: [
        { t: 'table', x: 0, z: 0, len: 11, wid: 3.6, c: 'oak', chairs: 8, chairC: 'rush', vase: 'travertine' },
        { t: 'pendant', x: 0, z: 0, kind: 'drum', n: 3, c: 'bronze', gap: 3.4 }
      ]
    },
    cozinha: {
      floor: 'stone',
      items: [
        { t: 'run', wall: 'n', a: 0, len: 12, base: 'freijo', top: 'travertine', upper: 'cabinets', cooktop: true, sink: true },
        { t: 'island', x: 0, z: .2, len: 8, wid: 2.6, base: 'freijo', top: 'travertine', stools: 3, stoolC: 'olive' }
      ]
    },
    suite: {
      floor: 'stone', wall: 'wood',
      items: [
        { t: 'bed', wall: 'e', a: 0, w: 6.5, len: 8, base: 'oak', linen: 'white', throwC: 'cream', stripe: 'olive', head: 0x9c7b58, headW: 13, headH: 3.4, inset: 4.9 },
        { t: 'night', wall: 'e', a: -.25, c: 'travertine', inset: 1.6, reading: 'brass', vase: 'travertine' },
        { t: 'night', wall: 'e', a: .25, c: 'travertine', inset: 1.6, reading: 'brass' },
        { t: 'art', wall: 'n', a: .18, w: 3.6, h: 6, y: 1.4, img: 'dossel-suite', frame: 'cream' },
        { t: 'curtain', wall: 'e', a: -.42, len: 3, inset: .9 },
        { t: 'curtain', wall: 'e', a: .42, len: 3, inset: .9 },
        { t: 'rug', x: -.08, z: 0, w: 12, d: 10, c: 'sand' }
      ]
    },
    suites: {
      floor: 'oak',
      items: [
        { t: 'bed', wall: 'n', a: -.25, w: 6, len: 8, base: 'oak', throwC: 'olive', inset: 4.9 },
        { t: 'bed', wall: 'n', a: .25, w: 6, len: 8, base: 'oak', throwC: 'olive', inset: 4.9 },
        { t: 'night', wall: 'n', a: 0, c: 'oak', lamp: 'travertine', inset: 1.6 },
        { t: 'rug', x: 0, z: .1, w: 22, d: 12, c: 'sand' }
      ]
    },
    terraco: {
      floor: 'stone',
      items: [
        { t: 'table', x: -.08, z: .15, len: 12, wid: 3.6, c: 'oak', chairs: 8, chairC: 'rush', settings: true },
        { t: 'pendant', x: -.08, z: .15, kind: 'drum', n: 4, c: 'oak', gap: 3, drop: 2 },
        { t: 'island', x: .02, z: -.28, len: 10, wid: 3, base: 'marble', top: 'marble', grill: true, sink: true },
        { t: 'plant', x: .38, z: -.36, kind: 'olive', s: 1.3, pot: 'travertine' },
        { t: 'plant', x: -.4, z: -.38, kind: 'fern', s: 1.2, pot: 'concrete' },
        { t: 'plant', x: .4, z: .38, kind: 'fern', s: 1.1, pot: 'concrete' }
      ]
    },
    clube: {
      floor: 'stone',
      items: [
        { t: 'pool', x: -.12, z: -.1, w: 20, d: 5, c: 'darkwater', edge: 'travertine' },
        { t: 'lounger', x: -.3, z: .32, r: 90 },
        { t: 'lounger', x: -.05, z: .32, r: 90 },
        { t: 'lounger', x: .2, z: .32, r: 90 },
        { t: 'plant', x: .4, z: -.25, kind: 'olive', s: 1.2, pot: 'concrete' },
        { t: 'plant', x: .4, z: .3, kind: 'olive', s: 1, pot: 'concrete' }
      ]
    }
  },

  aurora: {
    estar: {
      floor: 'oak', solid: ['n'], glass: ['w'],
      items: [
        { t: 'rug', x: .02, z: .1, w: 18, d: 13, c: 'cream' },
        { t: 'sofa', x: .27, z: .12, r: -90, len: 10, c: 'caramel', pillows: ['white', 'cream', 'grey'] },
        { t: 'armchair', x: -.2, z: .02, r: 90, c: 'white', frame: 'black' },
        { t: 'armchair', x: -.2, z: .3, r: 90, c: 'white', frame: 'black' },
        { t: 'coffee', x: .02, z: .13, shape: 'round', s: 4.6, c: 'oak', base: 'oak', books: true },
        { t: 'side', x: .33, z: .42, c: 'black' },
        { t: 'art', wall: 'n', a: -.1, w: 9, h: 7, y: 2.2, img: 'aurora-galeria', frame: 'black' },
        { t: 'console', wall: 'n', a: -.1, len: 9, c: 'white', lamp: 'white', vase: 'charcoal', inset: 1.4 },
        { t: 'plant', x: .4, z: -.36, kind: 'fiddle', s: 1.25, pot: 'basket' },
        { t: 'plant', x: -.42, z: -.36, kind: 'fiddle', s: 1, pot: 'white' },
        { t: 'curtain', wall: 'w', a: -.38, len: 4, inset: .9 }
      ]
    },
    jantar: {
      floor: 'oak', glass: ['n'],
      items: [
        { t: 'table', x: .05, z: .02, kind: 'round', r: 3, c: 'oak', base: 'oak', chairs: 6, chairC: 'white', legs: 'black' },
        { t: 'pendant', x: .05, z: .02, kind: 'paper', drop: 1.6 },
        { t: 'console', wall: 'w', a: .12, len: 8, c: 'oak', inset: 1.4 },
        { t: 'art', wall: 'w', a: .12, w: 4, h: 6, y: 2.4, img: 'aurora-jantar', frame: 'oak' },
        { t: 'plant', x: -.32, z: -.38, kind: 'fiddle', s: 1.3, pot: 'basket' }
      ]
    },
    suite: {
      floor: 'oak', glass: ['s', 'w'],
      items: [
        { t: 'rug', x: 0, z: .05, w: 16, d: 13, c: 'sand' },
        { t: 'bed', wall: 'n', a: 0, w: 7, len: 8.5, base: 0xe6dfd3, linen: 'white', throwC: 'cream', pillows: 3, head: 0xe6dfd3, headH: 2.2, inset: 5.1 },
        { t: 'bench', x: 0, z: .3, len: 6.5, d: 1.8, c: 'caramel', legs: 'black' },
        { t: 'night', wall: 'n', a: -.2, c: 'oak', inset: 1.6, reading: 'black' },
        { t: 'night', wall: 'n', a: .2, c: 'oak', inset: 1.6, vase: 'cream' },
        { t: 'plant', x: .42, z: .32, kind: 'olive', s: 1.1, pot: 'white' },
        { t: 'curtain', wall: 's', a: -.4, len: 4, inset: .9 },
        { t: 'curtain', wall: 's', a: .4, len: 4, inset: .9 }
      ]
    },
    varanda: {
      floor: 'deck',
      items: [
        { t: 'table', x: 0, z: -.1, kind: 'round', r: 1.8, c: 'oak', chairs: 3, chairC: 'white', legs: 'black' },
        { t: 'lounger', x: 0, z: .28, r: 90 },
        { t: 'plant', x: .35, z: -.38, kind: 'olive', s: .9, pot: 'white' }
      ]
    }
  },

  copa: {
    jantar: {
      floor: 'herring', glass: ['n', 'w'],
      items: [
        { t: 'sofa', x: -.36, z: -.1, r: 90, len: 8, c: 'linen', throwC: 'cream' },
        { t: 'side', x: -.4, z: .2, c: 'oak' },
        { t: 'table', x: .1, z: .12, len: 9, wid: 3.6, c: 'walnut', chairs: 6, chairC: 'walnut', base: 'trestle', settings: true, vase: 'terracotta' },
        { t: 'books', wall: 'e', a: -.3, len: 7, h: 5.6, c: 'oak', inset: 1.4 },
        { t: 'books', wall: 'e', a: .3, len: 7, h: 5.6, c: 'oak', inset: 1.4 },
        { t: 'art', wall: 'e', a: 0, w: 4.5, h: 6, y: 1.6, img: 'copa-jantar', frame: 'oak' },
        { t: 'curtain', wall: 'n', a: -.38, len: 4, inset: .9 }
      ]
    },
    biblioteca: {
      floor: 'herring', wall: 'walnut',
      items: [
        { t: 'books', wall: 'e', a: 0, len: 20, h: 5.6, c: 'walnut', inset: 1.4 },
        { t: 'lounge', x: -.1, z: .1, r: 60, c: 'caramel' },
        { t: 'flamp', x: -.32, z: -.05, c: 'brass' },
        { t: 'rug', x: -.05, z: .05, w: 10, d: 10, c: 'jute' }
      ]
    },
    cozinha: {
      floor: 'herring', glass: ['n', 'e'],
      items: [
        { t: 'run', wall: 'w', a: .08, len: 18, base: 'walnut', top: 'travertine', back: 'tile', upper: 'shelves', shelfC: 'walnut', cooktop: true, sink: true, fridge: true, plant: true },
        { t: 'island', x: .14, z: .05, r: 90, len: 10, wid: 3, base: 'walnut', top: 'travertine', stools: 3, stoolC: 'walnut', fruit: true }
      ]
    },
    suite: {
      floor: 'herring', wall: 'walnut', glass: ['s', 'w'],
      items: [
        { t: 'rug', x: 0, z: .1, w: 16, d: 13, c: 'jute' },
        { t: 'bed', wall: 'n', a: 0, w: 7, len: 8.5, base: 'walnut', linen: 'white', throwC: 'cream', pillows: 3, inset: 5.1 },
        { t: 'art', wall: 'n', a: 0, w: 7, h: 4, y: 3.6, img: 'copa-suite', frame: 'walnut' },
        { t: 'night', wall: 'n', a: -.18, c: 'walnut', lamp: 'terracotta', inset: 1.6 },
        { t: 'night', wall: 'n', a: .18, c: 'walnut', inset: 1.6, vase: 'cream' },
        { t: 'bench', x: 0, z: .32, len: 6, d: 1.8, c: 'caramel', legs: 'walnut' },
        { t: 'plant', x: .42, z: .34, kind: 'monstera', s: 1.1, pot: 'white' },
        { t: 'curtain', wall: 's', a: .38, len: 5, inset: .9 }
      ]
    },
    banho: {
      floor: 'bath', wall: 'stone', glass: ['s'],
      items: [
        { t: 'vanity', wall: 'w', a: -.1, len: 9, c: 'walnut', top: 'travertine', mirror: 'round', vase: 'terracotta' },
        { t: 'shower', x: .1, z: .1, len: 9 },
        { t: 'toilet', wall: 'n', a: .3, inset: 1.6 },
        { t: 'rug', x: -.15, z: .2, w: 4, d: 2.4, c: 'jute' }
      ]
    }
  },

  mare: {
    estar: {
      floor: 'stone', wall: 'earth', glass: ['s'],
      items: [
        { t: 'rug', x: -.02, z: .05, w: 20, d: 15, c: 'jute' },
        { t: 'sofa', x: -.3, z: .08, r: 90, len: 11, l: 7, c: 'linen', noArms: true, pillows: ['cream', 'cream', 'sand'] },
        { t: 'coffee', x: .02, z: .08, shape: 'round', s: 5, c: 'freijo', base: 'freijo', bowl: 'freijo', vases: true },
        { t: 'art', wall: 'n', a: -.32, w: 3.4, h: 5, y: 1.8, img: 'mare-estar', frame: 'freijo' },
        { t: 'console', wall: 'n', a: .05, len: 9, c: 'freijo', bowl: 'freijo', vase: 'cream', inset: 1.4 },
        { t: 'plant', x: .4, z: .36, kind: 'palm', s: .55, pot: 'cream' },
        { t: 'side', x: -.44, z: -.36, c: 'freijo' },
        { t: 'pendant', x: -.05, z: -.32, kind: 'rattan', drop: 1.8 }
      ]
    },
    cozinha: {
      floor: 'stone', wall: 'earth', glass: ['s'],
      items: [
        { t: 'run', wall: 'n', a: 0, len: 20, base: 'freijo', top: 'travertine', upper: 'cabinets', cooktop: true, sink: true },
        { t: 'island', x: -.22, z: -.08, r: 90, len: 10, wid: 3, base: 'travertine', top: 'travertine', stools: 4, stoolC: 'rush' },
        { t: 'table', x: .15, z: .18, r: 90, len: 14, wid: 3.6, c: 'freijo', chairs: 10, chairC: 'rush', base: 'trestle', bowl: 'freijo' },
        { t: 'pendant', x: .15, z: .18, r: 90, kind: 'rattan', n: 3, gap: 3.6, drop: 1.5 }
      ]
    },
    suite: {
      floor: 'stone', wall: 'wood', glass: ['s', 'e'],
      items: [
        { t: 'rug', x: 0, z: .05, w: 14, d: 13, c: 'jute' },
        { t: 'bed', wall: 'n', a: 0, w: 7, len: 8.5, base: 'freijo', low: true, linen: 'white', throwC: 'olive', stripe: 'cream', pillows: 3, inset: 5.3 },
        { t: 'night', wall: 'n', a: -.3, c: 'freijo', lamp: 'cream', inset: 1.6 },
        { t: 'bench', x: .36, z: .1, r: 90, len: 6, d: 1.6, c: 'freijo', legs: 'freijo' },
        { t: 'curtain', wall: 's', a: .3, len: 5, inset: .9 },
        { t: 'plant', x: -.38, z: .38, kind: 'palm', s: .45, pot: 'cream' }
      ]
    },
    varanda: {
      floor: 'deck',
      items: [
        { t: 'pergola', c: 'freijo', n: 10 },
        { t: 'lounge', x: -.25, z: .1, r: 30, c: 'linen', wood: 'freijo' },
        { t: 'lounge', x: -.05, z: .2, r: -20, c: 'linen', wood: 'freijo' },
        { t: 'coffee', x: -.15, z: -.05, shape: 'round', s: 3, c: 'freijo' },
        { t: 'table', x: .25, z: 0, r: 90, len: 8, wid: 3, c: 'freijo', chairs: 6, chairC: 'rush' },
        { t: 'plant', x: -.44, z: .4, kind: 'palm', s: .8, pot: 'none' }
      ]
    },
    deck: {
      floor: 'deck',
      items: [
        { t: 'lounger', x: -.25, z: .2 }, { t: 'lounger', x: -.12, z: .2 },
        { t: 'table', x: .2, z: -.05, kind: 'round', r: 2, c: 'freijo', chairs: 4, chairC: 'rush' },
        { t: 'plant', x: .44, z: .38, kind: 'palm', s: 1.1, pot: 'none' },
        { t: 'plant', x: -.44, z: -.36, kind: 'palm', s: .9, pot: 'none' },
        { t: 'plant', x: .1, z: .4, kind: 'fern', s: 1.3, pot: 'none' }
      ]
    }
  },

  brise: {
    estar: {
      floor: 'stone', wall: 'wood', solid: ['w'], glass: ['s'],
      items: [
        { t: 'sofa', x: -.28, z: .05, r: 90, len: 12, c: 'linen' },
        { t: 'coffee', x: -.05, z: .05, shape: 'block', s: 5, c: 'travertine', vases: true, books: true },
        { t: 'lounge', x: .18, z: -.22, r: -140, c: 'caramel' },
        { t: 'flamp', x: -.4, z: -.32, paper: true },
        { t: 'curtain', wall: 'w', a: .35, len: 3.5, inset: .9 },
        { t: 'plant', x: .4, z: .38, kind: 'monstera', s: 1.2, pot: 'terracotta' }
      ]
    },
    jantar: {
      floor: 'stone', wall: 'concrete',
      items: [
        { t: 'table', x: 0, z: 0, len: 10, wid: 3.6, c: 'cumaru', chairs: 6, chairC: 'rush' },
        { t: 'pendant', x: 0, z: 0, kind: 'paper', drop: 1.8 }
      ]
    },
    escada: {
      floor: 'stone', wall: 'concrete',
      items: [
        { t: 'stairs', x: -.05, z: -.18, n: 13, len: 16, wid: 3, c: 'cumaru' },
        { t: 'plant', x: .36, z: .25, kind: 'monstera', s: 1.3, pot: 'terracotta' }
      ]
    },
    cozinha: {
      floor: 'stone', wall: 'concrete',
      items: [
        { t: 'run', wall: 'n', a: 0, len: 20, base: 'cumaru', top: 'concrete', upper: 'cabinets', cooktop: true, sink: true, fridge: true },
        { t: 'island', x: 0, z: .2, len: 10, wid: 3, base: 'concrete', top: 'travertine', stools: 4, stoolC: 'cumaru' }
      ]
    },
    banho: {
      floor: 'stone', wall: 'stone',
      items: [
        { t: 'tub', x: -.3, z: .05, r: 90, len: 6, wid: 3, c: 'travertine' },
        { t: 'vanity', wall: 'e', a: 0, len: 7, c: 'travertine', top: 'travertine', mirror: true, vase: 'charcoal' },
        { t: 'plant', x: .05, z: .3, kind: 'fern', s: 1, pot: 'travertine' }
      ]
    },
    jardim: {
      floor: 'grass',
      items: [
        { t: 'pool', x: .12, z: 0, w: 34, d: 8, c: 'darkwater', edge: 'travertine' },
        { t: 'lounger', x: -.12, z: .3, r: 90 }, { t: 'lounger', x: -.05, z: .3, r: 90 },
        { t: 'plant', x: -.44, z: -.25, kind: 'palm', s: 1.1, pot: 'none' },
        { t: 'plant', x: -.36, z: .3, kind: 'palm', s: .9, pot: 'none' },
        { t: 'plant', x: -.3, z: -.3, kind: 'monstera', s: 1.6, pot: 'none' },
        { t: 'plant', x: .44, z: -.28, kind: 'palm', s: 1.2, pot: 'none' },
        { t: 'plant', x: .44, z: .3, kind: 'monstera', s: 1.5, pot: 'none' },
        { t: 'plant', x: -.2, z: -.36, kind: 'fern', s: 1.4, pot: 'none' },
        { t: 'plant', x: .34, z: .36, kind: 'fern', s: 1.3, pot: 'none' }
      ]
    }
  },

  horizonte: {
    jantar: {
      floor: 'oak', glass: ['w', 's'],
      items: [
        { t: 'table', x: 0, z: .02, len: 10, wid: 3.8, c: 'charcoal', chairs: 6, chairC: 'grey', legs: 'black', vase: 'cream' },
        { t: 'pendant', x: 0, z: .02, kind: 'drum', n: 3, c: 'black', gap: 3 }
      ]
    },
    estar: {
      floor: 'oak', wall: 'wood', glass: ['n', 's'],
      items: [
        { t: 'rug', x: -.08, z: .08, w: 18, d: 13, c: 'grey' },
        { t: 'sofa', x: -.3, z: .1, r: 90, len: 10, l: 5, c: 'white', pillows: ['grey', 'mustard', 'darkgrey'] },
        { t: 'coffee', x: -.08, z: .1, shape: 'round', s: 4, c: 'white', base: 'white' },
        { t: 'side', x: .06, z: .28, c: 'black' },
        { t: 'fireplace', wall: 'e', a: -.25, inset: 1.4 },
        { t: 'bench', wall: 'e', a: .2, len: 10, d: 2, c: 'black', legs: 'black', inset: 1.6 },
        { t: 'art', wall: 'e', a: .25, w: 4, h: 6, y: 2.4, img: 'horizonte-estar', frame: 'black' },
        { t: 'plant', x: -.1, z: .06, kind: 'fern', s: .45, pot: 'white', potH: .6 }
      ]
    },
    cozinha: {
      floor: 'oak',
      items: [
        { t: 'run', wall: 'n', a: 0, len: 18, base: 'white', top: 'white', upper: 'cabinets', cooktop: true, sink: true, fridge: true },
        { t: 'island', x: 0, z: .22, len: 9, wid: 3, base: 'white', top: 'white', stools: 4, stoolC: 'oak' },
        { t: 'pendant', x: 0, z: .22, kind: 'drum', n: 3, c: 'black', gap: 2.6, drop: 2.2 }
      ]
    },
    escada: {
      floor: 'oak', wall: 'concrete',
      items: [{ t: 'stairs', x: 0, z: 0, n: 12, len: 18, wid: 2.6, c: 'oak', rail: 'black' }]
    },
    varanda: {
      floor: 'deck',
      items: [
        { t: 'pergola', c: 'oak', n: 9 },
        { t: 'table', x: .18, z: 0, len: 9, wid: 3.4, c: 'oak', chairs: 6, chairC: 'charcoal' },
        { t: 'lounger', x: -.3, z: .1, r: 90 }, { t: 'lounger', x: -.3, z: -.15, r: 90 }
      ]
    },
    jardim: {
      floor: 'grass',
      items: [
        { t: 'pool', x: .15, z: .05, w: 16, d: 8, c: 'water', edge: 'concrete' },
        { t: 'lounger', x: .22, z: -.38, r: 90 },
        { t: 'plant', x: -.3, z: -.1, kind: 'eucalyptus', s: 1.3, pot: 'none' },
        { t: 'plant', x: -.44, z: .38, kind: 'fern', s: 1.5, pot: 'none' },
        { t: 'plant', x: .44, z: .4, kind: 'fern', s: 1.2, pot: 'none' }
      ]
    }
  }
};
