import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination';

export class FilterSharedStaff extends PaginationDto {
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
  @ApiProperty()
  tenant_id: bigint;

  @IsOptional()
  @ApiProperty({ required: false })
  certificates?: string;
}
