import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationAndSortDto } from 'src/common/dto/pagination';

export class FilterStaffSchedulesInterface extends PaginationAndSortDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  keyword?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  staff_id?: number;

  @Type(() => Number)
  @IsOptional()
  @ApiProperty({ required: false })
  team_id?: number;

  @Type(() => Number)
  @IsOptional()
  @ApiProperty({ required: false })
  collection_operation_id?: number;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false })
  schedule_start_date?: Date;

  @Type(() => Number)
  @IsOptional()
  @ApiProperty({ required: false })
  donor_id?: number;

  @Type(() => Number)
  @IsOptional()
  @ApiProperty({ required: false })
  schedule_status_id?: number;

  @Type(() => Number)
  @IsOptional()
  @ApiProperty()
  tenant_id: bigint;

  @IsOptional()
  @ApiProperty()
  operation_id?: number;

  @IsOptional()
  @ApiProperty()
  operation_type?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  is_published?: string;
}
