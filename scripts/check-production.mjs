import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const html = await readFile('dist-production/index.html','utf8');
assert.ok(html.includes('rel="canonical" href="https://rossagencia.cl/"'));
assert.ok(html.includes('name="robots" content="index, follow"'));
assert.ok(!html.includes('noindex'));
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
assert.equal(schema.name, 'ROSS AGENCIA');
assert.equal(schema['@type'],'Organization');
assert.ok(!JSON.stringify(schema).includes('legalName'));
assert.ok((await readFile('dist-production/robots.txt','utf8')).includes('Sitemap: https://rossagencia.cl/sitemap.xml'));
assert.ok((await readFile('dist-production/sitemap.xml','utf8')).includes('<loc>https://rossagencia.cl/</loc>'));
// La preparación de producción no debe abrir el preview a indexación.
assert.ok((await readFile('site/index.html','utf8')).includes('noindex, nofollow'));
console.log('SEO de paquete oficial comprobado; preview sigue sin indexación. No hay despliegue a dominio.');
const {readdir,access} = await import('node:fs/promises');
const pages=(await readdir('site')).filter(file=>file.endsWith('.html'));
assert.ok(pages.length<=10);
const titles=new Set();
const sitemap=await readFile('dist-production/sitemap.xml','utf8');
for(const page of pages){
 const source=await readFile('site/'+page,'utf8');
 const built=await readFile('dist-production/'+page,'utf8');
 const title=source.match(/<title>([^<]+)<\/title>/)[1];
 assert.ok(!titles.has(title),'Título repetido: '+page); titles.add(title);
 for(const match of source.matchAll(/(?:href|src)="([^"#]+)"/g)){
  const url=match[1];
  if(!url.includes(':')) await access('site/'+url.split('#')[0]);
 }
 if(page!=='privacidad.html'){
  const url='https://rossagencia.cl'+(page==='index.html'?'/':'/'+page);
  assert.ok(source.includes('noindex, nofollow'));
  assert.ok(built.includes(`rel="canonical" href="${url}"`));
  assert.ok(sitemap.includes(`<loc>${url}</loc>`));
 }else assert.ok(built.includes('noindex, follow'));
 assert.ok(!/\son\w+\s*=/i.test(source));
 assert.ok(!/\b(?:api[_-]?key|password|secret)\s*[:=]/i.test(source));
}
assert.equal((sitemap.match(/<loc>/g)||[]).length,pages.length-1);
console.log(`${pages.length} páginas: límite, títulos únicos, recursos locales, canonical, sitemap y noindex de preview comprobados.`);
for(const page of pages){
 const source=await readFile('site/'+page,'utf8');
 for(const link of source.matchAll(/href="([^"#:]*)#([^"]+)"/g)){
  const target=await readFile('site/'+(link[1]||page),'utf8');
  assert.ok(target.includes(`id="${link[2]}"`),'Ancla inexistente en '+page+': '+link[0]);
 }
}
console.log('Anclas entre páginas comprobadas.');
