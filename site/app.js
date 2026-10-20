'use strict';
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu');
function closeMenu() { menu.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); }
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});
matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);
const { services: serviceDetails, projects: projectDetails, event: featuredEvent } = window.ROSS_CONTENT;
const dialog = document.querySelector('#detail-dialog');
let selectedService = '';
function safeExternalUrl(value, hosts) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && hosts.includes(url.hostname) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
function showDetail(detail, label, service = '') {
  if (!detail || dialog.open) return;
  selectedService = service;
  document.querySelector('#detail-label').textContent = label;
  document.querySelector('#detail-title').textContent = detail.title;
  document.querySelector('#detail-copy').textContent = detail.copy;
  const list = document.querySelector('#detail-items');
  list.replaceChildren();
  detail.items.forEach(text => { const li = document.createElement('li'); li.textContent = text; list.append(li); });
  list.hidden = detail.items.length === 0;
  document.querySelector('#detail-note').textContent = detail.note || 'Propuesta de contenido: categorías y servicios específicos por validar con ROSS.';
  const cta = document.querySelector('#detail-cta');
  cta.firstChild.textContent = detail.cta?.label || 'Hablemos de esta idea ';
  const ticketUrl = safeExternalUrl(detail.cta?.url, ['www.passline.com']);
  cta.href = ticketUrl || '#cotiza';
  cta.target = ticketUrl ? '_blank' : '_self';
  cta.rel = ticketUrl ? 'noopener noreferrer' : '';
  const source = document.querySelector('#detail-source');
  const sourceUrl = safeExternalUrl(detail.source, ['www.instagram.com']);
  source.href = sourceUrl || '#cotiza';
  source.hidden = !sourceUrl;
  dialog.showModal();
}
document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => showDetail(serviceDetails[button.dataset.service], 'EXPERIENCIAS / ROSS', button.dataset.service)));
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => showDetail(projectDetails[button.dataset.project], 'NUESTRO TRABAJO / CONTEXTO PUBLICADO')));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
document.querySelector('#detail-cta').addEventListener('click', () => { if (selectedService) document.querySelector('[name="tipo"]').value = selectedService; dialog.close(); });
const filters = document.querySelectorAll('[data-filter]');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(filter => { const active = filter === button; filter.classList.toggle('active', active); filter.setAttribute('aria-pressed', String(active)); });
  document.querySelectorAll('[data-category]').forEach(project => { project.hidden = button.dataset.filter !== 'todos' && project.dataset.category !== button.dataset.filter; });
}));
const quoteForm = document.querySelector('#quote-form');
const quoteLink = document.querySelector('#quote-whatsapp-link');
quoteForm.addEventListener('input', () => { quoteLink.hidden = true; quoteLink.href = 'https://wa.me/56920159948'; document.querySelector('#form-status').textContent = ''; });
quoteForm.addEventListener('submit', event => {
  event.preventDefault();
  const status = document.querySelector('#form-status');
  try {
    const url = window.ROSS_QUOTE.build(new FormData(quoteForm), window.ROSS_ATTRIBUTION.read(window.location.search));
    quoteLink.href = url;
    quoteLink.hidden = false;
    window.open(url, '_blank', 'noopener,noreferrer');
    status.textContent = 'Tu mensaje está preparado para WhatsApp. Revísalo y pulsa enviar allí. Si no se abrió, utiliza el enlace de arriba. La web no ha guardado ni enviado una solicitud.';
  } catch (error) {
    status.textContent = error.message;
  }
  status.focus();
});

// La agenda se retira al terminar el evento; el portafolio requiere revisión editorial.
const eventHasEnded = Date.now() >= Date.parse(featuredEvent.expiresAt);
if (eventHasEnded) {
  document.querySelector('#agenda').classList.add('agenda-expired');
  document.querySelector('#agenda-label').textContent = 'AGENDA / PRÓXIMOS ENCUENTROS';
  document.querySelector('#agenda-title').textContent = 'NUEVAS EXPERIENCIAS EN CAMINO';
  document.querySelector('#agenda-meta').hidden = true;
  document.querySelector('#agenda-empty').hidden = false;
  document.querySelector('.agenda-actions').hidden = true;
  document.querySelector('.agenda-location').hidden = true;
  document.querySelector('.agenda-date').hidden = true;
  document.querySelector('.agenda-poster').hidden = true;
  document.querySelector('.hero-agenda-link').hidden = true;
}
document.querySelector('#event-details').addEventListener('click', () => showDetail(featuredEvent, 'AGENDA / 24 OCTUBRE 2026'));

