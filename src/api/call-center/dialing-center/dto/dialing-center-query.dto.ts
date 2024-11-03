import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class DialingCenterCallJobsQueryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  page?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: string;

  @IsString({ message: 'Status must be a string' })
  @IsOptional()
  @ApiProperty({ required: false })
  status = '';

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  sortBy?: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  sortOrder?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  name?: string = '';

  @ApiProperty({ required: false })
  @IsOptional()
  start_date?: string = '';

  @ApiProperty({ required: false })
  @IsOptional()
  end_date?: string = '';

  @ApiProperty({ required: false })
  @IsOptional()
  user_id?: string = '';

  @ApiProperty({ required: false })
  @IsOptional()
  call_job_id?: string = '';
}
