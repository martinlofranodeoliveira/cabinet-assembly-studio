---
name: Cabinet Assembly Studio
description: "Maquete técnica para montagem conceitual / A technical maquette for conceptual assembly"
colors:
  active: "#235bd4"
  ground: "#f3f6f7"
  surface: "#fff"
  ink: "#202b36"
  subtle: "#4e606e"
  line: "#c9d2d8"
  control-border: "#728798"
  pressed-ink: "#1649b7"
  pressed-surface: "#e6edfc"
  stage: "#eaf0f2"
  projection-ground: "#f8fafb"
  panel: "#e1e8e9"
  panel-selected: "#b9cdf3"
  panel-edge: "#586775"
  projection-panel: "#dbe4e8"
typography:
  title:
    fontFamily: "'Public Sans Variable', 'Public Sans', sans-serif"
    fontSize: "18px"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.4px"
  section:
    fontFamily: "'Public Sans Variable', 'Public Sans', sans-serif"
    fontSize: "14px"
    fontWeight: 650
  body:
    fontFamily: "'Public Sans Variable', 'Public Sans', sans-serif"
    fontSize: "14px"
  label:
    fontFamily: "'Public Sans Variable', 'Public Sans', sans-serif"
    fontSize: "12px"
    fontWeight: 550
  support:
    fontFamily: "'Public Sans Variable', 'Public Sans', sans-serif"
    fontSize: "12px"
    fontWeight: 400
  context:
    fontFamily: "'Public Sans Variable', 'Public Sans', sans-serif"
    fontSize: "13px"
rounded:
  button: "4px"
  field: "3px"
spacing:
  compact: "6px"
  related: "8px"
  control: "12px"
  label: "14px"
  narrow-inset: "16px"
  group: "18px"
  panel: "22px"
  separated: "24px"
components:
  button-neutral:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "8px 11px"
  button-primary:
    backgroundColor: "{colors.active}"
    textColor: "{colors.surface}"
    rounded: "{rounded.button}"
    padding: "8px 11px"
  button-pressed:
    backgroundColor: "{colors.pressed-surface}"
    textColor: "{colors.pressed-ink}"
    rounded: "{rounded.button}"
    padding: "8px 11px"
  part-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "8px 11px"
  part-row-selected:
    backgroundColor: "{colors.pressed-surface}"
    textColor: "{colors.pressed-ink}"
    rounded: "{rounded.button}"
    padding: "8px 11px"
  text-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "8px"
---

# Design System: Cabinet Assembly Studio

## Overview

**Creative North Star: "Maquete técnica / Technical maquette"**

**PT-BR.** Uma bancada clara para examinar um gabinete de cinco painéis: geometria contínua, grupos delimitados, medidas e ações locais. “Maquete técnica” é a direção provisória adotada pelo responsável pela implementação sob delegação. React, trabalho por código e aplicações 3D profissionais foram confirmados; essa escolha estética não foi aprovada pelo usuário.

**EN.** A daylight desk for examining a five-panel cabinet: continuous geometry, bounded groups, measurements and local actions. “Technical maquette” is the provisional direction adopted by the implementation owner under delegated authority. React, a code-first workflow and professional 3D applications were confirmed; this visual choice was not approved by the user.

**Evidence / Evidência.** This authorized refresh records actual CSS, React components and scene source. It preserves the earlier finish record's limits: no real desktop/mobile captures, WebGL pixels, gestures, picking, rendered responsiveness, focus traversal, screen-reader output or rendered contrast were observed. Visual review remains pending with `recapture`; this document does not close it. DOM, scene-object, camera-projection and production-output tests do not constitute visual or accessibility approval. / Este registro deriva da fonte e mantém a revisão visual pendente.

**Key Characteristics:**

- Modelo entre hierarquia e inspetor / Model between hierarchy and inspector.
- Superfícies claras e um acento azul / Light surfaces and one blue accent.
- Seleção vinculada e medidas nominais / Linked selection and nominal measurements.
- Explosão manual e operações sem GPU / Manual explosion and operations without a GPU.

