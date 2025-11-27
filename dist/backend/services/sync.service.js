"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const toy_entity_1 = require("../entities/toy.entity");
const toy_category_entity_1 = require("../entities/toy-category.entity");
const toy_image_entity_1 = require("../entities/toy-image.entity");
const age_range_entity_1 = require("../entities/age-range.entity");
const pack_entity_1 = require("../entities/pack.entity");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const slugifyLocal = (value) => {
    return (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
};
let SyncService = class SyncService {
    constructor(toyRepo, catRepo, imgRepo, ageRepo, packRepo) {
        this.toyRepo = toyRepo;
        this.catRepo = catRepo;
        this.imgRepo = imgRepo;
        this.ageRepo = ageRepo;
        this.packRepo = packRepo;
    }
    parsePrice(text) {
        if (!text)
            return 0;
        const clean = text.replace(/[^\d.,]/g, '').replace(',', '.');
        const n = parseFloat(clean);
        return isNaN(n) ? 0 : n;
    }
    mapAgeToMonths(age) {
        if (!age)
            return null;
        const lower = age.toLowerCase();
        const nums = lower.match(/\d+/g);
        if (!nums)
            return null;
        const a = parseInt(nums[0]);
        const b = nums[1] ? parseInt(nums[1]) : null;
        if (lower.includes('mois'))
            return { min: a, max: b !== null && b !== void 0 ? b : a };
        if (lower.includes('+'))
            return { min: a * 12, max: null };
        if (lower.includes('-') && b)
            return { min: a * 12, max: b * 12 };
        if (lower.includes('an'))
            return { min: a * 12, max: a * 12 };
        return null;
    }
    resolvePackType(value) {
        if (!value)
            return pack_entity_1.PackType.CUSTOM;
        const normalized = value.toLowerCase();
        const allowed = Object.values(pack_entity_1.PackType);
        return allowed.includes(normalized) ? normalized : pack_entity_1.PackType.CUSTOM;
    }
    async syncToysFromMapping() {
        var _a;
        const file = path.join(process.cwd(), 'public', 'toys', 'toys-mapping.json');
        const raw = fs.readFileSync(file, 'utf-8').replace(/^\uFEFF/, '').trim();
        const mapping = JSON.parse(raw);
        let created = 0, updated = 0;
        for (const m of mapping.toys) {
            const catNames = (m.category || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
            const categories = [];
            if (catNames.length) {
                const existing = await this.catRepo.find({ where: { name: (0, typeorm_2.In)(catNames) } });
                const categoryMap = new Map(existing.map(cat => [cat.name, cat]));
                for (const name of catNames) {
                    let category = categoryMap.get(name);
                    if (!category) {
                        const payload = {
                            name,
                            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            isActive: true,
                            displayOrder: 0,
                        };
                        category = await this.catRepo.save(this.catRepo.create(payload));
                        categoryMap.set(name, category);
                    }
                    if (category) {
                        categories.push(category);
                    }
                }
            }
            const range = this.mapAgeToMonths(m.age || '');
            let ageRel = null;
            if (range) {
                const ranges = await this.ageRepo.find();
                for (const ar of ranges) {
                    const max = (_a = ar.ageMax) !== null && _a !== void 0 ? _a : 9999;
                    if (range.max !== null) {
                        if (range.min <= max && range.max >= ar.ageMin) {
                            ageRel = ar;
                            break;
                        }
                    }
                    else {
                        if (range.min >= ar.ageMin) {
                            ageRel = ar;
                            break;
                        }
                    }
                }
            }
            const stockQty = parseInt(String(m.stock || '0')) || 0;
            const weekly = this.parsePrice(m.price);
            const daily = Math.round((weekly / 4.8) * 100) / 100;
            const monthly = Math.round((weekly * (15 / 4.8)) * 100) / 100;
            const toySku = m.slug || `toy-${m.id}`;
            const toySlug = slugifyLocal(m.slug || m.name || toySku);
            let toy = await this.toyRepo.findOne({ where: [{ sku: toySku }, { slug: toySlug }], relations: ['images', 'categories'] });
            try {
                if (!toy) {
                    const payload = {
                        sku: toySku,
                        slug: toySlug,
                        name: m.name,
                        description: m.description,
                        videoUrl: m.videoUrl,
                        rentalPriceWeekly: weekly,
                        rentalPriceDaily: daily,
                        rentalPriceMonthly: monthly,
                        stockQuantity: stockQty,
                        availableQuantity: stockQty,
                        isActive: true,
                        categories,
                    };
                    toy = await this.toyRepo.save(this.toyRepo.create(payload));
                    created++;
                }
                else {
                    toy.name = m.name;
                    toy.description = m.description;
                    toy.videoUrl = m.videoUrl;
                    toy.rentalPriceWeekly = weekly;
                    toy.rentalPriceDaily = daily;
                    toy.rentalPriceMonthly = monthly;
                    toy.stockQuantity = stockQty;
                    toy.availableQuantity = Math.max(toy.availableQuantity || 0, stockQty);
                    toy.categories = categories;
                    toy.slug = toy.slug || toySlug;
                    toy = await this.toyRepo.save(toy);
                    updated++;
                }
            }
            catch (err) {
                if ((err === null || err === void 0 ? void 0 : err.code) === '23505') {
                    toy = await this.toyRepo.findOne({ where: [{ slug: toySlug }, { sku: toySku }], relations: ['images', 'categories'] });
                    if (toy) {
                        toy.name = m.name;
                        toy.description = m.description;
                        toy.videoUrl = m.videoUrl;
                        toy.rentalPriceWeekly = weekly;
                        toy.rentalPriceDaily = daily;
                        toy.rentalPriceMonthly = monthly;
                        toy.stockQuantity = stockQty;
                        toy.availableQuantity = Math.max(toy.availableQuantity || 0, stockQty);
                        toy.categories = categories;
                        toy.slug = toy.slug || toySlug;
                        toy = await this.toyRepo.save(toy);
                        updated++;
                        continue;
                    }
                }
                throw err;
            }
            if (!toy) {
                continue;
            }
            if (m.image) {
                const existingImage = await this.imgRepo.findOne({
                    where: { toy: { id: toy.id }, url: m.image },
                });
                if (!existingImage) {
                    const imagePayload = {
                        toy,
                        url: m.image,
                        altText: m.name,
                        isPrimary: true,
                        displayOrder: 0,
                    };
                    await this.imgRepo.save(this.imgRepo.create(imagePayload));
                }
            }
        }
        return { created, updated };
    }
    async syncPacksFromDefault() {
        var _a, _b;
        const file = path.join(process.cwd(), 'public', 'packs', 'default-packs.json');
        const raw = fs.readFileSync(file, 'utf-8').replace(/^\uFEFF/, '').trim();
        const items = JSON.parse(raw);
        let created = 0, updated = 0;
        for (const p of items) {
            let pack = await this.packRepo.findOne({ where: { slug: p.slug } });
            const data = {
                name: p.name,
                slug: p.slug,
                type: this.resolvePackType(p.type),
                description: p.description,
                price: p.price,
                toyCount: p.toyCount,
                durationDays: p.durationDays,
                features: JSON.stringify(p.features || []),
                icon: p.icon,
                displayOrder: (_a = p.displayOrder) !== null && _a !== void 0 ? _a : 0,
                isActive: (_b = p.isActive) !== null && _b !== void 0 ? _b : true,
            };
            if (!pack) {
                pack = await this.packRepo.save(this.packRepo.create(data));
                created++;
            }
            else {
                this.packRepo.merge(pack, data);
                await this.packRepo.save(pack);
                updated++;
            }
        }
        return { created, updated };
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(toy_entity_1.Toy)),
    __param(1, (0, typeorm_1.InjectRepository)(toy_category_entity_1.ToyCategory)),
    __param(2, (0, typeorm_1.InjectRepository)(toy_image_entity_1.ToyImage)),
    __param(3, (0, typeorm_1.InjectRepository)(age_range_entity_1.AgeRange)),
    __param(4, (0, typeorm_1.InjectRepository)(pack_entity_1.Pack)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SyncService);
