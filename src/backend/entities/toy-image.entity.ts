import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Toy } from './toy.entity';

@Entity('toy_images')
export class ToyImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Toy, toy => toy.images, { onDelete: 'CASCADE' })
  toy!: Toy;

  @Column()
  url!: string;

  @Column({ nullable: true })
  altText!: string;

  @Column({ default: 0 })
  displayOrder!: number;

  @Column({ default: false })
  isPrimary!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}


