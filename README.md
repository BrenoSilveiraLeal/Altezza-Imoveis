# Altezza Imóveis

Site demonstrativo de uma imobiliária fictícia de alto padrão, criado como projeto de portfólio. A experiência apresenta imóveis em páginas editoriais, catálogo com filtros e favoritos, tours interativos, plantas 3D e vídeos das etapas de construção.

## Tecnologias

- HTML semântico, CSS responsivo e JavaScript nativo.
- Three.js e GLTFLoader para as plantas 3D.
- Conteúdo e dados de demonstração, sem servidor de aplicação ou banco de dados.

## Executar localmente

Na raiz do projeto, inicie um servidor estático:

```powershell
python -m http.server 8000
```

Depois, abra `http://localhost:8000`. Também funciona com qualquer servidor estático. As imagens do Cloudinary e as bibliotecas Three.js carregadas por CDN precisam de conexão com a internet.

## Páginas

- `index.html`: apresentação da marca, imóveis em destaque, serviços, regiões, perguntas e contato.
- `imoveis.html`: catálogo com busca, filtros, ordenação e favoritos; os filtros podem ser compartilhados pela URL.
- `imovel.html?id=<id>`: tour imersivo. IDs disponíveis: `dossel`, `brise`, `horizonte`, `mare`, `copa` e `aurora`.

## Estrutura do projeto

```text
assets/
  3d/       modelos, texturas e iluminação das plantas
  css/      estilos globais e estilos por página
  fonts/    fontes locais
  img/      fotografias, croquis e imagens do site
  js/       dados, componentes e comportamento das páginas
  video/    vídeos e pôsteres das etapas de construção
producao-video/  materiais de referência e arquivos de produção
```

Os principais pontos de edição são `assets/js/data.js` (imóveis e conteúdo), `assets/js/home.js`, `catalog.js`, `tour.js`, `obra.js` e `imovel.js`, com os estilos correspondentes em `assets/css/`.

## Comportamentos

- Recarregar uma página começa novamente no topo.
- O catálogo mantém os filtros na URL e guarda favoritos apenas no navegador.
- Os formulários validam os campos e abrem uma conversa do WhatsApp preenchida; não há envio para um backend.
- A seção de construção avança pelas etapas em sincronia com o vídeo. Com movimento reduzido, apresenta uma sequência estática.
- O tour respeita a preferência de movimento reduzido do sistema.

## Conteúdo e configuração

O projeto é demonstrativo: imóveis, preços, pessoas, depoimentos e contatos são fictícios. `WHATSAPP_NUMBER` em `assets/js/data.js` está como placeholder (`5511000000000`); substitua pelo número público da empresa antes de usar os formulários em uma demonstração real.

Não há chaves de API necessárias para executar o site. Segredos e arquivos locais de QA são excluídos pelo `.gitignore`. Os quadros intermediários de produção em `producao-video/_giro/` permanecem no computador e não são publicados no repositório.

## Publicação

Como o site não tem etapa de build, publique os arquivos HTML e a pasta `assets/` em uma hospedagem estática, como GitHub Pages, Netlify ou Vercel. Confira o limite de tamanho de arquivos da plataforma antes de enviar os vídeos de construção.