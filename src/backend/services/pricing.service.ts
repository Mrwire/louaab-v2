import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Toy } from '../entities/toy.entity';
import { PricingRule, PricingType, PricingRuleType } from '../entities/pricing-rule.entity';
import { PriceHistory } from '../entities/price-history.entity';

export interface PriceCalculationResult {
  basePrice: number;
  finalPrice: number;
  discount: number;
  discountPercentage: number;
  appliedRules: string[];
  pricingType: PricingType;
}

export interface PricingOptions {
  quantity?: number;
  startDate?: Date;
  endDate?: Date;
  customerType?: 'regular' | 'premium' | 'vip';
}

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Toy)
    private toyRepository: Repository<Toy>,
    @InjectRepository(PricingRule)
    private pricingRuleRepository: Repository<PricingRule>,
    @InjectRepository(PriceHistory)
    private priceHistoryRepository: Repository<PriceHistory>,
  ) {}

  /**
   * Calcule le prix final pour un jouet selon la durée et les règles de prix
   */
  async calculatePrice(
    toyId: string,
    pricingType: PricingType,
    options: PricingOptions = {},
  ): Promise<PriceCalculationResult> {
    const toy = await this.toyRepository.findOne({
      where: { id: toyId },
      relations: ['categories'],
    });

    if (!toy) {
      throw new Error('Jouet non trouvé');
    }

    // Prix de base selon le type
    const basePrice = this.getBasePrice(toy, pricingType);
    
    // Récupérer les règles de prix applicables
    const applicableRules = await this.getApplicableRules(toyId, pricingType, options);
    
    // Calculer le prix final
    const calculation = this.applyPricingRules(basePrice, applicableRules, options);
    
    return {
      basePrice,
      finalPrice: calculation.finalPrice,
      discount: calculation.discount,
      discountPercentage: calculation.discountPercentage,
      appliedRules: calculation.appliedRules,
      pricingType,
    };
  }

  /**
   * Obtient le prix de base selon le type de location
   */
  private getBasePrice(toy: Toy, pricingType: PricingType): number {
    switch (pricingType) {
      case PricingType.DAILY:
        return toy.rentalPriceDaily || 0;
      case PricingType.WEEKLY:
        return toy.rentalPriceWeekly || 0;
      case PricingType.MONTHLY:
        return toy.rentalPriceMonthly || 0;
      default:
        return toy.rentalPriceDaily || 0;
    }
  }

  /**
   * Récupère les règles de prix applicables
   */
  private async getApplicableRules(
    toyId: string,
    pricingType: PricingType,
    options: PricingOptions,
  ): Promise<PricingRule[]> {
    const query = this.pricingRuleRepository
      .createQueryBuilder('rule')
      .where('rule.isActive = :isActive', { isActive: true })
      .andWhere('rule.pricingType = :pricingType', { pricingType })
      .andWhere('(rule.toyId = :toyId OR rule.toyId IS NULL)', { toyId })
      .orderBy('rule.priority', 'DESC')
      .addOrderBy('rule.isDefault', 'DESC');

    // Filtres par date si spécifiés
    if (options.startDate) {
      query.andWhere('(rule.validFrom IS NULL OR rule.validFrom <= :startDate)', {
        startDate: options.startDate,
      });
    }

    if (options.endDate) {
      query.andWhere('(rule.validUntil IS NULL OR rule.validUntil >= :endDate)', {
        endDate: options.endDate,
      });
    }

    // Filtres par quantité
    if (options.quantity) {
      query.andWhere('(rule.minQuantity IS NULL OR rule.minQuantity <= :quantity)', {
        quantity: options.quantity,
      });
      query.andWhere('(rule.maxQuantity IS NULL OR rule.maxQuantity >= :quantity)', {
        quantity: options.quantity,
      });
    }

    return await query.getMany();
  }

  /**
   * Applique les règles de prix pour calculer le prix final
   */
  private applyPricingRules(
    basePrice: number,
    rules: PricingRule[],
    options: PricingOptions,
  ): {
    finalPrice: number;
    discount: number;
    discountPercentage: number;
    appliedRules: string[];
  } {
    let finalPrice = basePrice;
    let totalDiscount = 0;
    const appliedRules: string[] = [];

    // Trier les règles par priorité
    const sortedRules = rules.sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      if (this.isRuleApplicable(rule, options)) {
        const ruleResult = this.applyRule(finalPrice, rule);
        finalPrice = ruleResult.newPrice;
        totalDiscount += ruleResult.discount;
        appliedRules.push(rule.name);
      }
    }

    const discountPercentage = basePrice > 0 ? (totalDiscount / basePrice) * 100 : 0;

    return {
      finalPrice: Math.max(0, finalPrice), // Prix ne peut pas être négatif
      discount: totalDiscount,
      discountPercentage,
      appliedRules,
    };
  }

  /**
   * Vérifie si une règle est applicable
   */
  private isRuleApplicable(rule: PricingRule, options: PricingOptions): boolean {
    // Vérifier la quantité
    if (options.quantity) {
      if (rule.minQuantity && options.quantity < rule.minQuantity) return false;
      if (rule.maxQuantity && options.quantity > rule.maxQuantity) return false;
    }

    // Vérifier les dates
    const now = new Date();
    if (rule.validFrom && rule.validFrom > now) return false;
    if (rule.validUntil && rule.validUntil < now) return false;

    return true;
  }

  /**
   * Applique une règle de prix
   */
  private applyRule(basePrice: number, rule: PricingRule): {
    newPrice: number;
    discount: number;
  } {
    let newPrice = basePrice;
    let discount = 0;

    switch (rule.ruleType) {
      case PricingRuleType.BASE_PRICE:
        newPrice = rule.price;
        break;
      
      case PricingRuleType.DISCOUNT:
        if (rule.discountPercentage) {
          discount = (basePrice * rule.discountPercentage) / 100;
          newPrice = basePrice - discount;
        } else if (rule.discountAmount) {
          discount = rule.discountAmount;
          newPrice = basePrice - discount;
        }
        break;
      
      case PricingRuleType.SURCHARGE:
        if (rule.discountPercentage) {
          const surcharge = (basePrice * rule.discountPercentage) / 100;
          newPrice = basePrice + surcharge;
        } else if (rule.discountAmount) {
          newPrice = basePrice + rule.discountAmount;
        }
        break;
    }

    return { newPrice, discount };
  }

  /**
   * Met à jour les prix d'un jouet
   */
  async updateToyPrices(
    toyId: string,
    prices: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    },
    reason: string,
    changedBy: string,
  ): Promise<void> {
    const toy = await this.toyRepository.findOne({ where: { id: toyId } });
    if (!toy) {
      throw new Error('Jouet non trouvé');
    }

    const priceUpdates: Array<{
      type: PricingType;
      oldPrice: number;
      newPrice: number;
    }> = [];

    // Mettre à jour les prix dans l'entité Toy
    if (prices.daily !== undefined && prices.daily !== toy.rentalPriceDaily) {
      priceUpdates.push({
        type: PricingType.DAILY,
        oldPrice: toy.rentalPriceDaily || 0,
        newPrice: prices.daily,
      });
      toy.rentalPriceDaily = prices.daily;
    }

    if (prices.weekly !== undefined && prices.weekly !== toy.rentalPriceWeekly) {
      priceUpdates.push({
        type: PricingType.WEEKLY,
        oldPrice: toy.rentalPriceWeekly || 0,
        newPrice: prices.weekly,
      });
      toy.rentalPriceWeekly = prices.weekly;
    }

    if (prices.monthly !== undefined && prices.monthly !== toy.rentalPriceMonthly) {
      priceUpdates.push({
        type: PricingType.MONTHLY,
        oldPrice: toy.rentalPriceMonthly || 0,
        newPrice: prices.monthly,
      });
      toy.rentalPriceMonthly = prices.monthly;
    }

    // Sauvegarder les changements
    await this.toyRepository.save(toy);

    // Enregistrer l'historique des prix
    for (const update of priceUpdates) {
      const priceHistory = this.priceHistoryRepository.create({
        toyId,
        pricingType: update.type,
        oldPrice: update.oldPrice,
        newPrice: update.newPrice,
        changeReason: reason,
        changedBy,
        effectiveDate: new Date(),
      });
      await this.priceHistoryRepository.save(priceHistory);
    }
  }

  /**
   * Crée une nouvelle règle de prix
   */
  async createPricingRule(ruleData: {
    name: string;
    description?: string;
    ruleType: PricingRuleType;
    pricingType: PricingType;
    price?: number;
    discountPercentage?: number;
    discountAmount?: number;
    minQuantity?: number;
    maxQuantity?: number;
    validFrom?: Date;
    validUntil?: Date;
    toyId?: string;
    priority?: number;
    isDefault?: boolean;
  }): Promise<PricingRule> {
    const rule = this.pricingRuleRepository.create(ruleData);
    return await this.pricingRuleRepository.save(rule);
  }

  /**
   * Obtient l'historique des prix pour un jouet
   */
  async getPriceHistory(toyId: string, pricingType?: PricingType): Promise<PriceHistory[]> {
    const query = this.priceHistoryRepository
      .createQueryBuilder('history')
      .where('history.toyId = :toyId', { toyId })
      .orderBy('history.effectiveDate', 'DESC');

    if (pricingType) {
      query.andWhere('history.pricingType = :pricingType', { pricingType });
    }

    return await query.getMany();
  }
}
