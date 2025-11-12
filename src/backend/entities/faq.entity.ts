import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('faqs')
export class FAQ {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  category!: string; // Ex: "À propos de LOUAAB", "Fonctionnement", etc.

  @Column({ nullable: true })
  icon!: string; // Emoji ou icône

  @Column()
  question!: string;

  @Column('text')
  answer!: string;

  @Column({ default: 0 })
  displayOrder!: number;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