const filmPlay = document.querySelector('#film-play');
const film = document.querySelector('#ross-film');
filmPlay.addEventListener('click', async () => {
  film.src = film.dataset.src;
  film.hidden = false;
  filmPlay.hidden = true;
  document.querySelector('#film-status').textContent = 'Puedes pausar, ajustar el volumen o ampliar el video con sus controles.';
  film.focus();
  try { await film.play(); } catch {
    document.querySelector('#film-status').textContent = 'Pulsa reproducir en los controles del video para comenzar.';
  }
});
film.addEventListener('error', () => {
  document.querySelector('#film-status').textContent = 'No se pudo cargar el video. Comprueba tu conexión y vuelve a intentarlo.';
  film.removeAttribute('src');
  film.hidden = true;
  filmPlay.hidden = false;
});

// Movimiento por CSS: solo cuando hay contenido fuera de la franja visible.
const ticker = document.querySelector('.ticker');
const tickerWindow = ticker.querySelector('.ticker-window');
const tickerTrack = ticker.querySelector('.ticker-track');
const tickerToggle = ticker.querySelector('.ticker-toggle');
const tickerMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function sizeTicker() {
  const reduced = tickerMotion.matches;
  tickerToggle.hidden = true;
  const overflow = tickerTrack.scrollWidth > tickerWindow.clientWidth + 1;
  ticker.classList.toggle('is-moving', overflow && !reduced);
  tickerToggle.hidden = !overflow || reduced;
  const travel = Math.max(0, tickerTrack.scrollWidth - tickerWindow.clientWidth);
  ticker.style.setProperty('--ticker-travel', `${-travel}px`);
  ticker.style.setProperty('--ticker-duration', `${Math.max(12, travel / 26)}s`);
}
tickerToggle.addEventListener('click', () => {
  const paused = ticker.classList.toggle('is-paused');
  tickerToggle.setAttribute('aria-pressed', String(paused));
  tickerToggle.setAttribute('aria-label', paused ? 'Reanudar movimiento de actividades' : 'Pausar movimiento de actividades');
  tickerToggle.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
});
new ResizeObserver(sizeTicker).observe(tickerWindow);
tickerMotion.addEventListener('change', sizeTicker);
document.fonts.ready.then(sizeTicker);
sizeTicker();

const eventSlides = document.querySelector('.event-slides');
const eventFigures = [...eventSlides.querySelectorAll('.event-slide')];
const eventPrev = document.querySelector('.event-prev');
const eventNext = document.querySelector('.event-next');
const eventPosition = document.querySelector('.event-position');
const eventEnlarge = document.querySelector('.event-enlarge');
let eventIndex = 0;
function updateEventCarousel() {
  if (!eventSlides.clientWidth) return;
  eventIndex = Math.max(0, Math.min(eventFigures.length - 1, Math.round(eventSlides.scrollLeft / eventSlides.clientWidth)));
  eventPrev.disabled = eventIndex === 0;
  eventNext.disabled = eventIndex === eventFigures.length - 1;
  eventPosition.textContent = `${eventIndex + 1} / ${eventFigures.length}`;
  const image = eventFigures[eventIndex].querySelector('img');
  eventEnlarge.href = image.getAttribute('src').replace('-640.webp', '-1200.webp');
  eventEnlarge.setAttribute('aria-label', `Ampliar: ${eventFigures[eventIndex].querySelector('figcaption').textContent}`);
}
function moveEventCarousel(delta) {
  const next = Math.max(0, Math.min(eventFigures.length - 1, eventIndex + delta));
  eventSlides.scrollTo({left: next * eventSlides.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}
eventPrev.addEventListener('click', () => moveEventCarousel(-1));
eventNext.addEventListener('click', () => moveEventCarousel(1));
eventSlides.addEventListener('scroll', updateEventCarousel, {passive: true});
eventSlides.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); moveEventCarousel(event.key === 'ArrowRight' ? 1 : -1);
  }
});
new ResizeObserver(() => {
  if (!eventSlides.clientWidth) return;
  eventSlides.scrollTo({left:eventIndex * eventSlides.clientWidth, behavior:'instant'});
}).observe(eventSlides);
