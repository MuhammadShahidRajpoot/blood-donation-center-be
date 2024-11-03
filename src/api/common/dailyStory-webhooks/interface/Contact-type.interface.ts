import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AddressDto, ContactDto } from 'src/api/crm/contacts/common/dto';
import { customFiledsDto } from '../../dto/customfield/custom-field.dto';

export class GetAllContactsInterface {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  page?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  start?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  sortBy?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ type: 'boolean' })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  fetchAll?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  timestamp?: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  min_updated_at?: Date;
}

export class CreateContactDto {
  @IsOptional()
  @IsInt({ message: 'Prefix Id must be a number' })
  @ApiProperty()
  prefix: number;

  @IsOptional()
  @IsInt({ message: 'Suffix Id must be a number' })
  @ApiProperty()
  suffix: number;

  // @IsNotEmpty({ message: 'Nick Name is required' })
  @IsString({ message: 'Nick Name must be a string' })
  @ApiProperty()
  nick_name: string;

  @IsNotEmpty({ message: 'First Name is required' })
  @IsString({ message: 'Fist Name must be a string' })
  @ApiProperty()
  first_name: string;

  @IsNotEmpty({ message: 'Last Name is required' })
  @IsString({ message: 'Last Name must be a string' })
  @ApiProperty()
  last_name: string;

  @IsNotEmpty({ message: 'Date of Birth is required' })
  @IsString({ message: 'Date of Birth must be a Date' })
  @ApiProperty()
  birth_date: Date;

  @IsNotEmpty({ message: 'Collection Operation is required' })
  @IsInt({ message: 'Collection Operation must be a Number' })
  @ApiProperty()
  collection_operation_id: bigint;

  @IsNotEmpty({ message: 'classification is required' })
  @IsInt({ message: 'classification must be a Number' })
  @ApiProperty()
  classification_id: bigint;

  @IsOptional()
  @IsBoolean({ message: 'Is Active must be a Boolean' })
  @ApiProperty({ default: true })
  is_active: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Is Archive must be a Boolean' })
  @ApiProperty({ default: false })
  is_archived: boolean;

  @IsOptional()
  @IsInt()
  @ApiProperty()
  created_by: bigint;

  @IsOptional()
  @IsInt()
  @ApiProperty()
  tenant_id: bigint;

  @ApiProperty({ type: () => AddressDto })
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({ type: () => [ContactDto] })
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contact: ContactDto[];

  @IsOptional()
  @ApiProperty({ type: () => Boolean })
  custom_fields: customFiledsDto;
}

export class UpdateContactDto extends PartialType(CreateContactDto) {}

export class SimpleDTO {}
