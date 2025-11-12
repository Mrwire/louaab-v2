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
exports.Toy = exports.GenderTarget = exports.ToyCondition = exports.ToyStatus = void 0;
const typeorm_1 = require("typeorm");
const toy_category_entity_1 = require("./toy-category.entity");
const toy_image_entity_1 = require("./toy-image.entity");
const cleaning_log_entity_1 = require("./cleaning-log.entity");
var ToyStatus;
(function (ToyStatus) {
    ToyStatus["AVAILABLE"] = "available";
    ToyStatus["RESERVED"] = "reserved";
    ToyStatus["RENTED"] = "rented";
    ToyStatus["CLEANING"] = "cleaning";
    ToyStatus["MAINTENANCE"] = "maintenance";
    ToyStatus["RETIRED"] = "retired";
})(ToyStatus || (exports.ToyStatus = ToyStatus = {}));
var ToyCondition;
(function (ToyCondition) {
    ToyCondition["EXCELLENT"] = "excellent";
    ToyCondition["GOOD"] = "good";
    ToyCondition["ACCEPTABLE"] = "acceptable";
    ToyCondition["DAMAGED"] = "damaged";
})(ToyCondition || (exports.ToyCondition = ToyCondition = {}));
var GenderTarget;
(function (GenderTarget) {
    GenderTarget["MALE"] = "male";
    GenderTarget["FEMALE"] = "female";
    GenderTarget["UNISEX"] = "unisex";
})(GenderTarget || (exports.GenderTarget = GenderTarget = {}));
let Toy = class Toy {
};
exports.Toy = Toy;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Toy.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Toy.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Toy.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Toy.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Toy.prototype, "fullDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Toy.prototype, "videoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Toy.prototype, "purchasePrice", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Toy.prototype, "rentalPriceDaily", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Toy.prototype, "rentalPriceWeekly", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Toy.prototype, "rentalPriceMonthly", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Toy.prototype, "depositAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Toy.prototype, "ageMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Toy.prototype, "ageMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Toy.prototype, "playerCountMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Toy.prototype, "playerCountMax", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: GenderTarget,
        default: GenderTarget.UNISEX,
    }),
    __metadata("design:type", String)
], Toy.prototype, "genderTarget", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ToyStatus,
        default: ToyStatus.AVAILABLE,
    }),
    __metadata("design:type", String)
], Toy.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ToyCondition,
        default: ToyCondition.EXCELLENT,
    }),
    __metadata("design:type", String)
], Toy.prototype, "condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Toy.prototype, "stockQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Toy.prototype, "availableQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Toy.prototype, "internalRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Toy.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Toy.prototype, "purchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Toy.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Toy.prototype, "minRentalQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Toy.prototype, "timesRented", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Toy.prototype, "lastCleaned", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Toy.prototype, "nextMaintenance", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Toy.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Toy.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => toy_category_entity_1.ToyCategory, category => category.toys),
    (0, typeorm_1.JoinTable)({
        name: 'toy_category_relations',
        joinColumn: { name: 'toy_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Toy.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => toy_image_entity_1.ToyImage, image => image.toy),
    __metadata("design:type", Array)
], Toy.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => cleaning_log_entity_1.CleaningLog, log => log.toy),
    __metadata("design:type", Array)
], Toy.prototype, "cleaningLogs", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Toy.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Toy.prototype, "updatedAt", void 0);
exports.Toy = Toy = __decorate([
    (0, typeorm_1.Entity)('toys')
], Toy);
