/* Altezza — dados de demonstração. Imóveis, valores e pessoas são fictícios. */
(function () {
  'use strict';

  const local = (name, w, h, alt) => ({
    src: `assets/img/${name}-l.webp`, srcM: `assets/img/${name}-m.webp`, w, h, alt
  });
  const localJpg = (name, w, h, alt) => ({
    src: `assets/img/${name}-l.jpg`, srcM: `assets/img/${name}-m.jpg`, w, h, alt
  });
  const remote = (src, w, h, alt) => ({ src, srcM: src, w, h, alt });
  // Ambientes gerados por IA para completar os imóveis que só tinham uma foto.
  const gen = (name, alt) => ({ src: `assets/img/${name}-l.jpg`, srcM: `assets/img/${name}-m.jpg`, w: 1536, h: 1024, alt });
  const panorama = name => ({ src: `assets/img/${name}-wide.jpg`, w: 1672, h: 941 });

  const IMG = {
    torre: local('torre', 2400, 1340, 'Torre residencial com jardins nas varandas, iluminada ao entardecer entre as copas das árvores.'),
    lobby: local('lobby', 1600, 1986, 'Lobby de pé-direito duplo com paredes ripadas de madeira, balcão de travertino e uma árvore sob a claraboia.'),
    lobbyWide: panorama('lobby'),
    living: local('living', 2400, 1340, 'Living com caixilhos de piso a teto voltados para as árvores, sofá verde-oliva e mesa de travertino.'),
    suite: local('suite', 1200, 1490, 'Suíte master com cabeceira estofada, painéis de madeira e grande janela para as copas.'),
    suiteWide: panorama('suite'),
    terraco: local('terraco', 1600, 1986, 'Terraço gourmet com mesa de madeira, bancada de pedra verde e o skyline da cidade ao fundo.'),
    terracoWide: panorama('terraco'),
    piscina: local('piscina', 2400, 1340, 'Piscina de borda infinita na cobertura, com espreguiçadeiras e vista para a cidade ao pôr do sol.'),
    spa: local('spa', 1600, 1986, 'Spa com raia coberta de pedra verde, paredes de travertino e jardim interno atrás do vidro.'),
    spaWide: panorama('spa'),
    bairro: local('bairro', 1600, 893, 'Vista aérea do bairro arborizado com a torre entre as árvores e a cidade ao fundo.'),
    radarBrise: localJpg('radar-brise', 1600, 1001, 'Vista aérea da Casa Brise entre o jardim tropical e a piscina.'),
    radarHorizonte: localJpg('radar-horizonte', 1600, 1001, 'Vista aérea da Casa Horizonte no Vale dos Cristais, com a Serra do Curral ao fundo.'),
    radarMare: localJpg('radar-mare', 1600, 1001, 'Vista aérea da Casa Maré entre a Mata Atlântica e o mar.'),
    radarCopa: localJpg('radar-copa', 1600, 1001, 'Vista aérea da Residência Copa em uma rua arborizada de Alto de Pinheiros.'),
    radarAurora: localJpg('radar-aurora', 1600, 1001, 'Vista aérea da Residência Aurora na Vila Nova Conceição, perto do Parque Ibirapuera.'),
    sketchDossel: localJpg('sketch-dossel', 1600, 893, 'Croqui do living da Cobertura Dossel.'),
    sketchHorizonte: localJpg('sketch-horizonte', 1520, 1034, 'Croqui da sala da Casa Horizonte.'),
    sketchMare: localJpg('sketch-mare', 1536, 1024, 'Croqui da sala da Casa Maré.'),
    sketchCopa: localJpg('sketch-copa', 1536, 1024, 'Croqui da cozinha da Residência Copa.'),
    sketchAurora: localJpg('sketch-aurora', 1536, 1024, 'Croqui da sala de jantar da Residência Aurora.'),
    maquete: local('maquete', 1600, 1986, 'Maquete branca da torre sobre uma mesa de madeira, iluminada por um pendente.'),
    brise: local('brise', 1600, 1073, 'Casa de concreto com brises de cumaru no pavimento superior, jardim tropical e piscina.'),
    sala: local('sala', 2400, 1340, 'Sala de estar com painel de madeira, sofá de linho, poltrona de couro e vista para o jardim e a piscina.'),
    croqui: local('croqui', 2400, 1340, 'Croqui à mão da mesma sala de estar, em grafite e aquarela leve.'),
    escada: local('escada', 1600, 1986, 'Escada de degraus soltos de madeira contra parede de concreto aparente, com luz zenital.'),
    escadaWide: panorama('escada'),
    banho: local('banho', 1600, 1986, 'Banheiro todo em travertino com banheira esculpida e abertura para um jardim interno.'),
    banhoWide: panorama('banho'),
    mare: local('mare', 1600, 1073, 'Varanda com pergolado de madeira, sofá de alvenaria com almofadas de linho e vista para o mar.'),
    copa: local('copa', 1600, 1986, 'Sala de jantar com mesa de madeira, estantes embutidas e janela de canto para as árvores e a cidade.'),
    copaWide: panorama('copa'),
    curadora: local('curadora', 1200, 1490, 'Retrato da diretora de curadoria apoiada em uma mesa com maquete branca.'),
    mesa: local('mesa', 1600, 1073, 'Mesa de trabalho com plantas, maquete de madeira e amostras de materiais.'),
    materiais: local('materiais', 1600, 1073, 'Amostras de travertino, concreto, madeiras e linho dispostas sobre a mesa.'),
    mareSala: gen('mare-sala', 'Sala de estar com sofá de linho, paredes de taipa e caixilhos abertos para o deck e o mar.'),
    mareCozinha: gen('mare-cozinha', 'Cozinha com ilha de travertino e mesa de madeira para doze, aberta para a vista do mar.'),
    mareSuite: gen('mare-suite', 'Suíte com cama de madeira, parede ripada e terraço privativo com vista para o mar.'),
    copaCozinha: gen('copa-cozinha', 'Cozinha em nogueira com revestimento de terracota, ilha de pedra e janela para as árvores.'),
    copaSuite: gen('copa-suite', 'Suíte com painel de nogueira, cama em linho e janela para o pôr do sol sobre as árvores.'),
    copaBanho: gen('copa-banho', 'Banheiro em pedra clara com bancada suspensa de nogueira, metais em latão e janela para as copas.'),
    auroraJantar: gen('aurora-jantar', 'Jantar com mesa redonda de carvalho, luminária de papel e janelas de pé-direito duplo para a cidade.'),
    auroraSuite: gen('aurora-suite', 'Suíte com cama em linho, banco de couro caramelo e janela para o lago do Ibirapuera.'),
    aurora: remote('https://res.cloudinary.com/dalwymbky/image/upload/v1793039688/casa-aurora_kf6ojz.jpg', 2400, 1800,
      'Sala iluminada com sofá de couro, poltronas claras e plantas junto às janelas.'),
    refugio: remote('https://res.cloudinary.com/dalwymbky/image/upload/v1793039687/refugio-natural_esgiwl.jpg', 2400, 1600,
      'Sala de jantar integrada com mesa escura, escada metálica e detalhes em madeira.'),
    horizonte: remote('https://res.cloudinary.com/dalwymbky/image/upload/v1793039689/casa-horizonte_bwhflv.jpg', 2400, 1600,
      'Casa contemporânea com fachada de madeira, grandes janelas e jardim ao entardecer.'),
    convivio: remote('https://res.cloudinary.com/dalwymbky/image/upload/v1793039688/espaco-convivio_apov29.jpg', 2400, 1632,
      'Sala com sofá claro, painel de madeira e cozinha aberta com bancada e banquetas.')
  };

  const SW = name => `assets/img/amostras/${name}.webp`;
  const SWJ = name => `assets/img/amostras/${name}.jpg`;

  const PROPERTIES = [
    {
      id: 'dossel',
      nome: 'Cobertura Dossel',
      tipo: 'Cobertura',
      status: 'Lançamento',
      bairro: 'Jardim Europa',
      cidade: 'São Paulo',
      uf: 'SP',
      coords: '23°34′S · 46°41′O',
      preco: 18900000,
      condominio: 9800,
      iptu: 4200,
      area: 420,
      suites: 4,
      vagas: 5,
      banheiros: 6,
      andar: '24º pavimento',
      ano: 2028,
      entrega: 'Dez/2028',
      arquitetura: 'Ateliê Norte',
      cover: IMG.living,
      card: IMG.torre,
      video: { src: 'assets/video/torre.mp4', portrait: 'assets/video/torre-retrato.mp4', poster: 'assets/video/torre-poster.webp', posterPortrait: 'assets/video/torre-retrato-poster.webp' },
      tagline: 'Morar acima das copas, sem perder o chão.',
      resumo: 'A última residência da torre: 420 m² em um único pavimento, com terraço gourmet e vista de 360° sobre as árvores do Jardim Europa.',
      descricao: [
        'Uma torre única, recuada no terreno, que devolve 65% da área ao jardim. No topo, a Cobertura Dossel ocupa o andar inteiro, com fachadas abertas para os quatro lados e um terraço que funciona como uma segunda sala.',
        'O projeto trabalha com poucos materiais e muita luz: travertino nos pisos, madeira natural nos painéis e caixilhos finos de piso a teto, desenhados para quase desaparecer.'
      ],
      destaques: ['Andar inteiro com elevador privativo', 'Terraço gourmet de 86 m²', 'Pé-direito de 3,40 m no living', 'Jardins em todas as varandas', 'Clube com piscina, spa e lobby duplo'],
      arquiteturaTexto: {
        titulo: 'Uma torre que se comporta como árvore.',
        texto: 'O Ateliê Norte partiu de uma ideia simples: um volume esguio, com a base livre e a copa verde. Cada varanda recebe uma floreira estrutural irrigada, e o conjunto dá ao edifício uma fachada viva que muda com as estações.',
        imagem: IMG.maquete,
        legenda: 'Maquete de estudo · escala 1:200'
      },
      materiais: [
        { nome: 'Travertino romano', uso: 'Pisos e bancadas, acabamento levigado', cor: '#d9cbb2', img: SW('travertino') },
        { nome: 'Freijó', uso: 'Painéis, portas e marcenaria', cor: '#a77a4f', img: SW('freijo') },
        { nome: 'Linho oliva', uso: 'Estofados e cortinas', cor: '#7b7d52', img: SW('linho-oliva') },
        { nome: 'Latão escovado', uso: 'Metais e caixilhos', cor: '#b38b4d', img: SW('latao') }
      ],
      obra: {
        video: 'assets/video/obra-dossel.mp4?v=2',
        poster: 'assets/video/obra-dossel-poster.jpg?v=2',
        etapas: [
          { t: 0, de: 0, ate: 2.4, rotulo: 'Projeto', titulo: 'Do desenho…', texto: 'A torre nasce no traço: uma lâmina esbelta, pensada para ficar acima da copa das árvores do bairro.' },
          { t: 3, de: 2.9, ate: 5.4, rotulo: 'Fundação', titulo: '…à fundação…', texto: 'O terreno é escavado e a base é concretada, com a grua e a bomba de concreto trabalhando sem parar.' },
          { t: 7, de: 5.9, ate: 9.6, rotulo: 'Estrutura', titulo: '…ao concreto…', texto: 'Pavimento a pavimento, as equipes levantam a estrutura até o topo e já desenham a silhueta da cobertura.' },
          { t: 13, de: 10.6, ate: 17.4, rotulo: 'Acabamento', titulo: '…ao acabamento…', texto: 'As fachadas são fechadas andar por andar e os jardins verticais começam a revestir a torre.' },
          { t: 23, de: 18.6, ate: 99, rotulo: 'Entrega', titulo: '…à chave.', texto: 'Torre entregue, iluminada ao entardecer. Pronta para morar no alto de Jardim Europa.' }
        ]
      },
      localizacao: {
        texto: 'Entre as ruas arborizadas do Jardim Europa, a uma caminhada da Av. Brasil e a poucos minutos da Faria Lima, sem o ruído das vias principais.',
        imagem: IMG.bairro,
        pontos: [
          { nome: 'Parque do Ibirapuera', tempo: '8 min', ang: 40, dist: .62 },
          { nome: 'Av. Brigadeiro Faria Lima', tempo: '6 min', ang: 210, dist: .48 },
          { nome: 'Rua Oscar Freire', tempo: '7 min', ang: 120, dist: .55 },
          { nome: 'Shopping Iguatemi', tempo: '9 min', ang: 260, dist: .74 },
          { nome: 'Colégio e clube no bairro', tempo: '4 min', ang: 330, dist: .32 }
        ]
      },
      plan: {
        rooms: [
          { id: 'hall', nome: 'Hall privativo', x: 44, y: 4, w: 14, h: 14, area: 18 },
          { id: 'living', nome: 'Living', x: 4, y: 4, w: 38, h: 30, area: 96 },
          { id: 'jantar', nome: 'Jantar', x: 44, y: 20, w: 22, h: 14, area: 38 },
          { id: 'cozinha', nome: 'Cozinha', x: 60, y: 4, w: 16, h: 14, area: 28 },
          { id: 'suite', nome: 'Suíte master', x: 68, y: 20, w: 28, h: 22, area: 64 },
          { id: 'suites', nome: 'Suítes', x: 4, y: 36, w: 36, h: 24, area: 92 },
          { id: 'terraco', nome: 'Terraço gourmet', x: 42, y: 36, w: 24, h: 24, area: 86 },
          { id: 'servico', nome: 'Serviço', x: 78, y: 4, w: 18, h: 14, area: 22 },
          { id: 'clube', nome: 'Clube (térreo e rooftop)', x: 68, y: 44, w: 28, h: 16, area: 0 }
        ],
        giro: { dir: 'assets/img/planta/dossel/', n: 27, v: 1 }
      },
      scenes: [
        {
          img: IMG.torre, room: 'hall', kicker: 'Chegada', nome: 'A torre entre as copas',
          texto: 'Vinte e quatro pavimentos que sobem entre as árvores do bairro. A cobertura é o último volume de vidro, recuado como uma lanterna no alto da torre.',
          itens: ['46 residências, apenas 2 por andar', 'Fachada com jardins estruturais', 'Coroamento em vidro e latão'],
          curiosidade: 'As floreiras das varandas são irrigadas por água de chuva captada na própria cobertura.',
          cam: { from: [.5, .62, 1], to: [.5, .22, 1.45] },
          hotspots: [
            { x: .5, y: .17, t: 'Cobertura Dossel', d: 'O último pavimento, com 420 m² e terraço voltado para o poente.' },
            { x: .43, y: .45, t: 'Jardins verticais', d: 'Espécies da Mata Atlântica em todas as varandas.' },
            { x: .2, y: .86, t: 'Copa preservada', d: '65% do terreno permanece como área verde.' }
          ]
        },
        {
          img: IMG.lobby, wide: IMG.lobbyWide, room: 'hall', kicker: 'Térreo', nome: 'Lobby de pé-direito duplo',
          texto: 'A entrada é um pátio coberto: paredes ripadas em madeira, piso de travertino e uma figueira plantada no centro, sob a claraboia.',
          itens: ['Pé-direito de 7,8 m', 'Concierge 24 horas', 'Nichos de espera em linho'],
          curiosidade: 'A claraboia foi posicionada para que o sol do meio-dia caia exatamente sobre a copa da figueira.',
          cam: { from: [.5, .72, 1], to: [.5, .42, 1.18] },
          hotspots: [
            { x: .5, y: .17, t: 'Claraboia', d: 'Rasgo zenital de 9 m que ilumina o lobby o dia todo.' },
            { x: .5, y: .5, t: 'Figueira-lira', d: 'Plantada em solo natural, sem vaso.' },
            { x: .3, y: .74, t: 'Balcão em travertino', d: 'Bloco único, desenhado sob medida.' },
            { x: .86, y: .72, t: 'Nichos de espera', d: 'Assentos embutidos na parede ripada.' }
          ]
        },
        {
          img: IMG.living, sketch: IMG.sketchDossel, room: 'living', kicker: 'Do croqui ao espaço', nome: 'Living entre as árvores',
          texto: 'Noventa e seis metros quadrados abertos para a copa. Os caixilhos de piso a teto têm perfis de apenas 4 cm, e a sala parece suspensa no verde.',
          itens: ['Pé-direito de 3,40 m', 'Caixilhos de piso a teto em latão', 'Piso aquecido em travertino'],
          curiosidade: 'Nesta altura, a janela enquadra exatamente a copa das tipuanas da rua, não os prédios vizinhos.',
          cam: { from: [.46, .62, 1.02], to: [.54, .42, 1.32] },
          hotspots: [
            { x: .5, y: .35, t: 'Caixilho piso-teto', d: 'Perfis mínimos para a vista ser a protagonista.' },
            { x: .8, y: .55, t: 'Oliveira centenária', d: 'Vaso de pedra moldado no próprio piso.' },
            { x: .2, y: .78, t: 'Sofá em linho oliva', d: 'Peça desenhada para o projeto.' },
            { x: .5, y: .8, t: 'Mesa monolítica', d: 'Travertino bruto, sem resina.' }
          ]
        },
        {
          img: IMG.suite, wide: IMG.suiteWide, room: 'suite', kicker: 'Área íntima', nome: 'Suíte master',
          texto: 'Uma suíte de 64 m² com closet duplo e banho voltado para o nascente. A cabeceira estofada percorre toda a parede e incorpora a iluminação de leitura.',
          itens: ['Closet duplo de 14 m²', 'Banho com vista para as copas', 'Cortinas de linho motorizadas'],
          curiosidade: 'O vidro da janela é laminado acústico: dentro da suíte, o ruído da cidade cai para o nível de uma biblioteca.',
          cam: { from: [.5, .7, 1], to: [.5, .45, 1.2] },
          hotspots: [
            { x: .5, y: .3, t: 'Janela para o nascente', d: 'Luz da manhã filtrada pelas árvores.' },
            { x: .5, y: .6, t: 'Cabeceira contínua', d: 'Estofado em linho com luminárias embutidas.' },
            { x: .07, y: .45, t: 'Obra de arte', d: 'Curadoria de arte inclusa no projeto de interiores.' }
          ]
        },
        {
          img: IMG.terraco, wide: IMG.terracoWide, room: 'terraco', kicker: 'Terraço', nome: 'Terraço gourmet',
          texto: 'Uma segunda sala ao ar livre, com cozinha completa, mesa para doze pessoas e o skyline de São Paulo emoldurado pela vegetação.',
          itens: ['86 m² cobertos e descobertos', 'Churrasqueira e forno a lenha', 'Bancada em quartzito verde'],
          curiosidade: 'Os pendentes foram calibrados para não refletir no vidro: à noite, a vista da cidade continua limpa.',
          cam: { from: [.4, .72, 1], to: [.55, .32, 1.2] },
          hotspots: [
            { x: .5, y: .27, t: 'Skyline', d: 'Vista aberta para o centro expandido.' },
            { x: .55, y: .5, t: 'Bancada em quartzito', d: 'Pedra natural verde, polida à mão.' },
            { x: .2, y: .7, t: 'Mesa para 12', d: 'Madeira maciça de reflorestamento.' },
            { x: .88, y: .55, t: 'Oliveira', d: 'Paisagismo assinado, com irrigação automática.' }
          ]
        },
        {
          img: IMG.piscina, room: 'clube', kicker: 'Rooftop', nome: 'Piscina na cobertura',
          texto: 'No último nível da torre, uma raia de borda infinita de 25 metros se alinha ao horizonte, com deck em madeira e solário.',
          itens: ['Raia aquecida de 25 m', 'Borda infinita em pedra', 'Solário com espreguiçadeiras'],
          curiosidade: 'A borda infinita foi orientada para o poente: o reflexo do pôr do sol corre por toda a extensão da água.',
          cam: { from: [.4, .6, 1], to: [.3, .55, 1.25] },
          hotspots: [
            { x: .4, y: .78, t: 'Raia de 25 m', d: 'Aquecida e com iluminação subaquática.' },
            { x: .14, y: .44, t: 'Horizonte urbano', d: 'A cidade inteira a partir do 25º andar.' },
            { x: .84, y: .62, t: 'Solário', d: 'Deck em cumaru com espreguiçadeiras.' }
          ]
        },
        {
          img: IMG.spa, wide: IMG.spaWide, room: 'clube', kicker: 'Bem-estar', nome: 'Spa com raia coberta',
          texto: 'Um spa em travertino e pedra verde, iluminado por um rasgo zenital, com sauna seca, sala de massagem e um jardim interno atrás do vidro.',
          itens: ['Raia coberta aquecida', 'Sauna seca e a vapor', 'Jardim interno de samambaias'],
          curiosidade: 'A pedra da raia é a mesma do terraço da cobertura: o projeto repete materiais para costurar os ambientes.',
          cam: { from: [.5, .75, 1], to: [.5, .45, 1.2] },
          hotspots: [
            { x: .5, y: .8, t: 'Raia em pedra verde', d: 'Água aquecida a 30 °C.' },
            { x: .5, y: .2, t: 'Rasgo zenital', d: 'Luz natural durante todo o dia.' },
            { x: .26, y: .5, t: 'Sauna', d: 'Revestida em madeira termotratada.' },
            { x: .88, y: .66, t: 'Jardim interno', d: 'Samambaias e bromélias nativas.' }
          ]
        }
      ]
    },

    {
      id: 'brise',
      nome: 'Casa Brise',
      tipo: 'Casa',
      status: 'Exclusivo',
      bairro: 'Cidade Jardim',
      cidade: 'São Paulo',
      uf: 'SP',
      coords: '23°35′S · 46°42′O',
      preco: 24500000,
      condominio: 0,
      iptu: 7100,
      area: 720,
      terreno: 1250,
      suites: 5,
      vagas: 6,
      banheiros: 8,
      ano: 2024,
      entrega: 'Pronta para morar',
      arquitetura: 'Moura Arquitetura',
      cover: IMG.sala,
      card: IMG.brise,
      tagline: 'Concreto, madeira e um jardim que entra pela sala.',
      resumo: 'Uma casa térrea na base e leve no alto: o volume de concreto flutua sobre o jardim, protegido por brises móveis de cumaru.',
      descricao: [
        'A Casa Brise organiza a vida em dois níveis. Embaixo, a área social se abre inteira para o jardim tropical e a piscina; em cima, as suítes ficam protegidas por painéis de cumaru que deslizam ao longo da fachada.',
        'O projeto começou com um croqui à mão da sala de estar, e o ambiente construído é praticamente idêntico ao primeiro desenho.'
      ],
      destaques: ['Terreno de 1.250 m² com jardim tropical', 'Brises móveis de cumaru', 'Piscina com borda em travertino', 'Escada escultórica com luz zenital', 'Banho integral em travertino'],
      arquiteturaTexto: {
        titulo: 'Tudo começou num traço à mão.',
        texto: 'O primeiro estudo da sala foi um croqui em grafite e aquarela. Arraste a linha para comparar o desenho com o ambiente entregue dois anos depois.',
        croqui: IMG.croqui,
        foto: IMG.sala,
        legenda: 'Croqui · 2022 — Entrega · 2024'
      },
      materiais: [
        { nome: 'Concreto aparente', uso: 'Estrutura e paredes, fôrma de tábua', cor: '#a7a39b', img: SW('concreto') },
        { nome: 'Cumaru', uso: 'Brises e fachadas, óleo natural', cor: '#8a5a33', img: SW('cumaru') },
        { nome: 'Travertino bruto', uso: 'Pisos externos e banhos', cor: '#cdbb9b', img: SW('travertino-bruto') },
        { nome: 'Terracota', uso: 'Vasos e peças de apoio', cor: '#b2603c', img: SW('terracota') },
        { nome: 'Linho cru', uso: 'Estofados e cortinas', cor: '#dcd2c0', img: SW('linho-cru') }
      ],
      obra: {
        video: 'assets/video/obra-brise.mp4?v=2',
        poster: 'assets/video/obra-brise-poster.jpg?v=2',
        etapas: [
          { t: 0, de: 0, ate: 2.4, rotulo: 'Projeto', titulo: 'Do desenho…', texto: 'A casa começa no traço: volumes baixos e abertos, encaixados no lote sem derrubar o jardim.' },
          { t: 3, de: 2.9, ate: 6.2, rotulo: 'Fundação', titulo: '…à fundação…', texto: 'O terreno é aberto só onde a casa pousa, com a vegetação do entorno preservada.' },
          { t: 8, de: 6.9, ate: 11.5, rotulo: 'Estrutura', titulo: '…ao concreto…', texto: 'A bomba lança o concreto, a laje ganha forma e a piscina já aparece marcada no térreo.' },
          { t: 14, de: 12.5, ate: 18.5, rotulo: 'Acabamento', titulo: '…ao acabamento…', texto: 'Madeira, vidro e pedra fecham a casa, que se abre para o jardim e para a piscina.' },
          { t: 23, de: 19.5, ate: 99, rotulo: 'Entrega', titulo: '…à chave.', texto: 'Casa entregue, com a piscina cheia e o jardim tropical plantado, em meio ao verde da Cidade Jardim.' }
        ]
      },
      localizacao: {
        texto: 'Numa rua sem saída da Cidade Jardim, cercada por quintais arborizados, com acesso rápido à Marginal Pinheiros e ao Jockey Club.',
        imagem: IMG.radarBrise,
        pontos: [
          { nome: 'Shopping Cidade Jardim', tempo: '5 min', ang: 200, dist: .42 },
          { nome: 'Jockey Club', tempo: '7 min', ang: 250, dist: .58 },
          { nome: 'Parque do Povo', tempo: '9 min', ang: 30, dist: .68 },
          { nome: 'Av. Faria Lima', tempo: '10 min', ang: 75, dist: .76 }
        ]
      },
      plan: {
        rooms: [
          { id: 'jardim', nome: 'Jardim e piscina', x: 4, y: 40, w: 92, h: 20, area: 530 },
          { id: 'estar', nome: 'Estar', x: 4, y: 4, w: 40, h: 34, area: 110 },
          { id: 'jantar', nome: 'Jantar', x: 46, y: 4, w: 20, h: 18, area: 42 },
          { id: 'escada', nome: 'Escada', x: 46, y: 24, w: 20, h: 14, area: 24 },
          { id: 'cozinha', nome: 'Cozinha', x: 68, y: 4, w: 28, h: 18, area: 48 },
          { id: 'banho', nome: 'Banho master', x: 68, y: 24, w: 28, h: 14, area: 26 }
        ]
      },
      scenes: [
        {
          img: IMG.brise, room: 'jardim', kicker: 'Fachada', nome: 'Um volume que flutua',
          texto: 'O pavimento superior, em concreto de fôrma de tábua, parece pousado sobre o térreo de vidro. Entre os dois, só a sombra e o jardim.',
          itens: ['Balanço estrutural de 6 m', 'Brises de cumaru deslizantes', 'Jardim tropical de Burle Marx revisitado'],
          curiosidade: 'Os brises correm em trilhos ocultos: abertos, transformam a fachada; fechados, viram uma única parede de madeira.',
          cam: { from: [.5, .55, 1], to: [.6, .35, 1.3] },
          hotspots: [
            { x: .62, y: .32, t: 'Brises de cumaru', d: 'Painéis móveis que controlam sol e privacidade.' },
            { x: .22, y: .3, t: 'Concreto de tábua', d: 'A textura da fôrma fica impressa na parede.' },
            { x: .38, y: .6, t: 'Térreo de vidro', d: 'Caixilhos que desaparecem nas paredes.' },
            { x: .76, y: .83, t: 'Piscina', d: 'Borda em travertino, alinhada à sala.' }
          ]
        },
        {
          img: IMG.sala, sketch: IMG.croqui, room: 'estar', kicker: 'Do croqui ao espaço', nome: 'Sala de estar',
          texto: 'Role devagar: o croqui original dá lugar à sala construída. Painel de freijó, sofá de linho e a mesa de travertino com vasos de argila.',
          itens: ['110 m² abertos para o jardim', 'Caixilhos de piso a teto', 'Painel contínuo de freijó'],
          curiosidade: 'O enquadramento do croqui e o da foto coincidem pixel a pixel: a casa foi construída exatamente como desenhada.',
          cam: { from: [.5, .55, 1.04], to: [.62, .5, 1.28] },
          hotspots: [
            { x: .2, y: .66, t: 'Sofá de linho', d: 'Peça sob medida de 3,2 m.' },
            { x: .42, y: .58, t: 'Poltrona de couro', d: 'Design brasileiro dos anos 60.' },
            { x: .56, y: .76, t: 'Mesa em travertino', d: 'Bloco único com vasos de argila.' },
            { x: .75, y: .6, t: 'Piscina e jardim', d: 'A sala termina na água.' }
          ]
        },
        {
          img: IMG.escada, wide: IMG.escadaWide, room: 'escada', kicker: 'Circulação', nome: 'A escada escultórica',
          texto: 'Degraus maciços de madeira engastados no concreto, sem corrimão aparente. Uma claraboia derrama luz sobre a parede ao longo do dia.',
          itens: ['Degraus de cumaru maciço', 'Claraboia linear', 'Biblioteca no mezanino'],
          curiosidade: 'Cada degrau é chumbado 40 cm dentro da parede: a escada é parte da estrutura da casa.',
          cam: { from: [.45, .75, 1], to: [.45, .3, 1.2] },
          hotspots: [
            { x: .4, y: .6, t: 'Degraus em balanço', d: 'Engastados direto no concreto.' },
            { x: .46, y: .13, t: 'Luz zenital', d: 'O desenho da luz muda a cada hora.' },
            { x: .68, y: .78, t: 'Vaso de terracota', d: 'Cerâmica artesanal do Vale do Jequitinhonha.' },
            { x: .62, y: .27, t: 'Biblioteca', d: 'Estante embutida no mezanino.' }
          ]
        },
        {
          img: IMG.banho, wide: IMG.banhoWide, room: 'banho', kicker: 'Área íntima', nome: 'Banho em travertino',
          texto: 'Um banho escavado em pedra: banheira, bancada e paredes em travertino, abertos para um pequeno jardim interno.',
          itens: ['Banheira esculpida em bloco único', 'Metais em latão escovado', 'Jardim privativo'],
          curiosidade: 'A pedra veio de um só bloco, cortado em sequência para que os veios continuem de uma peça para a outra.',
          cam: { from: [.5, .7, 1], to: [.5, .4, 1.22] },
          hotspots: [
            { x: .2, y: .74, t: 'Banheira esculpida', d: 'Travertino maciço, sem emendas visíveis.' },
            { x: .46, y: .4, t: 'Jardim interno', d: 'Samambaias e bromélias.' },
            { x: .74, y: .6, t: 'Bancada monolítica', d: 'Cuba escavada na própria pedra.' },
            { x: .88, y: .53, t: 'Metais em latão', d: 'Acabamento escovado que envelhece bem.' }
          ]
        }
      ]
    },

    {
      id: 'horizonte',
      nome: 'Casa Horizonte',
      tipo: 'Casa em condomínio',
      status: 'Pronto para morar',
      bairro: 'Vale dos Cristais',
      cidade: 'Nova Lima',
      uf: 'MG',
      coords: '19°59′S · 43°56′O',
      preco: 9800000,
      condominio: 2400,
      iptu: 2900,
      area: 610,
      terreno: 1100,
      suites: 4,
      vagas: 4,
      banheiros: 6,
      ano: 2023,
      entrega: 'Pronta para morar',
      arquitetura: 'Estúdio Serra',
      cover: IMG.horizonte,
      card: IMG.horizonte,
      tagline: 'A paisagem como parte de cada ambiente.',
      resumo: 'Grandes aberturas conectam a casa ao jardim: sala, jantar e cozinha formam um único espaço contínuo, protegido por um eucalipto centenário.',
      descricao: [
        'A Casa Horizonte foi implantada ao redor de uma árvore existente. Em vez de removê-la, o projeto dobrou a planta em L e fez do eucalipto o centro da casa.',
        'No térreo, a área social se abre para a varanda gourmet; no pavimento superior, o volume escuro de madeira guarda as suítes, com janelas verticais para a mata.'
      ],
      destaques: ['Eucalipto centenário preservado', 'Planta em L com varanda gourmet', 'Lareira em pedra natural', 'Escada metálica com degraus de madeira', 'Condomínio com segurança 24 h'],
      arquiteturaTexto: {
        titulo: 'Uma casa desenhada em volta de uma árvore.',
        texto: 'O Estúdio Serra mapeou a copa do eucalipto antes do primeiro traço. A planta em L abraça o tronco, e os grandes vãos de vidro garantem que a árvore apareça de todos os ambientes sociais.',
        imagem: IMG.mesa,
        legenda: 'Estudos de implantação e maquete'
      },
      materiais: [
        { nome: 'Madeira ripada', uso: 'Fachada e painéis internos', cor: '#6b4a32', img: SW('cumaru') },
        { nome: 'Concreto em placas', uso: 'Parede da escada', cor: '#b5b3ad', img: SW('concreto') },
        { nome: 'Aço preto', uso: 'Caixilhos, escada e trilhos', cor: '#1d1d1b', img: SWJ('aco-preto') },
        { nome: 'Carvalho natural', uso: 'Pisos e marcenaria', cor: '#c49a6c', img: SW('freijo') }
      ],
      obra: {
        video: 'assets/video/obra-horizonte.mp4?v=2',
        poster: 'assets/video/obra-horizonte-poster.jpg?v=2',
        etapas: [
          { t: 0, de: 0, ate: 2.4, rotulo: 'Projeto', titulo: 'Do desenho…', texto: 'A casa nasce no traço: volumes em degraus, descendo a encosta e olhando para as montanhas.' },
          { t: 3, de: 2.9, ate: 6.2, rotulo: 'Fundação', titulo: '…à fundação…', texto: 'O terreno é terraplenado em patamares, só onde a casa pousa, com a mata em volta preservada.' },
          { t: 8, de: 6.9, ate: 11.5, rotulo: 'Estrutura', titulo: '…ao concreto…', texto: 'As equipes levantam a estrutura em níveis, com a grua e a bomba de concreto no canteiro.' },
          { t: 14, de: 12.5, ate: 18.5, rotulo: 'Acabamento', titulo: '…ao acabamento…', texto: 'Madeira, pedra e vidro fecham os volumes, e a piscina e o pergolado ganham forma.' },
          { t: 23, de: 19.5, ate: 99, rotulo: 'Entrega', titulo: '…à chave.', texto: 'Casa entregue ao fim da tarde, com piscina, jardim e as montanhas do Vale dos Cristais ao fundo.' }
        ]
      },
      localizacao: {
        texto: 'No alto do Vale dos Cristais, com vista para a Serra do Curral, a 15 minutos do centro de Belo Horizonte.',
        imagem: IMG.radarHorizonte,
        pontos: [
          { nome: 'BH Shopping', tempo: '12 min', ang: 340, dist: .6 },
          { nome: 'Serra do Curral', tempo: '10 min', ang: 20, dist: .5 },
          { nome: 'Escolas internacionais', tempo: '8 min', ang: 150, dist: .4 },
          { nome: 'Centro de Belo Horizonte', tempo: '15 min', ang: 300, dist: .8 }
        ]
      },
      plan: {
        rooms: [
          { id: 'jardim', nome: 'Jardim', x: 4, y: 36, w: 52, h: 24, area: 420 },
          { id: 'jantar', nome: 'Jantar', x: 4, y: 4, w: 30, h: 30, area: 54 },
          { id: 'estar', nome: 'Estar', x: 36, y: 4, w: 34, h: 30, area: 72 },
          { id: 'cozinha', nome: 'Cozinha', x: 72, y: 4, w: 24, h: 18, area: 36 },
          { id: 'varanda', nome: 'Varanda gourmet', x: 58, y: 36, w: 38, h: 24, area: 64 },
          { id: 'escada', nome: 'Escada', x: 72, y: 24, w: 24, h: 10, area: 16 }
        ]
      },
      scenes: [
        {
          img: IMG.horizonte, room: 'jardim', kicker: 'Chegada', nome: 'A casa e a árvore',
          texto: 'Ao entardecer, a casa se acende por dentro. O volume superior em madeira escura flutua sobre o térreo de vidro, à sombra do eucalipto.',
          itens: ['Planta em L ao redor da árvore', 'Volume superior em madeira', 'Gramado de 420 m²'],
          curiosidade: 'O eucalipto tem cerca de 90 anos e foi monitorado por um agrônomo durante toda a obra.',
          cam: { from: [.5, .6, 1], to: [.42, .4, 1.25] },
          hotspots: [
            { x: .42, y: .3, t: 'Eucalipto centenário', d: 'O ponto de partida do projeto.' },
            { x: .5, y: .45, t: 'Volume das suítes', d: 'Janelas verticais para a mata.' },
            { x: .66, y: .63, t: 'Varanda gourmet', d: 'Abre-se inteira para o gramado.' },
            { x: .22, y: .6, t: 'Ripado de madeira', d: 'Fachada ventilada com tratamento natural.' }
          ]
        },
        {
          img: IMG.refugio, room: 'jantar', kicker: 'Área social', nome: 'Jantar e escada',
          texto: 'Madeira, concreto e linhas leves. A escada metálica desenha uma diagonal sobre a parede de placas, e o jantar se abre para o deck.',
          itens: ['Mesa para 8 lugares', 'Parede em placas de concreto', 'Iluminação em trilho'],
          curiosidade: 'As placas de concreto escondem uma porta: o lavabo fica atrás da parede, sem nenhuma moldura aparente.',
          cam: { from: [.4, .55, 1], to: [.3, .42, 1.25] },
          hotspots: [
            { x: .35, y: .32, t: 'Escada metálica', d: 'Degraus de madeira e guarda em vidro.' },
            { x: .12, y: .5, t: 'Porta oculta', d: 'Integrada ao desenho das placas.' },
            { x: .24, y: .66, t: 'Mesa de jantar', d: 'Tampo em madeira ebanizada.' },
            { x: .74, y: .45, t: 'Ripado', d: 'Filtra a luz entre o jantar e o estar.' }
          ]
        },
        {
          img: IMG.convivio, sketch: IMG.sketchHorizonte, room: 'estar', kicker: 'Do croqui ao espaço', nome: 'Estar e cozinha',
          texto: 'Sala e cozinha se conectam em um espaço fluido, feito para compartilhar refeições, conversas e bons momentos.',
          itens: ['Lareira em pedra natural', 'Cozinha com ilha de 3,2 m', 'Portas de vidro de correr'],
          curiosidade: 'As portas de vidro correm para dentro das paredes: abertas, a sala vira varanda.',
          cam: { from: [.45, .6, 1], to: [.55, .45, 1.28] },
          hotspots: [
            { x: .3, y: .74, t: 'Sofá modular', d: 'Linho claro e pés recuados.' },
            { x: .64, y: .5, t: 'Lareira', d: 'Revestida em pedra em espinha de peixe.' },
            { x: .53, y: .55, t: 'Ilha da cozinha', d: 'Quartzo branco com banquetas de madeira.' },
            { x: .85, y: .38, t: 'Painel de madeira', d: 'Réguas de madeira de demolição.' }
          ]
        },
        {
          img: IMG.convivio, room: 'cozinha', kicker: 'Detalhe', nome: 'A cozinha ao fundo',
          texto: 'Marcenaria clara, pendentes pretos e a bancada contínua formam um fundo calmo para a sala. Tudo o que não precisa aparecer fica atrás de portas lisas.',
          itens: ['Marcenaria em carvalho', 'Pendentes em cerâmica', 'Despensa integrada'],
          curiosidade: 'A cozinha fica um degrau acima da sala, o suficiente para separar os usos sem nenhuma parede.',
          cam: { from: [.55, .45, 1.28], to: [.5, .42, 1.8] },
          hotspots: [
            { x: .52, y: .37, t: 'Pendentes', d: 'Trio em cerâmica preta fosca.' },
            { x: .41, y: .44, t: 'Torre quente', d: 'Fornos embutidos em carvalho.' }
          ]
        }
      ]
    },

    {
      id: 'mare',
      nome: 'Casa Maré',
      tipo: 'Casa de praia',
      status: 'Exclusivo',
      bairro: 'Barra do Sahy',
      cidade: 'São Sebastião',
      uf: 'SP',
      coords: '23°45′S · 45°40′O',
      preco: 12400000,
      condominio: 1800,
      iptu: 3200,
      area: 540,
      terreno: 2100,
      suites: 5,
      vagas: 4,
      banheiros: 7,
      ano: 2023,
      entrega: 'Pronta para morar',
      arquitetura: 'Moura Arquitetura',
      cover: IMG.mare,
      card: IMG.mare,
      tagline: 'A casa inteira se abre nos dias de calor.',
      resumo: 'Uma varanda com pergolado de madeira clara entre a mata e o mar. Sala, cozinha e deck formam um único piso contínuo até a areia.',
      descricao: [
        'A Casa Maré foi pensada como uma grande varanda. O pergolado de madeira filtra o sol do litoral e desenha listras de luz que se movem ao longo do dia sobre o deck de travertino.',
        'Os fechamentos de vidro deslizam por completo: com a casa aberta, a brisa atravessa a planta de ponta a ponta e dispensa o ar-condicionado na maior parte do ano.'
      ],
      destaques: ['Pé na areia, com acesso privativo', 'Pergolado de 18 m em madeira clara', 'Ventilação cruzada em toda a casa', 'Paredes de taipa contemporânea', 'Mata Atlântica preservada no terreno'],
      arquiteturaTexto: {
        titulo: 'Uma sombra generosa, e o resto é paisagem.',
        texto: 'A arquitetura aqui é quase só cobertura. O pergolado protege, as paredes de taipa guardam o frescor e a planta livre deixa o vento e a vista atravessarem a casa.',
        imagem: IMG.materiais,
        legenda: 'Paleta de materiais da casa'
      },
      materiais: [
        { nome: 'Freijó claro', uso: 'Pergolado e esquadrias', cor: '#c49a6c', img: SW('freijo') },
        { nome: 'Travertino', uso: 'Deck e pisos externos', cor: '#d9cbb2', img: SW('travertino') },
        { nome: 'Taipa contemporânea', uso: 'Paredes de vedação', cor: '#c2a27f', img: SWJ('taipa') },
        { nome: 'Linho cru', uso: 'Almofadas e cortinas', cor: '#dcd2c0', img: SW('linho-cru') }
      ],
      // Vídeo da obra controlado pela rolagem. t = segundo do vídeo em que cada etapa aparece.
      obra: {
        video: 'assets/video/obra-mare.mp4?v=2',
        poster: 'assets/video/obra-mare-poster.jpg?v=2',
        etapas: [
          { t: 0, de: 0, ate: 3.6, rotulo: 'Projeto', titulo: 'Do desenho…', texto: 'Antes do primeiro corte, a casa já existia no traço: implantada entre as árvores, sem tocar no que não precisava.' },
          { t: 7.9, de: 5.2, ate: 10.6, rotulo: 'Fundação', titulo: '…à fundação…', texto: 'O terreno é aberto só onde a casa pousa. Sapatas e vigas baldrame sobre a rocha firme da encosta.' },
          { t: 15.7, de: 12.8, ate: 18.4, rotulo: 'Estrutura', titulo: '…ao concreto…', texto: 'Pilares, lajes e a piscina concretados no lugar, com a mata preservada em volta.' },
          { t: 23.5, de: 20.6, ate: 26, rotulo: 'Acabamento', titulo: '…ao acabamento…', texto: 'Paredes fechadas, pergolado de madeira clara e o deck tomando forma voltado para o mar.' },
          { t: 31.4, de: 28.4, ate: 99, rotulo: 'Entrega', titulo: '…à chave.', texto: 'Água na piscina, jardim plantado. Pronta para morar, com a praia a poucos passos.' }
        ]
      },
      localizacao: {
        texto: 'Na Barra do Sahy, uma das praias mais preservadas do Litoral Norte, entre a Serra do Mar e o canal de São Sebastião.',
        imagem: IMG.radarMare,
        pontos: [
          { nome: 'Praia da Baleia', tempo: '6 min', ang: 80, dist: .45 },
          { nome: 'Juquehy', tempo: '10 min', ang: 250, dist: .6 },
          { nome: 'Heliponto', tempo: '8 min', ang: 160, dist: .52 },
          { nome: 'Maresias', tempo: '25 min', ang: 60, dist: .85 }
        ]
      },
      plan: {
        rooms: [
          { id: 'estar', nome: 'Estar', x: 4, y: 4, w: 40, h: 28, area: 92 },
          { id: 'cozinha', nome: 'Cozinha e jantar', x: 46, y: 4, w: 26, h: 28, area: 74 },
          { id: 'suite', nome: 'Suíte master', x: 74, y: 4, w: 22, h: 28, area: 58 },
          { id: 'varanda', nome: 'Varanda e pergolado', x: 4, y: 34, w: 40, h: 26, area: 140 },
          { id: 'deck', nome: 'Deck e mar', x: 46, y: 34, w: 50, h: 26, area: 210 }
        ]
      },
      scenes: [
        {
          img: IMG.mare, room: 'varanda', kicker: 'Chegada', nome: 'A varanda',
          texto: 'O sofá de alvenaria acompanha toda a borda da varanda, sob o pergolado de madeira. Daqui se vê a mata, a casa e o mar ao mesmo tempo.',
          itens: ['Sofá contínuo de 11 m', 'Pergolado de 18 m em freijó', 'Deck em travertino'],
          curiosidade: 'O espaçamento das réguas do pergolado foi calculado num estudo de insolação: ao meio-dia de janeiro, 70% do sol é bloqueado.',
          cam: { from: [.4, .6, 1], to: [.5, .5, 1] },
          hotspots: [
            { x: .5, y: .2, t: 'Pergolado de freijó', d: 'Réguas tratadas para a maresia, com balanço de 4 m.' },
            { x: .26, y: .75, t: 'Sofá de alvenaria', d: 'Base em madeira e almofadas de linho cru.' },
            { x: .62, y: .8, t: 'Deck em travertino', d: 'Pedra antiderrapante, fresca ao toque.' },
            { x: .92, y: .58, t: 'Canal e ilhas', d: 'Vista aberta para o mar.' }
          ]
        },
        {
          img: IMG.mareSala, sketch: IMG.sketchMare, room: 'estar', kicker: 'Do croqui ao espaço', nome: 'Estar aberto para o mar',
          texto: 'Paredes de taipa, forro de madeira e um sofá em L de linho. Os caixilhos correm por inteiro e a sala termina no deck, de frente para as montanhas e o mar.',
          itens: ['Caixilhos totalmente recolhíveis', 'Paredes de taipa contemporânea', 'Forro em freijó'],
          curiosidade: 'Os trilhos dos caixilhos ficam embutidos no piso: com a casa aberta, não há nenhum degrau entre dentro e fora.',
          cam: { from: [.45, .55, 1], to: [.55, .5, 1] },
          hotspots: [
            { x: .2, y: .62, t: 'Sofá em linho cru', d: 'Módulos sob medida, com 6 m de comprimento.' },
            { x: .5, y: .7, t: 'Mesa em tronco maciço', d: 'Peça única de madeira de demolição.' },
            { x: .07, y: .47, t: 'Parede de taipa', d: 'Terra compactada que guarda o frescor do dia.' },
            { x: .84, y: .42, t: 'Vista para o mar', d: 'As montanhas e o canal emoldurados pelo pergolado.' }
          ]
        },
        {
          img: IMG.mareCozinha, room: 'cozinha', kicker: 'Área social', nome: 'Cozinha e jantar',
          texto: 'Uma ilha de travertino com banquetas, a mesa de madeira para doze pessoas e luminárias de fibra natural. Ao fundo, o vão inteiro se abre para o mar.',
          itens: ['Ilha em travertino de 4 m', 'Mesa para 12 lugares', 'Luminárias em fibra natural'],
          curiosidade: 'A mesa foi alinhada ao eixo da vista: de qualquer cadeira, o mar aparece no centro do vão.',
          cam: { from: [.45, .55, 1], to: [.55, .5, 1] },
          hotspots: [
            { x: .14, y: .62, t: 'Ilha em travertino', d: 'Bloco único, com cuba e cooktop embutidos.' },
            { x: .72, y: .62, t: 'Mesa para 12', d: 'Madeira maciça e cadeiras de fibra trançada.' },
            { x: .77, y: .28, t: 'Luminárias de fibra', d: 'Trançadas à mão por artesãos do litoral.' },
            { x: .5, y: .42, t: 'Vão para o mar', d: 'Oito metros de abertura sem pilar.' }
          ]
        },
        {
          img: IMG.mareSuite, room: 'suite', kicker: 'Área íntima', nome: 'Suíte master',
          texto: 'Uma cama baixa de madeira, parede ripada e cortinas de linho que se movem com o vento. A suíte se abre para um terraço privativo com vista para o mar.',
          itens: ['Terraço privativo', 'Parede ripada em freijó', 'Cortinas de linho'],
          curiosidade: 'A suíte foi posicionada a leste: o sol da manhã entra pelo terraço e nunca bate direto na cama.',
          cam: { from: [.45, .55, 1], to: [.55, .5, 1] },
          hotspots: [
            { x: .22, y: .66, t: 'Cama em plataforma', d: 'Madeira maciça e roupa de cama em linho.' },
            { x: .08, y: .3, t: 'Parede ripada', d: 'Freijó com acabamento a óleo natural.' },
            { x: .58, y: .72, t: 'Banco de madeira', d: 'Peça única entalhada em um só bloco.' },
            { x: .84, y: .4, t: 'Terraço privativo', d: 'Deck com espreguiçadeira e vista para o mar.' }
          ]
        }
      ]
    },

    {
      id: 'copa',
      nome: 'Residência Copa',
      tipo: 'Apartamento',
      status: 'Pronto para morar',
      bairro: 'Alto de Pinheiros',
      cidade: 'São Paulo',
      uf: 'SP',
      coords: '23°33′S · 46°42′O',
      preco: 7400000,
      condominio: 4300,
      iptu: 1900,
      area: 310,
      suites: 3,
      vagas: 4,
      banheiros: 5,
      andar: '11º pavimento',
      ano: 2023,
      entrega: 'Pronto para morar',
      arquitetura: 'Moura Arquitetura',
      cover: IMG.copa,
      card: IMG.copa,
      tagline: 'Planta liberada e a copa das árvores pela janela.',
      resumo: 'Um apartamento de 310 m² com planta liberada, marcenaria sob medida e uma janela de canto que enquadra a Praça Pôr do Sol.',
      descricao: [
        'Na reforma, as paredes entre sala, jantar e biblioteca foram removidas. O resultado é um único ambiente em L, com a janela de canto como ponto focal.',
        'A marcenaria em nogueira organiza livros, louças e objetos, e o piso em espinha de peixe dá continuidade a todos os espaços.'
      ],
      destaques: ['Janela de canto de 6 m', 'Marcenaria sob medida em nogueira', 'Piso em espinha de peixe', 'Planta liberada em L', 'Vista para a Praça Pôr do Sol'],
      arquiteturaTexto: {
        titulo: 'Menos paredes, mais horizonte.',
        texto: 'A estrutura do edifício permitiu remover todas as divisórias da área social. A planta foi redesenhada a partir da janela: cada móvel está posicionado para que a vista apareça.',
        imagem: IMG.mesa,
        legenda: 'Estudos da reforma'
      },
      materiais: [
        { nome: 'Nogueira', uso: 'Marcenaria e mesa', cor: '#6e4a31', img: SWJ('nogueira') },
        { nome: 'Carvalho', uso: 'Piso em espinha de peixe', cor: '#b98a5c', img: SW('freijo') },
        { nome: 'Linho cru', uso: 'Sofá e cortinas', cor: '#dcd2c0', img: SW('linho-cru') },
        { nome: 'Terracota', uso: 'Revestimentos e cerâmicas', cor: '#b2603c', img: SW('terracota') }
      ],
      obra: {
        video: 'assets/video/obra-copa.mp4?v=2',
        poster: 'assets/video/obra-copa-poster.jpg?v=2',
        etapas: [
          { t: 0, de: 0, ate: 2.4, rotulo: 'Projeto', titulo: 'Do desenho…', texto: 'O edifício nasce no traço: poucos andares, terraços generosos e o verde entrando em cada pavimento.' },
          { t: 3, de: 2.9, ate: 5.6, rotulo: 'Fundação', titulo: '…à fundação…', texto: 'O terreno é aberto e a base concretada, com a bomba de concreto e a grua no ritmo calmo de Alto de Pinheiros.' },
          { t: 7, de: 6.2, ate: 10.5, rotulo: 'Estrutura', titulo: '…ao concreto…', texto: 'Os pavimentos sobem um a um, e as lajes e as varandas já marcam o desenho da fachada.' },
          { t: 13, de: 11.5, ate: 17, rotulo: 'Acabamento', titulo: '…ao acabamento…', texto: 'Madeira e pedra fecham as fachadas e os terraços começam a receber o paisagismo.' },
          { t: 23, de: 18.5, ate: 99, rotulo: 'Entrega', titulo: '…à chave.', texto: 'Residência entregue, com jardins nos terraços e a copa das árvores na altura da varanda.' }
        ]
      },
      localizacao: {
        texto: 'Em frente à Praça Pôr do Sol, numa das áreas mais verdes de São Paulo, perto da USP e da Vila Madalena.',
        imagem: IMG.radarCopa,
        pontos: [
          { nome: 'Praça Pôr do Sol', tempo: '1 min', ang: 300, dist: .18 },
          { nome: 'Parque Villa-Lobos', tempo: '8 min', ang: 230, dist: .55 },
          { nome: 'Vila Madalena', tempo: '9 min', ang: 60, dist: .62 },
          { nome: 'Cidade Universitária', tempo: '10 min', ang: 160, dist: .7 }
        ]
      },
      plan: {
        rooms: [
          { id: 'jantar', nome: 'Estar e jantar', x: 4, y: 4, w: 44, h: 28, area: 106 },
          { id: 'biblioteca', nome: 'Biblioteca', x: 50, y: 4, w: 20, h: 28, area: 36 },
          { id: 'cozinha', nome: 'Cozinha', x: 72, y: 4, w: 24, h: 28, area: 34 },
          { id: 'suite', nome: 'Suíte master', x: 4, y: 34, w: 44, h: 26, area: 58 },
          { id: 'banho', nome: 'Banho master', x: 50, y: 34, w: 20, h: 26, area: 16 },
          { id: 'servico', nome: 'Suítes e serviço', x: 72, y: 34, w: 24, h: 26, area: 60 }
        ]
      },
      scenes: [
        {
          img: IMG.copa, wide: IMG.copaWide, room: 'jantar', kicker: 'Área social', nome: 'Sala de jantar',
          texto: 'A mesa de nogueira ocupa o centro do L. Daqui se vê o estar, as estantes e a janela de canto, com a copa das árvores à altura da sala.',
          itens: ['Mesa de nogueira para 8', 'Janela de canto de 6 m', 'Piso em espinha de peixe'],
          curiosidade: 'É a única unidade do prédio em que o pilar de canto foi transferido, deixando a esquina inteira de vidro.',
          cam: { from: [.5, .7, 1], to: [.5, .45, 1] },
          hotspots: [
            { x: .7, y: .64, t: 'Mesa de nogueira', d: 'Feita com a madeira de uma única árvore.' },
            { x: .6, y: .35, t: 'Estante embutida', d: 'Nichos de alturas diferentes para livros de arte.' },
            { x: .15, y: .4, t: 'Janela de canto', d: 'Seis metros de vidro sem coluna.' },
            { x: .81, y: .57, t: 'Moringa de terracota', d: 'Cerâmica artesanal paulista.' }
          ]
        },
        {
          img: IMG.copaCozinha, sketch: IMG.sketchCopa, room: 'cozinha', kicker: 'Do croqui ao espaço', nome: 'Cozinha em nogueira',
          texto: 'Marcenaria de nogueira do piso ao teto, revestimento artesanal de terracota e uma ilha de pedra clara com banquetas. A janela leva o verde da praça até o fogão.',
          itens: ['Ilha em pedra natural', 'Revestimento de terracota feito à mão', 'Metais em latão'],
          curiosidade: 'Os azulejos de terracota foram queimados em um forno a lenha no interior de São Paulo, por isso nenhum tem exatamente a mesma cor.',
          cam: { from: [.45, .55, 1], to: [.55, .5, 1] },
          hotspots: [
            { x: .5, y: .56, t: 'Ilha em pedra', d: 'Quartzito claro com acabamento escovado.' },
            { x: .27, y: .4, t: 'Terracota artesanal', d: 'Azulejos queimados em forno a lenha.' },
            { x: .34, y: .42, t: 'Metais em latão', d: 'Escovados, ganham pátina com o uso.' },
            { x: .88, y: .38, t: 'Janela para a praça', d: 'Copa das árvores e o skyline ao fundo.' }
          ]
        },
        {
          img: IMG.copaSuite, room: 'suite', kicker: 'Área íntima', nome: 'Suíte com pôr do sol',
          texto: 'Painel de nogueira atrás da cama, linho, tricô e uma janela inteira voltada para o poente. No fim da tarde, a luz atravessa as árvores e enche o quarto.',
          itens: ['Painel de nogueira', 'Janela para o poente', 'Cortinas de linho'],
          curiosidade: 'A suíte fica exatamente no eixo da Praça Pôr do Sol: no inverno, o sol se põe no centro da janela.',
          cam: { from: [.45, .55, 1], to: [.55, .5, 1] },
          hotspots: [
            { x: .25, y: .22, t: 'Obra em pigmento', d: 'Pintura em terra sobre tela de linho.' },
            { x: .45, y: .6, t: 'Cama em linho', d: 'Manta tricotada à mão.' },
            { x: .06, y: .48, t: 'Luminária de terracota', d: 'Base em cerâmica e cúpula de linho.' },
            { x: .72, y: .35, t: 'Janela para o poente', d: 'O pôr do sol atrás das árvores da praça.' }
          ]
        },
        {
          img: IMG.copaBanho, room: 'banho', kicker: 'Área íntima', nome: 'Banho master',
          texto: 'Pedra clara do piso às paredes, uma bancada de nogueira suspensa e metais em latão. O box de vidro termina numa janela com vista para as copas.',
          itens: ['Bancada suspensa em nogueira', 'Box com vista', 'Metais em latão escovado'],
          curiosidade: 'O ralo linear fica escondido sob a pedra: o piso do box é contínuo com o resto do banho.',
          cam: { from: [.45, .55, 1], to: [.55, .5, 1] },
          hotspots: [
            { x: .2, y: .74, t: 'Bancada de nogueira', d: 'Suspensa, com tampo em pedra clara.' },
            { x: .15, y: .52, t: 'Metais em latão', d: 'Torneira de parede em latão escovado.' },
            { x: .57, y: .4, t: 'Janela para as copas', d: 'Luz natural da tarde no banho.' },
            { x: .82, y: .36, t: 'Box com nicho', d: 'Chuveiro de teto e nicho embutido na pedra.' }
          ]
        }
      ]
    },

    {
      id: 'aurora',
      nome: 'Residência Aurora',
      tipo: 'Apartamento',
      status: 'Lançamento',
      bairro: 'Vila Nova Conceição',
      cidade: 'São Paulo',
      uf: 'SP',
      coords: '23°35′S · 46°40′O',
      preco: 6200000,
      condominio: 3600,
      iptu: 1600,
      area: 236,
      suites: 3,
      vagas: 3,
      banheiros: 4,
      andar: '31º pavimento',
      ano: 2027,
      entrega: 'Jun/2027',
      arquitetura: 'Ateliê Norte',
      cover: IMG.aurora,
      card: IMG.aurora,
      tagline: 'Luz natural do nascente ao poente.',
      resumo: 'Luz natural, tons acolhedores e vegetação dão vida a uma sala pensada para desacelerar e receber bem, no alto da Vila Nova Conceição.',
      descricao: [
        'A Residência Aurora ocupa a esquina leste do 31º andar. As janelas de pé-direito duplo recebem o sol da manhã e o dividem com as plantas que ocupam a sala.',
        'O interior foi composto com peças de couro, madeira e linho, e uma galeria de fotografias que transforma a parede principal em uma memória de família.'
      ],
      destaques: ['Pé-direito duplo na sala', 'Vista para o Parque do Ibirapuera', 'Andar alto, face leste', 'Galeria de fotografias sob medida', 'Suíte com vista para o lago'],
      arquiteturaTexto: {
        titulo: 'Uma sala que acompanha o sol.',
        texto: 'A torre foi girada 12° em relação à rua para que a sala ficasse de frente para o nascente. A luz entra baixa pela manhã e chega até o fundo do ambiente.',
        imagem: IMG.maquete,
        legenda: 'Maquete de estudo da torre'
      },
      materiais: [
        { nome: 'Couro caramelo', uso: 'Sofá e banco da suíte', cor: '#9a5b33', img: SWJ('couro-caramelo') },
        { nome: 'Carvalho', uso: 'Piso e mesa de jantar', cor: '#b98a5c', img: SW('freijo') },
        { nome: 'Linho branco', uso: 'Poltronas e cortinas', cor: '#ece6da', img: SW('linho-cru') },
        { nome: 'Aço preto', uso: 'Estruturas e molduras', cor: '#1d1d1b', img: SWJ('aco-preto') }
      ],
      obra: {
        video: 'assets/video/obra-aurora.mp4?v=2',
        poster: 'assets/video/obra-aurora-poster.jpg?v=2',
        etapas: [
          { t: 0, de: 0, ate: 2.4, rotulo: 'Projeto', titulo: 'Do desenho…', texto: 'A torre começa no traço: uma lâmina de vidro e pedra, desenhada para o horizonte do Ibirapuera.' },
          { t: 3, de: 2.9, ate: 5.6, rotulo: 'Fundação', titulo: '…à fundação…', texto: 'O terreno é escavado e a base concretada, com a grua e a bomba de concreto abrindo caminho entre as copas do bairro.' },
          { t: 7, de: 6.2, ate: 10.5, rotulo: 'Estrutura', titulo: '…ao concreto…', texto: 'Pavimento a pavimento, as equipes levantam a estrutura e já desenham a silhueta final.' },
          { t: 13, de: 11.5, ate: 17, rotulo: 'Acabamento', titulo: '…ao acabamento…', texto: 'As fachadas são fechadas andar por andar e cada pavimento ganha a sua varanda voltada para o parque.' },
          { t: 23, de: 18.5, ate: 99, rotulo: 'Entrega', titulo: '…à chave.', texto: 'Torre entregue à luz do fim de tarde, com os andares acesos. Pronta para morar, com o parque do outro lado da rua.' }
        ]
      },
      localizacao: {
        texto: 'Na Vila Nova Conceição, a duas quadras do Parque do Ibirapuera, entre restaurantes e o comércio de rua do bairro.',
        imagem: IMG.radarAurora,
        pontos: [
          { nome: 'Parque do Ibirapuera', tempo: '3 min', ang: 20, dist: .3 },
          { nome: 'Rua Joaquim Floriano', tempo: '6 min', ang: 220, dist: .5 },
          { nome: 'Av. Juscelino Kubitschek', tempo: '7 min', ang: 260, dist: .56 },
          { nome: 'Shopping JK Iguatemi', tempo: '9 min', ang: 240, dist: .7 }
        ]
      },
      plan: {
        rooms: [
          { id: 'estar', nome: 'Estar', x: 4, y: 4, w: 44, h: 30, area: 68 },
          { id: 'jantar', nome: 'Jantar', x: 50, y: 4, w: 24, h: 30, area: 32 },
          { id: 'varanda', nome: 'Varanda', x: 76, y: 4, w: 20, h: 30, area: 22 },
          { id: 'suite', nome: 'Suíte master', x: 4, y: 36, w: 44, h: 24, area: 52 },
          { id: 'suites', nome: 'Suítes e serviço', x: 50, y: 36, w: 46, h: 24, area: 62 }
        ]
      },
      scenes: [
        {
          img: IMG.aurora, room: 'estar', kicker: 'Área social', nome: 'Sala de estar',
          texto: 'Um sofá de couro caramelo, poltronas claras de estrutura preta e uma mesa redonda de madeira. Na parede, dezesseis fotografias em grade transformam a sala em memória.',
          itens: ['Pé-direito duplo', 'Galeria de fotografias 4 × 4', 'Mesa de centro em carvalho'],
          curiosidade: 'As molduras usam vidro antirreflexo: mesmo com o sol da manhã, as fotografias continuam legíveis.',
          cam: { from: [.5, .65, 1], to: [.5, .45, 1] },
          hotspots: [
            { x: .75, y: .62, t: 'Sofá de couro', d: 'Couro caramelo que ganha pátina com o tempo.' },
            { x: .18, y: .68, t: 'Poltronas', d: 'Estrutura em aço preto e linho branco.' },
            { x: .4, y: .25, t: 'Galeria 4 × 4', d: 'Fotografias em preto e branco.' },
            { x: .92, y: .3, t: 'Pé-direito duplo', d: 'Esquadrias de 6 m de altura.' }
          ]
        },
        {
          img: IMG.auroraJantar, sketch: IMG.sketchAurora, room: 'jantar', kicker: 'Do croqui ao espaço', nome: 'Jantar sobre a cidade',
          texto: 'Uma mesa redonda de carvalho sob uma luminária de papel, cercada por janelas de pé-direito duplo. Do 31º andar, o skyline e o Ibirapuera viram parte da mesa.',
          itens: ['Mesa redonda em carvalho', 'Janelas de 6 m de altura', 'Vista para o Ibirapuera'],
          curiosidade: 'Nos dias claros, é possível ver a Serra da Cantareira no horizonte, a mais de 25 km.',
          cam: { from: [.45, .55, 1], to: [.55, .5, 1] },
          hotspots: [
            { x: .55, y: .62, t: 'Mesa de carvalho', d: 'Base escultórica em madeira maciça.' },
            { x: .55, y: .25, t: 'Luminária de papel', d: 'Papel de arroz sobre estrutura de bambu.' },
            { x: .28, y: .32, t: 'Figueira-lira', d: 'Faz a transição entre a sala e a cidade.' },
            { x: .88, y: .45, t: 'Vista leste', d: 'O skyline e o parque à luz da manhã.' }
          ]
        },
        {
          img: IMG.auroraSuite, room: 'suite', kicker: 'Área íntima', nome: 'Suíte com vista para o lago',
          texto: 'Linho branco, tricô e um banco de couro caramelo aos pés da cama. A janela de piso a teto enquadra o lago do Ibirapuera e a cidade ao fundo.',
          itens: ['Janela de piso a teto', 'Vista para o lago do Ibirapuera', 'Banco em couro caramelo'],
          curiosidade: 'Foi a única suíte do prédio desenhada a partir da janela: a cama está alinhada ao centro do lago.',
          cam: { from: [.45, .55, 1], to: [.55, .5, 1] },
          hotspots: [
            { x: .15, y: .62, t: 'Cama em linho', d: 'Roupa de cama em linho lavado.' },
            { x: .56, y: .72, t: 'Banco de couro', d: 'Couro caramelo sobre base de aço preto.' },
            { x: .6, y: .42, t: 'Lago do Ibirapuera', d: 'O parque inteiro à vista do 31º andar.' },
            { x: .93, y: .45, t: 'Oliveira', d: 'Paisagismo interno com irrigação automática.' }
          ]
        }
      ]
    }
  ];

  window.ALTEZZA = {
    IMG,
    PROPERTIES,
    // Número de demonstração. Troque pelo WhatsApp da imobiliária (DDI + DDD + número, só dígitos).
    WHATSAPP_NUMBER: '5511000000000',
    find: id => PROPERTIES.find(p => p.id === id),
    featured: ['dossel', 'brise', 'horizonte', 'mare']
  };
})();
