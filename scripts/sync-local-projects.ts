import fs from 'fs';
import path from 'path';

// Cargar .env manualmente antes de importar módulos
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:dummy@localhost:5432/dummy';
}

import { scrapers } from '../lib/ingestion/registry';
import type { RawProject } from '../lib/ingestion/types';
import { getLogger } from '../lib/utils/logger';

const logger = getLogger('SyncLocalProjects');

interface LocalProject {
  id: number;
  nombre: string;
  institucion: string;
  monto: number;
  montoTexto?: string | null;
  fecha_cierre: string;
  estado: string;
  categoria: string;
  url_bases: string;
  regiones?: string[];
  beneficiarios?: string[];
  requiere_cofinanciamiento?: boolean;
  idioma?: string;
  faq_disponible?: boolean;
  permite_adendas?: boolean;
  bases_estado?: string;
  requiere_firma?: boolean;
  tipos_solicitante?: string[];
  checklist?: string[];
  ambito?: 'Nacional' | 'Internacional' | 'Regional';
  estadoPostulacion?: 'Abierta' | 'Próxima' | 'Cerrada';
  viabilidadIICA?: 'Alta' | 'Media' | 'Baja';
  porcentajeViabilidad?: number;
  objetivo?: string;
  descripcionIICA?: string;
  requisitos?: string[];
  fortalezas?: string[];
  debilidades?: string[];
  notasInternas?: string;
  ejeIICA?: string;
  complejidad?: 'Fácil' | 'Media' | 'Alta';
  rolIICA?: 'Ejecutor' | 'Implementador' | 'Asesor' | 'Indirecto';
  publishable?: boolean;
  relevanciaChile?: boolean;
  region?: string;
  updatedAt?: string;
}

const PROJECTS_FILE = path.join(__dirname, '..', 'data', 'projects.json');
const METADATA_FILE = path.join(__dirname, '..', 'data', 'metadata.json');

function cleanMojibake(text: string): string {
  if (!text) return text;
  return text
    .replace(/Mantenci[\uFFFD]n/gi, 'Mantención')
    .replace(/LAVANDER[\uFFFD]A/gi, 'LAVANDERÍA')
    .replace(/SUBSECRETAR[\uFFFD]A/gi, 'SUBSECRETARÍA')
    .replace(/MANTENCI[\uFFFD]N/gi, 'MANTENCIÓN')
    .replace(/Investigaci[\uFFFD]n/gi, 'Investigación')
    .replace(/Tecnol[\uFFFD]gico/gi, 'Tecnológico')
    .replace(/Agr[\uFFFD]cola/gi, 'Agrícola')
    .replace(/Innovaci[\uFFFD]n/gi, 'Innovación')
    .replace(/Gesti[\uFFFD]n/gi, 'Gestión')
    .replace(/Cooperaci[\uFFFD]n/gi, 'Cooperación')
    .replace(/Capacitaci[\uFFFD]n/gi, 'Capacitación')
    .replace(/Informaci[\uFFFD]n/gi, 'Información')
    .replace(/[\uFFFD]/g, '');
}

const NON_AGRO_KEYWORDS = [
  'aire acondicionado',
  'lavandería',
  'lavanderia',
  'aseo y mantención',
  'aseo y mantencion',
  'aseo de oficina',
  'servicio de café',
  'arriendo de inmueble',
];

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    u.hash = '';
    return u.toString().replace(/\/+$/, '').toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

