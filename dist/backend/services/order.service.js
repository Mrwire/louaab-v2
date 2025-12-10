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
const stock_gateway_1 = require("../gateways/stock.gateway");
let OrderService = class OrderService {
    constructor(orderRepository, orderItemRepository, toyRepository, customerRepository, deliveryRepository, stockGateway) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.toyRepository = toyRepository;
        this.customerRepository = customerRepository;
        this.deliveryRepository = deliveryRepository;
        this.stockGateway = stockGateway;
    }
    /**
     * Emit real-time stock update via WebSocket
     */
    emitStockUpdate(toy) {
        if (this.stockGateway) {
            const update = {
                toyId: toy.id,
                slug: toy.slug,
                name: toy.name,
                stockQuantity: Number(toy.stockQuantity) || 0,
                availableQuantity: Number(toy.availableQuantity) || 0,
                status: toy.status,
                timestamp: Date.now(),
            };
            this.stockGateway.emitStockUpdate(update);
        }
    }
    async create(createOrderDto) {
        var _a, _b;
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
            const available = Number((_a = toy.availableQuantity) !== null && _a !== void 0 ? _a : 0);
            const physicalStock = Number((_b = toy.stockQuantity) !== null && _b !== void 0 ? _b : 0);
            const effectiveAvailable = available > 0 ? available : physicalStock;
            if (effectiveAvailable < item.quantity) {
                throw new common_1.BadRequestException(`Stock insuffisant pour ${toy.name}. Disponible: ${effectiveAvailable}`);
            }
        }
        // Generate order number
        const orderNumber = await this.generateOrderNumber();
        // Create order
        const order = this.orderRepository.create(Object.assign(Object.assign({}, orderData), { orderNumber,
            customer, status: order_entity_1.OrderStatus.DRAFT }));
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
                rentalStartDate: itemDto.rentalStartDate ? new Date(itemDto.rentalStartDate) : new Date(),
                conditionBefore: toy.condition,
            });
            await this.orderItemRepository.save(orderItem);
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
            .leftJoinAndSelect('toy.images', 'toyImages')
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
        var _a, _b;
        const order = await this.findOne(id);
        const previousStatus = order.status;
        order.status = status;
        const adjustToyStock = async (toyId, delta, options) => {
            const updatedToy = await this.toyRepository.manager.transaction(async (manager) => {
                var _a, _b, _c;
                const toy = await manager.findOne(toy_entity_1.Toy, {
                    where: { id: toyId },
                    lock: { mode: 'pessimistic_write' },
                });
                if (!toy) {
                    throw new common_1.NotFoundException(`Jouet ${toyId} introuvable`);
                }
                const physical = Number((_a = toy.stockQuantity) !== null && _a !== void 0 ? _a : 0);
                const available = Number((_b = toy.availableQuantity) !== null && _b !== void 0 ? _b : physical);
                const newPhysical = Math.max(0, physical + delta);
                const newAvailable = Math.max(0, Math.min(available + delta, newPhysical));
                toy.stockQuantity = newPhysical;
                toy.availableQuantity = newAvailable;
                if (options === null || options === void 0 ? void 0 : options.forceStatus) {
                    toy.status = options.forceStatus;
                }
                else if (newPhysical <= 0) {
                    toy.status = toy_entity_1.ToyStatus.MAINTENANCE;
                }
                else if (![toy_entity_1.ToyStatus.RENTED, toy_entity_1.ToyStatus.RESERVED].includes(toy.status)) {
                    toy.status = toy_entity_1.ToyStatus.AVAILABLE;
                }
                if (options === null || options === void 0 ? void 0 : options.rentalDelta) {
                    toy.timesRented = Math.max(0, ((_c = toy.timesRented) !== null && _c !== void 0 ? _c : 0) + options.rentalDelta);
                }
                return manager.save(toy);
            });
            // Emit real-time stock update via WebSocket
            this.emitStockUpdate(updatedToy);
            return updatedToy;
        };
        if (status === order_entity_1.OrderStatus.CONFIRMED) {
            if (previousStatus !== order_entity_1.OrderStatus.DRAFT) {
                throw new common_1.BadRequestException('Confirmation impossible: statut actuel non pending/draft');
            }
            // Décrémentation stock à la confirmation
            for (const item of order.items) {
                const toy = await this.toyRepository.findOne({ where: { id: item.toy.id } });
                if (!toy) {
                    throw new common_1.NotFoundException(`Jouet ${item.toy.id} introuvable`);
                }
                const physicalStock = Number((_a = toy.stockQuantity) !== null && _a !== void 0 ? _a : 0);
                const available = Number((_b = toy.availableQuantity) !== null && _b !== void 0 ? _b : physicalStock);
                const baseAvailable = available > 0 ? available : physicalStock;
                if (baseAvailable < item.quantity) {
                    throw new common_1.BadRequestException(`Stock insuffisant pour ${toy.name}. Disponible: ${baseAvailable}`);
                }
            }
            for (const item of order.items) {
                await adjustToyStock(item.toy.id, -item.quantity, {
                    forceStatus: toy_entity_1.ToyStatus.RESERVED,
                    rentalDelta: item.quantity,
                });
            }
        }
        else if (status === order_entity_1.OrderStatus.DELIVERED) {
            for (const item of order.items) {
                await adjustToyStock(item.toy.id, 0, { forceStatus: toy_entity_1.ToyStatus.RENTED });
            }
        }
        else if (status === order_entity_1.OrderStatus.RETURNED) {
            for (const item of order.items) {
                await adjustToyStock(item.toy.id, item.quantity, { forceStatus: toy_entity_1.ToyStatus.CLEANING });
            }
        }
        else if (status === order_entity_1.OrderStatus.COMPLETED) {
            for (const item of order.items) {
                if (previousStatus !== order_entity_1.OrderStatus.RETURNED) {
                    await adjustToyStock(item.toy.id, item.quantity, { forceStatus: toy_entity_1.ToyStatus.AVAILABLE });
                }
                else {
                    await adjustToyStock(item.toy.id, 0, { forceStatus: toy_entity_1.ToyStatus.AVAILABLE });
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
            const updatedToy = await this.toyRepository.manager.transaction(async (manager) => {
                var _a, _b, _c;
                const toy = await manager.findOne(toy_entity_1.Toy, {
                    where: { id: item.toy.id },
                    lock: { mode: 'pessimistic_write' },
                });
                if (!toy)
                    return null;
                const physical = Number((_a = toy.stockQuantity) !== null && _a !== void 0 ? _a : 0);
                const available = Number((_b = toy.availableQuantity) !== null && _b !== void 0 ? _b : 0);
                const creditedPhysical = physical + item.quantity;
                const creditedAvailable = available + item.quantity;
                toy.stockQuantity = creditedPhysical;
                toy.availableQuantity = Math.min(creditedAvailable, creditedPhysical);
                toy.status = toy_entity_1.ToyStatus.AVAILABLE;
                toy.timesRented = Math.max(0, ((_c = toy.timesRented) !== null && _c !== void 0 ? _c : 0) - item.quantity);
                return manager.save(toy);
            });
            // Emit real-time stock update via WebSocket
            if (updatedToy) {
                this.emitStockUpdate(updatedToy);
            }
        }
        order.status = order_entity_1.OrderStatus.CANCELLED;
        await this.orderRepository.save(order);
        return this.findOne(id);
    }
    async reset(id) {
        var _a;
        const order = await this.findOne(id);
        const previousStatus = order.status;
        for (const item of order.items) {
            const toy = await this.toyRepository.findOne({ where: { id: item.toy.id } });
            if (!toy) {
                continue;
            }
            // If the order had already decremented stock (confirmed or delivered), credit it back safely
            if ([order_entity_1.OrderStatus.CONFIRMED, order_entity_1.OrderStatus.DELIVERED].includes(previousStatus)) {
                const updatedToy = await this.toyRepository.manager.transaction(async (manager) => {
                    var _a, _b, _c;
                    const lockedToy = await manager.findOne(toy_entity_1.Toy, {
                        where: { id: item.toy.id },
                        lock: { mode: 'pessimistic_write' },
                    });
                    if (!lockedToy)
                        return null;
                    const physical = Number((_a = lockedToy.stockQuantity) !== null && _a !== void 0 ? _a : 0);
                    const currentAvailable = Number((_b = lockedToy.availableQuantity) !== null && _b !== void 0 ? _b : 0);
                    const newPhysical = Math.max(0, physical + item.quantity);
                    const credited = currentAvailable + item.quantity;
                    lockedToy.stockQuantity = newPhysical;
                    lockedToy.availableQuantity = newPhysical > 0 ? Math.min(credited, newPhysical) : credited;
                    lockedToy.status = toy_entity_1.ToyStatus.AVAILABLE;
                    lockedToy.timesRented = Math.max(0, ((_c = lockedToy.timesRented) !== null && _c !== void 0 ? _c : 0) - item.quantity);
                    return manager.save(lockedToy);
                });
                // Emit real-time stock update via WebSocket
                if (updatedToy) {
                    this.emitStockUpdate(updatedToy);
                }
                continue;
            }
            // Restore status and rental counter when no stock credit is needed
            toy.status = toy_entity_1.ToyStatus.AVAILABLE;
            toy.timesRented = Math.max(0, ((_a = toy.timesRented) !== null && _a !== void 0 ? _a : 0) - item.quantity);
            const savedToy = await this.toyRepository.save(toy);
            this.emitStockUpdate(savedToy);
        }
        order.status = order_entity_1.OrderStatus.DRAFT;
        await this.orderRepository.save(order);
        return this.findOne(id);
    }
    async generateOrderNumber() {
        const count = await this.orderRepository.count();
        return `LOUAAB-N-${String(count + 1).padStart(4, '0')}`;
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
    __param(5, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        stock_gateway_1.StockGateway])
], OrderService);
