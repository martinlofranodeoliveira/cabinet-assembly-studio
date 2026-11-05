# Contributing

Use Node 22. Install with `npm ci` using the included npm-generated `package-lock.json`. Keep pinned dependency versions exact unless a dedicated dependency change supplies compatibility evidence and a freshly npm-resolved lockfile.

```sh
npm run typecheck
npm test
npm run demo -- --assert
VITE_BASE_PATH=/cabinet-assembly-studio/ npm run build
```

Keep changes small and explain the contract they affect. Add independent literal or adversarial regression cases, not expectations calculated by the same helper under test. New UI strings must exist in PT-BR and EN; locale must never enter canonical state. Preserve atomic rejected operations, byte limits, fixed panel IDs and the negative-Z front camera.

Do not introduce network runtime dependencies, telemetry, real personal/client data, arbitrary mesh/code imports, publish/deployment workflows, fabricated results or physical suitability claims. Fixtures must remain synthetic. Public issue reports should describe reproducible non-sensitive behavior and distinguish JSDOM/scene-object tests from real browser observations.

For visual changes, preserve the first-body design comment and update the design records honestly. Do not report browser, screenshot, accessibility or WebGL review without actual execution. Production build checks are not visual QA.

Security reports belong in GitHub private vulnerability reporting, not public issues: https://github.com/martinlofranodeoliveira/cabinet-assembly-studio/security/advisories/new . General contact is through https://lofranotecnologia.com.br . Contributions are accepted under the project's MIT license.
