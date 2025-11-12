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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../entities/order.entity");
const order_item_entity_1 = require("../entities/order-item.entity");
const toy_entity_1 = require("../entities/toy.entity");
const customer_entity_1 = require("../entities/customer.entity");
const delivery_entity_1 = require("../entities/delivery.entity");
let OrderService = class OrderService {
    constructor(orderRepository, orderItemRepository, toyRepository, customerRepository, deliveryRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.toyRepository = toyRepository;
        this.customerRepository = customerRepository;
        this.deliveryRepository = deliveryRepository;
    }
    async create(createOrderDto) {
        const { customerId, items } = createOrderDto, orderData = __rest(createOrderDto, ["customerId", "items"]);
        // Verify customer exists
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Client non trouvé');
        }
        // Verify toys availability
        for (const item of items) {
            const toy = await this.toyRepository.findOne({
                where: { id: item.toyId },
            });
            if (!toy) {
                throw new common_1.NotFoundException(`Jouet ${item.toyId} non trouvé`);
            }
            if (toy.availableQuantity < item.quantity) {
                throw new common_1.BadRequestException(`Stock insuffisant pour ${toy.name}. Disponible: ${toy.availableQuantity}`);
            }
        }
        // Generate order number
        const orderNumber = await this.generateOrderNumber();
        // Create order
        const order = this.orderRepository.create(Object.assign(Object.assign({}, orderData), { orderNumber,
            customer, status: order_entity_1.OrderStatus.CONFIRMED }));
        const savedOrder = await this.orderRepository.save(order);
        // Create order items and update toy availability
        for (const itemDto of items) {
            const toy = await this.toyRepository.findOne({
                where: { id: itemDto.toyId },
            });
            if (!toy) {
                throw new Error(`Toy with ID ${itemDto.toyId} not found`);
            }
            const orderItem = this.orderItemRepository.create({
                order: savedOrder,
                toy,
                quantity: itemDto.quantity,
                rentalPrice: itemDto.rentalPrice,
                rentalDurationDays: itemDto.rentalDurationDays,
                conditionBefore: toy.condition,
            });
            await this.orderItemRepository.save(orderItem);
            // Update toy status and availability
            toy.status = toy_entity_1.ToyStatus.RESERVED;
            toy.availableQuantity -= itemDto.quantity;
            toy.timesRented += itemDto.quantity;
            await this.toyRepository.save(toy);
        }
        // Create delivery record
        const delivery = this.deliveryRepository.create({
            order: savedOrder,
            deliveryType: 'delivery',
            status: delivery_entity_1.DeliveryStatus.SCHEDULED,
            scheduledDate: new Date(createOrderDto.deliveryDate),
            scheduledTimeSlot: createOrderDto.deliveryTimeSlot,
            recipientName: `${customer.firstName} ${customer.lastName}`,
            recipientPhone: customer.phone,
        });
        await this.deliveryRepository.save(delivery);
        return this.findOne(savedOrder.id);
    }
    async findAll(query) {
        const { customerId, status, city, deliveryDateFrom, deliveryDateTo, page = 1, limit = 20, } = query;
        const queryBuilder = this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.toy', 'toy')
            .leftJoinAndSelect('order.deliveries', 'deliveries');
        if (customerId) {
            queryBuilder.andWhere('order.customer.id = :customerId', { customerId });
        }
        if (status) {
            queryBuilder.andWhere('order.status = :status', { status });
        }
        if (city) {
            queryBuilder.andWhere('order.deliveryCity = :city', { city });
        }
        if (deliveryDateFrom && deliveryDateTo) {
            queryBuilder.andWhere('order.deliveryDate BETWEEN :from AND :to', {
                from: deliveryDateFrom,
                to: deliveryDateTo,
            });
        }
        queryBuilder.orderBy('order.createdAt', 'DESC');
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        const [items, total] = await queryBuilder.getManyAndCount();
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: [
                'customer',
                'customer.children',
                'subscription',
                'items',
                'items.toy',
                'items.toy.images',
                'deliveries',
                'assignedDriver',
            ],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Commande ${id} non trouvée`);
        }
        return order;
    }
    async update(id, updateOrderDto) {
        const order = await this.findOne(id);
        Object.assign(order, updateOrderDto);
        // Handle driver assignment
        if (updateOrderDto.assignedDriverId) {
            // Would validate driver exists
            // For now, just assign
        }
        await this.orderRepository.save(order);
        return this.findOne(id);
    }
    async updateStatus(id, status) {
        const order = await this.findOne(id);
        order.status = status;
        // Handle toy status changes based on order status
        if (status === order_entity_1.OrderStatus.DELIVERED) {
            // Update toys to RENTED
            for (const item of order.items) {
                const toy = await this.toyRepository.findOne({
                    where: { id: item.toy.id },
                });
                if (toy) {
                    toy.status = toy_entity_1.ToyStatus.RENTED;
                    await this.toyRepository.save(toy);
                }
            }
        }
        else if (status === order_entity_1.OrderStatus.RETURNED) {
            // Mark toys for cleaning
            for (const item of order.items) {
                const toy = await this.toyRepository.findOne({
                    where: { id: item.toy.id },
                });
                if (toy) {
                    toy.status = toy_entity_1.ToyStatus.CLEANING;
                    await this.toyRepository.save(toy);
                }
            }
        }
        else if (status === order_entity_1.OrderStatus.COMPLETED) {
            // Return toys to available
            for (const item of order.items) {
                const toy = await this.toyRepository.findOne({
                    where: { id: item.toy.id },
                });
                if (toy) {
                    toy.status = toy_entity_1.ToyStatus.AVAILABLE;
                    toy.availableQuantity += item.quantity;
                    await this.toyRepository.save(toy);
                }
            }
        }
        await this.orderRepository.save(order);
        return this.findOne(id);
    }
    async cancel(id) {
        const order = await this.findOne(id);
        if (![order_entity_1.OrderStatus.DRAFT, order_entity_1.OrderStatus.CONFIRMED].includes(order.status)) {
            throw new common_1.BadRequestException('Seules les commandes en brouillon ou confirmées peuvent être annulées');
        }
        // Return toys to available
        for (const item of order.items) {
            const toy = await this.toyRepository.findOne({
                where: { id: item.toy.id },
            });
            if (toy) {
                toy.status = toy_entity_1.ToyStatus.AVAILABLE;
                toy.availableQuantity += item.quantity;
                toy.timesRented -= item.quantity;
                await this.toyRepository.save(toy);
            }
        }
        order.status = order_entity_1.OrderStatus.CANCELLED;
        await this.orderRepository.save(order);
        return this.findOne(id);
    }
    async generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const count = await this.orderRepository.count();
        return `CMD-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    async getStats() {
        const total = await this.orderRepository.count();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await this.orderRepository.count({
            where: {
                createdAt: (0, typeorm_2.Between)(today, new Date()),
            },
        });
        const byStatus = await this.orderRepository
            .createQueryBuilder('order')
            .select('order.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('order.status')
            .getRawMany();
        return {
            total,
            today: todayCount,
            byStatus,
        };
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(toy_entity_1.Toy)),
    __param(3, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(4, (0, typeorm_1.InjectRepository)(delivery_entity_1.Delivery)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrderService);
