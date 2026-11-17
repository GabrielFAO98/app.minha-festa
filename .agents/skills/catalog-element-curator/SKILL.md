---
name: catalog-element-curator
description: >-
  Use this skill whenever the user asks to research, propose, curate, generate,
  or add new decorative catalog elements, displays, furniture, rugs, or party
  accessories (by theme or category) to app.minha-festa. Enforces front-facing
  single-item isolation, transparent-first PNG preference, trend alignment,
  composite/kit rejection, and mandatory visual review before catalog addition.
---

# Curadoria Inteligente de Elementos de Decoração

Este runbook define o fluxo obrigatório ao pesquisar e adicionar novos elementos no catálogo (`public/items/` e `src/core/presets-data.ts`).

## Padrão Obrigatório dos Elementos

Todo item aprovado para o palco do `app.minha-festa` precisa cumprir:
1. **Peça Única Isolada:** Apenas 1 elemento por imagem. Nunca aceitar kits, combos, colagens com vários itens, fotos de mesa montada completa, painéis de fundo ou banners promocionais.
2. **Enquadramento Realista de Decoração:** Vista frontal reta (ou leve ângulo natural de ~10–15° apenas para boleiras/bandejas). Evitar perspectivas extremas de topo ou laterais deformadas.
3. **Preferência Máxima por Fundo Transparente Nativo:** Priorizar imagens já transparentes (`alpha-nativo`) com recorte limpo e zero bordas serrilhadas. Caso venha com fundo opaco, preferir fotos de estúdio em fundo branco limpo recortadas via `@imgly/background-removal-node` + `fillAlphaHoles`.
4. **Integridade e Nitidez:** Zero cortes nas extremidades, zero marcas d'água de bancos pagos, zero réguas/medidas ou textos sobre a peça, boa resolução (`>= 400px`) e alta nitidez.
5. **Coerência com Tendências Brasileiras:** Priorizar estética atual de locação e Pegue e Monte (cores harmônicas, boho/orgânico, coquette, luminosos LED limpos, peças reais de MDF/acrílico/cerâmica/pelúcia).

## Fluxo Obrigatório em 4 Etapas

### 1. Planejamento por Tema e Tendência
- Consultar planos pré-curados e medidas reais em cm:
  ```bash
  node scripts/fetch-theme-items.mjs --list-themes
  node scripts/fetch-theme-items.mjs --plan "<tema>"
  ```
- Para temas novos ou listas personalizadas, definir primeiro uma lista enxuta com nome, aplicação (`Chão` ou `Mesa`) e proporção real (`L × A` em cm) antes de buscar imagens.

### 2. Pesquisa e Ranqueamento Curatorial (Top-3)
- Executar o motor inteligente em modo curadoria (sem gravar em `public/items/` ainda):
  ```bash
  node scripts/fetch-theme-items.mjs --theme="<tema>"
  # ou especificando itens:
  node scripts/fetch-theme-items.mjs --theme="<tema>" --items="item 1,item 2" --top=3
  ```
- O motor em [element-curation-engine.mjs](../../../scripts/element-curation-engine.mjs):
  - Faz busca multi-tier (`PNG transparente` prioritário + `estúdio fundo branco` + `peça avulsa`);
  - Bloqueia resultados fora de contexto (exige palavras-chave obrigatórias no título/URL), kits, montagens e bancos com marca d'água;
  - Detecta múltiplos itens/compostos por componentes conexos da máscara alfa;
  - Mede nitidez, preenchimento, cortes nas bordas e salva os 3 melhores em `.tmp_curated/<tema>/`.

### 3. Inspeção Visual Obrigatória Antes de Implementar
- **Nunca** inserir cegamente em `public/items/` sem olhar os arquivos gerados.
- Abrir os candidatos `cand_1.webp`..`cand_3.webp` (via `read_file`) ou `.tmp_curated/<tema>/preview.html`.
- Se nenhum candidato ficar bom para uma peça específica:
  - Refinar os termos de busca ou gerar uma imagem realista isolada em fundo limpo (sem bordas nem cenário) apenas quando a peça comportar;
  - Ou descartar a peça / solicitar foto ao Gabriel em vez de entregar peça estranha ou composta.
- Apresentar os candidatos escolhidos ao Gabriel antes de consolidar o lote quando solicitado.

### 4. Promoção para o Catálogo & Build
- Promover apenas os candidatos aprovados (`--pick=slug:rank`):
  ```bash
  node scripts/fetch-theme-items.mjs --promote="<tema>" --pick="slug-1:1,slug-2:2"
  ```
- Registrar em `src/core/presets-data.ts` com `svgRole: 'photo'` e proporções coerentes, e rodar `npm run build` para validar antes de enviar.
