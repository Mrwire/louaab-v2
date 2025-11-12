"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, TrendingUp, CheckCircle, Star, Zap } from "lucide-react";

export interface PricingOption {
  type: 'daily' | 'weekly' | 'monthly';
  label: string;
  shortLabel: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  discountPercentage?: number;
  badge?: string;
  icon: React.ComponentType<any>;
  color: string;
  savings?: number;
  popular?: boolean;
  recommended?: boolean;
}

interface PricingSelectorProps {
  pricingOptions: PricingOption[];
  selectedType: 'daily' | 'weekly' | 'monthly';
  onTypeChange: (type: 'daily' | 'weekly' | 'monthly') => void;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  className?: string;
}

export default function PricingSelector({
  pricingOptions,
  selectedType,
  onTypeChange,
  quantity = 1,
  onQuantityChange,
  className = "",
}: PricingSelectorProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const getTotalPrice = (option: PricingOption) => {
    const basePrice = option.discount ? option.price : option.originalPrice || option.price;
    return basePrice * quantity;
  };

  const getSavings = (option: PricingOption) => {
    if (!option.originalPrice || !option.discount) return 0;
    return (option.originalPrice - option.price) * quantity;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header compact avec titre et quantité sur la même ligne */}
      <div className="flex items-center justify-between px-4 max-w-7xl mx-auto">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-charcoal">
            Durée de location
          </h3>
          <p className="text-xs md:text-sm text-slate">
            Plus longtemps, plus d'économies
          </p>
        </div>
        
        {/* Sélecteur de quantité compact */}
        {onQuantityChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate">Qté:</span>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-gray-600 hover:bg-gray-100 transition shadow-sm"
              >
                -
              </button>
              <span className="w-6 text-center text-sm font-medium text-charcoal">
                {quantity}
              </span>
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-gray-600 hover:bg-gray-100 transition shadow-sm"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Options de prix */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-2 max-w-5xl mx-auto">
        {pricingOptions.map((option) => {
          const isSelected = selectedType === option.type;
          const isHovered = hoveredOption === option.type;
          const totalPrice = getTotalPrice(option);
          const savings = getSavings(option);
          const Icon = option.icon;

          return (
            <div
              key={option.type}
              onClick={() => onTypeChange(option.type)}
              onMouseEnter={() => setHoveredOption(option.type)}
              onMouseLeave={() => setHoveredOption(null)}
              className={`
                relative cursor-pointer rounded-lg border p-3 transition-all duration-200 overflow-hidden
                ${isSelected 
                  ? 'border-mint bg-mint/5 shadow-md' 
                  : isHovered 
                    ? 'border-mint/50 bg-mint/2' 
                    : 'border-gray-200 bg-white hover:border-mint/30'
                }
              `}
            >
              {/* Badge + Checkmark en ligne */}
              <div className="flex items-center justify-between mb-2">
                {/* Badge */}
                {option.popular && (
                  <span className="bg-mint text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <Star className="h-2 w-2" />
                    Pop
                  </span>
                )}
                {option.recommended && (
                  <span className="bg-lilac text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <Zap className="h-2 w-2" />
                    Top
                  </span>
                )}
                {!option.popular && !option.recommended && <div />}
                
                {/* Checkmark */}
                {isSelected && (
                  <CheckCircle className="h-4 w-4 text-mint" />
                )}
              </div>

              {/* Icône + Titre en ligne */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`rounded-md p-1.5 ${option.color} flex-shrink-0`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-charcoal text-xs leading-tight">{option.shortLabel}</h4>
                </div>
              </div>

              {/* Prix */}
              <div>
                {option.discount && option.originalPrice ? (
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-xl font-bold text-mint whitespace-nowrap">
                        {formatPrice(option.price)}
                      </span>
                      <span className="text-xs text-gray-400 line-through whitespace-nowrap">
                        {formatPrice(option.originalPrice)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="bg-green-100 text-green-700 text-[9px] font-semibold px-1 py-0.5 rounded whitespace-nowrap">
                        -{option.discountPercentage}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xl font-bold text-charcoal whitespace-nowrap">
                    {formatPrice(option.price)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Résumé supprimé par demande produit */}

      {/* Comparaison des économies supprimée par demande produit */}
    </div>
  );
}
