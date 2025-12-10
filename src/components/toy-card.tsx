import Image from 'next/image';
import Link from 'next/link';
import { ToyData } from '@/lib/toys-data';

interface ToyCardProps {
  toy: ToyData;
  priority?: boolean;
}

export default function ToyCard({ toy, priority = false }: ToyCardProps) {
  // Parse rating to get star count
  const getRatingStars = (rating: string) => {
    const match = rating?.match(/(\d+)/);
    const stars = match ? parseInt(match[1]) : 0;
    return '⭐'.repeat(stars);
  };

  // Format price
  const formatPrice = (price: string) => {
    if (!price) return 'Prix sur demande';
    return price;
  };

  return (
    <Link
      href={`/jouets/${toy.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      {/* Image Container */}
      <div className="relative h-64 bg-gray-50 overflow-hidden">
        <Image
          src={toy.image}
          alt={toy.name}
          fill
          priority={priority}
          className="object-contain group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badge si nouveau ou populaire */}
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
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Nom du jouet */}
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {toy.name}
        </h3>

        {/* Description courte */}
        {toy.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {toy.description}
          </p>
        )}

        {/* Catégorie et âge */}
        <div className="flex flex-wrap gap-2 mb-3">
          {toy.age && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {toy.age}
            </span>
          )}
          {toy.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 line-clamp-1">
              {toy.category.split(',')[0].trim()}
            </span>
          )}
        </div>

        {/* Prix et rating */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="text-sm text-gray-500">Location</div>
            {toy.promotion?.isActive ? (
              <div className="space-y-1">
                <div className="text-lg font-bold text-green-600">
                  {toy.promotion.type === 'percentage'
                    ? `${toy.promotion.value}% de réduction`
                    : toy.promotion.type === 'fixed'
                      ? `-${toy.promotion.value} MAD`
                      : toy.promotion.value
                  }
                </div>
                <div className="text-sm text-gray-500 line-through">
                  {formatPrice(toy.price)}
                </div>
                <div className="text-xs text-green-600 font-semibold">
                  {toy.promotion.label || 'Offre spéciale'}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-lg font-bold text-mint">
                  {formatPrice(toy.price)}
                </div>
                <div className="text-xs text-slate">
                  À partir de
                </div>
              </div>
            )}
          </div>

          {toy.rating && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Note</div>
              <div className="text-sm">
                {getRatingStars(toy.rating)}
              </div>
            </div>
          )}
        </div>

        {/* Stock indicator */}
        {toy.stock && parseInt(toy.stock.toString()) > 0 ? (
          <div className="mt-3 flex items-center text-xs text-green-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            En stock
          </div>
        ) : (
          <div className="mt-3 text-xs text-rose-600">Pas en stock</div>
        )}
      </div>
    </Link>
  );
}


