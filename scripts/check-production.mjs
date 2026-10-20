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
