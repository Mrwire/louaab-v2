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
exports.AdminUser = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["OPERATIONS"] = "operations";
    UserRole["SUPPORT"] = "support";
    UserRole["MARKETING"] = "marketing";
    UserRole["FINANCE"] = "finance";
})(UserRole || (exports.UserRole = UserRole = {}));
let AdminUser = class AdminUser {
};
exports.AdminUser = AdminUser;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AdminUser.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], AdminUser.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AdminUser.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AdminUser.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AdminUser.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserRole,
        default: UserRole.SUPPORT,
    }),
    __metadata("design:type", String)
], AdminUser.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], AdminUser.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AdminUser.prototype, "lastLogin", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AdminUser.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AdminUser.prototype, "updatedAt", void 0);
exports.AdminUser = AdminUser = __decorate([
    (0, typeorm_1.Entity)('admin_users')
], AdminUser);
