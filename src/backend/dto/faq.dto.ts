import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateFAQDto {
  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsString()
  question!: string;

  @IsString()
  answer!: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFAQDto extends PartialType(CreateFAQDto) {}

export class QueryFAQsDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
