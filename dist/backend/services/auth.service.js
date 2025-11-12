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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const admin_user_entity_1 = require("../entities/admin-user.entity");
const customer_entity_1 = require("../entities/customer.entity");
let AuthService = class AuthService {
    constructor(adminUserRepository, customerRepository, jwtService) {
        this.adminUserRepository = adminUserRepository;
        this.customerRepository = customerRepository;
        this.jwtService = jwtService;
    }
    async validateAdmin(email, password) {
        const admin = await this.adminUserRepository.findOne({
            where: { email, isActive: true },
        });
        if (!admin) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        // Update last login
        admin.lastLogin = new Date();
        await this.adminUserRepository.save(admin);
        return admin;
    }
    async validateCustomer(email, password) {
        const customer = await this.customerRepository.findOne({
            where: { email, isActive: true },
        });
        if (!customer || !customer.passwordHash) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        const isPasswordValid = await bcrypt.compare(password, customer.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        return customer;
    }
    async loginAdmin(email, password) {
        const admin = await this.validateAdmin(email, password);
        const payload = {
            sub: admin.id,
            email: admin.email,
            role: admin.role,
            type: 'admin',
        };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '30d' }),
            user: {
                id: admin.id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                role: admin.role,
            },
        };
    }
    async loginCustomer(email, password) {
        const customer = await this.validateCustomer(email, password);
        const payload = {
            sub: customer.id,
            email: customer.email,
            type: 'customer',
        };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '30d' }),
            user: {
                id: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
            },
        };
    }
    async registerCustomer(data) {
        // Check if customer already exists
        const existing = await this.customerRepository.findOne({
            where: { email: data.email },
        });
        if (existing) {
            throw new common_1.UnauthorizedException('Un compte avec cet email existe déjà');
        }
        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 10);
        // Create customer
        const customer = this.customerRepository.create(Object.assign(Object.assign({}, data), { passwordHash }));
        return this.customerRepository.save(customer);
    }
    async hashPassword(password) {
        return bcrypt.hash(password, 10);
    }
    verifyToken(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch (_a) {
            throw new common_1.UnauthorizedException('Token invalide');
        }
    }
    async refreshToken(refreshToken) {
        const payload = this.verifyToken(refreshToken);
        const newPayload = {
            sub: payload.sub,
            email: payload.email,
            role: payload.role,
            type: payload.type,
        };
        return {
            access_token: this.jwtService.sign(newPayload),
            refresh_token: this.jwtService.sign(newPayload, { expiresIn: '30d' }),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_user_entity_1.AdminUser)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
