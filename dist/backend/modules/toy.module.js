"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToyModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const toy_controller_1 = require("../controllers/toy.controller");
const toy_service_1 = require("../services/toy.service");
const toy_entity_1 = require("../entities/toy.entity");
const toy_category_entity_1 = require("../entities/toy-category.entity");
const toy_image_entity_1 = require("../entities/toy-image.entity");
const cleaning_log_entity_1 = require("../entities/cleaning-log.entity");
let ToyModule = class ToyModule {
};
exports.ToyModule = ToyModule;
exports.ToyModule = ToyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([toy_entity_1.Toy, toy_category_entity_1.ToyCategory, toy_image_entity_1.ToyImage, cleaning_log_entity_1.CleaningLog]),
        ],
        controllers: [toy_controller_1.ToyController],
        providers: [toy_service_1.ToyService],
        exports: [toy_service_1.ToyService],
    })
], ToyModule);
