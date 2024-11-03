import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationAndSortDto } from 'src/common/dto/pagination';

export class FilterStaffSummaryInterface extends PaginationAndSortDto {
  @Type(() => Number)
  @IsOptional()
  @ApiProperty({ required: false })
  schedule_id?: number;

  @Type(() => Number)
  @IsOptional()
  @ApiProperty()
  tenant_id: bigint;

  @IsOptional()
  @ApiProperty()
  is_published: string;
}
