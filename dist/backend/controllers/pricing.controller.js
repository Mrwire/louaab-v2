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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingController = void 0;
const common_1 = require("@nestjs/common");
const pricing_service_1 = require("../services/pricing.service");
const pricing_dto_1 = require("../dto/pricing.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let PricingController = class PricingController {
    constructor(pricingService) {
        this.pricingService = pricingService;
    }
    /**
     * Calcule le prix pour un jouet
     */
    async calculatePrice(toyId, calculatePriceDto) {
        return await this.pricingService.calculatePrice(toyId, calculatePriceDto.pricingType, {
            quantity: calculatePriceDto.quantity,
            startDate: calculatePriceDto.startDate ? new Date(calculatePriceDto.startDate) : undefined,
            endDate: calculatePriceDto.endDate ? new Date(calculatePriceDto.endDate) : undefined,
            customerType: calculatePriceDto.customerType,
        });
    }
    /**
     * Met à jour les prix d'un jouet
     */
    async updateToyPrices(toyId, updateToyPricesDto) {
        await this.pricingService.updateToyPrices(toyId, {
            daily: updateToyPricesDto.daily,
            weekly: updateToyPricesDto.weekly,
            monthly: updateToyPricesDto.monthly,
        }, updateToyPricesDto.reason, 'admin');
        return { message: 'Prix mis à jour avec succès' };
    }
    /**
     * Crée une nouvelle règle de prix
     */
    async createPricingRule(createPricingRuleDto) {
        const { validFrom, validUntil } = createPricingRuleDto, ruleData = __rest(createPricingRuleDto, ["validFrom", "validUntil"]);
        return await this.pricingService.createPricingRule(Object.assign(Object.assign({}, ruleData), { validFrom: validFrom ? new Date(validFrom) : undefined, validUntil: validUntil ? new Date(validUntil) : undefined }));
    }
    /**
     * Met à jour une règle de prix
     */
    async updatePricingRule(ruleId, updatePricingRuleDto) {
        // TODO: Implémenter la mise à jour des règles
        throw new Error('Non implémenté');
    }
    /**
     * Supprime une règle de prix
     */
    async deletePricingRule(ruleId) {
        // TODO: Implémenter la suppression des règles
        throw new Error('Non implémenté');
    }
    /**
     * Obtient l'historique des prix pour un jouet
     */
    async getPriceHistory(toyId, pricingType) {
        return await this.pricingService.getPriceHistory(toyId, pricingType);
    }
    /**
     * Obtient toutes les règles de prix
     */
    async getAllPricingRules() {
        // TODO: Implémenter la récupération de toutes les règles
        throw new Error('Non implémenté');
    }
    /**
     * Obtient les règles de prix pour un jouet spécifique
     */
    async getPricingRulesForToy(toyId) {
        // TODO: Implémenter la récupération des règles pour un jouet
        throw new Error('Non implémenté');
    }
};
exports.PricingController = PricingController;
__decorate([
    (0, common_1.Post)('calculate/:toyId'),
    __param(0, (0, common_1.Param)('toyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pricing_dto_1.CalculatePriceDto]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "calculatePrice", null);
__decorate([
    (0, common_1.Put)('toy/:toyId'),
    __param(0, (0, common_1.Param)('toyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pricing_dto_1.UpdateToyPricesDto]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "updateToyPrices", null);
__decorate([
    (0, common_1.Post)('rules'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pricing_dto_1.CreatePricingRuleDto]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "createPricingRule", null);
__decorate([
    (0, common_1.Put)('rules/:ruleId'),
    __param(0, (0, common_1.Param)('ruleId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pricing_dto_1.UpdatePricingRuleDto]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "updatePricingRule", null);
__decorate([
    (0, common_1.Delete)('rules/:ruleId'),
    __param(0, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "deletePricingRule", null);
__decorate([
    (0, common_1.Get)('history/:toyId'),
    __param(0, (0, common_1.Param)('toyId')),
    __param(1, (0, common_1.Query)('pricingType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "getPriceHistory", null);
__decorate([
    (0, common_1.Get)('rules'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "getAllPricingRules", null);
__decorate([
    (0, common_1.Get)('rules/toy/:toyId'),
    __param(0, (0, common_1.Param)('toyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "getPricingRulesForToy", null);
exports.PricingController = PricingController = __decorate([
    (0, common_1.Controller)('pricing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pricing_service_1.PricingService])
], PricingController);
