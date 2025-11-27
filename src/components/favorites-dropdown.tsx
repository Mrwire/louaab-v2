"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, X } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import { useCart } from "@/contexts/cart-context";
import { getAllToys, ToyData } from "@/lib/toys-data";
import { formatDateInput } from "@/lib/date";

export default function FavoritesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [favoriteToys, setFavoriteToys] = useState<ToyData[]>([]);
  const { favorites, removeFromFavorites } = useFavorites();
  const { items, addToCart } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Charger les données des jouets favoris
  useEffect(() => {
    const fetchFavorites = async () => {
      const allToys = await getAllToys();
      const filtered = allToys.filter((toy) => {
        const toyKey = String(toy.backendId ?? toy.id);
        return favorites.includes(toyKey);
      });
      setFavoriteToys(filtered);
    };
    fetchFavorites();
  }, [favorites]);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Vérifier si un jouet est dans le panier (peu importe la durée)
  const isInCart = (toyId: string): boolean => {
    return items.some(item => {
      const itemKey = String(item.toy.backendId ?? item.toy.id);
      return itemKey === toyId;
    });
  };

  const handleAddToCart = (toy: ToyData) => {
    const defaultDuration = "weekly"; // Duree par defaut
    const defaultDate = formatDateInput();
    addToCart(toy, defaultDuration, defaultDate);
    
    // Effet confetti
    const confettiCount = 15;
    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.innerHTML = '✅';
        confetti.style.position = 'fixed';
        confetti.style.left = `${Math.random() * window.innerWidth}px`;
        confetti.style.top = '-50px';
        confetti.style.fontSize = `${Math.random() * 15 + 10}px`;
        confetti.style.opacity = '1';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.transition = 'all 1.5s ease-out';
        document.body.appendChild(confetti);
        
        setTimeout(() => {
          confetti.style.top = `${window.innerHeight + 50}px`;
          confetti.style.left = `${parseInt(confetti.style.left) + (Math.random() - 0.5) * 150}px`;
          confetti.style.opacity = '0';
          confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        }, 10);
        
        setTimeout(() => {
          confetti.remove();
        }, 1500);
      }, i * 25);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton Favoris avec compteur */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-mist text-charcoal transition hover:border-mint hover:bg-mint/10"
        aria-label="Favoris"
      >
        <Heart size={18} className={favorites.length > 0 ? 'fill-red-500 text-red-500' : ''} />
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {favorites.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-mist bg-white shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="border-b border-mist px-4 py-3">
            <h3 className="text-lg font-semibold text-charcoal flex items-center gap-2">
              <Heart size={18} className="text-red-500 fill-red-500" />
              Mes favoris
              <span className="ml-auto text-sm font-normal text-slate">
                {favorites.length} {favorites.length > 1 ? 'jouets' : 'jouet'}
              </span>
            </h3>
          </div>

          {/* Liste des favoris */}
          <div className="max-h-96 overflow-y-auto">
            {favoriteToys.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Heart size={48} className="mx-auto mb-3 text-slate opacity-20" />
                <p className="text-slate text-sm">
                  Aucun favori pour le moment
                </p>
                <p className="text-slate text-xs mt-1">
                  Cliquez sur ❤️ pour ajouter des jouets
                </p>
              </div>
            ) : (
              <div className="divide-y divide-mist">
                {favoriteToys.map((toy) => {
                  const toyKey = String(toy.backendId ?? toy.id);
                  return (
                    <div key={toyKey} className="px-4 py-3 hover:bg-mint/5 transition group">
                      <div className="flex gap-3">
                      {/* Image */}
                      <Link href={`/jouets/${toy.slug}`} className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={toy.image}
                          alt={toy.name}
                          fill
                          className="object-cover group-hover:scale-110 transition duration-300"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/jouets/${toy.slug}`}>
                          <h4 className="font-semibold text-charcoal text-sm line-clamp-1 group-hover:text-mint transition">
                            {toy.name}
                          </h4>
                        </Link>
                        <p className="text-xs text-slate mb-2 line-clamp-1">
                          {toy.category}
                        </p>
                        <div className="text-sm font-bold text-mint">
                          {toy.price}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 items-end">
                        <button
                          onClick={() => handleAddToCart(toy)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                          style={{
                            background: 'linear-gradient(to right, #1897aa, #0d74b1)',
                            color: '#ffffff'
                          }}
                          title={isInCart(toyKey) ? "Dans le panier" : "Ajouter au panier"}
                        >
                          {isInCart(toyKey) ? (
                            <span className="text-sm" style={{ color: '#ffffff' }}>✅</span>
                          ) : (
                            <ShoppingCart size={14} style={{ color: '#ffffff' }} />
                          )}
                        </button>
                        <button
                          onClick={() => removeFromFavorites(toyKey)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                          title="Retirer des favoris"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer avec action */}
          {favoriteToys.length > 0 && (
            <div className="border-t border-mist px-4 py-3">
              <Link
                href="/jouets"
                className="block text-center text-sm font-medium text-mint hover:text-mint/80 transition"
              >
                Voir tous les jouets →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
