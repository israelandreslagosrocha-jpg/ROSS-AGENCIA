import vm from 'node:vm';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('site');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const css = await readFile(path.join(root, 'styles.css'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
if (new Set(ids).size !== ids.length) throw new Error('Identificadores duplicados');
for (const match of html.matchAll(/href="#([^"]+)"/g)) if (!ids.includes(match[1])) throw new Error(`Ancla inexistente: ${match[1]}`);
const local = [...html.matchAll(/(?:href|src)="([^"#]+)"/g)].map(match => match[1]).filter(url => !url.includes(':'));
const fonts = [...css.matchAll(/url\('([^']+)'\)/g)].map(match => match[1]);
for (const file of new Set([...local, ...fonts])) await access(path.join(root, file));
if (!html.includes('noindex, nofollow') || !html.includes('no envía datos')) throw new Error('Falta identificación de demo');
console.log('Comprobados recursos locales, anclas, IDs y señalización de demo.');

const contentSource = await readFile(path.join(root, 'content.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(contentSource, context, { timeout: 1000 });
const content = context.window.ROSS_CONTENT;
for (const [attribute, group] of [['service', content.services], ['project', content.projects]]) {
  for (const match of html.matchAll(new RegExp(`data-${attribute}="([^\"]+)"`, 'g'))) {
    if (!group[match[1]]) throw new Error(`Ficha sin contenido: ${match[1]}`);
  }
}
if (!Number.isFinite(Date.parse(content.event.expiresAt))) throw new Error('Fecha de cierre inválida');
for (const detail of [...Object.values(content.services), ...Object.values(content.projects), content.event]) {
  const url = new URL(detail.source);
  if (url.protocol !== 'https:' || url.hostname !== 'www.instagram.com') throw new Error('Fuente editorial no válida');
}
const ticket = new URL(content.event.cta.url);
if (ticket.protocol !== 'https:' || ticket.hostname !== 'www.passline.com') throw new Error('Destino de entradas inválido');
console.log('Comprobadas fichas del catálogo, referencias y fecha de agenda.');
