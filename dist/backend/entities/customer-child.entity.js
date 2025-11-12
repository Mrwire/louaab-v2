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
exports.CustomerChild = void 0;
const typeorm_1 = require("typeorm");
const customer_entity_1 = require("./customer.entity");
const toy_entity_1 = require("./toy.entity");
let CustomerChild = class CustomerChild {
};
exports.CustomerChild = CustomerChild;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CustomerChild.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, customer => customer.children, { onDelete: 'CASCADE' }),
    __metadata("design:type", customer_entity_1.Customer)
], CustomerChild.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CustomerChild.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], CustomerChild.prototype, "birthDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: toy_entity_1.GenderTarget,
        nullable: true,
    }),
    __metadata("design:type", String)
], CustomerChild.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], CustomerChild.prototype, "allergies", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], CustomerChild.prototype, "preferences", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CustomerChild.prototype, "createdAt", void 0);
exports.CustomerChild = CustomerChild = __decorate([
    (0, typeorm_1.Entity)('customer_children')
], CustomerChild);
