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
exports.ToyCategory = void 0;
const typeorm_1 = require("typeorm");
const toy_entity_1 = require("./toy.entity");
let ToyCategory = class ToyCategory {
};
exports.ToyCategory = ToyCategory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ToyCategory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ToyCategory.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ToyCategory.prototype, "nameAr", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], ToyCategory.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ToyCategory.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 'emoji' }),
    __metadata("design:type", String)
], ToyCategory.prototype, "iconType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ToyCategory.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ToyCategory.prototype, "iconUrl", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ToyCategory, category => category.children, { nullable: true }),
    __metadata("design:type", ToyCategory)
], ToyCategory.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ToyCategory, category => category.parent),
    __metadata("design:type", Array)
], ToyCategory.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ToyCategory.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ToyCategory.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => toy_entity_1.Toy, toy => toy.categories),
    __metadata("design:type", Array)
], ToyCategory.prototype, "toys", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ToyCategory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ToyCategory.prototype, "updatedAt", void 0);
exports.ToyCategory = ToyCategory = __decorate([
    (0, typeorm_1.Entity)('toy_categories')
], ToyCategory);
