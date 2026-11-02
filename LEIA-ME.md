# Altezza — site de demonstração

Imobiliária de alto padrão fictícia. HTML, CSS e JavaScript puros, sem build e sem banco de dados.

## Como abrir

Abra `index.html` direto no navegador ou hospede a pasta inteira em qualquer serviço estático
(Netlify, Vercel, GitHub Pages). As fotos de Casa Horizonte e Residência Aurora vêm do Cloudinary,
então elas precisam de internet.

## Páginas

- `index.html`: topo com vídeo e busca, manifesto, destaques com cards inclinados em 3D, experiência imersiva,
  coleção, serviços, regiões, sobre, depoimentos, perguntas e contato.
- `imoveis.html`: catálogo com busca, filtros (tipo, região, valor, suítes, favoritos) e ordenação. Os filtros ficam na URL.
- `imovel.html?id=<id>`: apresentação imersiva de cada imóvel. Ids disponíveis: `dossel`, `brise`, `horizonte`, `mare`, `copa`, `aurora`.

## Onde editar

- **Imóveis, textos, ambientes do tour, pontos de interesse e plantas:** `assets/js/data.js`.
  Cada ambiente tem `cam.from` e `cam.to` (`[x, y, zoom]`, com x/y de 0 a 1 sobre a foto), que definem o
  movimento da câmera durante a rolagem. Os `hotspots` usam a mesma escala.
- **Cores, fontes e componentes:** `assets/css/base.css` (tokens em `:root`).
- **Tour no estilo galeria** (rolar caminha, arrastar olha em volta, pontos de olho abrem o detalhe):
  `assets/js/tour.js` e `assets/css/tour.css`. As demais seções do imóvel ficam em `assets/js/imovel.js`.
- **Vitrine e explorador da página inicial:** `assets/js/home.js` e `assets/css/home.css`.

## Observações

- Formulários são só demonstração: nada é enviado ou armazenado.
- Favoritos ficam salvos apenas no navegador de quem visita (localStorage).
- Com "reduzir movimento" ativado no sistema, o tour vira uma sequência estática de fotos e textos.
- Imóveis, valores, pessoas e depoimentos são fictícios; as imagens são as das referências fornecidas.
