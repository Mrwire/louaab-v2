export interface ToyPricing {
  id: string;
  toyId: string;
  name: string;
  // Prix par durée
  dailyPrice: number;      // Prix par jour
  weeklyPrice: number;     // Prix par semaine
  monthlyPrice: number;    // Prix par mois
  
  // Métadonnées
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Calculs automatiques
  dailyRate?: number;      // Taux journalier (prix/jour)
  weeklyRate?: number;     // Taux hebdomadaire (prix/semaine)
  monthlyRate?: number;    // Taux mensuel (prix/mois)
}

export interface ToyPricingFormData {
  name: string;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  isActive: boolean;
}

export class ToyPricingManager {
  private static STORAGE_KEY = 'toy-pricing';

  // Calculer les taux automatiquement
  static calculateRates(pricing: ToyPricing): ToyPricing {
    return {
      ...pricing,
      dailyRate: pricing.dailyPrice,
      weeklyRate: pricing.weeklyPrice / 7, // Prix par jour de la semaine
      monthlyRate: pricing.monthlyPrice / 30, // Prix par jour du mois
    };
  }

  // Obtenir tous les prix
  static getAllPricing(): ToyPricing[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const pricing = localStorage.getItem(this.STORAGE_KEY);
      return pricing ? JSON.parse(pricing) : [];
    } catch (error) {
      console.error('Erreur lors du chargement des prix:', error);
      return [];
    }
  }

  // Obtenir les prix actifs
  static getActivePricing(): ToyPricing[] {
    return this.getAllPricing().filter(p => p.isActive);
  }

  // Obtenir un prix par ID
  static getPricingById(id: string): ToyPricing | null {
    const allPricing = this.getAllPricing();
    return allPricing.find(p => p.id === id) || null;
  }

  // Obtenir un prix par ID de jouet
  static getPricingByToyId(toyId: string): ToyPricing | null {
    const allPricing = this.getAllPricing();
    return allPricing.find(p => p.toyId === toyId) || null;
  }

  // Sauvegarder un prix
  static savePricing(pricing: ToyPricing): void {
    if (typeof window === 'undefined') return;
    
    const allPricing = this.getAllPricing();
    const existingIndex = allPricing.findIndex(p => p.id === pricing.id);
    
    const pricingWithRates = this.calculateRates(pricing);
    
    if (existingIndex >= 0) {
      allPricing[existingIndex] = {
        ...pricingWithRates,
        updatedAt: new Date().toISOString()
      };
    } else {
      allPricing.push({
        ...pricingWithRates,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allPricing));
  }

  // Créer un nouveau prix
  static createPricing(toyId: string, formData: ToyPricingFormData): ToyPricing {
    const id = `pricing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const pricing: ToyPricing = {
      id,
      toyId,
      name: formData.name,
      dailyPrice: formData.dailyPrice,
      weeklyPrice: formData.weeklyPrice,
      monthlyPrice: formData.monthlyPrice,
      isActive: formData.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.savePricing(pricing);
    return pricing;
  }

  // Mettre à jour un prix et renvoyer la version mise à jour
  static updatePricing(id: string, formData: Partial<ToyPricingFormData>): ToyPricing | null {
    const pricing = this.getPricingById(id);
    if (!pricing) {
      return null;
    }

    const updatedPricing: ToyPricing = {
      ...pricing,
      ...formData,
      updatedAt: new Date().toISOString()
    };

    this.savePricing(updatedPricing);
    return updatedPricing;
  }

  // Supprimer un prix
  static deletePricing(id: string): void {
    const allPricing = this.getAllPricing();
    const filteredPricing = allPricing.filter(p => p.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredPricing));
  }

  // Toggle l'état actif
  static togglePricingActive(id: string): void {
    const pricing = this.getPricingById(id);
    if (!pricing) return;

    this.updatePricing(id, { isActive: !pricing.isActive });
  }

  // Obtenir les suggestions de prix basées sur un prix de base
  static getPriceSuggestions(basePrice: number): {
    daily: number;
    weekly: number;
    monthly: number;
  } {
    return {
      daily: Math.round(basePrice),
      weekly: Math.round(basePrice * 5), // 5 jours de location
      monthly: Math.round(basePrice * 20) // 20 jours de location
    };
  }

  // Valider les prix
  static validatePricing(pricing: Partial<ToyPricingFormData>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!pricing.name || pricing.name.trim().length === 0) {
      errors.push('Le nom du jouet est requis');
    }

    if (!pricing.dailyPrice || pricing.dailyPrice <= 0) {
      errors.push('Le prix journalier doit être supérieur à 0');
    }

    if (!pricing.weeklyPrice || pricing.weeklyPrice <= 0) {
      errors.push('Le prix hebdomadaire doit être supérieur à 0');
    }

    if (!pricing.monthlyPrice || pricing.monthlyPrice <= 0) {
      errors.push('Le prix mensuel doit être supérieur à 0');
    }

    // Validation de cohérence des prix
    if (pricing.dailyPrice && pricing.weeklyPrice && pricing.dailyPrice * 7 > pricing.weeklyPrice) {
      errors.push('Le prix hebdomadaire devrait être inférieur ou égal à 7x le prix journalier');
    }

    if (pricing.weeklyPrice && pricing.monthlyPrice && pricing.weeklyPrice * 4 > pricing.monthlyPrice) {
      errors.push('Le prix mensuel devrait être inférieur ou égal à 4x le prix hebdomadaire');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Exporter les prix
  static exportPricing(): string {
    return JSON.stringify(this.getAllPricing(), null, 2);
  }

  // Importer les prix
  static importPricing(jsonData: string): boolean {
    try {
      const pricing = JSON.parse(jsonData);
      if (Array.isArray(pricing)) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pricing));
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de l\'importation des prix:', error);
    }
    return false;
  }
}
