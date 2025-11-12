import { IsEnum, IsNumber, IsString, IsOptional, IsDateString, IsBoolean, Min, Max } from 'class-validator';
import { PricingType, PricingRuleType } from '../entities/pricing-rule.entity';

export class CreatePricingRuleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PricingRuleType)
  ruleType!: PricingRuleType;

  @IsEnum(PricingType)
  pricingType!: PricingType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxQuantity?: number;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  toyId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdatePricingRuleDto extends CreatePricingRuleDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateToyPricesDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  daily?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weekly?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthly?: number;

  @IsString()
  reason!: string;
}

export class CalculatePriceDto {
  @IsEnum(PricingType)
  pricingType!: PricingType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  customerType?: 'regular' | 'premium' | 'vip';
}
