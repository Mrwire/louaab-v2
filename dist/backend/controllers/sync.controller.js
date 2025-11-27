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
exports.SyncController = void 0;
const common_1 = require("@nestjs/common");
const sync_service_1 = require("../services/sync.service");
let SyncController = class SyncController {
    constructor(syncService) {
        this.syncService = syncService;
    }
    async syncToys() {
        const res = await this.syncService.syncToysFromMapping();
        return { success: true, data: res, message: 'Toys synchronized from mapping' };
    }
    async syncPacks() {
        const res = await this.syncService.syncPacksFromDefault();
        return { success: true, data: res, message: 'Packs synchronized from default' };
    }
};
exports.SyncController = SyncController;
__decorate([
    (0, common_1.Post)('toys'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "syncToys", null);
__decorate([
    (0, common_1.Post)('packs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "syncPacks", null);
exports.SyncController = SyncController = __decorate([
    (0, common_1.Controller)('admin/sync'),
    __metadata("design:paramtypes", [sync_service_1.SyncService])
], SyncController);
