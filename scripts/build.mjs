import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const target = new URL('../dist/', import.meta.url);
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(new URL('../site/', import.meta.url), target, { recursive: true });
const index = new URL('index.html', target);
let html = await readFile(index, 'utf8');
for (const asset of ['styles.css', 'content.js', 'app.js']) {
  const hash = createHash('sha256').update(await readFile(new URL(asset, target))).digest('hex').slice(0, 12);
  html = html.replaceAll(`"${asset}"`, `"${asset}?v=${hash}"`);
}
await writeFile(index, html);
console.log('Demo estática preparada en dist/ con recursos versionados. No contiene backend ni datos privados.');
