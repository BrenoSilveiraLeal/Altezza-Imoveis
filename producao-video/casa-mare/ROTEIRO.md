# Casa Maré — roteiro de produção dos vídeos (grátis)

Dois vídeos, no estilo dos exemplos:

- **A. Construção**: drone parado sobre a casa; a obra cresce do desenho até a casa pronta (estilo Prumo).
- **B. Passeio**: câmera de estabilizador chegando de fora e andando pelos cômodos (estilo Clareira).

Ferramentas gratuitas:

| Para quê | Ferramenta | Cota grátis (aprox., confira na hora) |
|---|---|---|
| Imagens das etapas | **Gemini** (gemini.google.com), modelo de imagem | algumas imagens por dia |
| Vídeo, melhor qualidade | **Google Flow** (labs.google/flow), Veo 3.1 Fast/Lite | ~50 créditos/dia ≈ 2 a 5 clipes |
| Vídeo, reserva | **Kling** (klingai.com) | ~66 créditos/dia |

> ⚠️ Leia os termos de uso da ferramenta: vários planos grátis não permitem uso comercial.

As fotos para enviar estão em `referencias/`. Os vídeos prontos você salva em `recebidos/`, com o nome indicado em cada passo.

## Regras que fazem ficar profissional

1. **Mesma câmera em todas as imagens da obra.** Sempre envie a imagem anterior e peça "same exact camera angle". Se o ângulo mudar, descarte e gere de novo.
2. **Gere de trás para frente.** Comece pela casa pronta e vá "desconstruindo". Assim todas as etapas saem da mesma foto.
3. **Vídeo sempre com primeiro e último quadro.** No Flow use *Frames to Video*; no Kling use *Image to Video* com *start frame* e *end frame*.
4. **Proporção 16:9, sem áudio, sem texto na imagem.** Gere 2 versões de cada clipe e fique com a melhor.
5. Se a casa "derreter" ou mudar de forma no meio do clipe, gere de novo. Isso é normal.

---

## A. Vídeo da construção

### Passo A1 — imagens das etapas (Gemini)

Gere **na ordem abaixo**, sempre enviando a imagem do passo anterior junto com o prompt. Salve cada uma com o nome indicado.

**E4 · acabamento** → envie `referencias/00-aerea-casa-pronta.jpg` → salve como `obra-E4-acabamento.jpg`

```text
Edit this photo. Keep the same exact camera angle, framing, lens, lighting, forest, beach and ocean.
Show the same house a few weeks before completion: the light wood pergola is half built, with bare
wooden beams and construction workers in hard hats installing the slats. The white walls are finished
but unpainted grey plaster in some areas. The pool is an empty concrete basin with no water and no tiles.
The deck is bare plywood with stacked lumber and tools. The garden is not planted yet: bare brown soil,
wheelbarrows, a small scaffold on the left wall. Photorealistic aerial drone photo, golden hour, no text.
```

**E3 · estrutura de concreto** → envie `obra-E4-acabamento.jpg` → salve como `obra-E3-concreto.jpg`

```text
Edit this photo. Keep the same exact camera angle, framing, lens, lighting, forest, beach and ocean.
Go earlier in the construction: only the raw exposed concrete structure of the house exists — columns,
slabs and beams with wooden formwork and steel props, no walls, no windows, no pergola. The pool is an
excavated hole with rebar. A yellow concrete pump truck with its boom extended pours concrete onto the
roof slab, workers in orange vests and white hard hats, bare red earth all around the building site,
the surrounding Atlantic forest untouched. Photorealistic aerial drone photo, no text.
```

**E2 · fundação** → envie `obra-E3-concreto.jpg` → salve como `obra-E2-fundacao.jpg`

```text
Edit this photo. Keep the same exact camera angle, framing, lens, lighting, forest, beach and ocean.
Go earlier in the construction: the building does not exist yet. The site is a cleared patch of red
earth with the house footprint dug out: foundation trenches, square concrete footings with steel rebar
sticking up, wooden stakes and string lines marking the outline. A yellow excavator and a small dump
truck work on the site, a few workers. The forest around the cleared area stays exactly the same.
Photorealistic aerial drone photo, no text.
```

**E1 · o desenho** → envie `obra-E2-fundacao.jpg` → salve como `obra-E1-desenho.jpg`

```text
Edit this photo. Keep the same exact camera angle, framing, lens, lighting, forest, beach and ocean.
The site is untouched: no clearing, no machines, no people — the Atlantic forest and grass cover the whole
area. Floating exactly where the house will be, draw the house as a thin glowing white architectural
wireframe: transparent outline of the walls, the flat roof, the pergola beams and the pool, like a 3D
CAD line drawing hovering over the vegetation. Elegant, minimal, thin white lines only.
Photorealistic aerial drone photo, no text.
```

