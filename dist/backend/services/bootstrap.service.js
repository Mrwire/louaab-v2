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
var BootstrapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BootstrapService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const age_range_entity_1 = require("../entities/age-range.entity");
const toy_category_entity_1 = require("../entities/toy-category.entity");
const pack_entity_1 = require("../entities/pack.entity");
let BootstrapService = BootstrapService_1 = class BootstrapService {
    constructor(ageRepo, catRepo, packRepo) {
        this.ageRepo = ageRepo;
        this.catRepo = catRepo;
        this.packRepo = packRepo;
        this.logger = new common_1.Logger(BootstrapService_1.name);
    }
    async onModuleInit() {
        await this.ensureAgeRanges();
        await this.ensureCategories();
        await this.ensurePacks();
    }
    async ensureAgeRanges() {
        const count = await this.ageRepo.count();
        if (count > 0)
            return;
        const items = [
            { label: '0-12 mois', slug: '0-12-mois', iconType: 'emoji', icon: '👶', ageMin: 0, ageMax: 12, displayOrder: 0, isActive: true },
            { label: '12-24 mois', slug: '12-24-mois', iconType: 'emoji', icon: '🍼', ageMin: 12, ageMax: 24, displayOrder: 1, isActive: true },
            { label: '2-3 ans', slug: '2-3-ans', iconType: 'emoji', icon: '🧒', ageMin: 24, ageMax: 36, displayOrder: 2, isActive: true },
            { label: '3-5 ans', slug: '3-5-ans', iconType: 'emoji', icon: '🎒', ageMin: 36, ageMax: 60, displayOrder: 3, isActive: true },
            { label: '5-8 ans', slug: '5-8-ans', iconType: 'emoji', icon: '⭐', ageMin: 60, ageMax: 96, displayOrder: 4, isActive: true },
            { label: '8+ ans', slug: '8-ans', iconType: 'emoji', icon: '🚀', ageMin: 96, ageMax: null, displayOrder: 5, isActive: true },
        ];
        await this.ageRepo.save(this.ageRepo.create(items));
        this.logger.log(`Seeded ${items.length} age ranges`);
    }
    async ensureCategories() {
        const count = await this.catRepo.count();
        if (count > 0)
            return;
        const items = [
            { name: 'Jeux éducatifs', slug: 'jeux-educatifs', iconType: 'emoji', icon: '🧠', description: 'Montessori et pédagogie', displayOrder: 0, isActive: true },
            { name: 'Jeux de société', slug: 'jeux-de-societe', iconType: 'emoji', icon: '🎲', description: 'Pour petits et grands', displayOrder: 1, isActive: true },
            { name: "Jeux d'adresse", slug: 'jeux-adresse', iconType: 'emoji', icon: '🎯', description: 'Adresse et précision', displayOrder: 2, isActive: true },
            { name: 'Véhicules', slug: 'vehicules', iconType: 'emoji', icon: '🚗', description: 'Voitures, motos, avions', displayOrder: 3, isActive: true },
            { name: 'Jeux créatifs', slug: 'jeux-creatifs', iconType: 'emoji', icon: '🎨', description: 'Créativité et arts', displayOrder: 4, isActive: true },
        ];
        await this.catRepo.save(this.catRepo.create(items));
        this.logger.log(`Seeded ${items.length} categories`);
    }
    async ensurePacks() {
        const count = await this.packRepo.count();
        if (count > 0)
            return;
        const items = [
            { name: 'Mini Pack', slug: 'mini-pack', type: pack_entity_1.PackType.MINI, description: 'Parfait pour débuter', price: 199, toyCount: 3, durationDays: 30, features: JSON.stringify(['3 jouets', 'Échanges illimités', 'Livraison gratuite']), icon: '🎁', displayOrder: 0, isActive: true },
            { name: 'Maxi Pack', slug: 'maxi-pack', type: pack_entity_1.PackType.MAXI, description: 'Le plus populaire', price: 349, toyCount: 5, durationDays: 30, features: JSON.stringify(['5 jouets', 'Échanges illimités', 'Livraison gratuite']), icon: '⭐', displayOrder: 1, isActive: true },
            { name: 'Mega Pack', slug: 'mega-pack', type: pack_entity_1.PackType.MEGA, description: 'Pour familles', price: 499, toyCount: 8, durationDays: 30, features: JSON.stringify(['8 jouets', 'Échanges illimités', 'Livraison gratuite']), icon: '💎', displayOrder: 2, isActive: true },
        ];
        await this.packRepo.save(this.packRepo.create(items));
        this.logger.log(`Seeded ${items.length} packs`);
    }
};
exports.BootstrapService = BootstrapService;
exports.BootstrapService = BootstrapService = BootstrapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(age_range_entity_1.AgeRange)),
    __param(1, (0, typeorm_1.InjectRepository)(toy_category_entity_1.ToyCategory)),
    __param(2, (0, typeorm_1.InjectRepository)(pack_entity_1.Pack)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BootstrapService);
