"use client";

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  projectId: number;
  className?: string;
}

export function FavoriteButton({ projectId, className }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem('iica_favorites');
      if (stored) {
        const favorites = JSON.parse(stored) as number[];
        setIsFavorite(favorites.includes(projectId));
      }
    } catch {}
  }, [projectId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newStatus = !isFavorite;
    setIsFavorite(newStatus);

    try {
      const stored = localStorage.getItem('iica_favorites');
      let favorites: number[] = stored ? JSON.parse(stored) : [];
      
      if (newStatus) {
        if (!favorites.includes(projectId)) favorites.push(projectId);
      } else {
        favorites = favorites.filter(id => id !== projectId);
      }
      
      localStorage.setItem('iica_favorites', JSON.stringify(favorites));

      // Disparar evento para que otros componentes se actualicen
      window.dispatchEvent(new Event('iica_favorites_updated'));

      // Tracking anónimo
      let deviceId = localStorage.getItem('iica_device_id');
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('iica_device_id', deviceId);
      }

      await fetch('/api/favorites/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, action: newStatus ? 'add' : 'remove', deviceId })
      });
    } catch (err) {
      console.error('Failed to update favorite', err);
    }
  };

  if (!isMounted) return null;

  return (
    <button
      onClick={toggleFavorite}
      aria-label={isFavorite ? "Quitar de guardados" : "Guardar oportunidad"}
      className={cn(
        "p-2 rounded-full transition-colors",
        isFavorite 
          ? "bg-amber-100 text-amber-500 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400" 
          : "bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700",
        className
      )}
    >
      <Bookmark className={cn("w-5 h-5", isFavorite && "fill-current")} />
    </button>
  );
}
