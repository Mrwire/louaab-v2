"use client";

import { useState } from "react";
import { ToyPricing } from "@/lib/toy-pricing";
import { 
  DollarSign, 
  Clock, 
  Calendar, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface ToyPricingDisplayProps {
  pricing: ToyPricing;
  onEdit: (pricing: ToyPricing) => void;
  onDelete: (pricingId: string) => void;
  onToggleActive: (pricingId: string) => void;
}

export function ToyPricingDisplay({ 
  pricing, 
  onEdit, 
  onDelete, 
  onToggleActive 
}: ToyPricingDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatPrice = (price: number) => {
    return `${price} MAD`;
  };

  const getRateColor = (rate: number, baseRate: number) => {
    if (rate <= baseRate) return 'text-green-600';
    if (rate <= baseRate * 1.2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${
            pricing.isActive ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <DollarSign className={`h-4 w-4 ${
              pricing.isActive ? 'text-green-600' : 'text-gray-400'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{pricing.name}</h3>
            <p className="text-sm text-gray-600">
              {pricing.isActive ? 'Actif' : 'Inactif'} • 
              Mis à jour le {new Date(pricing.updatedAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onEdit(pricing)}
            className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(pricing.id)}
            className="p-2 text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Prix principaux */}
      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Jour</span>
          </div>
          <p className="text-lg font-bold text-blue-600">
            {formatPrice(pricing.dailyPrice)}
          </p>
          {pricing.dailyRate && (
            <p className="text-xs text-gray-500">
              {pricing.dailyRate} MAD/jour
            </p>
          )}
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calendar className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Semaine</span>
          </div>
          <p className="text-lg font-bold text-green-600">
            {formatPrice(pricing.weeklyPrice)}
          </p>
          {pricing.weeklyRate && (
            <p className={`text-xs ${
              getRateColor(pricing.weeklyRate, pricing.dailyRate || pricing.dailyPrice)
            }`}>
              {pricing.weeklyRate.toFixed(1)} MAD/jour
            </p>
          )}
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Mois</span>
          </div>
          <p className="text-lg font-bold text-purple-600">
            {formatPrice(pricing.monthlyPrice)}
          </p>
          {pricing.monthlyRate && (
            <p className={`text-xs ${
              getRateColor(pricing.monthlyRate, pricing.dailyRate || pricing.dailyPrice)
            }`}>
              {pricing.monthlyRate.toFixed(1)} MAD/jour
            </p>
          )}
        </div>
      </div>

      {/* Détails étendus */}
      {showDetails && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Analyse des taux */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Analyse des taux</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Taux journalier:</span>
                  <span className="font-medium">{pricing.dailyRate || pricing.dailyPrice} MAD/jour</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taux hebdomadaire:</span>
                  <span className={`font-medium ${
                    getRateColor(pricing.weeklyRate || pricing.weeklyPrice / 7, pricing.dailyRate || pricing.dailyPrice)
                  }`}>
                    {(pricing.weeklyRate || pricing.weeklyPrice / 7).toFixed(1)} MAD/jour
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taux mensuel:</span>
                  <span className={`font-medium ${
                    getRateColor(pricing.monthlyRate || pricing.monthlyPrice / 30, pricing.dailyRate || pricing.dailyPrice)
                  }`}>
                    {(pricing.monthlyRate || pricing.monthlyPrice / 30).toFixed(1)} MAD/jour
                  </span>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Recommandations</h4>
              <div className="space-y-2">
                {pricing.weeklyRate && pricing.weeklyRate > (pricing.dailyRate || pricing.dailyPrice) * 1.2 && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700">
                      Le prix hebdomadaire pourrait être réduit pour plus d&apos;attractivité
                    </p>
                  </div>
                )}
                {pricing.monthlyRate && pricing.monthlyRate > (pricing.dailyRate || pricing.dailyPrice) * 1.2 && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700">
                      Le prix mensuel pourrait être réduit pour plus d&apos;attractivité
                    </p>
                  </div>
                )}
                {pricing.weeklyRate && pricing.weeklyRate <= (pricing.dailyRate || pricing.dailyPrice) && 
                 pricing.monthlyRate && pricing.monthlyRate <= (pricing.dailyRate || pricing.dailyPrice) && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-green-700">
                      Tarification cohérente et attractive
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={() => onToggleActive(pricing.id)}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            pricing.isActive
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {pricing.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {pricing.isActive ? 'Actif' : 'Inactif'}
        </button>
        
        <div className="text-xs text-gray-500">
          ID: {pricing.id.split('-')[1]}
        </div>
      </div>
    </div>
  );
}
