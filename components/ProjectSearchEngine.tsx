/**
 * IICA Chile - Motor de Búsqueda de Proyectos Reales
 * 
 * Arquitectura:
 * 1. Llama al API de Claude con web_search para buscar proyectos reales
 * 2. Parsea y estructura los resultados en tarjetas accionables
 * 3. Permite filtrar por fuente, estado, categoría y región
 * 
 * Fuentes reales integradas:
 *  - INDAP (indap.gob.cl)
 *  - CORFO (corfo.cl)
 *  - FIA (fia.cl)
 *  - CNR (cnr.gob.cl)
 *  - Mercado Público (mercadopublico.cl)
 *  - BID / FONTAGRO (fontagro.org)
 *  - IICA Global (iica.int)
 */

import { useState, useCallback, useRef } from "react";

// ─── Paleta institucional IICA ───────────────────────────────────────────────
const colors = {
  iicaGreen: "#2D7A2F",
  iicaLightGreen: "#4CAF50",
  iicaGold: "#C8A84B",
  iicaDark: "#1A3A1A",
  iicaCream: "#F5F2E8",
  iicaGray: "#6B7280",
  iicaBg: "#FAFAF7",
  indap: "#1565C0",
  corfo: "#E53935",
  fia: "#6A1B9A",
  cnr: "#00838F",
  bid: "#FF6F00",
  iicaGlobal: "#2D7A2F",
  mercado: "#455A64",
};

const SOURCE_META: Record<string, { color: string, icon: string, label: string, url: string }> = {
  INDAP: { color: colors.indap, icon: "🌾", label: "INDAP", url: "indap.gob.cl" },
  CORFO: { color: colors.corfo, icon: "🏭", label: "CORFO", url: "corfo.cl" },
  FIA: { color: colors.fia, icon: "🔬", label: "FIA", url: "fia.cl" },
  CNR: { color: colors.cnr, icon: "💧", label: "CNR", url: "cnr.gob.cl" },
  BID_FONTAGRO: { color: colors.bid, icon: "🌎", label: "BID/FONTAGRO", url: "fontagro.org" },
  IICA_GLOBAL: { color: colors.iicaGlobal, icon: "🤝", label: "IICA Global", url: "iica.int" },
  MERCADO_PUBLICO: { color: colors.mercado, icon: "📋", label: "Mercado Público", url: "mercadopublico.cl" },
  ANID: { color: "#7B1FA2", icon: "🧪", label: "ANID", url: "anid.cl" },
  GEF: { color: "#00695C", icon: "🌍", label: "GEF", url: "thegef.org" },
  GCF: { color: "#00897B", icon: "🌿", label: "GCF", url: "greenclimate.fund" },
  EUROCLIMA: { color: "#1976D2", icon: "🇪🇺", label: "EUROCLIMA+", url: "euroclima.org" },
  FIDA: { color: "#F57C00", icon: "🌾", label: "FIDA", url: "ifad.org" },
  DEFAULT: { color: "#607D8B", icon: "📋", label: "Otro", url: "" },
};

// Mapa de nombre de institución a clave de SOURCE_META
function getSourceMeta(project: any) {
  if (project.source && SOURCE_META[project.source]) {
    return SOURCE_META[project.source];
  }
  const inst = (project.institution || "").toUpperCase();
  if (inst.includes("FONTAGRO") || inst.includes("BID") || inst.includes("IADB")) return SOURCE_META.BID_FONTAGRO;
  if (inst.includes("FAO")) return SOURCE_META.IICA_GLOBAL;
  if (inst.includes("FIA")) return SOURCE_META.FIA;
  if (inst.includes("CNR")) return SOURCE_META.CNR;
  if (inst.includes("INDAP")) return SOURCE_META.INDAP;
  if (inst.includes("CORFO")) return SOURCE_META.CORFO;
  if (inst.includes("IICA")) return SOURCE_META.IICA_GLOBAL;
  if (inst.includes("MERCADO") || inst.includes("CHILECOMPRA")) return SOURCE_META.MERCADO_PUBLICO;
  if (inst.includes("ANID") || inst.includes("FONDEF")) return SOURCE_META.ANID;
  if (inst.includes("GEF")) return SOURCE_META.GEF;
  if (inst.includes("GCF") || inst.includes("GREEN CLIMATE")) return SOURCE_META.GCF;
  if (inst.includes("EUROCLIMA") || inst.includes("UNIÓN EUROPEA")) return SOURCE_META.EUROCLIMA;
  if (inst.includes("FIDA") || inst.includes("IFAD")) return SOURCE_META.FIDA;
  return SOURCE_META.DEFAULT;
}

