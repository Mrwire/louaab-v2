"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ToyData } from '@/lib/toys-data';

interface FavoritesContextType {
  favorites: string[]; // Array of toy IDs
  addToFavorites: (toyId: string) => void;
  removeFromFavorites: (toyId: string) => void;
  toggleFavorite: (toyId: string) => void;
  isFavorite: (toyId: string) => boolean;
  getFavoritesCount: () => number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem('louaab_favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Save favorites to localStorage on changes
  useEffect(() => {
    localStorage.setItem('louaab_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (toyId: string) => {
    setFavorites(prev => {
      if (!prev.includes(toyId)) {
        return [...prev, toyId];
      }
      return prev;
    });
  };

  const removeFromFavorites = (toyId: string) => {
    setFavorites(prev => prev.filter(id => id !== toyId));
  };

  const toggleFavorite = (toyId: string) => {
    setFavorites(prev => {
      if (prev.includes(toyId)) {
        return prev.filter(id => id !== toyId);
      } else {
        return [...prev, toyId];
      }
    });
  };

  const isFavorite = (toyId: string) => {
    return favorites.includes(toyId);
  };

  const getFavoritesCount = () => {
    return favorites.length;
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
        getFavoritesCount,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
