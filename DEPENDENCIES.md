# Dependency notices

Original application code is MIT, copyright 2026 Lofrano Tecnologia. Dependencies are separate works and retain their own copyrights and license terms. No dependency authorship is claimed.

Direct runtime packages pinned in `package.json`:

| Package | Version | Upstream license |
| --- | --- | --- |
| react | 19.3.1 | MIT |
| react-dom | 19.3.1 | MIT |
| @react-three/fiber | 9.8.2 | MIT |
| @react-three/drei | 10.7.9 | MIT |
| three | 0.184.0 | MIT |
| three-stdlib | 2.36.1 | MIT |
| lucide-react | 1.69.0 | ISC |
| @fontsource-variable/public-sans | 5.3.0 | SIL Open Font License 1.1 |

The build reads original installed license texts and emits a linked `dist/THIRD_PARTY_NOTICES.txt` plus `dist/licenses/bundled-packages.json` for packages whose modules have positive rendered length in the actual production chunks. The manifest records real installed/locked versions, npm integrity, source paths or upstream URLs, original-license SHA-256, retained modules and output chunks. R3F’s installed package omits its own license file: its exact tagged upstream MIT notice is retained under `dependency-metadata/`, verified against the recorded SHA-256 and emitted with the notices. Embedded React reconciler headers inside R3F retain the Meta/MIT attribution through the included full React notice. Direct-package notices remain under `dist/licenses/`, including the Public Sans OFL text. Public Sans is bundled through `@fontsource-variable/public-sans/wght.css`; no external font endpoint is used. Lucide is used for functional interface icons. The `OrbitControls` module from `three-stdlib` is used as a dependency, not copied into original application code.

Vite, the React plugin, TypeScript, type declarations, Testing Library, JSDOM and the R3F test renderer are development tools only. Their notices remain in the npm-installed packages. The public notice is derived from actual retained production modules, rather than guessed from minified license substrings or every installed development package. Keep it alongside the built assets when redistributing them. Package metadata records the declared license; original license texts and attribution remain authoritative. The npm-generated `package-lock.json` records exact dependency resolution.
