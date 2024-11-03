import { IsInt, IsNotEmpty, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CallJobsAgentsDto {
  @ApiProperty()
  @IsNotEmpty()
  call_job_id: bigint;

  @ApiProperty()
  @IsNotEmpty()
  user_id: bigint;

  @ApiProperty()
  @IsInt()
  assigned_calls: number;

  @ApiProperty()
  @IsBoolean()
  is_archived: boolean;

  @ApiProperty()
  @IsDateString()
  date: Date;
}

export class UpdateCallJobsAgentsDto {
  @ApiProperty()
  @IsInt()
  actual_calls: number;
}
