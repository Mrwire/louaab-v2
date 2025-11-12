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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleaningLog = void 0;
const typeorm_1 = require("typeorm");
const toy_entity_1 = require("./toy.entity");
const admin_user_entity_1 = require("./admin-user.entity");
let CleaningLog = class CleaningLog {
};
exports.CleaningLog = CleaningLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CleaningLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => toy_entity_1.Toy, toy => toy.cleaningLogs, { onDelete: 'CASCADE' }),
    __metadata("design:type", toy_entity_1.Toy)
], CleaningLog.prototype, "toy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_user_entity_1.AdminUser, { nullable: true }),
    __metadata("design:type", admin_user_entity_1.AdminUser)
], CleaningLog.prototype, "cleanedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], CleaningLog.prototype, "cleaningDate", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], CleaningLog.prototype, "productsUsed", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], CleaningLog.prototype, "conditionNotes", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], CleaningLog.prototype, "photos", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CleaningLog.prototype, "createdAt", void 0);
exports.CleaningLog = CleaningLog = __decorate([
    (0, typeorm_1.Entity)('cleaning_logs')
], CleaningLog);
