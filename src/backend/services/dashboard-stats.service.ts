import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';

interface OrderStatsParams {
  from?: string;
  to?: string;
  limit?: number;
  rangeDays?: number;
}

@Injectable()
export class DashboardStatsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async getOrderStats(params: OrderStatsParams) {
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

    const statusBreakdown = statusRows.reduce<Record<string, number>>((acc, row) => {
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
      .addSelect(
        "TRIM(CONCAT(COALESCE(customer.firstName, ''), ' ', COALESCE(customer.lastName, '')))",
        'customerName',
      )
      .addSelect('COUNT(order.id)', 'orders')
      .addSelect('COALESCE(SUM(order.totalAmount), 0)', 'revenue')
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('customer.id')
      .addGroupBy('customer.firstName')
      .addGroupBy('customer.lastName')
      .orderBy('orders', 'DESC')
      .limit(limit)
      .getRawMany();

    const loyalCustomers = topCustomersRaw.filter(
      (row) => Number(row.orders || 0) >= 3,
    );

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
        orders: Number(totalsRaw?.orders || 0),
        revenue: Number(totalsRaw?.revenue || 0),
        deposit: Number(totalsRaw?.deposit || 0),
      },
      statusBreakdown,
      topToys: topToysRaw.map((row) => ({
        toyId: row.toyId || null,
        toyName: row.toyName || 'Jouet',
        rentals: Number(row.rentals || 0),
        revenue: Number(row.revenue || 0),
      })),
      topCustomers: topCustomersRaw.map((row) => ({
        customerId: row.customerId || null,
        customerName: row.customerName?.trim() || 'Client',
        orders: Number(row.orders || 0),
        revenue: Number(row.revenue || 0),
      })),
      loyalCustomers: (loyalCustomers.length > 0 ? loyalCustomers : topCustomersRaw).map(
        (row) => ({
          customerId: row.customerId || null,
          customerName: row.customerName?.trim() || 'Client',
          orders: Number(row.orders || 0),
          revenue: Number(row.revenue || 0),
        }),
      ),
      revenueByMonth: revenueByMonth.map((row) => ({
        period: row.period,
        orders: Number(row.orders || 0),
        revenue: Number(row.revenue || 0),
      })),
    };
  }
}
