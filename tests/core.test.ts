import test from 'node:test';
import assert from 'node:assert/strict';
import { concept, defaults, derive, display, draftOf, exportJSON, exportSVG, Fault, importJSON, parameters, parseDraft, readFile, type Parameters } from '../src/core';
import { apply, initial, Library, redo, replace, STORAGE_KEY, undo, type StoragePort } from '../src/store';

class Memory implements StoragePort {
  value: string | null = null;
  fail = false;
  getItem() { if (this.fail) throw Error('blocked'); return this.value; }
  setItem(_key: string, value: string) { if (this.fail) throw Error('full'); this.value = value; }
}
const hasIssue = (key: string) => (e: unknown) => e instanceof Fault && e.issues.includes(key);

test('independent literal five-panel oracle, groups and exact default volume', () => {
  const d = derive(defaults);
  assert.deepEqual([d.clearWidth, d.clearHeight, d.usableDepth, d.volume], [564, 764, 382, 22226976]);
  assert.deepEqual(d.panels.map(v => [v.id, v.min, v.max, v.center, v.dimensions, v.face, v.thickness]), [
    ['side-left', [0,0,0], [18,800,400], [9,400,200], [18,800,400], [800,400], 18],
    ['side-right', [582,0,0], [600,800,400], [591,400,200], [18,800,400], [800,400], 18],
    ['bottom', [18,0,0], [582,18,400], [300,9,200], [564,18,400], [564,400], 18],
    ['top', [18,782,0], [582,800,400], [300,791,200], [564,18,400], [564,400], 18],
    ['back', [18,18,382], [582,782,388], [300,400,385], [564,764,6], [564,764], 6]
  ]);
  assert.deepEqual(d.bom, [
    { role: 'side', quantity: 2, face: [800,400], thickness: 18 },
    { role: 'horizontal', quantity: 2, face: [564,400], thickness: 18 },
    { role: 'back', quantity: 1, face: [564,764], thickness: 6 }
  ]);
  assert.deepEqual(display(defaults, 1).bounds, { min: [-160,-160,0], max: [760,960,548] });
  assert.deepEqual(display(defaults, 1).panels.map(v => v.center), [[-151,400,200],[751,400,200],[300,-151,200],[300,951,200],[300,400,545]]);
  assert.deepEqual(display(defaults, 0).panels, d.panels);
});

test('exhaustive unit-cell occupancy oracle: independent shell predicates, no overlaps or gaps', () => {
  for (const [t,b,r] of [[3,3,0],[7,5,4],[24,3,20],[3,30,19]]) {
    const p = parameters({ W:50,H:50,D:50,t,backThickness:b,rearInset:r });
    const d = derive(p);
    let count = 0;
    for (let x=0;x<50;x++) for (let y=0;y<50;y++) for (let z=0;z<50;z++) {
      const shell = x < t! || x >= 50-t! || y < t! || y >= 50-t!;
      const back = x >= t! && x < 50-t! && y >= t! && y < 50-t! && z >= 50-r!-b! && z < 50-r!;
      const hits = d.panels.filter(v => x >= v.min[0] && x < v.max[0] && y >= v.min[1] && y < v.max[1] && z >= v.min[2] && z < v.max[2]);
      if (hits.length !== Number(shell || back)) assert.fail(`occupancy at ${x},${y},${z}; t=${t},b=${b},r=${r}`);
      count += hits.length;
    }
    assert.equal(d.volume, count);
    if (t===3 && b===3 && r===0) assert.equal(count, 34008);
  }
});

