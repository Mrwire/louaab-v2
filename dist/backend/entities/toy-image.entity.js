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
exports.ToyImage = void 0;
const typeorm_1 = require("typeorm");
const toy_entity_1 = require("./toy.entity");
let ToyImage = class ToyImage {
};
exports.ToyImage = ToyImage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ToyImage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => toy_entity_1.Toy, toy => toy.images, { onDelete: 'CASCADE' }),
    __metadata("design:type", toy_entity_1.Toy)
], ToyImage.prototype, "toy", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ToyImage.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ToyImage.prototype, "altText", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ToyImage.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ToyImage.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ToyImage.prototype, "createdAt", void 0);
exports.ToyImage = ToyImage = __decorate([
    (0, typeorm_1.Entity)('toy_images')
], ToyImage);
