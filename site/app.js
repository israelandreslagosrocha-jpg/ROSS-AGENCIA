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
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
const { services: serviceDetails, projects: projectDetails, event: featuredEvent } = window.ROSS_CONTENT;
const dialog = document.querySelector('#detail-dialog');
let selectedService = '';
function showDetail(detail, label, service = '') {
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
  cta.href = detail.cta?.url || '#cotiza';
  cta.target = detail.cta ? '_blank' : '_self';
  cta.rel = detail.cta ? 'noopener noreferrer' : '';
  const source = document.querySelector('#detail-source');
  source.href = detail.source;
  source.hidden = !detail.source;
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
document.querySelector('#quote-form').addEventListener('submit', event => {
  event.preventDefault();
  const status = document.querySelector('#form-status');
  status.textContent = 'Recorrido de demostración completado. No se ha enviado ni guardado una cotización. La conexión de contacto se habilitará en la versión funcional.';
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
}
document.querySelector('#event-details').addEventListener('click', () => showDetail(featuredEvent, 'AGENDA / 24 OCTUBRE 2026'));