test('boundary grid, numeric types, cross-field diagnostics and blank drafts', () => {
  for (const W of [50,51,120,3000]) for (const H of [50,121,3000]) for (const D of [50,2000]) for (const t of [3,25,60]) for (const b of [3,30]) for (const r of [0,47,500]) {
    const raw = { W,H,D,t,backThickness:b,rearInset:r };
    const valid = W>2*t && H>2*t && D>r+b;
    if (valid) assert.doesNotThrow(() => parameters(raw));
    else assert.throws(() => parameters(raw), Fault);
  }
  for (const W of ['', '600', NaN, Infinity, null, true, 600.5, 3001]) assert.throws(() => parameters({ ...defaults,W }), Fault);
  assert.throws(() => parameters({ ...defaults,W:36,t:18 }), hasIssue('clearWidth'));
  assert.throws(() => parameters({ ...defaults,D:18,rearInset:12,backThickness:6 }), hasIssue('usableDepth'));
  assert.throws(() => parseDraft({ ...draftOf(defaults), W:'' }), hasIssue('W.integer'));
  assert.throws(() => parseDraft({ ...draftOf(defaults), W:'6e2' }), hasIssue('W.integer'));
  const zeroInset = parseDraft({ ...draftOf(defaults), rearInset:'-0' });
  assert.equal(Object.is(zeroInset.rearInset, 0), true);
  assert.throws(() => display(defaults, NaN), Fault);
  assert.throws(() => display(defaults, 1.01), Fault);
});

test('second literal case and dimensional metamorphisms', () => {
  const p: Parameters = { W:720,H:960,D:500,t:20,backThickness:8,rearInset:10 };
  const d = derive(p);
  assert.deepEqual([d.clearWidth,d.clearHeight,d.usableDepth], [680,920,482]);
  assert.deepEqual(d.panels[4]!.min, [20,20,482]);
  assert.deepEqual(d.panels[4]!.max, [700,940,490]);
  const wider = derive({ ...p,W:727 });
  assert.deepEqual(wider.panels[0]!.dimensions,d.panels[0]!.dimensions);
  assert.equal(wider.panels[4]!.face[0],687);
  const thicker = derive({ ...p,backThickness:9 });
  assert.equal(thicker.panels[4]!.min[2],481);
  assert.equal(thicker.panels[4]!.max[2],490);
  const inset = derive({ ...p,rearInset:11 });
  assert.deepEqual(inset.panels.map(v=>v.dimensions), d.panels.map(v=>v.dimensions));
  assert.equal(inset.panels[4]!.max[2],489);
  const c=concept('Synthetic',p), before=exportJSON(c);
  for(let i=0;i<=20;i++) display(p,i/20);
  assert.equal(exportJSON(c),before);
});

test('strict bounded imports, order-independent cache checks and malicious shapes', async () => {
  const c = concept('Synthetic <&"\'>',defaults), text = exportJSON(c);
  assert.equal(exportJSON(importJSON(text)),text);
  const raw = JSON.parse(text) as Record<string, unknown>;
  assert.deepEqual(importJSON(JSON.stringify({parameters:raw.parameters,name:raw.name,units:'mm',version:1})), c);
  const mutations = [
    { ...raw,version:2 }, { ...raw,units:'cm' }, { ...raw,extra:0 }, { ...raw,derived:null },
    { ...raw,parameters:{ ...defaults,W:'600' } },
    { ...raw,parameters:{ ...defaults,constructor:0 } },
    { ...raw,derived:{ ...(raw.derived as object),volume:1 } },
    { ...raw,name:'\u0000name' }, { ...raw,name:'x'.repeat(65) },
    { ...raw,name:'bad\uD800' }, { ...raw,name:'bad\uDC00' }, { ...raw,name:'bad\uFFFE' }, { ...raw,name:'bad\uFFFF' }
  ];
  for (const v of mutations) assert.throws(()=>importJSON(JSON.stringify(v)), Fault);
  assert.throws(()=>importJSON('{"version":1,"units":"mm","name":"x","parameters":{"__proto__":{},"W":600}}'),Fault);
  assert.throws(()=>importJSON('{"__proto__":{},"version":1,"units":"mm","name":"x","parameters":{}}'),Fault);
  assert.throws(()=>importJSON('['.repeat(5000)+'0'+']'.repeat(5000)),Fault);
  assert.throws(()=>importJSON(' '.repeat(65537)),hasIssue('importSize'));
  assert.throws(()=>importJSON('é'.repeat(33000)),hasIssue('importSize'));
  let touched=false;
  await assert.rejects(readFile({size:65537,text:async()=>{touched=true;return text;}}),hasIssue('importSize'));
  assert.equal(touched,false);
  await assert.rejects(readFile({size:1,text:async()=> 'é'.repeat(33000)}),hasIssue('importSize'));
  await assert.rejects(readFile({size:1,text:async()=>{throw Error('io');}}),hasIssue('file'));
  assert.equal(({} as Record<string,unknown>).polluted,undefined);
});

