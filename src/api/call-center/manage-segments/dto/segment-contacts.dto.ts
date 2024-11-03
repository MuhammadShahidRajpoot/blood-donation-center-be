import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsBoolean,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateSegmentsContactsDto {
  @ApiProperty({ uniqueItems: true })
  @IsInt({ message: 'ds_segment_id must be an integer' })
  @IsNotEmpty({ message: 'ds_segment_id is required' })
  ds_segment_id: bigint;

  @ApiProperty({ uniqueItems: true })
  @IsInt({ message: 'contact_id must be an integer' })
  @IsNotEmpty({ message: 'contact_id is required' })
  contact_id: bigint;

  @ApiProperty()
  @IsBoolean({ message: 'is_archived must be a boolean' })
  is_archived: boolean;
}

export class UpdateSegmentsContactsDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  call_status?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  queue_time?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  call_outcome_id?: bigint;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  no_of_retry?: bigint;
}

export class UpdateCallJobsSegmentsContactsDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  call_status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  call_outcome_id?: bigint;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  no_of_retry?: bigint;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  max_call_count?: bigint;
}
