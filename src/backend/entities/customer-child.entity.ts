import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Customer } from './customer.entity';
import { GenderTarget } from './toy.entity';

@Entity('customer_children')
export class CustomerChild {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Customer, customer => customer.children, { onDelete: 'CASCADE' })
  customer!: Customer;

  @Column()
  firstName!: string;

  @Column({ type: 'date', nullable: true })
  birthDate!: Date;

  @Column({
    type: 'enum',
    enum: GenderTarget,
    nullable: true,
  })
  gender!: GenderTarget;

  @Column('text', { nullable: true })
  allergies!: string;

  @Column('text', { nullable: true })
  preferences!: string;

  @CreateDateColumn()
  createdAt!: Date;
}


