import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePublicOrderDto } from '../dto/public-order.dto';
import { Customer } from '../entities/customer.entity';
import { Toy } from '../entities/toy.entity';
import { OrderService } from './order.service';
import { CreateOrderDto } from '../dto/create-order.dto';

const normalizeEmail = (email?: string, phone?: string) => {
  if (email && email.trim().length > 0) {
    return email.trim().toLowerCase();
  }
  const safePhone = phone?.replace(/[^\d]/g, '') || `guest-${Date.now()}`;
  return `client+${safePhone}@louaab.local`;
};

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: 'Client', lastName: '' };
  const firstName = parts.shift() ?? 'Client';
  const lastName = parts.join(' ');
  return { firstName, lastName };
};

@Injectable()
export class PublicOrdersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Toy)
    private readonly toyRepository: Repository<Toy>,
    private readonly orderService: OrderService,
  ) {}

  private async resolveCustomer(name: string, phone: string, email?: string, address?: string, city?: string) {
    const safeAddress = address ?? '';
    const safeCity = city ?? '';
    const normalizedEmail = normalizeEmail(email, phone);
    let customer =
      (await this.customerRepository.findOne({ where: { email: normalizedEmail } })) ||
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
    } else {
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

  private async buildOrderItems(dto: CreatePublicOrderDto) {
    return Promise.all(
      dto.items.map(async (item) => {
        const toy = await this.toyRepository.findOne({ where: { id: item.toyId } });
        if (!toy) {
          throw new NotFoundException(`Jouet ${item.toyId} introuvable`);
        }

        return {
          toyId: toy.id,
          quantity: item.quantity,
          rentalPrice: item.unitPrice,
          rentalDurationDays: item.rentalDurationDays,
          rentalStartDate: item.rentalStartDate,
        };
      }),
    );
  }

  async create(dto: CreatePublicOrderDto) {
    const customer = await this.resolveCustomer(
      dto.customerName ?? 'Client',
      dto.customerPhone ?? '0000000000',
      dto.customerEmail,
      dto.deliveryAddress,
      dto.deliveryCity,
    );

    const items = await this.buildOrderItems(dto);
    const totalAmount =
      dto.totalAmount ??
      items.reduce((sum, item) => sum + item.rentalPrice * item.quantity, 0);

    const createOrderPayload: CreateOrderDto = {
      customerId: customer.id,
      items,
      totalAmount,
      depositAmount: dto.depositAmount ?? 0,
      deliveryAddress: dto.deliveryAddress,
      deliveryCity: dto.deliveryCity,
      deliveryDate: dto.deliveryDate ?? new Date().toISOString(),
      deliveryTimeSlot: dto.deliveryTimeSlot,
      notes: dto.notes,
    };

    return this.orderService.create(createOrderPayload);
  }
}
