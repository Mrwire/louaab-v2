import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmojiController } from '../controllers/emoji.controller';
import { AdminOrdersController } from '../controllers/admin-orders.controller';
import { OrderModule } from './order.module';
import { DashboardStatsService } from '../services/dashboard-stats.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';

@Module({
  imports: [
    OrderModule,
    TypeOrmModule.forFeature([Order, OrderItem]),
  ],
  controllers: [EmojiController, AdminOrdersController],
  providers: [DashboardStatsService],
})
export class AdminUiModule {}
