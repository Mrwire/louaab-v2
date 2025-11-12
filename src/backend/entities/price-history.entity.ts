import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Toy } from './toy.entity';
import { PricingRule } from './pricing-rule.entity';
import { PricingType } from './pricing-rule.entity';

@Entity('price_history')
export class PriceHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Toy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toy_id' })
  toy!: Toy;

  @Column()
  toyId!: string;

  @ManyToOne(() => PricingRule, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pricing_rule_id' })
  pricingRule!: PricingRule;

  @Column({ nullable: true })
  pricingRuleId!: string;

  @Column({
    type: 'enum',
    enum: PricingType,
  })
  pricingType!: PricingType;

  @Column('decimal', { precision: 10, scale: 2 })
  oldPrice!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  newPrice!: number;

  @Column('text', { nullable: true })
  changeReason!: string;

  @Column({ nullable: true })
  changedBy!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  effectiveDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
