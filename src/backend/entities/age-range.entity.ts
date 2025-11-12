import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('age_ranges')
export class AgeRange {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  label!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ nullable: true })
  iconType!: 'emoji' | 'upload' | 'icon';

  @Column({ nullable: true })
  icon!: string; // Emoji, URL de l'image uploadÃ©e, ou nom de l'icÃ´ne

  @Column({ nullable: true })
  iconUrl!: string; // URL de l'image si iconType === 'upload'

  @Column({ default: 0 })
  ageMin!: number; // Ã‚ge minimum en mois

  @Column({ nullable: true })
  ageMax!: number; // Ã‚ge maximum en mois (null si 8+)

  @Column({ default: 0 })
  displayOrder!: number;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
