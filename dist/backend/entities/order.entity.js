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
exports.Order = exports.OrderStatus = void 0;
const typeorm_1 = require("typeorm");
const customer_entity_1 = require("./customer.entity");
const subscription_entity_1 = require("./subscription.entity");
const admin_user_entity_1 = require("./admin-user.entity");
const order_item_entity_1 = require("./order-item.entity");
const delivery_entity_1 = require("./delivery.entity");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["DRAFT"] = "draft";
    OrderStatus["CONFIRMED"] = "confirmed";
    OrderStatus["PREPARING"] = "preparing";
    OrderStatus["SHIPPING"] = "shipping";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["RETURNING"] = "returning";
    OrderStatus["RETURNED"] = "returned";
    OrderStatus["COMPLETED"] = "completed";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
let Order = class Order {
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Order.prototype, "orderNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, customer => customer.orders, { onDelete: 'SET NULL', nullable: true }),
    __metadata("design:type", customer_entity_1.Customer)
], Order.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subscription_entity_1.Subscription, subscription => subscription.orders, { nullable: true }),
    __metadata("design:type", subscription_entity_1.Subscription)
], Order.prototype, "subscription", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Order.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "depositAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "deliveryAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "deliveryCity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Order.prototype, "deliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "deliveryTimeSlot", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Order.prototype, "returnDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "returnTimeSlot", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_user_entity_1.AdminUser, { nullable: true }),
    __metadata("design:type", admin_user_entity_1.AdminUser)
], Order.prototype, "assignedDriver", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "internalNotes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_item_entity_1.OrderItem, item => item.order),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => delivery_entity_1.Delivery, delivery => delivery.order),
    __metadata("design:type", Array)
], Order.prototype, "deliveries", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)('orders')
], Order);
