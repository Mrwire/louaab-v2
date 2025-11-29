"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { getAllToys, ToyData } from "@/lib/toys-data";

export default function HeaderSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [toys, setToys] = useState<ToyData[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Charger les jouets depuis le backend si disponible
  useEffect(() => {
    const fetchToys = async () => {
      try {
        const allToys = await getAllToys();
        setToys(allToys);
      } catch (e) {
        setToys([]);
      }
    };
    fetchToys();
  }, []);

  // Recherche en temps réel - dès la première lettre
  const searchResults = useMemo(() => {
    // Recherche même avec 1 caractère
    if (!searchQuery.trim() || searchQuery.length === 0) return [];

    const query = searchQuery.toLowerCase().trim();
    const results: ToyData[] = [];

    // Recherche dans les jouets - pertinence améliorée
    toys.forEach(toy => {
      let score = 0;
      const toyName = toy.name.toLowerCase();
      const toyDesc = toy.description?.toLowerCase() || "";
      const toyCategory = toy.category?.toLowerCase() || "";
      const toyAge = toy.age?.toLowerCase() || "";

      // Score de pertinence
      if (toyName.startsWith(query)) score += 10; // Commence par la recherche = très pertinent
      else if (toyName.includes(query)) score += 5; // Contient la recherche = pertinent
      
      if (toyCategory.includes(query)) score += 3;
      if (toyAge.includes(query)) score += 2;
      if (toyDesc.includes(query)) score += 1;

      if (score > 0) {
        results.push({ ...toy, score } as ToyData & { score: number });
      }
    });

    // Trier par score de pertinence décroissant
    results.sort((a, b) => ((b as any).score || 0) - ((a as any).score || 0));

    // Limiter à 8 résultats pour le header
    return results.slice(0, 8);
  }, [searchQuery, toys]);

  // Gérer la fermeture des résultats au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Rechercher un jouet..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            // Afficher les résultats dès la première lettre
            setShowSearchResults(e.target.value.length > 0);
          }}
          onFocus={() => setShowSearchResults(searchQuery.length > 0)}
          className="w-full rounded-lg border border-gray-200 bg-white px-10 py-2.5 text-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20 transition"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setShowSearchResults(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Résultats de recherche */}
      {showSearchResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-[480px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-slate uppercase tracking-wide">
              {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
            </div>
            {searchResults.map((toy) => (
              <Link
                key={toy.backendId ?? toy.id}
                href={`/jouets/${toy.slug}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-mint/10 transition group"
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchResults(false);
                }}
              >
                <div className="relative h-12 w-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  <Image
                    src={toy.image}
                    alt={toy.name}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-charcoal truncate group-hover:text-mint transition">
                    {toy.name}
                  </div>
                  <div className="text-xs text-slate truncate">
                    {toy.category} • {toy.age}
                  </div>
                </div>
                <div className="text-sm text-mint font-semibold">
                  {toy.price} DH
                </div>
              </Link>
            ))}
          </div>
          
          {/* Voir tous les résultats */}
          {searchResults.length >= 8 && (
            <div className="border-t border-gray-200 p-2">
              <Link
                href={`/recherche?q=${encodeURIComponent(searchQuery)}`}
                className="block text-center text-sm text-mint font-medium py-2.5 hover:bg-mint/5 rounded-lg transition"
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchResults(false);
                }}
              >
                Voir tous les résultats
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Message si aucun résultat */}
      {showSearchResults && searchQuery.trim() && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="p-6 text-center">
            <div className="text-gray-400 mb-2">🔍</div>
            <div className="text-sm text-slate mb-1">
              Aucun jouet trouvé pour <span className="font-semibold">« {searchQuery} »</span>
            </div>
            <Link
              href="/jouets"
              className="text-xs text-mint hover:underline"
              onClick={() => {
                setSearchQuery("");
                setShowSearchResults(false);
              }}
            >
              Parcourir tous les jouets
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
