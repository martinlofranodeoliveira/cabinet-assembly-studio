# Development 0.1.0 contract

This document specifies the implemented subset, not furniture, CAD interchange or manufacturing standards compliance.

## Parameters and coordinates

All nominal values are exact integer millimetres. X increases left to right, Y bottom to top, Z front to rear. The open front is at Z=0. Default camera looks from negative Z. The front-to-rear canonical convention is left-handed. The right-handed Three display adapter maps a canonical point to `((W/2−x),(y−H/2),(z−D/2))*0.001`. Reflecting only display X keeps canonical left/right visually correct with the required negative-Z front camera. Nominal data and exports remain in mm.

| Field | Default | Inclusive range |
| --- | ---: | ---: |
| W | 600 | 50–3000 |
| H | 800 | 50–3000 |
| D | 400 | 50–2000 |
| t | 18 | 3–60 |
| backThickness (b) | 6 | 3–30 |
| rearInset (r) | 12 | 0–500 |

Required: `W−2t ≥ 1`, `H−2t ≥ 1`, `D−r−b ≥ 1`. Core values cannot be strings, booleans, fractions, NaN or Infinity. Draft fields accept decimal integer spelling, including leading zeros and a minus sign; empty/whitespace/exponent/fraction spellings are rejected. Numeric cross-checks run even if a range fails. Thus W36/t18 reports clear-width failure as well as W's range; D18/r12/b6 reports usable-depth failure as well as D's range.

Names are 1–64 UTF-16 code units, trimmed, without U+0000–001F, U+007F, unpaired surrogates, U+FFFE or U+FFFF. This preserves valid Unicode scalar text for XML export. Names are text, not markup. React renders them as text; SVG escapes ampersands, angle brackets, single and double quotes.

## Five nominal panels

Bounds are inclusive face coordinates; solid interiors must not overlap. Shared boundary faces are allowed.

| ID | XYZ dimensions | Minimum | Maximum | Face axes |
| --- | --- | --- | --- | --- |
| side-left | t,H,D | 0,0,0 | t,H,D | Y,Z |
| side-right | t,H,D | W−t,0,0 | W,H,D | Y,Z |
| bottom | W−2t,t,D | t,0,0 | W−t,t,D | X,Z |
| top | W−2t,t,D | t,H−t,0 | W−t,H,D | X,Z |
| back | W−2t,H−2t,b | t,t,D−r−b | W−t,H−t,D−r | X,Y |

Centers are arithmetic midpoints. Default clear width/height/depth are `564/764/382`. Back occupies Z382..388. Group order is side qty2, horizontal qty2, back qty1; no rotation-based merging. Volume is sum of exact box volumes, default `22226976 mm³` (`0.022226976 m³`). Nothing implies grooves, attachment, fit tolerances, load capacity or fabrication validity.

## Display-only operations

Selection has one of the five stable IDs. Selection, locale, camera and explosion do not enter exports or history. Explosion e is finite in `[0,1]`, gap `0.2 max(W,H,D)`; translation is respectively −X,+X,−Y,+Y,+Z times `e*gap`. At defaults/e1: gap160, display bounds `[-160,-160,0]..[760,960,548]`. Nominal dimensions, BOM and volume stay fixed.

Fit uses a sphere enclosing display bounds, 12% distance margin, perspective 35° vertical FOV and viewport aspect. Front and isometric commands refit. Camera-only commands are disabled when no scene is ready. Navigation is off by default; controls exist only while explicitly active. Escape and the exit button dispose controls/listeners and restore actual canvas touch action to pan-y. No animation or interpolation runs continuously; slider steps snap, also under reduced motion. DPR is bounded 1–1.5 and R3F uses demand rendering.

The 2D front view uses X/Y with X increasing visually right; the lateral view uses Z/Y. Both use actual translated panel bounds in mm, with their full extents printed. Depth-separated panels can overlap in projection. The hierarchy remains the unambiguous keyboard selection alternative.

