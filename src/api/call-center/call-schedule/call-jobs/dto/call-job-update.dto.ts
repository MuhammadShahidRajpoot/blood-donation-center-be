import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CallJobUpdateDto {
  @ApiProperty()
  @IsOptional()
  status?: string;
}
