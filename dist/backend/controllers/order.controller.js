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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("../services/order.service");
const create_order_dto_1 = require("../dto/create-order.dto");
const order_entity_1 = require("../entities/order.entity");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let OrderController = class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
    }
    async create(createOrderDto) {
        return {
            success: true,
            data: await this.orderService.create(createOrderDto),
            message: 'Commande créée avec succès',
        };
    }
    async findAll(query) {
        return {
            success: true,
            data: await this.orderService.findAll(query),
        };
    }
    async getStats() {
        return {
            success: true,
            data: await this.orderService.getStats(),
        };
    }
    async findOne(id) {
        return {
            success: true,
            data: await this.orderService.findOne(id),
        };
    }
    async update(id, updateOrderDto) {
        return {
            success: true,
            data: await this.orderService.update(id, updateOrderDto),
            message: 'Commande mise à jour avec succès',
        };
    }
    async updateStatus(id, status) {
        return {
            success: true,
            data: await this.orderService.updateStatus(id, status),
            message: 'Statut mis à jour avec succès',
        };
    }
    async cancel(id) {
        return {
            success: true,
            data: await this.orderService.cancel(id),
            message: 'Commande annulée avec succès',
        };
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.CustomerAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.AdminAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.QueryOrdersDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.AdminAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.AdminAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_order_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.AdminAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.AdminAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "cancel", null);
exports.OrderController = OrderController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderController);
