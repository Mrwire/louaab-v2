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
exports.ToyController = void 0;
const common_1 = require("@nestjs/common");
const toy_service_1 = require("../services/toy.service");
const create_toy_dto_1 = require("../dto/create-toy.dto");
const toy_entity_1 = require("../entities/toy.entity");
let ToyController = class ToyController {
    constructor(toyService) {
        this.toyService = toyService;
    }
    async create(createToyDto) {
        return {
            success: true,
            data: await this.toyService.create(createToyDto),
            message: 'Jouet créé avec succès',
        };
    }
    async findAll(query) {
        return {
            success: true,
            data: await this.toyService.findAll(query),
        };
    }
    async getFeatured(limit) {
        return {
            success: true,
            data: await this.toyService.getFeatured(limit),
        };
    }
    async getStats() {
        const availableCount = await this.toyService.getAvailableCount();
        return {
            success: true,
            data: {
                available: availableCount,
            },
        };
    }
    async findOne(id) {
        return {
            success: true,
            data: await this.toyService.findOne(id),
        };
    }
    async update(id, updateToyDto) {
        return {
            success: true,
            data: await this.toyService.update(id, updateToyDto),
            message: 'Jouet mis à jour avec succès',
        };
    }
    async updateStatus(id, status) {
        return {
            success: true,
            data: await this.toyService.updateStatus(id, status),
            message: 'Statut mis à jour avec succès',
        };
    }
    async remove(id) {
        await this.toyService.remove(id);
        return {
            success: true,
            message: 'Jouet supprimé avec succès',
        };
    }
    // Mise à jour de la caution en masse
    async bulkUpdateDeposit(percentage, base = 'daily') {
        const updated = await this.toyService.updateDepositForAll(Number(percentage), base);
        return {
            success: true,
            data: { updated },
            message: `Caution mise à jour pour ${updated} jouet(s)`,
        };
    }
};
exports.ToyController = ToyController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_toy_dto_1.CreateToyDto]),
    __metadata("design:returntype", Promise)
], ToyController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_toy_dto_1.QueryToysDto]),
    __metadata("design:returntype", Promise)
], ToyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('featured'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ToyController.prototype, "getFeatured", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ToyController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ToyController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_toy_dto_1.UpdateToyDto]),
    __metadata("design:returntype", Promise)
], ToyController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ToyController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ToyController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)('deposit/bulk'),
    __param(0, (0, common_1.Body)('percentage')),
    __param(1, (0, common_1.Body)('base')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ToyController.prototype, "bulkUpdateDeposit", null);
exports.ToyController = ToyController = __decorate([
    (0, common_1.Controller)('toys'),
    __metadata("design:paramtypes", [toy_service_1.ToyService])
], ToyController);
