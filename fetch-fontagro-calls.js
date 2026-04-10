// fetch-fontagro-calls.js
// Script para extraer todas las convocatorias vigentes e históricas de FONTAGRO directamente desde el sitio oficial
// Genera un archivo JSON normalizado listo para ingestión/backend
// Requiere: npm install axios cheerio

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE = 'https://www.fontagro.org';
const INDEX_URL = BASE + '/es/iniciativas/convocatorias';

// Extrae todos los links de convocatorias desde la paginación
async function getAllCallLinks() {
  let page = 1;
  let allLinks = [];
  let continuePaging = true;
  while (continuePaging) {
    const url = page === 1 ? INDEX_URL : INDEX_URL + `?page=${page}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const links = [];
    $("a").each((_, elem) => {
      const href = $(elem).attr("href");
      if (href && href.startsWith("/es/iniciativas/convocatorias/convocatoria-")) {
        links.push(BASE + href);
      }
    });
    // Remueve duplicados y links de paginación
    const filtered = [...new Set(links)];
    allLinks.push(...filtered.filter(l=>!allLinks.includes(l)));
    // Detecta si hay otra página
    if (data.includes(`?page=${page+1}`)) {
      page++;
    } else {
      continuePaging = false;
    }
  }
  return allLinks;
}

// Dada la URL de una convocatoria, retorna un objeto normalizado
async function parseCall(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  // Título principal
  const titulo = $('h1').first().text().trim();
  // Resumen: el primer párrafo después del h1
  let resumen = $('h1').first().next('p').text().trim();
  if (!resumen) {
    // fallback: busca primer <p> después del h1
    resumen = $('p').eq(0).text().trim();
  }
  // Fechas (busca texto y bold)
  let fecha_apertura = '';
  let fecha_cierre = '';
  $('li').each((_, el) => {
    const txt = $(el).text();
    if (/Apertura|Anuncio/i.test(txt)) fecha_apertura = txt.replace(/^(Apertura|Anuncio).*?:?\s*/i, '').trim();
    if (/Fecha límite|cierre/i.test(txt)) fecha_cierre = txt.replace(/^.*(Fecha límite|cierre).*?:?\s*/i, '').trim();
  });
  // Links a PDF/Word del llamado (bases)
  let links_docs = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && /(pdf|docx|xlsx)$/i.test(href)) {
      links_docs.push(href.startsWith('http') ? href : BASE + href);
    }
  });
  // Busca monto en texto de la página o en links
  let monto = '';
  const bodyText = $('body').text();
  const matchMonto = bodyText.match(/\$?([0-9][0-9\.\,]{5,})/);
  if (matchMonto) monto = matchMonto[0];
  // Generación del objeto normalizado
  return {
    titulo,
    agencia: 'FONTAGRO',
    categoria: '', // FONTAGRO no publica "categoría" explícita
    monto,
    fecha_apertura,
    fecha_cierre,
    link: url,
    resumen,
    tags: [], // opcional: se puede extraer del contexto, programas, etc.
    paises: [], // N/A en la página, podría sumarse si aparece
    fuente: 'FONTAGRO',
    links_docs
  };
}

(async function main() {
  try {
    console.log('Buscando convocatorias...');
    const links = await getAllCallLinks();
    console.log(`Encontradas ${links.length} convocatorias.`);
    const results = [];
    for (const url of links) {
      console.log(`Procesando: ${url}`);
      const obj = await parseCall(url);
      results.push(obj);
      // Pausa breve por si hay throttling
      await new Promise(res => setTimeout(res, 300));
    }
    fs.writeFileSync('fontagro_convocatorias.json', JSON.stringify(results, null, 2), 'utf-8');
    console.log('¡Listo! Archivo generado: fontagro_convocatorias.json');
  } catch (e) {
    console.error('Error principal:', e);
  }
})();

// Uso: node fetch-fontagro-calls.js
// Crea fontagro_convocatorias.json en el directorio actual
// Dependencias: npm install axios cheerio
