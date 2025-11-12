import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Toy } from './toy.entity';

export enum PricingType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum PricingRuleType {
  BASE_PRICE = 'base_price',
  DISCOUNT = 'discount',
  SURCHARGE = 'surcharge',
  SEASONAL = 'seasonal',
  BULK = 'bulk',
}

@Entity('pricing_rules')
export class PricingRule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: PricingRuleType,
    default: PricingRuleType.BASE_PRICE,
  })
  ruleType!: PricingRuleType;

  @Column({
    type: 'enum',
    enum: PricingType,
  })
  pricingType!: PricingType;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  discountPercentage!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discountAmount!: number;

  @Column({ nullable: true })
  minQuantity!: number;

  @Column({ nullable: true })
  maxQuantity!: number;

  @Column({ type: 'date', nullable: true })
  validFrom!: Date;

  @Column({ type: 'date', nullable: true })
  validUntil!: Date;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  priority!: number;

  @Column({ default: false })
  isDefault!: boolean;

  @ManyToOne(() => Toy, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toy_id' })
  toy!: Toy;

  @Column({ nullable: true })
  toyId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
