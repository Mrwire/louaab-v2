"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const order_controller_1 = require("../controllers/order.controller");
const order_service_1 = require("../services/order.service");
const public_orders_service_1 = require("../services/public-orders.service");
const order_entity_1 = require("../entities/order.entity");
const order_item_entity_1 = require("../entities/order-item.entity");
const toy_entity_1 = require("../entities/toy.entity");
const customer_entity_1 = require("../entities/customer.entity");
const delivery_entity_1 = require("../entities/delivery.entity");
const public_orders_controller_1 = require("../controllers/public-orders.controller");
let OrderModule = class OrderModule {
};
exports.OrderModule = OrderModule;
exports.OrderModule = OrderModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order, order_item_entity_1.OrderItem, toy_entity_1.Toy, customer_entity_1.Customer, delivery_entity_1.Delivery]),
        ],
        controllers: [order_controller_1.OrderController, public_orders_controller_1.PublicOrdersController],
        providers: [order_service_1.OrderService, public_orders_service_1.PublicOrdersService],
        exports: [order_service_1.OrderService, public_orders_service_1.PublicOrdersService],
    })
], OrderModule);
