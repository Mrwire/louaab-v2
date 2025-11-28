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
exports.AgeRangeController = void 0;
const common_1 = require("@nestjs/common");
const age_range_service_1 = require("../services/age-range.service");
const age_range_dto_1 = require("../dto/age-range.dto");
let AgeRangeController = class AgeRangeController {
    constructor(ageRangeService) {
        this.ageRangeService = ageRangeService;
    }
    async create(createAgeRangeDto) {
        return {
            success: true,
            data: await this.ageRangeService.create(createAgeRangeDto),
            message: 'Tranche d\'âge créée avec succès',
        };
    }
    async findAll() {
        return {
            success: true,
            data: await this.ageRangeService.findAll(),
        };
    }
    async findAllIncludingInactive() {
        return {
            success: true,
            data: await this.ageRangeService.findAllIncludingInactive(),
        };
    }
    async findOne(id) {
        return {
            success: true,
            data: await this.ageRangeService.findOne(id),
        };
    }
    async update(id, updateAgeRangeDto) {
        return {
            success: true,
            data: await this.ageRangeService.update(id, updateAgeRangeDto),
            message: 'Tranche d\'âge mise à jour avec succès',
        };
    }
    async remove(id) {
        await this.ageRangeService.remove(id);
        return {
            success: true,
            message: 'Tranche d\'âge supprimée avec succès',
        };
    }
    async getToysCount(id) {
        return {
            success: true,
            data: {
                count: await this.ageRangeService.getToysCount(id),
            },
        };
    }
};
exports.AgeRangeController = AgeRangeController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [age_range_dto_1.CreateAgeRangeDto]),
    __metadata("design:returntype", Promise)
], AgeRangeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgeRangeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgeRangeController.prototype, "findAllIncludingInactive", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgeRangeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, age_range_dto_1.UpdateAgeRangeDto]),
    __metadata("design:returntype", Promise)
], AgeRangeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgeRangeController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/toys-count'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgeRangeController.prototype, "getToysCount", null);
exports.AgeRangeController = AgeRangeController = __decorate([
    (0, common_1.Controller)('age-ranges'),
    __metadata("design:paramtypes", [age_range_service_1.AgeRangeService])
], AgeRangeController);
