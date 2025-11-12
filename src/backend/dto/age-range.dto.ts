import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, Min } from 'class-validator';

export class CreateAgeRangeDto {
  @IsString()
  label!: string;

  @IsString()
  slug!: string;

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
  @IsNumber()
  @Min(0)
  ageMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ageMax?: number;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAgeRangeDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  slug?: string;

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
  @IsNumber()
  @Min(0)
  ageMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ageMax?: number;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

