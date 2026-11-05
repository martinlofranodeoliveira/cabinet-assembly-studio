import { bytes, concept, defaults, exactKeys, exportJSON, Fault, importValue, nameOf, object, parseDraft, type Concept, type Draft } from './core';

export type Session = { current: Concept; past: Concept[]; future: Concept[] };
export function initial(): Session { return { current: concept('Gabinete 01', defaults), past: [], future: [] }; }
export function replace(s: Session, c: Concept): Session {
  const next = concept(c.name, c.parameters);
  if (exportJSON(s.current) === exportJSON(next)) return s;
  return { current: next, past: [...s.past, s.current].slice(-20), future: [] };
}
export function apply(s: Session, name: string, d: Draft): Session { return replace(s, concept(name, parseDraft(d))); }
export function undo(s: Session): Session {
  const c = s.past.at(-1);
  return c ? { current: c, past: s.past.slice(0, -1), future: [s.current, ...s.future].slice(0, 20) } : s;
}
export function redo(s: Session): Session {
  const c = s.future[0];
  return c ? { current: c, past: [...s.past, s.current].slice(-20), future: s.future.slice(1) } : s;
}
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void }
export type Entry = { id: number; document: Concept };
export const STORAGE_KEY = 'cabinet-assembly-studio:v1';
const TOTAL = 256 * 1024, ENTRY = 8 * 1024;
export class Library {
  private items: Entry[] = [];
  constructor(private readonly storage: StoragePort) {}
  get entries(): Entry[] { return this.items.map(v => ({ id: v.id, document: concept(v.document.name, v.document.parameters) })); }
  read(): void {
    let text: string | null;
    try { text = this.storage.getItem(STORAGE_KEY); } catch { throw new Fault(['storage']); }
    if (text === null) { this.items = []; return; }
    if (text.length > TOTAL || bytes(text) > TOTAL) throw new Fault(['storageData']);
    let raw: unknown;
    try { raw = JSON.parse(text); } catch { throw new Fault(['storageData']); }
    try {
      if (!object(raw)) throw new Fault(['storageData']);
      exactKeys(raw, ['version', 'entries']);
      if (raw.version !== 1 || !Array.isArray(raw.entries) || raw.entries.length > 10) throw new Fault(['storageData']);
      const seen = new Set<number>();
      const next: Entry[] = raw.entries.map((v: unknown) => {
        if (!object(v)) throw new Fault(['storageData']);
        exactKeys(v, ['id', 'document']);
        if (typeof v.id !== 'number' || !Number.isInteger(v.id) || v.id < 1 || v.id > 10 || seen.has(v.id)) throw new Fault(['storageData']);
        seen.add(v.id);
        const document = importValue(v.document);
        if (bytes(JSON.stringify(v.document)) > ENTRY || bytes(exportJSON(document)) > ENTRY) throw new Fault(['storageData']);
        return { id: v.id, document };
      });
      this.items = next;
    } catch { throw new Fault(['storageData']); }
  }
  private commit(next: Entry[]): void {
    if (next.length > 10) throw new Fault(['saveLimit']);
    if (next.some(v => bytes(exportJSON(v.document)) > ENTRY)) throw new Fault(['saveSize']);
    const text = JSON.stringify({ version: 1, entries: next.map(v => ({ id: v.id, document: JSON.parse(exportJSON(v.document)) as unknown })) });
    if (bytes(text) > TOTAL) throw new Fault(['saveSize']);
    try { this.storage.setItem(STORAGE_KEY, text); } catch { throw new Fault(['storage']); }
    this.items = next;
  }
  save(c: Concept, name: string): number {
    nameOf(name);
    if (this.items.length === 10) throw new Fault(['saveLimit']);
    let id = 1;
    while (this.items.some(v => v.id === id)) id++;
    this.commit([...this.items, { id, document: concept(name, c.parameters) }]);
    return id;
  }
  rename(id: number, name: string): void {
    if (!this.items.some(v => v.id === id)) throw new Fault(['chooseSave']);
    nameOf(name);
    this.commit(this.items.map(v => v.id === id ? { id, document: concept(name, v.document.parameters) } : v));
  }
  update(id: number, c: Concept): void {
    const item = this.items.find(v => v.id === id);
    if (!item) throw new Fault(['chooseSave']);
    this.commit(this.items.map(v => v.id === id ? { id, document: concept(item.document.name, c.parameters) } : v));
  }
  remove(id: number): void {
    if (!this.items.some(v => v.id === id)) throw new Fault(['chooseSave']);
    this.commit(this.items.filter(v => v.id !== id));
  }
  load(id: number): Concept {
    const item = this.items.find(v => v.id === id);
    if (!item) throw new Fault(['chooseSave']);
    return concept(item.document.name, item.document.parameters);
  }
}
export function browserStorage(): StoragePort {
  try { return window.localStorage; } catch {
    return { getItem() { throw new Error('unavailable'); }, setItem() { throw new Error('unavailable'); } };
  }
}
