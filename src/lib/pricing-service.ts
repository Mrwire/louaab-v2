export interface PricingCalculation {
  basePrice: number;
  finalPrice: number;
  discount: number;
  discountPercentage: number;
  appliedRules: string[];
  pricingType: 'daily' | 'weekly' | 'monthly';
  savings?: number;
}

export interface PricingOptions {
  quantity?: number;
  startDate?: Date;
  endDate?: Date;
  customerType?: 'regular' | 'premium' | 'vip';
}

export class PricingService {
  /**
   * Calcule le prix pour un jouet selon la durée et les options
   */
  static calculatePrice(
    toy: {
      rentalPriceDaily: number;
      rentalPriceWeekly: number;
      rentalPriceMonthly: number;
      promotion?: {
        isActive: boolean;
        type: 'percentage' | 'fixed';
        value: string;
        label?: string;
      };
    },
    pricingType: 'daily' | 'weekly' | 'monthly',
    options: PricingOptions = {}
  ): PricingCalculation {
    const quantity = options.quantity || 1;
    
    // Prix de base selon le type
    let basePrice: number;
    switch (pricingType) {
      case 'daily':
        basePrice = toy.rentalPriceDaily || 0;
        break;
      case 'weekly':
        basePrice = toy.rentalPriceWeekly || 0;
        break;
      case 'monthly':
        basePrice = toy.rentalPriceMonthly || 0;
        break;
      default:
        basePrice = toy.rentalPriceDaily || 0;
    }

    // Calculer les économies par rapport au prix journalier
    let savings = 0;
    if (pricingType === 'weekly') {
      const dailyTotal = (toy.rentalPriceDaily || 0) * 7;
      savings = dailyTotal - basePrice;
    } else if (pricingType === 'monthly') {
      const dailyTotal = (toy.rentalPriceDaily || 0) * 30;
      savings = dailyTotal - basePrice;
    }

    // Appliquer les règles de prix (simulation pour le frontend)
    let finalPrice = basePrice * quantity;
    let discount = 0;
    let discountPercentage = 0;
    const appliedRules: string[] = [];

    // Règle de fidélité (exemple)
    if (options.customerType === 'premium' && quantity >= 2) {
      const loyaltyDiscount = finalPrice * 0.1; // 10% de réduction
      finalPrice -= loyaltyDiscount;
      discount += loyaltyDiscount;
      appliedRules.push('Remise Fidélité Premium');
    }

    // Règle de groupe (exemple)
    if (quantity >= 3) {
      const bulkDiscount = finalPrice * 0.15; // 15% de réduction
      finalPrice -= bulkDiscount;
      discount += bulkDiscount;
      appliedRules.push('Remise Groupe');
    }

    // Appliquer les promotions du jouet
    if (toy.promotion?.isActive) {
      let promotionDiscount = 0;
      if (toy.promotion.type === 'percentage') {
        promotionDiscount = finalPrice * (parseFloat(toy.promotion.value) / 100);
      } else if (toy.promotion.type === 'fixed') {
        promotionDiscount = parseFloat(toy.promotion.value);
      }
      
      finalPrice -= promotionDiscount;
      discount += promotionDiscount;
      appliedRules.push(toy.promotion.label || 'Promotion');
    }

    // Calculer le pourcentage de réduction total
    const totalBasePrice = basePrice * quantity;
    discountPercentage = totalBasePrice > 0 ? (discount / totalBasePrice) * 100 : 0;

    return {
      basePrice: totalBasePrice,
      finalPrice: Math.max(0, finalPrice),
      discount,
      discountPercentage,
      appliedRules,
      pricingType,
      savings: savings * quantity,
    };
  }

  /**
   * Génère les options de prix pour l'affichage
   */
  static generatePricingOptions(toy: {
    rentalPriceDaily: number;
    rentalPriceWeekly: number;
    rentalPriceMonthly: number;
    promotion?: {
      isActive: boolean;
      type: 'percentage' | 'fixed';
      value: string;
      label?: string;
    };
  }) {
    const dailyPrice = toy.rentalPriceDaily || 0;
    const weeklyPrice = toy.rentalPriceWeekly || 0;
    const monthlyPrice = toy.rentalPriceMonthly || 0;

    return [
      {
        type: 'daily' as const,
        label: 'Location Journalière',
        shortLabel: 'Par jour',
        description: 'Parfait pour tester le jouet',
        price: dailyPrice,
        icon: 'Clock',
        color: 'bg-sky-blue',
        popular: false,
      },
      {
        type: 'weekly' as const,
        label: 'Location Hebdomadaire',
        shortLabel: 'Par semaine',
        description: 'Meilleur rapport qualité/prix',
        price: weeklyPrice,
        originalPrice: dailyPrice * 7,
        discount: (dailyPrice * 7) - weeklyPrice,
        discountPercentage: dailyPrice > 0 ? Math.round(((dailyPrice * 7) - weeklyPrice) / (dailyPrice * 7) * 100) : 0,
        icon: 'Calendar',
        color: 'bg-mint',
        popular: true,
      },
      {
        type: 'monthly' as const,
        label: 'Location Mensuelle',
        shortLabel: 'Par mois',
        description: 'Maximum d\'économies pour une longue durée',
        price: monthlyPrice,
        originalPrice: dailyPrice * 30,
        discount: (dailyPrice * 30) - monthlyPrice,
        discountPercentage: dailyPrice > 0 ? Math.round(((dailyPrice * 30) - monthlyPrice) / (dailyPrice * 30) * 100) : 0,
        icon: 'TrendingUp',
        color: 'bg-lilac',
        recommended: true,
      },
    ];
  }

  /**
   * Formate un prix en MAD
   */
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Calcule les économies entre deux options de prix
   */
  static calculateSavings(
    fromPrice: number,
    toPrice: number,
    quantity: number = 1
  ): {
    amount: number;
    percentage: number;
  } {
    const totalFromPrice = fromPrice * quantity;
    const totalToPrice = toPrice * quantity;
    const savings = totalFromPrice - totalToPrice;
    const percentage = totalFromPrice > 0 ? (savings / totalFromPrice) * 100 : 0;

    return {
      amount: savings,
      percentage: Math.round(percentage),
    };
  }

  /**
   * Recommande la meilleure option de prix
   */
  static getRecommendedPricingType(toy: {
    rentalPriceDaily: number;
    rentalPriceWeekly: number;
    rentalPriceMonthly: number;
  }): 'daily' | 'weekly' | 'monthly' {
    const dailyPrice = toy.rentalPriceDaily || 0;
    const weeklyPrice = toy.rentalPriceWeekly || 0;
    const monthlyPrice = toy.rentalPriceMonthly || 0;

    // Calculer le rapport qualité/prix
    const weeklyValue = dailyPrice > 0 ? (dailyPrice * 7) / weeklyPrice : 0;
    const monthlyValue = dailyPrice > 0 ? (dailyPrice * 30) / monthlyPrice : 0;

    // Recommander l'option avec le meilleur rapport
    if (monthlyValue > 1.5) return 'monthly';
    if (weeklyValue > 1.2) return 'weekly';
    return 'daily';
  }
}