## Colors

Neutros frios separam bancada, palco, projeções e controles; azul acompanha ações, foco e seleção. O frontmatter contém os valores normativos. / Cool neutrals separate desk, stage, projections and controls; blue accompanies actions, focus and selection. The frontmatter owns normative values.

### Primary

- **Azul ativo / Active blue — `active`:** ação primária, foco, caret, seleção de texto, acento nativo e arestas selecionadas / Primary action, focus, caret, text selection, native accent and selected edges.
- **Estado pressionado / Pressed state — `pressed-ink`, `pressed-surface`:** modos, seções móveis e linha selecionada; a tinta também aparece nos links / Modes, mobile sections and selected row; the ink also appears on links.
- **Painel selecionado / Selected panel — `panel-selected`:** preenchimento compartilhado entre malha e projeções / Fill shared by mesh and projections.

### Neutral

- **Bancada / Desk — `ground`, `surface`:** página; topo, rodapé, campos e botões / Page; top, footer, fields and buttons.
- **Tintas / Inks — `ink`, `subtle`:** texto principal e contexto / Main text and context.
- **Limites / Boundaries — `line`, `control-border`:** divisórias e bordas de controles / Dividers and control borders.
- **Planos / Planes — `stage`, `projection-ground`:** palco e fundo das projeções / Stage and projection ground.
- **Geometria / Geometry — `panel`, `panel-edge`, `projection-panel`:** materiais, arestas e projeções não selecionadas / Materials, edges and unselected projections.

**The Linked Panel Rule.** O mesmo painel selecionado identifica linha, contexto, leituras, material, arestas e projeções. / The same selected panel identifies row, context, readouts, material, edges and projections.

As rampas do sidecar são prévias de oito tons OKLCH sintetizados, não novas cores adotadas na aplicação. Cálculos de cores declaradas não comprovam contraste renderizado. / Sidecar ramps are synthesized eight-step OKLCH previews, not additional adopted application colours. Declared-colour calculations do not prove rendered contrast.

## Typography

Public Sans Variable vem do pacote local importado em `src/main.tsx`; o stack inclui Public Sans e sans-serif. Não há voz display ou monospace separada. A raiz não declara entrelinha global. / Public Sans Variable comes from the local package imported in `src/main.tsx`; the stack includes Public Sans and sans-serif. There is no separate display or monospace voice. The root declares no global line height.

### Hierarchy

- **Title:** título do produto; tamanho e tracking constantes nos breakpoints / Product title; size and tracking unchanged at breakpoints.
- **Section:** cabeçalhos de grupos, com margem inferior de (14px) / Group headings, with (14px) bottom margin.
- **Body:** texto-base e campos; o título do painel selecionado usa (16px) / Base text and fields; selected-panel heading uses (16px).
- **Label:** rótulos de formulário, biblioteca, idioma e explosão; explosão passa a (13px) no móvel / Form, library, locale and explosion labels; explosion becomes (13px) on mobile.
- **Support:** limites, ajuda e rodapé; ajuda e rodapé declaram entrelinha (1.5) / Limits, help and footer; help and footer declare line height (1.5).
- **Context:** contexto do palco e legenda; texto interno das projeções declara (16px) / Stage context and caption; internal projection text declares (16px).

**The Nominal Readout Rule.** Medidas, componentes e leituras usam algarismos tabulares, acompanhados de unidades e nomes. / Measurements, components and readouts use tabular numerals, accompanied by units and names.

O sufixo de unidade usa (11px); esse detalhe não estabelece escala para mensagens novas. / The unit suffix uses (11px); this detail does not establish a scale for new messages.

## Layout

**PT-BR.** A grade desktop usa (220px), `minmax(280px, 1fr)` e (292px) para Objetos, área de trabalho e Propriedades. Laterais atravessam duas linhas; projeções ficam abaixo da cena no centro. Painéis usam padding (22px 18px). A largura da cena é residual, sem fração fixa de dois terços.

