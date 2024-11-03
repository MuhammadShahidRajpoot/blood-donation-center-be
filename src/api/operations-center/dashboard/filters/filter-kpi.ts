import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class KeyPerformanceIndicatorsFilter {
  @IsOptional()
  @ApiProperty({ required: false })
  organizational_level?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false })
  start_date?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false })
  end_date?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  view_as?: string;

  @IsOptional()
  @ApiProperty()
  procedures: [] = [];
}
