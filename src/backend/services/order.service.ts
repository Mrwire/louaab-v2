import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Toy, ToyStatus } from '../entities/toy.entity';
import { Customer } from '../entities/customer.entity';
import { Delivery, DeliveryStatus } from '../entities/delivery.entity';
import { CreateOrderDto, UpdateOrderDto, QueryOrdersDto } from '../dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Toy)
    private toyRepository: Repository<Toy>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { customerId, items, ...orderData } = createOrderDto;

    // Verify customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('Client non trouvé');
    }

    // Verify toys availability
    for (const item of items) {
      const toy = await this.toyRepository.findOne({
        where: { id: item.toyId },
      });
      if (!toy) {
        throw new NotFoundException(`Jouet ${item.toyId} non trouvé`);
      }
      const available = Number(toy.availableQuantity ?? 0);
      const physicalStock = Number(toy.stockQuantity ?? 0);
      const effectiveAvailable = available > 0 ? available : physicalStock;

      if (effectiveAvailable < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${toy.name}. Disponible: ${effectiveAvailable}`,
        );
      }
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = this.orderRepository.create({
      ...orderData,
      orderNumber,
      customer,
      status: OrderStatus.DRAFT,
    });

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
      status: DeliveryStatus.SCHEDULED,
      scheduledDate: new Date(createOrderDto.deliveryDate),
      scheduledTimeSlot: createOrderDto.deliveryTimeSlot,
      recipientName: `${customer.firstName} ${customer.lastName}`,
      recipientPhone: customer.phone,
    });

    await this.deliveryRepository.save(delivery);

    return this.findOne(savedOrder.id);
  }

  async findAll(query: QueryOrdersDto) {
    const {
      customerId,
      status,
      city,
      deliveryDateFrom,
      deliveryDateTo,
      page = 1,
      limit = 20,
    } = query;

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

  async findOne(id: string): Promise<Order> {
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
      throw new NotFoundException(`Commande ${id} non trouvée`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
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

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    const previousStatus = order.status;
    order.status = status;

    if (status === OrderStatus.CONFIRMED) {
      if (previousStatus !== OrderStatus.DRAFT) {
        throw new BadRequestException('Confirmation impossible: statut actuel non pending/draft');
      }
      // Décrémentation stock à la confirmation
      for (const item of order.items) {
        const toy = await this.toyRepository.findOne({ where: { id: item.toy.id } });
        if (!toy) {
          throw new NotFoundException(`Jouet ${item.toy.id} introuvable`);
        }
        const physicalStock = Number(toy.stockQuantity ?? 0);
        const available = Number(toy.availableQuantity ?? 0);
        const baseAvailable = available > 0 ? available : physicalStock;
        if (baseAvailable < item.quantity) {
          throw new BadRequestException(`Stock insuffisant pour ${toy.name}. Disponible: ${baseAvailable}`);
        }
      }
      for (const item of order.items) {
        const toy = await this.toyRepository.findOne({ where: { id: item.toy.id } });
        if (toy) {
          const physicalStock = Number(toy.stockQuantity ?? 0);
          const available = Number(toy.availableQuantity ?? 0);
          const baseAvailable = available > 0 ? available : physicalStock;
          const remaining = Math.max(0, baseAvailable - item.quantity);
          toy.availableQuantity = physicalStock > 0 ? Math.min(remaining, physicalStock) : remaining;
          toy.status = ToyStatus.RESERVED;
          toy.timesRented = Math.max(0, (toy.timesRented ?? 0) + item.quantity);
          await this.toyRepository.save(toy);
        }
      }
    } else if (status === OrderStatus.DELIVERED) {
      for (const item of order.items) {
        const toy = await this.toyRepository.findOne({ where: { id: item.toy.id } });
        if (toy) {
          toy.status = ToyStatus.RENTED;
          await this.toyRepository.save(toy);
        }
      }
    } else if (status === OrderStatus.RETURNED) {
      for (const item of order.items) {
        const toy = await this.toyRepository.findOne({ where: { id: item.toy.id } });
        if (toy) {
          toy.status = ToyStatus.CLEANING;
          const currentAvailable = Number(toy.availableQuantity || 0);
          const maxStock = Number(toy.stockQuantity || currentAvailable);
          toy.availableQuantity = Math.min(currentAvailable + item.quantity, maxStock || currentAvailable + item.quantity);
          await this.toyRepository.save(toy);
        }
      }
    } else if (status === OrderStatus.COMPLETED) {
      for (const item of order.items) {
        const toy = await this.toyRepository.findOne({ where: { id: item.toy.id } });
        if (toy) {
          toy.status = ToyStatus.AVAILABLE;
          if (previousStatus !== OrderStatus.RETURNED) {
            const currentAvailable = Number(toy.availableQuantity || 0);
            const maxStock = Number(toy.stockQuantity || currentAvailable);
            toy.availableQuantity = Math.min(currentAvailable + item.quantity, maxStock || currentAvailable + item.quantity);
          }
          await this.toyRepository.save(toy);
        }
      }
    }

    await this.orderRepository.save(order);
    return this.findOne(id);
  }

  async cancel(id: string): Promise<Order> {
    const order = await this.findOne(id);

    if (![OrderStatus.DRAFT, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new BadRequestException(
        'Seules les commandes en brouillon ou confirmées peuvent être annulées',
      );
    }

    // Return toys to available
    for (const item of order.items) {
      const toy = await this.toyRepository.findOne({
        where: { id: item.toy.id },
      });
      if (toy) {
        toy.status = ToyStatus.AVAILABLE;
        toy.availableQuantity += item.quantity;
        toy.timesRented -= item.quantity;
        await this.toyRepository.save(toy);
      }
    }

    order.status = OrderStatus.CANCELLED;
    await this.orderRepository.save(order);

    return this.findOne(id);
  }

  async reset(id: string): Promise<Order> {
    const order = await this.findOne(id);
    const previousStatus = order.status;

    for (const item of order.items) {
      const toy = await this.toyRepository.findOne({ where: { id: item.toy.id } });
      if (!toy) {
        continue;
      }
      // Si la commande avait décrémenté le stock (confirmed ou delivered), on récrédite
      if ([OrderStatus.CONFIRMED, OrderStatus.DELIVERED].includes(previousStatus)) {
        const physical = Number(toy.stockQuantity ?? 0);
        const currentAvailable = Number(toy.availableQuantity ?? 0);
        const credited = currentAvailable + item.quantity;
        toy.availableQuantity = physical > 0 ? Math.min(credited, physical) : credited;
      }
      // Rétablir le statut dispo et corriger timesRented
      toy.status = ToyStatus.AVAILABLE;
      toy.timesRented = Math.max(0, (toy.timesRented ?? 0) - item.quantity);
      await this.toyRepository.save(toy);
    }

    order.status = OrderStatus.DRAFT;
    await this.orderRepository.save(order);
    return this.findOne(id);
  }

  private async generateOrderNumber(): Promise<string> {
    const count = await this.orderRepository.count();
    return `LOUAAB-N-${String(count + 1).padStart(4, '0')}`;
  }

  async getStats() {
    const total = await this.orderRepository.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await this.orderRepository.count({
      where: {
        createdAt: Between(today, new Date()),
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
}


