import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { ToyCategory } from './toy-category.entity';
import { ToyImage } from './toy-image.entity';
import { CleaningLog } from './cleaning-log.entity';

export enum ToyStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  RENTED = 'rented',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
}

export enum ToyCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  ACCEPTABLE = 'acceptable',
  DAMAGED = 'damaged',
}

export enum GenderTarget {
  MALE = 'male',
  FEMALE = 'female',
  UNISEX = 'unisex',
}

@Entity('toys')
export class Toy {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, nullable: true })
  sku!: string;

  @Column({ unique: true, nullable: true })
  slug!: string;

  @Column()
  name!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column('text', { nullable: true })
  fullDescription!: string;

  @Column({ nullable: true })
  videoUrl!: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  purchasePrice!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  rentalPriceDaily!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  rentalPriceWeekly!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  rentalPriceMonthly!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  depositAmount!: number;

  @Column({ nullable: true })
  ageMin!: number;

  @Column({ nullable: true })
  ageMax!: number;

  @Column({ default: 1 })
  playerCountMin!: number;

  @Column({ nullable: true })
  playerCountMax!: number;

  @Column({
    type: 'enum',
    enum: GenderTarget,
    default: GenderTarget.UNISEX,
  })
  genderTarget!: GenderTarget;

  @Column({
    type: 'enum',
    enum: ToyStatus,
    default: ToyStatus.AVAILABLE,
  })
  status!: ToyStatus;

  @Column({
    type: 'enum',
    enum: ToyCondition,
    default: ToyCondition.EXCELLENT,
  })
  condition!: ToyCondition;

  @Column({ default: 0 })
  stockQuantity!: number;

  @Column({ default: 0 })
  availableQuantity!: number;

  @Column({ nullable: true })
  internalRating!: number;

  @Column({ nullable: true })
  vendor!: string;

  @Column({ type: 'date', nullable: true })
  purchaseDate!: Date;

  @Column({ nullable: true })
  location!: string;

  @Column({ default: 1 })
  minRentalQuantity!: number;

  @Column({ default: 0 })
  timesRented!: number;

  @Column({ type: 'timestamp', nullable: true })
  lastCleaned!: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextMaintenance!: Date;

  @Column({ default: false })
  isFeatured!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToMany(() => ToyCategory, category => category.toys)
  @JoinTable({
    name: 'toy_category_relations',
    joinColumn: { name: 'toy_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories!: ToyCategory[];

  @OneToMany(() => ToyImage, image => image.toy)
  images!: ToyImage[];

  @OneToMany(() => CleaningLog, log => log.toy)
  cleaningLogs!: CleaningLog[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}


