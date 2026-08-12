import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('favorites');

export const FAVORITES_KEY = 'iica_favorite_projects_v1';

export function getFavoriteIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    logger.error('Error reading favorites from localStorage', e as Error);
    return [];
  }
}

export function isFavorite(id: number): boolean {
  const favorites = getFavoriteIds();
  return favorites.includes(id);
}

export function toggleFavorite(id: number): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const favorites = getFavoriteIds();
    let updated: number[];
    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    // Dispatch custom event for reactive UI updates across components
    window.dispatchEvent(new Event('iica_favorites_updated'));
    return updated;
  } catch (e) {
    logger.error('Error updating favorites in localStorage', e as Error);
    return getFavoriteIds();
  }
}
