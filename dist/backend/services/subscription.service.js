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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("../entities/subscription.entity");
const subscription_plan_entity_1 = require("../entities/subscription-plan.entity");
const customer_entity_1 = require("../entities/customer.entity");
let SubscriptionService = class SubscriptionService {
    constructor(subscriptionRepository, planRepository, customerRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.planRepository = planRepository;
        this.customerRepository = customerRepository;
    }
    async create(createSubscriptionDto) {
        var _a;
        const { customerId, planId } = createSubscriptionDto, subscriptionData = __rest(createSubscriptionDto, ["customerId", "planId"]);
        // Verify customer exists
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Client non trouvé');
        }
        // Verify plan exists
        const plan = await this.planRepository.findOne({
            where: { id: planId, isActive: true },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plan non trouvé ou inactif');
        }
        // Check if customer already has an active subscription
        const existingSubscription = await this.subscriptionRepository.findOne({
            where: {
                customer: { id: customerId },
                status: subscription_entity_1.SubscriptionStatus.ACTIVE,
            },
        });
        if (existingSubscription) {
            throw new common_1.BadRequestException('Le client a déjà un abonnement actif');
        }
        // Calculate next billing date
        const startDate = new Date(createSubscriptionDto.startDate);
        const nextBillingDate = new Date(startDate);
        nextBillingDate.setMonth(nextBillingDate.getMonth() + plan.durationMonths);
        // Create subscription
        const subscription = this.subscriptionRepository.create(Object.assign(Object.assign({}, subscriptionData), { customer,
            plan, status: subscription_entity_1.SubscriptionStatus.ACTIVE, nextBillingDate, depositPaid: createSubscriptionDto.depositPaid || plan.depositAmount, autoRenew: (_a = createSubscriptionDto.autoRenew) !== null && _a !== void 0 ? _a : true }));
        const savedSubscription = await this.subscriptionRepository.save(subscription);
        return this.findOne(savedSubscription.id);
    }
    async findAll(query) {
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
    async findOne(id) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { id },
            relations: ['customer', 'customer.children', 'plan', 'orders', 'orders.items'],
        });
        if (!subscription) {
            throw new common_1.NotFoundException(`Abonnement ${id} non trouvé`);
        }
        return subscription;
    }
    async findByCustomer(customerId) {
        return this.subscriptionRepository.find({
            where: { customer: { id: customerId } },
            relations: ['plan', 'orders'],
            order: { createdAt: 'DESC' },
        });
    }
    async update(id, updateSubscriptionDto) {
        const subscription = await this.findOne(id);
        Object.assign(subscription, updateSubscriptionDto);
        await this.subscriptionRepository.save(subscription);
        return this.findOne(id);
    }
    async pause(id) {
        const subscription = await this.findOne(id);
        if (subscription.status !== subscription_entity_1.SubscriptionStatus.ACTIVE) {
            throw new common_1.BadRequestException('Seuls les abonnements actifs peuvent être mis en pause');
        }
        subscription.status = subscription_entity_1.SubscriptionStatus.PAUSED;
        await this.subscriptionRepository.save(subscription);
        return this.findOne(id);
    }
    async resume(id) {
        const subscription = await this.findOne(id);
        if (subscription.status !== subscription_entity_1.SubscriptionStatus.PAUSED) {
            throw new common_1.BadRequestException('Seuls les abonnements en pause peuvent être réactivés');
        }
        subscription.status = subscription_entity_1.SubscriptionStatus.ACTIVE;
        await this.subscriptionRepository.save(subscription);
        return this.findOne(id);
    }
    async cancel(id, reason) {
        const subscription = await this.findOne(id);
        if (![subscription_entity_1.SubscriptionStatus.ACTIVE, subscription_entity_1.SubscriptionStatus.PAUSED].includes(subscription.status)) {
            throw new common_1.BadRequestException('Cet abonnement ne peut pas être annulé');
        }
        subscription.status = subscription_entity_1.SubscriptionStatus.CANCELLED;
        subscription.endDate = new Date();
        subscription.autoRenew = false;
        if (reason) {
            subscription.notes = `${subscription.notes || ''}\nAnnulation: ${reason}`;
        }
        await this.subscriptionRepository.save(subscription);
        return this.findOne(id);
    }
    async renew(id) {
        const subscription = await this.findOne(id);
        if (subscription.status !== subscription_entity_1.SubscriptionStatus.ACTIVE) {
            throw new common_1.BadRequestException('Seuls les abonnements actifs peuvent être renouvelés');
        }
        // Update next billing date
        const nextBillingDate = new Date(subscription.nextBillingDate);
        nextBillingDate.setMonth(nextBillingDate.getMonth() + subscription.plan.durationMonths);
        subscription.nextBillingDate = nextBillingDate;
        await this.subscriptionRepository.save(subscription);
        return this.findOne(id);
    }
    async getStats() {
        const total = await this.subscriptionRepository.count();
        const active = await this.subscriptionRepository.count({
            where: { status: subscription_entity_1.SubscriptionStatus.ACTIVE },
        });
        const paused = await this.subscriptionRepository.count({
            where: { status: subscription_entity_1.SubscriptionStatus.PAUSED },
        });
        const cancelled = await this.subscriptionRepository.count({
            where: { status: subscription_entity_1.SubscriptionStatus.CANCELLED },
        });
        // Calculate monthly recurring revenue (MRR)
        const activeSubscriptions = await this.subscriptionRepository.find({
            where: { status: subscription_entity_1.SubscriptionStatus.ACTIVE },
            relations: ['plan'],
        });
        const mrr = activeSubscriptions.reduce((sum, sub) => sum + Number(sub.plan.priceMonthly), 0);
        return {
            total,
            active,
            paused,
            cancelled,
            mrr,
            renewalRate: total > 0 ? ((active / total) * 100).toFixed(2) : 0,
        };
    }
    async getUpcomingRenewals(days = 7) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        return this.subscriptionRepository.find({
            where: {
                status: subscription_entity_1.SubscriptionStatus.ACTIVE,
                autoRenew: true,
            },
            relations: ['customer', 'plan'],
            order: { nextBillingDate: 'ASC' },
        });
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(1, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionService);
