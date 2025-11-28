"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUiModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const emoji_controller_1 = require("../controllers/emoji.controller");
const admin_orders_controller_1 = require("../controllers/admin-orders.controller");
const order_module_1 = require("./order.module");
const dashboard_stats_service_1 = require("../services/dashboard-stats.service");
const order_entity_1 = require("../entities/order.entity");
const order_item_entity_1 = require("../entities/order-item.entity");
let AdminUiModule = class AdminUiModule {
};
exports.AdminUiModule = AdminUiModule;
exports.AdminUiModule = AdminUiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            order_module_1.OrderModule,
            typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order, order_item_entity_1.OrderItem]),
        ],
        controllers: [emoji_controller_1.EmojiController, admin_orders_controller_1.AdminOrdersController],
        providers: [dashboard_stats_service_1.DashboardStatsService],
    })
], AdminUiModule);
