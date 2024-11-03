import { IsInt, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DialingCenterCallJobDto {
  @ApiProperty()
  @IsNotEmpty()
  call_job_id: bigint;

  @ApiProperty()
  @IsInt()
  actual_calls = 0;

  @ApiProperty()
  @IsBoolean()
  is_start_calling = false;
}
