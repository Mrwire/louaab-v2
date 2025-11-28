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
exports.Delivery = exports.DeliveryStatus = void 0;
const typeorm_1 = require("typeorm");
const order_entity_1 = require("./order.entity");
const admin_user_entity_1 = require("./admin-user.entity");
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["SCHEDULED"] = "scheduled";
    DeliveryStatus["IN_TRANSIT"] = "in_transit";
    DeliveryStatus["DELIVERED"] = "delivered";
    DeliveryStatus["FAILED"] = "failed";
})(DeliveryStatus || (exports.DeliveryStatus = DeliveryStatus = {}));
let Delivery = class Delivery {
};
exports.Delivery = Delivery;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Delivery.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.Order, order => order.deliveries, { onDelete: 'CASCADE' }),
    __metadata("design:type", order_entity_1.Order)
], Delivery.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Delivery.prototype, "deliveryType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DeliveryStatus,
        default: DeliveryStatus.SCHEDULED,
    }),
    __metadata("design:type", String)
], Delivery.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Delivery.prototype, "scheduledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Delivery.prototype, "scheduledTimeSlot", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Delivery.prototype, "actualDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_user_entity_1.AdminUser, { nullable: true }),
    __metadata("design:type", admin_user_entity_1.AdminUser)
], Delivery.prototype, "driver", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Delivery.prototype, "trackingNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Delivery.prototype, "routeOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Delivery.prototype, "recipientName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Delivery.prototype, "recipientPhone", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Delivery.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], Delivery.prototype, "photos", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Delivery.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Delivery.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Delivery.prototype, "updatedAt", void 0);
exports.Delivery = Delivery = __decorate([
    (0, typeorm_1.Entity)('deliveries')
], Delivery);
