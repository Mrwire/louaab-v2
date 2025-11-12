import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column()
  toyCount!: number;

  @Column()
  durationMonths!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  priceMonthly!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  depositAmount!: number;

  @Column({ default: false })
  swapIncluded!: boolean;

  @Column({ nullable: true })
  swapFrequencyDays!: number;

  @Column('varchar', { array: true, nullable: true })
  citiesAvailable!: string[];

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  displayOrder!: number;

  @OneToMany(() => Subscription, subscription => subscription.plan)
  subscriptions!: Subscription[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}


