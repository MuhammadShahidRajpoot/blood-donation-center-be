import {
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { AddressDto, ContactDto } from '../../common/dto';
import { Type } from 'class-transformer';
import { customFiledsDto } from 'src/api/common/dto/customfield/custom-field.dto';
import { BBCSDonorType } from '../enum/bbcs-donor-type.enum';

export class CreateDonorsDto {
  @IsOptional()
  @IsInt({ message: 'External Id must be a number' })
  @ApiProperty()
  external_id: number;

  @IsOptional()
  @IsInt({ message: 'Donor number must be a number' })
  @ApiProperty()
  donor_number: number;

  @IsOptional()
  @IsInt({ message: 'Prefix Id must be a number' })
  @ApiProperty()
  prefix_id: number;

  @IsOptional()
  @IsInt({ message: 'Suffix Id must be a number' })
  @ApiProperty()
  suffix_id: number;

  @IsNotEmpty({ message: 'First Name is required' })
  @IsString({ message: 'Fist Name must be a string' })
  @ApiProperty()
  first_name: string;

  @IsNotEmpty({ message: 'Last Name is required' })
  @IsString({ message: 'Last Name must be a string' })
  @ApiProperty()
  last_name: string;

  @IsNotEmpty({ message: 'State BBCS is required' })
  @IsString({ message: 'State BBCS must be a string' })
  @ApiProperty()
  state_bbcs: string;

  @IsOptional()
  @IsString({ message: 'Suffix Label must be a string' })
  @ApiProperty()
  suffix_label: string;

  @IsNotEmpty({ message: 'Date of Birth is required' })
  @IsString({ message: 'Date of Birth must be a Date' })
  @ApiProperty()
  birth_date: Date;

  @IsOptional()
  @IsString({ message: 'Nick Name must be a string' })
  @ApiProperty()
  nick_name: string;

  @IsOptional()
  @IsString({ message: 'UUID must be a string' })
  @ApiProperty()
  uuid?: string;

  @IsOptional()
  @IsInt({ message: 'Blood Type Id must be a number' })
  @ApiProperty()
  blood_group_id: number;

  @IsOptional()
  @IsInt({ message: 'Race Id must be a number' })
  @ApiProperty()
  race_id: number;

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

  @IsEnum(BBCSDonorType)
  @IsOptional()
  @ApiProperty()
  bbcs_type!: BBCSDonorType | null;
}
export class FindDonorBBCSDto {
  @IsNotEmpty({ message: 'First Name is required' })
  @IsString({ message: 'Fist Name must be a string' })
  @ApiProperty()
  first_name: string;

  @IsNotEmpty({ message: 'Last Name is required' })
  @IsString({ message: 'Last Name must be a string' })
  @ApiProperty()
  last_name: string;

  @IsString({ message: 'Email must be a string' })
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'Date of Birth is required' })
  @IsString({ message: 'Date of Birth must be string' })
  @ApiProperty()
  birth_date: string;
}
export class UpdateDonorsDto extends PartialType(CreateDonorsDto) {}
