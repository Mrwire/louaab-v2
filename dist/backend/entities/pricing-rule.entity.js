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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingRule = exports.PricingRuleType = exports.PricingType = void 0;
const typeorm_1 = require("typeorm");
const toy_entity_1 = require("./toy.entity");
var PricingType;
(function (PricingType) {
    PricingType["DAILY"] = "daily";
    PricingType["WEEKLY"] = "weekly";
    PricingType["MONTHLY"] = "monthly";
})(PricingType || (exports.PricingType = PricingType = {}));
var PricingRuleType;
(function (PricingRuleType) {
    PricingRuleType["BASE_PRICE"] = "base_price";
    PricingRuleType["DISCOUNT"] = "discount";
    PricingRuleType["SURCHARGE"] = "surcharge";
    PricingRuleType["SEASONAL"] = "seasonal";
    PricingRuleType["BULK"] = "bulk";
})(PricingRuleType || (exports.PricingRuleType = PricingRuleType = {}));
let PricingRule = class PricingRule {
};
exports.PricingRule = PricingRule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PricingRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PricingRule.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], PricingRule.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PricingRuleType,
        default: PricingRuleType.BASE_PRICE,
    }),
    __metadata("design:type", String)
], PricingRule.prototype, "ruleType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PricingType,
    }),
    __metadata("design:type", String)
], PricingRule.prototype, "pricingType", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PricingRule.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PricingRule.prototype, "discountPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PricingRule.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], PricingRule.prototype, "minQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], PricingRule.prototype, "maxQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PricingRule.prototype, "validFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PricingRule.prototype, "validUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], PricingRule.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PricingRule.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], PricingRule.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => toy_entity_1.Toy, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'toy_id' }),
    __metadata("design:type", toy_entity_1.Toy)
], PricingRule.prototype, "toy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PricingRule.prototype, "toyId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PricingRule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PricingRule.prototype, "updatedAt", void 0);
exports.PricingRule = PricingRule = __decorate([
    (0, typeorm_1.Entity)('pricing_rules')
], PricingRule);
