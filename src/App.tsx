import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Upload, Save, Focus, Undo2, Redo2, MousePointer2 } from 'lucide-react';
import { derive, display, draftOf, exportJSON, exportSVG, keys, limits, readFile, type PanelID, type Parameters } from './core';
import { apply, browserStorage, initial, Library, redo, replace, undo, type StoragePort } from './store';
import { errorText, panelLabel, text, type Locale } from './i18n';
import { Viewport } from './Scene';

export function Projection({ p, explosion, selected, select, locale }: { p: Parameters; explosion: number; selected: PanelID; select(id: PanelID): void; locale: Locale }) {
  const model = display(p, explosion), t = text(locale);
  return <figure className="projection"><figcaption>{t.projection}</figcaption>{([0, 2] as const).map(axis => {
    const { min, max } = model.bounds, margin = 40;
    const w = max[axis] - min[axis] + 2 * margin, h = max[1] - min[1] + 2 * margin;
    return <svg key={axis} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={axis === 0 ? t.frontProjection : t.sideProjection}>
      <title>{axis === 0 ? t.frontProjection : t.sideProjection}</title>
      {[...model.panels].sort((a, b) => Number(a.id === selected) - Number(b.id === selected) || Number(b.id === 'back') - Number(a.id === 'back')).map(v => <rect key={v.id} x={v.min[axis] - min[axis] + margin} y={max[1] - v.max[1] + margin} width={v.dimensions[axis]} height={v.dimensions[1]} className={v.id === selected ? 'selected-panel' : ''} onClick={() => select(v.id)}><title>{panelLabel(v.id, locale)}: {v.dimensions.join(' × ')} mm</title></rect>)}
      <text x={margin} y={h - 8}>{axis === 0 ? 'X' : 'Z'}: {max[axis] - min[axis]} mm · Y: {max[1] - min[1]} mm</text>
    </svg>;
  })}</figure>;
}
export function NavigationButton({ navigation, setNavigation, available, locale }: {
  navigation: boolean; setNavigation: React.Dispatch<React.SetStateAction<boolean>>; available: boolean; locale: Locale;
}) {
  const button = useRef<HTMLButtonElement>(null), t = text(locale);
  useEffect(() => {
    if (!navigation) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setNavigation(false); button.current?.focus(); }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [navigation, setNavigation]);
  return <button ref={button} disabled={!available} aria-pressed={navigation} onClick={() => setNavigation(n => !n)}><MousePointer2 aria-hidden="true" />{navigation ? t.exit : t.navigate}</button>;
}
export type ExportHandler = (filename: string, content: string, mime: string) => void;
function download(filename: string, content: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
export function App({ storage, webgl, onExport = download }: { storage?: StoragePort; webgl?: boolean; onExport?: ExportHandler }) {
  const [locale, setLocale] = useState<Locale>('pt-BR');
  const t = text(locale);
  const [session, setSession] = useState(initial);
  const current = session.current, p = current.parameters, model = derive(p);
  const [draft, setDraft] = useState(() => draftOf(p));
  const [name, setName] = useState(current.name);
  const [selected, setSelected] = useState<PanelID>('side-left');
  const [explosion, setExplosion] = useState(0);
  const [mode, setMode] = useState<'front' | 'iso'>('front');
  const [revision, setRevision] = useState(0);
  const [navigation, setNavigation] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const stopNavigation = useCallback(() => setNavigation(false), []);
  const [tab, setTab] = useState<'objects' | 'properties' | 'plan'>('objects');
  const [library] = useState(() => new Library(storage ?? browserStorage()));
  const [entries, setEntries] = useState(library.entries);
  const [saveName, setSaveName] = useState('Gabinete 01');
  const [saveID, setSaveID] = useState(0);
  const [removeID, setRemoveID] = useState(0);
  const removeButton = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState<unknown>(null);
  const [status, setStatus] = useState<'ready' | 'applied' | 'imported' | 'saved' | 'renamed' | 'loaded' | 'exported' | 'history' | 'storageRead' | 'updated' | 'removed'>('ready');
  const input = useRef<HTMLInputElement>(null);
  const importGeneration = useRef(0);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  useEffect(() => { setDraft(draftOf(p)); setName(current.name); }, [current, p]);
  useEffect(() => {
    try { library.read(); setEntries(library.entries); } catch (e) { setError(e); }
    return () => { importGeneration.current++; };
  }, [library]);
  function action(nextStatus: typeof status, fn: () => void) {
    if (nextStatus === 'applied' || nextStatus === 'history' || nextStatus === 'loaded') importGeneration.current++;
    if (['saved', 'updated', 'renamed', 'loaded', 'storageRead'].includes(nextStatus)) setRemoveID(0);
    try { fn(); setError(null); setStatus(nextStatus); } catch (e) { setError(e); }
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    const generation = ++importGeneration.current;
    try {
      const c = await readFile(file);
      if (generation !== importGeneration.current) return;
      setSession(s => replace(s, c)); setError(null); setStatus('imported');
    } catch (e) { if (generation === importGeneration.current) setError(e); }
  }
  const part = model.panels.find(v => v.id === selected)!;
  const projection = <Projection p={p} explosion={explosion} selected={selected} select={setSelected} locale={locale} />;
  return <main>
    <header className="topbar">
      <div className="identity"><h1>{t.title}</h1><a href="https://lofranotecnologia.com.br">Lofrano Tecnologia</a><span>{t.version}</span></div>
      <div className="file-actions">
        <button onClick={() => input.current?.click()}><Upload aria-hidden="true" />{t.import}</button>
        <button onClick={() => action('exported', () => onExport('concept.json', exportJSON(current), 'application/json'))}><Download aria-hidden="true" />{t.exportJSON}</button>
        <button onClick={() => action('exported', () => onExport('panel-layout.svg', exportSVG(current), 'image/svg+xml'))}><Download aria-hidden="true" />{t.exportSVG}</button>
        <label className="locale">{t.language}<select value={locale} onChange={e => setLocale(e.target.value as Locale)}><option value="pt-BR">Português</option><option value="en">English</option></select></label>
        <input ref={input} className="sr-only" type="file" accept=".json,application/json" aria-label={t.file} onChange={e => { void importFile(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
    </header>
    <div className="workspace">
      <section className="stage" aria-label={t.workspace}>
        <div className="stage-context"><strong>{current.name}</strong><span>{p.W} × {p.H} × {p.D} mm</span><span>{panelLabel(selected, locale)} · {part.dimensions.join(' × ')} mm</span></div>
        <div className="viewport"><Viewport p={p} explosion={explosion} selected={selected} select={setSelected} mode={mode} revision={revision} navigation={navigation} stopNavigation={stopNavigation} locale={locale} webgl={webgl} available={setSceneReady} fallback={projection} /></div>
        <div className="view-controls" aria-label={t.workspace}>
          <button disabled={!sceneReady} aria-pressed={mode === 'front'} onClick={() => { setMode('front'); setRevision(n => n + 1); }}>{t.front}</button>
          <button disabled={!sceneReady} aria-pressed={mode === 'iso'} onClick={() => { setMode('iso'); setRevision(n => n + 1); }}>{t.iso}</button>
          <button disabled={!sceneReady} onClick={() => setRevision(n => n + 1)}><Focus aria-hidden="true" />{t.fit}</button>
          <NavigationButton navigation={navigation} setNavigation={setNavigation} available={sceneReady} locale={locale} />
          <label className="explosion">{t.explode}<input type="range" min="0" max="1" step="0.05" value={explosion} onChange={e => setExplosion(Number(e.target.value))} /><output>{Math.round(explosion * 100)}%</output></label>
        </div>
        <p className="stage-help">{navigation ? t.navHelp : t.nominal}</p>
      </section>
      <nav className="mobile-tabs" aria-label={t.workspace}>{(['objects', 'properties', 'plan'] as const).map(k => <button key={k} aria-pressed={tab === k} aria-controls={`section-${k}`} onClick={() => setTab(k)}>{t[k]}</button>)}</nav>
      <aside id="section-objects" className={`hierarchy panel ${tab === 'objects' ? 'mobile-active' : ''}`} aria-label={t.objects}>
        <h2>{t.parts}</h2>
        <ul className="parts">{model.panels.map(v => <li key={v.id}><button aria-label={`${panelLabel(v.id, locale)} ${v.dimensions.join(' × ')} mm`} aria-pressed={selected === v.id} onClick={() => setSelected(v.id)}><span>{panelLabel(v.id, locale)}</span><small>{v.dimensions.join(' × ')}</small></button></li>)}</ul>
        <h2>{t.bom}</h2>
        <table><thead><tr><th>{t.face}</th><th>{t.quantity}</th></tr></thead><tbody>{model.bom.map(v => <tr key={v.role}><td>{v.role === 'side' ? t.side : v.role === 'horizontal' ? t.horizontal : t.backRole}<br /><span className="measure">{v.face.join(' × ')} / {v.thickness}</span></td><td>{v.quantity}</td></tr>)}</tbody></table>
        <dl className="readings"><dt>{t.clear}</dt><dd data-testid="clear">{model.clearWidth} / {model.clearHeight} / {model.usableDepth} mm</dd><dt>{t.volume}</dt><dd>{model.volume} mm³</dd></dl>
        <section className="local-library" aria-label={t.local}>
          <h2>{t.local}</h2>
          <label>{t.saveName}<input maxLength={64} value={saveName} onChange={e => setSaveName(e.target.value)} /></label>
          <p>{t.storageHelp}</p>
          <output aria-label={t.savedCount}>{entries.length}/10</output>
          <button disabled={entries.length >= 10} onClick={() => action('saved', () => { const id = library.save(current, saveName); setEntries(library.entries); setSaveID(id); })}><Save aria-hidden="true" />{t.save}</button>
          <label>{t.savedChoice}<select value={saveID} onChange={e => { setSaveID(Number(e.target.value)); setRemoveID(0); }}><option value={0}>{entries.length ? t.choose : t.empty}</option>{entries.map(v => <option key={v.id} value={v.id}>{v.document.name}</option>)}</select></label>
          <div className="button-row"><button onClick={() => action('loaded', () => { const c = library.load(saveID); setSession(s => replace(s, c)); })}>{t.load}</button><button onClick={() => action('renamed', () => { library.rename(saveID, saveName); setEntries(library.entries); })}>{t.rename}</button></div>
          <div className="button-row"><button disabled={!saveID} onClick={() => action('updated', () => { library.update(saveID, current); setEntries(library.entries); })}>{t.updateSaved}</button><button ref={removeButton} disabled={!saveID} onClick={() => setRemoveID(saveID)}>{t.removeSaved}</button></div>
          {removeID !== 0 && entries.some(v => v.id === removeID) && <section aria-label={t.confirmRemove}>
            <p>{t.removeQuestion} <strong>{entries.find(v => v.id === removeID)!.document.name}</strong>?</p>
            <button onClick={() => action('removed', () => { library.remove(removeID); setEntries(library.entries); setSaveID(0); setRemoveID(0); })}>{t.confirmRemove}</button>
            <button onClick={() => { setRemoveID(0); removeButton.current?.focus(); }}>{t.cancelRemove}</button>
          </section>}
          <button onClick={() => action('storageRead', () => { library.read(); const next = library.entries; setEntries(next); setSaveID(id => next.some(v => v.id === id) ? id : 0); })}>{t.retryStorage}</button>
        </section>
      </aside>
      <aside id="section-properties" className={`inspector panel ${tab === 'properties' ? 'mobile-active' : ''}`} aria-label={t.properties}>
        <h2>{t.selected}</h2><h3>{panelLabel(selected, locale)}</h3>
        <dl className="readings"><dt>{t.dimensions}</dt><dd data-testid="selected-size">{part.dimensions.join(' × ')} mm</dd><dt>{t.position}</dt><dd>{part.center.join(' / ')} mm</dd></dl>
        <form noValidate onSubmit={event => { event.preventDefault(); action('applied', () => setSession(apply(session, name, draft))); }}>
          <h2>{t.parameters}</h2>
          <label>{t.name}<input value={name} maxLength={64} onChange={e => { importGeneration.current++; setName(e.currentTarget.value); }} /></label>
          <div className="dimension-fields">{keys.map(k => <label key={k}><span id={`label-${k}`}>{t[k]}</span><span className="number-input"><input type="text" inputMode="numeric" value={draft[k]} aria-labelledby={`label-${k}`} aria-describedby={`hint-${k}`} onChange={e => { const value = e.currentTarget.value; importGeneration.current++; setDraft(d => ({ ...d, [k]: value })); }} /><span>mm</span></span><small id={`hint-${k}`}>{limits[k][0]}–{limits[k][1]} mm</small></label>)}</div>
          <button className="primary" type="submit">{t.apply}</button>
        </form>
        <div className="button-row history"><button disabled={!session.past.length} onClick={() => action('history', () => setSession(undo(session)))}><Undo2 aria-hidden="true" />{t.undo}</button><button disabled={!session.future.length} onClick={() => action('history', () => setSession(redo(session)))}><Redo2 aria-hidden="true" />{t.redo}</button></div>
      </aside>
      <section id="section-plan" className={`plan panel ${tab === 'plan' ? 'mobile-active' : ''}`} aria-label={t.plan}>{projection}<p>{t.nominal}</p></section>
    </div>
    <footer className="statusbar"><div role="status">{t[status]}</div><a href={`${import.meta.env.BASE_URL}THIRD_PARTY_NOTICES.txt`}>{t.notices}</a><p>{t.disclaimer}</p></footer>
    {error !== null && <section className="error" role="alert"><strong>{t.errorLead}</strong><ul>{errorText(error, locale).map((message, i) => <li key={i}>{message}</li>)}</ul></section>}
  </main>;
}
