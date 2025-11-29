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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const toy_entity_1 = require("../entities/toy.entity");
const toy_category_entity_1 = require("../entities/toy-category.entity");
const toy_image_entity_1 = require("../entities/toy-image.entity");
let ToyService = class ToyService {
    constructor(toyRepository, categoryRepository, imageRepository) {
        this.toyRepository = toyRepository;
        this.categoryRepository = categoryRepository;
        this.imageRepository = imageRepository;
    }
    async create(createToyDto) {
        const { categoryIds, images } = createToyDto, toyData = __rest(createToyDto, ["categoryIds", "images"]);
        // Create toy
        const toy = this.toyRepository.create(toyData);
        // Handle categories
        if (categoryIds && categoryIds.length > 0) {
            const categories = await this.categoryRepository.findBy({
                id: (0, typeorm_2.In)(categoryIds),
            });
            toy.categories = categories;
        }
        // Save toy
        const savedToy = await this.toyRepository.save(toy);
        // Handle images
        if (images && images.length > 0) {
            const toyImages = images.map((img, index) => this.imageRepository.create({
                toy: savedToy,
                url: img.url,
                altText: img.altText,
                isPrimary: img.isPrimary || index === 0,
                displayOrder: index,
            }));
            await this.imageRepository.save(toyImages);
        }
        return this.findOne(savedToy.id);
    }
    async findAll(query) {
        const { search, status, ageMin, ageMax, categoryId, genderTarget, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', } = query;
        const queryBuilder = this.toyRepository
            .createQueryBuilder('toy')
            .leftJoinAndSelect('toy.categories', 'category')
            .leftJoinAndSelect('toy.images', 'image')
            .where('toy.isActive = :isActive', { isActive: true });
        // Search
        if (search) {
            queryBuilder.andWhere('(toy.name ILIKE :search OR toy.description ILIKE :search)', { search: `%${search}%` });
        }
        // Status filter
        if (status) {
            queryBuilder.andWhere('toy.status = :status', { status });
        }
        // Age filter
        if (ageMin !== undefined) {
            queryBuilder.andWhere('toy.ageMin >= :ageMin', { ageMin });
        }
        if (ageMax !== undefined) {
            queryBuilder.andWhere('toy.ageMax <= :ageMax', { ageMax });
        }
        // Category filter
        if (categoryId) {
            queryBuilder.andWhere('category.id = :categoryId', { categoryId });
        }
        // Gender filter
        if (genderTarget) {
            queryBuilder.andWhere('(toy.genderTarget = :genderTarget OR toy.genderTarget = :unisex)', { genderTarget, unisex: 'unisex' });
        }
        // Sorting
        queryBuilder.orderBy(`toy.${sortBy}`, sortOrder);
        // Pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        const [items, total] = await queryBuilder.getManyAndCount();
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const toy = await this.toyRepository.findOne({
            where: { id },
            relations: ['categories', 'images', 'cleaningLogs'],
        });
        if (!toy) {
            throw new common_1.NotFoundException(`Toy with ID ${id} not found`);
        }
        return toy;
    }
    async update(id, updateToyDto) {
        const toy = await this.findOne(id);
        const { categoryIds, images } = updateToyDto, toyData = __rest(updateToyDto, ["categoryIds", "images"]);
        // Update toy data
        Object.assign(toy, toyData);
        // Update categories if provided
        if (categoryIds) {
            const categories = await this.categoryRepository.findBy({
                id: (0, typeorm_2.In)(categoryIds),
            });
            toy.categories = categories;
        }
        // Save updates
        await this.toyRepository.save(toy);
        // Update images if provided
        if (images) {
            // Remove old images
            await this.imageRepository.delete({ toy: { id } });
            // Add new images
            const toyImages = images.map((img, index) => this.imageRepository.create({
                toy,
                url: img.url,
                altText: img.altText,
                isPrimary: img.isPrimary || index === 0,
                displayOrder: index,
            }));
            await this.imageRepository.save(toyImages);
        }
        return this.findOne(id);
    }
    async remove(id) {
        const toy = await this.findOne(id);
        await this.toyRepository.remove(toy);
    }
    async updateStatus(id, status) {
        const toy = await this.findOne(id);
        toy.status = status;
        // Auto-update last cleaned date if status is 'available'
        if (status === toy_entity_1.ToyStatus.AVAILABLE) {
            toy.lastCleaned = new Date();
        }
        await this.toyRepository.save(toy);
        return toy;
    }
    async getFeatured(limit = 10) {
        return this.toyRepository.find({
            where: { isFeatured: true, isActive: true, status: toy_entity_1.ToyStatus.AVAILABLE },
            relations: ['images'],
            take: limit,
            order: { createdAt: 'DESC' },
        });
    }
    async getAvailableCount() {
        return this.toyRepository.count({
            where: { status: toy_entity_1.ToyStatus.AVAILABLE, isActive: true },
        });
    }
    // Mettre à jour la caution de tous les jouets selon un pourcentage d'un prix de base
    async updateDepositForAll(percentage, base = 'daily') {
        const toys = await this.toyRepository.find();
        let updated = 0;
        for (const toy of toys) {
            const daily = Number(toy.rentalPriceDaily || 0);
            const weekly = Number(toy.rentalPriceWeekly || 0);
            const monthly = Number(toy.rentalPriceMonthly || 0);
            let basePrice = 0;
            if (base === 'daily')
                basePrice = daily;
            else if (base === 'weekly')
                basePrice = weekly;
            else
                basePrice = monthly;
            // Si pas de prix base, sauter
            if (!basePrice || isNaN(basePrice))
                continue;
            const newDeposit = Number(((basePrice * percentage) / 100).toFixed(2));
            toy.depositAmount = newDeposit;
            await this.toyRepository.save(toy);
            updated++;
        }
        return updated;
    }
};
exports.ToyService = ToyService;
exports.ToyService = ToyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(toy_entity_1.Toy)),
    __param(1, (0, typeorm_1.InjectRepository)(toy_category_entity_1.ToyCategory)),
    __param(2, (0, typeorm_1.InjectRepository)(toy_image_entity_1.ToyImage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ToyService);
