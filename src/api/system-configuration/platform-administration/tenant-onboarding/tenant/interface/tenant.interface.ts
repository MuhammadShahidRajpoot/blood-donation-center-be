import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export enum enumStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

export class GetAllTenantInterface {
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
  fetchAll: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  tenantName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string = 'ASC';
}
export class TenantConfigInterface {
  // @IsNotEmpty({ message: 'Tenant Configuration Id should not be empty' })
  // @IsInt({ message: 'Tenant Configuration Id must be an integer number' })
  // @ApiProperty()
  // tenant_configuration_id: bigint;

  @IsNotEmpty({ message: 'Element name is required' })
  @IsString({ message: 'Element name must be a string' })
  // @Matches(/^[A-Za-z\s]+$/, { message: 'Only alphabets are allowed for element name' })
  @ApiProperty()
  element_name: string;

  @Matches(
    /^(https?:\/\/)?(www\.)?((?!http|www\.)[a-zA-Z0-9-]+\.){1,2}[a-zA-Z]{2,6}(:\d{1,5})?(\/[^\s]*)?(\?.*)?$/,
    { message: 'Invalid URL format' }
  )
  @IsOptional()
  @ApiProperty()
  end_point_url: string;

  @IsOptional()
  @IsString({ message: 'Secret key must be a string' })
  @ApiProperty()
  secret_key: string;

  @IsOptional()
  @IsString({ message: 'Secret value must be a string' })
  @ApiProperty()
  secret_value: string;

  @IsNotEmpty({ message: 'Created By should not be empty' })
  @IsInt({ message: 'Created By must be an integer number' })
  @ApiProperty()
  created_by: bigint;
}

export class UpdateTenantConfigDetailInterface {
  @IsOptional({ message: 'Id should not be empty' })
  // @IsInt({ message: 'Id must be an integer number' })
  @ApiProperty()
  id: bigint;

  @IsOptional({ message: 'Element name is required' })
  @IsString({ message: 'Element name must be a string' })
  // @Matches(/^[A-Za-z\s]+$/, { message: 'Only alphabets are allowed for element name' })
  @ApiProperty()
  element_name: string;

  @Matches(
    /^(https?:\/\/)?(www\.)?((?!http|www\.)[a-zA-Z0-9-]+\.){1,2}[a-zA-Z]{2,6}(:\d{1,5})?(\/[^\s]*)?(\?.*)?$/,
    { message: 'Invalid URL format' }
  )
  @IsOptional()
  @ApiProperty()
  end_point_url: string;

  @IsOptional()
  @IsString({ message: 'Secret key must be a string' })
  @ApiProperty()
  secret_key: string;

  @IsOptional()
  @IsString({ message: 'Secret value must be a string' })
  @ApiProperty()
  secret_value: string;

  @IsOptional({ message: 'Created By should not be empty' })
  @IsInt({ message: 'Created By must be an integer number' })
  @ApiProperty()
  created_by: bigint;
}
