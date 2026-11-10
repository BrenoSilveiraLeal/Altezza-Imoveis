# Altezza Imóveis

Site de demonstração de uma imobiliária fictícia, feito com HTML, CSS e JavaScript, sem etapa de compilação ou banco de dados.

## Abrir localmente

Abra `index.html` no navegador ou sirva esta pasta em um servidor estático. As fotos hospedadas no Cloudinary exigem conexão com a internet.

## Páginas

- `index.html`: apresentação, coleção, experiência, depoimentos, perguntas e contato.
- `imoveis.html`: catálogo com busca, filtros e favoritos.
- `imovel.html?id=<id>`: tour de cada imóvel. IDs: `dossel`, `brise`, `horizonte`, `mare`, `copa` e `aurora`.

Os links do menu rolam suavemente para seções da página inicial. Clicar novamente no destino atual não recarrega a página. A logo leva ao início da página inicial com a transição visual do site. Ao recarregar qualquer página (por exemplo, com F5 ou Ctrl+R), a visualização começa no topo.

## Tour dos imóveis

Cada imóvel tem um ambiente interno com croqui que dá lugar à foto durante a rolagem e um comparador de croqui e foto na seção de arquitetura. Os pontos de interesse abrem um cartão com imagem e descrição; os botões do cartão mudam o ponto e movem a câmera. A seção de localização exibe uma foto aérea do imóvel sob o gráfico de proximidade.

## Onde editar

- Imóveis, ambientes, imagens, pontos e plantas: `assets/js/data.js`.
- Navegação e componentes compartilhados: `assets/js/common.js` e `assets/css/base.css`.
- Página inicial: `assets/js/home.js` e `assets/css/home.css`.
- Catálogo: `assets/js/catalog.js` e `assets/css/catalog.css`.
- Tour: `assets/js/tour.js` e `assets/css/tour.css`.
- Outras seções do imóvel: `assets/js/imovel.js` e `assets/css/imovel.css`.

Os formulários não usam backend nem armazenam dados: após a validação no navegador, abrem o WhatsApp com uma mensagem preenchida com os dados do contato e o imóvel/visita escolhido. Configure `WHATSAPP_NUMBER` em `assets/js/data.js` com o número da imobiliária em formato internacional, apenas dígitos (DDI + DDD + número). O valor atual é um placeholder de demonstração. Os favoritos são salvos apenas no navegador. Imóveis, valores, pessoas e depoimentos são fictícios; as imagens são ilustrativas. Com a preferência de reduzir movimento ativada, o tour mostra uma apresentação estática.
