import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GetMonthlyCalenderInterface {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  organizational_levels?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  operation_status_id?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  procedure_type_id?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  product_id?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  month?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  year?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  view_as?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  week_view?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  week_start_date?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  week_end_date?: number;
}
