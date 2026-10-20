'use strict';
// Solo prepara el mensaje localmente; no guarda ni envía solicitudes.
window.ROSS_QUOTE = Object.freeze({
  build(values, attribution = {}) {
    const clean = (name, max) => String(values.get(name) || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
    const types = { corporativos: 'Empresa o institución', infantiles: 'Infantil o familiar', educacion: 'Experiencia educativa / Look Terra', espectaculos: 'Show o espectáculo', otro: 'Quiero explorar una idea' };
    const name = clean('nombre', 80), type = types[clean('tipo', 30)], message = clean('mensaje', 1500);
    if (!name || !type || !message) throw new Error('Completa tu nombre, tipo de evento y mensaje.');
    const lines = ['Hola ROSS, quiero cotizar un evento.', `Nombre: ${name}`, `Tipo de evento: ${type}`];
    const date = clean('fecha', 10), city = clean('ciudad', 80);
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) lines.push(`Fecha estimada: ${date}`);
    if (city) lines.push(`Ciudad o comuna: ${city}`);
    lines.push(`Mi idea: ${message}`);
    const campaign = Object.entries(attribution).filter(([key, value]) =>
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].includes(key) &&
      typeof value === 'string' && value.length <= 80 && /^[a-zA-Z0-9_. -]+$/.test(value) && !/\d{9,}/.test(value)
    );
    if (campaign.length) lines.push('Referencia de campaña del enlace:', ...campaign.map(([key, value]) => `${key}: ${value}`));
    const url = new URL('https://wa.me/56920159948');
    url.searchParams.set('text', lines.join('\n'));
    return url.href;
  }
});
