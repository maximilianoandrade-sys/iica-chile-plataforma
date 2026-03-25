"use client";

/**
 * SmartProjectSearch — Buscador semántico con IA para IICA Chile
 * Colocado en: components/SmartProjectSearch.tsx
 *
 * Props:
 *   projects: Project[]  — array de los proyectos actuales
 *   onSelect?: (p) => void — callback al hacer clic en un proyecto
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { useSemanticSearch } from "@/hooks/useSemanticSearch";
import type { Project } from "@/types/project";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface EnrichedProject extends Project {
  _score?: number;
  _reason?: string;
  _new?: boolean;
}

interface Filters {
  ambito: string;
  viabilidad: string;
  fuente: string;
  rol: string;
  diasCierre: number;
}

const EMPTY_FILTERS: Filters = {
  ambito: "",
  viabilidad: "",
  fuente: "",
  rol: "",
  diasCierre: 0,
};

const QUERY_HINTS = [
  "cambio climático adaptación",
  "agricultura familiar mujer rural",
  "bioeconomía innovación digital",
  "fondos internacionales IICA ejecutor",
  "cooperación triangular sur-sur",
  "riego tecnificado indígena",
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SmartProjectSearch({
  projects,
  onSelect,
}: {
  projects: Project[];
  onSelect?: (p: EnrichedProject) => void;
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [activeTab, setActiveTab] = useState<
    "all" | "high" | "intl" | "new"
  >("all");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [enriched, setEnriched] = useState<EnrichedProject[]>(projects);
  const [webProjects, setWebProjects] = useState<EnrichedProject[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { search, searchWeb, isSearching, isWebSearching } =
    useSemanticSearch();

  // ── Filtrado local (sin IA) ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    const today = new Date();
    let base = enriched;

    if (filters.ambito) base = base.filter((p) => p.ambito === filters.ambito);
    if (filters.viabilidad)
      base = base.filter((p) => p.viabilidad === filters.viabilidad);
    if (filters.fuente)
      base = base.filter((p) => p.fuente?.includes(filters.fuente));
    if (filters.rol) base = base.filter((p) => p.rol === filters.rol);
    if (filters.diasCierre > 0) {
      base = base.filter((p) => {
        const diff =
          (new Date(p.cierre).getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24);
        return diff <= filters.diasCierre;
      });
    }
    if (showFavOnly) base = base.filter((p) => favorites.has(p.id));

    return base.sort((a, b) => {
      const sa = a._score ?? 0;
      const sb = b._score ?? 0;
      if (sb !== sa) return sb - sa;
      return new Date(a.cierre).getTime() - new Date(b.cierre).getTime();
    });
  }, [enriched, filters, showFavOnly, favorites]);

  // ── Resultados por tab ───────────────────────────────────────────────────
  const displayed = useMemo(() => {
    if (activeTab === "new") return webProjects;
    if (activeTab === "high")
      return filtered.filter((p) => p.viabilidad === "Alta");
    if (activeTab === "intl")
      return filtered.filter((p) => p.ambito === "Internacional");
    return filtered;
  }, [filtered, webProjects, activeTab]);

  // ── Búsqueda semántica con debounce ──────────────────────────────────────
  useEffect(() => {
    if (!query.trim()) {
      setEnriched(projects);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await search(query, projects);
      if (results.length === 0) {
        setEnriched(projects);
        return;
      }
      const scoreMap = new Map(results.map((r) => [r.id, r]));
      const matchedIds = new Set(results.map((r) => r.id));
      setEnriched(
        projects
          .filter((p) => matchedIds.has(p.id))
          .map((p) => ({
            ...p,
            _score: scoreMap.get(p.id)?.score,
            _reason: scoreMap.get(p.id)?.reason,
          }))
      );
    }, 600);
  }, [query, projects, search]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleWebSearch = async () => {
    const results = await searchWeb(query);
    setWebProjects(results);
    setActiveTab("new");
  };

  const toggleFav = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const resetAll = () => {
    setQuery("");
    setFilters(EMPTY_FILTERS);
    setEnriched(projects);
    setWebProjects([]);
    setActiveTab("all");
    setShowFavOnly(false);
  };

  const today = new Date();

  return (
    <section className="w-full space-y-4">
      {/* ── Barra de búsqueda ─────────────────────────────────────────── */}
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Ej: "fondos riego tecnificado con enfoque de género"'
          className="flex-1 h-10 px-4 border border-border rounded-md text-sm bg-background focus:ring-2 focus:ring-emerald-500 outline-none"
        />
        <button
          onClick={handleWebSearch}
          disabled={isWebSearching}
          className="h-10 px-4 rounded-md text-sm font-medium border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
        >
          {isWebSearching ? "Escaneando..." : "+ Buscar en web"}
        </button>
        <button
          onClick={resetAll}
          className="h-10 px-3 rounded-md text-sm border border-border bg-background hover:bg-muted"
        >
          Limpiar
        </button>
      </div>

      {/* ── Hints ─────────────────────────────────────────────────────── */}
      {!query && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground self-center">
            Sugerencias:
          </span>
          {QUERY_HINTS.map((h) => (
            <button
              key={h}
              onClick={() => setQuery(h)}
              className="text-xs px-3 py-1 rounded-full border border-border bg-background hover:bg-muted"
            >
              {h}
            </button>
          ))}
        </div>
      )}

      {/* ── Filtros ───────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap items-center">
        {[
          {
            id: "ambito",
            label: "Ámbito",
            options: ["Internacional", "Nacional", "Regional"],
          },
          {
            id: "viabilidad",
            label: "Viabilidad",
            options: ["Alta", "Media", "Baja"],
          },
          {
            id: "fuente",
            label: "Fuente",
            options: [
              "FONTAGRO","FAO","BID","FIDA","FIA","CNR",
              "INDAP","CORFO","GEF","GCF","EUROCLIMA+","IICA",
            ],
          },
          {
            id: "rol",
            label: "Rol IICA",
            options: ["Ejecutor", "Implementador", "Asesor", "Indirecto"],
          },
        ].map(({ id, label, options }) => (
          <select
            key={id}
            value={filters[id as keyof Filters]}
            onChange={(e) =>
              setFilters((f) => ({ ...f, [id]: e.target.value }))
            }
            className="h-8 px-2 text-xs border border-border rounded-md bg-background"
          >
            <option value="">{label}: Todos</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ))}
        <select
          value={filters.diasCierre}
          onChange={(e) =>
            setFilters((f) => ({ ...f, diasCierre: +e.target.value }))
          }
          className="h-8 px-2 text-xs border border-border rounded-md bg-background"
        >
          <option value={0}>Plazo: Cualquiera</option>
          <option value={7}>Cierra en ≤7 días</option>
          <option value={30}>Cierra en ≤30 días</option>
          <option value={90}>Cierra en ≤90 días</option>
        </select>
        <button
          onClick={() => setShowFavOnly((v) => !v)}
          className={`h-8 px-3 text-xs rounded-full border transition-colors ${
            showFavOnly
              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
              : "border-border bg-background"
          }`}
        >
          Solo favoritos
        </button>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
        <span className="px-3 py-1 rounded-full bg-muted border border-border">
          Resultados: <strong>{displayed.length}</strong>
        </span>
        <span className="px-3 py-1 rounded-full bg-muted border border-border">
          Alta viabilidad:{" "}
          <strong>{projects.filter((p) => p.viabilidad === "Alta").length}</strong>
        </span>
        {isSearching && (
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Analizando con IA...
          </span>
        )}
        {webProjects.length > 0 && (
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {webProjects.length} nuevas encontradas en web
          </span>
        )}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex border-b border-border gap-0">
        {(["all", "high", "intl", "new"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors -mb-px ${
              activeTab === t
                ? "border-emerald-600 text-emerald-700 font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {
              {
                all: "Todos",
                high: "Alta viabilidad",
                intl: "Internacionales",
                new: `Nuevos (${webProjects.length})`,
              }[t]
            }
          </button>
        ))}
      </div>

      {/* ── Resultados ────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {displayed.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {activeTab === "new"
              ? 'Usa "Buscar en web" para descubrir nuevas convocatorias.'
              : "Sin resultados con los filtros actuales."}
          </p>
        ) : (
          displayed.map((p) => {
            const dias = Math.ceil(
              (new Date(p.cierre).getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return (
              <div
                key={p.id}
                className={`border rounded-xl p-4 bg-background transition-all hover:border-border/80 cursor-pointer ${
                  p._new
                    ? "border-l-4 border-l-blue-500"
                    : (p._score ?? 0) >= 80
                    ? "border-l-4 border-l-emerald-500"
                    : "border-border"
                }`}
                onClick={() => onSelect?.(p)}
              >
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {p._new && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                      Nuevo
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.ambito === "Internacional"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : p.ambito === "Regional"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-green-50 text-green-700 border border-green-200"
                    }`}
                  >
                    {p.ambito}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.viabilidad === "Alta"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : p.viabilidad === "Baja"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {p.viabilidad}
                  </span>
                  {dias <= 7 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-medium">
                      Cierra en {dias}d
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium leading-snug mb-1">
                  {p.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.fuente} · Cierre:{" "}
                  {new Date(p.cierre).toLocaleDateString("es-CL")} ({dias}d)
                  {p.monto ? ` · ${p.monto}` : ""}
                </p>

                {p._reason && (
                  <p className="mt-2 text-xs text-muted-foreground bg-muted rounded-md px-3 py-2 border-l-2 border-l-emerald-400">
                    {p._reason}
                  </p>
                )}

                <div className="flex gap-2 mt-3 items-center">
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Ver bases →
                    </a>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFav(p.id);
                    }}
                    className="text-xs px-3 py-1 rounded-md border border-border bg-background hover:bg-muted"
                  >
                    {favorites.has(p.id) ? "Guardado" : "Guardar"}
                  </button>
                  {p._score && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Relevancia: {p._score}%
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