### Passo A2 — clipes de vídeo (Flow ou Kling)

Use **primeiro quadro** e **último quadro** como indicado. Duração: a máxima do plano grátis (5 a 8 s).

| Clipe | Primeiro quadro | Último quadro | Salvar como |
|---|---|---|---|
| A-1 | `obra-E1-desenho.jpg` | `obra-E2-fundacao.jpg` | `recebidos/obra-1.mp4` |
| A-2 | `obra-E2-fundacao.jpg` | `obra-E3-concreto.jpg` | `recebidos/obra-2.mp4` |
| A-3 | `obra-E3-concreto.jpg` | `obra-E4-acabamento.jpg` | `recebidos/obra-3.mp4` |
| A-4 | `obra-E4-acabamento.jpg` | `referencias/00-aerea-casa-pronta.jpg` | `recebidos/obra-4.mp4` |

Prompt para **todos** os clipes A (troque só a linha do meio):

```text
Locked-off aerial drone shot, the camera does not move. Construction time-lapse:
[LINHA DO MEIO]
Fast, smooth time-lapse motion of workers and machines, clouds and shadows moving quickly,
the forest, beach and ocean stay identical. Photorealistic, cinematic, no text, no camera shake.
```

Linha do meio de cada clipe:

- **A-1:** `the glowing wireframe dissolves as the forest is cleared and excavators dig the foundation, rebar and footings appear.`
- **A-2:** `the concrete columns and slabs rise floor by floor from the foundation, formwork goes up and comes down, a concrete pump truck pours the roof.`
- **A-3:** `walls are closed and plastered, the pool basin is cast, the wooden pergola beams are installed, scaffolding appears and is removed.`
- **A-4:** `the pergola is finished, the pool fills with turquoise water, the deck is laid, the garden grows and lush plants fill the soil, the house is completed at golden hour.`

---

## B. Vídeo do passeio

Aqui não precisa gerar imagens: as fotos já existem em `referencias/`. Cada clipe começa onde o anterior termina.

| Clipe | Primeiro quadro | Último quadro | Salvar como |
|---|---|---|---|
| B-1 | `00-aerea-casa-pronta.jpg` | `01-varanda.jpg` | `recebidos/passeio-1.mp4` |
| B-2 | `01-varanda.jpg` | `02-sala.jpg` | `recebidos/passeio-2.mp4` |
| B-3 | `02-sala.jpg` | `03-cozinha.jpg` | `recebidos/passeio-3.mp4` |
| B-4 | `03-cozinha.jpg` | `04-suite.jpg` | `recebidos/passeio-4.mp4` |

**B-1 · chegada de drone**

```text
Cinematic drone shot slowly descending from the sky toward the house, gliding over the pool and under
the wooden pergola, arriving at the shaded veranda at eye level. One continuous smooth movement,
golden hour light, no people, photorealistic architectural film, no text.
```

**B-2 · varanda para a sala**

```text
Smooth steadicam walk at eye height, the camera glides slowly forward across the veranda, turns gently
and passes through the open sliding glass doors into the living room with the linen sofa and the ocean
view. One continuous shot, no cuts, no people, warm natural light, photorealistic architectural film.
```

**B-3 · sala para a cozinha**

```text
Smooth steadicam walk at eye height, the camera moves slowly past the living room sofa and continues
into the open kitchen with the travertine island, wicker pendant lamps and the long wooden dining table
facing the ocean. One continuous shot, no cuts, no people, photorealistic architectural film.
```

**B-4 · cozinha para a suíte**

```text
Smooth steadicam walk at eye height, the camera leaves the kitchen along a corridor with rammed-earth
walls and enters the master bedroom: linen bed, wooden bench, sheer curtains moving in the sea breeze,
the private deck and the ocean behind. One continuous shot, no cuts, no people, photorealistic film.
```

---

## Depois que terminar

Coloque todos os `.mp4` em `recebidos/` e me avise. Eu:

1. confiro cada clipe e aponto o que vale refazer;
2. junto os clipes em um vídeo único, otimizado para a web;
3. monto a página com a rolagem controlando o vídeo, igual aos exemplos, numa branch separada para você aprovar.

Dica de ordem, por causa da cota diária: **dia 1** gere as 4 imagens (A1) e os clipes A-1 e A-2; **dia 2** A-3 e A-4; **dias 3 e 4** o passeio (B).
