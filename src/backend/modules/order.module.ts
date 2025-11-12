import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from '../controllers/order.controller';
import { OrderService } from '../services/order.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Toy } from '../entities/toy.entity';
import { Customer } from '../entities/customer.entity';
import { Delivery } from '../entities/delivery.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Toy, Customer, Delivery]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}


