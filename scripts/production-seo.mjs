// Preparación de archivos; no publica ni modifica DNS.
export function productionSeo(html) {
  const origin = 'https://rossagencia.cl';
  const title = 'ROSS AGENCIA | Producción de eventos y experiencias';
  const description = 'Producción de eventos, espectáculos y experiencias educativas y familiares en La Araucanía. Consulta tu próximo evento con ROSS AGENCIA.';
  const organization = {
    '@context':'https://schema.org', '@type':'Organization',
    name:'ROSS AGENCIA', url:origin+'/', logo:origin+'/assets/ross-logo-dark.webp',
    email:'contacto@rossagencia.cl', telephone:'+56920159948',
    sameAs:['https://www.instagram.com/rossagencia/','https://www.facebook.com/profile.php?id=61594998965992']
  };
  html = html.replace('<meta name="robots" content="noindex, nofollow">','<meta name="robots" content="index, follow">')
    .replace(/<title>[^<]*<\/title>/,`<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${description}">`)
    .replace('</head>',`<link rel="canonical" href="${origin}/">\n<meta property="og:type" content="website">\n<meta property="og:locale" content="es_CL">\n<meta property="og:site_name" content="ROSS AGENCIA">\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${description}">\n<meta property="og:url" content="${origin}/">\n<meta property="og:image" content="${origin}/assets/ross-hero-1600.webp">\n<meta property="og:image:alt" content="Público frente a un escenario iluminado">\n<meta name="twitter:card" content="summary_large_image">\n<script type="application/ld+json">${JSON.stringify(organization)}</script>\n</head>`);
  return {html, robots:`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`, sitemap:`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>\n`};
}
