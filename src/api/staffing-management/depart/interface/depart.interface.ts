import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GetAllDepartFilteredInterface {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  keyword?: string;

  @ApiPropertyOptional({ type: 'boolean' })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  fetchAll?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  downloadType?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  selectedOptions?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  tableHeaders?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  exportType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  staff_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  team_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  donor_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  collection_operation_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  schedule_start_date?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  schedule_status_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  operation_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  shift_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  operation_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  is_published?: string;

  @ApiPropertyOptional()
  @IsOptional()
  export_all_data?: string;
}
