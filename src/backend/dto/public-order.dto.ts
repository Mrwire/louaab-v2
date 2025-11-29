import { IsArray, IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PublicOrderItemDto {
  @IsString()
  @IsNotEmpty()
  toyId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsNumber()
  @Min(1)
  rentalDurationDays!: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  durationLabel?: string;

  @IsOptional()
  @IsDateString()
  rentalStartDate?: string;
}

export class CreatePublicOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  customerPhone!: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress!: string;

  @IsString()
  @IsNotEmpty()
  deliveryCity!: string;

  @IsOptional()
  @IsString()
  deliveryPostalCode?: string;

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
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicOrderItemDto)
  items!: PublicOrderItemDto[];

  @IsNumber()
  totalAmount!: number;

  @IsOptional()
  @IsNumber()
  depositAmount?: number;
}
