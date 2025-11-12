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
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contact_message_entity_1 = require("../entities/contact-message.entity");
let ContactService = class ContactService {
    constructor(contactRepository) {
        this.contactRepository = contactRepository;
    }
    async create(createContactDto) {
        const contact = this.contactRepository.create(createContactDto);
        return this.contactRepository.save(contact);
    }
    async findAll(query) {
        const { status } = query;
        const where = {};
        if (status) {
            where.status = status;
        }
        return this.contactRepository.find({
            where,
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const contact = await this.contactRepository.findOne({ where: { id } });
        if (!contact) {
            throw new common_1.NotFoundException(`Contact message with ID "${id}" not found`);
        }
        return contact;
    }
    async update(id, updateContactDto) {
        const contact = await this.findOne(id);
        this.contactRepository.merge(contact, updateContactDto);
        return this.contactRepository.save(contact);
    }
    async remove(id) {
        const result = await this.contactRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Contact message with ID "${id}" not found`);
        }
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contact_message_entity_1.ContactMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ContactService);
