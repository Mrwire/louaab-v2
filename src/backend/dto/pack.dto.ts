import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, IsArray, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { PackType } from '../entities/pack.entity';

export class CreatePackDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PackType)
  type!: PackType;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(1)
  toyCount!: number;

  @IsNumber()
  @Min(1)
  durationDays!: number;

  @IsOptional()
  @IsString()
  features?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  toyIds?: string[];
}

export class UpdatePackDto extends PartialType(CreatePackDto) {}

export class QueryPacksDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(PackType)
  type?: PackType;
}