**EN.** The desktop grid uses (220px), `minmax(280px, 1fr)` and (292px) for Objects, workspace and Properties. Side panels span two rows; projections sit below the scene in the centre. Panels use (22px 18px) padding. Scene width is residual, without a fixed two-thirds fraction.

**PT-BR.** A partir de (1500px), colunas usam (240px), `minmax(280px, 1fr)` e (312px). Até (1050px), usam (190px), `minmax(250px, 1fr)` e (255px); identidade e ações empilham. A viewport padrão usa `max(440px, calc(100svh - 330px))`; a regra ampla usa `calc(100svh - 300px)`, e a intermediária usa (440px).

**EN.** At (1500px) and above, columns use (240px), `minmax(280px, 1fr)` and (312px). Up to (1050px), they use (190px), `minmax(250px, 1fr)` and (255px); identity and actions stack. Default viewport uses `max(440px, calc(100svh - 330px))`; the wide rule uses `calc(100svh - 300px)`, and the intermediate rule uses (440px).

**PT-BR.** Até (760px), o modelo permanece acima dos botões de seção, com viewport de (360px). Objeto, Propriedades e Plano 2D alternam o painel visível usando `aria-pressed` e `aria-controls`. Peças passam a duas colunas, formulário limita largura a (560px) e explosão ocupa linha inteira. São regras da fonte, sem confirmação visual ou de gesto.

**EN.** Up to (760px), the model stays above section buttons, with a (360px) viewport. Object, Properties and 2D plan switch the visible panel using `aria-pressed` and `aria-controls`. Parts become two columns, the form limits width to (560px) and explosion takes a full row. These are source rules, without visual or gesture confirmation.

Grupos usam a escala do frontmatter, alinhamento por padding e divisórias compartilhadas. Barras quebram linhas e as duas projeções compartilham um contêiner flexível. / Groups use the frontmatter scale, padding alignment and shared dividers. Bars wrap and both projections share a flexible container.

## Elevation & Depth

O CSS não declara sombras. Fundos e bordas separam controles. A cena contém painéis volumétricos claros, arestas e luz ambiente/direcional; material declara rugosidade (.85). Canvas transparente deixa aparecer o palco. A aparência real não foi observada em WebGL. / CSS declares no shadows. Backgrounds and borders separate controls. The scene contains pale volumetric panels, edges and ambient/directional light; material declares roughness (.85). Transparent Canvas exposes the stage. Actual appearance has not been observed in WebGL.

**The Assembly Depth Rule.** A profundidade vem da geometria e da separação manual dos mesmos painéis; controles permanecem planos. / Depth comes from geometry and manual separation of the same panels; controls remain flat.

## Shapes

Botões e linhas usam cantos do token `button`; campos usam `field`. Bordas de controle são de um pixel. Componentes conceituais e projeções mantêm retângulos exatos. Ações com ícones usam Lucide; o CSS declara ícones de botão de (17px), mantendo rótulos. / Buttons and rows use `button` corners; fields use `field`. Control borders are one pixel. Conceptual components and projections retain exact rectangles. Icon actions use Lucide; CSS declares (17px) button icons, retaining labels.

## Components

### Buttons and focus

Botões neutros têm fundo branco e borda definida; hover clareia o fundo. Primário usa azul, texto branco e largura total. Pressionado usa azul suave. Não há transição animada. Desabilitado declara opacidade (.55) e cursor padrão; sua legibilidade renderizada não foi verificada. / Neutral buttons have white fill and a defined border; hover lightens fill. Primary uses blue, white text and full width. Pressed uses soft blue. There is no animated transition. Disabled declares opacity (.55) and a default cursor; its rendered legibility has not been verified.

Controles declaram altura mínima de (44px). Foco usa contorno azul de (3px), afastado em (3px); campos e selects reduzem o afastamento para (1px). / Controls declare a minimum height of (44px). Focus uses a (3px) blue outline with (3px) offset; fields and selects reduce offset to (1px).

### Parts and readouts

