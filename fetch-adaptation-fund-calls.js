// fetch-adaptation-fund-calls.js
// Script para extraer y normalizar todas las oportunidades/proyectos del Fondo de Adaptación (Adaptation Fund)
// Fuente CSV directa: https://www.adaptation-fund.org/projects-programmes/project-information/projects-table-view/ (Download .csv)
// Dependencias: npm install axios csv-parse

const axios = require('axios');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

// URL oficial de descarga CSV
const AF_CSV_URL = 'https://www.adaptation-fund.org/wp-content/uploads/2026/01/Projects-Table-Export.csv'; // Actualiza el año/path si cambia (ver botón en la web oficial)

// Normalizador institucional compatible (similar a FONTAGRO/GEF)
function normalizeAF(row) {
  return {
    titulo: row['Project Title'] || '',
    agencia: row['Implementing Entity'] || '',
    categoria: row['Sector'] || '',
    monto: row['Grant Amount (US$)'] || '',
    fecha_apertura: row['Approval Date'] || '',
    fecha_cierre: '', // En el CSV no viene por defecto, se puede enriquecer en otra pasada
    link: row['Project/Programme Proposal'] || '', // Si hay campo de link o Proposal
    resumen: row['Brief Description'] || '', // Si existe, si no ''
    tags: row['Status'] ? [row['Status']] : [],
    paises: row['Country'] ? row['Country'].split(',').map(x=>x.trim()) : [],
    fuente: 'Fondo de Adaptación',
    links_docs: []
  };
}

async function fetchAndConvertAFCSV() {
  const { data } = await axios.get(AF_CSV_URL, { responseType: 'arraybuffer' });
  const csvText = data.toString('utf8');
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  });
  const normalized = records.map(normalizeAF);
  fs.writeFileSync('adaptation_fund_projects.json', JSON.stringify(normalized, null, 2), 'utf8');
  console.log(`Listo: adaptation_fund_projects.json generado con ${normalized.length} proyectos del Fondo de Adaptación.`);
}

if (require.main === module) {
  fetchAndConvertAFCSV().catch(e => {
    console.error('Error principal:', e);
  });
}

// Uso: node fetch-adaptation-fund-calls.js
