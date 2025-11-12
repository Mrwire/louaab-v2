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
exports.Pack = exports.PackType = void 0;
const typeorm_1 = require("typeorm");
const toy_entity_1 = require("./toy.entity");
var PackType;
(function (PackType) {
    PackType["MINI"] = "mini";
    PackType["MAXI"] = "maxi";
    PackType["MEGA"] = "mega";
    PackType["CUSTOM"] = "custom";
})(PackType || (exports.PackType = PackType = {}));
let Pack = class Pack {
};
exports.Pack = Pack;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Pack.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Pack.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pack.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Pack.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PackType,
        default: PackType.CUSTOM,
    }),
    __metadata("design:type", String)
], Pack.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Pack.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Pack.prototype, "toyCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 30 }),
    __metadata("design:type", Number)
], Pack.prototype, "durationDays", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Pack.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pack.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Pack.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Pack.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => toy_entity_1.Toy, { nullable: true }),
    (0, typeorm_1.JoinTable)({
        name: 'pack_toys',
        joinColumn: { name: 'pack_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'toy_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Pack.prototype, "toys", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Pack.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Pack.prototype, "updatedAt", void 0);
exports.Pack = Pack = __decorate([
    (0, typeorm_1.Entity)('packs')
], Pack);
