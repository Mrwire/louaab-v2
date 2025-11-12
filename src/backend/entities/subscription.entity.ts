import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Customer } from './customer.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { Order } from './order.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Customer, customer => customer.subscriptions, { onDelete: 'CASCADE' })
  customer!: Customer;

  @ManyToOne(() => SubscriptionPlan, plan => plan.subscriptions)
  plan!: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date', nullable: true })
  endDate!: Date;

  @Column({ type: 'date', nullable: true })
  nextBillingDate!: Date;

  @Column({ default: true })
  autoRenew!: boolean;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  depositPaid!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  depositRefunded!: number;

  @Column('text', { nullable: true })
  notes!: string;

  @OneToMany(() => Order, order => order.subscription)
  orders!: Order[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}


