import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CustomerChild } from './customer-child.entity';
import { Subscription } from './subscription.entity';
import { Order } from './order.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  passwordHash!: string;

  @Column({ nullable: true })
  firstName!: string;

  @Column({ nullable: true })
  lastName!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  whatsapp!: string;

  @Column('text', { nullable: true })
  address!: string;

  @Column({ nullable: true })
  city!: string;

  @Column({ nullable: true })
  postalCode!: string;

  @Column('text', { nullable: true })
  notes!: string;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => CustomerChild, child => child.customer)
  children!: CustomerChild[];

  @OneToMany(() => Subscription, subscription => subscription.customer)
  subscriptions!: Subscription[];

  @OneToMany(() => Order, order => order.customer)
  orders!: Order[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}


