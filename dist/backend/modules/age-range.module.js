"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgeRangeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const age_range_controller_1 = require("../controllers/age-range.controller");
const age_range_service_1 = require("../services/age-range.service");
const age_range_entity_1 = require("../entities/age-range.entity");
let AgeRangeModule = class AgeRangeModule {
};
exports.AgeRangeModule = AgeRangeModule;
exports.AgeRangeModule = AgeRangeModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([age_range_entity_1.AgeRange])],
        controllers: [age_range_controller_1.AgeRangeController],
        providers: [age_range_service_1.AgeRangeService],
        exports: [age_range_service_1.AgeRangeService],
    })
], AgeRangeModule);
