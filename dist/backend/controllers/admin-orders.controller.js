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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminOrdersController = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("../services/order.service");
const dashboard_stats_service_1 = require("../services/dashboard-stats.service");
const create_order_dto_1 = require("../dto/create-order.dto");
const order_entity_1 = require("../entities/order.entity");
let AdminOrdersController = class AdminOrdersController {
    constructor(orderService, dashboardStatsService) {
        this.orderService = orderService;
        this.dashboardStatsService = dashboardStatsService;
    }
    async list(query) {
        const normalizedQuery = Object.assign({}, query);
        if (query.status === 'pending') {
            normalizedQuery.status = order_entity_1.OrderStatus.DRAFT;
        }
        return {
            success: true,
            data: await this.orderService.findAll(normalizedQuery),
        };
    }
    async updateStatus(id, status) {
        const normalized = status === 'pending' ? order_entity_1.OrderStatus.DRAFT : status;
        const updated = await this.orderService.updateStatus(id, normalized);
        return {
            success: true,
            data: updated,
            message: 'Statut mis à jour',
        };
    }
    async reset(id) {
        const updated = await this.orderService.reset(id);
        return {
            success: true,
            data: updated,
            message: 'Commande réinitialisée',
        };
    }
    async confirmReturn(id, body) {
        const updatePayload = {
            status: order_entity_1.OrderStatus.RETURNED,
            returnDate: body === null || body === void 0 ? void 0 : body.returnDate,
            internalNotes: (body === null || body === void 0 ? void 0 : body.note)
                ? `[Restitution - ${body.condition || 'etat'}] ${body.note}`
                : undefined,
        };
        await this.orderService.update(id, updatePayload);
        const updated = await this.orderService.updateStatus(id, order_entity_1.OrderStatus.RETURNED);
        return {
            success: true,
            data: updated,
            message: 'Restitution confirmée',
        };
    }
    async stats(from, to, limit, rangeDays) {
        const data = await this.dashboardStatsService.getOrderStats({
            from,
            to,
            limit: limit ? Number(limit) : undefined,
            rangeDays: rangeDays ? Number(rangeDays) : undefined,
        });
        return {
            success: true,
            data,
        };
    }
};
exports.AdminOrdersController = AdminOrdersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.QueryOrdersDto]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/reset'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "reset", null);
__decorate([
    (0, common_1.Patch)(':id/return'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "confirmReturn", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('rangeDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "stats", null);
exports.AdminOrdersController = AdminOrdersController = __decorate([
    (0, common_1.Controller)('admin/ui/orders'),
    __metadata("design:paramtypes", [order_service_1.OrderService,
        dashboard_stats_service_1.DashboardStatsService])
], AdminOrdersController);
