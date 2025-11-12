import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Toy } from './toy.entity';

export enum PackType {
  MINI = 'mini',
  MAXI = 'maxi',
  MEGA = 'mega',
  CUSTOM = 'custom',
}

@Entity('packs')
export class Pack {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  slug!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: PackType,
    default: PackType.CUSTOM,
  })
  type!: PackType;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column({ default: 1 })
  toyCount!: number; // Nombre de jouets dans le pack

  @Column({ default: 30 })
  durationDays!: number; // Durée de location en jours

  @Column('text', { nullable: true })
  features!: string; // JSON array des fonctionnalités

  @Column({ nullable: true })
  icon!: string; // Emoji ou nom d'icône

  @Column({ default: 0 })
  displayOrder!: number;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToMany(() => Toy, { nullable: true })
  @JoinTable({
    name: 'pack_toys',
    joinColumn: { name: 'pack_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'toy_id', referencedColumnName: 'id' },
  })
  toys!: Toy[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

