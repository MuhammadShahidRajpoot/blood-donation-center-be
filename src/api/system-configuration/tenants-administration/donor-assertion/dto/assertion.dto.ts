import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
export class AssertionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: 'Code must not exceed 20 characters' })
  @ApiProperty()
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Description must not exceed 10 characters' })
  @ApiProperty()
  description: string;

  @IsBoolean()
  @ApiProperty()
  is_expired: boolean;

  @ApiProperty()
  created_by?: bigint;

  @ApiProperty({ uniqueItems: true })
  @IsInt()
  @IsNotEmpty()
  tenant_id: bigint;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  @IsBoolean()
  is_archived: boolean;

  @IsInt()
  @ApiProperty()
  expiration_months: number;

  @IsString({ message: 'BBCS UUID must be a string' })
  bbcs_uuid: string;

  @ApiProperty()
  is_active: boolean;
}
export class GetAllAssertionsDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  page?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    enum: [
      'name',
      'code',
      'is_active',
      'description',
      'is_expired',
      'expiration_months',
    ],
  })
  sortBy?: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string;

  @ApiProperty()
  keyword?: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: string;

  @IsString({ message: 'Status must be boolean' })
  @IsOptional()
  @ApiProperty({ required: false, enum: ['true, false'] })
  is_active: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  fetchAll?: boolean;
}
