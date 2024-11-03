import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination';

export class FilterAvailableStaff extends PaginationDto {
  @ApiProperty({ required: true })
  role_id?: number;

  @Type(() => Boolean)
  @IsOptional()
  @ApiProperty({ required: false })
  is_active?: boolean;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false })
  date?: Date;

  @IsOptional()
  @ApiProperty({ required: false })
  schedule_id?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  shift_start_time?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  shift_end_time?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  certifications?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  schedule_start_date?: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  schedule_end_date?: Date;

  @Type(() => Number)
  @IsOptional()
  @ApiProperty({ required: false })
  collection_operation_id?: number;

  @Type(() => Number)
  @IsOptional()
  @ApiProperty({ required: false })
  preference_type_enum?: number;

  @Type(() => Number)
  @IsOptional()
  @ApiProperty()
  tenant_id: bigint;
}
