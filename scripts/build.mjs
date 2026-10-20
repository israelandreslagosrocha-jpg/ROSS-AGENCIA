import { cp, mkdir, rm, readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { productionSeo } from './production-seo.mjs';
const production = process.argv.includes('--production');
const target = new URL(production ? '../dist-production/' : '../dist/', import.meta.url);
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(new URL('../site/', import.meta.url), target, { recursive: true });
const files = (await readdir(target)).filter(file => file.endsWith('.html'));
const hashes = {};
for (const asset of ['styles.css', 'content.js', 'quote.js', 'app.js']) {
 hashes[asset] = createHash('sha256').update(await readFile(new URL(asset,target))).digest('hex').slice(0,12);
}
const urls=[];
for (const file of files) {
 let html=await readFile(new URL(file,target),'utf8');
 for(const [asset,hash] of Object.entries(hashes)) html=html.replaceAll(`"${asset}"`, `"${asset}?v=${hash}"`);
 if(production && file !== 'privacidad.html') {
  html=productionSeo(html,file).html;
  urls.push('https://rossagencia.cl'+(file === 'index.html' ? '/' : '/'+file));
 }
 await writeFile(new URL(file,target),html);
}
if(production) {
 await writeFile(new URL('CNAME',target),'rossagencia.cl\n');
 await writeFile(new URL('robots.txt',target),productionSeo('').robots);
 await writeFile(new URL('sitemap.xml',target),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(url=>`<url><loc>${url}</loc></url>`).join('')+'</urlset>');
}
console.log(production ? 'Paquete oficial preparado; pendiente de cierre editorial, QA y autorización.' : 'Preview preparada con noindex y recursos versionados.');
