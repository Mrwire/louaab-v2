import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['emoji', 'upload', 'icon'])
  iconType?: 'emoji' | 'upload' | 'icon';

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['emoji', 'upload', 'icon'])
  iconType?: 'emoji' | 'upload' | 'icon';

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

