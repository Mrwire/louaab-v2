"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Eye } from "lucide-react";
import { ToyData } from "@/lib/toys-data";
import CartButton from "./cart-button";
import { useFavorites } from "@/contexts/favorites-context";
import { useToyStock } from "@/contexts/stock-context";
import { triggerConfetti } from "@/lib/confetti";

interface ToyCardWithReservationProps {
  toy: ToyData;
  priority?: boolean;
}

export default function ToyCardWithReservation({ toy, priority = false }: ToyCardWithReservationProps) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const toyKey = toy.backendId ?? String(toy.id);

  // Real-time stock from WebSocket
  const { stockQuantity: wsStock, isConnected } = useToyStock(toyKey);

  const handleToggleFavorite = (e: React.MouseEvent, toyId: string) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    const wasNotFavorite = !isFavorite(toyId);
    toggleFavorite(toyId);

    // Déclencher confetti uniquement quand on ajoute aux favoris
    if (wasNotFavorite) {
      triggerConfetti();
    }
  };

  // Parse rating to get star count
  const getRatingStars = (rating: string) => {
    const match = rating?.match(/(\d+)/);
    const stars = match ? parseInt(match[1]) : 0;
    return '⭐'.repeat(stars);
  };

  // Format price
  const formatPrice = (price?: string) => {
    if (!price) return 'Prix sur demande';
    return price;
  };

  return (
    <Link
      href={`/jouets/${toy.slug}`}
      className="group block cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={toy.image}
          alt={toy.name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain transition duration-500 group-hover:scale-105"
        />

        {/* Badge pour image manquante */}
        {!toy.hasImage && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Image à venir
          </div>
        )}

        {/* Badge promotion */}
        {toy.promotion?.isActive && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <span>🎯</span>
            {toy.promotion.label || 'Promo'}
          </div>
        )}

        {/* Quick Actions - Now always visible */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 opacity-80 transition duration-300 hover:opacity-100">
          <button
            onClick={(e) => handleToggleFavorite(e, toyKey)}
            className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${isFavorite(toyKey)
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white text-charcoal hover:bg-red-500 hover:text-white'
              }`}
            title={isFavorite(toyKey) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart size={18} className={isFavorite(toyKey) ? 'fill-white' : ''} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/jouets/${toy.slug}`);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-charcoal shadow-lg transition hover:bg-[#1897aa] hover:text-white"
          >
            <Eye size={18} />
          </button>
          <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <CartButton toy={toy} allowDirectAdd={true} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-charcoal shadow-lg transition hover:bg-[#1897aa] hover:text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate">
          {toy.category?.split(',').filter(cat => !cat.toLowerCase().includes('mois')).join(', ') || 'Non spécifié'}
        </p>
        <h3 className="mt-2 text-lg font-bold text-charcoal group-hover:text-mint transition-colors">
          {toy.name}
        </h3>
        <p className="mt-1 text-sm text-slate">{toy.age || 'Tous âges'}</p>

        {/* Rating */}
        {toy.rating && (
          <div className="mt-3 flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => {
                const rating = parseInt(toy.rating?.match(/\d+/)?.[0] || '0');
                return (
                  <span
                    key={i}
                    className={
                      i < rating ? "text-sunshine-yellow" : "text-mist"
                    }
                  >
                    ★
                  </span>
                );
              })}
            </div>
            <span className="text-xs text-slate ml-1">
              ({toy.rating})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-4">
          {toy.promotion?.isActive ? (
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600">
                  {toy.promotion.type === 'percentage'
                    ? `${toy.promotion.value}% de réduction`
                    : toy.promotion.type === 'fixed'
                      ? `-${toy.promotion.value} MAD`
                      : toy.promotion.value
                  }
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(toy.price)}
                </span>
                <span className="text-sm text-slate">/mois</span>
              </div>
              <div className="text-xs text-green-600 font-semibold">
                {toy.promotion.label || 'Offre spéciale'}
              </div>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-mint">
                {formatPrice(toy.price)}
              </span>
              <span className="text-sm text-slate">/mois</span>
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-slate">
          {(() => {
            // Use WebSocket stock if connected and available, otherwise fallback to static
            const currentStock = wsStock !== undefined ? wsStock : parseInt(String(toy.stock ?? 0));
            return currentStock > 0 ? (
              <span className="text-green-600">✓ En stock ({currentStock})</span>
            ) : (
              <span className="text-red-500">✗ Rupture de stock</span>
            );
          })()}
        </p>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/jouets/${toy.slug}`);
            }}
            className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2 text-center text-sm font-semibold text-charcoal transition hover:bg-gray-50"
          >
            Voir détails
          </button>
          <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="flex-1">
            <CartButton toy={toy} allowDirectAdd={true} className="w-full" />
          </div>
        </div>
      </div>
    </Link>
  );
}
