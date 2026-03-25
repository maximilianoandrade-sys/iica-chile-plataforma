/**
 * useSemanticSearch — Hook de búsqueda semántica + web para IICA Chile
 * Colocado en: hooks/useSemanticSearch.ts
 */

import { useState, useCallback, useRef } from "react";
import type { Project } from "@/types/project";

export interface SemanticResult {
  id: number;
  score: number;
  reason: string;
}

export interface WebProject extends Omit<Project, "id"> {
  id: number;
  _new: true;
  _reason: string;
  score: number;
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
            (p) =>
              `ID:${p.id}|${p.title}|${p.fuente}|${p.ambito}|${p.viabilidad}|${p.keywords || ""}`
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
        return (data.projects ?? []).map(
          (p: Omit<WebProject, "id" | "_new" | "score">, i: number) => ({
            ...p,
            id: 9000 + i,
            _new: true as const,
            score: 75,
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
