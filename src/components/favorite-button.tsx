"use client";

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/contexts/favorites-context';
import { ToyData } from '@/lib/toys-data';

interface FavoriteButtonProps {
  toy: ToyData;
  className?: string;
}

export default function FavoriteButton({ toy, className = "" }: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const toyKey = String(toy.backendId ?? toy.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    toggleFavorite(toyKey);
    
    // Animation feedback
    setTimeout(() => setIsAnimating(false), 300);
  };

  const isFav = isFavorite(toyKey);

  return (
    <button
      onClick={handleToggleFavorite}
      className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all duration-300 ${
        isFav
          ? 'border-red-500 bg-white text-red-500 scale-110'
          : 'border-mist bg-white text-charcoal hover:border-red-300 hover:text-red-500'
      } ${className} ${isAnimating ? 'animate-pulse' : ''}`}
      title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        className={`h-4 w-4 transition-all duration-300 ${
          isFav ? 'fill-red-500 text-red-500' : ''
        }`}
      />
    </button>
  );
}
