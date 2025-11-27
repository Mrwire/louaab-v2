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
exports.PackService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pack_entity_1 = require("../entities/pack.entity");
let PackService = class PackService {
    constructor(packRepository) {
        this.packRepository = packRepository;
    }
    async create(createPackDto) {
        const pack = this.packRepository.create(createPackDto);
        return this.packRepository.save(pack);
    }
    async findAll(query) {
        const { isActive, type } = query;
        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (type) {
            where.type = type;
        }
        return this.packRepository.find({
            where,
            relations: ['toys'],
            order: { displayOrder: 'ASC', name: 'ASC' },
        });
    }
    async findOne(id) {
        const pack = await this.packRepository.findOne({
            where: { id },
            relations: ['toys'],
        });
        if (!pack) {
            throw new common_1.NotFoundException(`Pack with ID "${id}" not found`);
        }
        return pack;
    }
    async update(id, updatePackDto) {
        const pack = await this.findOne(id);
        this.packRepository.merge(pack, updatePackDto);
        return this.packRepository.save(pack);
    }
    async remove(id) {
        const result = await this.packRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Pack with ID "${id}" not found`);
        }
    }
};
exports.PackService = PackService;
exports.PackService = PackService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pack_entity_1.Pack)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PackService);
