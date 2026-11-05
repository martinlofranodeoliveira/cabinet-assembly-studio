export const VERSION = '0.1.0';
export const MAX_IMPORT = 64 * 1024;
export const keys = ['W', 'H', 'D', 't', 'backThickness', 'rearInset'] as const;
export type Key = typeof keys[number];
export type Parameters = Record<Key, number>;
export type Vec = [number, number, number];
export type Bounds = { min: Vec; max: Vec };
export const ids = ['side-left', 'side-right', 'bottom', 'top', 'back'] as const;
export type PanelID = typeof ids[number];
export type Role = 'side' | 'horizontal' | 'back';
export type Panel = { id: PanelID; role: Role; dimensions: Vec; min: Vec; max: Vec; center: Vec; face: [number, number]; thickness: number };
export type Concept = { name: string; parameters: Parameters };
export type Draft = Record<Key, string>;
export const defaults: Parameters = { W: 600, H: 800, D: 400, t: 18, backThickness: 6, rearInset: 12 };
export const limits: Record<Key, readonly [number, number]> = { W: [50, 3000], H: [50, 3000], D: [50, 2000], t: [3, 60], backThickness: [3, 30], rearInset: [0, 500] };
export class Fault extends Error {
  constructor(public readonly issues: readonly string[]) { super(issues.join('; ')); this.name = 'Fault'; }
}
export const bytes = (text: string): number => new TextEncoder().encode(text).byteLength;
export function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
export function exactKeys(value: Record<string, unknown>, required: readonly string[], optional: readonly string[] = []): void {
  if (Object.keys(value).some(k => !required.includes(k) && !optional.includes(k)) || required.some(k => !Object.hasOwn(value, k))) throw new Fault(['schema']);
}
export function nameOf(value: unknown): string {
  if (typeof value !== 'string' || value.length < 1 || value.length > 64 || value.trim() !== value || /[\u0000-\u001f\u007f]/u.test(value)) throw new Fault(['name']);
  for (let i = 0; i < value.length; i++) {
    const unit = value.charCodeAt(i);
    if (unit === 0xfffe || unit === 0xffff) throw new Fault(['name']);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const low = value.charCodeAt(++i);
      if (!(low >= 0xdc00 && low <= 0xdfff)) throw new Fault(['name']);
    } else if (unit >= 0xdc00 && unit <= 0xdfff) throw new Fault(['name']);
  }
  return value;
}
export function parameters(value: unknown): Parameters {
  if (!object(value)) throw new Fault(['schema']);
  exactKeys(value, keys);
  const issues: string[] = [];
  for (const key of keys) {
    const n = value[key];
    if (typeof n !== 'number' || !Number.isFinite(n) || !Number.isInteger(n)) issues.push(`${key}.integer`);
    else if (n < limits[key][0] || n > limits[key][1]) issues.push(`${key}.range`);
  }
  // Cross-field diagnostics intentionally run even when individual ranges fail.
  const finite = (k: Key): boolean => typeof value[k] === 'number' && Number.isFinite(value[k]);
  if (finite('W') && finite('t') && (value.W as number) - 2 * (value.t as number) < 1) issues.push('clearWidth');
  if (finite('H') && finite('t') && (value.H as number) - 2 * (value.t as number) < 1) issues.push('clearHeight');
  if (finite('D') && finite('rearInset') && finite('backThickness') && (value.D as number) - (value.rearInset as number) - (value.backThickness as number) < 1) issues.push('usableDepth');
  if (issues.length) throw new Fault(issues);
  return Object.fromEntries(keys.map(k => [k, (value[k] as number) + 0])) as Parameters;
}
export function concept(name: unknown, p: unknown): Concept { return { name: nameOf(name), parameters: parameters(p) }; }
export function draftOf(p: Parameters): Draft { return Object.fromEntries(keys.map(k => [k, String(p[k])])) as Draft; }
export function parseDraft(d: Draft): Parameters {
  if (!object(d)) throw new Fault(['schema']);
  const raw = Object.fromEntries(keys.map(k => [k, typeof d[k] === 'string' && /^-?\d+$/.test(d[k]) ? Number(d[k]) : undefined]));
  return parameters(raw);
}
function panel(id: PanelID, role: Role, min: Vec, max: Vec, face: [number, number], thickness: number): Panel {
  const dimensions = min.map((n, i) => max[i]! - n) as Vec;
  const center = min.map((n, i) => (n + max[i]!) / 2) as Vec;
  return { id, role, dimensions, min, max, center, face, thickness };
}
export function derive(p: Parameters) {
  const { W, H, D, t, backThickness: b, rearInset: r } = p;
  const cw = W - 2 * t, ch = H - 2 * t, ud = D - r - b;
  const panels: Panel[] = [
    panel('side-left', 'side', [0, 0, 0], [t, H, D], [H, D], t),
    panel('side-right', 'side', [W - t, 0, 0], [W, H, D], [H, D], t),
    panel('bottom', 'horizontal', [t, 0, 0], [W - t, t, D], [cw, D], t),
    panel('top', 'horizontal', [t, H - t, 0], [W - t, H, D], [cw, D], t),
    panel('back', 'back', [t, t, ud], [W - t, H - t, D - r], [cw, ch], b)
  ];
  const bom = [
    { role: 'side', quantity: 2, face: [H, D], thickness: t },
    { role: 'horizontal', quantity: 2, face: [cw, D], thickness: t },
    { role: 'back', quantity: 1, face: [cw, ch], thickness: b }
  ];
  const volume = panels.reduce((sum, v) => sum + v.dimensions[0] * v.dimensions[1] * v.dimensions[2], 0);
  return { clearWidth: cw, clearHeight: ch, usableDepth: ud, panels, bom, volume, bounds: { min: [0, 0, 0], max: [W, H, D] } };
}
export function display(p: Parameters, e: number): { panels: Panel[]; bounds: Bounds; gap: number } {
  if (!Number.isFinite(e) || e < 0 || e > 1) throw new Fault(['explosion']);
  const gap = 0.2 * Math.max(p.W, p.H, p.D), d = e === 0 ? 0 : e * gap;
  const offsets: Record<PanelID, Vec> = { 'side-left': [d ? -d : 0, 0, 0], 'side-right': [d, 0, 0], bottom: [0, d ? -d : 0, 0], top: [0, d, 0], back: [0, 0, d] };
  const panels = derive(p).panels.map(v => {
    const move = (a: Vec): Vec => a.map((n, i) => n + offsets[v.id][i]!) as Vec;
    return { ...v, min: move(v.min), max: move(v.max), center: move(v.center) };
  });
  const min = [0, 1, 2].map(i => Math.min(...panels.map(v => v.min[i]!))) as Vec;
  const max = [0, 1, 2].map(i => Math.max(...panels.map(v => v.max[i]!))) as Vec;
  return { panels, bounds: { min, max }, gap };
}
export function canonical(c: Concept) {
  const accepted = concept(c.name, c.parameters);
  return { version: 1, units: 'mm', name: accepted.name, parameters: accepted.parameters, derived: derive(accepted.parameters) };
}
export function exportJSON(c: Concept): string { return JSON.stringify(canonical(c), null, 2) + '\n'; }
// Iterative, shape-directed equality: supplied cache depth cannot drive recursion.
export function sameData(expected: unknown, actual: unknown): boolean {
  const work: [unknown, unknown][] = [[expected, actual]];
  let visited = 0;
  while (work.length) {
    if (++visited > 2048) return false;
    const [a, b] = work.pop()!;
    if (a === b) continue;
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) work.push([a[i], b[i]]);
    } else if (object(a)) {
      if (!object(b)) return false;
      const ks = Object.keys(a);
      if (ks.length !== Object.keys(b).length || ks.some(k => !Object.hasOwn(b, k))) return false;
      for (const k of ks) work.push([a[k], b[k]]);
    } else return false;
  }
  return true;
}
export function importValue(raw: unknown): Concept {
  if (!object(raw)) throw new Fault(['schema']);
  exactKeys(raw, ['version', 'units', 'name', 'parameters'], ['derived']);
  if (raw.version !== 1 || raw.units !== 'mm') throw new Fault(['schema']);
  const c = concept(raw.name, raw.parameters);
  if (Object.hasOwn(raw, 'derived') && !sameData(derive(c.parameters), raw.derived)) throw new Fault(['cache']);
  return c;
}
export function importJSON(text: string): Concept {
  if (text.length > MAX_IMPORT || bytes(text) > MAX_IMPORT) throw new Fault(['importSize']);
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { throw new Fault(['json']); }
  return importValue(raw);
}
export async function readFile(file: { size: number; text(): Promise<string> }): Promise<Concept> {
  if (!Number.isFinite(file.size) || file.size < 0 || file.size > MAX_IMPORT) throw new Fault(['importSize']);
  let text: string;
  try { text = await file.text(); } catch { throw new Fault(['file']); }
  return importJSON(text);
}
export function xml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}
export function exportSVG(c: Concept): string {
  const data = canonical(c), panels = data.derived.panels;
  const width = Math.max(...panels.map(v => v.face[0])) + 80;
  const height = panels.reduce((n, v) => n + v.face[1] + 100, 100);
  let y = 100;
  const rows = panels.map(v => {
    const row = `  <g><rect x="40" y="${y}" width="${v.face[0]}" height="${v.face[1]}" fill="#edf1f3" stroke="#202b36"/><text x="40" y="${y - 16}" font-size="16">${xml(v.id)}: ${v.face[0]} × ${v.face[1]} mm; thickness ${v.thickness} mm</text></g>`;
    y += v.face[1] + 100;
    return row;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title note">\n  <title id="title">${xml(data.name)}</title>\n  <desc id="note">Nominal panel layout in mm. Concept only; not a cutting, CNC or fabrication plan.</desc>\n  <text x="40" y="36" font-size="20">${xml(data.name)}</text>\n${rows.join('\n')}\n</svg>\n`;
}
