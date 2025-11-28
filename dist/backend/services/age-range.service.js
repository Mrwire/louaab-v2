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
exports.AgeRangeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const age_range_entity_1 = require("../entities/age-range.entity");
let AgeRangeService = class AgeRangeService {
    constructor(ageRangeRepository) {
        this.ageRangeRepository = ageRangeRepository;
    }
    async create(createAgeRangeDto) {
        const ageRange = this.ageRangeRepository.create(createAgeRangeDto);
        return await this.ageRangeRepository.save(ageRange);
    }
    async findAll() {
        return await this.ageRangeRepository.find({
            where: { isActive: true },
            order: { displayOrder: 'ASC', label: 'ASC' },
        });
    }
    async findAllIncludingInactive() {
        return await this.ageRangeRepository.find({
            order: { displayOrder: 'ASC', label: 'ASC' },
        });
    }
    async findOne(id) {
        const ageRange = await this.ageRangeRepository.findOne({ where: { id } });
        if (!ageRange) {
            throw new common_1.NotFoundException(`Age range with ID ${id} not found`);
        }
        return ageRange;
    }
    async update(id, updateAgeRangeDto) {
        const ageRange = await this.findOne(id);
        Object.assign(ageRange, updateAgeRangeDto);
        return await this.ageRangeRepository.save(ageRange);
    }
    async remove(id) {
        const ageRange = await this.findOne(id);
        await this.ageRangeRepository.remove(ageRange);
    }
    async getToysCount(ageRangeId) {
        // Cette méthode devrait compter les jouets correspondant à cette tranche d'âge
        // Pour l'instant, retournons 0 - à implémenter avec une relation avec Toy
        return 0;
    }
};
exports.AgeRangeService = AgeRangeService;
exports.AgeRangeService = AgeRangeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(age_range_entity_1.AgeRange)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AgeRangeService);
