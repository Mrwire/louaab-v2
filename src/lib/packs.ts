export interface Pack {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  toyCount: number;
  durationMonths: number;
  depositAmount: number;
  swapIncluded: boolean;
  swapFrequencyDays?: number;
  citiesAvailable: string[];
  isActive: boolean;
  displayOrder: number;
  badge?: string;
  color: string;
  icon: string;
  ageRange: string;
  features: string[];
}

// Packs par défaut
const defaultPacks: Pack[] = [
  {
    id: "mini",
    name: "Mini Pack",
    slug: "mini-pack",
    description: "Parfait pour débuter",
    priceMonthly: 199,
    toyCount: 3,
    durationMonths: 1,
    depositAmount: 100,
    swapIncluded: true,
    swapFrequencyDays: 30,
    citiesAvailable: ["Casablanca", "Rabat"],
    isActive: true,
    displayOrder: 1,
    badge: undefined,
    color: "mint",
    icon: "🎈",
    ageRange: "0-8 ans",
    features: [
      "3 jouets par mois",
      "Échanges illimités",
      "Livraison gratuite à Casa & Rabat",
      "Nettoyage & désinfection",
      "Sans engagement",
    ]
  },
  {
    id: "maxi",
    name: "Maxi Pack",
    slug: "maxi-pack",
    description: "Le plus populaire",
    priceMonthly: 349,
    toyCount: 5,
    durationMonths: 1,
    depositAmount: 150,
    swapIncluded: true,
    swapFrequencyDays: 30,
    citiesAvailable: ["Casablanca", "Rabat"],
    isActive: true,
    displayOrder: 2,
    badge: "Le plus populaire",
    color: "peach",
    icon: "🎁",
    ageRange: "0-8 ans",
    features: [
      "5 jouets par mois",
      "Échanges illimités",
      "Livraison gratuite à Casa & Rabat",
      "Nettoyage & désinfection",
      "Sans engagement",
      "Priorité sur les nouveautés",
    ]
  },
  {
    id: "mega",
    name: "Mega Pack",
    slug: "mega-pack",
    description: "Pour les familles nombreuses",
    priceMonthly: 499,
    toyCount: 8,
    durationMonths: 1,
    depositAmount: 200,
    swapIncluded: true,
    swapFrequencyDays: 30,
    citiesAvailable: ["Casablanca", "Rabat", "Bouskoura"],
    isActive: true,
    displayOrder: 3,
    badge: undefined,
    color: "lilac",
    icon: "🎉",
    ageRange: "0-8 ans",
    features: [
      "8 jouets par mois",
      "Échanges illimités",
      "Livraison gratuite partout au Maroc",
      "Nettoyage & désinfection",
      "Sans engagement",
      "Priorité sur les nouveautés",
      "Conseils personnalisés",
    ]
  }
];

export class PackManager {
  private static STORAGE_KEY = 'admin-packs';

  // Charger tous les packs
  static getAllPacks(): Pack[] {
    if (typeof window === 'undefined') return defaultPacks;
    
    try {
      const savedPacks = localStorage.getItem(this.STORAGE_KEY);
      if (savedPacks) {
        return JSON.parse(savedPacks);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des packs:', error);
    }
    
    return defaultPacks;
  }

  // Charger seulement les packs actifs
  static getActivePacks(): Pack[] {
    return this.getAllPacks().filter(pack => pack.isActive);
  }

  // Obtenir un pack par ID
  static getPackById(id: string): Pack | undefined {
    return this.getAllPacks().find(pack => pack.id === id);
  }

  // Sauvegarder les packs
  static savePacks(packs: Pack[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(packs));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des packs:', error);
    }
  }

  // Ajouter un nouveau pack
  static addPack(pack: Pack): void {
    const packs = this.getAllPacks();
    packs.push(pack);
    this.savePacks(packs);
  }

  // Mettre à jour un pack
  static updatePack(id: string, updatedPack: Pack): void {
    const packs = this.getAllPacks();
    const index = packs.findIndex(pack => pack.id === id);
    if (index !== -1) {
      packs[index] = updatedPack;
      this.savePacks(packs);
    }
  }

  // Supprimer un pack
  static deletePack(id: string): void {
    const packs = this.getAllPacks();
    const filteredPacks = packs.filter(pack => pack.id !== id);
    this.savePacks(filteredPacks);
  }

  // Toggle l'état actif d'un pack
  static togglePackActive(id: string): void {
    const packs = this.getAllPacks();
    const pack = packs.find(p => p.id === id);
    if (pack) {
      pack.isActive = !pack.isActive;
      this.savePacks(packs);
    }
  }

  // Réinitialiser aux packs par défaut
  static resetToDefault(): void {
    this.savePacks(defaultPacks);
  }

  // Exporter les packs (pour sauvegarde)
  static exportPacks(): string {
    return JSON.stringify(this.getAllPacks(), null, 2);
  }

  // Importer des packs (pour restauration)
  static importPacks(jsonData: string): boolean {
    try {
      const packs = JSON.parse(jsonData);
      if (Array.isArray(packs)) {
        this.savePacks(packs);
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de l\'importation des packs:', error);
    }
    return false;
  }
}
