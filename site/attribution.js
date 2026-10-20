'use strict';
// Etiquetas observables del enlace actual, sin cookies ni persistencia.
window.ROSS_ATTRIBUTION = Object.freeze({
  read(search) {
    const params = new URLSearchParams(search);
    const tags = {};
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const value = params.get(key) || '';
      if (value.length > 0 && value.length <= 80 && /^[a-zA-Z0-9_. -]+$/.test(value) && !/\d{9,}/.test(value)) tags[key] = value;
    }
    return tags;
  }
});
const campaignTags = window.ROSS_ATTRIBUTION.read(window.location.search);
if (Object.keys(campaignTags).length) {
  document.querySelectorAll('a[href]').forEach(link => {
    const raw = link.getAttribute('href');
    if (!raw || raw.startsWith('#')) return;
    const url = new URL(raw, window.location.href);
    if (url.protocol === 'https:' && url.hostname === 'wa.me' && url.pathname === '/56920159948' && link.id !== 'quote-whatsapp-link') {
      const reference = Object.entries(campaignTags).map(([key, value]) => `${key}: ${value}`).join('\n');
      url.searchParams.set('text', `${url.searchParams.get('text') || 'Hola ROSS, quisiera consultar sobre un evento.'}\nReferencia de campaña del enlace:\n${reference}`);
      link.href = url.href;
      return;
    }
    if (url.origin !== window.location.origin || !/\/(?:[^/]+\.html)?$/.test(url.pathname) || url.pathname.endsWith('/privacidad.html')) return;
    for (const [key, value] of Object.entries(campaignTags)) if (!url.searchParams.has(key)) url.searchParams.set(key, value);
    link.href = url.href;
  });
}
