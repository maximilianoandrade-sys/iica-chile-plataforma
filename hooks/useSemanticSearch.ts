/**
 * useSemanticSearch — Hook de búsqueda semántica + web para IICA Chile
 * Colocado en: hooks/useSemanticSearch.ts
 */

import { useState, useCallback, useRef } from "react";
import type { Project } from "@/lib/data";

export interface SemanticResult {
  id: number;
  score: number;
  reason: string;
}

export interface WebProject {
  id: number;
  nombre: string;
  institucion: string;
  monto: number;
  fecha_cierre: string;
  estado: string;
  categoria: string;
  url_bases: string;
  ambito?: string;
  viabilidadIICA?: "Alta" | "Media" | "Baja";
  rolIICA?: "Ejecutor" | "Implementador" | "Asesor" | "Indirecto";
  _new: true;
  _reason: string;
  _score: number;
}

interface UseSemanticSearchReturn {
  search: (query: string, projects: Project[]) => Promise<SemanticResult[]>;
  searchWeb: (query: string) => Promise<WebProject[]>;
  isSearching: boolean;
  isWebSearching: boolean;
  error: string | null;
}

export function useSemanticSearch(): UseSemanticSearchReturn {
  const [isSearching, setIsSearching] = useState(false);
  const [isWebSearching, setIsWebSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (query: string, projects: Project[]): Promise<SemanticResult[]> => {
      if (!query.trim()) return [];
      setIsSearching(true);
      setError(null);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const projectList = projects
          .map(
            (p: Project) =>
              `ID:${p.id}|${p.nombre}|${p.institucion}|${p.ambito ?? ""}|${p.viabilidadIICA ?? ""}|${p.categoria}`
          )
          .join("\n");

        const response = await fetch("/api/ai-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, projectList }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) throw new Error("Error en la búsqueda");
        const data = await response.json();
        return data.results ?? [];
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("No se pudo completar la búsqueda semántica.");
        }
        return [];
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  const searchWeb = useCallback(
    async (query: string): Promise<WebProject[]> => {
      setIsWebSearching(true);
      setError(null);

      try {
        const response = await fetch("/api/ai-web-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) throw new Error("Error en búsqueda web");
        const data = await response.json();
        interface RawWebProject {
          title?: string;
          nombre?: string;
          fuente?: string;
          institucion?: string;
          ambito?: string;
          viabilidad?: string;
          viabilidadIICA?: string;
          rol?: string;
          rolIICA?: string;
          cierre?: string;
          fecha_cierre?: string;
          monto?: string | number;
          url?: string;
          url_bases?: string;
          _reason?: string;
        }
        return (data.projects ?? []).map(
          (p: RawWebProject, i: number): WebProject => ({
            id: 9000 + i,
            nombre: p.title || p.nombre || "Sin título",
            institucion: p.fuente || p.institucion || "Desconocida",
            monto: typeof p.monto === "number" ? p.monto : 0,
            fecha_cierre: p.cierre || p.fecha_cierre || "",
            estado: "Abierta",
            categoria: "Internacional",
            url_bases: p.url || p.url_bases || "",
            ambito: p.ambito || "Internacional",
            viabilidadIICA: (p.viabilidad || p.viabilidadIICA || "Media") as WebProject["viabilidadIICA"],
            rolIICA: (p.rol || p.rolIICA || "Asesor") as WebProject["rolIICA"],
            _new: true as const,
            _reason: p._reason || "",
            _score: 75,
          })
        );
      } catch {
        setError("No se pudieron cargar resultados web.");
        return [];
      } finally {
        setIsWebSearching(false);
      }
    },
    []
  );

  return { search, searchWeb, isSearching, isWebSearching, error };
}
