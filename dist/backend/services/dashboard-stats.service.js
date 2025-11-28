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
exports.DashboardStatsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../entities/order.entity");
const order_item_entity_1 = require("../entities/order-item.entity");
let DashboardStatsService = class DashboardStatsService {
    constructor(orderRepository, orderItemRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }
    async getOrderStats(params) {
        const limit = params.limit && params.limit > 0 ? params.limit : 5;
        const now = params.to ? new Date(params.to) : new Date();
        const to = new Date(now);
        to.setHours(23, 59, 59, 999);
        const rangeDays = params.rangeDays && params.rangeDays > 0 ? params.rangeDays : 60;
        const fromCandidate = params.from ? new Date(params.from) : new Date(to.getTime() - rangeDays * 24 * 60 * 60 * 1000);
        const from = new Date(fromCandidate);
        from.setHours(0, 0, 0, 0);
        const totalsRaw = await this.orderRepository
            .createQueryBuilder('order')
            .select('COUNT(order.id)', 'orders')
            .addSelect('COALESCE(SUM(order.totalAmount), 0)', 'revenue')
            .addSelect('COALESCE(SUM(order.depositAmount), 0)', 'deposit')
            .where('order.createdAt BETWEEN :from AND :to', { from, to })
            .getRawOne();
        const statusRows = await this.orderRepository
            .createQueryBuilder('order')
            .select('order.status', 'status')
            .addSelect('COUNT(order.id)', 'count')
            .where('order.createdAt BETWEEN :from AND :to', { from, to })
            .groupBy('order.status')
            .getRawMany();
        const statusBreakdown = statusRows.reduce((acc, row) => {
            acc[row.status] = Number(row.count) || 0;
            return acc;
        }, {});
        const topToysRaw = await this.orderItemRepository
            .createQueryBuilder('item')
            .innerJoin('item.order', 'order')
            .leftJoin('item.toy', 'toy')
            .select('toy.id', 'toyId')
            .addSelect("COALESCE(toy.name, 'Jouet')", 'toyName')
            .addSelect('COALESCE(SUM(item.quantity), 0)', 'rentals')
            .addSelect('COALESCE(SUM(item.rentalPrice * item.quantity), 0)', 'revenue')
            .where('order.createdAt BETWEEN :from AND :to', { from, to })
            .groupBy('toy.id')
            .addGroupBy('toy.name')
            .orderBy('rentals', 'DESC')
            .limit(limit)
            .getRawMany();
        const topCustomersRaw = await this.orderRepository
            .createQueryBuilder('order')
            .leftJoin('order.customer', 'customer')
            .select('customer.id', 'customerId')
            .addSelect("TRIM(CONCAT(COALESCE(customer.firstName, ''), ' ', COALESCE(customer.lastName, '')))", 'customerName')
            .addSelect('COUNT(order.id)', 'orders')
            .addSelect('COALESCE(SUM(order.totalAmount), 0)', 'revenue')
            .where('order.createdAt BETWEEN :from AND :to', { from, to })
            .groupBy('customer.id')
            .addGroupBy('customer.firstName')
            .addGroupBy('customer.lastName')
            .orderBy('orders', 'DESC')
            .limit(limit)
            .getRawMany();
        const loyalCustomers = topCustomersRaw.filter((row) => Number(row.orders || 0) >= 3);
        const revenueByMonth = await this.orderRepository
            .createQueryBuilder('order')
            .select("TO_CHAR(order.createdAt, 'YYYY-MM')", 'period')
            .addSelect('COUNT(order.id)', 'orders')
            .addSelect('COALESCE(SUM(order.totalAmount), 0)', 'revenue')
            .where('order.createdAt BETWEEN :from AND :to', { from, to })
            .groupBy("TO_CHAR(order.createdAt, 'YYYY-MM')")
            .orderBy("TO_CHAR(order.createdAt, 'YYYY-MM')", 'ASC')
            .getRawMany();
        return {
            period: {
                from: from.toISOString(),
                to: to.toISOString(),
                rangeDays,
            },
            totals: {
                orders: Number((totalsRaw === null || totalsRaw === void 0 ? void 0 : totalsRaw.orders) || 0),
                revenue: Number((totalsRaw === null || totalsRaw === void 0 ? void 0 : totalsRaw.revenue) || 0),
                deposit: Number((totalsRaw === null || totalsRaw === void 0 ? void 0 : totalsRaw.deposit) || 0),
            },
            statusBreakdown,
            topToys: topToysRaw.map((row) => ({
                toyId: row.toyId || null,
                toyName: row.toyName || 'Jouet',
                rentals: Number(row.rentals || 0),
                revenue: Number(row.revenue || 0),
            })),
            topCustomers: topCustomersRaw.map((row) => {
                var _a;
                return ({
                    customerId: row.customerId || null,
                    customerName: ((_a = row.customerName) === null || _a === void 0 ? void 0 : _a.trim()) || 'Client',
                    orders: Number(row.orders || 0),
                    revenue: Number(row.revenue || 0),
                });
            }),
            loyalCustomers: (loyalCustomers.length > 0 ? loyalCustomers : topCustomersRaw).map((row) => {
                var _a;
                return ({
                    customerId: row.customerId || null,
                    customerName: ((_a = row.customerName) === null || _a === void 0 ? void 0 : _a.trim()) || 'Client',
                    orders: Number(row.orders || 0),
                    revenue: Number(row.revenue || 0),
                });
            }),
            revenueByMonth: revenueByMonth.map((row) => ({
                period: row.period,
                orders: Number(row.orders || 0),
                revenue: Number(row.revenue || 0),
            })),
        };
    }
};
exports.DashboardStatsService = DashboardStatsService;
exports.DashboardStatsService = DashboardStatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardStatsService);
