import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { bundleNotices } from './scripts/bundle-notices';

const source = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const seed = source.match(/<!-- THESIS[\s\S]*?-->/)?.[0];
if (!seed) throw new Error('Missing design seed');
const base = process.env.VITE_BASE_PATH ?? '/';
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) throw new Error('VITE_BASE_PATH must be a slash-delimited repository path');

export default defineConfig({
  base,
  plugins: [react(), {
    name: 'retain-first-body-seed',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(seed, '').replace(/<body[^>]*>/, body => body + seed);
      }
    },
    generateBundle() {
      const packages = ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei', 'lucide-react', '@fontsource-variable/public-sans', 'three-stdlib'];
      for (const pkg of packages) {
        const root = new URL(`./node_modules/${pkg}/`, import.meta.url);
        let text: string | undefined;
        for (const file of ['LICENSE', 'LICENSE.md', 'LICENSE.txt']) {
          try { text = readFileSync(new URL(file, root), 'utf8'); break; } catch { /* Try the next conventional license filename. */ }
        }
        if (!text && pkg === '@react-three/fiber') text = readFileSync(new URL('./dependency-metadata/licenses/react-three-fiber-LICENSE.txt', import.meta.url), 'utf8');
        if (!text) throw new Error(`Missing installed license: ${pkg}`);
        this.emitFile({ type: 'asset', fileName: `licenses/${pkg.replaceAll('/', '-')}.txt`, source: text });
      }
    }
  }, bundleNotices(fileURLToPath(new URL('.', import.meta.url)))],
  build: { target: 'es2022', assetsInlineLimit: 0 },
  server: { host: '127.0.0.1' }
});
