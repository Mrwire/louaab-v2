import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Customer } from './customer.entity';
import { Subscription } from './subscription.entity';
import { AdminUser } from './admin-user.entity';
import { OrderItem } from './order-item.entity';
import { Delivery } from './delivery.entity';

export enum OrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  RETURNING = 'returning',
  RETURNED = 'returned',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  orderNumber!: string;

  @ManyToOne(() => Customer, customer => customer.orders, { onDelete: 'SET NULL', nullable: true })
  customer!: Customer;

  @ManyToOne(() => Subscription, subscription => subscription.orders, { nullable: true })
  subscription!: Subscription;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.DRAFT,
  })
  status!: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  depositAmount!: number;

  @Column('text', { nullable: true })
  deliveryAddress!: string;

  @Column({ nullable: true })
  deliveryCity!: string;

  @Column({ type: 'date', nullable: true })
  deliveryDate!: Date;

  @Column({ nullable: true })
  deliveryTimeSlot!: string;

  @Column({ type: 'date', nullable: true })
  returnDate!: Date;

  @Column({ nullable: true })
  returnTimeSlot!: string;

  @ManyToOne(() => AdminUser, { nullable: true })
  assignedDriver!: AdminUser;

  @Column('text', { nullable: true })
  notes!: string;

  @Column('text', { nullable: true })
  internalNotes!: string;

  @OneToMany(() => OrderItem, item => item.order)
  items!: OrderItem[];

  @OneToMany(() => Delivery, delivery => delivery.order)
  deliveries!: Delivery[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}


