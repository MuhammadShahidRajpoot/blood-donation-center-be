import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class GetAvailableVehiclesParamsDto {
  @ApiProperty()
  vehicle_type_id: number;

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

  @ApiProperty({ required: false }) // Make additional parameters optional
  is_active?: boolean;

  @ApiProperty({ required: false })
  date?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  is_published?: string;

  @IsOptional()
  @ApiProperty()
  operationDate;
}
