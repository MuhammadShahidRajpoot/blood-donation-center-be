import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationAndSortDto } from '../../../../../../common/dto/pagination';

export class QueryStaffLeaveDto extends PaginationAndSortDto {
  @ApiPropertyOptional()
  @IsString({ message: 'Keyword must be a string' })
  @IsOptional()
  keyword?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Staff is required' })
  staff_id: bigint;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  begin_date?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  end_date?: Date;

  @ApiProperty()
  //@IsNotEmpty({ message: 'Type is required' })
  type_id: bigint;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  period?: string;
}
