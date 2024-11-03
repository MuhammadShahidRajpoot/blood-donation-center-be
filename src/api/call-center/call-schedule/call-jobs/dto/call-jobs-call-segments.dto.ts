import { IsInt, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CallJobsCallSegmentsDto {
  call_job_id: bigint;

  segment_id: bigint;

  segment_type: string;
}
