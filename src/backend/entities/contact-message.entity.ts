import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ContactStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column('text')
  message!: string;

  @Column({
    type: 'enum',
    enum: ContactStatus,
    default: ContactStatus.NEW,
  })
  status!: ContactStatus;

  @Column({ default: false })
  optIn!: boolean; // Consentement pour recevoir les offres

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  subject!: string;

  @Column('text', { nullable: true })
  adminNotes!: string; // Notes internes

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

