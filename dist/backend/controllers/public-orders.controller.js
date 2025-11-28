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
exports.PublicOrdersController = void 0;
const common_1 = require("@nestjs/common");
const public_order_dto_1 = require("../dto/public-order.dto");
const public_orders_service_1 = require("../services/public-orders.service");
let PublicOrdersController = class PublicOrdersController {
    constructor(publicOrdersService) {
        this.publicOrdersService = publicOrdersService;
    }
    async create(createPublicOrderDto) {
        const order = await this.publicOrdersService.create(createPublicOrderDto);
        return {
            success: true,
            data: order,
            message: 'Commande enregistrée avec succès',
        };
    }
};
exports.PublicOrdersController = PublicOrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_order_dto_1.CreatePublicOrderDto]),
    __metadata("design:returntype", Promise)
], PublicOrdersController.prototype, "create", null);
exports.PublicOrdersController = PublicOrdersController = __decorate([
    (0, common_1.Controller)('public/orders'),
    __metadata("design:paramtypes", [public_orders_service_1.PublicOrdersService])
], PublicOrdersController);
