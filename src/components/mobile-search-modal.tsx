"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowLeft } from "lucide-react";
import { getAllToys, ToyData } from "@/lib/toys-data";

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [toys, setToys] = useState<ToyData[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger les jouets
  useEffect(() => {
    const fetchToys = async () => {
      const allToys = await getAllToys();
      setToys(allToys);
    };
    fetchToys();
  }, []);

  // Focus automatique sur l'input quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Recherche en temps réel
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: ToyData[] = [];

    toys.forEach(toy => {
      if (
        toy.name.toLowerCase().includes(query) ||
        toy.description?.toLowerCase().includes(query) ||
        toy.category?.toLowerCase().includes(query) ||
        toy.age?.toLowerCase().includes(query)
      ) {
        results.push(toy);
      }
    });

    return results.slice(0, 20); // Limiter à 20 résultats sur mobile
  }, [searchQuery, toys]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white">
      {/* Header du modal avec fond blanc opaque */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-md">
        <div className="flex items-center gap-3 px-4 py-3 bg-white">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-gray-300 text-charcoal transition hover:bg-gray-100"
            aria-label="Fermer la recherche"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5 z-10" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher un jouet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-300 bg-white px-10 py-2.5 text-sm text-charcoal placeholder:text-gray-400 focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu du modal avec fond blanc */}
      <div className="h-[calc(100vh-70px)] overflow-y-auto bg-white">
        {/* État initial - Suggestions */}
        {!searchQuery && (
          <div className="p-4 bg-white">
            <h3 className="text-sm font-semibold text-charcoal mb-3">Recherches populaires</h3>
            <div className="flex flex-wrap gap-2">
              {['Voiture', 'Poupée', 'Robot', 'Puzzle', 'Peluche', 'Jeux de société'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-4 py-2 bg-mint/10 text-mint rounded-full text-sm font-medium hover:bg-mint/20 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Résultats de recherche */}
        {searchQuery && searchResults.length > 0 && (
          <div className="divide-y divide-gray-100 bg-white">
            <div className="px-4 py-2 bg-gray-50">
              <p className="text-xs text-slate">
                {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} pour <span className="font-semibold">"{searchQuery}"</span>
              </p>
            </div>
            
            {searchResults.map((toy) => (
              <Link
                key={toy.backendId ?? toy.id}
                href={`/jouets/${toy.slug}`}
                className="flex items-center gap-3 p-4 bg-white hover:bg-mint/5 transition active:bg-mint/10"
                onClick={onClose}
              >
                <div className="relative h-16 w-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  <Image
                    src={toy.image}
                    alt={toy.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-charcoal text-sm line-clamp-2 mb-1">
                    {toy.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate">
                    <span>{toy.category}</span>
                    <span className="w-1 h-1 bg-slate rounded-full"></span>
                    <span>{toy.age}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="text-sm font-bold text-mint">
                    {toy.price} DH
                  </div>
                </div>
              </Link>
            ))}
            
            {/* Footer avec bouton voir tous */}
            {searchResults.length >= 20 && (
              <div className="p-4 text-center bg-white border-t border-gray-100">
                <Link
                  href={`/recherche?q=${encodeURIComponent(searchQuery)}`}
                  className="inline-block text-sm text-mint font-medium hover:underline"
                  onClick={onClose}
                >
                  Voir tous les résultats →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Aucun résultat */}
        {searchQuery && searchResults.length === 0 && (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center bg-white">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-charcoal mb-2">
              Aucun résultat trouvé
            </h3>
            <p className="text-sm text-slate mb-6">
              Nous n'avons trouvé aucun jouet pour <span className="font-semibold">"{searchQuery}"</span>
            </p>
            <Link
              href="/jouets"
              className="px-6 py-3 bg-mint text-white rounded-xl font-medium hover:bg-mint/90 transition"
              onClick={onClose}
            >
              Parcourir tous les jouets
            </Link>
          </div>
        )}

        {/* Message d'encouragement */}
        {!searchQuery && (
          <div className="px-4 py-8 text-center bg-white">
            <div className="w-16 h-16 rounded-full bg-mint/10 flex items-center justify-center mx-auto mb-3">
              <Search className="w-8 h-8 text-mint" />
            </div>
            <p className="text-sm text-slate">
              Recherchez parmi nos {toys.length}+ jouets
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
