export interface CatalogIdentityProject {
  id: number;
  sourceId?: string | null;
  canonicalUrl?: string | null;
  url_bases?: string | null;
  nombre?: string | null;
  institucion?: string | null;
  fecha_cierre?: string | Date | null;
}

function normalizeText(value: string | null | undefined): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function normalizeCatalogUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    url.hash = '';
    for (const key of Array.from(url.searchParams.keys())) {
      if (/^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$)/i.test(key)) {
        url.searchParams.delete(key);
      }
    }
    return url.toString().replace(/\/+$/, '').toLowerCase();
  } catch {
    return value.trim().toLowerCase().replace(/\/+$/, '') || null;
  }
}

function deadlineKey(value: string | Date | null | undefined): string {
  if (!value) return '';
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
}

export function getCatalogIdentity(project: CatalogIdentityProject): string {
  const canonicalUrl = normalizeCatalogUrl(project.canonicalUrl);
  if (canonicalUrl) return `url:${canonicalUrl}`;

  const basesUrl = normalizeCatalogUrl(project.url_bases);
  if (basesUrl) return `url:${basesUrl}`;

  if (project.sourceId) return `source:${project.sourceId.trim().toLowerCase()}`;

  const composite = [
    normalizeText(project.institucion),
    normalizeText(project.nombre),
    deadlineKey(project.fecha_cierre),
  ].join('|');
  return composite !== '||' ? `composite:${composite}` : `id:${project.id}`;
}

function stableIdentityKeys(project: CatalogIdentityProject): string[] {
  return [
    normalizeCatalogUrl(project.canonicalUrl),
    normalizeCatalogUrl(project.url_bases),
    project.sourceId ? project.sourceId.trim().toLowerCase() : null,
  ].filter((value): value is string => Boolean(value));
}

function canShareIdentity(a: CatalogIdentityProject, b: CatalogIdentityProject): boolean {
  if (a.sourceId && b.sourceId && a.sourceId.trim().toLowerCase() !== b.sourceId.trim().toLowerCase()) {
    return false;
  }
  const aCanonical = normalizeCatalogUrl(a.canonicalUrl);
  const bCanonical = normalizeCatalogUrl(b.canonicalUrl);
  return !(aCanonical && bCanonical && aCanonical !== bCanonical);
}

function hashIdentity(identity: string): string {
  let hash = 2166136261;
  for (let index = 0; index < identity.length; index += 1) {
    hash ^= identity.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function getCatalogRouteKey(project: CatalogIdentityProject): string {
  return `p-${project.id}-${hashIdentity(getCatalogIdentity(project))}`;
}

function mergeProjectFields<T extends CatalogIdentityProject>(preferred: T, fallback: T): T {
  const merged = { ...fallback, ...preferred } as T;
  for (const [key, value] of Object.entries(fallback)) {
    if (merged[key as keyof T] == null || merged[key as keyof T] === '') {
      (merged as Record<string, unknown>)[key] = value;
    }
  }
  return merged;
}

export function mergeCatalogProjects<T extends CatalogIdentityProject>(
  dbProjects: T[],
  staticProjects: T[],
): T[] {
  const merged: T[] = [];
  for (const project of [...staticProjects, ...dbProjects]) {
    const projectKeys = stableIdentityKeys(project);
    const matchingIndexes = merged.reduce<number[]>((indexes, candidate, index) => {
      const candidateKeys = stableIdentityKeys(candidate);
      if (projectKeys.length > 0 && candidateKeys.length > 0 && canShareIdentity(project, candidate)) {
        if (projectKeys.some((key) => candidateKeys.includes(key))) indexes.push(index);
      } else if (projectKeys.length === 0 && getCatalogIdentity(candidate) === getCatalogIdentity(project)) {
        indexes.push(index);
      }
      return indexes;
    }, []);

    if (matchingIndexes.length === 0) {
      merged.push(project);
    } else {
      const mergedExisting = matchingIndexes
        .slice(1)
        .reduce((current, index) => mergeProjectFields(current, merged[index]), merged[matchingIndexes[0]]);
      const mergedProject = mergeProjectFields(project, mergedExisting);
      for (const index of matchingIndexes.slice(1).sort((a, b) => b - a)) {
        merged.splice(index, 1);
      }
      merged[matchingIndexes[0]] = mergedProject;
    }
  }
  return merged;
}
