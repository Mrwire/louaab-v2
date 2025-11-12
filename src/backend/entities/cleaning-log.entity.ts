import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Toy } from './toy.entity';
import { AdminUser } from './admin-user.entity';

@Entity('cleaning_logs')
export class CleaningLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Toy, toy => toy.cleaningLogs, { onDelete: 'CASCADE' })
  toy!: Toy;

  @ManyToOne(() => AdminUser, { nullable: true })
  cleanedBy!: AdminUser;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  cleaningDate!: Date;

  @Column('text', { nullable: true })
  productsUsed!: string;

  @Column('text', { nullable: true })
  conditionNotes!: string;

  @Column('jsonb', { nullable: true })
  photos!: string[];

  @CreateDateColumn()
  createdAt!: Date;
}


