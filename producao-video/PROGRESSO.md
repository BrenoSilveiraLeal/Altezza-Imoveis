# Vídeos da obra — progresso (atualizado 2026-11-10)

Cada imóvel tem uma seção "Do desenho à chave" (assets/js/obra.js). Hoje:

| Imóvel | Vídeo no site | Falta para o time-lapse real (com pedreiros) |
|---|---|---|
| Casa Maré | IA completa (Flow, 4 clipes) | nada |
| Cobertura Dossel | clipe 1 do Kling + fusão de imagens | 4 clipes no Flow/Veo (descartar o do Kling) |
| Aurora, Copa, Brise, Horizonte | só fusão entre imagens (sem pedreiros) | 4 clipes cada |

Imagens das etapas de cada imóvel: producao-video/<id>/etapas/1-desenho … 5-pronto (jpg).
Projetos no Flow: Maré 8ac77fab…, Brise 20a19049…, Horizonte 9ef4d400…, Copa 0ff43d8d…, Aurora bb1e9d9a…, Dossel 4452ba8c….

## Regra do Breno (2026-11-10)
Todos os vídeos têm que ser feitos no Google Flow com o Veo 3.1, IGUAIS ao da Casa Maré (4 clipes de 8 s, câmera fixa, time-lapse). Não usar Kling.
Cota: 50 créditos/dia = 5 clipes (10 cada). ~4 dias para os 5 imóveis; trocar o vídeo de fusão de cada um quando completar 4 clipes.

## Prompt dos clipes (obrigatório: pedreiros)
"Fixed camera. Time-lapse of the construction of this same building/house: dozens of construction workers in helmets and orange vests moving quickly across the scaffolding and site, cranes and concrete pump working, materials being carried, the structure rising stage by stage. Photorealistic, smooth, no text."

## Montagem
Juntar clipes -> Real-ESRGAN x2 (como na Maré) -> 1080p, libx264 crf 31, g 8 -> assets/video/obra-<id>.mp4 (+ poster) -> trocar `?v=` no data.js e em imovel.html.
Script de fusão usado hoje: build.sh (scratchpad); bloco `obra` em data.js é gerado por addobra.py.

## Estilo-alvo (referência "Prumo") — 2026-11-10
O vídeo de referência mostra PEDREIROS bem visíveis (capacete, colete) trabalhando na estrutura, câmera aérea próxima. O da Maré tem gente minúscula; não basta.
Método (grátis): no editor de imagem do Flow (Nano Banana 2.1), editar a imagem da etapa com o pedido:
"Change the framing to a much closer aerial drone view of the upper floors of this same <prédio/casa> under construction, at golden hour. Show about 12 to 15 clearly visible construction workers (masons) in white helmets and orange high-visibility vests on the slabs and scaffolding, laying bricks, tying rebar, pouring concrete, with the crane next to them. Photorealistic, same sky and light."
Feito: Dossel/estrutura -> producao-video/dossel/etapas/estrutura-pedreiros.jpg (ficou bom).
Falta: versões com pedreiros de fundação e acabamento do Dossel, e das etapas dos outros 5; depois usar esses quadros como início/fim dos clipes do Veo.

## Situação em 2026-11-11 (fim do dia)
- Planta 3D: FEITA nos 6 imóveis (assets/js/planta3d.js + planta3d-decor.js). Gira livre arrastando; decoração tirada das fotos.
- Vídeos de obra com pedreiros (estilo do 1º vídeo da Maré): NÃO feitos — sem crédito de vídeo.
  - Flow: "créditos acabaram" (11/11 13h). Muapi/Open-Higgsfield: saldo US$ 0; nenhum modelo de vídeo é grátis (mais barato US$ 0,016).
- Vídeo drone (entra na casa, passa pelos cômodos, sai): NÃO feito — mesmo motivo.

## Plano quando houver crédito (Flow/Veo, Frames-to-Video)
Obra (4 clipes/imóvel): usar etapas/1..5 como quadros; prompt:
"Fixed drone camera. Construction time-lapse of this same building: dozens of clearly visible masons in white helmets and orange vests laying bricks, tying rebar and pouring concrete, crane lifting loads, the structure rising until finished. Photorealistic, no text."
Drone (3–4 clipes/imóvel): quadro inicial = foto externa; finais = fotos dos ambientes na ordem da planta
(ex. Dossel: torre → lobby → living → suíte → terraço → piscina → torre). Prompt:
"Smooth cinematic drone flight, continuous single shot, flying from <A> into <B>, keep every object exactly as in the frames, photorealistic, no people, no text."
Ordem: Dossel, Aurora, Copa, Brise, Horizonte, Maré.
