import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SortDto } from 'src/common/dto/sort';
export class PromotionsFilter extends SortDto {
  @IsOptional()
  @ApiProperty()
  duration: number;
}