async function main() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  console.log(`[Sync] Iniciando actualización local de proyectos al ${todayStr}...`);

  // 1. Cargar proyectos existentes
  let existingProjects: LocalProject[] = [];
  if (fs.existsSync(PROJECTS_FILE)) {
    existingProjects = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
    console.log(`[Sync] ${existingProjects.length} proyectos cargados desde data/projects.json`);
  }

  // Mapa de proyectos existentes por URL normalizada y por nombre aproximado
  const projectByUrl = new Map<string, LocalProject>();
  let maxId = 1000;

  for (const p of existingProjects) {
    if (p.id && p.id > maxId) maxId = p.id;
    if (p.url_bases) {
      projectByUrl.set(normalizeUrl(p.url_bases), p);
    }
  }

  // 2. Correr scrapers disponibles
  const rawScrapedProjects: { scraperSlug: string; project: RawProject }[] = [];
  console.log(`[Sync] Ejecutando scrapers determinísticos (${scrapers.length} registrados)...`);

  for (const scraper of scrapers) {
    try {
      console.log(`  -> Ejecutando scraper: ${scraper.slug}...`);
      // Timeout defensivo de 15 segundos por scraper
      const scrapePromise = scraper.scrape();
      const timeoutPromise = new Promise<{ projects: RawProject[]; partialErrors: string[] }>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout de 15s excedido')), 15000)
      );

      const result = await Promise.race([scrapePromise, timeoutPromise]);
      console.log(`     ✓ ${scraper.slug}: ${result.projects.length} convocatorias encontradas`);
      for (const p of result.projects) {
        rawScrapedProjects.push({ scraperSlug: scraper.slug, project: p });
      }
    } catch (err) {
      console.warn(`     ✗ ${scraper.slug} falló: ${(err as Error).message}`);
    }
  }

  console.log(`[Sync] Total de convocatorias extraídas en vivo: ${rawScrapedProjects.length}`);

  // 3. Fusionar convocatorias extraídas con el catálogo existente
  let insertedCount = 0;
  let updatedCount = 0;

  for (const { scraperSlug, project: raw } of rawScrapedProjects) {
    if (!raw.title || !raw.url) continue;

    const normUrl = normalizeUrl(raw.url);
    const existing = projectByUrl.get(normUrl);

    const deadlineStr = raw.deadline
      ? raw.deadline.toISOString().split('T')[0]
      : '2099-12-31';

    const isOpen = deadlineStr >= todayStr || deadlineStr.startsWith('2099');
    const cleanedTitle = cleanMojibake(raw.title.trim());
    const cleanedDesc = cleanMojibake(raw.description || '');

    const isJunk = NON_AGRO_KEYWORDS.some(kw => 
      cleanedTitle.toLowerCase().includes(kw) || cleanedDesc.toLowerCase().includes(kw)
    );

    if (existing) {
      // Actualizar datos
      existing.nombre = cleanMojibake(existing.nombre);
      existing.fecha_cierre = deadlineStr;
      existing.estado = isOpen ? 'Abierto' : 'Cerrado';
      existing.estadoPostulacion = isOpen ? 'Abierta' : 'Cerrada';
      if (raw.description && (!existing.objetivo || existing.objetivo.length < 50)) {
        existing.objetivo = cleanedDesc;
      }
      if (isJunk) {
        existing.publishable = false;
        existing.relevanciaChile = false;
      }
      existing.updatedAt = now.toISOString();
      updatedCount++;
    } else {
      if (isJunk) continue; // Descartar licitaciones irrelevantes nuevas
      // Crear nuevo proyecto
      maxId++;
      const newProj: LocalProject = {
        id: maxId,
        nombre: cleanedTitle,
        institucion: cleanMojibake(raw.institution || scraperSlug.toUpperCase()),
        monto: 0,
        montoTexto: raw.budget || 'Ver bases',
        fecha_cierre: deadlineStr,
        estado: isOpen ? 'Abierto' : 'Cerrado',
        estadoPostulacion: isOpen ? 'Abierta' : 'Cerrada',
        categoria: raw.opportunityType === 'Licitacion' ? 'Licitaciones / Procurement' : 'Fondos Concursables',
        url_bases: raw.url.trim(),
        regiones: raw.region ? [raw.region] : ['Nacional'],
        beneficiarios: ['Agricultores', 'Empresas Agrícolas', 'Organizaciones'],
        requiere_cofinanciamiento: false,
        idioma: raw.idioma || 'es',
        faq_disponible: false,
        permite_adendas: false,
        bases_estado: 'published',
        requiere_firma: false,
        tipos_solicitante: ['Persona Natural', 'Persona Jurídica'],
        checklist: [],
        ambito: raw.ambito || 'Nacional',
        viabilidadIICA: 'Media',
        porcentajeViabilidad: 75,
        objetivo: cleanedDesc || `Convocatoria oficial publicada por ${raw.institution || scraperSlug}.`,
        descripcionIICA: `Oportunidad identificada automáticamente por el monitor de fondos IICA Chile.`,
        requisitos: ['Cumplir con las bases oficiales publicadas en el sitio web de la institución convocante.'],
        fortalezas: ['Alineación con prioridades del sector silvoagropecuario chileno.'],
        debilidades: [],
        complejidad: 'Media',
        rolIICA: 'Asesor',
        publishable: true,
        relevanciaChile: raw.relevanciaChile !== false,
        region: raw.region || 'Nacional',
        updatedAt: now.toISOString(),
      };

      existingProjects.push(newProj);
      projectByUrl.set(normUrl, newProj);
      insertedCount++;
    }
  }

  // 4. Actualizar estados de convocatorias permanentes y verificar vencimientos
  for (const p of existingProjects) {
    p.nombre = cleanMojibake(p.nombre);
    if (p.objetivo) p.objetivo = cleanMojibake(p.objetivo);
    // Si la fecha de cierre es 2099 o sin fecha, mantener abierta
    if (!p.fecha_cierre || p.fecha_cierre.startsWith('2099')) {
      p.estadoPostulacion = 'Abierta';
      p.estado = 'Abierto';
    } else if (p.fecha_cierre < todayStr) {
      // Si ya pasó la fecha, marcar cerrada
      p.estadoPostulacion = 'Cerrada';
      p.estado = 'Cerrado';
    } else {
      p.estadoPostulacion = 'Abierta';
      p.estado = 'Abierto';
    }
  }

  // 5. Guardar projects.json
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(existingProjects, null, 2), 'utf-8');
  console.log(`[Sync] Guardado data/projects.json: ${existingProjects.length} proyectos (${insertedCount} nuevos, ${updatedCount} actualizados)`);

  // 6. Guardar metadata.json con timestamp
  const activeProjects = existingProjects.filter(p => 
    p.publishable !== false && 
    p.relevanciaChile !== false && 
    p.estadoPostulacion === 'Abierta'
  ).length;

  const metadata = {
    lastUpdatedAt: now.toISOString(),
    totalProjects: existingProjects.length,
    activeProjects,
  };
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`[Sync] Guardado data/metadata.json: Actualizado ${metadata.lastUpdatedAt} (${metadata.activeProjects} activas)`);
}

main().catch(err => {
  console.error('[Sync] Error crítico:', err);
  process.exit(1);
});
