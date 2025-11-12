"use client";

import { useState } from "react";
import { Clock, Calendar, TrendingUp, Star, Zap, CheckCircle } from "lucide-react";
import PricingSelector, { PricingOption } from "./pricing-selector";
import { PricingService } from "@/lib/pricing-service";

interface Toy {
  id: string;
  name: string;
  rentalPriceDaily: number;
  rentalPriceWeekly: number;
  rentalPriceMonthly: number;
  promotion?: {
    isActive: boolean;
    type: 'percentage' | 'fixed';
    value: string;
    label?: string;
  };
}

interface PricingDemoProps {
  toy: Toy;
  className?: string;
}

export default function PricingDemo({ toy, className = "" }: PricingDemoProps) {
  const [selectedPricingType, setSelectedPricingType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [quantity, setQuantity] = useState(1);
  const [customerType, setCustomerType] = useState<'regular' | 'premium' | 'vip'>('regular');

  // Générer les options de prix
  const pricingOptions: PricingOption[] = [
    {
      type: 'daily',
      label: 'Location Journalière',
      shortLabel: 'Par jour',
      description: 'Parfait pour tester le jouet',
      price: toy.rentalPriceDaily,
      icon: Clock,
      color: 'bg-sky-blue',
      popular: false,
    },
    {
      type: 'weekly',
      label: 'Location Hebdomadaire',
      shortLabel: 'Par semaine',
      description: 'Meilleur rapport qualité/prix',
      price: toy.rentalPriceWeekly,
      originalPrice: toy.rentalPriceDaily * 7,
      discount: (toy.rentalPriceDaily * 7) - toy.rentalPriceWeekly,
      discountPercentage: Math.round(((toy.rentalPriceDaily * 7) - toy.rentalPriceWeekly) / (toy.rentalPriceDaily * 7) * 100),
      icon: Calendar,
      color: 'bg-mint',
      popular: true,
    },
    {
      type: 'monthly',
      label: 'Location Mensuelle',
      shortLabel: 'Par mois',
      description: 'Maximum d\'économies pour une longue durée',
      price: toy.rentalPriceMonthly,
      originalPrice: toy.rentalPriceDaily * 30,
      discount: (toy.rentalPriceDaily * 30) - toy.rentalPriceMonthly,
      discountPercentage: Math.round(((toy.rentalPriceDaily * 30) - toy.rentalPriceMonthly) / (toy.rentalPriceDaily * 30) * 100),
      icon: TrendingUp,
      color: 'bg-lilac',
      recommended: true,
    },
  ];

  // Calculer le prix avec le service
  const pricingCalculation = PricingService.calculatePrice(
    toy,
    selectedPricingType,
    {
      quantity,
      customerType,
    }
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec informations du jouet */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-charcoal mb-2">{toy.name}</h2>
        <p className="text-slate">Choisissez votre durée de location</p>
      </div>

      {/* Sélecteur de type de client */}
      <div className="flex justify-center">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {[
            { value: 'regular', label: 'Standard', color: 'bg-gray-100 text-gray-700' },
            { value: 'premium', label: 'Premium', color: 'bg-mint/20 text-mint' },
            { value: 'vip', label: 'VIP', color: 'bg-lilac/20 text-lilac' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setCustomerType(type.value as any)}
              className={`px-4 py-2 text-sm font-medium transition ${
                customerType === type.value
                  ? type.color
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sélecteur de prix moderne */}
      <PricingSelector
        pricingOptions={pricingOptions}
        selectedType={selectedPricingType}
        onTypeChange={setSelectedPricingType}
        quantity={quantity}
        onQuantityChange={setQuantity}
      />

      {/* Détails du calcul */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-charcoal mb-4">Détail du calcul</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate">Prix de base ({selectedPricingType}):</span>
            <span className="font-medium">{PricingService.formatPrice(pricingCalculation.basePrice)}</span>
          </div>
          
          {pricingCalculation.discount > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-slate">Réductions appliquées:</span>
                <span className="font-medium text-green-600">-{PricingService.formatPrice(pricingCalculation.discount)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-slate">Pourcentage de réduction:</span>
                <span className="font-medium text-green-600">-{pricingCalculation.discountPercentage.toFixed(1)}%</span>
              </div>
            </>
          )}
          
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-charcoal">Total:</span>
              <span className="text-mint">{PricingService.formatPrice(pricingCalculation.finalPrice)}</span>
            </div>
          </div>
          
          {pricingCalculation.appliedRules.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-slate mb-2">Règles appliquées:</p>
              <div className="flex flex-wrap gap-2">
                {pricingCalculation.appliedRules.map((rule, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-mint/10 text-mint text-xs font-medium px-2 py-1 rounded-full"
                  >
                    <CheckCircle className="h-3 w-3" />
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparaison des options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-charcoal mb-4">Comparaison des options</h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          {pricingOptions.map((option) => {
            const calculation = PricingService.calculatePrice(toy, option.type, { quantity, customerType });
            const isSelected = selectedPricingType === option.type;
            
            return (
              <div
                key={option.type}
                className={`rounded-lg border p-4 transition ${
                  isSelected 
                    ? 'border-mint bg-mint/5' 
                    : 'border-gray-200 hover:border-mint/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-charcoal">{option.label}</h4>
                  {option.popular && (
                    <span className="bg-mint text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Populaire
                    </span>
                  )}
                  {option.recommended && (
                    <span className="bg-lilac text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Recommandé
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-charcoal">
                    {PricingService.formatPrice(calculation.finalPrice)}
                  </div>
                  
                  {calculation.discount > 0 && (
                    <div className="text-sm text-green-600">
                      Économie: {PricingService.formatPrice(calculation.discount)}
                    </div>
                  )}
                  
                  <div className="text-xs text-slate">
                    {option.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
