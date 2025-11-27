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
exports.FAQController = void 0;
const common_1 = require("@nestjs/common");
const faq_service_1 = require("../services/faq.service");
const faq_dto_1 = require("../dto/faq.dto");
let FAQController = class FAQController {
    constructor(faqService) {
        this.faqService = faqService;
    }
    async create(createFAQDto) {
        return { success: true, data: await this.faqService.create(createFAQDto), message: 'FAQ créée avec succès' };
    }
    async findAll(query) {
        return { success: true, data: await this.faqService.findAll(query) };
    }
    async findAllForFrontend() {
        return { success: true, data: await this.faqService.findAll({ isActive: true }) };
    }
    async findOne(id) {
        return { success: true, data: await this.faqService.findOne(id) };
    }
    async update(id, updateFAQDto) {
        return { success: true, data: await this.faqService.update(id, updateFAQDto), message: 'FAQ mise à jour avec succès' };
    }
    async remove(id) {
        await this.faqService.remove(id);
        return { success: true, message: 'FAQ supprimée avec succès' };
    }
};
exports.FAQController = FAQController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [faq_dto_1.CreateFAQDto]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [faq_dto_1.QueryFAQsDto]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "findAllForFrontend", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, faq_dto_1.UpdateFAQDto]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "remove", null);
exports.FAQController = FAQController = __decorate([
    (0, common_1.Controller)('faqs'),
    __metadata("design:paramtypes", [faq_service_1.FAQService])
], FAQController);
