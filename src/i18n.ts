import { Fault, limits, type Key, type PanelID } from './core';
export type Locale = 'pt-BR' | 'en';
const pt = {
  notices: 'Licenças das dependências', language: 'Idioma', title: 'Cabinet Assembly Studio', version: 'Desenvolvimento 0.1.0',
  objects: 'Objeto', properties: 'Propriedades', plan: 'Plano 2D', workspace: 'Área de montagem',
  parameters: 'Dimensões nominais', name: 'Nome do conceito', apply: 'Aplicar dimensões', undo: 'Desfazer', redo: 'Refazer',
  W: 'Largura W', H: 'Altura H', D: 'Profundidade D', t: 'Espessura t', backThickness: 'Fundo b', rearInset: 'Recuo traseiro r',
  parts: 'Painéis · 5', selected: 'Painel selecionado', dimensions: 'Dimensões X × Y × Z', position: 'Centro nominal X / Y / Z',
  bom: 'Componentes nominais', quantity: 'Qtd.', face: 'Face / espessura (mm)', side: 'Lateral', horizontal: 'Horizontal', backRole: 'Fundo',
  clear: 'Vãos livres W / H / profundidade útil', volume: 'Volume de painéis',
  front: 'Frente', iso: 'Isométrica', fit: 'Enquadrar', navigate: 'Navegar em 3D', exit: 'Sair da navegação', navHelp: 'Arraste para orbitar; roda para aproximar. Esc sai. Fora da navegação, a página pode rolar.',
  explode: 'Explosão da montagem', nominal: 'Medidas nominais em mm; a explosão só desloca a visualização.',
  checking: 'Verificando 3D…', unavailable: '3D indisponível. A projeção, edição e exportação continuam disponíveis.', lost: 'Contexto 3D perdido. Use a projeção ou tente novamente.', retry: 'Tentar 3D novamente',
  projection: 'Projeções precisas em mm', frontProjection: 'Frente · X/Y (mm)', sideProjection: 'Lateral · Z/Y (mm)',
  local: 'Conceitos neste navegador', saveName: 'Nome para salvar ou renomear', save: 'Salvar cópia', rename: 'Renomear salvo', load: 'Carregar salvo', savedChoice: 'Conceito salvo', empty: 'Nenhum conceito salvo', choose: 'Selecione um conceito', retryStorage: 'Reler armazenamento',
  import: 'Importar JSON', exportJSON: 'Exportar JSON', exportSVG: 'Exportar SVG', file: 'Arquivo JSON (até 64 KiB)',
  disclaimer: 'Conceito de cinco painéis. Não é plano de corte, CNC, fabricação ou validação estrutural.',
  ready: 'Conceito inicial aceito.', applied: 'Dimensões aplicadas em conjunto.', imported: 'Conceito importado.', saved: 'Cópia salva neste navegador.', renamed: 'Conceito salvo renomeado.', loaded: 'Conceito carregado.', exported: 'Exportação gerada.', history: 'Histórico atualizado.', storageRead: 'Armazenamento relido.',
  errorLead: 'Operação rejeitada; o último conceito válido foi mantido.',
  integer: 'informe um inteiro em mm, sem campo vazio.', range: 'use o intervalo inclusivo',
  clearWidth: 'W − 2t deve ser pelo menos 1 mm; aumente W ou reduza t.',
  clearHeight: 'H − 2t deve ser pelo menos 1 mm; aumente H ou reduza t.',
  usableDepth: 'D − r − b deve ser pelo menos 1 mm; aumente D ou reduza r/b.',
  schema: 'Use o esquema versão 1, unidades mm e apenas os campos documentados.',
  nameError: 'Use um nome de 1 a 64 caracteres, sem controles nem espaços nas pontas.',
  cache: 'Dados derivados não conferem com os parâmetros. Remova o cache ou corrija o documento.',
  importSize: 'Arquivo acima de 64 KiB. Escolha um conceito menor.', json: 'JSON inválido. Verifique a sintaxe do arquivo.',
  fileError: 'Não foi possível ler o arquivo. Selecione-o novamente.',
  storage: 'Armazenamento indisponível ou sem espaço. O trabalho e as exportações continuam disponíveis; verifique as permissões e tente novamente.',
  storageData: 'Biblioteca local inválida ou excessiva. O trabalho atual foi preservado. Verifique os dados locais antes de reler.',
  saveLimit: 'Limite de 10 conceitos locais atingido. Renomeie um existente ou exporte seu trabalho.',
  saveSize: 'Conceito acima de 8 KiB ou biblioteca acima de 256 KiB. Exporte o trabalho em JSON.',
  chooseSave: 'Selecione um conceito salvo para esta ação.', explosion: 'A explosão deve estar entre 0 e 1.',
  unexpected: 'Não foi possível concluir. Tente novamente; o conceito válido permanece disponível.',
  'side-left': 'Lateral esquerda', 'side-right': 'Lateral direita', bottom: 'Base', top: 'Topo', back: 'Fundo'
};
export type Text = typeof pt;
const en: Text = {
  notices: 'Dependency notices', language: 'Language', title: 'Cabinet Assembly Studio', version: 'Development 0.1.0',
  objects: 'Object', properties: 'Properties', plan: '2D plan', workspace: 'Assembly workspace',
  parameters: 'Nominal dimensions', name: 'Concept name', apply: 'Apply dimensions', undo: 'Undo', redo: 'Redo',
  W: 'Width W', H: 'Height H', D: 'Depth D', t: 'Thickness t', backThickness: 'Back b', rearInset: 'Rear inset r',
  parts: 'Panels · 5', selected: 'Selected panel', dimensions: 'Dimensions X × Y × Z', position: 'Nominal center X / Y / Z',
  bom: 'Nominal components', quantity: 'Qty.', face: 'Face / thickness (mm)', side: 'Side', horizontal: 'Horizontal', backRole: 'Back',
  clear: 'Clear W / H / usable depth', volume: 'Panel volume',
  front: 'Front', iso: 'Isometric', fit: 'Fit', navigate: 'Navigate in 3D', exit: 'Exit navigation', navHelp: 'Drag to orbit; wheel to zoom. Esc exits. Outside navigation the page can scroll.',
  explode: 'Assembly explosion', nominal: 'Nominal measurements in mm; explosion only translates the display.',
  checking: 'Checking 3D…', unavailable: '3D unavailable. Projection, editing and exports remain available.', lost: '3D context lost. Use the projection or retry.', retry: 'Retry 3D',
  projection: 'Precise projections in mm', frontProjection: 'Front · X/Y (mm)', sideProjection: 'Side · Z/Y (mm)',
  local: 'Concepts in this browser', saveName: 'Name for saving or renaming', save: 'Save copy', rename: 'Rename saved', load: 'Load saved', savedChoice: 'Saved concept', empty: 'No saved concepts', choose: 'Choose a concept', retryStorage: 'Read storage again',
  import: 'Import JSON', exportJSON: 'Export JSON', exportSVG: 'Export SVG', file: 'JSON file (up to 64 KiB)',
  disclaimer: 'Five-panel concept. Not a cutting, CNC, fabrication or structural validation plan.',
  ready: 'Initial concept accepted.', applied: 'Dimensions applied together.', imported: 'Concept imported.', saved: 'Copy saved in this browser.', renamed: 'Saved concept renamed.', loaded: 'Concept loaded.', exported: 'Export generated.', history: 'History updated.', storageRead: 'Storage read again.',
  errorLead: 'Operation rejected; the last valid concept was preserved.',
  integer: 'enter an integer in mm, not an empty field.', range: 'use the inclusive range',
  clearWidth: 'W − 2t must be at least 1 mm; increase W or reduce t.',
  clearHeight: 'H − 2t must be at least 1 mm; increase H or reduce t.',
  usableDepth: 'D − r − b must be at least 1 mm; increase D or reduce r/b.',
  schema: 'Use schema version 1, mm units and only documented fields.',
  nameError: 'Use a name of 1–64 characters without controls or leading/trailing spaces.',
  cache: 'Derived data disagrees with parameters. Remove the cache or correct the document.',
  importSize: 'File exceeds 64 KiB. Choose a smaller concept.', json: 'Invalid JSON. Check the file syntax.',
  fileError: 'The file could not be read. Select it again.',
  storage: 'Storage is unavailable or full. Work and exports remain available; check permissions and retry.',
  storageData: 'Local library is invalid or excessive. Current work was preserved. Check local data before reading again.',
  saveLimit: 'The 10-concept local limit was reached. Rename an existing concept or export your work.',
  saveSize: 'Concept exceeds 8 KiB or library exceeds 256 KiB. Export your work as JSON.',
  chooseSave: 'Choose a saved concept for this action.', explosion: 'Explosion must be between 0 and 1.',
  unexpected: 'Could not complete the operation. Retry; the valid concept remains available.',
  'side-left': 'Left side', 'side-right': 'Right side', bottom: 'Bottom', top: 'Top', back: 'Back'
};
export const text = (locale: Locale): Text => locale === 'pt-BR' ? pt : en;
export const panelLabel = (id: PanelID, locale: Locale): string => text(locale)[id];
export function errorText(error: unknown, locale: Locale): string[] {
  const t = text(locale);
  if (!(error instanceof Fault)) return [t.unexpected];
  return error.issues.map(issue => {
    const [field, kind] = issue.split('.');
    if (kind && field && Object.hasOwn(limits, field)) {
      const k = field as Key;
      return `${t[k]}: ${kind === 'integer' ? t.integer : `${t.range} ${limits[k][0]}–${limits[k][1]} mm.`}`;
    }
    const aliases: Record<string, keyof Text> = { name: 'nameError', file: 'fileError' };
    const key = aliases[issue] ?? issue;
    return Object.hasOwn(t, key) ? t[key as keyof Text] : t.unexpected;
  });
}
