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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicOrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("../entities/customer.entity");
const toy_entity_1 = require("../entities/toy.entity");
const order_service_1 = require("./order.service");
const normalizeEmail = (email, phone) => {
    if (email && email.trim().length > 0) {
        return email.trim().toLowerCase();
    }
    const safePhone = (phone === null || phone === void 0 ? void 0 : phone.replace(/[^\d]/g, '')) || `guest-${Date.now()}`;
    return `client+${safePhone}@louaab.local`;
};
const splitName = (fullName) => {
    var _a;
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0)
        return { firstName: 'Client', lastName: '' };
    const firstName = (_a = parts.shift()) !== null && _a !== void 0 ? _a : 'Client';
    const lastName = parts.join(' ');
    return { firstName, lastName };
};
let PublicOrdersService = class PublicOrdersService {
    constructor(customerRepository, toyRepository, orderService) {
        this.customerRepository = customerRepository;
        this.toyRepository = toyRepository;
        this.orderService = orderService;
    }
    async resolveCustomer(name, phone, email, address, city) {
        const safeAddress = address !== null && address !== void 0 ? address : '';
        const safeCity = city !== null && city !== void 0 ? city : '';
        const normalizedEmail = normalizeEmail(email, phone);
        let customer = (await this.customerRepository.findOne({ where: { email: normalizedEmail } })) ||
            (await this.customerRepository.findOne({ where: { phone } }));
        const { firstName, lastName } = splitName(name);
        if (!customer) {
            customer = this.customerRepository.create({
                email: normalizedEmail,
                firstName,
                lastName,
                phone,
                address: safeAddress,
                city: safeCity,
                isActive: true,
            });
        }
        else {
            customer.firstName = customer.firstName || firstName;
            customer.lastName = customer.lastName || lastName;
            if (!customer.phone && phone) {
                customer.phone = phone;
            }
            if (!customer.address && safeAddress) {
                customer.address = safeAddress;
            }
            if (!customer.city && safeCity) {
                customer.city = safeCity;
            }
        }
        return this.customerRepository.save(customer);
    }
    async buildOrderItems(dto) {
        return Promise.all(dto.items.map(async (item) => {
            const toy = await this.toyRepository.findOne({ where: { id: item.toyId } });
            if (!toy) {
                throw new common_1.NotFoundException(`Jouet ${item.toyId} introuvable`);
            }
            return {
                toyId: toy.id,
                quantity: item.quantity,
                rentalPrice: item.unitPrice,
                rentalDurationDays: item.rentalDurationDays,
            };
        }));
    }
    async create(dto) {
        var _a, _b, _c, _d, _e;
        const customer = await this.resolveCustomer((_a = dto.customerName) !== null && _a !== void 0 ? _a : 'Client', (_b = dto.customerPhone) !== null && _b !== void 0 ? _b : '0000000000', dto.customerEmail, dto.deliveryAddress, dto.deliveryCity);
        const items = await this.buildOrderItems(dto);
        const totalAmount = (_c = dto.totalAmount) !== null && _c !== void 0 ? _c : items.reduce((sum, item) => sum + item.rentalPrice * item.quantity, 0);
        const createOrderPayload = {
            customerId: customer.id,
            items,
            totalAmount,
            depositAmount: (_d = dto.depositAmount) !== null && _d !== void 0 ? _d : 0,
            deliveryAddress: dto.deliveryAddress,
            deliveryCity: dto.deliveryCity,
            deliveryDate: (_e = dto.deliveryDate) !== null && _e !== void 0 ? _e : new Date().toISOString(),
            deliveryTimeSlot: dto.deliveryTimeSlot,
            notes: dto.notes,
        };
        return this.orderService.create(createOrderPayload);
    }
};
exports.PublicOrdersService = PublicOrdersService;
exports.PublicOrdersService = PublicOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(toy_entity_1.Toy)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        order_service_1.OrderService])
], PublicOrdersService);