const CATEGORIES = [
  { id: "all", label: "Todos", icon: "🔍" },
  { id: "riego", label: "Riego y Agua", icon: "💧" },
  { id: "innovacion", label: "Innovación", icon: "🔬" },
  { id: "cooperacion", label: "Cooperación Técnica", icon: "🤝" },
  { id: "exportacion", label: "Exportación / Mercados", icon: "📦" },
  { id: "sustentabilidad", label: "Sustentabilidad", icon: "🌿" },
  { id: "capacitacion", label: "Capacitación", icon: "📚" },
  { id: "financiamiento", label: "Financiamiento Directo", icon: "💰" },
];

const REGIONS = [
  "Nacional", "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama",
  "Coquimbo", "Valparaíso", "O'Higgins", "Maule", "Ñuble",
  "Biobío", "La Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes",
];

// ─── Componente Principal ────────────────────────────────────────────────────
export default function ProjectSearchEngine() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("Nacional");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setSelectedProject(null);

    try {
      const response = await fetch("/api/search-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, category, region })
      });

      if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `API Error: ${response.status}`);
      }

      const parsed = await response.json();
      setResults(parsed);
    } catch (err: any) {
      setError(err.message || "Error al buscar proyectos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [query, category, region]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: colors.iicaBg,
      minHeight: "100vh",
      color: colors.iicaDark,
    }}>
      {/* ── Header ── */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.iicaDark} 0%, ${colors.iicaGreen} 60%, ${colors.iicaLightGreen} 100%)`,
        padding: "32px 24px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: `${80 + i * 60}px`,
            height: `${80 + i * 60}px`,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)",
            top: `${-20 + i * 10}px`,
            right: `${-20 + i * 15}px`,
            pointerEvents: "none",
          }} />
        ))}
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 28 }}>🌾</span>
            <span style={{
              color: colors.iicaGold,
              fontSize: 11,
              fontFamily: "monospace",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}>IICA CHILE · MOTOR DE PROYECTOS EN TIEMPO REAL</span>
          </div>
          <h1 style={{
            color: "white",
            fontSize: "clamp(20px, 4vw, 32px)",
            fontWeight: 700,
            margin: "0 0 8px",
            lineHeight: 1.2,
          }}>
            Búsqueda de Oportunidades Reales
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: 0 }}>
            Proyectos vigentes de INDAP, CORFO, FIA, CNR, FONTAGRO y más — donde IICA puede participar
          </p>
        </div>
      </div>

      {/* ── Search Panel ── */}
      <div style={{
        background: "white",
        borderBottom: `3px solid ${colors.iicaGold}`,
        padding: "20px 24px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Search bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej: cooperación técnica riego, innovación agroalimentaria, pequeños agricultores..."
              style={{
                flex: 1,
                padding: "12px 16px",
                border: `2px solid ${colors.iicaGreen}`,
                borderRadius: 8,
                fontSize: 15,
                fontFamily: "inherit",
                outline: "none",
                background: colors.iicaCream,
                color: colors.iicaDark,
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                padding: "12px 24px",
                background: loading ? "#9E9E9E" : colors.iicaGreen,
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                transition: "background 0.2s",
              }}
            >
              {loading ? "Inteligencia Artificial buscando..." : "🔍 Buscar con AI"}
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {/* Category */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: "5px 11px",
                    borderRadius: 20,
                    border: `1.5px solid ${category === cat.id ? colors.iicaGreen : "#D1D5DB"}`,
                    background: category === cat.id ? colors.iicaGreen : "white",
                    color: category === cat.id ? "white" : colors.iicaGray,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Region */}
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                border: `1.5px solid ${colors.iicaGold}`,
                background: "white",
                color: colors.iicaDark,
                fontSize: 12,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 24px" }}>

        {/* Loading State */}
        {loading && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "white",
            borderRadius: 12,
            border: `1px solid ${colors.iicaGold}`,
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔎🤖</div>
            <p style={{
              color: colors.iicaGreen,
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 8,
            }}>Claude 3.5 Sonnet rastreando oportunidades en la web...</p>
            <p style={{ color: colors.iicaGray, fontSize: 13 }}>
              Buscando y analizando proyectos en INDAP, CORFO, FIA, CNR, FONTAGRO y Mercado Público en tiempo real
            </p>
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 20,
            }}>
              {Object.values(SOURCE_META).map((s, i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: s.color,
                    animation: `pulse 1.4s ${i * 0.15}s infinite`,
                    opacity: 0.7,
                  }}
                  title={s.label}
                />
              ))}
            </div>
            <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.4);opacity:1} }`}</style>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "#FFF3F3",
            border: "1.5px solid #FFCDD2",
            borderRadius: 8,
            padding: 20,
            color: "#C62828",
          }}>
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !results && !error && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "white",
            borderRadius: 12,
            border: `1px dashed ${colors.iicaGold}`,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌎</div>
            <h3 style={{ color: colors.iicaGreen, fontSize: 18, marginBottom: 8 }}>
              Motor de Búsqueda Inteligente IICA
            </h3>
            <p style={{ color: colors.iicaGray, fontSize: 14, maxWidth: 500, margin: "0 auto 24px" }}>
              Esta herramienta consulta en directo a la inteligencia artificial sobre proyectos reales y vigentes donde el IICA puede participar. Los resultados se extraen en tiempo real navegando por las fuentes oficiales.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {["Proyectos de riego CNR 2026", "Convocatorias FIA innovación", "Licitaciones INDAP asistencia técnica", "FONTAGRO cambio climático"].map(s => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); setTimeout(handleSearch, 100); }}
                  style={{
                    padding: "6px 14px",
                    background: colors.iicaCream,
                    border: `1px solid ${colors.iicaGreen}`,
                    borderRadius: 20,
                    fontSize: 13,
                    color: colors.iicaGreen,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div>
            {/* Summary bar */}
            <div style={{
              background: `linear-gradient(90deg, ${colors.iicaGreen}15, transparent)`,
              border: `1px solid ${colors.iicaGreen}30`,
              borderLeft: `4px solid ${colors.iicaGreen}`,
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}>
              <div>
                <strong style={{ color: colors.iicaGreen }}>
                  ✨ {results.total_opportunities || results.results?.length || 0} oportunidades extraídas por IA
                </strong>
                {results.summary && (
                  <span style={{ color: colors.iicaGray, fontSize: 13, marginLeft: 8 }}>
                    — {results.summary}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: colors.iicaGray }}>
                📅 {results.search_date || new Date().toLocaleDateString("es-CL")}
              </span>
            </div>

            {/* Cards grid */}
            <div style={{ display: "grid", gap: 16 }}>
              {(results.results || []).map((project: any) => {
                const src = getSourceMeta(project);
                const isOpen = project.status === "abierto" || project.status === "permanente";
                const isSelected = selectedProject?.id === project.id;

                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(isSelected ? null : project)}
                    style={{
                      background: "white",
                      borderRadius: 12,
                      border: `1.5px solid ${isSelected ? src.color : "#E5E7EB"}`,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: isSelected ? `0 4px 20px ${src.color}25` : "0 1px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* Card header */}
                    <div style={{
                      display: "flex",
                      gap: 0,
                      borderBottom: `1px solid #F3F4F6`,
                    }}>
                      {/* Source badge */}
                      <div style={{
                        background: src.color,
                        color: "white",
                        padding: "12px 14px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 72,
                        fontSize: 11,
                        fontWeight: 700,
                        textAlign: "center",
                        gap: 4,
                        letterSpacing: 0.5,
                      }}>
                        <span style={{ fontSize: 20 }}>{src.icon}</span>
                        {src.label}
                      </div>

                      {/* Title area */}
                      <div style={{ padding: "12px 16px", flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                          <h3 style={{
                            margin: 0,
                            fontSize: 15,
                            fontWeight: 700,
                            color: colors.iicaDark,
                            lineHeight: 1.35,
                          }}>
                            {project.title || project.nombre || "Sin título"}
                          </h3>
                          {/* Status pill */}
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            background: isOpen ? "#E8F5E9" : project.status === "próximo" ? "#FFF3E0" : "#FAFAFA",
                            color: isOpen ? "#2E7D32" : project.status === "próximo" ? "#E65100" : "#9E9E9E",
                            border: `1px solid ${isOpen ? "#A5D6A7" : project.status === "próximo" ? "#FFCC80" : "#E0E0E0"}`,
                          }}>
                            {isOpen ? "● Abierto" : project.status === "próximo" ? "◐ Próximo" : "○ Cerrado"}
                          </span>
                        </div>

                        {/* Tags row */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                          {project.region && (
                            <span style={{ fontSize: 11, color: colors.iicaGray }}>
                              📍 {project.region}
                            </span>
                          )}
                          {project.deadline && (
                            <span style={{ fontSize: 11, color: "#E65100" }}>
                              ⏰ Cierra: {project.deadline}
                            </span>
                          )}
                          {project.budget && (
                            <span style={{ fontSize: 11, color: colors.iicaGreen, fontWeight: 600 }}>
                              💰 {project.budget}
                            </span>
                          )}
                          {project.relevance_score != null && <span style={{
                            fontSize: 11,
                            color: colors.iicaGold,
                            fontWeight: 600,
                          }}>

                            ⭐ Relevancia IICA: {project.relevance_score}/10
                          </span>}
                        </div>
                      </div>
                    </div>

                    {/* IICA Role - always visible */}
                    <div style={{
                      background: `${colors.iicaGreen}08`,
                      borderLeft: `3px solid ${colors.iicaGreen}`,
                      padding: "8px 16px",
                      fontSize: 13,
                    }}>
                      <span style={{ color: colors.iicaGreen, fontWeight: 700 }}>🎯 Rol Sugerido IICA: </span>
                      <span style={{ color: colors.iicaDark }}>{project.iica_role}</span>
                    </div>

                    {/* Expanded detail */}
                    {isSelected && (
                      <div style={{ padding: "16px", borderTop: `1px solid #F3F4F6` }}>
                        <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.6, color: "#374151" }}>
                          {project.description}
                        </p>

                        {project.requirements?.length > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <strong style={{ fontSize: 13, color: colors.iicaDark }}>Requisitos principales:</strong>
                            <ul style={{ margin: "6px 0 0 20px", padding: 0 }}>
                              {project.requirements.map((r: string, i: number) => (
                                <li key={i} style={{ fontSize: 13, color: "#4B5563", marginBottom: 3 }}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {project.tags?.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                            {project.tags.map((t: string, i: number) => (
                              <span key={i} style={{
                                padding: "2px 10px",
                                background: `${src.color}15`,
                                color: src.color,
                                borderRadius: 20,
                                fontSize: 11,
                                border: `1px solid ${src.color}30`,
                              }}>#{t}</span>
                            ))}
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {project.url && (
                            <a
                              href={project.url.startsWith("http") ? project.url : `https://${project.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{
                                padding: "8px 16px",
                                background: src.color,
                                color: "white",
                                textDecoration: "none",
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 600,
                                fontFamily: "inherit",
                              }}
                            >
                              Ver fuente oficial →
                            </a>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); }}
                            style={{
                              padding: "8px 16px",
                              background: "white",
                              border: `1.5px solid ${colors.iicaGold}`,
                              color: colors.iicaDark,
                              borderRadius: 6,
                              fontSize: 13,
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            ⭐ Guardar en maletín
                          </button>
                        </div>
                      </div>
                    )}

                    {!isSelected && (
                      <div style={{
                        padding: "6px 16px",
                        fontSize: 11,
                        color: colors.iicaGray,
                        textAlign: "right",
                        background: "#FAFAFA",
                      }}>
                        Clic para ver el análisis de la IA ▾
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sources footer */}
            <div style={{
              marginTop: 24,
              padding: "16px",
              background: "white",
              borderRadius: 8,
              border: `1px solid #E5E7EB`,
              fontSize: 12,
              color: colors.iicaGray,
            }}>
              <strong style={{ color: colors.iicaDark }}>Fuentes consultadas por el agente de IA:</strong>{" "}
              {Object.values(SOURCE_META).map(s => (
                <a
                  key={s.url}
                  href={`https://${s.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: s.color,
                    textDecoration: "none",
                    marginRight: 12,
                    fontWeight: 600,
                  }}
                >
                  {s.icon} {s.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