## JSON interchange

UTF-8 encoded text must be ≤65536 bytes and ≤65536 UTF-16 units before `JSON.parse`. File `size` is checked **before** calling `text()`, and resulting encoded text is checked again. This bounds input, not JSON decoder RSS/depth. There is no pre-decoder recursion sandbox. Standard JSON.parse semantics apply, including last-value handling of duplicate object keys. Do not use duplicate keys for portable interchange.

Root required keys: `version`, `units`, `name`, `parameters`; optional key: `derived`. Version must be numeric `1`, units exactly `mm`. Parameters have exactly the six table keys. Unknown keys, including prototype/constructor keys, are rejected. No arrays substitute for records.

Minimal example:

```json
{"version":1,"units":"mm","name":"Synthetic","parameters":{"W":600,"H":800,"D":400,"t":18,"backThickness":6,"rearInset":12}}
```

Canonical export always includes `derived`. Field order is version, units, name, parameters, derived. Parameter order is W,H,D,t,backThickness,rearInset. Derived keys are clearWidth,clearHeight,usableDepth,panels,bom,volume,bounds. Panels follow the table order; each has id,role,dimensions,min,max,center,face,thickness. BOM has role,quantity,face,thickness. Bounds has min,max. JSON uses two-space indentation and one terminal LF. Derived data is recomputed. If supplied, every derived key/type/value/array length/order must exactly equal recomputed data; object property order does not matter. Cache mismatch rejects the whole import. Iterative cache comparison limits work to 2048 pairs and follows expected structure, not attacker-supplied nesting.

Imports and successful draft applications replace the complete accepted concept in one transition. Invalid operations preserve accepted state, BOM, selection, history and library. Concurrent file reads use latest-selection-wins. A newer dimension/name draft, apply, undo, redo or load invalidates pending read authority; stale success or failure cannot replace work, discard the draft or publish an error. Locale, camera and selection changes remain UI-only. Successful edits/load/import enter a 20-entry undo history. Draft text is not exportable until accepted. Loading/importing retains the stable selection and display settings.

## Local concepts

Storage key: `cabinet-assembly-studio:v1`. Value is a schema-1 object with `version:1` and `entries`; each entry is `{id,document}`. IDs are unique integers 1..10; a new save takes the lowest unused ID. Documents contain canonical schema-1 JSON values. Limits: 10 entries, each canonical pretty export ≤8192 UTF-8 bytes, stored incoming document serialization also ≤8192, total stored value ≤262144 bytes. Storage text is bounded before decoding. All entries validate before a library read is accepted.

Save is an explicit copy under the supplied name and does not rename current work. Update replaces only the selected saved entry’s parameters with the current accepted parameters and preserves its saved name. Remove deletes only the selected saved entry after explicit UI confirmation, frees its numeric ID, and does not change current work or undo/redo. The UI displays the entry count, disables Save copy at capacity, and keeps update/removal available. Rename changes only the selected saved entry; load copies its accepted concept into work/history. A failed read/write leaves the previous in-memory library and working state intact. Writes serialize/validate first, call `setItem`, then commit the in-memory library. Browser denial/quota/corruption produces a recoverable localized error. No silent deletion, account or synchronization is supplied. Multiple tabs are last-write-wins. Export JSON is the backup mechanism.

## SVG and fallback

SVG export is deterministic, nominal and locale-independent. Five labelled face rectangles are arranged vertically with fixed margins. It contains only svg/title/desc/text/g/rect elements, no foreignObject, scripts, external assets or event attributes. Its namespace URL is not a fetched asset. It is not a nesting, cutting, CNC or fabrication plan.

WebGL2 absence, context loss and scene errors expose the precise 2D projection; form, BOM, selection, undo/redo, local operations and both exports remain DOM operations. Retry requests a fresh capability check/context. No GPU, browser, accessibility certification or responsive visual evidence is inferred from headless tests.
