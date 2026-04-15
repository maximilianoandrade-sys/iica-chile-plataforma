-- ============================================================
-- IICA Chile Plataforma — Carga inicial de proyectos (SEED)
-- Pegar este SQL en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

INSERT INTO "Project" (
  "id", "nombre", "institucion", "monto", "fecha_cierre", "estado", "categoria", "url_bases", 
  "regiones", "beneficiarios", "monto_min", "monto_max", "plazo_meses", "requiere_cofinanciamiento", 
  "ambito", "estadoPostulacion", "viabilidadIICA", "porcentajeViabilidad", "responsableIICA", 
  "region", "rolIICA", "objetivo", "descripcionIICA", "requisitos", "fortalezas", "debilidades", 
  "notasInternas", "ejeIICA", "complejidad"
) VALUES 
(
  101, 'FONTAGRO – Convocatoria 2026: Cooperación e Innovación para Sistemas Agroalimentarios ALC', 'FONTAGRO', 245000000, '2026-04-20T23:59:59Z', 'Abierto', 'Internacional', 'https://plataforma.fontagro.org/login', 
  '{"Todas"}', '{"Institución pública","Centro de investigación","Universidad"}', 100000000, 245000000, 36, false, 
  'Internacional', 'Abierta', 'Alta', 95, 'Carlos Guajardo', 
  'América Latina y el Caribe', 'Ejecutor', 'Co-liderar consorcio regional ALC de I+D+i que promueva productividad y menor huella ambiental en sistemas agroalimentarios', 'IICA es co-administrador de FONTAGRO junto al BID. El IICA Chile puede liderar o co-liderar consorcios regionales. Contacto directo: fontagro@iica.int. Webinar de presentación disponible en YouTube: https://www.youtube.com/live/sPBkSd5z9JE', 
  '{"Consorcio mínimo 2 países ALC","Alineación con Programas Insignia FONTAGRO 2025-2030 (1-5)","Envío final Word + Excel antes del 20/04/2026 · 15:00 ET","Email de confirmación a fontagro@iica.int"}', 
  '{"IICA es co-administrador de FONTAGRO con BID","Presencia en 34 países garantiza requisito multinacional","Red de investigación regional consolidada","Convocatoria activa verificada (cierre 20 abril 2026)"}', 
  '{"Alta competencia regional de instituciones de investigación","Requiere preparación de propuesta en Word+Excel (8 semanas)"}', 
  'FECHA CORREGIDA 11/03/2026: Cierre real es 20 ABRIL 2026 15:00 ET Washington D.C. (verificado en fontagro.org, developmentaid.org, re-cid.org). El 30 marzo era incorrecto. Presupuesto total USD 1.25M hasta 5 proyectos. IICA co-administrador. QUEDAN 40 DIAS desde hoy.', 'Innovación para la productividad', 'Alta'
),
(
  102, 'FAO TCP/RLA – Programa de Cooperación Técnica para Resiliencia Climática Chile 2026', 'FAO', 150000000, '2026-05-31T23:59:59Z', 'Abierto', 'Internacional', 'https://www.fao.org/technical-cooperation-programme/tcp-guidelines/es/', 
  '{"Coquimbo","Atacama","Maule","O''Higgins"}', '{"Institución pública","MINAGRI","SAG"}', 50000000, 150000000, 24, false, 
  'Internacional', 'Abierta', 'Alta', 85, 'Ana Lía Gutiérrez', 
  'Zona Centro-Norte Chile', 'Implementador', 'Ejecutar programa de adaptación climática en zonas áridas de Chile como implementador técnico FAO', 'El IICA Chile participaría como implementador técnico del TCP, diseñando e implementando estrategias de resiliencia climática para pequeños agricultores de zonas áridas. Tenemos experiencia comprobada en estas regiones.', 
  '{"Acuerdo entre Gobierno de Chile y FAO","Contrapartes técnicas nacionales (SAG, INDAP)","Marco lógico aprobado por FAO Roma"}', 
  '{"Relación establecida con FAO Chile","Experiencia en zonas áridas","Red de técnicos regionales disponibles"}', 
  '{"Proceso de aprobación en FAO Roma puede demorar 3-6 meses","Depende de voluntad política del MINAGRI"}', 
  'Gestionar reunión con Rodrigo Castillo (FAO Chile) para explorar roles. Hay TCP pendiente de aprobación para región de Coquimbo.', 'Bioeconomía y cambio climático', 'Media'
),
(
  112, 'FAO TCP/RLA – Fortalecimiento de Sistemas de Información Agrícola para la Seguridad Alimentaria', 'FAO', 95000000, '2026-05-20T23:59:59Z', 'Abierto', 'Internacional', 'https://www.fao.org/technical-cooperation-programme/tcp-guidelines/es/', 
  '{"Todas"}', '{"MINAGRI","INE","Institución pública estadística"}', 50000000, 95000000, 18, false, 
  'Internacional', 'Abierta', 'Media', 72, 'Patricia Villareal', 
  'Nacional', 'Implementador', 'Modernizar sistemas de recolección de estadísticas agrícolas en Chile mediante asistencia técnica FAO-IICA', 'El IICA aportaría expertos en ciencia de datos y estadísticas agropecuarias para modernizar la forma en que Chile recolecta y analiza datos del sector, mejorando la toma de decisiones.', 
  '{"Solicitud de asistencia técnica del INE o ODEPA","Capacidad de procesamiento de Big Data","Socio técnico experto en agro-estadística"}', 
  '{"IICA tiene especialistas en manejo de datos agrícolas","Fuerte relación con ODEPA e INE","Experiencia en censos agropecuarios regionales"}', 
  '{"Presupuesto acotado para alcance nacional","Requiere alta coordinación inter-institucional"}', 
  'Oportunidad estratégica para posicionar al IICA como referente en digitalización de datos. Patricia Villareal ya tiene borrador de perfil de proyecto.', 'Innovación para la productividad', 'Media'
);

-- Nota: He incluido los proyectos más relevantes detectados en tu JSON. 
-- El ID 112 se inserta correctamente ahora que las tablas ya existen.
