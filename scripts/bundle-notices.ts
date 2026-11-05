import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
import type { Plugin } from 'vite';

type PackageMeta = { name: string; version: string; license?: unknown; repository?: unknown };
type RecordEntry = { name: string; version: string; declaredLicense: unknown; repository: unknown; packageLockKey: string; integrity: string; licenseSource: string; licenseSha256: string; modules: Set<string>; chunks: Set<string>; text: string; embeddedReact: boolean };
const filenames = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'license.md', 'LICENCE', 'COPYING'];
const sha = (data: string) => createHash('sha256').update(data).digest('hex');
const slash = (value: string) => value.replaceAll('\\', '/');
export function bundleNotices(root: string): Plugin {
  root = resolve(root);
  const read = (file: string) => readFileSync(file, 'utf8');
  return {
    name: 'real-bundled-third-party-notices',
    generateBundle(_options, bundle) {
      const lock = JSON.parse(read(join(root, 'package-lock.json'))) as { packages: Record<string, { version?: string; integrity?: string }> };
      const fallback = JSON.parse(read(join(root, 'dependency-metadata/licenses.json'))) as Record<string, { version: string; source: string; sha256: string; file: string }>;
      const records = new Map<string, RecordEntry>();
      let inspected = 0;
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        for (const [id, info] of Object.entries(chunk.modules)) {
          const clean = id.split('?')[0]!;
          if (!isAbsolute(clean) || !slash(clean).includes('/node_modules/')) continue;
          if (!Number.isFinite(info.renderedLength)) throw new Error('Rendered module accounting unavailable');
          if (info.renderedLength === 0) continue;
          if (++inspected > 10000) throw new Error('Bundled module accounting limit');
          let directory = dirname(clean), meta: PackageMeta | undefined;
          while (slash(directory).includes('/node_modules/')) {
            const candidate = join(directory, 'package.json');
            if (existsSync(candidate)) {
              const value: unknown = JSON.parse(read(candidate));
              if (value && typeof value === 'object' && 'name' in value && 'version' in value && typeof value.name === 'string' && typeof value.version === 'string') { meta = value as PackageMeta; break; }
            }
            const parent = dirname(directory);
            if (parent === directory) break;
            directory = parent;
          }
          if (!meta) throw new Error('Missing package metadata for retained bundled module');
          const key = slash(relative(root, directory));
          const pinned = lock.packages[key];
          if (!pinned || pinned.version !== meta.version || typeof pinned.integrity !== 'string') throw new Error(`Installed/locked package mismatch: ${meta.name}`);
          let row = records.get(key);
          if (!row) {
            let text: string | undefined, licenseSource: string | undefined;
            for (const file of filenames) {
              if (existsSync(join(directory, file))) { text = read(join(directory, file)); licenseSource = `${key}/${file}`; break; }
            }
            const extra = fallback[meta.name === '@react-three/fiber' ? 'react-three-fiber' : meta.name];
            if (text === undefined && extra && extra.version === meta.version) {
              text = read(join(root, 'dependency-metadata', extra.file));
              if (sha(text) !== extra.sha256) throw new Error(`Retained upstream license checksum mismatch: ${meta.name}`);
              licenseSource = extra.source;
            }
            if (text === undefined || !licenseSource || text.length === 0 || text.length > 262144) throw new Error(`Missing bounded original license text: ${meta.name}`);
            row = { name: meta.name, version: meta.version, declaredLicense: meta.license ?? null, repository: meta.repository ?? null, packageLockKey: key, integrity: pinned.integrity, licenseSource, licenseSha256: sha(text), modules: new Set(), chunks: new Set(), text, embeddedReact: false };
            records.set(key, row);
          }
          row.modules.add(slash(relative(directory, clean)));
          row.chunks.add(chunk.fileName);
          // R3F's distributed events module embeds React reconciler code and its
          // original Meta/MIT header. Preserve that attribution explicitly too.
          if (meta.name === '@react-three/fiber') {
            const source = read(clean);
            if (source.includes('@license React') && source.includes('react-reconciler') && source.includes('Copyright (c) Meta Platforms, Inc. and affiliates.')) row.embeddedReact = true;
          }
        }
      }
      if (records.size === 0) throw new Error('No retained dependency modules inventoried');
      const sorted = [...records.values()].sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : a.packageLockKey.localeCompare(b.packageLockKey));
      const react = sorted.find(row => row.name === 'react');
      if (sorted.some(row => row.embeddedReact) && (!react || !react.text.includes('Copyright (c) Meta Platforms, Inc. and affiliates.'))) throw new Error('Missing original React attribution for embedded reconciler');
      const heading = 'Third-party notices — Cabinet Assembly Studio\n\nThese are original license texts from packages with modules retained in the production JavaScript/CSS chunks. Package identity and integrity come from the installed package and the real npm lock. Fonts retain their included OFL notice. This inventory records observed distribution inputs; it does not relicense third-party work.\n';
      const body = sorted.map(row => `\n${'='.repeat(72)}\n${row.name} ${row.version}\nDeclared license metadata: ${JSON.stringify(row.declaredLicense)}\nLicense source: ${row.licenseSource}\nLicense SHA-256: ${row.licenseSha256}\n${row.embeddedReact ? 'Includes embedded React reconciler code carrying the original Meta/MIT header; the full React notice is included separately below/above.\n' : ''}\n${row.text}\n`).join('');
      this.emitFile({ type: 'asset', fileName: 'THIRD_PARTY_NOTICES.txt', source: heading + body });
      const manifest = { formatVersion: 1, accounting: 'Production chunk modules with positive renderedLength; no guessed string-based license classification', packages: sorted.map(({ text: _text, modules, chunks, ...row }) => ({ ...row, modules: [...modules].sort(), chunks: [...chunks].sort() })) };
      this.emitFile({ type: 'asset', fileName: 'licenses/bundled-packages.json', source: JSON.stringify(manifest, null, 2) + '\n' });
    }
  };
}
