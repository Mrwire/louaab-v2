import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Toy } from './toy.entity';

@Entity('toy_categories')
export class ToyCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  nameAr!: string;

  @Column({ unique: true })
  slug!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column({ nullable: true, default: 'emoji' })
  iconType!: 'emoji' | 'upload' | 'icon';

  @Column({ nullable: true })
  icon!: string; // Emoji, URL de l'image uploadée, ou nom de l'icône

  @Column({ nullable: true })
  iconUrl!: string; // URL de l'image si iconType === 'upload'

  @ManyToOne(() => ToyCategory, category => category.children, { nullable: true })
  parent!: ToyCategory;

  @OneToMany(() => ToyCategory, category => category.parent)
  children!: ToyCategory[];

  @Column({ default: 0 })
  displayOrder!: number;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToMany(() => Toy, toy => toy.categories)
  toys!: Toy[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}


