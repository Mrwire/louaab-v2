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
exports.PackController = void 0;
const common_1 = require("@nestjs/common");
const pack_service_1 = require("../services/pack.service");
const pack_dto_1 = require("../dto/pack.dto");
let PackController = class PackController {
    constructor(packService) {
        this.packService = packService;
    }
    async create(createPackDto) {
        return { success: true, data: await this.packService.create(createPackDto), message: 'Pack créé avec succès' };
    }
    async findAll(query) {
        return { success: true, data: await this.packService.findAll(query) };
    }
    async findAllForFrontend() {
        return { success: true, data: await this.packService.findAll({ isActive: true }) };
    }
    async findOne(id) {
        return { success: true, data: await this.packService.findOne(id) };
    }
    async update(id, updatePackDto) {
        return { success: true, data: await this.packService.update(id, updatePackDto), message: 'Pack mis à jour avec succès' };
    }
    async remove(id) {
        await this.packService.remove(id);
        return { success: true, message: 'Pack supprimé avec succès' };
    }
};
exports.PackController = PackController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pack_dto_1.CreatePackDto]),
    __metadata("design:returntype", Promise)
], PackController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pack_dto_1.QueryPacksDto]),
    __metadata("design:returntype", Promise)
], PackController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PackController.prototype, "findAllForFrontend", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PackController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pack_dto_1.UpdatePackDto]),
    __metadata("design:returntype", Promise)
], PackController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PackController.prototype, "remove", null);
exports.PackController = PackController = __decorate([
    (0, common_1.Controller)('packs'),
    __metadata("design:paramtypes", [pack_service_1.PackService])
], PackController);
