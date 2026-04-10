// fetch-gef-calls.js
// Script to extract all projects/funding calls from the GEF official database (https://www.thegef.org/projects-operations/database)
// Downloads and normalizes the CSV export to JSON for backend ingestion
// Requires: npm install axios csv-parse

const axios = require('axios');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

// Direct CSV URL
const CSV_URL = 'https://www.thegef.org/projects-operations/database/export?page&_format=csv';

// Map CSV headers to normalized output
function normalizeGef(row) {
  return {
    titulo: row['Title'] || '',
    agencia: row['Agencies'] || '',
    categoria: row['Focal Areas'] || '',
    monto: row['GEF Grant'] || '',
    fecha_apertura: row['Approval Date'] || '',
    fecha_cierre: '', // Not provided in GEF CSV
    link: row['Project Link'] || '',
    resumen: '', // Not present in export (could be enriched programmatically if needed)
    tags: (row['Type'] ? [row['Type']] : []),
    paises: (row['Countries'] ? row['Countries'].split(',').map(x => x.trim()) : []),
    fuente: 'GEF',
    links_docs: [] // Optionally scrapable per-row from GEF (not present in CSV)
  };
}

async function fetchAndConvertGefCSV() {
  const { data } = await axios.get(CSV_URL, { responseType: 'arraybuffer' });
  // Decode UTF-8 for CSV
  const csvText = data.toString('utf8');
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  });
  
  // GEF site doesn't give a direct link for Project; reconstruct from id
  const withLinks = records.map(row => {
    if (!row['Project Link'] && row['ID']) {
      row['Project Link'] = `https://www.thegef.org/projects-operations/projects/${row['ID'].trim()}`;
    }
    return row;
  });

  const normalized = withLinks.map(normalizeGef);
  fs.writeFileSync('gef_projects.json', JSON.stringify(normalized, null, 2), 'utf8');
  console.log(`Listo: gef_projects.json generado con ${normalized.length} proyectos/llamados de GEF.`);
}

// Run main if invoked directly
if (require.main === module) {
  fetchAndConvertGefCSV().catch(e => {
    console.error('Error principal:', e);
  });
}

// Uso: node fetch-gef-calls.js
// Crea gef_projects.json en el directorio actual
// Dependencias: npm install axios csv-parse
