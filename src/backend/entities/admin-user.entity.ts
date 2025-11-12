import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  OPERATIONS = 'operations',
  SUPPORT = 'support',
  MARKETING = 'marketing',
  FINANCE = 'finance',
}

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ nullable: true })
  firstName!: string;

  @Column({ nullable: true })
  lastName!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.SUPPORT,
  })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}


