"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, X, Filter } from "lucide-react";
import { ToyData } from "@/lib/toys-data";

interface SearchBarProps {
  toys: ToyData[];
  onSearchChange?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

interface SearchResult {
  type: 'toy';
  name: string;
  toy: ToyData;
}

export default function SearchBar({ toys, onSearchChange, placeholder = "Rechercher un jouet...", className = "" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Recherche en temps réel
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

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
  }, [searchQuery, toys]);

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

  // Notifier le parent du changement de recherche
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(searchQuery);
    }
  }, [searchQuery, onSearchChange]);

  return (
    <div className={`search-container relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder={placeholder}
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
                <Link
                  href={`/jouets/${result.toy?.slug}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-mint/10"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchResults(false);
                  }}
                >
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    {result.toy?.image ? (
                      <img 
                        src={result.toy.image} 
                        alt={result.name}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-gray-400 text-xs">🎁</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{result.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {result.toy?.category} • {result.toy?.age}
                    </div>
                  </div>
                <div className="text-xs text-mint font-medium">
                  {result.toy?.price}
                </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message si aucun résultat */}
      {showSearchResults && searchQuery.trim() && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-4 text-center text-sm text-gray-500">
            Aucun jouet trouvé pour « {searchQuery} »
          </div>
        </div>
      )}
    </div>
  );
}
