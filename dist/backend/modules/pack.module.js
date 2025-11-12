"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pack_controller_1 = require("../controllers/pack.controller");
const pack_service_1 = require("../services/pack.service");
const pack_entity_1 = require("../entities/pack.entity");
let PackModule = class PackModule {
};
exports.PackModule = PackModule;
exports.PackModule = PackModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([pack_entity_1.Pack]),
        ],
        controllers: [pack_controller_1.PackController],
        providers: [pack_service_1.PackService],
        exports: [pack_service_1.PackService],
    })
], PackModule);
