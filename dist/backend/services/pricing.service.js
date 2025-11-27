"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const toy_entity_1 = require("../entities/toy.entity");
const pricing_rule_entity_1 = require("../entities/pricing-rule.entity");
const price_history_entity_1 = require("../entities/price-history.entity");
let PricingService = class PricingService {
    constructor(toyRepository, pricingRuleRepository, priceHistoryRepository) {
        this.toyRepository = toyRepository;
        this.pricingRuleRepository = pricingRuleRepository;
        this.priceHistoryRepository = priceHistoryRepository;
    }
    /**
     * Calcule le prix final pour un jouet selon la durée et les règles de prix
     */
    async calculatePrice(toyId, pricingType, options = {}) {
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
    getBasePrice(toy, pricingType) {
        switch (pricingType) {
            case pricing_rule_entity_1.PricingType.DAILY:
                return toy.rentalPriceDaily || 0;
            case pricing_rule_entity_1.PricingType.WEEKLY:
                return toy.rentalPriceWeekly || 0;
            case pricing_rule_entity_1.PricingType.MONTHLY:
                return toy.rentalPriceMonthly || 0;
            default:
                return toy.rentalPriceDaily || 0;
        }
    }
    /**
     * Récupère les règles de prix applicables
     */
    async getApplicableRules(toyId, pricingType, options) {
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
    applyPricingRules(basePrice, rules, options) {
        let finalPrice = basePrice;
        let totalDiscount = 0;
        const appliedRules = [];
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
    isRuleApplicable(rule, options) {
        // Vérifier la quantité
        if (options.quantity) {
            if (rule.minQuantity && options.quantity < rule.minQuantity)
                return false;
            if (rule.maxQuantity && options.quantity > rule.maxQuantity)
                return false;
        }
        // Vérifier les dates
        const now = new Date();
        if (rule.validFrom && rule.validFrom > now)
            return false;
        if (rule.validUntil && rule.validUntil < now)
            return false;
        return true;
    }
    /**
     * Applique une règle de prix
     */
    applyRule(basePrice, rule) {
        let newPrice = basePrice;
        let discount = 0;
        switch (rule.ruleType) {
            case pricing_rule_entity_1.PricingRuleType.BASE_PRICE:
                newPrice = rule.price;
                break;
            case pricing_rule_entity_1.PricingRuleType.DISCOUNT:
                if (rule.discountPercentage) {
                    discount = (basePrice * rule.discountPercentage) / 100;
                    newPrice = basePrice - discount;
                }
                else if (rule.discountAmount) {
                    discount = rule.discountAmount;
                    newPrice = basePrice - discount;
                }
                break;
            case pricing_rule_entity_1.PricingRuleType.SURCHARGE:
                if (rule.discountPercentage) {
                    const surcharge = (basePrice * rule.discountPercentage) / 100;
                    newPrice = basePrice + surcharge;
                }
                else if (rule.discountAmount) {
                    newPrice = basePrice + rule.discountAmount;
                }
                break;
        }
        return { newPrice, discount };
    }
    /**
     * Met à jour les prix d'un jouet
     */
    async updateToyPrices(toyId, prices, reason, changedBy) {
        const toy = await this.toyRepository.findOne({ where: { id: toyId } });
        if (!toy) {
            throw new Error('Jouet non trouvé');
        }
        const priceUpdates = [];
        // Mettre à jour les prix dans l'entité Toy
        if (prices.daily !== undefined && prices.daily !== toy.rentalPriceDaily) {
            priceUpdates.push({
                type: pricing_rule_entity_1.PricingType.DAILY,
                oldPrice: toy.rentalPriceDaily || 0,
                newPrice: prices.daily,
            });
            toy.rentalPriceDaily = prices.daily;
        }
        if (prices.weekly !== undefined && prices.weekly !== toy.rentalPriceWeekly) {
            priceUpdates.push({
                type: pricing_rule_entity_1.PricingType.WEEKLY,
                oldPrice: toy.rentalPriceWeekly || 0,
                newPrice: prices.weekly,
            });
            toy.rentalPriceWeekly = prices.weekly;
        }
        if (prices.monthly !== undefined && prices.monthly !== toy.rentalPriceMonthly) {
            priceUpdates.push({
                type: pricing_rule_entity_1.PricingType.MONTHLY,
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
    async createPricingRule(ruleData) {
        const rule = this.pricingRuleRepository.create(ruleData);
        return await this.pricingRuleRepository.save(rule);
    }
    /**
     * Obtient l'historique des prix pour un jouet
     */
    async getPriceHistory(toyId, pricingType) {
        const query = this.priceHistoryRepository
            .createQueryBuilder('history')
            .where('history.toyId = :toyId', { toyId })
            .orderBy('history.effectiveDate', 'DESC');
        if (pricingType) {
            query.andWhere('history.pricingType = :pricingType', { pricingType });
        }
        return await query.getMany();
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(toy_entity_1.Toy)),
    __param(1, (0, typeorm_1.InjectRepository)(pricing_rule_entity_1.PricingRule)),
    __param(2, (0, typeorm_1.InjectRepository)(price_history_entity_1.PriceHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PricingService);
