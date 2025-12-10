import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, Min, Max, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { ToyStatus, ToyCondition, GenderTarget } from '../entities/toy.entity';

export class CreateToyDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  fullDescription?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rentalPriceDaily?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rentalPriceWeekly?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rentalPriceMonthly?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  depositAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(18)
  ageMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(18)
  ageMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playerCountMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playerCountMax?: number;

  @IsOptional()
  @IsEnum(GenderTarget)
  genderTarget?: GenderTarget;

  @IsOptional()
  @IsEnum(ToyStatus)
  status?: ToyStatus;

  @IsOptional()
  @IsEnum(ToyCondition)
  condition?: ToyCondition;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stockQuantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  availableQuantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  internalRating?: number;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRentalQuantity?: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  images?: Array<{ url: string; altText?: string; isPrimary?: boolean }>;
}

// Make all fields optional for PATCH operations
export class UpdateToyDto extends PartialType(CreateToyDto) { }

export class QueryToysDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ToyStatus)
  status?: ToyStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  ageMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  ageMax?: number;

  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @IsOptional()
  @IsEnum(GenderTarget)
  genderTarget?: GenderTarget;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit?: number = 500;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}


