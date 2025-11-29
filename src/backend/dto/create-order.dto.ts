import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsUUID, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderItemDto {
  @IsUUID()
  toyId!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  rentalPrice!: number;

  @IsNumber()
  rentalDurationDays!: number;

  @IsOptional()
  @IsDateString()
  rentalStartDate?: string;
}

export class CreateOrderDto {
  @IsUUID()
  customerId!: string;

  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsNumber()
  totalAmount!: number;

  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @IsString()
  deliveryAddress!: string;

  @IsString()
  deliveryCity!: string;

  @IsDateString()
  deliveryDate!: string;

  @IsOptional()
  @IsString()
  deliveryTimeSlot?: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsOptional()
  @IsString()
  returnTimeSlot?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsOptional()
  @IsString()
  deliveryTimeSlot?: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsOptional()
  @IsString()
  returnTimeSlot?: string;

  @IsOptional()
  @IsUUID()
  assignedDriverId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}

export class QueryOrdersDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsDateString()
  deliveryDateFrom?: string;

  @IsOptional()
  @IsDateString()
  deliveryDateTo?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}


