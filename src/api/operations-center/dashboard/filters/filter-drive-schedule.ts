import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { PaginationAndSortDto } from 'src/common/dto/pagination';

export class DriveScheduleFilter extends PaginationAndSortDto {
  @IsNotEmpty()
  @ApiProperty({ required: true })
  organizational_level?: string;

  @IsOptional()
  @ApiProperty()
  status: [];

  @IsOptional()
  @ApiProperty({ required: false })
  duration?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  performance?: number;
}
