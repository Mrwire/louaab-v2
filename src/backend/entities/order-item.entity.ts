import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Toy, ToyCondition } from './toy.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  order!: Order;

  @ManyToOne(() => Toy, { nullable: true })
  toy!: Toy;

  @Column({ default: 1 })
  quantity!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  rentalPrice!: number;

  @Column({ nullable: true })
  rentalDurationDays!: number;

  @Column({
    type: 'enum',
    enum: ToyCondition,
    nullable: true,
  })
  conditionBefore!: ToyCondition;

  @Column({
    type: 'enum',
    enum: ToyCondition,
    nullable: true,
  })
  conditionAfter!: ToyCondition;

  @Column('text', { nullable: true })
  damageReported!: string;

  @CreateDateColumn()
  createdAt!: Date;
}


