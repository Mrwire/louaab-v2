import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, Min, Max, IsArray, IsUUID } from 'class-validator';
import { ToyStatus, ToyCondition, GenderTarget } from '../entities/toy.entity';

export class CreateToyDto {
  @IsOptional()
  @IsString()
  sku?: string;

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
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  @IsNumber()
  rentalPriceDaily?: number;

  @IsOptional()
  @IsNumber()
  rentalPriceWeekly?: number;

  @IsOptional()
  @IsNumber()
  rentalPriceMonthly?: number;

  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(18)
  ageMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(18)
  ageMax?: number;

  @IsOptional()
  @IsNumber()
  playerCountMin?: number;

  @IsOptional()
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
  @IsNumber()
  stockQuantity?: number;

  @IsOptional()
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

export class UpdateToyDto extends CreateToyDto {}

export class QueryToysDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ToyStatus)
  status?: ToyStatus;

  @IsOptional()
  @IsNumber()
  ageMin?: number;

  @IsOptional()
  @IsNumber()
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
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}


