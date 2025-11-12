"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { loadToysData, ToyData } from "@/lib/toys-data";

interface DesktopSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DesktopSearchModal({ isOpen, onClose }: DesktopSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [toys, setToys] = useState<ToyData[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Charger les jouets
  useEffect(() => {
    const fetchToys = async () => {
      const toysMapping = await loadToysData();
      const allToys = Object.values(toysMapping.toys);
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

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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

    return results.slice(0, 12); // Afficher 12 résultats sur desktop
  }, [searchQuery, toys]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white">
      {/* Modal */}
      <div 
        ref={modalRef}
        className="w-full h-full flex flex-col"
      >
        {/* Header de recherche */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white shadow-md">
          <div className="max-w-4xl mx-auto">
            {/* Logo et bouton fermer */}
            <div className="flex items-center justify-between mb-4">
              <Link href="/" onClick={onClose}>
                <Image
                  src="/logo.png"
                  alt="LOUAAB"
                  width={120}
                  height={40}
                  className="h-auto w-28"
                />
              </Link>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-mint hover:bg-mint/10 hover:text-mint transition"
                aria-label="Fermer la recherche"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher un jouet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 bg-white pl-12 pr-12 py-3.5 text-base text-charcoal placeholder:text-gray-400 focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto bg-white">
          {/* État initial - Suggestions */}
          {!searchQuery && (
            <div className="p-6 max-w-3xl mx-auto">
              <h3 className="text-sm font-semibold text-charcoal mb-3">Recherches populaires</h3>
              <div className="flex flex-wrap gap-2">
                {['Voiture', 'Poupée', 'Robot', 'Puzzle', 'Peluche', 'Jeux de société', 'Drone', 'Cuisine'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-4 py-2 bg-mint/10 text-mint rounded-full text-sm font-medium hover:bg-mint/20 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <div className="w-16 h-16 rounded-full bg-mint/10 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8 text-mint" />
                </div>
                <p className="text-sm text-slate">
                  Recherchez parmi nos {toys.length}+ jouets disponibles
                </p>
              </div>
            </div>
          )}

          {/* Résultats de recherche */}
          {searchQuery && searchResults.length > 0 && (
            <div className="max-w-3xl mx-auto">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-sm text-slate">
                  {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} pour <span className="font-semibold text-charcoal">"{searchQuery}"</span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 divide-y divide-gray-100">
                {searchResults.map((toy) => (
                  <Link
                    key={toy.id}
                    href={`/jouets/${toy.slug}`}
                    className="flex items-center gap-4 p-4 hover:bg-mint/5 transition group"
                    onClick={onClose}
                  >
                    <div className="relative h-20 w-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                      <Image
                        src={toy.image}
                        alt={toy.name}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-charcoal text-base line-clamp-1 mb-1 group-hover:text-mint transition">
                        {toy.name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-slate">
                        <span>{toy.category}</span>
                        <span className="w-1 h-1 bg-slate rounded-full"></span>
                        <span>{toy.age}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="text-base font-bold text-mint">
                        {toy.price} DH
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Footer avec bouton voir tous */}
              {searchResults.length >= 12 && (
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
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center max-w-3xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-sm text-slate mb-6">
                Nous n'avons trouvé aucun jouet pour <span className="font-semibold text-charcoal">"{searchQuery}"</span>
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
        </div>
      </div>
    </div>
  );
}
