import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSegmentsDto {
  @ApiProperty({ uniqueItems: true })
  @IsInt({ message: 'ds_segment_id must be an integer' })
  @IsNotEmpty({ message: 'ds_segment_id is required' })
  tenant_id: bigint;

  @ApiProperty({ uniqueItems: true })
  @IsInt({ message: 'ds_segment_id must be an integer' })
  @IsNotEmpty({ message: 'ds_segment_id is required' })
  ds_segment_id: bigint;

  @ApiProperty()
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ enum: ['static', 'dynamic'], default: 'static' })
  @IsEnum(['static', 'dynamic'], { message: 'Invalid segment_type value' })
  segment_type: 'static' | 'dynamic';

  @ApiProperty()
  @IsInt({ message: 'Total members must be an integer' })
  @IsNotEmpty({ message: 'Total members is required' })
  total_members: number;

  @ApiProperty({ type: Date })
  ds_date_created: Date;

  @ApiProperty({ type: Date })
  ds_date_last_modified: Date;
}

export class GetAllSegmentsDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  page?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    enum: ['name', 'segment_type', 'total_members', 'ds_date_last_modified'],
  })
  sortBy?: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  fetchAll?: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  keyword?: string = '';

  @ApiProperty({ required: false, description: 'MM-DD-YYYY' })
  @IsString({ message: 'Invalid date format' })
  @IsOptional()
  start_date?: string;

  @ApiProperty({ required: false, description: 'MM-DD-YYYY' })
  @IsString({ message: 'Invalid date format' })
  @IsOptional()
  end_date?: string;
}

export class GetDonorsInformationDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  page?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  keyword?: string = '';
}
