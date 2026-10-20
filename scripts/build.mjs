import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { productionSeo } from './production-seo.mjs';
const production = process.argv.includes('--production');
const target = new URL(production ? '../dist-production/' : '../dist/', import.meta.url);
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(new URL('../site/', import.meta.url), target, { recursive: true });
const index = new URL('index.html', target);
let html = await readFile(index, 'utf8');
for (const asset of ['styles.css', 'content.js', 'quote.js', 'app.js']) {
  const hash = createHash('sha256').update(await readFile(new URL(asset, target))).digest('hex').slice(0, 12);
  html = html.replaceAll(`"${asset}"`, `"${asset}?v=${hash}"`);
}
if (production) {
  const prepared = productionSeo(html);
  html = prepared.html;
  await writeFile(new URL('robots.txt', target), prepared.robots);
  await writeFile(new URL('sitemap.xml', target), prepared.sitemap);
}
await writeFile(index, html);
console.log(production ? 'Paquete de producción preparado en dist-production/. Requiere cierre editorial, QA y autorización antes de publicar.' : 'Preview preparada en dist/ con recursos versionados y noindex.');
