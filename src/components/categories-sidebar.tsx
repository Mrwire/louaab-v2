"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, X, Filter, Grid3X3, List, ChevronDown, ChevronUp } from "lucide-react";
import { ToyData } from "@/lib/toys-data";

interface CategoriesSidebarProps {
  categories: string[];
  toys: ToyData[];
  currentCategory?: string;
}

interface SearchResult {
  type: 'category' | 'toy';
  name: string;
  count?: number;
  toy?: ToyData;
}

export default function CategoriesSidebar({ categories, toys, currentCategory }: CategoriesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  // Nombre de catégories à afficher par défaut
  const DEFAULT_CATEGORIES_LIMIT = 6;

  // Recherche en temps réel
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Recherche dans les catégories
    categories.forEach(category => {
      if (category.toLowerCase().includes(query)) {
        const count = toys.filter(toy => toy.category?.includes(category)).length;
        results.push({
          type: 'category',
          name: category,
          count
        });
      }
    });

    // Recherche dans les jouets
    toys.forEach(toy => {
      if (
        toy.name.toLowerCase().includes(query) ||
        toy.description?.toLowerCase().includes(query) ||
        toy.category?.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'toy',
          name: toy.name,
          toy
        });
      }
    });

    // Limiter à 8 résultats pour les performances
    return results.slice(0, 8);
  }, [searchQuery, categories, toys]);

  // Filtrer les catégories selon la recherche
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    return categories.filter(category => 
      category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  // Catégories à afficher (limitées ou toutes)
  const displayedCategories = useMemo(() => {
    const categoriesToShow = filteredCategories;
    
    if (showAllCategories || searchQuery.trim()) {
      return categoriesToShow;
    }
    
    return categoriesToShow.slice(0, DEFAULT_CATEGORIES_LIMIT);
  }, [filteredCategories, showAllCategories, searchQuery]);

  // Vérifier s'il y a plus de catégories à afficher
  const hasMoreCategories = filteredCategories.length > DEFAULT_CATEGORIES_LIMIT && !searchQuery.trim();

  // Gérer la fermeture des résultats
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      {/* Barre de recherche */}
      <div className="search-container relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher une catégorie ou un jouet..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.length > 0);
            }}
            onFocus={() => setShowSearchResults(searchQuery.length > 0)}
            className="w-full rounded-lg border border-gray-200 bg-white px-10 py-2 text-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowSearchResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Résultats de recherche */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="p-2">
              {searchResults.map((result, index) => (
                <div key={index}>
                  {result.type === 'category' ? (
                    <Link
                      href={`/categories/${encodeURIComponent(result.name.toLowerCase())}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-mint/10"
                      onClick={() => {
                        setSearchQuery("");
                        setShowSearchResults(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-mint" />
                        <span className="font-medium">{result.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {result.count} jouet{result.count && result.count > 1 ? 's' : ''}
                      </span>
                    </Link>
                  ) : (
                    <Link
                      href={`/jouets/${result.toy?.slug}`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-mint/10"
                      onClick={() => {
                        setSearchQuery("");
                        setShowSearchResults(false);
                      }}
                    >
                      <div className="h-8 w-8 rounded-lg bg-gray-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {result.toy?.category}
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* En-tête avec mode d'affichage */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-mint rounded-full"></div>
          <h2 className="text-sm font-semibold text-charcoal">
            Catégories
          </h2>
        </div>
        
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex h-6 w-6 items-center justify-center rounded transition ${
              viewMode === 'grid' 
                ? 'bg-white text-mint shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Grid3X3 className="h-3 w-3" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex h-6 w-6 items-center justify-center rounded transition ${
              viewMode === 'list' 
                ? 'bg-white text-mint shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Liste des catégories */}
      <div className={`space-y-1 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : ''}`}>
        {displayedCategories.map((category) => {
          const isActive = currentCategory === category.toLowerCase();
          const toyCount = toys.filter(toy => toy.category?.includes(category)).length;
          
          return (
            <Link
              key={category}
              href={`/categories/${encodeURIComponent(category.toLowerCase())}`}
              className={`block rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-mint text-white font-medium shadow-sm'
                  : 'text-slate hover:bg-mint/10 hover:text-charcoal'
              } ${viewMode === 'grid' ? 'text-center' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{category}</span>
                <span className={`text-xs ${
                  isActive ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {toyCount}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bouton pour afficher plus de catégories */}
      {hasMoreCategories && (
        <button
          onClick={() => setShowAllCategories(!showAllCategories)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:border-mint hover:text-mint"
        >
          <div className="flex items-center justify-center gap-2">
            {showAllCategories ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Voir moins
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Voir toutes ({filteredCategories.length})
              </>
            )}
          </div>
        </button>
      )}

      {/* Statistiques */}
      <div className="rounded-lg bg-gradient-to-r from-mint/5 to-purple-50 p-3">
        <div className="text-xs font-medium text-slate mb-1">Statistiques</div>
        <div className="text-sm font-semibold text-charcoal">
          {displayedCategories.length} catégorie{displayedCategories.length > 1 ? 's' : ''} affichée{displayedCategories.length > 1 ? 's' : ''}
        </div>
        <div className="text-xs text-slate">
          {toys.length} jouet{toys.length > 1 ? 's' : ''} au total
        </div>
        {hasMoreCategories && (
          <div className="text-xs text-mint mt-1">
            +{filteredCategories.length - DEFAULT_CATEGORIES_LIMIT} autres disponibles
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="space-y-2">
        <Link
          href="/jouets"
          className="block w-full rounded-lg border border-mint px-3 py-2 text-center text-xs font-medium text-mint transition hover:bg-mint hover:text-white"
        >
          Tous les jouets
        </Link>
        <Link
          href="/ages"
          className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600 transition hover:bg-gray-50"
        >
          Par âge
        </Link>
      </div>
    </div>
  );
}
