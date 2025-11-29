import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from '../controllers/order.controller';
import { OrderService } from '../services/order.service';
import { PublicOrdersService } from '../services/public-orders.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Toy } from '../entities/toy.entity';
import { Customer } from '../entities/customer.entity';
import { Delivery } from '../entities/delivery.entity';
import { PublicOrdersController } from '../controllers/public-orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Toy, Customer, Delivery]),
  ],
  controllers: [OrderController, PublicOrdersController],
  providers: [OrderService, PublicOrdersService],
  exports: [OrderService, PublicOrdersService],
})
export class OrderModule {}


