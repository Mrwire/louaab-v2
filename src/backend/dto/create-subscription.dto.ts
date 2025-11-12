import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, IsDateString, IsBoolean } from 'class-validator';
import { SubscriptionStatus } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsUUID()
  customerId!: string;

  @IsUUID()
  planId!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsNumber()
  depositPaid?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  nextBillingDate?: string;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsNumber()
  depositRefunded?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class QuerySubscriptionsDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}


