import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { DashboardStatsService } from '../services/dashboard-stats.service';
import { QueryOrdersDto, UpdateOrderDto } from '../dto/create-order.dto';
import { OrderStatus } from '../entities/order.entity';

@Controller('admin/ui/orders')
export class AdminOrdersController {
  constructor(
    private readonly orderService: OrderService,
    private readonly dashboardStatsService: DashboardStatsService,
  ) {}

  @Get()
  async list(@Query() query: QueryOrdersDto) {
    return {
      success: true,
      data: await this.orderService.findAll(query),
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    const updated = await this.orderService.updateStatus(id, status);
    return {
      success: true,
      data: updated,
      message: 'Statut mis à jour',
    };
  }

  @Patch(':id/return')
  async confirmReturn(
    @Param('id') id: string,
    @Body() body: { condition?: string; note?: string; returnDate?: string },
  ) {
    const updatePayload: UpdateOrderDto = {
      status: OrderStatus.RETURNED,
      returnDate: body?.returnDate,
      internalNotes: body?.note
        ? `[Restitution - ${body.condition || 'etat'}] ${body.note}`
        : undefined,
    };

    await this.orderService.update(id, updatePayload);
    const updated = await this.orderService.updateStatus(id, OrderStatus.RETURNED);

    return {
      success: true,
      data: updated,
      message: 'Restitution confirmée',
    };
  }

  @Get('stats')
  async stats(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('rangeDays') rangeDays?: string,
  ) {
    const data = await this.dashboardStatsService.getOrderStats({
      from,
      to,
      limit: limit ? Number(limit) : undefined,
      rangeDays: rangeDays ? Number(rangeDays) : undefined,
    });

    return {
      success: true,
      data,
    };
  }
}
