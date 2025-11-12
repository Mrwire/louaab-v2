import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Customer } from '../entities/customer.entity';
import { CreateSubscriptionDto, UpdateSubscriptionDto, QuerySubscriptionsDto } from '../dto/create-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const { customerId, planId, ...subscriptionData } = createSubscriptionDto;

    // Verify customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('Client non trouvé');
    }

    // Verify plan exists
    const plan = await this.planRepository.findOne({
      where: { id: planId, isActive: true },
    });
    if (!plan) {
      throw new NotFoundException('Plan non trouvé ou inactif');
    }

    // Check if customer already has an active subscription
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        customer: { id: customerId },
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingSubscription) {
      throw new BadRequestException(
        'Le client a déjà un abonnement actif',
      );
    }

    // Calculate next billing date
    const startDate = new Date(createSubscriptionDto.startDate);
    const nextBillingDate = new Date(startDate);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + plan.durationMonths);

    // Create subscription
    const subscription = this.subscriptionRepository.create({
      ...subscriptionData,
      customer,
      plan,
      status: SubscriptionStatus.ACTIVE,
      nextBillingDate,
      depositPaid: createSubscriptionDto.depositPaid || plan.depositAmount,
      autoRenew: createSubscriptionDto.autoRenew ?? true,
    });

    const savedSubscription = await this.subscriptionRepository.save(subscription);
    return this.findOne(savedSubscription.id);
  }

  async findAll(query: QuerySubscriptionsDto) {
    const { customerId, status, page = 1, limit = 20 } = query;

    const queryBuilder = this.subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.customer', 'customer')
      .leftJoinAndSelect('subscription.plan', 'plan')
      .leftJoinAndSelect('subscription.orders', 'orders');

    if (customerId) {
      queryBuilder.andWhere('customer.id = :customerId', { customerId });
    }

    if (status) {
      queryBuilder.andWhere('subscription.status = :status', { status });
    }

    queryBuilder.orderBy('subscription.createdAt', 'DESC');

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

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['customer', 'customer.children', 'plan', 'orders', 'orders.items'],
    });

    if (!subscription) {
      throw new NotFoundException(`Abonnement ${id} non trouvé`);
    }

    return subscription;
  }

  async findByCustomer(customerId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { customer: { id: customerId } },
      relations: ['plan', 'orders'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.findOne(id);

    Object.assign(subscription, updateSubscriptionDto);

    await this.subscriptionRepository.save(subscription);
    return this.findOne(id);
  }

  async pause(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException(
        'Seuls les abonnements actifs peuvent être mis en pause',
      );
    }

    subscription.status = SubscriptionStatus.PAUSED;
    await this.subscriptionRepository.save(subscription);

    return this.findOne(id);
  }

  async resume(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);

    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new BadRequestException(
        'Seuls les abonnements en pause peuvent être réactivés',
      );
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    await this.subscriptionRepository.save(subscription);

    return this.findOne(id);
  }

  async cancel(id: string, reason?: string): Promise<Subscription> {
    const subscription = await this.findOne(id);

    if (![SubscriptionStatus.ACTIVE, SubscriptionStatus.PAUSED].includes(subscription.status)) {
      throw new BadRequestException(
        'Cet abonnement ne peut pas être annulé',
      );
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.endDate = new Date();
    subscription.autoRenew = false;

    if (reason) {
      subscription.notes = `${subscription.notes || ''}\nAnnulation: ${reason}`;
    }

    await this.subscriptionRepository.save(subscription);
    return this.findOne(id);
  }

  async renew(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException(
        'Seuls les abonnements actifs peuvent être renouvelés',
      );
    }

    // Update next billing date
    const nextBillingDate = new Date(subscription.nextBillingDate);
    nextBillingDate.setMonth(
      nextBillingDate.getMonth() + subscription.plan.durationMonths,
    );

    subscription.nextBillingDate = nextBillingDate;
    await this.subscriptionRepository.save(subscription);

    return this.findOne(id);
  }

  async getStats() {
    const total = await this.subscriptionRepository.count();

    const active = await this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });

    const paused = await this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.PAUSED },
    });

    const cancelled = await this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.CANCELLED },
    });

    // Calculate monthly recurring revenue (MRR)
    const activeSubscriptions = await this.subscriptionRepository.find({
      where: { status: SubscriptionStatus.ACTIVE },
      relations: ['plan'],
    });

    const mrr = activeSubscriptions.reduce(
      (sum, sub) => sum + Number(sub.plan.priceMonthly),
      0,
    );

    return {
      total,
      active,
      paused,
      cancelled,
      mrr,
      renewalRate: total > 0 ? ((active / total) * 100).toFixed(2) : 0,
    };
  }

  async getUpcomingRenewals(days: number = 7) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        autoRenew: true,
      },
      relations: ['customer', 'plan'],
      order: { nextBillingDate: 'ASC' },
    });
  }
}


