import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetAvailableDevicesParamsDto {
  @ApiProperty()
  device_type_id: number;

  @ApiProperty()
  collection_operation_id: number;

  @ApiProperty()
  shift_id: number;

  @ApiProperty()
  operation_id: number;

  @ApiProperty()
  operation_type: string;

  @IsOptional()
  shift_start_time: string;

  @IsOptional()
  shift_end_time: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  schedule_start_date: Date;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  schedule_end_date: Date;

  @IsOptional()
  @ApiProperty()
  operationDate;

  @ApiPropertyOptional()
  @IsOptional()
  is_published?: string;
}
