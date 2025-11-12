import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { AdminUser } from './admin-user.entity';

export enum DeliveryStatus {
  SCHEDULED = 'scheduled',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, order => order.deliveries, { onDelete: 'CASCADE' })
  order!: Order;

  @Column()
  deliveryType!: string; // 'delivery' or 'return'

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.SCHEDULED,
  })
  status!: DeliveryStatus;

  @Column({ type: 'date' })
  scheduledDate!: Date;

  @Column({ nullable: true })
  scheduledTimeSlot!: string;

  @Column({ type: 'timestamp', nullable: true })
  actualDate!: Date;

  @ManyToOne(() => AdminUser, { nullable: true })
  driver!: AdminUser;

  @Column({ nullable: true })
  trackingNumber!: string;

  @Column({ nullable: true })
  routeOrder!: number;

  @Column({ nullable: true })
  recipientName!: string;

  @Column({ nullable: true })
  recipientPhone!: string;

  @Column('text', { nullable: true })
  signature!: string;

  @Column('jsonb', { nullable: true })
  photos!: string[];

  @Column('text', { nullable: true })
  notes!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}


