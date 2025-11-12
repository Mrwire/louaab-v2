"use client";

import { useState, useEffect } from "react";
import { ToyPricingManager, ToyPricing, ToyPricingFormData } from "@/lib/toy-pricing";
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  Save, 
  X, 
  AlertCircle,
  Calculator
} from "lucide-react";

interface ToyPricingFormProps {
  toyId: string;
  toyName: string;
  onSave: (pricing: ToyPricing) => void;
  onCancel: () => void;
  existingPricing?: ToyPricing | null;
}

export function ToyPricingForm({ 
  toyId, 
  toyName, 
  onSave, 
  onCancel, 
  existingPricing 
}: ToyPricingFormProps) {
  const [formData, setFormData] = useState<ToyPricingFormData>({
    name: toyName,
    dailyPrice: existingPricing?.dailyPrice || 0,
    weeklyPrice: existingPricing?.weeklyPrice || 0,
    monthlyPrice: existingPricing?.monthlyPrice || 0,
    isActive: existingPricing?.isActive ?? true
  });

  const [suggestions, setSuggestions] = useState<{
    daily: number;
    weekly: number;
    monthly: number;
  } | null>(null);

  const [validation, setValidation] = useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: true, errors: [] });

  // Calculer les suggestions quand le prix journalier change
  useEffect(() => {
    if (formData.dailyPrice > 0) {
      const suggestions = ToyPricingManager.getPriceSuggestions(formData.dailyPrice);
      setSuggestions(suggestions);
    }
  }, [formData.dailyPrice]);

  // Valider les données
  useEffect(() => {
    const validation = ToyPricingManager.validatePricing(formData);
    setValidation(validation);
  }, [formData]);

  const handleInputChange = (field: keyof ToyPricingFormData, value: number | string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applySuggestions = () => {
    if (suggestions) {
      setFormData(prev => ({
        ...prev,
        weeklyPrice: suggestions.weekly,
        monthlyPrice: suggestions.monthly
      }));
    }
  };

  const handleSave = () => {
    if (!validation.isValid) return;

    const pricing = existingPricing 
      ? ToyPricingManager.updatePricing(existingPricing.id, formData)
      : ToyPricingManager.createPricing(toyId, formData);

    if (!pricing) {
      console.error("La mise à jour de la tarification a échoué");
      return;
    }

    onSave(pricing);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-mint" />
            Tarification par durée
          </h3>
          <p className="text-sm text-gray-600">Définissez les prix pour {toyName}</p>
        </div>
        <button
          onClick={onCancel}
          className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Erreurs de validation */}
      {!validation.isValid && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-800">Erreurs de validation</h4>
              <ul className="text-sm text-red-700 mt-1 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de prix */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Prix journalier */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-blue-600" />
            <h4 className="font-semibold text-blue-800">Prix journalier</h4>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Prix par jour (MAD)</label>
            <input
              type="number"
              value={formData.dailyPrice}
              onChange={(e) => handleInputChange('dailyPrice', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
              placeholder="Ex: 15"
              min="0"
              step="0.5"
            />
            <p className="text-xs text-gray-600">
              Prix de base pour 1 jour de location
            </p>
          </div>
        </div>

        {/* Prix hebdomadaire */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-green-600" />
            <h4 className="font-semibold text-green-800">Prix hebdomadaire</h4>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Prix par semaine (MAD)</label>
            <input
              type="number"
              value={formData.weeklyPrice}
              onChange={(e) => handleInputChange('weeklyPrice', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
              placeholder="Ex: 75"
              min="0"
              step="0.5"
            />
            <p className="text-xs text-gray-600">
              {formData.weeklyPrice > 0 && formData.dailyPrice > 0 && (
                <span className={formData.weeklyPrice <= formData.dailyPrice * 7 ? 'text-green-600' : 'text-orange-600'}>
                  {Math.round((formData.weeklyPrice / 7) * 10) / 10} MAD/jour
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Prix mensuel */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-purple-600" />
            <h4 className="font-semibold text-purple-800">Prix mensuel</h4>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Prix par mois (MAD)</label>
            <input
              type="number"
              value={formData.monthlyPrice}
              onChange={(e) => handleInputChange('monthlyPrice', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
              placeholder="Ex: 300"
              min="0"
              step="0.5"
            />
            <p className="text-xs text-gray-600">
              {formData.monthlyPrice > 0 && formData.dailyPrice > 0 && (
                <span className={formData.monthlyPrice <= formData.dailyPrice * 30 ? 'text-green-600' : 'text-orange-600'}>
                  {Math.round((formData.monthlyPrice / 30) * 10) / 10} MAD/jour
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Suggestions automatiques */}
      {suggestions && formData.dailyPrice > 0 && (
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-4 w-4 text-yellow-600" />
            <h4 className="font-semibold text-yellow-800">Suggestions automatiques</h4>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-sm text-gray-600">Semaine suggérée</p>
              <p className="text-lg font-semibold text-yellow-800">{suggestions.weekly} MAD</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Mois suggéré</p>
              <p className="text-lg font-semibold text-yellow-800">{suggestions.monthly} MAD</p>
            </div>
            <div className="flex items-center justify-center">
              <button
                onClick={applySuggestions}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statut actif */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="rounded border-gray-300 text-mint focus:ring-mint"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Activer cette tarification
          </label>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Désactivez pour masquer temporairement cette tarification
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={!validation.isValid}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
            validation.isValid
              ? 'bg-mint text-white hover:bg-mint/90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Save className="h-4 w-4" />
          {existingPricing ? 'Mettre à jour' : 'Créer la tarification'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
