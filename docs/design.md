# Design and architecture

## One authorization boundary

React's shared-state approach fits a tool where a mesh, list row, inspector and projection must agree. `core.ts` owns integer validation and nominal geometry. Imports authorize parameters and recompute caches before state replacement. Neither Three objects nor SVG paths are an alternate source of geometry. `store.ts` owns atomic history transitions and transactional local-library writes. `App.tsx` owns ephemeral draft, selection, locale and view settings. Locale is never passed to serialization.

Core inputs are deliberately small: six bounded integers, a bounded name, five fixed panel IDs. There is no generic mesh loader, expression evaluator, plugin interpreter or model API. This makes the trust boundary inspectable and eliminates asset loading progress as a normal runtime dependency. Startup capability checking has a loading state; scene failures have a projection fallback and retry. Local and import errors preserve valid work.

## Rendering

`PanelScene` creates five real Drei Box/Three BoxGeometry meshes with edge geometry and a simple local light rig. Nominal millimetres become centered metre-like scene units only at the adapter. R3F has a demand frame loop and bounded DPR; camera edits invalidate explicitly. Fit uses display bounds including explosion, not just nominal dimensions. The initial camera is on negative Z so the open front faces it. No continuous animation, shadows, textures, HDRI, font service or network models are required.

OrbitControls are mounted by an effect only while navigation is active. Merely setting enabled=false would still leave the actual connect-time touch-action and wheel behavior. Cleanup disposes listeners and restores the actual canvas inline touch action to pan-y. A VM DOM test uses real OrbitControls and records listener installation/removal over repeated entry/exit. This is lifecycle evidence, not evidence of real mobile gestures.

Front and side projections are literal millimetre SVG coordinates from the same display AABBs. DOM selection remains available if overlapping faces make projection picking ambiguous. Export SVG is a separate nominal face schedule and contains no executable or externally referenced content.

## Workspace direction

Maquete técnica uses pale geometry on ground #f3f6f7, primary ink #202b36, active #235bd4, and subdued ink #4e606e on light surfaces. Public Sans variable is self-hosted through Vite. Lucide supplies consistent functional icons. A compact topbar, narrow left hierarchy, central continuous stage and bounded right inspector avoid marketing content. On narrow screens, semantic section buttons reveal Object/Properties/Plan below a bounded viewport. Minimum input/button heights are 44px; focus, caret, selection and scrollbars receive explicit styling. Reduced motion has no capability penalty because all changes are direct/manual steps.

The visual direction is provisional delegated implementation detail, not a claim of user approval. React/code-first and professional 3D application scope were explicitly requested. Reference sources informed architecture and task framing; no code was copied from them:

- https://react.dev/learn/sharing-state-between-components
- https://r3f.docs.pmnd.rs/advanced/scaling-performance
- https://threejs.org/docs/
- https://www.shapr3d.com/

Unavailable reference images are not claimed as viewed.

## Evidence boundaries

Tests deliberately separate mathematical output, ReactDOM interaction, Three scene objects and production assets. The exhaustive unit-cell oracle counts occupied cells using independent shell/back predicates, rather than repeating panel center equations. Literal defaults and a second case catch axis/inset/thickness mistakes. Adversarial tests target type confusion, unknown schemas, cache disagreement, XML injection, byte bounds, invalid atomic drafts and failed persistence. ReactDOM tests exercise both real locales and fallback operations. R3F test-renderer tests inspect actual geometry and transforms, not pixels.

`npm test` also builds for `/cabinet-assembly-studio/` and asserts self-hosted font paths, direct dependency licenses and the first-body seed comment. The HTML transform preserves that comment after Vite's production transformation. Development source files and generated output remain separate.

No browser host was available. Real GPU rendering, pointer accuracy, responsive visual balance, touch scrolling, keyboard/screen-reader behavior and accessibility review require actual browser execution. These are not replaced by JSDOM, screenshot invention or scene-object assertions. See `DESIGN.md` for the source-level finish record and remaining review.