test('atomic rejected drafts/imports, bounded history and transactional local storage', () => {
  let s=initial();
  const mem=new Memory(), lib=new Library(mem);
  const id=lib.save(s.current,'Synthetic saved');
  const snapshot=exportJSON(s.current), saves=JSON.stringify(lib.entries);
  for(const patch of [{W:'36',t:'18'},{D:'18',rearInset:'12',backThickness:'6'},{W:'50',t:'25'},{H:'50',t:'25'}]) {
    assert.throws(()=>apply(s,s.current.name,{...draftOf(defaults),...patch}),Fault);
    assert.equal(exportJSON(s.current),snapshot);
    assert.equal(JSON.stringify(lib.entries),saves);
    assert.equal(s.past.length,0);
  }
  assert.throws(()=>{s=replace(s,importJSON('{bad'));},Fault);
  assert.equal(exportJSON(s.current),snapshot);
  mem.fail=true;
  assert.throws(()=>lib.rename(0,''),hasIssue('chooseSave'));
  assert.throws(()=>lib.rename(id,'Changed'),hasIssue('storage'));
  assert.throws(()=>lib.save(s.current,'Another'),hasIssue('storage'));
  assert.equal(JSON.stringify(lib.entries),saves);
  assert.equal(exportJSON(s.current),snapshot);
  mem.fail=false;
  lib.rename(id,'Renamed');
  const reloaded=new Library(mem);reloaded.read();
  assert.deepEqual(reloaded.load(id).parameters,defaults);
  assert.equal(reloaded.load(id).name,'Renamed');
  for(let i=0;i<9;i++) reloaded.save(s.current,`Synthetic ${i}`);
  const full=mem.value;
  assert.throws(()=>reloaded.save(s.current,'Eleventh'),hasIssue('saveLimit'));
  assert.equal(mem.value,full);
  mem.value='{"version":1,"entries":[{"id":1,"document":{}}]}';
  const prev=reloaded.entries;
  assert.throws(()=>reloaded.read(),hasIssue('storageData'));
  assert.deepEqual(reloaded.entries,prev);
  mem.value=' '.repeat(262145);
  assert.throws(()=>reloaded.read(),hasIssue('storageData'));
  for(let i=0;i<30;i++) s=replace(s,concept('Synthetic',{...defaults,W:601+i}));
  assert.equal(s.past.length,20);
  assert.equal(redo(undo(s)).current.parameters.W,630);
  assert.equal(STORAGE_KEY,'cabinet-assembly-studio:v1');
});

test('SVG escapes all XML metacharacters and only uses passive, nominal elements', () => {
  const c=concept('"\'&<script>alert(1)</script>',defaults);
  const svg=exportSVG(c);
  assert.ok(svg.includes('&quot;&apos;&amp;&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.equal((svg.match(/<rect /g)??[]).length,5);
  assert.ok(svg.includes('back: 564 × 764 mm; thickness 6 mm'));
  assert.equal(/<script|foreignObject|href=|onload=|https?:/i.test(svg.replace('http://www.w3.org/2000/svg','')),false);
  assert.equal(exportSVG(c),svg);
});
