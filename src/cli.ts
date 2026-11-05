import assert from 'node:assert/strict';
import { defaults, concept, derive, display, exportJSON, exportSVG, importJSON } from './core';

const args = new Set(process.argv.slice(2));
if ([...args].some(v => v !== '--assert' && v !== '--json')) {
  console.error('Usage: npm run demo -- [--assert] [--json]');
  process.exitCode = 2;
} else {
  const c = concept('Gabinete 01', defaults), d = derive(c.parameters), exploded = display(c.parameters, 1);
  if (args.has('--assert')) {
    assert.equal(d.clearWidth, 564);
    assert.equal(d.clearHeight, 764);
    assert.equal(d.usableDepth, 382);
    assert.equal(d.volume, 22226976);
    assert.deepEqual(d.panels.map(v => v.id), ['side-left', 'side-right', 'bottom', 'top', 'back']);
    assert.deepEqual(d.panels[4]!.min, [18, 18, 382]);
    assert.deepEqual(d.panels[4]!.max, [582, 782, 388]);
    assert.deepEqual(d.bom.map(v => v.quantity), [2, 2, 1]);
    assert.deepEqual(exploded.bounds, { min: [-160, -160, 0], max: [760, 960, 548] });
    assert.equal(exportJSON(importJSON(exportJSON(c))), exportJSON(c));
    assert.ok(exportSVG(c).includes('not a cutting, CNC or fabrication plan'));
  }
  const result = { version: '0.1.0', units: 'mm', panels: 5, clear: [d.clearWidth, d.clearHeight, d.usableDepth], volumeMm3: d.volume, gapMm: exploded.gap, explodedBounds: exploded.bounds };
  if (args.has('--json')) console.log(JSON.stringify(result, null, 2));
  else {
    console.log('Cabinet Assembly Studio — development 0.1.0');
    console.log('5 panels · clear W/H/depth: 564 / 764 / 382 mm');
    console.log('Panel volume: 22226976 mm³');
    console.log('Explosion 1: gap 160 mm; bounds [-160,-160,0] → [760,960,548] mm');
    console.log('Concept only — not a fabrication plan.');
    if (args.has('--assert')) console.log('Demo assertions completed.');
  }
}
