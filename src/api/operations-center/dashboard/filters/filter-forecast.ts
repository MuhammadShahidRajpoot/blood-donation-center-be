import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { PaginationAndSortDto } from 'src/common/dto/pagination';

export class ForecastFilter extends PaginationAndSortDto {
  @IsOptional()
  @ApiProperty({ required: false })
  cushion?: any;

  @IsOptional()
  @ApiProperty({ required: false })
  procedure?: any;

  @IsOptional()
  @ApiProperty({ required: false })
  view?: any;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false })
  current_date?: Date;
}
