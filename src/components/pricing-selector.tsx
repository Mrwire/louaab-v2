"use client";

import { useState } from "react";

export interface PricingOption {
  type: "daily" | "weekly" | "monthly";
  label: string;
  shortLabel: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  discountPercentage?: number;
  badge?: string;
  icon?: React.ComponentType<any>;
  color?: string;
  savings?: number;
  popular?: boolean;
  recommended?: boolean;
}

interface PricingSelectorProps {
  pricingOptions: PricingOption[];
  selectedType: "daily" | "weekly" | "monthly";
  onTypeChange: (type: "daily" | "weekly" | "monthly") => void;
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
        <div>
          <h3 className="text-lg font-bold text-charcoal md:text-xl">Prix de location</h3>
        </div>

        {onQuantityChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate">Qté:</span>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-1">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-gray-600 shadow-sm transition hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-6 text-center text-sm font-medium text-charcoal">{quantity}</span>
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-gray-600 shadow-sm transition hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 px-2 sm:grid-cols-2 lg:grid-cols-3">
        {pricingOptions.map((option) => {
          const isSelected = selectedType === option.type;
          const isHovered = hoveredOption === option.type;

          return (
            <div
              key={option.type}
              onClick={() => onTypeChange(option.type)}
              onMouseEnter={() => setHoveredOption(option.type)}
              onMouseLeave={() => setHoveredOption(null)}
              className={`
                relative cursor-pointer rounded-lg border p-3 transition-all duration-200
                ${
                  isSelected
                    ? "border-mint bg-mint/5 shadow-md"
                    : isHovered
                      ? "border-mint/30 bg-mint/10"
                      : "border-gray-200 bg-white hover:border-mint/30"
                }
              `}
            >
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-semibold leading-tight text-charcoal">{option.shortLabel}</h4>
                {isSelected && <span className="text-[10px] font-semibold text-mint">Sélectionné</span>}
              </div>

              <div className="whitespace-nowrap text-xl font-bold text-charcoal">
                {formatPrice(option.price)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
