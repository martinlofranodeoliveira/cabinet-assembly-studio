# Cabinet Assembly Studio

Versão de desenvolvimento **0.1.0**, da [Lofrano Tecnologia](https://lofranotecnologia.com.br). Aplicação original MIT em React + TypeScript para explorar um gabinete conceitual aberto na frente, com cinco painéis. Caixas reais do Three.js, via React Three Fiber, compartilham os mesmos parâmetros aceitos com componentes, projeções 2D precisas e exportações.

Não é ferramenta de corte, CNC, marcenaria, fabricação ou engenharia estrutural. Nenhuma aptidão física é inferida.

## Instalar e executar

Use Node 22 e npm. As versões de `package.json` são exatas. O `package-lock.json` incluído foi gerado pelo npm a partir do manifesto exato; conserve-o para instalações reproduzíveis com `npm ci`. Atualizações de dependências exigem regeneração deliberada do lockfile e revisão.

```sh
npm ci
npm run dev
npm test
npm run demo -- --assert
npm run demo -- --assert --json
npm run build
VITE_BASE_PATH=/cabinet-assembly-studio/ npm run build
```

Abra o endereço local informado pelo Vite. A saída estática fica em `dist/`. JS, CSS, fontes e geometria não dependem de CDN, conta, API ou modelo externo em execução. Após instalar e compilar, é possível servir os arquivos localmente sem Internet. Não há service worker nem promessa de recarga offline de página hospedada não armazenada em cache. Não há workflow de publicação.

Exemplo de saída humana definido pelo CLI:

```text
Cabinet Assembly Studio — development 0.1.0
5 panels · clear W/H/depth: 564 / 764 / 382 mm
Panel volume: 22226976 mm³
Explosion 1: gap 160 mm; bounds [-160,-160,0] → [760,960,548] mm
Concept only — not a fabrication plan.
Demo assertions completed.
```

`--json` produz um objeto JSON depois das mensagens do npm/compilador. Para consumir somente o objeto após compilar a demonstração, use `node build/tests/cli.mjs --assert --json`.

## Usar

A interface inicia em PT-BR. O seletor **Idioma** oferece inglês completo, incluindo erros e mensagens. A troca não altera geometria, histórico, conceitos salvos ou JSON.

1. Selecione **Fundo** na lista ou na malha. O inspetor inicial informa `564 × 764 × 6 mm`.
2. Edite o rascunho e pressione **Aplicar dimensões**. Com `W=720` e demais valores padrão, a largura livre passa a `684 mm`. Até uma aplicação válida, visualização e exportações mantêm o modelo anterior.
3. Experimente `W=36`, `t=18`: o erro entre campos aparece mesmo havendo erro de faixa. Desfazer/refazer conserva até 20 edições aceitas.
4. Explore a explosão: ela apenas desloca os painéis. Frente, Isométrica e Enquadrar atualizam a câmera real.
5. Navegação de câmera começa **desligada**. Ative **Navegar em 3D** para orbitar/aproximar; saia pelo botão ou Escape. Ao sair, controles e listeners são removidos e o canvas volta a `touchAction: pan-y`.
6. **Salvar cópia** cria um novo conceito com nome explícito. A contagem mostra o limite de 10. Selecione um salvo para carregar ou renomear; **Atualizar selecionado** substitui suas dimensões pelas dimensões aplicadas e mantém o nome salvo. **Remover salvo** pede confirmação e remove só a cópia salva, sem alterar o trabalho aberto; isso libera uma vaga. Rascunhos de dimensões não aplicados nunca são gravados. Falhas de armazenamento não bloqueiam edição ou exportação.
7. Importe JSON limitado do esquema 1 ou exporte JSON/SVG determinísticos. O SVG apresenta faces nominais rotuladas: **não é plano de corte ou aproveitamento**.

Sem WebGL2, após perda de contexto ou erro da cena, projeções e operações DOM continuam disponíveis. O botão Tentar 3D novamente solicita nova tentativa. No celular, Objeto, Propriedades e Plano 2D selecionam os controles abaixo do viewport, sem reduzir medidas a rótulos minúsculos.

## Exemplo do núcleo

```ts
import { concept, defaults, derive, exportJSON } from './src/core';
const c = concept('Sintético 720', { ...defaults, W: 720 });
console.log(derive(c.parameters).clearWidth); // 684
const json = exportJSON(c);
```

Use `concept`, `parameters` ou `importJSON` nas fronteiras de confiança. `derive` e `display` recebem parâmetros já aceitos. Dados derivados importados nunca autorizam geometria. Consulte o [contrato preciso](docs/contract.md), a [arquitetura](docs/design.md) e o [registro de revisão do código](DESIGN.md).

## Verificação e limites

`npm test` inclui TypeScript estrito; oráculos literais e ocupação exaustiva de células; entradas adversariais e transações; interações reais ReactDOM em VM JSDOM isolada; objetos reais de cena R3F; e compilação de produção com verificações de subcaminho, fontes e comentário HTML. Os testes compilam antes de executar e usam o runner do Node. A demonstração separada contém asserções dos resultados padrão.

Isso **não** comprova pixels WebGL, gestos em navegador, precisão de picking, aparência responsiva ou conformidade de acessibilidade. Não havia host de navegador disponível; revisão real visual, WebGL, responsiva, teclado/leitor de tela continua não verificada.

São cinco malhas, renderização sob demanda, DPR 1–1,5, sem downloads de texturas/ambientes/modelos, histórico/importação/armazenamento limitados. O limite de bytes precede a decodificação JSON, mas não é sandbox de RSS ou recursão pré-decoder. Persistência local é de uma aba, com última escrita prevalecendo, e não substitui backup. Sem importação de código/malha arbitrária, telemetria, ferragens, tolerâncias, densidade, custos ou cálculo estrutural.

## Projeto

- [Contribuir](CONTRIBUTING.md) · [Segurança](SECURITY.md) · [Avisos de dependências](DEPENDENCIES.md)
- [English](README.md)
- Repositório: https://github.com/martinlofranodeoliveira/cabinet-assembly-studio
- Contato geral: https://lofranotecnologia.com.br

Copyright 2026 Lofrano Tecnologia. Código original sob [MIT](LICENSE); dependências conservam suas licenças.
