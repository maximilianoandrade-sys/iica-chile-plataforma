"use client";

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isFavorite as checkIsFavorite, toggleFavorite as doToggle } from '@/lib/utils/favorites';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('FavoriteButton');

interface FavoriteButtonProps {
  projectId: number;
  className?: string;
}

export function FavoriteButton({ projectId, className }: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsFav(checkIsFavorite(projectId));

    const handleUpdate = () => setIsFav(checkIsFavorite(projectId));
    window.addEventListener('iica_favorites_updated', handleUpdate);
    return () => window.removeEventListener('iica_favorites_updated', handleUpdate);
  }, [projectId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      doToggle(projectId);
      setIsFav(checkIsFavorite(projectId));

      // Tracking anónimo (fire-and-forget)
      let deviceId = localStorage.getItem('iica_device_id');
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('iica_device_id', deviceId);
      }

      await fetch('/api/favorites/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, action: checkIsFavorite(projectId) ? 'add' : 'remove', deviceId })
      });
    } catch (err) {
      logger.error('Failed to update favorite', err as Error);
    }
  };

  if (!isMounted) return null;

  return (
    <button
      onClick={handleToggle}
      aria-label={isFav ? "Quitar de guardados" : "Guardar oportunidad"}
      className={cn(
        "p-2 rounded-full transition-colors",
        isFav 
          ? "bg-amber-100 text-amber-500 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400" 
          : "bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700",
        className
      )}
    >
      <Bookmark className={cn("w-5 h-5", isFav && "fill-current")} />
    </button>
  );
}
