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
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const subscription_service_1 = require("../services/subscription.service");
const create_subscription_dto_1 = require("../dto/create-subscription.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let SubscriptionController = class SubscriptionController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async create(createSubscriptionDto) {
        return {
            success: true,
            data: await this.subscriptionService.create(createSubscriptionDto),
            message: 'Abonnement créé avec succès',
        };
    }
    async findAll(query) {
        return {
            success: true,
            data: await this.subscriptionService.findAll(query),
        };
    }
    async getStats() {
        return {
            success: true,
            data: await this.subscriptionService.getStats(),
        };
    }
    async getUpcomingRenewals(days) {
        return {
            success: true,
            data: await this.subscriptionService.getUpcomingRenewals(days || 7),
        };
    }
    async findByCustomer(customerId) {
        return {
            success: true,
            data: await this.subscriptionService.findByCustomer(customerId),
        };
    }
    async findOne(id) {
        return {
            success: true,
            data: await this.subscriptionService.findOne(id),
        };
    }
    async update(id, updateSubscriptionDto) {
        return {
            success: true,
            data: await this.subscriptionService.update(id, updateSubscriptionDto),
            message: 'Abonnement mis à jour avec succès',
        };
    }
    async pause(id) {
        return {
            success: true,
            data: await this.subscriptionService.pause(id),
            message: 'Abonnement mis en pause',
        };
    }
    async resume(id) {
        return {
            success: true,
            data: await this.subscriptionService.resume(id),
            message: 'Abonnement réactivé',
        };
    }
    async renew(id) {
        return {
            success: true,
            data: await this.subscriptionService.renew(id),
            message: 'Abonnement renouvelé avec succès',
        };
    }
    async cancel(id, reason) {
        return {
            success: true,
            data: await this.subscriptionService.cancel(id, reason),
            message: 'Abonnement annulé avec succès',
        };
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.CustomerAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subscription_dto_1.CreateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subscription_dto_1.QuerySubscriptionsDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.AdminAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('upcoming-renewals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.AdminAuthGuard),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getUpcomingRenewals", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "findByCustomer", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_subscription_dto_1.UpdateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/pause'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "pause", null);
__decorate([
    (0, common_1.Post)(':id/resume'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "resume", null);
__decorate([
    (0, common_1.Post)(':id/renew'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.AdminAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "renew", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "cancel", null);
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, common_1.Controller)('subscriptions'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);
