import vm from 'node:vm';
import { readFile, access, stat } from 'node:fs/promises';
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
if (!html.includes('noindex, nofollow') || !html.includes('Este formulario no guarda solicitudes en la web')) throw new Error('Falta identificación de demo');
console.log('Comprobados recursos locales, anclas, IDs y señalización de preview y cotización.');

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

// Invariantes de seguridad de esta demo estática, sin backend ni conexiones.
const policy = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1];
for (const directive of ["default-src 'none'", "script-src 'self'", "connect-src 'none'", "form-action 'none'", "base-uri 'none'", "object-src 'none'"]) {
  if (!policy?.split(';').map(value => value.trim()).includes(directive)) throw new Error(`CSP incompleta: ${directive}`);
}
if (/\son\w+\s*=/i.test(html) || /<script\b(?![^>]*\bsrc=)[^>]*>/i.test(html)) throw new Error('Código inline no permitido');
if (!/<form\b[^>]*method="post"/.test(html)) throw new Error('El formulario demo no debe usar GET');
for (const tag of html.matchAll(/<a\b[^>]*>/g)) {
  if (/target="_blank"/.test(tag[0]) && !/rel="noopener noreferrer"/.test(tag[0])) throw new Error('Enlace externo sin aislamiento');
}
for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
  if (/^(?:javascript|data|http):/i.test(match[1])) throw new Error('Recurso o enlace inseguro');
}
const appSource = await readFile(path.join(root, 'app.js'), 'utf8');
if (/\.innerHTML\s*=|\beval\s*\(|document\.write\s*\(/.test(appSource)) throw new Error('Inserción ejecutable no permitida');
console.log('Comprobados CSP de demo, formulario sin GET, aislamiento de enlaces y ausencia de inserciones HTML ejecutables.');

const videoTag = html.match(/<video\b[^>]*>/)?.[0];
if (!videoTag || /\ssrc=|\sautoplay(?:\s|>|=)/.test(videoTag) || !videoTag.includes('preload="none"')) throw new Error('El video debe cargar bajo demanda, sin autoplay');
if (!policy.includes("media-src 'self'")) throw new Error('Falta política de medios locales');
if ((await stat(path.join(root, 'assets/ross-eventos-video.mp4'))).size > 20_000_000) throw new Error('Video supera presupuesto de 20 MB');
for (const image of ['ross-campanas.webp', 'ross-eventos.webp', 'ross-instagram.webp', 'ross-musica.webp']) {
  if ((await stat(path.join(root, 'assets', image))).size > 400_000) throw new Error(`Imagen supera presupuesto: ${image}`);
}
console.log('Comprobados carga de video bajo demanda y presupuestos de medios.');
