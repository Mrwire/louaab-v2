import { IsString, IsOptional, IsBoolean, IsEmail, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ContactStatus } from '../entities/contact-message.entity';

export class CreateContactMessageDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsBoolean()
  optIn?: boolean;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  subject?: string;
}

export class UpdateContactMessageDto extends PartialType(CreateContactMessageDto) {
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class QueryContactMessagesDto {
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;
}
