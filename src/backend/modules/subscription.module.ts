import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionController } from '../controllers/subscription.controller';
import { SubscriptionService } from '../services/subscription.service';
import { Subscription } from '../entities/subscription.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Customer } from '../entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, SubscriptionPlan, Customer]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}