Linhas mostram nome e dimensões à esquerda, com estado pressionado e altura mínima móvel de (66px). A tabela de componentes usa divisórias horizontais e quantidades à direita. Dimensões, posição, vãos e volume permanecem texto DOM. / Rows show name and dimensions on the left, with pressed state and mobile minimum height of (66px). The component table uses horizontal dividers and right-aligned quantities. Dimensions, position, clearances and volume remain DOM text.

### Fields and recovery

Campos dimensionais ficam em duas colunas com rótulo, sufixo mm e intervalo. Rascunhos são strings separadas do conceito aceito; aplicar valida o conjunto. Um alerta lista falhas e informa a preservação do último conceito válido. Não há estilo individual de campo inválido. / Dimension fields sit in two columns with label, mm suffix and range. Draft strings are separate from the accepted concept; apply validates the set. An alert lists failures and states that the last valid concept was preserved. There is no individual invalid-field style.

### Local library and file actions

A biblioteca agrupa nome, salvar cópia, escolher, carregar, renomear e reler armazenamento. O topo agrupa importação e exportações JSON/SVG. Ações têm estado/erro em PT-BR e EN. Idioma altera a interface, não parâmetros ou histórico. Falha de armazenamento preserva trabalho e exportações. / The library groups name, save copy, choose, load, rename and storage reread. The top groups import and JSON/SVG exports. Actions have PT-BR and EN status/error text. Locale changes the interface, not parameters or history. Storage failure preserves work and exports.

### Linked assembly and projections

Explosão vai de (0) a (1), passo (.05), com saída percentual. Só desloca apresentação; medidas e componentes mantêm parâmetros aceitos. Não há interpolação temporal ou giro automático. Cena usa renderização sob demanda, DPR (1–1.5) e navegação sem amortecimento. / Explosion runs from (0) to (1), step (.05), with percentage output. It only translates presentation; measurements and components retain accepted parameters. There is no timed interpolation or automatic spin. Scene uses demand rendering, DPR (1–1.5) and navigation without damping.

Navegação explícita sai pelo mesmo botão ou Escape; controles existem somente nesse modo e cleanup restaura `pan-y`. Câmera/navegação ficam desabilitadas sem cena pronta. Verificação, indisponibilidade e perda de contexto mostram projeções; há nova tentativa de 3D. Essas regras não comprovam gestos reais. / Explicit navigation exits through the same button or Escape; controls exist only in that mode and cleanup restores `pan-y`. Camera/navigation are disabled without a ready scene. Checking, unavailability and context loss show projections; 3D can be retried. These rules do not prove real gestures.

Projeções desenham a seleção por último. Retângulos têm clique, sem handlers de teclado; botões da hierarquia oferecem seleção por teclado. Esse limite não deve virar padrão de acessibilidade. CSS de movimento reduzido desliga animações e transições. / Projections draw selection last. Rectangles have click selection without keyboard handlers; hierarchy buttons offer keyboard selection. This limit must not become an accessibility pattern. Reduced-motion CSS disables animations and transitions.

## Do's and Don'ts

### Do:

- **Do** manter seleção vinculada e contexto nominal / keep linked selection and nominal context.
- **Do** aplicar rascunhos completos e preservar o último conceito válido / apply complete drafts and preserve the last valid concept.
- **Do** manter biblioteca, medidas e exportações sem GPU / keep library, measurements and exports available without a GPU.
- **Do** conferir PT-BR/EN, foco, zoom, cores forçadas, touch, picking e perda de contexto no browser real / check PT-BR/EN, focus, zoom, forced colours, touch, picking and context loss in a real browser.

### Don't:

- **Don't** apresentar explosão como alteração nominal ou validação de fabricação / present explosion as nominal change or fabrication validation.
- **Don't** tratar clique nas projeções como padrão completo de teclado / treat projection clicks as a complete keyboard pattern.
- **Don't** usar cálculos de cores, testes DOM, objetos de cena ou este documento como aprovação visual ou de acessibilidade / use colour calculations, DOM tests, scene objects or this document as visual or accessibility approval.
