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
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const toy_category_entity_1 = require("../entities/toy-category.entity");
let CategoryService = class CategoryService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async create(createCategoryDto) {
        const category = this.categoryRepository.create(createCategoryDto);
        if (createCategoryDto.parentId) {
            const parent = await this.categoryRepository.findOne({
                where: { id: createCategoryDto.parentId },
            });
            if (parent) {
                category.parent = parent;
            }
        }
        return await this.categoryRepository.save(category);
    }
    async findAll() {
        return await this.categoryRepository.find({
            where: {
                isActive: true,
                parent: (0, typeorm_2.IsNull)(), // Uniquement les catégories racines (sans parent)
            },
            relations: ['parent'],
            order: { displayOrder: 'ASC', name: 'ASC' },
        });
    }
    async findAllIncludingInactive() {
        return await this.categoryRepository.find({
            relations: ['parent'],
            order: { displayOrder: 'ASC', name: 'ASC' },
        });
    }
    async findOne(id) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['parent', 'children', 'toys'],
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async update(id, updateCategoryDto) {
        const category = await this.findOne(id);
        if (updateCategoryDto.parentId !== undefined) {
            if (updateCategoryDto.parentId === null) {
                category.parent = null;
            }
            else {
                const parent = await this.categoryRepository.findOne({
                    where: { id: updateCategoryDto.parentId },
                });
                if (parent) {
                    category.parent = parent;
                }
            }
        }
        // Exclure parentId de l'assignation car on l'a déjà géré
        const { parentId } = updateCategoryDto, updateData = __rest(updateCategoryDto, ["parentId"]);
        Object.assign(category, updateData);
        return await this.categoryRepository.save(category);
    }
    async remove(id) {
        const category = await this.findOne(id);
        await this.categoryRepository.remove(category);
    }
    async getToysCount(categoryId) {
        var _a;
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
            relations: ['toys'],
        });
        return ((_a = category === null || category === void 0 ? void 0 : category.toys) === null || _a === void 0 ? void 0 : _a.length) || 0;
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(toy_category_entity_1.ToyCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoryService);
