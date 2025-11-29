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

  icon!: string; // Emoji, URL de l'image uploadée, ou nom de l'icône



  @Column({ nullable: true })

  iconUrl!: string; // URL de l'image si iconType === 'upload'



  @Column({ default: 0, type: 'int' })

  ageMin!: number; // Âge minimum en mois



  @Column({ nullable: true, type: 'int' })

  ageMax!: number | null; // Âge maximum en mois (null si 8+)



  @Column({ default: 0 })

  displayOrder!: number;



  @Column({ default: true })

  isActive!: boolean;



  @CreateDateColumn()

  createdAt!: Date;



  @UpdateDateColumn()

  updatedAt!: Date;

}

